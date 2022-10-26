const attributes = {
  availabilityStatus: "data-product-option-availability",
};

const availabilityStatuses = {
  UNDEFINED: "undefined",
  AVAILABLE: "available",
  NOT_AVAILABLE: "not-available",
  DOES_NOT_EXIST: "does-not-exist",
};

class ProductOption extends HTMLElement {
  #$productSection;
  #optionName;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#optionName = this.dataset.productOptionName;
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

        let status = availabilityStatuses.UNDEFINED;
        if (availability) {
          if (!($input.value in availability))
            status = availabilityStatuses.DOES_NOT_EXIST;
          else if (availability[$input.value])
            status = availabilityStatuses.AVAILABLE;
          else status = availabilityStatuses.NOT_AVAILABLE;
        }
        $input.setAttribute(attributes.availabilityStatus, status);
      });
    }
  }
}
customElements.define("product-option", ProductOption);
