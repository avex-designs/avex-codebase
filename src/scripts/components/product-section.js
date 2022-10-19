const attributes = {
  json: "data-product-section-json",
};

class ProductSection extends HTMLElement {
  // if #variantId is undefined, means not all the options are selected so no specific variant is chosen
  // if null, means all the options are selected but no variant exists for the options' combination
  #variantId;

  #productData;
  #$variantInput;

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.#hydrate(true);
  }

  #hydrate(initial = false) {
    this.#udpateProductDataFromDOM();
    this.#$variantInput = this.querySelector("input[name='id']");
    if (this.#$variantInput) {
      let variantInputValue = Number(this.#$variantInput.value);
      if (variantInputValue > 0) {
        variantInputValue = undefined;
      }
      if (!initial && this.#variantId !== variantInputValue) {
        console.warn(
          `ProductSection element error: excpeted to receive "${
            this.#variantId
          }" variant, instead "${variantInputValue}" variant is received`
        );
      }
      this.#variantId = variantInputValue;
    }
  }

  #setVariantId() {}

  #udpateProductDataFromDOM() {
    const $script = this.querySelector(`[${attributes.json}]`);
    const json = JSON.parse($script.innerHTML);
    this.#productData = json;
  }
}
customElements.define("product-section", ProductSection);
