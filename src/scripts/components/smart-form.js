/**
 *
 * [TODO] ADD DESC HERE!!!!
 */

class SmartForm extends HTMLElement {
  constructor() {
    super();
    const $form = this.querySelector("form");
    if (!$form) throw new Error("[SmartForm] Form not found");

    this.$form = $form;
    this.$allFields = Array.from(
      $form.querySelectorAll("input, textarea, select")
    );
    this.$submitButton = Array.from($form.querySelectorAll("[type='submit']"));

    this.setFieldListeners();
    this.setSubmitListener();
  }

  setSubmitListener() {
    const _self = this;
    this.$form.addEventListener("submit", (e) => {
      e.preventDefault();
      const validation = _self.#setFormValidationRules();
      if (validation) {
        e.currentTarget.submit();
      } else {
        _self.$allFields.forEach(($formElement) =>
          this.#setFieldValidationRules($formElement)
        );
      }
    });
  }

  setFieldListeners() {
    if (!this.$allFields || !this.$allFields.length) return;
    this.$allFields.forEach(($formElement) => {
      ["blur", "change", "input"].forEach((event) => {
        $formElement.addEventListener(event, () => {
          this.#setFormValidationRules();
          this.#setFieldValidationRules($formElement);
        });
      });
    });
  }

  #setFieldValidationRules($element) {
    $element.setAttribute("aria-invalid", !$element.checkValidity());
    this.#validateFormPasswords(true);
  }

  #setFormValidationRules() {
    let isInvalid = 1;
    isInvalid *= this.#validateFormHTML();
    isInvalid *= this.#validateFormPasswords();

    this.$form.setAttribute("data-invalid", isInvalid === 0);
    return isInvalid === 1;
  }

  #validateFormHTML() {
    return this.$allFields.some(($input) => !$input.checkValidity()) ? 0 : 1;
  }

  #validateFormPasswords(setAria = false) {
    let notEqual = false;
    const confirmPwdField = this.$form.querySelector(
      "input[name='customer[password_confirmation]']"
    );

    if (confirmPwdField && confirmPwdField.value !== "") {
      const pwdField = this.$form.querySelector(
        "input[name='customer[password]']"
      );
      notEqual = pwdField.value !== confirmPwdField.value;
      if (notEqual && setAria) {
        confirmPwdField.setAttribute("aria-invalid", true);
      }
    }
    return notEqual ? 0 : 1;
  }
}

customElements.define("smart-form", SmartForm);
