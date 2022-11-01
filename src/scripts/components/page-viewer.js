class PageViewer extends HTMLElement {
  DATA_SETS = {
    main: "data-viewer-default",
    block: "data-viewer-block",
    action: "data-viewer-action",
    visible: "data-viewer-visible",
  };

  /**
   * Creates an instance of PageViewer.
   * @memberof PageViewer
   */
  constructor() {
    super();
    const default_block = this.querySelector(
      `[${this.DATA_SETS.block}='${this.getAttribute(this.DATA_SETS.main)}']`
    );
    this.blocks = this.querySelectorAll(`[${this.DATA_SETS.block}]`);
    this.actions = this.querySelectorAll(`[${this.DATA_SETS.action}]`);

    /**
     * Shows block based on current url hash.
     */
    const location_hash = window.location.hash.substring(1);
    const hash_active_block = this.querySelector(
      `[${this.DATA_SETS.block}='${location_hash}']`
    );
    if (hash_active_block) {
      hash_active_block.setAttribute(this.DATA_SETS.visible, "");
      return;
    }

    /**
     * Shows first block in DOM if default is not defined.
     */
    if (!default_block) {
      if (!this.blocks || !this.blocks.length) {
        return console.error("<page-viewer/>: Page viewer blocks are missing.");
      }
      this.blocks[0].setAttribute(this.DATA_SETS.visible, "");
      return;
    }

    /**
     * Shows [data-viewer-default] defined block.
     */
    default_block.setAttribute(this.DATA_SETS.visible, "");
  }

  /**
   * Block action events (click).
   */
  connectedCallback() {
    const _self = this;
    this.actions.forEach((action) => {
      const action_target = action.getAttribute(this.DATA_SETS.action);
      if (!action_target) return;
      action.addEventListener("click", (e) => {
        e.preventDefault();
        _self.blocks.forEach((block) => {
          block.removeAttribute(this.DATA_SETS.visible);
        });
        _self
          .querySelector(`[${this.DATA_SETS.block}='${action_target}']`)
          .setAttribute(this.DATA_SETS.visible, "");
        window.location.hash = action_target;
      });
    });
  }
}
customElements.define("page-viewer", PageViewer);
