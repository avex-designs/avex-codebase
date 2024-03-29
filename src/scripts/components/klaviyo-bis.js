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
    this._setCloseEvent();
    this._submitForm();
    document.addEventListener(
      "click",
      (event) => {
        this._setOpenEvent(event);
      },
      false
    );
  }

  async _setOpenEvent(event) {
    const $openElement = event.target.closest(`[${attributes.open}]`);
    if (!$openElement) return;

    event.preventDefault();
    this._toggle(true);
    this._loading(true);
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
      this._replaceHTML(html);
      this._loading(false);
    } catch (error) {
      throw new Error(`[KlaviyoBIS] ${error}`);
    }
  }

  _replaceHTML(html) {
    const newDocument = new DOMParser().parseFromString(html, "text/html");
    const $newElement = newDocument.querySelector(
      `${ELEMENT_ID}${this.id ? "_" + this.id : ""}`
    );

    if (!$newElement) throw new Error("[KlaviyoBIS] Element not found");
    this.querySelector(`[${attributes.body}]`).innerHTML =
      $newElement.querySelector(`[${attributes.body}]`).innerHTML;
  }

  async _submitForm() {
    this.$formElement.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(this.$formElement);

      this._reset();
      this._loading(true);
      try {
        const payload = {
          data: {
            type: "back-in-stock-subscription",
            attributes: {
              profile: {
                data: {
                  type: "profile",
                  attributes: {
                    email: formData.get("email"),
                  },
                },
              },
              channels: ["EMAIL"],
            },
            relationships: {
              variant: {
                data: {
                  type: "catalog-variant",
                  id: `$shopify:::$default:::${formData.get("variant")}`,
                },
              },
            },
          },
        };

        const response = await fetch(this.$formElement.action, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            revision: "2023-09-15",
          },
          body: JSON.stringify(payload),
        });

        if (response?.status === 202) {
          this._success(true);
        } else {
          this._error(true);
        }

        this._loading(false);
      } catch (error) {
        this._loading(false);
        throw new Error(`[KlaviyoBIS] ${error}`);
      }
    });
  }

  _setCloseEvent() {
    const _self = this;
    document.addEventListener("keyup", (event) => {
      if (event.code?.toUpperCase() === "ESCAPE") _self._toggle(false);
    });
    if (!this.$closeElements || !this.$closeElements.length)
      return console.warn("[KlaviyoBIS] Close element not found");

    this.$closeElements.forEach((element) =>
      element.addEventListener("click", (e) => {
        e.preventDefault();
        _self._toggle(false);
      })
    );
  }

  _toggle(open) {
    this._reset();
    open ? this.setAttribute("open", "") : this.removeAttribute("open");
  }

  _loading(activate) {
    activate
      ? this.setAttribute("loading", "")
      : this.removeAttribute("loading");
  }

  _success(activate) {
    activate
      ? this.setAttribute("success", "")
      : this.removeAttribute("success");
  }

  _error(activate) {
    activate ? this.setAttribute("error", "") : this.removeAttribute("error");
  }

  _reset() {
    this._error(false);
    this._success(false);
    this._loading(false);
  }
}
customElements.define(ELEMENT_ID, KlaviyoBIS);
