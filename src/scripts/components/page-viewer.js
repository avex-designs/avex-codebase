/**
 * Page-viewer component is needed to show/hide sections or pages via JS, simulating pages via JS. Similar to Forgot password page in Login.
 *
 * Usage:
 * 1. Sample html structure
 * <page-viewer data-page-viewer-default="login">
 *  <div data-page-viewer-block="recover">
 *    Recover form.
 *    <a href="#login" data-page-viewer-action="login">Cancel</a>
 *  </div>
 *  <div data-page-viewer-block="login">
 *    Login form
 *    <a href="#recover" data-page-viewer-action="recover">Recover password form</a>
 *  </div
 * </page-viewer>
 * 2. Sample css:
 *  [data-page-viewer-block] {
 *    display: none;
 *  }
 *
 *  [data-page-viewer-visible] {
 *    display: block;
 *   }
 *
 * Actions:
 * 1. On click it will add [data-page-viewer-visible] attribute to the block tha should be visible.
 * 2. Feel free to add css to show/hude the block.
 * 3. Use [data-page-viewer-default] attribute to define default block to show, otherwise it is going to show first in order [data-page-viewer-block] element in DOM.
 * 4. It can also read location hash and show block based on has value. Ex: https://mystore.com/#recover, will show recover form.
 *
 */

class PageViewer extends HTMLElement {
  DATA_SETS = {
    main: "data-page-viewer-default",
    block: "data-page-viewer-block",
    action: "data-page-viewer-action",
    visible: "data-page-viewer-visible",
  };

  /**
   * Creates an instance of PageViewer.
   * @memberof PageViewer
   */
  constructor() {
    super();
    const $defaultBlock = this.querySelector(
      `[${this.DATA_SETS.block}='${this.getAttribute(this.DATA_SETS.main)}']`
    );
    this.$blocks = this.querySelectorAll(`[${this.DATA_SETS.block}]`);
    this.$actions = this.querySelectorAll(`[${this.DATA_SETS.action}]`);

    /**
     * Shows block based on current url hash.
     */
    const locationHash = window.location.hash.substring(1);
    const $hashActiveBlock = this.querySelector(
      `[${this.DATA_SETS.block}='${locationHash}']`
    );
    if ($hashActiveBlock) {
      $hashActiveBlock.setAttribute(this.DATA_SETS.visible, "");
      return;
    }

    /**
     * Shows first block in DOM if default is not defined.
     */
    if (!$defaultBlock) {
      if (!this.$blocks || !this.$blocks.length) {
        return console.info("<page-viewer/>: Page viewer blocks are missing.");
      }
      this.$blocks[0].setAttribute(this.DATA_SETS.visible, "");
      return;
    }

    /**
     * Shows [data-viewer-default] defined block.
     */
    $defaultBlock.setAttribute(this.DATA_SETS.visible, "");
  }

  /**
   * Block action events (click).
   */
  connectedCallback() {
    const _self = this;
    this.$actions.forEach((action) => {
      const actionTarget = action.getAttribute(this.DATA_SETS.action);
      if (!actionTarget) return;
      action.addEventListener("click", (e) => {
        e.preventDefault();
        _self.$blocks.forEach((block) => {
          block.removeAttribute(this.DATA_SETS.visible);
        });
        _self
          .querySelector(`[${this.DATA_SETS.block}='${actionTarget}']`)
          .setAttribute(this.DATA_SETS.visible, "");
        window.location.hash = actionTarget;
      });
    });
  }
}
customElements.define("page-viewer", PageViewer);
