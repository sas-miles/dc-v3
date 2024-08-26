(()=>{window.Webflow||(window.Webflow=[]);window.Webflow.push(async()=>{let w={"#First-Name":I,"#Last-Name":I,"#Street-Address":y,"#City":y,"#State-of-residence":A,"#ZIP-Code":y,"#DOB":x,"#Phone-Number":C,'[form-field="dropdown"]':A,"input[required]":D};function b(e,t){let o=t(e),n=e.closest(".form-field_item").querySelector('[data-text="error-message"]');return o?n.style.display="none":n.style.display="block",o}function S(e){if(e.querySelector(".radar-field"))return console.log("Validating address step"),k(e);let t=e.querySelectorAll(".form-field"),o=e.querySelectorAll('input[type="radio"]'),n=!0;return t.forEach(l=>{let a=E(l);a&&!b(l,a)&&(n=!1)}),o.length>0&&!F(o)&&(n=!1),n}function k(e){let t=e.querySelectorAll(".form-field"),o=!0;return p||(o=!1),t.forEach(n=>{n.value.trim()===""&&(o=!1)}),t.forEach(n=>{let l=E(n);l&&!b(n,l)&&(o=!1)}),o}let H={"/thank-you-debtcom":["Alaska","Alabama","Arkansas","Arizona","California","District of Columbia","Florida","Indiana","Massachusetts","Maryland","Michigan","Missouri","Mississippi","North Carolina","Nebraska","New Mexico","New York","Oklahoma","South Dakota","Texas","Washington","Wisconsin"]};function E(e){for(let t in w)if(e.matches(t))return w[t];return null}function D(e){return e.value.trim()!==""}function A(e){let t=e.options[0].value;return e.value!==t}function I(e){let t=e.value.trim();return/^[A-Za-z]{3,}$/.test(t)}function y(e){return!0}function C(e){return e.value.trim().replace(/[\(\)-\s]/g,"").length===10}function F(e){let t=!1;return e.forEach(o=>{o.checked&&(t=!0)}),t}function x(e){let t=e.value.trim().replace(/\D/g,"");if(t.length!==8)return!1;let o=parseInt(t.slice(0,2),10),n=parseInt(t.slice(2,4),10),l=parseInt(t.slice(4),10);if(isNaN(o)||isNaN(n)||isNaN(l)||o<1||o>12||n<1||n>31)return!1;let a=new Date(l,o-1,n),r=new Date-a,c=new Date(r);return Math.abs(c.getUTCFullYear()-1970)>=18}function _(e){let t=e.querySelector('[data-button="next"]'),o=S(e);t&&(t.style.pointerEvents="none",o?(B(t),t.classList.add("is-active")):(q(t),t.classList.remove("is-active")))}function B(e){e&&(e.classList.remove("disabled"),e.style.pointerEvents="auto",e.style.opacity="1")}function q(e){e&&(e.classList.add("disabled"),e.style.pointerEvents="none",e.style.opacity="0.5")}let d=document.querySelectorAll('[data-form="step"]');d.forEach(e=>{e.style.display="none"});function f(e,t){let o=(e-1)/(t-1)*100,n=document.querySelector(".progress-line");n.style.width=o+"%"}let P=document.querySelectorAll('[data-form="step"]').length;f(1,P);let O=d[0];O.style.display="flex";function $(){let e={};return window.location.search.substring(1).split("&").forEach(n=>{let[l,a]=n.split("=");e[decodeURIComponent(l)]=decodeURIComponent(a||"")}),e}function R(e){Object.entries({utm_medium:"channeldrilldown1",utm_source:"channeldrilldown2",utm_campaign:"channeldrilldown3",utm_content:"channeldrilldown4",s4:"channeldrilldown5",pid:"channeldrilldown6"}).forEach(([o,n])=>{if(e.hasOwnProperty(o)){let l=document.querySelector(`input[name="${n}"]`);if(l){let a=e[o];a=a.replace(/placement|campaign\.id|adset\.id|ad\.id|pid/g,"unknown"),l.value=a}}})}let M=$();R(M);let m=document.getElementById("hero-form");m.addEventListener("submit",async e=>{e.preventDefault();function t(a,i){let r=document.getElementById(a);r?r.value=i:console.warn(`Hidden field '${a}' not found`)}function o(a){return`+1${(""+a).replace(/\D/g,"").substring(0,10)}`}function n(a){let[i,r,c]=a.split("-");return`${c}-${i}-${r}`}let l={first_name:document.getElementById("First-Name").value||"",last_name:document.getElementById("Last-Name").value||"",email:document.getElementById("Email")&&document.getElementById("Email").value||"",phone:document.getElementById("Phone-Number")?o(document.getElementById("Phone-Number").value||""):"",dob:n(document.getElementById("DOB").value||""),address:{street:document.getElementById("Street-Address").value||"",city:document.getElementById("City").value||"",state:document.getElementById("State-of-residence").value||"",zipcode:document.getElementById("ZIP-Code").value||""},website:window.location.origin||"",channeldrilldown1:document.querySelector('input[name="channeldrilldown1"]')?.value||"",channeldrilldown2:document.querySelector('input[name="channeldrilldown2"]')?.value||"",channeldrilldown3:document.querySelector('input[name="channeldrilldown3"]')?.value||"",channeldrilldown4:document.querySelector('input[name="channeldrilldown4"]')?.value||"",channeldrilldown5:document.querySelector('input[name="channeldrilldown5"]')?.value||"",channeldrilldown6:document.querySelector('input[name="channeldrilldown6"]')?.value||""};console.log("Submitting form data:",l);try{let a=await fetch("https://credit-api.netlify.app/.netlify/functions/credit-api",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}),i=await a.json();if(!a.ok)throw new Error(i.error||"API request failed");let{result:r,zapierResult:c,error:u}=i;console.log("Credit API response:",r),console.log("Zapier response:",c),u&&console.error("Credit API error:",u),t("balance_unsecured_accounts",r?.balance_unsecured_accounts?.max?.toString()||""),t("balance_unsecured_credit_cards",r?.balance_unsecured_credit_cards?.max?.toString()||""),t("creditScore",r?.creditScore?.max?.toString()||"");let s=Number(r?.balance_unsecured_credit_cards?.max),h={event:"creditFormSubmission",balance_unsecured_accounts:r?.balance_unsecured_accounts?.max||"N/A",balance_unsecured_credit_cards:s||"N/A",creditScore:r?.creditScore?.max||"N/A",formData:l,api_error:u||"N/A",zapier_error:c.error||"N/A"};window.dataLayer?window.dataLayer.push(h):console.warn("Google Tag Manager dataLayer not found");let g=m.getAttribute("redirect-url-high"),L=m.getAttribute("redirect-url-low"),v;!isNaN(s)&&s>9999?(v=g,window.dataLayer&&window.dataLayer.push({event:"custom_conversion",event_category:"engagement",event_label:"High Unsecured Credit Card Balance",balance_unsecured_credit_cards:s})):(v=L,window.dataLayer&&window.dataLayer.push({event:"custom_conversion",event_category:"engagement",event_label:"Low Unsecured Credit Card Balance",balance_unsecured_credit_cards:s})),N(v||L)}catch(a){console.error("Error:",a),window.dataLayer&&window.dataLayer.push({event:"creditFormSubmission",error:a.message,formData:l});let i=m.getAttribute("redirect-url-low");N(i)}});function N(e){e?e.startsWith("http://")||e.startsWith("https://")?window.location.href=e:window.location.href=`${window.location.origin}${e.startsWith("/")?"":"/"}${e}`:console.error("No redirect URL specified")}d.forEach(e=>{if(e.querySelectorAll(".form-field").forEach(a=>{a.addEventListener("input",()=>{_(e)}),a.addEventListener("change",()=>{_(e)})}),e.hasAttribute("data-radio-step")){let a=e.querySelectorAll('input[type="radio"]:not([data-link-out])'),i=e.querySelector('[data-button="next"]');i&&(i.style.display="none"),a.forEach(r=>{r.addEventListener("click",()=>{let c=e.querySelector('[data-button="next"]');if(c){c.click();let u=Array.from(d).indexOf(e)+2,s=d.length;f(u,s)}})})}let o=e.querySelector('[data-button="next"]');o&&o.addEventListener("click",async a=>{if(e.hasAttribute("data-twilio")){a.preventDefault();let i=document.getElementById("Phone-Number").value;console.log("Validating phone number:",i);try{let c=await(await fetch(`https://credit-api.netlify.app/.netlify/functions/validate-phone?phoneNumber=${encodeURIComponent(i)}`)).json();if(console.log("Response data:",c),c.valid){console.log("The phone number is a valid mobile number.");let u=e,s=u.nextElementSibling;s&&s.matches('[data-form="step"]')&&(u.style.display="none",s.style.display="flex");let h=Array.from(d).indexOf(e)+1,g=d.length;f(h,g)}else console.warn("The phone number is not a valid mobile number or an error occurred."),alert("Please enter a valid mobile phone number.")}catch(r){console.error("Error during fetch:",r),alert("An error occurred while validating the phone number.")}}else if(S(e)){let r=e,c=r.nextElementSibling;c&&c.matches('[data-form="step"]')&&(r.style.display="none",c.style.display="flex");let u=Array.from(d).indexOf(e)+1,s=d.length;f(u,s)}else a.preventDefault(),console.log("Validation failed. Please fill in all required fields.")});let n=e.querySelector('[data-form="back-btn"]');Array.from(d).indexOf(e)===0?n&&(n.style.display="none"):n&&(n.style.display="flex"),n&&n.addEventListener("click",()=>{let a=e,i=a.previousElementSibling;i&&i.matches('[data-form="step"]')&&(a.style.display="none",i.style.display="flex");let r=Array.from(d).indexOf(i)+1,c=d.length;f(r,c)})});function V(e){e.preventDefault();let t=e.target.dataset.linkOut;window.location.href=t}document.querySelectorAll("[data-link-out]").forEach(e=>{e.dataset.linkOut&&e.addEventListener("click",V)});let G=document.getElementById("Income-Amount");function T(e){return e=e.replace(/\D/g,""),e=e.substring(0,10),e.length>=6?e.replace(/(\d{3})(\d{3})(\d{1,4})/,"($1)-$2-$3"):e.length>=3?e.replace(/(\d{3})(\d{1,3})/,"($1)-$2"):e}function W(e){e.target.value=T(e.target.value)}document.querySelectorAll("[data-phone]").forEach(e=>{e.addEventListener("input",W)});function U(e){return e=e.replace(/\D/g,""),e.length>8&&(e=e.slice(0,8)),e.length>2&&(e=e.slice(0,2)+"-"+e.slice(2)),e.length>5&&(e=e.slice(0,5)+"-"+e.slice(5,9)),e}function Z(e){let t=U(e.target.value);e.target.value=t;let o=x(e.target),n=e.target.closest(".form-field_item").querySelector('[data-text="error-message"]');o?n.style.display="none":n.style.display="block"}document.getElementById("DOB").addEventListener("input",Z);let p=!1;Radar.initialize("prj_live_pk_9a04f6bab292b47ffdad877f7bd7d63fa6d2bc54");function j(){let e=document.getElementById("Street-Address"),t=document.getElementById("City"),o=document.getElementById("State-of-residence"),n=document.getElementById("ZIP-Code"),l=document.querySelector('[data-form="next-btn"]');document.getElementById("autocomplete-container")&&Radar.ui.autocomplete({container:"Street-Address",responsive:!0,minCharacters:2,debounceMS:0,onSelection:i=>{z(i,e,t,o,n),B(l),p=!0;let r=document.querySelector("radar-autocomplete-wrapper");r&&(r.style.display="none",console.log("Autocomplete container hidden")),e.dispatchEvent(new Event("focusout"))}})}function z(e,t,o,n,l){t.value="",o.value="",n.value="",l.value="",e.number&&e.street?t.value=`${e.number} ${e.street}`:t.value="",o.value=e.city||"",n.value=e.state||"",l.value=e.postalCode||"",l.dispatchEvent(new Event("input"))}j(),document.querySelectorAll("#Street-Address, #City, #State-of-residence, #ZIP-Code").forEach(e=>{e.addEventListener("input",()=>{p=!0})}),document.querySelectorAll(".form-next_btn").forEach(e=>{e.addEventListener("click",t=>{p||(t.preventDefault(),q(e))})})});})();
