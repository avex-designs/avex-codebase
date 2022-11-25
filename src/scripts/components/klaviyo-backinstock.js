class KlaviyoBIS extends HTMLElement {
  constructor() {
    super();
    this.globalEvents();
  }

  connectedCallback() {
    const $closeButton = this.querySelector("[data-klaviyo-backinstock-close]");
    const $klaviyoForm = this.querySelector("form");
    if (!$klaviyoForm)
      return console.error("[KlaviyoBIS]: form tag not detected");

    if ($closeButton) {
      $closeButton.addEventListener(
        "click",
        this.toggleModalVisibilty.bind(this)
      );
    }

    document.addEventListener("keyup", (event) => {
      if (event.code?.toUpperCase() === "ESCAPE") this.toggleModalVisibilty();
    });
    this.addEventListener("click", (event) => {
      if (event.target.nodeName === "KLAVIYO-BACKINSTOCK")
        this.toggleModalVisibilty();
    });

    $klaviyoForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const url =
        "https://a.klaviyo.com/onsite/components/back-in-stock/subscribe";
      this.setAttribute("loading", "");
      fetch(url, {
        method: "post",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            this.setAttribute("success", "");
          } else {
            this.removeAttribute("error");
            console.error("[KlaviyoBIS]: ", data);
          }
          this.removeAttribute("loading");
        })
        .catch((error) => {
          this.removeAttribute("loading");
          return console.error("[KlaviyoBIS]: fetching error - ", error);
        });
    });
  }

  toggleModalVisibilty() {
    document.body.toggleAttribute("data-klaviyo-bis-modal-open");
    this.toggleAttribute("open");
  }

  globalEvents() {
    console.log("Init");
    this.init();
    this.notifyButtonClickEvent();
  }

  init() {
    const $allAddToCartForms = document.querySelectorAll(
      "form[action='/cart/add']"
    );
    if (!$allAddToCartForms || !$allAddToCartForms.length)
      return console.error("[KlaviyoBIS]: No forms detected");

    for (let index = 0; index < $allAddToCartForms.length; index++) {
      const $productForm = $allAddToCartForms[index];
      const productData = this.getProductData($productForm);

      if (
        productData &&
        productData.parsedProductVariants &&
        productData.selectedVariantID
      ) {
        const selectedVariantObject = productData.parsedProductVariants.find(
          (item) => item.id === Number(productData.selectedVariantID)
        );
        if (selectedVariantObject && !selectedVariantObject.available) {
          $productForm.setAttribute("data-klaviyo-backinstock-notify", "");
        }
      }
    }
  }

  notifyButtonClickEvent() {
    const $formBody = this.querySelector("[data-klaviyo-backinstock-body]");
    document.addEventListener(
      "click",
      (event) => {
        if (event) {
          this.removeAttribute("success");
          const $notifyButton = event.target.closest(
            "[data-klaviyo-backinstock-notify-button]"
          );

          if ($notifyButton) {
            const $productForm = $notifyButton.closest(
              "form[action='/cart/add']"
            );
            if ($productForm) {
              const productData = this.getProductData($productForm);
              if (productData) {
                $formBody.appendChild(
                  this.variantsSelectorInput(
                    productData.selectedVariantID,
                    productData.parsedProductVariants
                  )
                );
                this.toggleModalVisibilty();
              }
            }
          }
        }
      },
      false
    );
  }

  getProductData($productForm) {
    const selectedVariantID = $productForm.querySelector("[name='id']")?.value;
    const $productVariantsJSON = $productForm.querySelector(
      "[data-product-json-variants]"
    );

    const parsedProductVariants =
      $productVariantsJSON &&
      $productVariantsJSON.textContent !== "" &&
      JSON.parse($productVariantsJSON.textContent);

    if (!parsedProductVariants || !selectedVariantID) {
      console.error(
        "[KlaviyoBIS]: Product variants JSON object not added or there is no default variant selected"
      );
      return null;
    }

    return {
      selectedVariantID,
      parsedProductVariants,
    };
  }

  variantsSelectorInput(selected, variants) {
    if (!variants) return null;
    const variantTag = document.createElement(
      variants.length > 1 ? "select" : "input"
    );
    variantTag.name = "variant";
    if (variants.length === 1) {
      variantTag.type = "hidden";
      variantTag.value = variants[0]?.id;
    } else {
      let options = "";
      for (let i = 0; i < variants.length; i++) {
        options += `<option value="${variants[i]["id"]}" ${
          variants[i]["available"] && "disabled"
        }>${variants[i]["title"]}</option>`;
      }
      variantTag.innerHTML = options;
    }

    if (selected) {
      variantTag.value = selected;
    }

    return variantTag;
  }
}
customElements.define("klaviyo-backinstock", KlaviyoBIS);
