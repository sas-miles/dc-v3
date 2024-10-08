(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/main.js
  window.Webflow ||= [];
  window.Webflow.push(async () => {
    const validationRules = {
      "#First-Name": validateNameField,
      "#Last-Name": validateNameField,
      "#Street-Address": validateAddressField,
      "#City": validateAddressField,
      "#State-of-residence": validateDropdown,
      "#ZIP-Code": validateAddressField,
      // "#Income-Amount": validateIncomeField,
      "#DOB": validateDOB,
      "#Phone-Number": validatePhoneField,
      '[form-field="dropdown"]': validateDropdown,
      "input[required]": validateRequiredField
    };
    function validateField(formField, validationFunc) {
      const isValid = validationFunc(formField);
      const errorMessage = formField.closest(".form-field_item").querySelector('[data-text="error-message"]');
      if (isValid) {
        errorMessage.style.display = "none";
      } else {
        errorMessage.style.display = "block";
      }
      return isValid;
    }
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
      if (radioButtons.length > 0 && !validateRadioButtons(radioButtons)) {
        isValid = false;
      }
      return isValid;
    }
    function validateAddressStep(formStep) {
      const formFields = formStep.querySelectorAll(".form-field");
      let isValid = true;
      if (!isAddressSelected) {
        isValid = false;
      }
      formFields.forEach((field) => {
        if (field.value.trim() === "") {
          isValid = false;
        }
      });
      formFields.forEach((field) => {
        const validationFunc = getValidationFunc(field);
        if (validationFunc && !validateField(field, validationFunc)) {
          isValid = false;
        }
      });
      return isValid;
    }
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
        "Wisconsin"
      ]
    };
    function getValidationFunc(formField) {
      for (const selector in validationRules) {
        if (formField.matches(selector)) {
          return validationRules[selector];
        }
      }
      return null;
    }
    function validateRequiredField(requiredField) {
      return requiredField.value.trim() !== "";
    }
    function validateDropdown(dropdown) {
      const firstOption = dropdown.options[0].value;
      return dropdown.value !== firstOption;
    }
    function validateNameField(nameField) {
      const value = nameField.value.trim();
      const regex = /^[A-Za-z]{3,}$/;
      return regex.test(value);
    }
    function validateAddressField(addressField) {
      return true;
    }
    function validatePhoneField(phoneField) {
      const value = phoneField.value.trim().replace(/[\(\)-\s]/g, "");
      return value.length === 10;
    }
    function validateRadioButtons(radioButtons) {
      let isSelected = false;
      radioButtons.forEach((radioButton) => {
        if (radioButton.checked) {
          isSelected = true;
        }
      });
      return isSelected;
    }
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
      const today = /* @__PURE__ */ new Date();
      const ageDiffMs = today - dob;
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age >= 18;
    }
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
    function activateButton(button) {
      if (button) {
        button.classList.remove("disabled");
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
      }
    }
    function deactivateButton(button) {
      if (button) {
        button.classList.add("disabled");
        button.style.pointerEvents = "none";
        button.style.opacity = "0.5";
      }
    }
    const formSteps = document.querySelectorAll('[data-form="step"]');
    formSteps.forEach((step) => {
      step.style.display = "none";
    });
    function updateProgress(currentStep, totalSteps2) {
      const progress = (currentStep - 1) / (totalSteps2 - 1) * 100;
      const progressLine = document.querySelector(".progress-line");
      progressLine.style.width = progress + "%";
    }
    const totalSteps = document.querySelectorAll('[data-form="step"]').length;
    updateProgress(1, totalSteps);
    const firstStep = formSteps[0];
    firstStep.style.display = "flex";
    function getQueryParams() {
      const params = {};
      const queryString = window.location.search.substring(1);
      const queryArray = queryString.split("&");
      queryArray.forEach((param) => {
        const [key, value] = param.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      });
      return params;
    }
    function populateHiddenFields(params) {
      const utmFields = {
        utm_medium: "channeldrilldown1",
        utm_source: "channeldrilldown2",
        utm_campaign: "channeldrilldown3",
        utm_content: "channeldrilldown4",
        s4: "channeldrilldown5",
        pid: "channeldrilldown6"
      };
      Object.entries(utmFields).forEach(([paramName, fieldName]) => {
        if (params.hasOwnProperty(paramName)) {
          const field = document.querySelector(`input[name="${fieldName}"]`);
          if (field) {
            let value = params[paramName];
            value = value.replace(
              /placement|campaign\.id|adset\.id|ad\.id|pid/g,
              "unknown"
            );
            field.value = value;
          }
        }
      });
    }
    const queryParams = getQueryParams();
    populateHiddenFields(queryParams);
    const form = document.getElementById("hero-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      function updateHiddenField(id, value) {
        const field = document.getElementById(id);
        if (field) {
          field.value = value;
        } else {
          console.warn(`Hidden field '${id}' not found`);
        }
      }
      function formatPhoneNumberForAPI(phoneNumber) {
        const cleaned = ("" + phoneNumber).replace(/\D/g, "");
        const trimmed = cleaned.substring(0, 10);
        return `+1${trimmed}`;
      }
      function formatDateOfBirthForAPI(dob) {
        const [month, day, year] = dob.split("-");
        return `${year}-${month}-${day}`;
      }
      const formData = {
        first_name: document.getElementById("First-Name").value || "",
        last_name: document.getElementById("Last-Name").value || "",
        email: document.getElementById("Email") ? document.getElementById("Email").value || "" : "",
        phone: document.getElementById("Phone-Number") ? formatPhoneNumberForAPI(
          document.getElementById("Phone-Number").value || ""
        ) : "",
        dob: formatDateOfBirthForAPI(document.getElementById("DOB").value || ""),
        address: {
          street: document.getElementById("Street-Address").value || "",
          city: document.getElementById("City").value || "",
          state: document.getElementById("State-of-residence").value || "",
          zipcode: document.getElementById("ZIP-Code").value || ""
        },
        website: window.location.origin || "",
        channeldrilldown1: document.querySelector('input[name="channeldrilldown1"]')?.value || "",
        channeldrilldown2: document.querySelector('input[name="channeldrilldown2"]')?.value || "",
        channeldrilldown3: document.querySelector('input[name="channeldrilldown3"]')?.value || "",
        channeldrilldown4: document.querySelector('input[name="channeldrilldown4"]')?.value || "",
        channeldrilldown5: document.querySelector('input[name="channeldrilldown5"]')?.value || "",
        channeldrilldown6: document.querySelector('input[name="channeldrilldown6"]')?.value || ""
      };
      console.log("Submitting form data:", formData);
      try {
        const response = await fetch(
          "https://credit-api.netlify.app/.netlify/functions/credit-api",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "API request failed");
        }
        const { result, zapierResult, error } = data;
        console.log("Credit API response:", result);
        console.log("Zapier response:", zapierResult);
        if (error) {
          console.error("Credit API error:", error);
        }
        updateHiddenField(
          "balance_unsecured_accounts",
          result?.balance_unsecured_accounts?.max?.toString() || ""
        );
        updateHiddenField(
          "balance_unsecured_credit_cards",
          result?.balance_unsecured_credit_cards?.max?.toString() || ""
        );
        updateHiddenField(
          "creditScore",
          result?.creditScore?.max?.toString() || ""
        );
        const balance = Number(result?.balance_unsecured_credit_cards?.max);
        const gtmData = {
          event: "creditFormSubmission",
          balance_unsecured_accounts: result?.balance_unsecured_accounts?.max || "N/A",
          balance_unsecured_credit_cards: balance || "N/A",
          creditScore: result?.creditScore?.max || "N/A",
          formData,
          api_error: error || "N/A",
          zapier_error: zapierResult.error || "N/A"
        };
        if (window.dataLayer) {
          window.dataLayer.push(gtmData);
        } else {
          console.warn("Google Tag Manager dataLayer not found");
        }
        const redirectUrlHigh = form.getAttribute("redirect-url-high");
        const redirectUrlLow = form.getAttribute("redirect-url-low");
        let redirectUrl;
        const highBalanceThreshold = 9999;
        if (!isNaN(balance) && balance > highBalanceThreshold) {
          redirectUrl = redirectUrlHigh;
          if (window.dataLayer) {
            window.dataLayer.push({
              event: "custom_conversion",
              event_category: "engagement",
              event_label: "High Unsecured Credit Card Balance",
              balance_unsecured_credit_cards: balance
            });
          }
        } else {
          redirectUrl = redirectUrlLow;
          if (window.dataLayer) {
            window.dataLayer.push({
              event: "custom_conversion",
              event_category: "engagement",
              event_label: "Low Unsecured Credit Card Balance",
              balance_unsecured_credit_cards: balance
            });
          }
        }
        performRedirect(redirectUrl || redirectUrlLow);
      } catch (error) {
        console.error("Error:", error);
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "creditFormSubmission",
            error: error.message,
            formData
          });
        }
        const redirectUrlLow = form.getAttribute("redirect-url-low");
        performRedirect(redirectUrlLow);
      }
    });
    function performRedirect(redirectUrl) {
      if (redirectUrl) {
        if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = `${window.location.origin}${redirectUrl.startsWith("/") ? "" : "/"}${redirectUrl}`;
        }
      } else {
        console.error("No redirect URL specified");
      }
    }
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
      if (step.hasAttribute("data-radio-step")) {
        const radioButtons = step.querySelectorAll(
          'input[type="radio"]:not([data-link-out])'
        );
        const nextButton2 = step.querySelector('[data-button="next"]');
        if (nextButton2) {
          nextButton2.style.display = "none";
        }
        radioButtons.forEach((radioButton) => {
          radioButton.addEventListener("click", () => {
            const nextButton3 = step.querySelector('[data-button="next"]');
            if (nextButton3) {
              nextButton3.click();
              const currentStepIndex2 = Array.from(formSteps).indexOf(step) + 2;
              const totalSteps2 = formSteps.length;
              updateProgress(currentStepIndex2, totalSteps2);
            }
          });
        });
      }
      const nextButton = step.querySelector('[data-button="next"]');
      if (nextButton) {
        nextButton.addEventListener("click", async (event) => {
          if (step.hasAttribute("data-twilio")) {
            event.preventDefault();
            const phoneNumber = document.getElementById("Phone-Number").value;
            console.log("Validating phone number:", phoneNumber);
            try {
              const response = await fetch(
                `https://credit-api.netlify.app/.netlify/functions/validate-phone?phoneNumber=${encodeURIComponent(phoneNumber)}`
              );
              const data = await response.json();
              console.log("Response data:", data);
              if (data.valid) {
                console.log("The phone number is a valid mobile number.");
                const currentStep = step;
                const nextStep = currentStep.nextElementSibling;
                if (nextStep && nextStep.matches('[data-form="step"]')) {
                  currentStep.style.display = "none";
                  nextStep.style.display = "flex";
                }
                const currentStepIndex2 = Array.from(formSteps).indexOf(step) + 1;
                const totalSteps2 = formSteps.length;
                updateProgress(currentStepIndex2, totalSteps2);
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
            const isValid = validateStep(step);
            if (isValid) {
              const currentStep = step;
              const nextStep = currentStep.nextElementSibling;
              if (nextStep && nextStep.matches('[data-form="step"]')) {
                currentStep.style.display = "none";
                nextStep.style.display = "flex";
              }
              const currentStepIndex2 = Array.from(formSteps).indexOf(step) + 1;
              const totalSteps2 = formSteps.length;
              updateProgress(currentStepIndex2, totalSteps2);
            } else {
              event.preventDefault();
              console.log(
                "Validation failed. Please fill in all required fields."
              );
            }
          }
        });
      }
      const backButton = step.querySelector('[data-form="back-btn"]');
      const currentStepIndex = Array.from(formSteps).indexOf(step);
      if (currentStepIndex === 0) {
        if (backButton) {
          backButton.style.display = "none";
        }
      } else {
        if (backButton) {
          backButton.style.display = "flex";
        }
      }
      if (backButton) {
        backButton.addEventListener("click", () => {
          const currentStep = step;
          const previousStep = currentStep.previousElementSibling;
          if (previousStep && previousStep.matches('[data-form="step"]')) {
            currentStep.style.display = "none";
            previousStep.style.display = "flex";
          }
          const currentStepIndex2 = Array.from(formSteps).indexOf(previousStep) + 1;
          const totalSteps2 = formSteps.length;
          updateProgress(currentStepIndex2, totalSteps2);
        });
      }
    });
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
    const incomeInput = document.getElementById("Income-Amount");
    function formatPhoneNumber(number) {
      number = number.replace(/\D/g, "");
      number = number.substring(0, 10);
      if (number.length >= 6) {
        return number.replace(/(\d{3})(\d{3})(\d{1,4})/, "($1)-$2-$3");
      } else if (number.length >= 3) {
        return number.replace(/(\d{3})(\d{1,3})/, "($1)-$2");
      } else {
        return number;
      }
    }
    function handlePhoneInputChange(event) {
      event.target.value = formatPhoneNumber(event.target.value);
    }
    const phoneInputs = document.querySelectorAll("[data-phone]");
    phoneInputs.forEach((input) => {
      input.addEventListener("input", handlePhoneInputChange);
    });
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
      const isValid = validateDOB(event.target);
      const errorMessage = event.target.closest(".form-field_item").querySelector('[data-text="error-message"]');
      if (isValid) {
        errorMessage.style.display = "none";
      } else {
        errorMessage.style.display = "block";
      }
    }
    const dobInput = document.getElementById("DOB");
    dobInput.addEventListener("input", handleDOBInputChange);
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
            const autocompleteContainer = document.querySelector(
              "radar-autocomplete-wrapper"
            );
            if (autocompleteContainer) {
              autocompleteContainer.style.display = "none";
              console.log("Autocomplete container hidden");
            }
            addressInput.dispatchEvent(new Event("focusout"));
          }
        });
      }
    }
    function updateAddressFields(address, addressInput, cityInput, stateInput, zipInput) {
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
      zipInput.dispatchEvent(new Event("input"));
    }
    initAutocomplete();
    document.querySelectorAll("#Street-Address, #City, #State-of-residence, #ZIP-Code").forEach((field) => {
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
})();
//# sourceMappingURL=main.js.map
