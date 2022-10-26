const attributes = {
  json: "data-product-section-json",
};
const Events = {
  STATECHANGE: "statechange",
};
const elementName = "product-section";

class ProductSection extends HTMLElement {
  // if #variantId is undefinded, means the element is not initialized
  // if #variantId is 0, means not all the options are selected so no specific variant is chosen
  // if #variantId is null, means all the options are selected but no variant exists for the options' combination
  #variantId;

  #data;

  // The #optionsValues keeps the state of options' values, where the index is the option's index.
  // [
  //   0 => {
  //      name: 'Size',
  //      value: 'Medium'
  //   }
  // ]
  #optionsValues = [];

  // The #optionsHierarchy keeps the info which option is considered as the first option, which is the second etc.
  // The index of this array is hierarchy number, the value -- is the index of a related option:
  // [
  //   0 => 1,
  //   1 => 2,
  //   2 => 0
  // ]
  // The example above means the option with the index 1 is considered as the first option,
  // the option with the index 2 is the second option,
  // the option with the index 0 is the third option.
  //
  // 99.9% the hierarchy will match the options order:
  // [
  //   0 => 0,
  //   1 => 1,
  //   2 => 2
  // ]
  #optionsHierarchy = [];

  // {
  //   'Size': {
  //     'Medium': true,
  //     'Large': false
  //   },
  //   'Color': {
  //     'Red': true,
  //     'Blue': true
  //   }
  // }
  #optionsAvailability = {};

  // List of form inputs that send variant ID to the server
  #$$variantInputs;
  #$$addToCartButtons;

  #isHydration = false;

  #renderPromise = undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener(Events.STATECHANGE, this.#render.bind(this));
    this.#hydrate();
  }

  #hydrate() {
    this.#isHydration = true;

    try {
      const $jsonScript = this.querySelector(`[${attributes.json}]`);
      if (!$jsonScript)
        throw new Error(
          `The mandatory ${attributes.json} element is not found`
        );
      this.#data = JSON.parse($jsonScript.innerHTML);

      // set the #optionsHierarchy to match the options order
      this.#optionsHierarchy = this.#data.product.options.map(
        (option, index) => index
      );

      if (
        !("requestURL" in this.#data.section) ||
        !("sectionId" in this.#data.section)
      )
        throw new Error(`Wrong ${attributes.json} data structure`);

      this.#$$variantInputs = this.querySelectorAll("input[name='id']");

      this.#$$addToCartButtons = this.querySelectorAll("[name='add']");

      this.setVariantId(this.#data.section.variantId || 0);
    } catch (e) {
      this.#isHydration = false;
      throw e;
    }

    this.#isHydration = false;
  }

  /**
   * Accepts variant ID as a number.
   * If it is not a number, variant ID will be considered as 0
   */
  setVariantId(variantId) {
    let optionsValues;

    if (variantId > 0) {
      const variant = this.#data.product.variants.find(
        (variant) => variant.id === variantId
      );
      if (!variant)
        throw new Error(
          `The variant "${variantId}" is not found in the product data object`
        );

      optionsValues = this.#data.product.options.map((name, index) => {
        return {
          name,
          value: variant.options[index],
        };
      });

      return this.#changeState({ variantId, optionsValues });
    }

    return this.#changeState({
      variantId: 0,
      optionsValues: this.#data.product.options.map((name) => {
        return {
          name,
          value: null,
        };
      }),
    });
  }

  /**
   * Accepts an object where the keys are option names that should be changed
   * and the values are new option values:
   * {
   *    color: 'Red'
   * }
   */
  setOptions(changedOptions) {
    let areAllSelected = true;

    const optionsValues = this.#optionsValues.map(({ name, value }) => {
      let newValue = name in changedOptions ? changedOptions[name] : value;
      if (newValue === null || newValue === undefined || newValue === "") {
        newValue = null;
        areAllSelected = false;
      }
      return {
        name,
        value: newValue,
      };
    });

    if (!areAllSelected)
      return this.#changeState({ variantId: 0, optionsValues });

    const variant = this.#data.product.variants.find((variant) => {
      for (let i = 0; i < optionsValues.length; i++) {
        if (optionsValues[i].value !== variant.options[i]) {
          return false;
        }
      }
      return true;
    });

    const variantId = variant ? variant.id : null;
    return this.#changeState({ variantId, optionsValues });
  }

  #changeState({ variantId, optionsValues }) {
    const isVariantChanged = variantId !== this.#variantId;
    const areOptionsChanged = optionsValues.reduce((acc, el, index) => {
      return (
        acc ||
        el.name !== this.#optionsValues[index]?.name ||
        el.value !== this.#optionsValues[index]?.value
      );
    }, false);

    this.#variantId = variantId;
    this.#optionsValues = optionsValues;

    const isAvailabilityChanged =
      areOptionsChanged || this.#isHydration
        ? this.#updateAvailability()
        : false;

    if (isVariantChanged || areOptionsChanged || isAvailabilityChanged) {
      this.dispatchEvent(
        new CustomEvent(Events.STATECHANGE, {
          detail: {
            isVariantChanged,
          },
        })
      );
    }
  }

  async #render(event) {
    this.#renderPromise = undefined;
    this.#$$variantInputs.forEach(($input) => {
      $input.value = this.#variantId || "";
      $input.setAttribute("value", this.#variantId || "");
    });

    if (!event.detail.isVariantChanged || this.#isHydration) return;

    if (this.#variantId === null) return;

    if (this.#data.section.updateURL) {
      window.history.replaceState(
        {},
        "",
        `${this.#data.section.requestURL}${
          this.#variantId > 0 ? `?variant=${this.#variantId}` : ""
        }`
      );
    }

    const url = `${this.#data.section.requestURL}?${
      this.#variantId > 0 ? `variant=${this.#variantId}&` : ""
    }section_id=${this.#data.section.sectionId}`;
    const renderPromise = (this.#renderPromise = fetch(url));
    try {
      const response = await renderPromise;
      if (renderPromise !== this.#renderPromise) return;

      if (!response.ok)
        throw new Error(`Response error from the "${response.url}" URL`);

      const html = await response.text();
      this.#changeHTML(html);
      this.#hydrate();
    } catch (error) {
      if (renderPromise === this.#renderPromise) {
        this.#hydrate(); // revert state back -- load data from the current HTML
      }
      throw error;
    }
  }

  #changeHTML(html) {
    const newdocument = new DOMParser().parseFromString(html, "text/html");
    const $newElement = newdocument.querySelector(elementName);
    if (!$newElement)
      throw new Error(`The "${elementName} element is not found`);
    this.innerHTML = $newElement.innerHTML;
  }

  #updateAvailability() {
    const newAvailability = {};

    this.#data.product.variants.forEach((variant) => {
      for (let i = 0; i < this.#optionsHierarchy.length; i++) {
        const optionIndex = this.#optionsHierarchy[i];
        const optionName = this.#data.product.options[optionIndex];
        const variantOptionValue = variant.options[optionIndex];

        if (!(optionName in newAvailability)) {
          newAvailability[optionName] = {};
        }
        const valuesAvailability = newAvailability[optionName];

        // if valuesAvailability[variantOptionValue] is false or doesn't exist (undefined)
        if (!valuesAvailability[variantOptionValue]) {
          valuesAvailability[variantOptionValue] = variant.available;
        }

        if (
          variant.options[optionIndex] !==
          this.#optionsValues[optionIndex].value
        ) {
          break;
        }
      }
    });

    const prevAvailability = this.#optionsAvailability;
    this.#optionsAvailability = newAvailability;

    const newAvailabilityKeys = Object.keys(newAvailability);
    if (newAvailabilityKeys.length !== Object.keys(prevAvailability).length)
      return true;

    for (let i = 0; i < newAvailabilityKeys.length; i++) {
      const optionProp = newAvailabilityKeys[i];
      if (!(optionProp in prevAvailability)) return true;

      const newValuesKeys = Object.keys(newAvailability[optionProp]);
      if (
        newValuesKeys.length !==
        Object.keys(prevAvailability[optionProp]).length
      )
        return true;

      for (let j = 0; j < newValuesKeys.length; j++) {
        const valueProp = newValuesKeys[j];
        if (
          newAvailability[optionProp][valueProp] !==
          prevAvailability[optionProp][valueProp]
        )
          return true;
      }
    }

    return false;
  }

  get state() {
    return {
      variantId: this.#variantId,
      optionsValues: this.#optionsValues,
      optionsAvailability: this.#optionsAvailability,
    };
  }
}
customElements.define(elementName, ProductSection);
