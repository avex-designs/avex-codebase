import { getShopifySection, toggleClassFromAttribute } from "../helpers";

const ELEMENT_NAME = "infinite-paginate";
const LOAD_MORE_TYPE = "load-more";
const LOAD_PREV_TYPE = "load-prev";

const attributes = {
  content: `data-${ELEMENT_NAME}-content`,
  container: `data-${ELEMENT_NAME}-container`,
  loadingClass: `data-${ELEMENT_NAME}-loading-class`,
  loadingPrevClass: `data-${ELEMENT_NAME}-loading-prev-class`,
  loadingMoreClass: `data-${ELEMENT_NAME}-loading-more-class`,
  link: `data-${ELEMENT_NAME}-link`,
};

class InfinitePaginate extends HTMLElement {
  _isLoading = false;

  connectedCallback() {
    this._addEventListeners();
  }

  _addEventListeners() {
    const loadMoreLinkQuery = `[${attributes.container}="${LOAD_MORE_TYPE}"] [${attributes.link}]`;
    const loadPrevLinkQuery = `[${attributes.container}="${LOAD_PREV_TYPE}"] [${attributes.link}]`;
    this.querySelectorAll(`${loadPrevLinkQuery}, ${loadMoreLinkQuery}`).forEach(
      ($link) => {
        const linkContainerType = $link
          .closest(`[${attributes.container}`)
          .getAttribute(attributes.container);
        $link.addEventListener("click", (event) => {
          event.preventDefault();
          this._fetch($link.href, linkContainerType);
        });
      }
    );
  }

  _fetch(url, requestType) {
    if (this._isLoading) return;
    const requestURL = new URL(url, window.location.origin);
    const [sectionId] = getShopifySection(this);
    if (!sectionId)
      throw new Error(
        `[${ELEMENT_NAME}] [The component must be within a Shopify section]`
      );

    if (requestType === LOAD_MORE_TYPE) {
      window.history.pushState(
        Object.fromEntries(requestURL.searchParams),
        "",
        requestURL.href
      );
    }
    requestURL.search = requestURL.search + `&section_id=${sectionId}`;

    this._isLoading = true;
    this._addLoadingClasses(this._isLoading, requestType);
    fetch(requestURL)
      .then((response) => response.text())
      .then((html) => {
        this._render(html, requestType);
      })
      .finally(() => {
        this._isLoading = false;
        this._addLoadingClasses(this._isLoading, requestType);
      });
  }

  _addLoadingClasses(on, requestType) {
    toggleClassFromAttribute(this, attributes.loadingClass, on);
    toggleClassFromAttribute(
      this,
      attributes.loadingPrevClass,
      on && requestType === LOAD_PREV_TYPE
    );
    toggleClassFromAttribute(
      this,
      attributes.loadingMoreClass,
      on && requestType === LOAD_MORE_TYPE
    );
  }

  _render(html, linkContainerType) {
    const receivedDOM = new DOMParser().parseFromString(html, "text/html");
    this.querySelectorAll(`[${attributes.container}]`).forEach(($container) => {
      const containerType = $container.getAttribute(attributes.container);
      if (!containerType)
        throw new Error(
          `[${ELEMENT_NAME}] [A "${attributes.container}" element doesn't have an attribute value]`
        );
      const $receivedContainer = receivedDOM.querySelector(
        `[${attributes.container}="${containerType}"]`
      );
      if (!$receivedContainer)
        throw new Error(
          `[${ELEMENT_NAME}] [Corresponding element for [${attributes.container}="${containerType}"] isn't received in the AJAX response]`
        );

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
        `[${ELEMENT_NAME}] [The ${attributes.content} isn't found on the page or in the ajax response]`
      );
    }

    this._addEventListeners();
  }
}

customElements.define(ELEMENT_NAME, InfinitePaginate);
