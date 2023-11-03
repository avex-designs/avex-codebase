import "liquid-ajax-cart";

/**
 * Open ajax-cart when a product is added to the cart
 */
document.addEventListener("liquid-ajax-cart:request-end", (event) => {
  const { requestState } = event.detail;
  if (requestState.requestType === "add" && requestState.responseData?.ok) {
    document.body.classList.add("js-ajax-cart-open");
  }
});

/**
 * Event Listeners
 * You may use one eventlistener for all methods
 */
document.addEventListener(
  "click",
  (event) => {
    if (event) {
      sampleMethod(event);
    }
  },
  false
);

window.addEventListener("resize", () => {});

// fires on every component load and holds name of loaded component and other not loaded components
document.addEventListener("component-loaded", (evt) => console.log(evt.detail));

function sampleMethod(event) {
  const element = event.target.closest("[data-some-attr]"); // add your element class/id/data-attr.
  if (element) {
    event.preventDefault();
    //.... your logic here
  }
}
