const fs = require("fs");
const fsAsync = require("fs/promises");

const COMPONENTS_PATH = __dirname + "/src/scripts/components";
const SNIPPETS_PATH = __dirname + "/snippets";
const FILE_PATH = `${SNIPPETS_PATH}/component-loader.liquid`;
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
  content = content.replace(new RegExp(/<script>(.|\n)*?<\/script>/), `<script>\n\t${file}\n</script>`)
  fs.writeFile(FILE_PATH, content, (err) => {
    if (err) console.log(err);
    else console.log("Components list is generated!");
  });
}
