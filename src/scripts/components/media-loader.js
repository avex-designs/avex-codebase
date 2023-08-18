const ELEMENT_NAME = "media-loader";

class MediaLoader extends HTMLElement {
  #$elements = [];

  connectedCallback() {
    this.querySelectorAll("img, video").forEach(($element) => {
      if ($element instanceof HTMLVideoElement) {
        $element.addEventListener("loadeddata", this.#test.bind(this));
        $element.addEventListener("loadedmetadata", this.#test.bind(this));
        $element.addEventListener("canplay", this.#test.bind(this));
        $element.addEventListener("canplaythrough", this.#test.bind(this));
        $element.addEventListener("playing", this.#test.bind(this));
      } else {
        $element.addEventListener("load", this.#test.bind(this));
      }
      this.#$elements.push($element);
    });

    this.#test();
  }

  #test() {
    if (this.hasAttribute("ready")) return;
    for (let i = 0; i < this.#$elements.length; i++) {
      const $element = this.#$elements[i];

      if (
        ($element instanceof HTMLVideoElement && $element.readyState < 3) ||
        ($element instanceof HTMLImageElement && !$element.complete)
      ) {
        return;
      }
    }
    this.#setReady();
  }

  #setReady() {
    this.setAttribute("ready", "");
    const event = new CustomEvent(`${ELEMENT_NAME}:ready`);
    this.dispatchEvent(event);
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, MediaLoader);
}
