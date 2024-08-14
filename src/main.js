window.Webflow ||= [];
window.Webflow.push(async () => {
  let isApiDataReady = false;
  /*** FORM VALIDATION ***/
  const validationRules = {
    "#First-Name": validateNameField,
    "#Last-Name": validateNameField,
    "#Street-Address": validateAddressField,
    "#City": validateAddressField,
    "#State-of-residence": validateDropdown,
    "#ZIP-Code": validateAddressField,
    "#Income-Amount": validateIncomeField,
    "#DOB": validateDOB,
    "#Phone-Number": validatePhoneField,
    '[form-field="dropdown"]': validateDropdown,
    "input[required]": validateRequiredField,
  };

  /**
   * Validates a form field based on a validation function.
   * @param {HTMLElement} formField - The form field element to validate.
   * @param {Function} validationFunc - The validation function to apply.
   * @returns {boolean} True if the field is valid, false otherwise.
   */
  function validateField(formField, validationFunc) {
    const isValid = validationFunc(formField);
    const errorMessage = formField
      .closest(".form-field_item")
      .querySelector('[data-text="error-message"]');

    if (isValid) {
      errorMessage.style.display = "none";
    } else {
      errorMessage.style.display = "block";
    }

    return isValid;
  }

  /**
   * Validates a form step.
   * @param {HTMLElement} formStep - The form step element to validate.
   * @returns {boolean} True if the step is valid, false otherwise.
   */
  function validateStep(formStep) {
    if (formStep.querySelector(".radar-field")) {
      console.log("Validating address step");
      return validateAddressStep(formStep);
    }

    const formFields = formStep.querySelectorAll(".form-field");
    const radioButtons = formStep.querySelectorAll('input[type="radio"]');
    let isValid = true;

    formFields.forEach((field) => {
      const validationFunc = getValidationFunc(field);
      if (validationFunc && !validateField(field, validationFunc)) {
        isValid = false;
      }
    });

    // Validate radio buttons
    if (radioButtons.length > 0 && !validateRadioButtons(radioButtons)) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validates an address form step.
   * @param {HTMLElement} formStep - The form step element to validate.
   * @returns {boolean} True if the step is valid, false otherwise.
   */
  function validateAddressStep(formStep) {
    const formFields = formStep.querySelectorAll(".form-field");
    let isValid = true;

    // Check if an address has been selected from Radar
    if (!isAddressSelected) {
      isValid = false;
    }

    // Check if all fields are populated
    formFields.forEach((field) => {
      if (field.value.trim() === "") {
        isValid = false;
      }
    });

    // Validate each form field
    formFields.forEach((field) => {
      const validationFunc = getValidationFunc(field);
      if (validationFunc && !validateField(field, validationFunc)) {
        isValid = false;
      }
    });
    return isValid;
  }

  /**
   * Store State Groups to URL Mappings
   */

  const stateRedirects = {
    "/thank-you-debtcom": [
      "Alaska",
      "Alabama",
      "Arkansas",
      "Arizona",
      "California",
      "District of Columbia",
      "Florida",
      "Indiana",
      "Massachusetts",
      "Maryland",
      "Michigan",
      "Missouri",
      "Mississippi",
      "North Carolina",
      "Nebraska",
      "New Mexico",
      "New York",
      "Oklahoma",
      "South Dakota",
      "Texas",
      "Washington",
      "Wisconsin",
    ],
  };

  /**
   * Returns the validation function for a form field based on its selector.
   * @param {HTMLElement} formField - The form field element.
   * @returns {Function|null} The validation function or null if not found.
   */
  function getValidationFunc(formField) {
    for (const selector in validationRules) {
      if (formField.matches(selector)) {
        return validationRules[selector];
      }
    }
    return null;
  }

  /**
   * Validates a required field.
   * @param {HTMLElement} requiredField - The required field element to validate.
   * @returns {boolean} True if the required field is filled out, false otherwise.
   */
  function validateRequiredField(requiredField) {
    return requiredField.value.trim() !== "";
  }

  /**
   * Validates a dropdown field.
   * @param {HTMLElement} dropdown - The dropdown element to validate.
   * @returns {boolean} True if the dropdown is valid, false otherwise.
   */
  function validateDropdown(dropdown) {
    const firstOption = dropdown.options[0].value;

    return dropdown.value !== firstOption;
  }

  /**
   * Validates a name field.
   * @param {HTMLElement} nameField - The name field element to validate.
   * @returns {boolean} True if the name field is valid, false otherwise.
   */
  function validateNameField(nameField) {
    const value = nameField.value.trim();
    const regex = /^[A-Za-z]{3,}$/;
    return regex.test(value);
  }

  /**
   * Validates an address field.
   * @param {HTMLElement} addressField - The address field element to validate.
   * @returns {boolean} True if the address field is valid, false otherwise.
   */
  function validateAddressField(addressField) {
    return true;
  }

  /**
   * Validates an income field.
   * @param {HTMLElement} incomeField - The income field element to validate.
   * @returns {boolean} True if the income field is valid, false otherwise.
   */
  function validateIncomeField(incomeField) {
    const value = incomeField.value.trim().replace(/,/g, "");
    const regex = /^\d{4,}$/;
    return regex.test(value);
  }

  /**
   * Validates a phone field.
   * @param {HTMLElement} phoneField - The phone field element to validate.
   * @returns {boolean} True if the income field is valid, false otherwise.
   */
  function validatePhoneField(phoneField) {
    const value = phoneField.value.trim().replace(/[\(\)-\s]/g, "");

    // Check if the phone number has exactly 10 digits
    return value.length === 10;
  }

  /**
   * Validates a group of radio buttons.
   * @param {NodeListOf<HTMLInputElement>} radioButtons - The radio buttons to validate.
   * @returns {boolean} True if at least one radio button is selected, false otherwise.
   */
  function validateRadioButtons(radioButtons) {
    let isSelected = false;
    radioButtons.forEach((radioButton) => {
      if (radioButton.checked) {
        isSelected = true;
      }
    });
    return isSelected;
  }

  /**
   * Validates the Date of Birth to ensure the user is 18 years or older.
   * @param {HTMLElement} dobField - The date of birth input field element to validate.
   * @returns {boolean} True if the user is 18 or older, false otherwise.
   */
  function validateDOB(dobField) {
    const dobValue = dobField.value.trim().replace(/\D/g, "");

    if (dobValue.length !== 8) {
      return false;
    }

    const month = parseInt(dobValue.slice(0, 2), 10);
    const day = parseInt(dobValue.slice(2, 4), 10);
    const year = parseInt(dobValue.slice(4), 10);

    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      return false;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }

    const dob = new Date(year, month - 1, day);
    const today = new Date();
    const ageDiffMs = today - dob;
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    return age >= 18;
  }

  /*** BUTTON FUNCTIONALITY ***/
  /**
   * Toggles the state of the next button in a form step.
   * @param {HTMLElement} formStep - The form step element.
   */
  function toggleNextButton(formStep) {
    const nextButton = formStep.querySelector('[data-button="next"]');
    const isValid = validateStep(formStep);

    if (nextButton) {
      nextButton.style.pointerEvents = "none";
      if (isValid) {
        activateButton(nextButton);
        nextButton.classList.add("is-active");
      } else {
        deactivateButton(nextButton);
        nextButton.classList.remove("is-active");
      }
    }
  }

  /**
   * Activates a button by removing the 'disabled' class and adjusting its style.
   * @param {HTMLElement} button - The button element to activate.
   */
  function activateButton(button) {
    if (button) {
      button.classList.remove("disabled");
      button.style.pointerEvents = "auto";
      button.style.opacity = "1";
    }
  }

  /**
   * Deactivates a button by adding the 'disabled' class and adjusting its style.
   * @param {HTMLElement} button - The button element to deactivate.
   */
  function deactivateButton(button) {
    if (button) {
      button.classList.add("disabled");
      button.style.pointerEvents = "none";
      button.style.opacity = "0.5";
    }
  }

  /*** EVENT LISTENERS ***/
  const formSteps = document.querySelectorAll('[data-form="step"]');

  // Hide all form steps initially
  formSteps.forEach((step) => {
    step.style.display = "none";
  });

  // Update the progress bar
  function updateProgress(currentStep, totalSteps) {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const progressLine = document.querySelector(".progress-line");
    progressLine.style.width = progress + "%";
  }

  // Get the total number of steps
  const totalSteps = document.querySelectorAll('[data-form="step"]').length;

  // Set the progress bar to step 1
  updateProgress(1, totalSteps);

  // Show the first form step
  const firstStep = formSteps[0];
  firstStep.style.display = "flex";

  /**
   * FORM SUBMISSION LISTENER
   */
  const form = document.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Helper function to format phone number for API
    function formatPhoneNumberForAPI(phoneNumber) {
      const cleaned = ("" + phoneNumber).replace(/\D/g, "");
      const trimmed = cleaned.substring(0, 10);
      return `+1${trimmed}`;
    }

    // Helper function to format date of birth for API
    function formatDateOfBirthForAPI(dob) {
      const [month, day, year] = dob.split("-");
      return `${year}-${month}-${day}`;
    }

    // Collect form data for API
    const formData = {
      first_name: document.getElementById("First-Name").value || "",
      last_name: document.getElementById("Last-Name").value || "",
      email: document.getElementById("Email")
        ? document.getElementById("Email").value || ""
        : "",
      phone: document.getElementById("Phone-Number")
        ? formatPhoneNumberForAPI(
            document.getElementById("Phone-Number").value || ""
          )
        : "",
      dob: formatDateOfBirthForAPI(document.getElementById("DOB").value || ""),
      address: {
        street: document.getElementById("Street-Address").value || "",
        city: document.getElementById("City").value || "",
        state: document.getElementById("State-of-residence").value || "",
        zipcode: document.getElementById("ZIP-Code").value || "",
      },
      website: window.location.origin || "",
    };

    console.log("Submitting form data:", formData); // Log the form data for debugging

    try {
      const response = await fetch(
        "https://mlr-dev-dc.netlify.app/.netlify/functions/credit-api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const { result, zapierResult } = await response.json();
      console.log("Credit API response:", result);
      console.log("Zapier response:", zapierResult);

      // Update hidden fields
      document.getElementById("balance_unsecured_accounts").value =
        result.balance_unsecured_accounts?.max?.toString() || "";
      document.getElementById("balance_unsecured_credit_cards").value =
        result.balance_unsecured_credit_cards?.max?.toString() || "";
      document.getElementById("creditScore").value =
        result.creditScore?.max?.toString() || "";

      // Push data to Google Tag Manager
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "creditFormSubmission",
        balance_unsecured_accounts:
          result.balance_unsecured_accounts?.max || "N/A",
        balance_unsecured_credit_cards:
          result.balance_unsecured_credit_cards?.max || "N/A",
        creditScore: result.creditScore?.max || "N/A",
        formData: formData,
      });

      // Determine redirection based on credit card balance
      if (result.balance_unsecured_credit_cards?.max > 9999) {
        window.dataLayer.push({
          event: "custom_conversion",
          event_category: "engagement",
          event_label: "High Unsecured Credit Card Balance",
        });
        window.location.href = "/thank-you-debtcom";
      } else {
        window.dataLayer.push({
          event: "custom_conversion",
          event_category: "engagement",
          event_label: "Low Unsecured Credit Card Balance",
        });
        window.location.href = "/thank-you-cc";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  /**
   * Form Field Listeners
   */

  formSteps.forEach((step) => {
    const formFields = step.querySelectorAll(".form-field");

    formFields.forEach((field) => {
      field.addEventListener("input", () => {
        toggleNextButton(step);
      });

      field.addEventListener("change", () => {
        toggleNextButton(step);
      });
    });

    // Check if the step has the data-radio-step attribute
    if (step.hasAttribute("data-radio-step")) {
      const radioButtons = step.querySelectorAll(
        'input[type="radio"]:not([data-link-out])'
      );

      const nextButton = step.querySelector('[data-button="next"]');

      if (nextButton) {
        nextButton.style.display = "none";
      }

      radioButtons.forEach((radioButton) => {
        radioButton.addEventListener("click", () => {
          const nextButton = step.querySelector('[data-button="next"]');
          if (nextButton) {
            nextButton.click();

            const currentStepIndex = Array.from(formSteps).indexOf(step) + 2;
            const totalSteps = formSteps.length;
            updateProgress(currentStepIndex, totalSteps);
          }
        });
      });
    }

    // Find the next button within the current step
    const nextButton = step.querySelector('[data-button="next"]');

    if (nextButton) {
      nextButton.addEventListener("click", async (event) => {
        // Check if the current step has the data-step attribute set to "income"
        if (
          step.hasAttribute("data-step") &&
          step.getAttribute("data-step") === "income"
        ) {
          // Income step-specific logic
          const incomeField = step.querySelector("[data-income]");
          if (incomeField) {
            const incomeValue = parseFloat(incomeField.value.replace(/,/g, ""));
            if (incomeValue < 10000) {
              // Redirect to the specified URL
              const url = incomeField.getAttribute("data-income-link");
              window.location.href = url;
              return;
            }
          }
        }
        // Check if the current step has the data-twilio attribute
        if (step.hasAttribute("data-twilio")) {
          event.preventDefault();
          const phoneNumber = document.getElementById("Phone-Number").value;

          console.log("Validating phone number:", phoneNumber);

          try {
            const response = await fetch(
              `https://mlr-dev-dc.netlify.app/.netlify/functions/validate-phone?phoneNumber=${encodeURIComponent(phoneNumber)}`
            );
            const data = await response.json();
            console.log("Response data:", data);

            if (data.valid) {
              console.log("The phone number is a valid mobile number.");
              // Proceed to the next step
              const currentStep = step;
              const nextStep = currentStep.nextElementSibling;

              if (nextStep && nextStep.matches('[data-form="step"]')) {
                currentStep.style.display = "none";
                nextStep.style.display = "flex";
              }
              const currentStepIndex = Array.from(formSteps).indexOf(step) + 1;
              const totalSteps = formSteps.length;
              updateProgress(currentStepIndex, totalSteps);
            } else {
              console.warn(
                "The phone number is not a valid mobile number or an error occurred."
              );
              alert("Please enter a valid mobile phone number.");
            }
          } catch (error) {
            console.error("Error during fetch:", error);
            alert("An error occurred while validating the phone number.");
          }
        } else {
          // Validate the current form step
          const isValid = validateStep(step);

          if (isValid) {
            // If validation passes, hide the current step and display the next step
            const currentStep = step;
            const nextStep = currentStep.nextElementSibling;

            if (nextStep && nextStep.matches('[data-form="step"]')) {
              currentStep.style.display = "none";
              nextStep.style.display = "flex";
            }
            const currentStepIndex = Array.from(formSteps).indexOf(step) + 1;
            const totalSteps = formSteps.length;
            // Only update progress if it's not the first step
            updateProgress(currentStepIndex, totalSteps);
          } else {
            // If validation fails, prevent the default behavior of the button
            event.preventDefault();
            // Display an error message or take any other desired action
            console.log(
              "Validation failed. Please fill in all required fields."
            );
          }
        }
      });
    }

    // Find the back button within the current step
    const backButton = step.querySelector('[data-form="back-btn"]');
    const currentStepIndex = Array.from(formSteps).indexOf(step);

    if (currentStepIndex === 0) {
      // Hide back button on the first step
      if (backButton) {
        backButton.style.display = "none";
      }
    } else {
      // Show back button on subsequent steps
      if (backButton) {
        backButton.style.display = "flex"; // Make sure this is consistent with your CSS display settings for visible buttons
      }
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        // Hide the current step and display the previous step
        const currentStep = step;
        const previousStep = currentStep.previousElementSibling;

        if (previousStep && previousStep.matches('[data-form="step"]')) {
          currentStep.style.display = "none";
          previousStep.style.display = "flex";
        }

        //Progress bar update
        const currentStepIndex =
          Array.from(formSteps).indexOf(previousStep) + 1;
        const totalSteps = formSteps.length;
        updateProgress(currentStepIndex, totalSteps);
      });
    }
  });

  /*** LINK OUT FUNCTIONALITY ***/
  function handleLinkOutClick(event) {
    event.preventDefault();
    const url = event.target.dataset.linkOut;
    window.location.href = url;
  }

  const linkOutElements = document.querySelectorAll("[data-link-out]");

  linkOutElements.forEach((element) => {
    const url = element.dataset.linkOut;
    if (url) {
      element.addEventListener("click", handleLinkOutClick);
    }
  });

  /*** INCOME FORMATTING ***/
  const incomeInput = document.getElementById("Income-Amount");

  /**
   * Formats a number with commas as thousands separators.
   * @param {string} number - The number to format.
   * @returns {string} The formatted number.
   */
  function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function handleIncomeInputChange(event) {
    const inputValue = event.target.value.replace(/,/g, "");
    const formattedValue = formatNumber(inputValue);
    event.target.value = formattedValue;
  }

  incomeInput.addEventListener("input", handleIncomeInputChange);

  /*** PHONE FORMATTING ***/
  /**
   * Formats a string as a phone number.
   * @param {string} number - The string to format.
   * @returns {string} The formatted string.
   */
  // Formats a string as a phone number.
  function formatPhoneNumber(number) {
    // Remove all non-digit characters
    number = number.replace(/\D/g, "");

    // Ensure the number is trimmed to 10 digits maximum
    number = number.substring(0, 10);

    // Format the number if it has at least 3 digits
    if (number.length >= 6) {
      return number.replace(/(\d{3})(\d{3})(\d{1,4})/, "($1)-$2-$3");
    } else if (number.length >= 3) {
      return number.replace(/(\d{3})(\d{1,3})/, "($1)-$2");
    } else {
      return number;
    }
  }

  function handlePhoneInputChange(event) {
    // Format the input value as a phone number
    event.target.value = formatPhoneNumber(event.target.value);
  }

  // Define phoneInputs
  const phoneInputs = document.querySelectorAll("[data-phone]");

  // Add the event listener to all phone inputs
  phoneInputs.forEach((input) => {
    input.addEventListener("input", handlePhoneInputChange);
  });

  /**
   * Formats a string as a date in the format mm-dd-yyyy.
   * @param {string} dateString - The string to format.
   * @returns {string} The formatted string.
   */
  function formatDateString(dateString) {
    dateString = dateString.replace(/\D/g, "");

    if (dateString.length > 8) {
      dateString = dateString.slice(0, 8);
    }

    if (dateString.length > 2) {
      dateString = dateString.slice(0, 2) + "-" + dateString.slice(2);
    }
    if (dateString.length > 5) {
      dateString = dateString.slice(0, 5) + "-" + dateString.slice(5, 9);
    }

    return dateString;
  }

  function handleDOBInputChange(event) {
    const formattedDateString = formatDateString(event.target.value);
    event.target.value = formattedDateString;

    const isValid = validateDOB(event.target); // Pass the element to validateDOB
    const errorMessage = event.target
      .closest(".form-field_item")
      .querySelector('[data-text="error-message"]');

    if (isValid) {
      errorMessage.style.display = "none";
    } else {
      errorMessage.style.display = "block";
    }
  }

  const dobInput = document.getElementById("DOB");
  dobInput.addEventListener("input", handleDOBInputChange);

  /*** ADDRESS AUTOCOMPLETE ***/
  let isAddressSelected = false;
  Radar.initialize("prj_live_pk_9a04f6bab292b47ffdad877f7bd7d63fa6d2bc54");

  function initAutocomplete() {
    const addressInput = document.getElementById("Street-Address");
    const cityInput = document.getElementById("City");
    const stateInput = document.getElementById("State-of-residence");
    const zipInput = document.getElementById("ZIP-Code");
    const nextButton = document.querySelector('[data-form="next-btn"]');
    const element = document.getElementById("autocomplete-container");

    if (element) {
      Radar.ui.autocomplete({
        container: "Street-Address",
        responsive: true,
        minCharacters: 2,
        debounceMS: 0,
        onSelection: (address) => {
          updateAddressFields(
            address,
            addressInput,
            cityInput,
            stateInput,
            zipInput
          );
          activateButton(nextButton);
          isAddressSelected = true;

          // Manually hide the autocomplete container
          const autocompleteContainer = document.querySelector(
            "radar-autocomplete-wrapper"
          );
          if (autocompleteContainer) {
            autocompleteContainer.style.display = "none";
            console.log("Autocomplete container hidden");
          }
          addressInput.dispatchEvent(new Event("focusout"));
        },
      });
    }
  }

  function updateAddressFields(
    address,
    addressInput,
    cityInput,
    stateInput,
    zipInput
  ) {
    addressInput.value = "";
    cityInput.value = "";
    stateInput.value = "";
    zipInput.value = "";

    if (address.number && address.street) {
      addressInput.value = `${address.number} ${address.street}`;
    } else {
      addressInput.value = "";
    }

    cityInput.value = address.city || "";
    stateInput.value = address.state || "";
    zipInput.value = address.postalCode || "";
    // addressInput.dispatchEvent(new Event("input"));
    // cityInput.dispatchEvent(new Event("input"));
    // stateInput.dispatchEvent(new Event("input"));
    zipInput.dispatchEvent(new Event("input"));
  }

  initAutocomplete();

  document
    .querySelectorAll("#Street-Address, #City, #State-of-residence, #ZIP-Code")
    .forEach((field) => {
      field.addEventListener("input", () => {
        isAddressSelected = true;
      });
    });
  const nextButtons = document.querySelectorAll(".form-next_btn");
  nextButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!isAddressSelected) {
        event.preventDefault();
        deactivateButton(button);
      }
    });
  });
});
