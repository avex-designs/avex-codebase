const ELEMENT_NAME = "custom-select";

const attributes = {
  placeholder: "placeholder",
  optionValue: `data-${ELEMENT_NAME}-option-value`,
  optionValueLowerCase: `data-${ELEMENT_NAME}-option-value-lowercase`,
  optionIndex: `data-${ELEMENT_NAME}-option-index`,
  optionSelected: `data-${ELEMENT_NAME}-option-selected`,
  stateSelected: `data-${ELEMENT_NAME}-selected`,
};

class CustomSelect extends HTMLElement {
  constructor() {
    super();

    this.$select = this.querySelector("select");
    if (!this.$select)
      throw new Error(
        `[${ELEMENT_NAME}] [Custom select must contain real select element]`
      );
    this.$select.setAttribute("hidden", true);

    this.setAttribute("tabindex", "0");

    this.$options = Array.from(this.$select.querySelectorAll("option"));
    this.selectedOption = this.$options.find(($option) => $option.selected);
    this.placeholder = this.getAttribute(attributes.placeholder);
    this.$selectedOption = null;
    this.$currentOption = null;
    this.pressedKey = "";

    this.renderSelect();
    this.addEventListener("click", this.onClick);
    // this.mutationObserver = new MutationObserver(this.onMutate.bind(this));
    this.mutationObserver = new MutationObserver(this.renderSelect.bind(this));

    this.mutationObserver.observe(this.$select, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    this.$select.addEventListener("keyup", this.onSelectKeyUp.bind(this));
    this.addEventListener("keyup", this.onKeyUp.bind(this));

    this.addEventListener("focusout", (event) => {
      if (!this.contains(event.relatedTarget)) {
        this.close();
      }
    });
  }

  onSelectKeyUp(e) {
    if (!e) {
      e = window.event;
    }
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      // A to Z
      e.returnValue = false;
      e.cancel = true;
    }
  }

  onKeyUp(evt) {
    evt.stopPropagation();
    if (!this.$optionsList) return;
    if (evt.keyCode > 90 || evt.keyCode < 48) return;

    this.pressedKey += evt.key;

    const $foundOption = this.$optionsList.querySelector(
      `li[${
        attributes.optionValueLowerCase
      }^="${this.pressedKey.toLowerCase()}"]`
    );

    if (!$foundOption) return;

    $foundOption.focus();
    this.$optionsList.scrollTop = $foundOption.offsetTop;

    setTimeout(() => {
      this.pressedKey = "";
    }, 400);
  }

  // onMutate(mutationList) {
  //   for (const mutation of mutationList) {
  //     if (mutation.type === "childList") {
  //       this.renderSelect();
  //       break;
  //     }
  //   }
  // }

  renderSelect() {
    this.$options = Array.from(this.$select.querySelectorAll("option"));
    this.selectedOption = this.$options.find(($option) => $option.selected);
    this.querySelector("select ~ ul")?.remove();
    this.querySelector("select ~ div")?.remove();
    this.$optionsList = document.createElement("ul");
    this.$currentOption = document.createElement("div");

    this.$currentOption.textContent =
      this.$select.selectedIndex > 0
        ? this.selectedOption?.textContent
        : this.placeholder;
    this.$options.forEach(($option, i) => {
      const $li = document.createElement("li");

      $li.className = $option.className;
      $li.textContent = $option.textContent;
      $li.setAttribute(attributes.optionValue, $option.value);
      $li.setAttribute(
        attributes.optionValueLowerCase,
        $option.value.toLowerCase()
      );
      $li.setAttribute(attributes.optionIndex, i);
      $li.setAttribute("tabindex", "0");

      if ($option.disabled) $li.setAttribute("disabled", true);
      if ($option.hidden) $li.setAttribute("hidden", true);

      if ($option.selected) {
        $li.setAttribute(attributes.optionSelected, true);
        this.$selectedOption = $li;
        this.$currentOption.textContent = $option.textContent;
      }

      this.$optionsList.appendChild($li);
    });

    this.$select.insertAdjacentElement("afterend", this.$optionsList);
    this.$select.insertAdjacentElement("afterend", this.$currentOption);
    this.toggleAttribute(
      attributes.stateSelected,
      !this.$select.value.includes("reset")
    );
  }

  close() {
    this.removeAttribute("open");
  }

  onClick(evt) {
    this.toggleAttribute("open");

    const $target = evt.target;

    if (!$target.hasAttribute(attributes.optionValue)) return;

    this.$selectedOption.removeAttribute(attributes.optionSelected);
    this.$selectedOption = $target;
    this.$selectedOption.setAttribute(attributes.optionSelected, true);
    this.$currentOption.textContent = this.$selectedOption.textContent;

    this.$select.selectedIndex = this.$selectedOption.getAttribute(
      attributes.optionIndex
    );
    this.$select.dispatchEvent(new Event("change", { bubbles: true }));

    this.toggleAttribute(
      attributes.stateSelected,
      !this.$select.value.includes("reset")
    );
  }
}

customElements.define(ELEMENT_NAME, CustomSelect);
