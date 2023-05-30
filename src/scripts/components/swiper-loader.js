/**
 * Sample code:
 * 
  <swiper-loader modules="Navigation,Autoplay" loaded-class="announcement-bar-slide-inited">
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
 * 
 * Modules injection:
 * You can already find pre-defined swiper modules inside src/scripts/components folder: swiper-autoplay.js, swiper-mousewheel.js and etc.
 * These are separated into different files in order to ensure module load of each feature as needed on page. Feel free to add new module by following the same pattern.
 */

import { loadJS } from "../helpers";
import { register } from "swiper/element";

// register Swiper custom elements
register();

const attributes = {
  modules: "modules", // use that attribute to include required swiper module e.g [modules="Navigation,Thumbs"]
  loadedClass: "loaded-class", // class to be added after swiper is initialized
  jsonParams: "data-json-params",
};

class SwiperLoader extends HTMLElement {
  constructor() {
    super();

    this.modules = {};
    this.modulesToBeLoaded = (
      this.hasAttribute(attributes.modules)
        ? this.getAttribute(attributes.modules).split(",")
        : []
    ).map((m) => `swiper-${m.toLowerCase()}`);
    this.$swipers = this.querySelectorAll("swiper-container");
  }

  async connectedCallback() {
    // Init swiper modules
    await this.initModules();
    this.initSwipers();
  }

  initSwipers() {
    this.$swipers.forEach(async ($swiper) => {
      let $jsonScript = $swiper.querySelector(`[${attributes.jsonParams}]`);
      let jsonParams = {};
      try {
        if ($jsonScript) {
          jsonParams = JSON.parse($jsonScript.innerHTML);
        }
      } catch (error) {
        throw new Error("Error: ", error?.message);
      }
      const params = {
        modules: Object.values(this.modules).map((x) => x),
        ...jsonParams,
      };

      Object.assign($swiper, params);

      $swiper.initialize();
    });

    this.hasAttribute(attributes.loadedClass) &&
      document.body.classList.add(this.getAttribute(attributes.loadedClass));
  }

  async initModules() {
    for (let i = 0; i < this.modulesToBeLoaded.length; i++) {
      this.modules[this.modulesToBeLoaded[i]] = await this.getSwiperModule(
        this.modulesToBeLoaded[i]
      );
    }
  }

  async getSwiperModule(name) {
    if (!(name in window))
      window.components[name] &&
        (await loadJS(window.components[name], ($script) =>
          $script.setAttribute("data-module", name)
        ));

    return window[name];
  }
}

customElements.define("swiper-loader", SwiperLoader);
