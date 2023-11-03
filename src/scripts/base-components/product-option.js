export class ProductOption extends HTMLElement {
  _elementName;
  _valueLabelPlaceholder = "[[value]]";
  _availabilityStatuses = {
    undefined: "undefined",
    available: "available",
    not_available: "not-available",
    does_not_exist: "does-not-exist",
  };
  _classPrefix = "js-product-option-";

  dataAttributes = {};
  optionName;
  $productSection;

  constructor(elementName) {
    super();
    this._elementName = elementName;
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
        `[${this._elementName}] [Product option name is not set]`
      );

    this.$productSection = this.closest("product-section");
    if (!this.$productSection)
      throw new Error(
        `[${this._elementName}] [A related product-section element is not found]`
      );

    this._classPrefix =
      this.getAttribute(this.dataAttributes.classPrefix) || this._classPrefix;
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

  _getValueAvailability(value) {
    const availability =
      this.$productSection.state.optionsAvailability[this.optionName];
    let status = this._availabilityStatuses.undefined;
    if (availability) {
      if (!(value in availability))
        status = this._availabilityStatuses.does_not_exist;
      else if (availability[value])
        status = this._availabilityStatuses.available;
      else status = this._availabilityStatuses.not_available;
    }
    return status;
  }

  addAvailabilityClass($element, value) {
    $element.classList.remove(
      ...Object.values(this._availabilityStatuses).map(
        (status) => this._classPrefix + status
      )
    );
    $element.classList.add(
      this._classPrefix + this._getValueAvailability(value)
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
            this._valueLabelPlaceholder;
          $element.innerHTML = template.replaceAll(
            this._valueLabelPlaceholder,
            value
          );
        }
      );
    }
  }
}
