/// KlaviyoBIS
const ELEMENT_ID = "klaviyo-bis";

const attributes = {
  body: `data-${ELEMENT_ID}-body`,
  close: `data-${ELEMENT_ID}-close`,
  open: `data-${ELEMENT_ID}-open`,
  requestUrl: `data-${ELEMENT_ID}-url`,
  responseMessage: `data-${ELEMENT_ID}-response`,
};

class KlaviyoBIS extends HTMLElement {
  constructor() {
    super();
    this.$closeElements = this.querySelectorAll(`[${attributes.close}]`);
    this.$formElement = this.querySelector("form");
    if (!this.$formElement) throw new Error("[KlaviyoBIS] Form not found");
  }

  connectedCallback() {
    this.#setCloseEvent();
    this.#submitForm();
    document.addEventListener(
      "click",
      (event) => {
        this.#setOpenEvent(event);
      },
      false
    );
  }

  async #setOpenEvent(event) {
    const $openElement = event.target.closest(`[${attributes.open}]`);
    if (!$openElement) return;

    event.preventDefault();
    this.#toggle(true);
    this.#loading(true);
    const form = $openElement.closest("form");
    const requestURL = $openElement.getAttribute(attributes.requestUrl);
    const selectedVariantId = form?.querySelector("[name='id']")?.value || 0;

    const url = `${requestURL}${requestURL.indexOf("?") > -1 ? "&" : "?"}${
      parseInt(selectedVariantId) > 0 ? `variant=${selectedVariantId}&` : ""
    }section_id=${ELEMENT_ID}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("[KlaviyoBIS] Response error");

      const html = await response.text();
      this.#replaceHTML(html);
      this.#loading(false);
    } catch (error) {
      throw new Error(`[KlaviyoBIS] ${error}`);
    }
  }

  #replaceHTML(html) {
    const newDocument = new DOMParser().parseFromString(html, "text/html");
    const $newElement = newDocument.querySelector(
      `${ELEMENT_ID}${this.id ? "#" + this.id : ""}`
    );

    if (!$newElement) throw new Error("[KlaviyoBIS] Element not found");
    this.querySelector(`[${attributes.body}]`).innerHTML =
      $newElement.querySelector(`[${attributes.body}]`).innerHTML;
  }

  async #submitForm() {
    this.$formElement.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.#reset();
      this.#loading(true);
      try {
        const formData = new FormData(this.$formElement);
        const response = await fetch(this.$formElement.action, {
          method: "post",
          body: formData,
        }).then((response) => response.json());
        if (response?.success) {
          this.#success(true);
        } else {
          this.#error(true);
        }

        this.#loading(false);
      } catch (error) {
        this.#loading(false);
        throw new Error(`[KlaviyoBIS] ${error}`);
      }
    });
  }

  #setCloseEvent() {
    const _self = this;
    document.addEventListener("keyup", (event) => {
      if (event.code?.toUpperCase() === "ESCAPE") _self.#toggle(false);
    });
    if (!this.$closeElements || !this.$closeElements.length)
      return console.warn("[KlaviyoBIS] Close element not found");

    this.$closeElements.forEach((element) =>
      element.addEventListener("click", (e) => {
        e.preventDefault();
        _self.#toggle(false);
      })
    );
  }

  #toggle(open) {
    this.#reset();
    open ? this.setAttribute("open", "") : this.removeAttribute("open");
  }

  #loading(activate) {
    activate
      ? this.setAttribute("loading", "")
      : this.removeAttribute("loading");
  }

  #success(activate) {
    activate
      ? this.setAttribute("success", "")
      : this.removeAttribute("success");
  }

  #error(activate) {
    activate ? this.setAttribute("error", "") : this.removeAttribute("error");
  }

  #reset() {
    this.#error(false);
    this.#success(false);
    this.#loading(false);
  }
}
customElements.define(ELEMENT_ID, KlaviyoBIS);
