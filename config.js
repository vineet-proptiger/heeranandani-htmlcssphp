/* ===============================================================
   PROJECT CONFIGURATION (Browser JavaScript)
=============================================================== */

window.PROJECT_ID = "3523522";
window.PROJECT_NAME = "Hiranandani Krisala Everland";
window.DEVELOPER_NAME = "Hiranandani Krisala Everland";
window.RERA_NO = "A51700000030 (Subject to official approvals)";
window.WHATSAPP_NO = "919337712053";
window.CALL_NO = "919718344024";
window.CALL_DISPLAY = "+919718344024";
window.WHATSAPP_URL = "https://wa.me/" + window.WHATSAPP_NO + "?text=" + encodeURIComponent("Hi, Please share the project details of " + window.PROJECT_NAME);
window._cLink = window.WHATSAPP_URL;

window.CITY_DISPLAY = "Pune";
window.CITY_SLUG = "Pune";
window.CITY_ID = "1";
window.SHEET_NAME = "Pune";
window.SECRET_KEY = "6c7f9ad8b2a1e0f4d5a8c0b9f6e2a4d190";

window.SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbw2MGrCI0lVGZZD049RrqM52ubNIHHZLzuk7mIg9KMVacJREV9sw05jnPMvT5OeNtWt/exec";
window.PROPTIGER_URL = "https://www.proptiger.com/data/v1/entity/enquiry";
window.GTM_ID = "GTM-575H8R87";

// Auto-bind configuration variables to UI elements
window.applyProjectConfig = function () {
  const waBtns = document.querySelectorAll("#mobile-whatsapp, .whatsapp-link, a[href*='wa.me']");
  waBtns.forEach((btn) => {
    if (window.WHATSAPP_URL) btn.href = window.WHATSAPP_URL;
  });

  const callBtns = document.querySelectorAll("#mobile-call, .call-link, a[href^='tel:']");
  callBtns.forEach((btn) => {
    if (window.CALL_NO) btn.href = "tel:+" + window.CALL_NO.replace(/^\+/, "");
  });
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.applyProjectConfig);
  } else {
    window.applyProjectConfig();
  }
}
