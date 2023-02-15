import Swiper, { Navigation, Pagination, Thumbs } from "swiper";
import "liquid-ajax-cart";

/**
 * Configure Liquid Ajax Cart
 */
// move to theme.liquid refer to Kit&ace
// configureCart("addToCartCssClass", "js-ajax-cart-opened");
console.log("HEEEY");
/**
 * Configure Swiper Modules
 */
// try to use in component level
Swiper.use([Navigation, Pagination, Thumbs]);
window.Swiper = Swiper;

/**
 * Event Listeners
 * Use one eventlistener for all methods
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
