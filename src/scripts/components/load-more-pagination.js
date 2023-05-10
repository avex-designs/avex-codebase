const ELEMENT_NAME = "load-more-pagination";
const SHOPIFY_SECTION_PREFIX = "shopify-section-";
const LOAD_MORE_CONTAINER_TYPE = "load-more";
const LOAD_PREV_CONTAINER_TYPE = "load-prev";
const CONTENT_CONTAINER_TYPE = "content";

const attributes = {
  container: `data-${ELEMENT_NAME}-container`,
  loadingClass: `data-${ELEMENT_NAME}-loading-class`,
  link: `data-${ELEMENT_NAME}-link`,
};

class LoadMorePagination extends HTMLElement {
  #isLoading = false;

  connectedCallback() {
    this.#addEventListeners();
  }

  #addEventListeners() {
    const loadMoreLinkQuery = `[${attributes.container}="${LOAD_MORE_CONTAINER_TYPE}"] [${attributes.link}]`;
    const loadPrevLinkQuery = `[${attributes.container}="${LOAD_PREV_CONTAINER_TYPE}"] [${attributes.link}]`;
    this.querySelectorAll(`${loadPrevLinkQuery}, ${loadMoreLinkQuery}`).forEach(
      ($link) => {
        const containerType = $link
          .closest(`[${attributes.container}`)
          .getAttribute(attributes.container);
        $link.addEventListener("click", (event) => {
          event.preventDefault();
          this.#fetch($link.href, containerType);
        });
      }
    );
  }

  #fetch(url, linkContainerType) {
    if (this.#isLoading) return;
    const requestURL = new URL(url, window.location.origin);
    const $section = this.closest(`[id^="${SHOPIFY_SECTION_PREFIX}"]`);
    if (!$section)
      throw new Error(
        "[load-more-pagination] [The component must be within a Shopify section]"
      );
    const sectionId = $section.id.replace(SHOPIFY_SECTION_PREFIX, "");

    if (linkContainerType === LOAD_MORE_CONTAINER_TYPE) {
      window.history.pushState(
        Object.fromEntries(requestURL.searchParams),
        "",
        requestURL.href
      );
    }
    requestURL.search = requestURL.search + `&section_id=${sectionId}`;

    this.#isLoading = true;
    this.#addLoadingClasses(this.#isLoading, linkContainerType);
    fetch(requestURL)
      .then((response) => response.text())
      .then((html) => {
        this.#render(html, linkContainerType);
      })
      .finally(() => {
        this.#isLoading = false;
        this.#addLoadingClasses(this.#isLoading, linkContainerType);
      });
  }

  #addLoadingClasses(add, linkContainerType) {
    this.querySelectorAll(`[${attributes.loadingClass}]`).forEach(
      ($element) => {
        let elementLoadingType = "";
        let className = "";
        const attrArr = (
          $element.getAttribute(attributes.loadingClass) || ""
        ).split("|");
        if (attrArr.length > 1) {
          elementLoadingType = attrArr[0];
          className = attrArr[1];
        } else {
          className = attrArr[0];
        }
        if (className) {
          if (
            add &&
            (!elementLoadingType || elementLoadingType === linkContainerType)
          )
            $element.classList.add(className);
          else $element.classList.remove(className);
        }
      }
    );
  }

  #render(html, linkContainerType) {
    const receivedDOM = new DOMParser().parseFromString(html, "text/html");
    document
      .querySelectorAll(`[${attributes.container}]`)
      .forEach(($container) => {
        const containerType = $container.getAttribute(attributes.container);
        if (!containerType) return;
        const $receivedContainer = receivedDOM.querySelector(
          `[${attributes.container}="${containerType}"]`
        );
        if (!$receivedContainer) return;

        if (
          (linkContainerType === LOAD_MORE_CONTAINER_TYPE &&
            containerType === LOAD_MORE_CONTAINER_TYPE) ||
          (linkContainerType === LOAD_PREV_CONTAINER_TYPE &&
            containerType === LOAD_PREV_CONTAINER_TYPE)
        ) {
          $container.innerHTML = $receivedContainer.innerHTML;
          return;
        }

        if (containerType === CONTENT_CONTAINER_TYPE) {
          $container.insertAdjacentHTML(
            linkContainerType === LOAD_PREV_CONTAINER_TYPE
              ? "afterbegin"
              : "beforeend",
            $receivedContainer.innerHTML
          );
        }
      });
    this.#addEventListeners();
  }
}

customElements.define(ELEMENT_NAME, LoadMorePagination);
