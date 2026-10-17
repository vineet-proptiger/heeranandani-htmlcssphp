/* ===============================================================
   DEV & LOCAL TESTING HELPER (Optional File)
   ---------------------------------------------------------------
   NOTE: This file is ONLY used for local / offline test environments
   (e.g., Live Server, localhost, 127.0.0.1).
   
   If you DELETE this file, the main website and production code
   will continue to function normally with zero issues.
=============================================================== */

(function () {
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocalHost) {
    window.DEV_LOCAL_CONFIG = {
      // 1. Valid Indian Public IP to bypass PropTiger CRM localhost loopback filter
      mockUserIP: "14.96.58.62",

      // 2. Referrer fallback for direct localhost browser address-bar pastes
      defaultReferrer: "android-app://com.google.android.googlequicksearchbox/",

      // 3. Local testing only: bypass GCLID limiter and map localhost for CRM validation
      bypassRateLimiter: true,
      rewriteLocalhostDomain: true,
    };

    console.info(
      "%c[Dev Helper]%c Local test configuration active.",
      "color: #c28522; font-weight: bold;",
      "color: inherit;"
    );
  }
})();
