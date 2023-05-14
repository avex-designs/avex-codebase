// ====== Draft DOCS ========

// The "form" attribute is supported for form components:
// If you want to put an "input" or "select" element outside the component --
// add an id to the form and the "form" attribute to the element

import { getShopifySection, toggleClassFromAttribute } from "../helpers";

const ELEMENT_NAME = "facets-form";

const attributes = {
  ajaxInput: `data-${ELEMENT_NAME}-input`,
  content: `data-${ELEMENT_NAME}-content`,
};

let responseCache = []; // [{url, html}, {url, html}]
let searchParamsInitial = window.location.search.slice(1);
let searchParamsPrev = window.location.search.slice(1);
let abortController;

window.addEventListener("popstate", (event) => {
  const searchParams = event.state
    ? event.state.searchParams
    : searchParamsInitial;
  if (searchParams === searchParamsPrev) return;
  facetsChangeHandler(searchParams, false);
});

function facetsChangeHandler(searchParams, updateURLHash = true) {
  try {
    if (abortController) {
      abortController.abort();
      abortController = undefined;
    }
    searchParamsPrev = searchParams;
    const sectionsMap = {};
    document.querySelectorAll(`[${attributes.content}]`).forEach(($content) => {
      const [sectionId] = getShopifySection($content);
      if (!sectionId)
        throw new Error(
          `[${ELEMENT_NAME}] [The "${attributes.content}" element must be within a Shopify section]`
        );
      sectionsMap[sectionId] = true;
    });

    const sections = Object.keys(sectionsMap);
    if (sections.length > 5) {
      throw new Error(
        `[${ELEMENT_NAME}] [The "${attributes.content}" elements exist in more than 5 sections]`
      );
    }

    const url = `${window.location.pathname}?sections=${sections.join(
      ","
    )}&${searchParams}`;

    const cachedResponse = responseCache.find((item) => item.url === url);
    if (cachedResponse) renderPage(cachedResponse.html);
    else {
      abortController = new AbortController();
      toggleLoadingClasses(true);
      fetch(url, { signal: abortController.signal })
        .then((response) => response.json())
        .then((data) => {
          let html = "";
          for (let i in data) {
            html += data[i];
          }
          responseCache.push({ url, html });
          renderPage(html);
        })
        .catch((e) => {
          console.error(`[${ELEMENT_NAME}] [Section API request error]`, e);
          window.location.href = `?${searchParams}`;
        })
        .finally(() => {
          toggleLoadingClasses(false);
        });
    }

    if (updateURLHash)
      history.pushState(
        { searchParams },
        "",
        `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
      );
  } catch (e) {
    console.error(e);
    window.location.href = `?${searchParams}`;
  }
}

function toggleLoadingClasses(on) {
  toggleClassFromAttribute(document, attributes.loadingClass, on);
}

function renderPage(html) {
  const $receivedDocument = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll(`[${attributes.content}]`).forEach(($content) => {
    const contentId = $content.getAttribute(attributes.content);
    if (!contentId)
      console.error(
        `[${ELEMENT_NAME}] [A "${attributes.content}" element doesn't have unique value]`
      );
    const $receivedContent = $receivedDocument.querySelector(
      `[${attributes.content}="${contentId}"]`
    );
    if (!$receivedContent) {
      console.error(
        `[${ELEMENT_NAME}] [A "${attributes.content}" element with "${contentId}" value isn't found in the section API response]`
      );
      return;
    }
    $content.innerHTML = $receivedContent.innerHTML;
  });
}

class FacetsForm extends HTMLElement {
  connectedCallback() {
    const $form = this.querySelector("form");
    if (!$form)
      throw new Error(`[${ELEMENT_NAME}] [The "form" element isn't found]`);

    document.body.addEventListener("change", (event) => {
      if (
        event.target.form === $form &&
        event.target.hasAttribute(attributes.ajaxInput)
      ) {
        // facetsChangeHandler
        const formData = new FormData($form);
        facetsChangeHandler(new URLSearchParams(formData).toString());
      }
    });
  }
}

customElements.define(ELEMENT_NAME, FacetsForm);
