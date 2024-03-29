class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    this.addEventListener("click", (event) => {
      if (
        event.target.nodeName === "MODAL-DIALOG" ||
        event.target.classList.contains("ModalClose")
      ) {
        this.hide();
      }
    });
  }

  show(opener) {
    this.openedBy = opener;
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
  }

  hide() {
    document.body.classList.remove("overflow-hidden");
    this.removeAttribute("open");
  }
}
customElements.define("modal-dialog", ModalDialog);
