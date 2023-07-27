const fs = require("fs");
const fsAsync = require("fs/promises");
const path = require("path")

const COMPONENTS_PATH = path.join(__dirname, "/src/scripts/components");
const SNIPPETS_PATH = path.join(__dirname, "/snippets");
const FILE_PATH = path.join(SNIPPETS_PATH, "/component-loader.liquid")
const mode = process.env.NODE_ENV || "development";

populateComponents();
mode === "development" && watch();

function watch() {
  fs.watch(COMPONENTS_PATH, async (eventType, filename) => {
    if (eventType === "rename") {
      await populateComponents();
    }
  });
}

async function populateComponents() {
  const files = await getComponents();
  const components = {};

  files.forEach((file) => {
    components[file] = getAssetUrl(file);
  });

  await writeSnippet(components);

  return components;
}

async function getComponents() {
  const files = await fsAsync.readdir(COMPONENTS_PATH);
  return files.filter(file => file.includes("js")).map((file) => file.replace(".js", ""));
}

function getAssetUrl(name) {
  return `{{ 'js-component-${name}.min.js' | asset_url }}`;
}

async function writeSnippet(components) {
  let content = await (await fsAsync.readFile(FILE_PATH, "utf8")).toString();
  
  const file = `window.components = ${JSON.stringify(components, null, 2)}`;
  const newContent = content.replace(new RegExp(/<script\b[^>]*>([\s\S]*?)<\/script>/), `<script>\n\t${file}\n</script>`)
  if (newContent === content) {
    console.log("NO CHANGES")
    return;
  }
  fs.writeFile(FILE_PATH, newContent, (err) => {
    if (err) console.log(err);
    else console.log("Components list is generated!");
  });
}
