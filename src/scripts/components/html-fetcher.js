// The html-fetcher fetches HTML from the URL passed in the "href" parameter
// and places it inside itself.
// If the fetched HTML contains "html-fetcher" with the same ID,
// then only its inner HTML will be taken.
//
// Use cases:
// * "product-recommendations" section;
// * default pagination ajaxified, such as customer order history pagination;
// * popups that load data from Shopify page or another source.
//
// Provide unique ID for "html-fetcher" elements is possible
// to avoid the situation when the fetched HTML contains more than one "html-fetcher" elements,
// thus it is not clear what element to take inner HTML from.
// Good practice to use {{ section.id }} in its ID
// if you use it within a Shopify section:
// <html-fetcher id="html-fetcher-pagination-{{ section.id }}"></html-fetcher>
//
// In order to load HTML from the "/my/url" URL
// right after the element appears on the page --
// use the loading="eager" attribute:
// <html-fetcher id="my-fetcher-{{ section.id }}" href="/my/url" loading="eager"></html-fetcher>
//
// In order to lazy load HTML (when the element appears in the viewport) --
// use the loading="lazy" attribute,
// as used in the "product recommendations" section:
// <html-fetcher id="my-fetcher-{{ section.id }}" href="/my/url" loading="lazy"></html-fetcher>
//
// In order to trigger HTML loading when a user clicks on a link withing the component --
// apply the "data-html-fetcher-link" attribute to the link.
// If the HTML should be loaded from the page, same as the link's href attribute,
// leave the "data-html-fetcher-link" empty:
// <html-fetcher id="my-fetcher-{{ section.id }}">
//   <a href="/my/url">My link</a>
// </html-fetcher>
// If the page to load HTML is different,
// provide the page as the value of the "data-html-fetcher-link" attribute:
// <html-fetcher id="my-fetcher-{{ section.id }}">
//   <a
//     href="{{ paginate.previous.url }}"
//     data-html-fetcher-link="{{ paginate.previous.url }}&section_id={{ section.id }}">
//   Previous
//   </a>
// </html-fetcher>
//
// In order to add a CSS class to an element when the "html-fetcher" is loading,
// use the "data-html-fetcher-loading-class" attribute:
// <html-fetcher id="my-fetcher-{{ section.id }}">
//   <div class="my-class" data-html-fetcher-loading-class="js-loading"></div>
// </html-fetcher>
//
// In order to trigger loading HTML via JavaScript,
// leave the "href" parameter empty and use the "setUrl" method:
// <html-fetcher id="my-fetcher-{{ section.id }}"></html-fetcher>
// <script>
//   document.querySelector(`#my-fetcher-${section_id}`).setUrl("/my/url");
// </script>
//
// In order to subscribe to element's HTML update, use the "htmlupdate" event:
// <html-fetcher id="my-fetcher-{{ section.id }}"></html-fetcher>
// <script>
//   const $htmlFetcher = document.querySelector(`#my-fetcher-${section_id}`);
//   $htmlFetcher.addEventListener('htmlupdate', (event) => {
//     console.log("htmlupdate");
//   });
// </script>

const elementName = "html-fetcher";
const loadingTypes = {
  EAGER: "eager",
  LAZY: "lazy",
};

const events = {
  HTML_UPDATE: "htmlupdate",
};

const attributes = {
  fetcherLink: "data-html-fetcher-link",
  loadingClass: "data-html-fetcher-loading-class",
};

class HTMLFetcher extends HTMLElement {
  #url;
  #abortController;
  #loading = loadingTypes.EAGER;
  #intersectionObserver;

  constructor() {
    super();
    this.#intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        this.updateHTML();
      },
      {
        rootMargin: "0px 0px 0px 0px",
      }
    );

    this.addEventListener("click", (event) => {
      for (
        let $target = event.target;
        $target && $target !== this;
        $target = $target.parentElement
      ) {
        if ($target.hasAttribute(attributes.fetcherLink)) {
          event.preventDefault();
          let url =
            $target.getAttribute(attributes.fetcherLink) || $target.href;
          this.setUrl(url);
          return;
        }
      }
    });
  }

  connectedCallback() {
    const loading = this.getAttribute("loading");
    if (Object.values(loadingTypes).includes(loading)) {
      this.#loading = loading;
    }

    const url = this.getAttribute("href");
    if (!url) return;

    this.setUrl(url);
  }

  setUrl(url) {
    this.#url = url;
    if (this.#loading === loadingTypes.EAGER) {
      this.updateHTML();
      return;
    }
    this.#intersectionObserver.observe(this);
  }

  async updateHTML() {
    if (this.#abortController) {
      this.#abortController.abort();
    }
    this.#abortController = new AbortController();
    try {
      this.#showLoadingClasses(true);
      const response = await fetch(this.#url, {
        signal: this.#abortController.signal,
      });
      if (!response.ok)
        throw new Error(`Response error from the "${response.url}" URL`);

      let queryDOM = elementName;
      if (this.id) queryDOM += `[id="${this.id}"]`;
      const html = await response.text();
      const newdocument = new DOMParser().parseFromString(html, "text/html");
      const $newElementsList = newdocument.querySelectorAll(queryDOM);
      if ($newElementsList.length > 0) {
        this.innerHTML = $newElementsList[0].innerHTML;
        if ($newElementsList.length > 1) {
          console.error(
            `[html-fetcher] [A few html-fetchers in the response. Use unique ID for each html-fetcher. Query Selector: "${queryDOM}"]`,
            this
          );
        }
      } else {
        this.innerHTML = html;
      }
      this.dispatchEvent(new CustomEvent(events.HTML_UPDATE));
    } catch (error) {
      if (error.name !== "AbortError") {
        throw error;
      }
    }
    this.#showLoadingClasses(false);
  }

  #showLoadingClasses(show) {
    this.querySelectorAll(`[${attributes.loadingClass}]`).forEach(
      ($element) => {
        const className = $element.getAttribute(attributes.loadingClass);
        if (className) {
          if (show) $element.classList.add(className);
          else $element.classList.remove(className);
        }
      }
    );
  }
}

customElements.define(elementName, HTMLFetcher);
