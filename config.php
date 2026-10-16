<?php
/* ===============================================================
   PROJECT CONFIGURATION (Dual-Mode: PHP Backend + Browser JS)
=============================================================== */

define('PROJECT_NAME', 'Hiranandani Krisala Everland');
define('PROJECT_ID', '3523522');
define('RERA_NO', 'A51700000030 (Subject to official approvals)');
define('DOMAIN_NAME', 'hiranandanihinjewadiphase3.in');
define('SITE_URL', 'https://' . DOMAIN_NAME);
define('BANNER_IMAGE', 'images/banner.webp');
define('WHATSAPP_NO', '919337712053');
define('CALL_NUMBER', '919718344024');
define('CALL_DISPLAY', '+919718344024');

/* Location / City Details */
define('CITY_DISPLAY', 'Pune');
define('CITY_SLUG', 'Pune');
define('CITY_ID', '1');

/* Google Sheet Config */
define('SHEET_NAME', 'Pune');
define('SECRET_KEY', '6c7f9ad8b2a1e0f4d5a8c0b9f6e2a4d190');
define('SHEET_WEBHOOK', 'https://script.google.com/macros/s/AKfycbw2MGrCI0lVGZZD049RrqM52ubNIHHZLzuk7mIg9KMVacJREV9sw05jnPMvT5OeNtWt/exec');

/* PropTiger CRM API Config */
define('PROPTIGER_URL', 'https://www.proptiger.com/data/v1/entity/enquiry');

/* Google Tag Manager Container ID */
define('GTM_ID', 'GTM-575H8R87');

/* WhatsApp CTA */
define(
  'WHATSAPP_URL',
  'https://wa.me/' . WHATSAPP_NO . '?text=' .
  urlencode('Hi, Please share the project details of ' . PROJECT_NAME)
);

/* ───────────────────────────────────────────────────────────────
   BROWSER JAVASCRIPT EXPORT MODE
   Executed when requested via <script src="config.php"></script>
─────────────────────────────────────────────────────────────── */
$isDirectAccess = (
  (isset($_SERVER['SCRIPT_FILENAME']) && basename($_SERVER['SCRIPT_FILENAME']) === 'config.php') ||
  (isset($_SERVER['SCRIPT_NAME']) && basename($_SERVER['SCRIPT_NAME']) === 'config.php') ||
  (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'config.php') !== false) ||
  !empty($_GET['js'])
);

if (!defined('SUBMIT_LEAD_RUNNING') && $isDirectAccess) {
  header('Content-Type: application/javascript; charset=UTF-8');
  header('Cache-Control: no-cache, no-store, must-revalidate');
  header('Pragma: no-cache');
  header('Expires: 0');
?>
// ═══════════════════════════════════════════════════
//  GLOBAL PROJECT CONFIG (Generated dynamically from config.php)
// ═══════════════════════════════════════════════════

window.PROJECT_ID = <?= json_encode(PROJECT_ID) ?>;
window.PROJECT_NAME = <?= json_encode(PROJECT_NAME) ?>;
window.DEVELOPER_NAME = <?= json_encode(PROJECT_NAME) ?>;
window.RERA_NO = <?= json_encode(RERA_NO) ?>;
window.WHATSAPP_NO = <?= json_encode(WHATSAPP_NO) ?>;
window.CALL_NO = <?= json_encode(CALL_NUMBER) ?>;
window.WHATSAPP_URL = <?= json_encode(WHATSAPP_URL) ?>;
window._cLink = window.WHATSAPP_URL;

window.CITY_DISPLAY = <?= json_encode(CITY_DISPLAY) ?>;
window.CITY_SLUG = <?= json_encode(CITY_SLUG) ?>;
window.CITY_ID = <?= json_encode(CITY_ID) ?>;
window.SHEET_NAME = <?= json_encode(SHEET_NAME) ?>;
window.SECRET_KEY = <?= json_encode(SECRET_KEY) ?>;

window.SHEET_WEBHOOK = <?= json_encode(SHEET_WEBHOOK) ?>;
window.PROPTIGER_URL = <?= json_encode(PROPTIGER_URL) ?>;
window.GTM_ID = <?= json_encode(GTM_ID) ?>;

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
<?php
  exit;
}
