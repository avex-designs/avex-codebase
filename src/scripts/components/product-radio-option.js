import { ProductOption } from "../helpers";

const ELEMENT_NAME = "product-radio-option";

class ProductRadioOption extends ProductOption {
  constructor() {
    super(ELEMENT_NAME);
  }

  connectedCallback() {
    super.connectedCallbackStart();
    // your init code here
    super.connectedCallbackEnd();
    this.#internalEvents();
  }

  #internalEvents() {
    this.querySelectorAll("input[type='radio']").forEach(($input) => {
      $input.addEventListener("change", (e) => {
        if (this.$productSection.state) {
          this.$productSection.setOptions({
            [this.optionName]: e.currentTarget.value,
          });
        }
      });
    });
  }

  render() {
    super.render();

    const option = this.getOptionState();
    if (option) {
      this.querySelectorAll("input[type='radio']").forEach(($element) => {
        $element.checked = $element.value === option.value;
        this.addAvailabilityClass($element, $element.value);
      });
    }
  }
}
customElements.define(ELEMENT_NAME, ProductRadioOption);
