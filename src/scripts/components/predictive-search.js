import { SearchForm } from "../base-components/search-form";

const SHOPIFY_SECTION_ID = "predictive-search";
const ELEMENT_NAME = "predictive-search";

const attributes = {
  predictiveSearchResults: "[data-predictive-search-results]",
  predictiveSearchItem: "[data-predictive-search-item]",
  activeSelectedAriaTag: "[aria-selected='true'] a",
  activeSelectedAria: "[aria-selected='true']",
  loading: "loading",
  results: "results",
  open: "open",
  ariaExpanded: "aria-expanded",
  ariaSelected: "aria-selected",
  activeDescendantAria: "aria-activedescendant",
};
class PredictiveSearch extends SearchForm {
  constructor() {
    super();
    this.cachedResults = {};
    this.isOpen = false;
    this.searchTerm = "";
    this.$allInstances = document.querySelectorAll(ELEMENT_NAME);
    this.$results = this.querySelector(attributes.predictiveSearchResults);
    this.abortController = new AbortController();
    if (!this.$results)
      throw new Error(
        `[${ELEMENT_NAME}] [Element with data attribute ${attributes.predictiveSearchResults} not declared!]`
      );
    this.setEventListeners();
  }

  setEventListeners() {
    this.input.form.addEventListener("submit", this.onFormSubmit.bind(this));
    this.input.addEventListener("focus", this.onFocus.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.addEventListener("keyup", this.onKeyup.bind(this));
    this.addEventListener("keydown", this.onKeydown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    super.onChange();
    const newSearchTerm = this.getQuery();
    this.searchTerm = newSearchTerm;

    if (!this.searchTerm.length) {
      this.close(true);
      return;
    }

    this.getSearchResults(this.searchTerm);
  }

  onFormSubmit(event) {
    if (
      !this.getQuery().length ||
      this.querySelector(attributes.activeSelectedAriaTag)
    )
      event.preventDefault();
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.searchTerm = "";
      this.abortController.abort();
      this.abortController = new AbortController();
      this.closeResults(true);
    }
  }

  onFocus() {
    const currentSearchTerm = this.getQuery();

    if (!currentSearchTerm.length) return;

    if (this.searchTerm !== currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute(attributes.results) === "true") {
      this.open();
    } else {
      this.getSearchResults(this.searchTerm);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onKeyup(event) {
    if (!this.getQuery().length) this.close(true);
    event.preventDefault();

    switch (event.code) {
      case "ArrowUp":
        this.switchOption("up");
        break;
      case "ArrowDown":
        this.switchOption("down");
        break;
      case "Enter":
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      event.preventDefault();
    }
  }

  switchOption(direction) {
    if (!this.getAttribute("open")) return;

    const moveUp = direction === "up";
    const selectedElement = this.querySelector(attributes.activeSelectedAria);

    // Filter out hidden elements (duplicated page and article resources)
    const allVisibleElements = Array.from(
      this.querySelectorAll(attributes.predictiveSearchItem)
    ).filter((element) => element.offsetParent !== null);
    let activeElementIndex = 0;

    if (moveUp && !selectedElement) return;

    let selectedElementIndex = -1;
    let i = 0;

    while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
      if (allVisibleElements[i] === selectedElement) {
        selectedElementIndex = i;
      }
      i++;
    }

    if (!moveUp && selectedElement) {
      activeElementIndex =
        selectedElementIndex === allVisibleElements.length - 1
          ? 0
          : selectedElementIndex + 1;
    } else if (moveUp) {
      activeElementIndex =
        selectedElementIndex === 0
          ? allVisibleElements.length - 1
          : selectedElementIndex - 1;
    }

    if (activeElementIndex === selectedElementIndex) return;

    const activeElement = allVisibleElements[activeElementIndex];

    activeElement.setAttribute(attributes.ariaSelected, true);
    if (selectedElement)
      selectedElement.setAttribute(attributes.ariaSelected, false);

    this.input.setAttribute(attributes.activeDescendantAria, activeElement.id);
  }

  selectOption() {
    const selectedOption = this.querySelector(attributes.activeSelectedAriaTag);
    if (selectedOption) selectedOption.click();
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setAttribute(attributes.loading, true);
    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(
      `${window.routes.predictive_search_url}?q=${encodeURIComponent(
        searchTerm
      )}&section_id=${SHOPIFY_SECTION_ID}`,
      { signal: this.abortController.signal }
    )
      .then((response) => {
        if (!response.ok) {
          let error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector(`#shopify-section-${SHOPIFY_SECTION_ID}`).innerHTML;
        // Save bandwidth keeping the cache in all instances synced
        this.$allInstances.forEach((predictiveSearchInstance) => {
          predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
        });
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        if (error?.code === 20) {
          // Code 20 means the call was aborted
          return;
        }
        this.close();
        throw error;
      });
  }

  renderSearchResults(resultsMarkup) {
    this.$results.innerHTML = resultsMarkup;
    this.setAttribute(attributes.results, true);

    this.removeAttribute(attributes.loading);
    this.open();
  }

  open() {
    this.setAttribute(attributes.open, true);
    this.input.setAttribute(attributes.ariaExpanded, true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
    this.isOpen = false;
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = "";
      this.removeAttribute(attributes.results);
    }
    const selected = this.querySelector(attributes.activeSelectedAria);

    if (selected) selected.setAttribute(attributes.ariaSelected, false);

    this.input.setAttribute(attributes.activeDescendantAria, "");
    this.removeAttribute(attributes.loading);
    this.removeAttribute(attributes.open);
    this.input.setAttribute(attributes.ariaExpanded, false);
    this.$results.removeAttribute("style");
  }
}
customElements.define(ELEMENT_NAME, PredictiveSearch);
