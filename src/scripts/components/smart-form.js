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
      const validation = _self._setFormValidationRules();
      if (validation) {
        e.currentTarget.submit();
      } else {
        _self.$allFields.forEach(($formElement) =>
          this._setFieldValidationRules($formElement)
        );
      }
    });
  }

  setFieldListeners() {
    if (!this.$allFields || !this.$allFields.length) return;
    this.$allFields.forEach(($formElement) => {
      ["blur", "change", "input"].forEach((event) => {
        $formElement.addEventListener(event, () => {
          this._setFormValidationRules();
          this._setFieldValidationRules($formElement);
        });
      });
    });
  }

  _setFieldValidationRules($element) {
    $element.setAttribute("aria-invalid", !$element.checkValidity());
    this._validateFormPasswords(true);
  }

  _setFormValidationRules() {
    let isInvalid = 1;
    isInvalid *= this._validateFormHTML();
    isInvalid *= this._validateFormPasswords();

    this.$form.setAttribute("data-invalid", isInvalid === 0);
    return isInvalid === 1;
  }

  _validateFormHTML() {
    return this.$allFields.some(($input) => !$input.checkValidity()) ? 0 : 1;
  }

  _validateFormPasswords(setAria = false) {
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
