const ELEMENT_NAME = "media-loader";

class MediaLoader extends HTMLElement {
  _$elements = [];

  connectedCallback() {
    this.querySelectorAll("img, video").forEach(($element) => {
      if ($element instanceof HTMLVideoElement) {
        $element.addEventListener("loadeddata", this._test.bind(this));
        $element.addEventListener("loadedmetadata", this._test.bind(this));
        $element.addEventListener("canplay", this._test.bind(this));
        $element.addEventListener("canplaythrough", this._test.bind(this));
        $element.addEventListener("playing", this._test.bind(this));
      } else {
        $element.addEventListener("load", this._test.bind(this));
      }
      this._$elements.push($element);
    });

    this._test();
  }

  _test() {
    if (this.hasAttribute("ready")) return;
    for (let i = 0; i < this._$elements.length; i++) {
      const $element = this._$elements[i];

      if (
        ($element instanceof HTMLVideoElement && $element.readyState < 3) ||
        ($element instanceof HTMLImageElement && !$element.complete)
      ) {
        return;
      }
    }
    this._setReady();
  }

  _setReady() {
    this.setAttribute("ready", "");
    const event = new CustomEvent(`${ELEMENT_NAME}:ready`);
    this.dispatchEvent(event);
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, MediaLoader);
}
