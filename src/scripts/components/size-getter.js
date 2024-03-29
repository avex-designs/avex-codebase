/**
 * Size-getter component is needed for calculating and setting height and width of inner elements measurements as css var to the html tag.
 *
 * Usage:
 * <size-getter name="header">
 *  <header></header>
 * </size-getter>
 *
 * Result:
 * <html class="js" lang="en" style="--header-height:66.3984px; --header-width:1187px">.....
 *
 */

class SizeGetter extends HTMLElement {
  constructor() {
    super();

    this.name = this.getAttribute("name");
  }

  connectedCallback() {
    if (!this.name) throw new Error("name attribute is mandatory");

    this.setSizes();
    this.resizeObserver = new ResizeObserver(this.setSizes.bind(this));
    this.resizeObserver.observe(this);
  }

  setSizes() {
    this.rect = this.getBoundingClientRect();

    document.documentElement.style.setProperty(
      `--${this.name}-height`,
      `${this.rect.height}px`
    );
    document.documentElement.style.setProperty(
      `--${this.name}-width`,
      `${this.rect.width}px`
    );
  }
}

customElements.define("size-getter", SizeGetter);
