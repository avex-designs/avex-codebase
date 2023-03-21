export function findAncestor(el, sel) {
  while (
    (el = el.parentElement) &&
    !(el.matches || el.matchesSelector).call(el, sel)
  );
  return el;
}

export const isInViewport = (elem) => {
  const bounding = elem && elem.getBoundingClientRect();
  return bounding && bounding.top < window.innerHeight && bounding.bottom >= 0;
};

export function serializeForm(form) {
  let obj = {};
  let formData = new FormData(form);

  for (let key of formData.keys()) {
    obj[key] = formData.get(key);
  }

  return obj;
}

export function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

export function parseTag(url) {
  const regex = /[^/]+$/;
  return url.match(regex)[0];
}

export function getCollectionUrl(url) {
  const regex = /\/\S+\//;
  return url.match(regex)[0];
}

export async function loadJS(FILE_URL, cb) {
  let $script = document.createElement("script");

  $script.setAttribute("src", FILE_URL);
  $script.setAttribute("type", "text/javascript");

  document.body.appendChild($script);

  cb && cb($script);
  return new Promise((resolve, reject) => {
    $script.addEventListener("load", () => {
      resolve(true);
    });
    $script.addEventListener("error", () => {
      reject(false);
    });
  });
}
