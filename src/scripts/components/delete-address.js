class DeleteAddress extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const confirm_msg = this.getAttribute("data-message");
    const form = this.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!confirm_msg) return;
      const is_confirmed = confirm(confirm_msg);
      if (is_confirmed) {
        form.submit();
      }
    });
  }
}
customElements.define("delete-address", DeleteAddress);
