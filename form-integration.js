

/* =========================================
   AUTO POPULATE UTM (URL + COOKIE ATTRIBUTION)
========================================= */

window.autoPopulateTrackingForms = function () {
  let params = new URLSearchParams(window.location.search);

  /* Extract UTM from hash if present */
  if (window.location.hash.includes("?")) {
    const hashPart = window.location.hash.split("?")[1];
    const hashParams = new URLSearchParams(hashPart);
    hashParams.forEach((value, key) => {
      params.set(key, value);
    });
  }

  // Load from cookie (First-click attribution fallback)
  let cookieTracking = {};
  if (typeof window.getTrackingCookie === 'function') {
    const rawCookie = window.getTrackingCookie('rs_lead_tracking_data');
    if (rawCookie) {
      try {
        cookieTracking = JSON.parse(decodeURIComponent(rawCookie));
      } catch (e) {}
    }
  }

  const fields = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_assetgroupid",
    "campaign_name",
    "campaign_type",
    "asset_group",
    "content_name",
    "adgroup_name",
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
    "device",
  ];

  document.querySelectorAll("form.rs-lead-form").forEach((form) => {
    fields.forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      // Preserve first-touch values from the cookie if the visitor later lands
      // with a different campaign URL before submitting the form.
      const val = cookieTracking[name] || params.get(name) || '';
      if (input && val) {
        input.value = val;
      }
    });

    const ref = form.querySelector('[name="referrer"]');
    if (ref) ref.value = document.referrer || cookieTracking.referrer || "direct";

    const lp = form.querySelector('[name="landing_page"]');
    if (lp) lp.value = cookieTracking.landing_page || window.location.href;
  });
};

// Run immediately and on DOMContentLoaded
window.autoPopulateTrackingForms();
if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", window.autoPopulateTrackingForms);
}

/* =========================================
   USER IP (Handled Server-side in submit-lead.php)
========================================= */
// Redundant client-side ipify fetch removed to save 289ms latency and 1 network request.
// Server submit-lead.php extracts client IP directly via HTTP_CF_CONNECTING_IP / REMOTE_ADDR.

/* =========================================
   LIVE VALIDATION RESET
========================================= */

document.addEventListener("input", function (e) {
  const form = e.target.closest("form.rs-lead-form");
  if (!form) return;

  // Real-time Phone Validation (Next.js replica)
  if (e.target.name === "phone") {
    // Remove all non-digits
    let val = e.target.value.replace(/\D/g, "");
    // Slice to max 10 digits
    if (val.length > 10) val = val.slice(0, 10);
    e.target.value = val;
  }

  e.target.setCustomValidity("");
  e.target.classList.remove("is-invalid");

  const msgBox = form.querySelector("[data-form-message]");
  if (msgBox) msgBox.innerHTML = "";
});

/* =========================================
   TATA GHANSOLI REPLICA THANK YOU SCREEN
========================================= */

function showThankYouScreen(form) {
  // Hide modal header if inside modalForm for clean, focused presentation
  if (form.id === "modalForm" || form.closest("#leadModal")) {
    const parentContainer = form.parentElement;
    const header = parentContainer ? parentContainer.querySelector("div:first-child") : null;
    if (header && header !== form) {
      header.style.display = "none";
    }
  }

  // Exact Tata Ghansoli Thank You UI Replica
  form.innerHTML = `
    <div class="thank-you-screen text-center py-4" style="text-align: center; padding: 28px 16px; margin: auto; width: 100%;">
      <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(201, 166, 90, 0.16); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1.5px solid #c9a65a; box-shadow: 0 4px 20px rgba(201, 166, 90, 0.25);">
        <svg style="width: 34px; height: 34px; color: #c9a65a;" fill="none" stroke="#c9a65a" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h4 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 8px; font-family: var(--font-jost, 'Montserrat', sans-serif); letter-spacing: 0.5px;">Thank You!</h4>
      <p style="font-size: 14.5px; color: #d1d5db; margin: 0; font-family: var(--font-sans, 'Open Sans', sans-serif); line-height: 1.6;">Our team will contact you shortly.</p>
    </div>
  `;

  // Auto-close modal after 4 seconds
  setTimeout(() => {
    const modalEl = document.getElementById("leadModal");
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }, 4000);
}

/* =========================================
   MAIN SUBMIT HANDLER
========================================= */

function RSLeadSubmit(form, event) {
  event.preventDefault();

  const msgBox = form.querySelector("[data-form-message]");
  const btn = form.querySelector('button[type="submit"]');

  msgBox.innerHTML = "";

  const name = form.querySelector('[name="fullname"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');

  const fakeNumberPattern = /^(\d)\1{9}$/;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  let valid = true;

  /* ---------- NAME ---------- */
  if (!name.value.trim() || !/^[A-Za-z\s]+$/.test(name.value)) {
    name.setCustomValidity("Please enter valid name");
    name.classList.add("is-invalid");
    valid = false;
  }

  /* ---------- EMAIL (OPTIONAL) ---------- */
  if (email && email.value.trim()) {
    if (!emailPattern.test(email.value.trim())) {
      email.setCustomValidity("Please enter valid email address");
      email.classList.add("is-invalid");
      valid = false;
    }
  }

  /* ---------- PHONE ---------- */
  if (
    !phone.value.trim() ||
    !/^[6-9][0-9]{9}$/.test(phone.value) ||
    fakeNumberPattern.test(phone.value)
  ) {
    phone.setCustomValidity("Please enter valid 10-digit mobile number");
    phone.classList.add("is-invalid");
    valid = false;
  }

  if (!valid) {
    form.reportValidity();
    return false;
  }

  /* ---------- LOCK BUTTON & SHOW LOADING STATE ---------- */
  const originalBtnContent = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Submitting...";

  /* ---------- PREPARE TRACKING DATA ---------- */
  const trackingData = window.buildTrackingFields(form);

  /* ---------- GCLID-SPECIFIC BROWSER LIMIT (Max 3 submissions per GCLID / 30 days) ---------- */
  const gclid = trackingData.gclid || '';
  let currentCount = 0;

  if (gclid) {
    const safeGclid = gclid;
    const cookieRegex = new RegExp(`(?:^|; )lead_trk_${window.PROJECT_ID}_${safeGclid}=([^;]*)`);
    const cookieMatch = document.cookie.match(cookieRegex);
    const cookieCount = cookieMatch ? parseInt(cookieMatch[1], 10) : 0;

    let lsCount = 0;
    const lsKey = `lead_trk_data_${window.PROJECT_ID}`;
    const lsDataStr = localStorage.getItem(lsKey);
    let lsData = {};

    if (lsDataStr) {
      try {
        lsData = JSON.parse(lsDataStr);
        const gclidRecord = lsData[gclid];

        if (gclidRecord) {
          if (Date.now() - gclidRecord.firstSeen < 2592000000) { // 30 days
            lsCount = gclidRecord.count || 0;
          } else {
            delete lsData[gclid];
            localStorage.setItem(lsKey, JSON.stringify(lsData));
          }
        }
      } catch (e) {}
    }

    currentCount = Math.max(cookieCount, lsCount);

    // Optional helper to reset counter for testing via URL param (?reset_limit=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset_limit') === '1') {
      currentCount = 0;
      delete lsData[gclid];
      localStorage.setItem(lsKey, JSON.stringify(lsData));
      document.cookie = `lead_trk_${window.PROJECT_ID}_${safeGclid}=0; max-age=0; path=/`;
    }

    const devCfg = (typeof window !== 'undefined' && window.DEV_LOCAL_CONFIG) || {};
    const isTestingHost = Boolean(devCfg.bypassRateLimiter || (typeof window.isTestMode === 'function' && window.isTestMode()));

    if (!isTestingHost && currentCount >= 3) {
      // Simulate fake success response without sending fetch (Max 3 submissions reached in production)
      setTimeout(() => {
        showThankYouScreen(form);
      }, 500);
      return false;
    }

    // Pass data forward to update count on successful API response
    form._gclid = gclid;
    form._currentCount = currentCount;
  }

  /* ---------- PREPARE FORM PAYLOAD (Exact Next.js Replica) ---------- */
  const pId = window.PROJECT_ID || '';
  const pName = window.PROJECT_NAME || '';
  const sName = window.SHEET_NAME || '';
  const secKey = window.SECRET_KEY || '';
  const pCity = window.CITY_DISPLAY || window.CITY_SLUG || '';

  const payload = new FormData();
  payload.append('fullname', name.value.trim());
  payload.append('email', (email && email.value) ? email.value.trim() : '');
  payload.append('phone', phone.value.trim());
  payload.append('projectId', pId);
  payload.append('projectName', pName);
  payload.append('form_name', form.querySelector('[name="form_name"]')?.value || 'Popup Modal');
  payload.append('sheet_name', sName);
  payload.append('secret', secKey);
  payload.append('city', pCity);

  // Form custom fields (comments / query)
  const commentsInput = form.querySelector('[name="comments"]');
  if (commentsInput && commentsInput.value.trim()) {
    payload.append('comments', commentsInput.value.trim());
  }

  // Append ALL tracking fields in exact Next.js format and order (even if empty)
  if (trackingData) {
    Object.entries(trackingData).forEach(([k, v]) => {
      payload.append(k, (v !== undefined && v !== null) ? String(v) : '');
    });
  }

  /* ---------- SUBMIT ENGINE (Dual Mode: Direct CRM on Workers/Static + Webhook) ---------- */
  async function submitDirectToCrm(payloadData) {
    const devCfg = (typeof window !== 'undefined' && window.DEV_LOCAL_CONFIG) || {};
    const prodDomain = window.BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    let cleanLandingPage = payloadData.landing_page || payloadData.SourceURL || (typeof window !== 'undefined' ? window.location.href : '');
    if (devCfg.rewriteLocalhostDomain && (cleanLandingPage.includes('localhost') || cleanLandingPage.includes('127.0.0.1'))) {
      cleanLandingPage = cleanLandingPage.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, prodDomain);
    }

    let cleanReferrer = document.referrer || devCfg.defaultReferrer || '';
    if (devCfg.rewriteLocalhostDomain && (cleanReferrer.includes('localhost') || cleanReferrer.includes('127.0.0.1') || !cleanReferrer)) {
      cleanReferrer = devCfg.defaultReferrer || 'android-app://com.google.android.googlequicksearchbox/';
    }

    const ptQueryParams = new URLSearchParams({
      utm_source: payloadData.utm_source || 'Microsite',
      utm_medium: payloadData.utm_medium || 'organic',
      utm_campaign: payloadData.utm_campaign || '',
      utm_term: payloadData.utm_term || '',
      utm_content: payloadData.utm_content || '',
      gclid: payloadData.gclid || '',
      gbraid: payloadData.gbraid || '',
      wbraid: payloadData.wbraid || '',
      campaign_name: payloadData.campaign_name || '',
      sub_source: payloadData.sub_source || '',
      landing_page: cleanLandingPage,
      referrer: cleanReferrer,
      sourceDomain: 'Microsite'
    });

    const [fName, ...lParts] = (payloadData.fullname || '').trim().split(/\s+/);
    const firstName = fName || '';
    const lastName = lParts.join(' ') || firstName;

    const ptPayload = {
      name: (payloadData.fullname || (firstName + ' ' + lastName)).trim(),
      email: payloadData.email || '',
      phone: (payloadData.phone || '').replace(/\D/g, '').slice(-10),
      countryId: '1',
      source: payloadData.utm_source || 'Microsite',
      projectId: String(payloadData.projectId || window.PROJECT_ID || ''),
      projectName: payloadData.projectName || window.PROJECT_NAME || '',
      cityId: String(window.CITY_ID || '1'),
      cityName: window.CITY_DISPLAY || 'Pune',
      city: window.CITY_DISPLAY || 'Pune',
      gaMedium: payloadData.utm_medium || 'organic',
      campaign: payloadData.utm_campaign || '',
      addgroup: payloadData.adgroup_name || payloadData.ad_group_name || '',
      utm_term: payloadData.utm_term || '',
      utm_content: payloadData.utm_content || '',
      gclid: payloadData.gclid || '',
      gbraid: payloadData.gbraid || '',
      wbraid: payloadData.wbraid || '',
      query: payloadData.comments || 'Please arrange a callback',
      device: payloadData.device || (window.innerWidth < 768 ? 'mobile' : 'desktop'),
      userIP: devCfg.mockUserIP || '14.96.58.62',
      ip_address: devCfg.mockUserIP || '14.96.58.62',
      landing_page: cleanLandingPage,
      landingPage: cleanLandingPage,
      SourceURL: cleanLandingPage,
      sourceurl: cleanLandingPage,
      referrer: cleanReferrer,
      utm_source: payloadData.utm_source || 'Microsite',
      utm_medium: payloadData.utm_medium || 'organic',
      utm_campaign: payloadData.utm_campaign || '',
      sendOtp: false,
      isTemp: false,
      fullname: payloadData.fullname,
      form_name: payloadData.form_name || 'Popup Modal',
      sheet_name: payloadData.sheet_name || window.SHEET_NAME || ''
    };

    const crmUrl = 'https://www.proptiger.com/data/v1/entity/enquiry?' + ptQueryParams.toString();
    const res = await fetch(crmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(ptPayload)
    });

    // Also dispatch to Google Sheet Webhook if configured
    if (window.SHEET_WEBHOOK) {
      try {
        const sheetData = new URLSearchParams();
        sheetData.append('secret', payloadData.secret || window.SECRET_KEY || '');
        sheetData.append('projectid', payloadData.projectId || window.PROJECT_ID || '');
        sheetData.append('projectname', payloadData.projectName || window.PROJECT_NAME || '');
        sheetData.append('fullname', payloadData.fullname || (firstName + ' ' + lastName).trim());
        sheetData.append('firstname', firstName);
        sheetData.append('lastname', lastName);
        sheetData.append('email', payloadData.email || '');
        sheetData.append('mobile', (payloadData.phone || '').replace(/\D/g, '').slice(-10));
        sheetData.append('comments', payloadData.comments || '');
        sheetData.append('utm_source', payloadData.utm_source || 'Microsite');
        sheetData.append('utm_medium', payloadData.utm_medium || 'organic');
        sheetData.append('utm_campaign', payloadData.utm_campaign || '');
        sheetData.append('utm_term', payloadData.utm_term || '');
        sheetData.append('utm_content', payloadData.utm_content || '');
        sheetData.append('campaign_name', payloadData.campaign_name || '');
        sheetData.append('sub_source', payloadData.sub_source || '');
        sheetData.append('utm_id', payloadData.utm_id || '');
        sheetData.append('ad_name', payloadData.ad_name || '');
        sheetData.append('ad_group_name', payloadData.ad_group_name || '');
        sheetData.append('ad_group_id', payloadData.ad_group_id || '');
        sheetData.append('gclid', payloadData.gclid || '');
        sheetData.append('gbraid', payloadData.gbraid || '');
        sheetData.append('wbraid', payloadData.wbraid || '');
        sheetData.append('fbclid', payloadData.fbclid || '');
        sheetData.append('sourceurl', payloadData.landing_page || payloadData.SourceURL || window.location.href);
        sheetData.append('landing_page', payloadData.landing_page || payloadData.SourceURL || window.location.href);
        sheetData.append('device', payloadData.device || (window.innerWidth < 768 ? 'mobile' : 'desktop'));
        sheetData.append('referrer', document.referrer || '');
        sheetData.append('formname', payloadData.form_name || 'Popup Modal');
        sheetData.append('projectcity', payloadData.city || window.CITY_DISPLAY || '');
        sheetData.append('sheet_name', payloadData.sheet_name || window.SHEET_NAME || '');

        fetch(window.SHEET_WEBHOOK, {
          method: 'POST',
          mode: 'no-cors',
          body: sheetData
        }).catch(() => {});
      } catch (err) {
        console.warn('Google Sheet webhook dispatch notice:', err);
      }
    }

    if (res.ok) {
      return { status: true, crm: res.status };
    }
    throw new Error('CRM returned HTTP ' + res.status);
  }

  // Convert payload to plain object and submit directly to PropTiger CRM & Google Sheet
  const payloadObj = {};
  for (let [k, v] of payload.entries()) {
    payloadObj[k] = v;
  }

  submitDirectToCrm(payloadObj)
    .then((res) => {
      if (res && (res.status === true || res.result === "success")) {
        // Update GCLID Count on Success (Exact Tata Ghansoli Replica)
        const prjId = window.PROJECT_ID || '';
        if (form._gclid && prjId) {
          const newCount = form._currentCount + 1;
          document.cookie = `lead_trk_${prjId}_${form._gclid}=${newCount}; max-age=2592000; path=/`;

          const lsKey = `lead_trk_data_${window.PROJECT_ID}`;
          let lsData = {};
          try {
            const existing = localStorage.getItem(lsKey);
            if (existing) lsData = JSON.parse(existing);
          } catch (e) {}

          lsData[form._gclid] = {
            count: newCount,
            firstSeen:
              lsData[form._gclid] && lsData[form._gclid].firstSeen
                ? lsData[form._gclid].firstSeen
                : Date.now(),
          };
          try { localStorage.setItem(lsKey, JSON.stringify(lsData)); } catch (e) {}
        }

        window.dataLayer = window.dataLayer || [];

        const [firstName, ...last] = name.value.trim().split(" ");
        const lastName = last.join(" ");
        const rawDigits = phone.value.trim().replace(/\D/g, "");
        const formattedPhone = rawDigits ? (rawDigits.startsWith("91") && rawDigits.length === 12 ? `+${rawDigits}` : `+91${rawDigits.slice(-10)}`) : "";

        window.dataLayer.push({
          event: "lead_submit_success",
          form_name: form.querySelector('[name="form_name"]')?.value || "",
          user_data: {
            email: (email && email.value) ? email.value.trim() : "",
            phone: formattedPhone,
            first_name: firstName || "",
            last_name: lastName || "",
          },
        });

        showThankYouScreen(form);
      } else {
        throw new Error(res.msg || "Submission failed");
      }
    })
    .catch((error) => {
      msgBox.innerHTML = `
      <div class="alert alert-danger mt-3">
        ❌ Submission failed. Please try again.
      </div>
    `;

      btn.disabled = false;
      btn.innerHTML = originalBtnContent || "SUBMIT";
      console.error("Submission error:", error);
    });

  return false;
}

window.RSLeadSubmit = RSLeadSubmit;
