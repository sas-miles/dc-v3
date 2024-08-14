(() => {
  window.Webflow || (window.Webflow = []);
  window.Webflow.push(async () => {
    let p = {
      "#First-Name": b,
      "#Last-Name": b,
      "#Street-Address": y,
      "#City": y,
      "#State-of-residence": E,
      "#ZIP-Code": y,
      "#Income-Amount": q,
      "#DOB": w,
      "#Phone-Number": D,
      '[form-field="dropdown"]': E,
      "input[required]": L,
    };
    function h(e, t) {
      let n = t(e),
        o = e
          .closest(".form-field_item")
          .querySelector('[data-text="error-message"]');
      return n ? (o.style.display = "none") : (o.style.display = "block"), n;
    }
    function v(e) {
      if (e.querySelector(".radar-field"))
        return console.log("Validating address step"), x(e);
      let t = e.querySelectorAll(".form-field"),
        n = e.querySelectorAll('input[type="radio"]'),
        o = !0;
      return (
        t.forEach((s) => {
          let l = g(s);
          l && !h(s, l) && (o = !1);
        }),
        n.length > 0 && !k(n) && (o = !1),
        o
      );
    }
    function x(e) {
      let t = e.querySelectorAll(".form-field"),
        n = !0;
      return (
        m || (n = !1),
        t.forEach((o) => {
          o.value.trim() === "" && (n = !1);
        }),
        t.forEach((o) => {
          let s = g(o);
          s && !h(o, s) && (n = !1);
        }),
        n
      );
    }
    let A = { "/thank-you-debtcom": [] };
    function g(e) {
      for (let t in p) if (e.matches(t)) return p[t];
      return null;
    }
    function L(e) {
      return e.value.trim() !== "";
    }
    function E(e) {
      let t = e.options[0].value;
      return e.value !== t;
    }
    function b(e) {
      let t = e.value.trim();
      return /^[A-Za-z]{3,}$/.test(t);
    }
    function y(e) {
      return !0;
    }
    function q(e) {
      let t = e.value.trim().replace(/,/g, "");
      return /^\d{4,}$/.test(t);
    }
    function D(e) {
      return e.value.trim().replace(/[\(\)-\s]/g, "").length === 10;
    }
    function k(e) {
      let t = !1;
      return (
        e.forEach((n) => {
          n.checked && (t = !0);
        }),
        t
      );
    }
    function w(e) {
      let t = e.value.trim().replace(/\D/g, "");
      if (t.length !== 8) return !1;
      let n = parseInt(t.slice(0, 2), 10),
        o = parseInt(t.slice(2, 4), 10),
        s = parseInt(t.slice(4), 10);
      if (
        isNaN(n) ||
        isNaN(o) ||
        isNaN(s) ||
        n < 1 ||
        n > 12 ||
        o < 1 ||
        o > 31
      )
        return !1;
      let l = new Date(s, n - 1, o),
        r = new Date() - l,
        i = new Date(r);
      return Math.abs(i.getUTCFullYear() - 1970) >= 18;
    }
    function S(e) {
      let t = e.querySelector('[data-button="next"]'),
        n = v(e);
      t &&
        ((t.style.pointerEvents = "none"),
        n
          ? (I(t), t.classList.add("is-active"))
          : (B(t), t.classList.remove("is-active")));
    }
    function I(e) {
      e &&
        (e.classList.remove("disabled"),
        (e.style.pointerEvents = "auto"),
        (e.style.opacity = "1"));
    }
    function B(e) {
      e &&
        (e.classList.add("disabled"),
        (e.style.pointerEvents = "none"),
        (e.style.opacity = "0.5"));
    }
    let c = document.querySelectorAll('[data-form="step"]');
    c.forEach((e) => {
      e.style.display = "none";
    });
    function f(e, t) {
      let n = ((e - 1) / (t - 1)) * 100,
        o = document.querySelector(".progress-line");
      o.style.width = n + "%";
    }
    let C = document.querySelectorAll('[data-form="step"]').length;
    f(1, C);
    let N = c[0];
    (N.style.display = "flex"),
      document.querySelector("form").addEventListener("submit", async (e) => {
        e.preventDefault();
        let n = document.querySelector("#State-of-residence").value;
        for (let [a, r] of Object.entries(A))
          if (r.includes(n)) {
            e.preventDefault(), (window.location.href = a);
            return;
          }
        function o(a) {
          return `+1${("" + a).replace(/\D/g, "").substring(0, 10)}`;
        }
        function s(a) {
          let [r, i, d] = a.split("-");
          return `${d}-${r}-${i}`;
        }
        let l = {
          first_name: document.getElementById("First-Name").value || "",
          last_name: document.getElementById("Last-Name").value || "",
          email:
            (document.getElementById("Email") &&
              document.getElementById("Email").value) ||
            "",
          phone: document.getElementById("Phone-Number")
            ? o(document.getElementById("Phone-Number").value || "")
            : "",
          dob: s(document.getElementById("DOB").value || ""),
          address: {
            street: document.getElementById("Street-Address").value || "",
            city: document.getElementById("City").value || "",
            state: document.getElementById("State-of-residence").value || "",
            zipcode: document.getElementById("ZIP-Code").value || "",
          },
          website: window.location.origin || "",
        };
        console.log("Submitting form data:", l),
          (window.dataLayer = window.dataLayer || []),
          window.dataLayer.push({ event: "formSubmission", formData: l });
        try {
          let r = await (
            await fetch(
              "https://credit-api.netlify.app/.netlify/functions/credit-api",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(l),
              }
            )
          ).json();
          console.log("Serverless function response:", r),
            r.data &&
            r.data.balance_unsecured_credit_cards &&
            r.data.balance_unsecured_credit_cards.max > 9999
              ? ((window.dataLayer = window.dataLayer || []),
                window.dataLayer.push({
                  event: "custom_conversion",
                  event_category: "engagement",
                  event_label: "High Unsecured Credit Card Balance",
                }),
                (window.location.href = "/thank-you-debtcom"))
              : ((window.dataLayer = window.dataLayer || []),
                window.dataLayer.push({
                  event: "custom_conversion",
                  event_category: "engagement",
                  event_label: "Low Unsecured Credit Card Balance",
                }),
                (window.location.href = "/thank-you-cc"));
        } catch (a) {
          console.error("Error:", a);
        }
      }),
      c.forEach((e) => {
        if (
          (e.querySelectorAll(".form-field").forEach((l) => {
            l.addEventListener("input", () => {
              S(e);
            }),
              l.addEventListener("change", () => {
                S(e);
              });
          }),
          e.hasAttribute("data-radio-step"))
        ) {
          let l = e.querySelectorAll(
              'input[type="radio"]:not([data-link-out])'
            ),
            a = e.querySelector('[data-button="next"]');
          a && (a.style.display = "none"),
            l.forEach((r) => {
              r.addEventListener("click", () => {
                let i = e.querySelector('[data-button="next"]');
                if (i) {
                  i.click();
                  let d = Array.from(c).indexOf(e) + 2,
                    u = c.length;
                  f(d, u);
                }
              });
            });
        }
        let n = e.querySelector('[data-button="next"]');
        n &&
          n.addEventListener("click", async (l) => {
            if (
              e.hasAttribute("data-step") &&
              e.getAttribute("data-step") === "income"
            ) {
              let a = e.querySelector("[data-income]");
              if (a && parseFloat(a.value.replace(/,/g, "")) < 1e4) {
                let i = a.getAttribute("data-income-link");
                window.location.href = i;
                return;
              }
            }
            if (e.hasAttribute("data-twilio")) {
              l.preventDefault();
              let a = document.getElementById("Phone-Number").value;
              console.log("Validating phone number:", a);
              try {
                let i = await (
                  await fetch(
                    `https://peaceful-sawine-5c61e8.netlify.app/.netlify/functions/validate-phone?phoneNumber=${encodeURIComponent(a)}`
                  )
                ).json();
                if ((console.log("Response data:", i), i.valid)) {
                  console.log("The phone number is a valid mobile number.");
                  let d = e,
                    u = d.nextElementSibling;
                  u &&
                    u.matches('[data-form="step"]') &&
                    ((d.style.display = "none"), (u.style.display = "flex"));
                  let Z = Array.from(c).indexOf(e) + 1,
                    U = c.length;
                  f(Z, U);
                } else
                  console.warn(
                    "The phone number is not a valid mobile number or an error occurred."
                  ),
                    alert("Please enter a valid mobile phone number.");
              } catch (r) {
                console.error("Error during fetch:", r),
                  alert("An error occurred while validating the phone number.");
              }
            } else if (v(e)) {
              let r = e,
                i = r.nextElementSibling;
              i &&
                i.matches('[data-form="step"]') &&
                ((r.style.display = "none"), (i.style.display = "flex"));
              let d = Array.from(c).indexOf(e) + 1,
                u = c.length;
              f(d, u);
            } else
              l.preventDefault(),
                console.log(
                  "Validation failed. Please fill in all required fields."
                );
          });
        let o = e.querySelector('[data-form="back-btn"]');
        Array.from(c).indexOf(e) === 0
          ? o && (o.style.display = "none")
          : o && (o.style.display = "flex"),
          o &&
            o.addEventListener("click", () => {
              let l = e,
                a = l.previousElementSibling;
              a &&
                a.matches('[data-form="step"]') &&
                ((l.style.display = "none"), (a.style.display = "flex"));
              let r = Array.from(c).indexOf(a) + 1,
                i = c.length;
              f(r, i);
            });
      });
    function F(e) {
      e.preventDefault();
      let t = e.target.dataset.linkOut;
      window.location.href = t;
    }
    document.querySelectorAll("[data-link-out]").forEach((e) => {
      e.dataset.linkOut && e.addEventListener("click", F);
    });
    let O = document.getElementById("Income-Amount");
    function _(e) {
      return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function P(e) {
      let t = e.target.value.replace(/,/g, ""),
        n = _(t);
      e.target.value = n;
    }
    O.addEventListener("input", P);
    function V(e) {
      return (
        (e = e.replace(/\D/g, "")),
        (e = e.substring(0, 10)),
        e.length >= 6
          ? e.replace(/(\d{3})(\d{3})(\d{1,4})/, "($1)-$2-$3")
          : e.length >= 3
            ? e.replace(/(\d{3})(\d{1,3})/, "($1)-$2")
            : e
      );
    }
    function $(e) {
      e.target.value = V(e.target.value);
    }
    document.querySelectorAll("[data-phone]").forEach((e) => {
      e.addEventListener("input", $);
    });
    function R(e) {
      return (
        (e = e.replace(/\D/g, "")),
        e.length > 8 && (e = e.slice(0, 8)),
        e.length > 2 && (e = e.slice(0, 2) + "-" + e.slice(2)),
        e.length > 5 && (e = e.slice(0, 5) + "-" + e.slice(5, 9)),
        e
      );
    }
    function j(e) {
      let t = R(e.target.value);
      e.target.value = t;
      let n = w(e.target),
        o = e.target
          .closest(".form-field_item")
          .querySelector('[data-text="error-message"]');
      n ? (o.style.display = "none") : (o.style.display = "block");
    }
    document.getElementById("DOB").addEventListener("input", j);
    let m = !1;
    Radar.initialize("prj_live_pk_9a04f6bab292b47ffdad877f7bd7d63fa6d2bc54");
    function M() {
      let e = document.getElementById("Street-Address"),
        t = document.getElementById("City"),
        n = document.getElementById("State-of-residence"),
        o = document.getElementById("ZIP-Code"),
        s = document.querySelector('[data-form="next-btn"]');
      document.getElementById("autocomplete-container") &&
        Radar.ui.autocomplete({
          container: "Street-Address",
          responsive: !0,
          minCharacters: 2,
          debounceMS: 0,
          onSelection: (a) => {
            T(a, e, t, n, o), I(s), (m = !0);
            let r = document.querySelector("radar-autocomplete-wrapper");
            r &&
              ((r.style.display = "none"),
              console.log("Autocomplete container hidden")),
              e.dispatchEvent(new Event("focusout"));
          },
        });
    }
    function T(e, t, n, o, s) {
      (t.value = ""),
        (n.value = ""),
        (o.value = ""),
        (s.value = ""),
        e.number && e.street
          ? (t.value = `${e.number} ${e.street}`)
          : (t.value = ""),
        (n.value = e.city || ""),
        (o.value = e.state || ""),
        (s.value = e.postalCode || ""),
        s.dispatchEvent(new Event("input"));
    }
    M(),
      document
        .querySelectorAll(
          "#Street-Address, #City, #State-of-residence, #ZIP-Code"
        )
        .forEach((e) => {
          e.addEventListener("input", () => {
            m = !0;
          });
        }),
      document.querySelectorAll(".form-next_btn").forEach((e) => {
        e.addEventListener("click", (t) => {
          m || (t.preventDefault(), B(e));
        });
      });
  });
})();
