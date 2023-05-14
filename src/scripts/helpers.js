export const getShopifySection = ($element) => {
  const sectionPrefix = "shopify-section-";
  const $section = $element.closest(`[id^="${sectionPrefix}"]`);
  if (!$section) return [null, null];
  const sectionId = $section.id.replace(sectionPrefix, "");
  return [sectionId, $section];
};

export const toggleClassFromAttribute = ($context, attributeName, on) => {
  $context.querySelectorAll(`[${attributeName}]`).forEach(($element) => {
    const className = $element.getAttribute(attributeName);
    if (className) {
      if (on) $element.classList.add(className);
      else $element.classList.remove(className);
    }
  });
};

export const isInViewport = (elem) => {
  const bounding = elem && elem.getBoundingClientRect();
  return bounding && bounding.top < window.innerHeight && bounding.bottom >= 0;
};

export function serializeForm(form) {
  let obj = {};
  let formData = new FormData(form);

  for (let key of formData.keys()) {
    obj[key] = formData.get(key);
  }

  return obj;
}

export function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

export function parseTag(url) {
  const regex = /[^/]+$/;
  return url.match(regex)[0];
}

export function getCollectionUrl(url) {
  const regex = /\/\S+\//;
  return url.match(regex)[0];
}

export function swiperArrows(_this, mobile_limit, desktop_limit) {
  if (
    _this.el.querySelector(".swiper-button-prev") &&
    _this.el.querySelector(".swiper-button-next")
  ) {
    if (
      window.matchMedia("(max-width: 767px)").matches &&
      _this.slides.length <= mobile_limit
    ) {
      _this.allowSlidePrev = _this.allowSlideNext = false;
      _this.el.querySelector(".swiper-button-prev").style.display = "none";
      _this.el.querySelector(".swiper-button-next").style.display = "none";
    } else if (
      window.matchMedia("(min-width: 768px)").matches &&
      _this.slides.length <= desktop_limit
    ) {
      _this.allowSlidePrev = _this.allowSlideNext = false;
      _this.el.querySelector(".swiper-button-prev").style.display = "none";
      _this.el.querySelector(".swiper-button-next").style.display = "none";
    } else {
      _this.allowSlidePrev = _this.allowSlideNext = true;
      _this.el.querySelector(".swiper-button-prev").style.display =
        "inline-flex";
      _this.el.querySelector(".swiper-button-next").style.display =
        "inline-flex";
    }
  }
}
