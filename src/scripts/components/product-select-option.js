import { ProductOption } from "../base-components/product-option";

const ELEMENT_NAME = "product-select-option";

class ProductSelectOption extends ProductOption {
  _$select;
  constructor() {
    super(ELEMENT_NAME);
  }

  connectedCallback() {
    super.connectedCallbackStart();

    this._$select = this.querySelector("select");
    if (!this._$select)
      throw new Error(`[${ELEMENT_NAME}] [A select element if not found]`);

    super.connectedCallbackEnd();
    this._internalEvents();
  }

  _internalEvents() {
    this._$select.addEventListener("change", (e) => {
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
      this._$select.value = option.value || "";
      this._$select.querySelectorAll("option").forEach(($element) => {
        this.addAvailabilityClass($element, $element.value);
      });
    }
  }
}
customElements.define(ELEMENT_NAME, ProductSelectOption);
