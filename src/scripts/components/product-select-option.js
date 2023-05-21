import { ProductOption } from "../helpers";

const ELEMENT_NAME = "product-select-option";

class ProductSelectOption extends ProductOption {
  #$select;
  constructor() {
    super(ELEMENT_NAME);
  }

  connectedCallback() {
    super.connectedCallbackStart();

    this.#$select = this.querySelector("select");
    if (!this.#$select)
      throw new Error(`[${ELEMENT_NAME}] [A select element if not found]`);

    super.connectedCallbackEnd();
    this.#internalEvents();
  }

  #internalEvents() {
    this.#$select.addEventListener("change", (e) => {
      if (this.$productSection.state) {
        this.$productSection.setOptions({
          [this.optionName]: e.currentTarget.value,
        });
      }
    });
  }

  render() {
    super.render();

    const option = this.getOptionState();
    if (option) {
      this.#$select.value = option.value || "";
      this.#$select.querySelectorAll("option").forEach(($element) => {
        this.addAvailabilityClass($element, $element.value);
      });
    }
  }
}
customElements.define(ELEMENT_NAME, ProductSelectOption);
