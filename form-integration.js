

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

    if (currentCount >= 3) {
      // Simulate fake success response without sending fetch (Max 3 submissions reached)
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
  const payload = new FormData();
  payload.append('fullname', name.value.trim());
  payload.append('email', (email && email.value) ? email.value.trim() : '');
  payload.append('phone', phone.value.trim());
  payload.append('projectId', window.PROJECT_ID || '');
  payload.append('projectName', window.PROJECT_NAME || '');
  payload.append('form_name', form.querySelector('[name="form_name"]')?.value || 'Popup Modal');
  payload.append('sheet_name', window.SHEET_NAME || '');
  payload.append('secret', window.SECRET_KEY || '');
  payload.append('city', window.CITY_DISPLAY || window.CITY_SLUG || '');

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

  /* ---------- SUBMIT TO BACKEND (submit-lead.php) ---------- */
  const endpoint = "submit-lead.php";

  fetch(endpoint, {
    method: "POST",
    body: payload,
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && (res.status === true || res.result === "success")) {
        // Update GCLID Count on Success (Exact Tata Ghansoli Replica)
        if (form._gclid) {
          const newCount = form._currentCount + 1;
          document.cookie = `lead_trk_${window.PROJECT_ID}_${form._gclid}=${newCount}; max-age=2592000; path=/`;

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
