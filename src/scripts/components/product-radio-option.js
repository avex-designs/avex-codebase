const attributes = {
  name: "data-product-radio-option-name",
  availabilityStatus: "data-product-radio-option-availability",
};

const availabilityStatuses = {
  undefined: "undefined",
  available: "available",
  not_available: "not-available",
  does_not_exist: "does-not-exist",
};

class ProductRadioOption extends HTMLElement {
  #$productSection;
  #optionName;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#optionName = this.getAttribute(attributes.name);
    if (this.#optionName === undefined || this.#optionName === "")
      throw new Error("Product option name is not set");

    this.#$productSection = this.closest("product-section");
    if (!this.#$productSection)
      throw new Error("A related product-section element is not found");

    this.#$productSection.addEventListener("statechange", () => {
      this.#render();
    });
    if (this.#$productSection.state) this.#render();

    this.#internalEvents();
  }

  #internalEvents() {
    this.querySelectorAll("input[type='radio']").forEach(($input) => {
      $input.addEventListener("change", (e) => {
        if (this.#$productSection.state) {
          this.#$productSection.setOptions({
            [this.#optionName]: e.currentTarget.value,
          });
        }
      });
    });
  }

  #render() {
    const state = this.#$productSection.state;
    const option = state.optionsValues.find(
      (option) => option.name === this.#optionName
    );
    const availability = state.optionsAvailability[this.#optionName];
    if (option) {
      const value = option.value;
      this.querySelectorAll("input[type='radio']").forEach(($input) => {
        if ($input.value === value) {
          $input.checked = true;
        } else {
          $input.checked = false;
        }

        let status = availabilityStatuses.undefined;
        if (availability) {
          if (!($input.value in availability))
            status = availabilityStatuses.does_not_exist;
          else if (availability[$input.value])
            status = availabilityStatuses.available;
          else status = availabilityStatuses.not_available;
        }
        $input.setAttribute(attributes.availabilityStatus, status);
      });
    }
  }
}
customElements.define("product-radio-option", ProductRadioOption);
