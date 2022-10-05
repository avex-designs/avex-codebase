class FilterReset extends HTMLElement {
  constructor() {
    super();
    this.querySelector("a").addEventListener("click", (event) => {
      event.preventDefault();
      const form =
        this.closest("filter-and-sort-form") ||
        document.querySelector("filter-and-sort-form");
      form.resetActiveFilter(event);
    });
  }
}
customElements.define("filter-reset", FilterReset);
