/**
 * Sample code:
 * 
  <swiper-loader loaded-class="announcement-bar-slide-inited">
    <button type="button" data-announcement-bar-prev>Prev</button>
      <swiper-container
        init="false"
        navigation-prev-el="[data-announcement-bar-prev]"
        navigation-next-el="[data-announcement-bar-next]"
        slides-per-view="1"
        autoplay-delay="1000"
      >
      // Sample code for advanced swiper options:
      <script type="application/json" data-json-params>
          {
            "breakpoints": {
              "767": {
                "slidesPerView": "2"
              }
            }
          }
        </script>
        {%- for item in section.blocks -%}
          <swiper-slide class="announcement-bar__slide">Item</swiper-slide>
        {%- endfor -%}
      </swiper-container>
    <button type="button" data-announcement-bar-next>Next</button>
  </swiper-loader>
 */

import { register } from "swiper/element/bundle";

register();

const attributes = {
  loadedClass: "loaded-class", // class to be added after swiper is initialized
  jsonParams: "data-json-params",
  jsLike: "data-js-like",
};

class SwiperLoader extends HTMLElement {
  constructor() {
    super();
    this.$swipers = this.querySelectorAll("swiper-container");
  }

  connectedCallback() {
    this.initSwipers();
  }

  initSwipers() {
    this.$swipers.forEach(async ($swiper) => {
      let $jsonScript = $swiper.querySelector(`[${attributes.jsonParams}]`);

      let jsonParams = {};
      try {
        if ($jsonScript) {
          jsonParams = $jsonScript.hasAttribute(attributes.jsLike)
            ? new Function(`return ${$jsonScript.innerHTML.trim()}`)()
            : JSON.parse($jsonScript.innerHTML);
        }

        const params = {
          ...jsonParams,
        };

        Object.assign($swiper, params);

        $swiper.initialize();
      } catch (error) {
        console.log(error);
      }
    });

    this.hasAttribute(attributes.loadedClass) &&
      document.body.classList.add(this.getAttribute(attributes.loadedClass));
  }
}

customElements.define("swiper-loader", SwiperLoader);
