const elementName = "html-fetcher";
const loadingTypes = {
  EAGER: "eager",
  LAZY: "lazy",
};

customElements.define(
  elementName,
  class extends HTMLElement {
    #needsUpdate = false;
    #url;
    #abortController;
    #loading = loadingTypes.EAGER;
    #intersectionObserver;

    constructor() {
      super();
      this.#intersectionObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          console.log("visible");
          observer.unobserve(this);
          this.updateHTML();
        },
        {
          rootMargin: "0px 0px 0px 0px",
        }
      );
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
        const response = await fetch(this.#url, {
          signal: this.#abortController.signal,
        });
        if (!response.ok)
          throw new Error(`Response error from the "${response.url}" URL`);

        const html = await response.text();
        const newdocument = new DOMParser().parseFromString(html, "text/html");
        const $newElement = newdocument.querySelector(elementName);
        if ($newElement) this.innerHTML = $newElement.innerHTML;
        else this.innerHTML = html;
      } catch (error) {
        if (error.name !== "AbortError") {
          throw error;
        }
      }
    }
  }
);
