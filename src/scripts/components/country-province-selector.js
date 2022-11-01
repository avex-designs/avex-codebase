class CountryProvinceSelector extends HTMLElement {
  constructor() {
    super();
    this.country_selector = this.querySelector("select[name*='country']");
    this.province_selector = this.querySelector("select[name*='province']");
    this.province_container = this.querySelector("[data-province-container]");

    this.selected_country = this.country_selector.getAttribute("data-default");
    this.selected_province =
      this.province_selector.getAttribute("data-default");

    if (!this.selected_province || this.selected_province === "") {
      this.province_container.style.display = "none";
    }
    this.setDefaultSelected(this.country_selector, this.selected_country);
    this.generateProvinces(
      this.country_selector,
      this.province_selector,
      this.province_container
    );
    this.setDefaultSelected(this.province_selector, this.selected_province);
  }
  connectedCallback() {
    this.country_selector.addEventListener("change", () => {
      this.generateProvinces(
        this.country_selector,
        this.province_selector,
        this.province_container
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

  generateProvinces(country_selector, province_selector, province_container) {
    const selected_option =
      country_selector.options[country_selector.selectedIndex];
    const raw_provinces = selected_option.getAttribute("data-provinces");
    const parsed_provinces = JSON.parse(raw_provinces);

    this.clearOptions(province_selector);

    if (!parsed_provinces?.length) {
      province_container.style.display = "none";
    } else {
      this.setOptions(province_selector, parsed_provinces);
      province_container.style.display = "";
    }
  }
}
customElements.define("country-province-selector", CountryProvinceSelector);
