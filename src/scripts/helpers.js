export const getShopifySection = ($element) => {
  const sectionPrefix = "shopify-section-";
  const $section = $element.closest(`[id^="${sectionPrefix}"]`);
  if (!$section) return [null, null];
  const sectionId = $section.id.replace(sectionPrefix, "");
  return [sectionId, $section];
};

export const toggleClassFromAttribute = ($context, attributeName, on) => {
  $context.querySelectorAll(`[${attributeName}]`).forEach(($element) => {
    const className = $element.getAttribute(attributeName);
    if (className) {
      if (on) $element.classList.add(className);
      else $element.classList.remove(className);
    }
  });
};

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
