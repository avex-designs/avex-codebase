const ELEMENT_NAME = "load-more-pagination";
const SHOPIFY_SECTION_PREFIX = "shopify-section-";
const LOAD_MORE_TYPE = "load-more";
const LOAD_PREV_TYPE = "load-prev";

const attributes = {
  content: `data-${ELEMENT_NAME}-content`,
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
    const loadMoreLinkQuery = `[${attributes.container}="${LOAD_MORE_TYPE}"] [${attributes.link}]`;
    const loadPrevLinkQuery = `[${attributes.container}="${LOAD_PREV_TYPE}"] [${attributes.link}]`;
    this.querySelectorAll(`${loadPrevLinkQuery}, ${loadMoreLinkQuery}`).forEach(
      ($link) => {
        const linkContainerType = $link
          .closest(`[${attributes.container}`)
          .getAttribute(attributes.container);
        $link.addEventListener("click", (event) => {
          event.preventDefault();
          this.#fetch($link.href, linkContainerType);
        });
      }
    );
  }

  #fetch(url, requestType) {
    if (this.#isLoading) return;
    const requestURL = new URL(url, window.location.origin);
    const $section = this.closest(`[id^="${SHOPIFY_SECTION_PREFIX}"]`);
    if (!$section)
      throw new Error(
        "[load-more-pagination] [The component must be within a Shopify section]"
      );
    const sectionId = $section.id.replace(SHOPIFY_SECTION_PREFIX, "");

    if (requestType === LOAD_MORE_TYPE) {
      window.history.pushState(
        Object.fromEntries(requestURL.searchParams),
        "",
        requestURL.href
      );
    }
    requestURL.search = requestURL.search + `&section_id=${sectionId}`;

    this.#isLoading = true;
    this.#addLoadingClasses(this.#isLoading, requestType);
    fetch(requestURL)
      .then((response) => response.text())
      .then((html) => {
        this.#render(html, requestType);
      })
      .finally(() => {
        this.#isLoading = false;
        this.#addLoadingClasses(this.#isLoading, requestType);
      });
  }

  #addLoadingClasses(add, requestType) {
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
            (!elementLoadingType || elementLoadingType === requestType)
          )
            $element.classList.add(className);
          else $element.classList.remove(className);
        }
      }
    );
  }

  #render(html, linkContainerType) {
    const receivedDOM = new DOMParser().parseFromString(html, "text/html");
    this.querySelectorAll(`[${attributes.container}]`).forEach(($container) => {
      const containerType = $container.getAttribute(attributes.container);
      if (!containerType) return;
      const $receivedContainer = receivedDOM.querySelector(
        `[${attributes.container}="${containerType}"]`
      );
      if (!$receivedContainer) return;

      if (
        (linkContainerType === LOAD_MORE_TYPE &&
          containerType === LOAD_MORE_TYPE) ||
        (linkContainerType === LOAD_PREV_TYPE &&
          containerType === LOAD_PREV_TYPE)
      ) {
        $container.innerHTML = $receivedContainer.innerHTML;
      }
    });

    const $content = this.querySelector(`[${attributes.content}]`);
    const $receivedContent = receivedDOM.querySelector(
      `[${attributes.content}]`
    );
    if ($content && $receivedContent) {
      $content.insertAdjacentHTML(
        linkContainerType === LOAD_PREV_TYPE ? "afterbegin" : "beforeend",
        $receivedContent.innerHTML
      );
    } else {
      console.warn(
        `[load-more-pagination] [The ${attributes.content} isn't found on the page or in the ajax response]`
      );
    }

    this.#addEventListeners();
  }
}

customElements.define(ELEMENT_NAME, LoadMorePagination);
