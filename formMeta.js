/* formMeta.js - URL Parameter Tracking & Form Fields Integration */

// Helper to get parameters from URL (Query string + Hash support)
window.getParam = function (name) {
  if (typeof window === 'undefined') return '';
  let val = new URLSearchParams(window.location.search).get(name);
  if (!val && window.location.hash && window.location.hash.includes('?')) {
    const hashPart = window.location.hash.split('?')[1];
    val = new URLSearchParams(hashPart).get(name);
  }
  return val || '';
}

// Cookie Helper Functions
window.setTrackingCookie = function(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

window.getTrackingCookie = function(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Function to collect tracking data from current URL
window.collectTrackingData = function () {
  return {
    // google sheet fields
    utm_source:    window.getParam('utm_source'),
    sub_source:    window.getParam('sub_source'),
    utm_medium:    window.getParam('utm_medium'), 
    utm_campaign:  window.getParam('utm_campaign'),
    utm_id:        window.getParam('utm_id'), // google campaign name
    ad_group_id:   window.getParam('ad_group_id') || window.getParam('asset_group_id'),
    utm_content:   window.getParam('utm_content'),// yhi  addId h
    campaign_name: window.getParam('campaign_name'),
    ad_group_name: window.getParam('ad_group_name') || window.getParam('asset_group_name'),
    ad_name:       window.getParam('ad_name'),
    utm_term:      window.getParam('utm_term'),

    gclid:         window.getParam('gclid'),
    gbraid:        window.getParam('gbraid'),
    wbraid:        window.getParam('wbraid'),
    fbclid :       window.getParam('fbclid'),

    // New Google Parameters
    google_campaign_id:   window.getParam('utm_id'),
    google_ad_group_id:   window.getParam('ad_group_id'),
    google_ad_group_name: window.getParam('ad_group_name'),
    google_ad_name:       window.getParam('ad_name'),
    google_ad_id:         window.getParam('utm_content'),
    google_wbraid:        window.getParam('google_wbraid'),
    google_gbraid:        window.getParam('google_gbraid'),
    google_keyword:       window.getParam('google_keyword'),
    google_matchtype:     window.getParam('matchtype'),
    google_device:        window.getParam('google_device'),
    google_gclid:         window.getParam('google_gclid'),
    google_gad_source:    window.getParam('gad_source'),
    google_gad_campaignid:window.getParam('gad_campaignid'),
    asset_group_id:       window.getParam('asset_group_id'),

    //Meta variables
    meta_campaign_id: window.getParam('meta_campaign_id'),
    meta_adset_id:    window.getParam('meta_adset_id'),
    meta_adset_name:  window.getParam('meta_adset_name'),
    meta_ad_name:     window.getParam('meta_ad_name'),
    meta_ad_id:       window.getParam('utm_content') || window.getParam('meta_ad_id'),
    meta_creative_id: window.getParam('meta_creative_id'),
    meta_placement:   window.getParam('meta_placement'),
    
    meta_fbclid :     window.getParam('fbclid'),
    user_agent:       window.getParam('user_agent'),

    // New UTM Parameters
    utm_campaign_id:      window.getParam('utm_campaign_id'),
    utm_adgroup:          window.getParam('utm_adgroup'),
    utm_adgroup_id:       window.getParam('utm_adgroup_id'),
    utm_ad_id:            window.getParam('utm_ad_id'),
    utm_keyword:          window.getParam('utm_keyword'),
    utm_matchtype:        window.getParam('utm_matchtype'),
    utm_network:          window.getParam('utm_network'),
    utm_device:           window.getParam('utm_device'),
    utm_gclid:            window.getParam('utm_gclid'),
    utm_gbraid:           window.getParam('utm_gbraid'),
    utm_wbraid:           window.getParam('utm_wbraid'),

    SourceURL:     typeof window !== 'undefined' ? window.location.href : '',
    landing_page:  typeof window !== 'undefined' ? window.location.href : '',
    referrer:      typeof document !== 'undefined' ? document.referrer : '',
    device:        typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : '',
    ip_address:    '',
    geo_city:      '',
    geo_region:    '',
    geo_postal:    '',
    geo_country:   '',
    website:       '',
  }
}

// Helper function to check if URL has any ad parameters (supports query & hash)
window.hasTrackingParams = function() {
  if (typeof window === 'undefined') return false;
  const check = (params) => {
    return params.has('utm_source') || params.has('gclid') || params.has('fbclid') || 
           params.has('utm_medium') || params.has('utm_campaign') || params.has('wbraid') || 
           params.has('gbraid') || params.has('sub_source') || params.has('utm_id') || params.has('gad_source');
  };
  let params = new URLSearchParams(window.location.search);
  if (check(params)) return true;
  if (window.location.hash && window.location.hash.includes('?')) {
    let hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    if (check(hashParams)) return true;
  }
  return false;
}

// Accept only a real HTTP(S) page URL with a hostname before saving attribution.
window.hasValidTrackingDomain = function() {
  if (typeof window === 'undefined' || !window.location) return false;
  try {
    const url = new URL(window.location.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname;
  } catch (e) {
    return false;
  }
}

// Helper to check for test/debug mode (test=submit, test=true, debug=test across query & hash)
window.isTestMode = function() {
  if (typeof window === 'undefined') return false;
  const testVal = (typeof window.getParam === 'function' ? window.getParam('test') : new URLSearchParams(window.location.search).get('test')) || '';
  const debugVal = (typeof window.getParam === 'function' ? window.getParam('debug') : new URLSearchParams(window.location.search).get('debug')) || '';
  return testVal.toLowerCase() === 'submit' || testVal.toLowerCase() === 'true' || debugVal.toLowerCase() === 'test';
}

// Save the first valid tracked landing URL for one day. Plain domain visits
// without campaign identifiers and test/debug URLs never create or replace it.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const existingCookie = window.getTrackingCookie('rs_lead_tracking_data');

  if (window.hasValidTrackingDomain() && window.hasTrackingParams() && !window.isTestMode()) {
    const trackingData = window.collectTrackingData();
    const currentDomain = window.location.hostname.toLowerCase();
    trackingData.tracking_domain = currentDomain;

    let existingData = null;
    if (existingCookie) {
      try { existingData = JSON.parse(decodeURIComponent(existingCookie)); } catch (e) {}
    }

    // A valid, unexpired cookie from this domain is the first-touch record.
    // Older cookies without tracking_domain are host-only cookies too, so keep them.
    const savedDomain = existingData && existingData.tracking_domain
      ? String(existingData.tracking_domain).toLowerCase()
      : currentDomain;
    if (!existingData || savedDomain !== currentDomain) {
      window.setTrackingCookie('rs_lead_tracking_data', encodeURIComponent(JSON.stringify(trackingData)), 1);
    }
  }
}

// Function called by form-integration.js on form submit
window.buildTrackingFields = function () {
  let finalTrackingData = {};
  
  // Load data from cookie (First-click attribution)
  const cookieData = window.getTrackingCookie('rs_lead_tracking_data');
  if (cookieData) {
    try {
      finalTrackingData = JSON.parse(decodeURIComponent(cookieData));
    } catch (e) {
      console.error("Error parsing tracking cookie", e);
      finalTrackingData = window.collectTrackingData(); // fallback
    }
  } else {
    // Fallback if cookie was missing or blocked.
    finalTrackingData = window.collectTrackingData();
    // Do not attribute a test/debug or invalid-domain submission to its URL.
    if (window.isTestMode() || !window.hasValidTrackingDomain()) {
      finalTrackingData.SourceURL = '';
      finalTrackingData.landing_page = '';
    }
  }

  // Update dynamic values (like the current page where form is being submitted)
  finalTrackingData.CurrentURL = typeof window !== 'undefined' ? window.location.href : '';
  
  return finalTrackingData;
}
