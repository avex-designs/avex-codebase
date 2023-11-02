import { toggleClassFromAttribute } from "../helpers";

const ELEMENT_NAME = "product-section";
const attributes = {
  json: `data-${ELEMENT_NAME}-json`,
  area: `data-${ELEMENT_NAME}-area`,
  doesNotExistText: `data-${ELEMENT_NAME}-doesnotexist`,
  loadingClass: `data-${ELEMENT_NAME}-loading-class`,
  errorMessage: `data-${ELEMENT_NAME}-error`,
};
const Events = {
  STATECHANGE: "statechange",
};

class ProductSection extends HTMLElement {
  // if _variantId is undefinded, means the element is not initialized
  // if _variantId is 0, means not all the options are selected so no specific variant is chosen
  // if _variantId is null, means all the options are selected but no variant exists for the options' combination
  _variantId;

  _data;

  // The _optionsValues keeps the state of options' values, where the index is the option's index.
  // [
  //   0 => {
  //      name: 'Size',
  //      value: 'Medium'
  //   }
  // ]
  _optionsValues = [];

  // The _optionsHierarchy keeps the info which option is considered as the first option, which is the second etc.
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
  _optionsHierarchy = [];

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
  _optionsAvailability = {};

  // List of form inputs that send variant ID to the server
  _$variantInputs;
  _$addToCartButtons;

  _isHydration = false;

  // to abort previous Section API fetch requests
  _abortController;

  // keeps the latest HTML of the component to get back to it if a fetch error occurs
  _latestHTML;

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener(Events.STATECHANGE, this._render.bind(this));
    this._latestHTML = `<div>${this.outerHTML}</div>`;
    this._hydrate();
    this._adjustRequestURL();
  }

  _adjustRequestURL() {
    if (this._data.section.requestURL !== "/products_preview") return;

    this.previewKey = new URLSearchParams(window.location.search).get(
      "preview_key"
    );
  }

  _getURL(isReplaceUrl = false) {
    const urlArr = this._data.section.requestURL.split("?");
    const searchParams = new URLSearchParams(urlArr[1]);

    if (this._variantId > 0) searchParams.set("variant", this._variantId);
    if (!isReplaceUrl)
      searchParams.set("section_id", this._data.section.sectionId);
    if (this.previewKey) searchParams.set("preview_key", this.previewKey);

    return `${urlArr[0]}?${searchParams.toString()}`;
  }

  _hydrate() {
    this._isHydration = true;

    try {
      const $jsonScript = this.querySelector(`[${attributes.json}]`);
      if (!$jsonScript)
        throw new Error(
          `[${ELEMENT_NAME}] [The mandatory ${attributes.json} element is not found]`
        );
      this._data = JSON.parse($jsonScript.innerHTML);

      // set the _optionsHierarchy to match the options order
      this._optionsHierarchy = this._data.product.options.map(
        (option, index) => index
      );

      if (
        !("requestURL" in this._data.section) ||
        !("sectionId" in this._data.section)
      )
        throw new Error(
          `[${ELEMENT_NAME}] [Wrong ${attributes.json} data structure]`
        );

      this._$variantInputs = this.querySelectorAll("input[name='id']");

      this._$addToCartButtons = this.querySelectorAll("[name='add']");

      this.setVariantId(this._data.section.variantId || 0);
    } catch (e) {
      this._isHydration = false;
      throw e;
    }

    this._isHydration = false;
  }

  /**
   * Accepts variant ID as a number.
   * If it is not a number, variant ID will be considered as 0
   */
  setVariantId(variantId) {
    let optionsValues;

    if (variantId > 0) {
      const variant = this._data.product.variants.find(
        (variant) => variant.id === variantId
      );
      if (!variant)
        throw new Error(
          `[${ELEMENT_NAME}] [The variant "${variantId}" is not found in the product data object]`
        );

      optionsValues = this._data.product.options.map((name, index) => {
        return {
          name,
          value: variant.options[index],
        };
      });

      return this._changeState({ variantId, optionsValues });
    }

    return this._changeState({
      variantId: 0,
      optionsValues: this._data.product.options.map((name) => {
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

    const optionsValues = this._optionsValues.map(({ name, value }) => {
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
      return this._changeState({ variantId: 0, optionsValues });

    const variant = this._data.product.variants.find((variant) => {
      for (let i = 0; i < optionsValues.length; i++) {
        if (optionsValues[i].value !== variant.options[i]) {
          return false;
        }
      }
      return true;
    });

    const variantId = variant ? variant.id : null;
    return this._changeState({ variantId, optionsValues });
  }

  _changeState({ variantId, optionsValues }) {
    const isVariantChanged = variantId !== this._variantId;
    const areOptionsChanged = optionsValues.reduce((acc, el, index) => {
      return (
        acc ||
        el.name !== this._optionsValues[index]?.name ||
        el.value !== this._optionsValues[index]?.value
      );
    }, false);

    this._variantId = variantId;
    this._optionsValues = optionsValues;

    const isAvailabilityChanged =
      areOptionsChanged || this._isHydration
        ? this._updateAvailability()
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

  async _render(event) {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = undefined;
    }

    this._$variantInputs.forEach(($input) => {
      $input.value = this._variantId || "";
      $input.setAttribute("value", this._variantId || "");
    });

    this._toggleLoadingClasses(false);
    this._showErrorMessages(false);

    if (!event.detail.isVariantChanged || this._isHydration) return;

    if (this._variantId === null) {
      this._$addToCartButtons.forEach(($button) => {
        $button.disabled = true;
      });
      this.querySelectorAll(`[${attributes.doesNotExistText}]`).forEach(
        ($element) => {
          const text = $element.getAttribute(attributes.doesNotExistText);
          if (text) {
            $element.textContent = text;
          }
        }
      );
      return;
    }

    if (this._data.section.updateURL)
      window.history.replaceState({}, "", this._getURL(true));

    this._abortController = new AbortController();

    this._$addToCartButtons.forEach(($button) => {
      $button.disabled = true;
    });

    this._toggleLoadingClasses(true);

    try {
      const response = await fetch(this._getURL(), {
        signal: this._abortController.signal,
      });
      if (!response.ok)
        throw new Error(
          `[${ELEMENT_NAME}] [Response error from the "${response.url}" URL]`
        );

      const html = await response.text();
      this._changeHTML(html);
      this._toggleLoadingClasses(false);
    } catch (error) {
      if (error.name !== "AbortError") {
        this._changeHTML(this._latestHTML);
        this._toggleLoadingClasses(false);
        this._showErrorMessages(true);
        throw error;
      }
    }
  }

  _toggleLoadingClasses(on) {
    toggleClassFromAttribute(this, attributes.loadingClass, on);
  }

  _showErrorMessages(show) {
    this.querySelectorAll(`[${attributes.errorMessage}]`).forEach(
      ($element) => {
        $element.hidden = !show;
      }
    );
  }

  _changeHTML(html) {
    const newDocument = new DOMParser().parseFromString(html, "text/html");
    const $newElement = newDocument.querySelector(
      `${ELEMENT_NAME}${this.id ? "#" + this.id : ""}`
    );
    if (!$newElement)
      throw new Error(
        `[${ELEMENT_NAME}] [The "${ELEMENT_NAME}" element is not found]`
      );
    this._latestHTML = html;

    this.querySelector(`[${attributes.json}]`).innerHTML =
      $newElement.querySelector(`[${attributes.json}]`).innerHTML;

    const $curAreas = Array.from(this.querySelectorAll(`[${attributes.area}]`));
    const $newAreas = Array.from(
      $newElement.querySelectorAll(`[${attributes.area}]`)
    );

    let hasShopifyPaymentButton = false;
    if ($curAreas.length !== $newAreas.length) {
      console.warn(
        `[${ELEMENT_NAME}] [Previous "${attributes.area}" elements don't match the new received ones. The HTML of the component will be replaced completely.]`
      );
      this.innerHTML = $newElement.innerHTML;
      if ($newElement.querySelector("[data-shopify='payment-button']"))
        hasShopifyPaymentButton = true;
    } else {
      $curAreas.forEach(($curArea, areaIndex) => {
        const $newArea = $newAreas[areaIndex];
        let replacingString = "innerHTML";
        if ($newArea.getAttribute(attributes.area)) {
          replacingString = $newArea.getAttribute(attributes.area);
        }
        replacingString.split(",").forEach((replacingValue) => {
          replacingValue = replacingValue.trim();
          if (replacingValue === "innerHTML") {
            $curArea.innerHTML = $newArea.innerHTML;
            if ($newArea.querySelector("[data-shopify='payment-button']"))
              hasShopifyPaymentButton = true;
            return;
          }
          if (!$newArea.hasAttribute(replacingValue)) {
            $curArea.removeAttribute(replacingValue);
            return;
          }
          $curArea.setAttribute(
            replacingValue,
            $newArea.getAttribute(replacingValue)
          );
        });
      });
    }
    if (hasShopifyPaymentButton) window.Shopify?.PaymentButton?.init();
    this._hydrate();
  }

  _updateAvailability() {
    const newAvailability = {};

    this._data.product.variants.forEach((variant) => {
      for (let i = 0; i < this._optionsHierarchy.length; i++) {
        const optionIndex = this._optionsHierarchy[i];
        const optionName = this._data.product.options[optionIndex];
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
          this._optionsValues[optionIndex].value
        ) {
          break;
        }
      }
    });

    const prevAvailability = this._optionsAvailability;
    this._optionsAvailability = newAvailability;

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
      variantId: this._variantId,
      optionsValues: this._optionsValues,
      optionsAvailability: this._optionsAvailability,
    };
  }
}
customElements.define(ELEMENT_NAME, ProductSection);
