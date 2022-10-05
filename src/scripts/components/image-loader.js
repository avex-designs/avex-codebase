class ImageLoader extends HTMLElement {
  constructor() {
    super();
    this.loadingElement = this.querySelector("img");
    if (!this.loadingElement) return;

    if (
      this.loadingElement.hasAttribute("src") &&
      this.loadingElement.complete
    ) {
      this.setReady();
      return;
    }

    this.loadingElement.addEventListener("load", this.setReady.bind(this));
    this.loadingElement.addEventListener(
      "loadeddata",
      this.setReady.bind(this)
    );
  }

  setReady() {
    this.setAttribute("ready", "");
  }
}
customElements.define("image-loader", ImageLoader);
