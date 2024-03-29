/**
 * Usage:
 * 1. Sample html structure (real example shown on main-addresses.liquid):
 * <country-province-selector>
 *  <select name="address[country]" data-default="{{ form.country }}" data-form-id="{{ form.id }}" autocomplete="country">
 *   {{- all_country_option_tags -}}
 *  </select>
 *  <div data-province-container>
 *    <select name="address[province]" data-default="{{ form.province }}" autocomplete="address-level1"></select>
 *  </div>
 * </country-province-selector>
 *
 *
 * Actions:
 * 1. For new address form it will show the countries and province select will be added based on selection.
 * 2. For existing addresses it will preselect country and province.
 *
 */
class CountryProvinceSelector extends HTMLElement {
  constructor() {
    super();
    this.$countrySelector = this.querySelector("select[name*='country']");
    this.$provinceSelector = this.querySelector("select[name*='province']");
    this.$provinceContainer = this.querySelector("[data-province-container]");

    this.selectedCountry = this.$countrySelector.getAttribute("data-default");
    this.selectedProvince = this.$provinceSelector.getAttribute("data-default");

    if (!this.selectedProvince || this.selectedProvince === "") {
      this.$provinceContainer.style.display = "none";
    }
    this.setDefaultSelected(this.$countrySelector, this.selectedCountry);
    this.generateProvinces(
      this.$countrySelector,
      this.$provinceSelector,
      this.$provinceContainer
    );
    this.setDefaultSelected(this.$provinceSelector, this.selectedProvince);
  }
  connectedCallback() {
    this.$countrySelector.addEventListener("change", () => {
      this.generateProvinces(
        this.$countrySelector,
        this.$provinceSelector,
        this.$provinceContainer
      );
    });
  }

  clearOptions(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }

  setOptions(selector, options) {
    for (let i = 0; i < options.length; i++) {
      const new_option = document.createElement("option");
      new_option.value = options[i][0];
      new_option.innerHTML = options[i][1];
      selector.appendChild(new_option);
    }
  }

  setDefaultSelected(selector, value) {
    if (value && value !== "" && selector) {
      selector.value = value;
    }
  }

  generateProvinces($countrySelector, $provinceSelector, $provinceContainer) {
    const selectedOption =
      $countrySelector.options[$countrySelector.selectedIndex];
    const rawProvinces = selectedOption.getAttribute("data-provinces");
    const parsedProvinces = JSON.parse(rawProvinces);

    this.clearOptions($provinceSelector);

    if (!parsedProvinces?.length) {
      $provinceContainer.style.display = "none";
    } else {
      this.setOptions($provinceSelector, parsedProvinces);
      $provinceContainer.style.display = "";
    }
  }
}
customElements.define("country-province-selector", CountryProvinceSelector);
