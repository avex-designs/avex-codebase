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

export class ProductOption extends HTMLElement {
  #elementName;
  #valueLabelPlaceholder = "[[value]]";
  #availabilityStatuses = {
    undefined: "undefined",
    available: "available",
    not_available: "not-available",
    does_not_exist: "does-not-exist",
  };
  #classPrefix = "js-product-option-";

  dataAttributes = {};
  optionName;
  $productSection;

  constructor(elementName) {
    super();
    this.#elementName = elementName;
    this.dataAttributes = {
      name: `data-${elementName}-name`,
      valueLabel: `data-${elementName}-value`,
      classPrefix: `data-${elementName}-class-prefix`,
    };
  }

  connectedCallbackStart() {
    this.optionName = this.getAttribute(this.dataAttributes.name);
    if (this.optionName === undefined || this.optionName === "")
      throw new Error(
        `[${this.#elementName}] [Product option name is not set]`
      );

    this.$productSection = this.closest("product-section");
    if (!this.$productSection)
      throw new Error(
        `[${
          this.#elementName
        }] [A related product-section element is not found]`
      );

    this.#classPrefix =
      this.getAttribute(this.dataAttributes.classPrefix) || this.#classPrefix;
  }

  connectedCallbackEnd() {
    this.$productSection.addEventListener("statechange", () => {
      this.render();
    });
    if (this.$productSection.state) this.render();
  }

  getOptionState() {
    return this.$productSection.state.optionsValues.find(
      (option) => option.name === this.optionName
    );
  }

  #getValueAvailability(value) {
    const availability =
      this.$productSection.state.optionsAvailability[this.optionName];
    let status = this.#availabilityStatuses.undefined;
    if (availability) {
      if (!(value in availability))
        status = this.#availabilityStatuses.does_not_exist;
      else if (availability[value])
        status = this.#availabilityStatuses.available;
      else status = this.#availabilityStatuses.not_available;
    }
    return status;
  }

  addAvailabilityClass($element, value) {
    $element.classList.remove(
      ...Object.values(this.#availabilityStatuses).map(
        (status) => this.#classPrefix + status
      )
    );
    $element.classList.add(
      this.#classPrefix + this.#getValueAvailability(value)
    );
  }

  render() {
    const option = this.getOptionState();
    if (option) {
      const value = option.value;
      this.querySelectorAll(`[${this.dataAttributes.valueLabel}]`).forEach(
        ($element) => {
          if (!value) {
            $element.innerHTML = "";
            return;
          }
          const template =
            $element.getAttribute(this.dataAttributes.valueLabel) ||
            this.#valueLabelPlaceholder;
          $element.innerHTML = template.replaceAll(
            this.#valueLabelPlaceholder,
            value
          );
        }
      );
    }
  }
}
