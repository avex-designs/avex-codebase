import { debounce } from "../helpers";

class FilterAndSortForm extends HTMLElement {
  constructor() {
    super();
    this.resetActiveFilter = this.resetActiveFilter.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector("form").addEventListener(
      "input",
      this.debouncedOnSubmit.bind(this)
    );
  }
  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state
        ? event.state.searchParams
        : FilterAndSortForm.searchParamsInitial;
      if (searchParams === FilterAndSortForm.searchParamsPrev) return;
      FilterAndSortForm.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }

  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  static renderProductGridContainer(html) {
    document.getElementById("ProductsList").innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductsList").innerHTML;
  }

  static renderFilters(html) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");

    const filtersDetailsElements = parsedHTML.querySelectorAll(
      "#FiltersForm .js-filter"
    );
    filtersDetailsElements.forEach((element) => {
      document.querySelector(
        `.js-filter[data-index="${element.dataset.index}"]`
      ).innerHTML = element.innerHTML;
    });
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FilterAndSortForm.renderProductGridContainer(html);
        FilterAndSortForm.data = [...FilterAndSortForm.data, { html, url }];
        FilterAndSortForm.renderFilters(html, event);
        FilterAndSortForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FilterAndSortForm.data.find(filterDataUrl).html;
    FilterAndSortForm.renderFilters(html, event);
    FilterAndSortForm.renderProductGridContainer(html);
    FilterAndSortForm.renderProductCount(html);
  }

  static renderProductCount(html) {
    const count = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductsCount").innerHTML;
    const container = document.getElementById("ProductsCount");
    container.innerHTML = count;
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FilterAndSortForm.searchParamsPrev = searchParams;
    const section = document.getElementById("ProductsList").dataset.id;
    document
      .getElementById("ProductsList")
      .querySelector("[data-products-list]")
      .classList.add("loading");
    const url = `${window.location.pathname}?section_id=${section}&${searchParams}`;
    const filterDataUrl = (element) => element.url === url;

    FilterAndSortForm.data.some(filterDataUrl)
      ? FilterAndSortForm.renderSectionFromCache(filterDataUrl, event)
      : FilterAndSortForm.renderSectionFromFetch(url, event);

    if (updateURLHash) FilterAndSortForm.updateURLHash(searchParams);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest("form"));
    const searchParams = new URLSearchParams(formData).toString();
    FilterAndSortForm.renderPage(searchParams, event);
  }

  resetActiveFilter(event) {
    event.preventDefault();
    FilterAndSortForm.renderPage(
      new URL(event.currentTarget.href).searchParams.toString()
    );
  }
}

FilterAndSortForm.data = [];
FilterAndSortForm.searchParamsInitial = window.location.search.slice(1);
FilterAndSortForm.searchParamsPrev = window.location.search.slice(1);
customElements.define("filter-and-sort-form", FilterAndSortForm);
FilterAndSortForm.setListeners();
