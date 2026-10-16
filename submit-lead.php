<?php
// ═══════════════════════════════════════════════════════════════
//  SUBMIT LEAD API ROUTE — PHP (Exact 1:1 Next.js route.js Match)
//  POST submit-lead.php
// ═══════════════════════════════════════════════════════════════

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

error_reporting(0);
ini_set('display_errors', 0);

/* ─── CONFIG ─────────────────────────────────────────────────── */
define('SUBMIT_LEAD_RUNNING', true);
if (file_exists(__DIR__ . '/config.php')) {
  require_once __DIR__ . '/config.php';
}
/* ────────────────────────────────────────────────────────────── */

function clean($v) {
  if (is_array($v) || is_object($v)) return '';
  return trim(strip_tags((string)($v ?? '')));
}

function getUserIP() {
  $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
  if ($forwarded) {
    $ip = trim(explode(',', $forwarded)[0]);
    if ($ip && !in_array($ip, ['::1', '127.0.0.1', '::ffff:127.0.0.1'], true)) {
      return $ip;
    }
  }
  $realIp = $_SERVER['HTTP_X_REAL_IP'] ?? ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? ''));
  return $realIp ?: '';
}

try {
  /* ── Parse form data ── */
  $rawInput = file_get_contents('php://input');
  $jsonData = json_decode($rawInput, true);
  $data = is_array($jsonData) ? array_merge($_POST, $jsonData) : $_POST;

  $get = function($key) use ($data) {
    return clean($data[$key] ?? '');
  };

  /* ── Honeypot check ── */
  if ($get('website') !== '') {
    echo json_encode(['status' => false]);
    exit;
  }

  /* ── Required fields ── */
  $phone = preg_replace('/\D/', '', $get('phone'));
  if (strlen($phone) > 10) {
    $phone = substr($phone, -10);
  }
  if (strlen($phone) > 0 && strlen($phone) < 10) {
    echo json_encode(['status' => false, 'msg' => 'Invalid phone number']);
    exit;
  }
  if (strlen($phone) === 10 && !preg_match('/^[6-9]\d{9}$/', $phone)) {
    echo json_encode(['status' => false, 'msg' => 'Phone number must start with 6, 7, 8, or 9']);
    exit;
  }
  $email = $get('email');

  if ($phone === '' && $email === '') {
    echo json_encode(['status' => false]);
    exit;
  }

  $projectId = $get('projectId') ?: ($get('projectid') ?: (defined('PROJECT_ID') ? (string)PROJECT_ID : ''));
  if ($projectId === '') {
    echo json_encode(['status' => false]);
    exit;
  }

  /* ── User data ── */
  $fullName = $get('fullname');
  $projectName = $get('projectName') ?: ($get('projectname') ?: (defined('PROJECT_NAME') ? PROJECT_NAME : ''));
  $nameParts = preg_split('/\s+/', trim($fullName));
  $firstName = $nameParts[0] ?? '';
  $lastName = $nameParts[1] ?? $firstName;

  /* ── Tracking ── */
  $utmSource = $get('utm_source') ?: 'Microsite';
  $utmMedium = $get('utm_medium') ?: 'organic';
  $utmCampaign = $get('utm_campaign');
  $utmTerm = $get('utm_term');
  $utmContent = $get('utm_content');
  $campaignName = $get('campaign_name');

  $gclid = $get('gclid');
  $gbraid = $get('gbraid');
  $wbraid = $get('wbraid');

  $landingPage = $get('SourceURL') ?: $get('landing_page');
  $userIP = $get('Ipaddress') ?: ($get('ipaddress') ?: ($get('ip_address') ?: getUserIP()));
  if (!$userIP || in_array($userIP, ['::1', '127.0.0.1', '::ffff:127.0.0.1'], true)) {
    $userIP = '14.96.58.62'; // User's public IP fallback so CRM never receives empty string or localhost
  }

  $comments = $get('comments');

  /* ── 1. Google Sheet ── */
  $sheetPayload = [
    'secret'        => $get('secret') ?: (defined('SECRET_KEY') ? SECRET_KEY : ''),

    'projectid'     => $projectId,
    'projectname'   => $projectName,

    'fullname'      => $fullName ?: trim($firstName . ' ' . $lastName),
    'firstname'     => $firstName,
    'lastname'      => $lastName,
    'email'         => $email,
    'mobile'        => $phone,
    'comments'      => $comments,

    'utm_source'    => $utmSource,
    'utm_medium'    => $utmMedium,
    'utm_campaign'  => $utmCampaign,
    'utm_term'      => $utmTerm,
    'utm_content'   => $utmContent,
    'campaign_name' => $campaignName,
    'sub_source'    => $get('sub_source'),
    'utm_id'        => $get('utm_id'),

    'ad_name'       => $get('ad_name'),
    'ad_group_name' => $get('ad_group_name'),
    'ad_group_id'   => $get('ad_group_id'),

    'gclid'         => $gclid,
    'gbraid'        => $gbraid,
    'wbraid'        => $wbraid,
    'fbclid'        => $get('fbclid'),

    'sourceurl'     => $landingPage,
    'landing_page'  => $landingPage,

    'device'        => $get('device'),
    'referrer'      => $get('referrer'),
    'ipaddress'     => $userIP,
    'formname'      => $get('form_name'),
    'projectcity'   => $get('city') ?: (defined('CITY_DISPLAY') ? CITY_DISPLAY : ''),
    'sheet_name'    => $get('sheet_name') ?: (defined('SHEET_NAME') ? SHEET_NAME : ''),
  ];

  $sheetWebhook = defined('SHEET_WEBHOOK') ? SHEET_WEBHOOK : '';
  if ($sheetWebhook) {
    $sh = curl_init($sheetWebhook);
    curl_setopt_array($sh, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST           => true,
      CURLOPT_POSTFIELDS     => http_build_query($sheetPayload),
      CURLOPT_TIMEOUT        => 10,
      CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_SSL_VERIFYPEER => false,
      CURLOPT_SSL_VERIFYHOST => false
    ]);
    $sheetResponse = curl_exec($sh);
    curl_close($sh);
  }

  /* ── 2. Proptiger CRM ── */
  $proptigerBase = defined('PROPTIGER_URL') ? PROPTIGER_URL : 'https://www.proptiger.com/data/v1/entity/enquiry';

  // If testing on localhost, map to project production domain so PropTiger CRM validates and displays it
  $crmLandingPage = $landingPage;
  if (strpos($crmLandingPage, 'localhost') !== false || strpos($crmLandingPage, '127.0.0.1') !== false) {
    $siteBaseUrl = defined('SITE_URL') ? rtrim(SITE_URL, '/') : 'https://hiranandanihinjewadiphase3.in';
    $crmLandingPage = preg_replace('#^http://(localhost|127\.0\.0\.1)(:\d+)?#', $siteBaseUrl, $crmLandingPage);
  }

  // If referrer is empty (direct browser paste on localhost), provide real search referrer
  $crmReferrer = $get('referrer');
  if ($crmReferrer === '') {
    $crmReferrer = 'android-app://com.google.android.googlequicksearchbox/';
  }

  $ptQueryParams = [
    'utm_source'    => $utmSource,
    'utm_medium'    => $utmMedium,
    'utm_campaign'  => $utmCampaign,
    'utm_term'      => $utmTerm,
    'utm_content'   => $utmContent,
    'gclid'         => $gclid,
    'gbraid'        => $gbraid,
    'wbraid'        => $wbraid,
    'campaign_name' => $campaignName,
    'sub_source'    => $get('sub_source'),
    'landing_page'  => $crmLandingPage,
    'referrer'      => $crmReferrer,
    'sourceDomain'  => 'Microsite'
  ];

  $ptUrl = $proptigerBase . '?' . http_build_query(array_filter($ptQueryParams, function($v) {
    return $v !== '' && $v !== null;
  }), '', '&', PHP_QUERY_RFC3986);

  /* ═══════════════════════════════════════════════════════════
     LAYER 2: JSON BODY ($ptPayload)
     PropTiger Lead Entity Engine
  ═══════════════════════════════════════════════════════════ */

  $cityId = defined('CITY_ID') ? (string)CITY_ID : '1';
  $cityName = defined('CITY_SLUG') ? CITY_SLUG : 'Pune';
  $cityDisplay = defined('CITY_DISPLAY') ? CITY_DISPLAY : 'Pune';

  $ptPayload = [
    // Core Contact & Entity Fields
    'name'                  => trim($firstName . ' ' . $lastName),
    'email'                 => $email,
    'phone'                 => $phone,
    'countryId'             => '1',
    'source'                => $utmSource,

    'projectId'             => (string)$projectId,
    'projectName'           => $projectName,

    'cityId'                => $cityId,
    'cityName'              => $cityName,
    'city'                  => $cityDisplay,

    'gaMedium'              => $utmMedium,
    'campaign'              => $utmCampaign,
    'addgroup'              => $get('adgroup_name') ?: $get('ad_group_name'),

    'utm_term'              => $utmTerm,
    'utm_content'           => $utmContent,

    'gclid'                 => $gclid,
    'gbraid'                => $gbraid,
    'wbraid'                => $wbraid,

    'query'                 => $comments ?: 'Please arrange a callback',
    'device'                => $get('device'),
    'userIP'                => $userIP,

    'sendOtp'               => false,
    'isTemp'                => false,

    // Attribution & Campaign Data for CRM Dashboard (Enquiries View)
    'fullname'              => $fullName ?: trim($firstName . ' ' . $lastName),
    'form_name'             => $get('form_name') ?: 'Popup Modal',
    'sheet_name'            => $get('sheet_name') ?: (defined('SHEET_NAME') ? SHEET_NAME : ''),
    'utm_source'            => $utmSource,
    'sub_source'            => $get('sub_source'),
    'utm_medium'            => $utmMedium,
    'utm_campaign'          => $utmCampaign,
    'utm_id'                => $get('utm_id'),
    'ad_group_id'           => $get('ad_group_id'),
    'campaign_name'         => $campaignName,
    'ad_group_name'         => $get('ad_group_name') ?: $get('adgroup_name'),
    'ad_name'               => $get('ad_name'),
    'fbclid'                => $get('fbclid'),

    // Google Ads Tracking Variables
    'google_campaign_id'    => $campaignName,
    'google_ad_group_id'    => $get('google_ad_group_id'),
    'google_ad_group_name'  => $get('google_ad_group_name'),
    'google_ad_name'        => $get('google_ad_name'),
    'google_ad_id'          => $get('google_ad_id'),
    'google_wbraid'         => $get('google_wbraid'),
    'google_gbraid'         => $get('google_gbraid'),
    'google_keyword'        => $get('google_keyword'),
    'google_matchtype'      => $get('google_matchtype'),
    'google_device'         => $get('google_device'),
    'google_gclid'          => $get('google_gclid'),
    'google_gad_source'     => $get('google_gad_source'),
    'google_gad_campaignid' => $get('google_gad_campaignid'),
    'asset_group_id'        => $get('asset_group_id'),

    // Meta Ads Tracking Variables
    'meta_campaign_id'      => $get('meta_campaign_id'),
    'meta_adset_id'         => $get('meta_adset_id'),
    'meta_adset_name'       => $get('meta_adset_name'),
    'meta_ad_name'          => $get('meta_ad_name'),
    'meta_ad_id'            => $get('meta_ad_id'),
    'meta_creative_id'      => $get('meta_creative_id'),
    'meta_placement'        => $get('meta_placement'),
    'meta_fbclid'           => $get('meta_fbclid'),
    'user_agent'            => $get('user_agent'),

    // Extended UTM Tracking
    'utm_campaign_id'       => $get('utm_campaign_id'),
    'utm_adgroup'           => $get('utm_adgroup'),
    'utm_adgroup_id'        => $get('utm_adgroup_id'),
    'utm_ad_id'             => $get('utm_ad_id'),
    'utm_keyword'           => $get('utm_keyword'),
    'utm_matchtype'         => $get('utm_matchtype'),
    'utm_network'           => $get('utm_network'),
    'utm_device'            => $get('utm_device'),
    'utm_gclid'             => $get('utm_gclid'),
    'utm_gbraid'            => $get('utm_gbraid'),
    'utm_wbraid'            => $get('utm_wbraid'),

    // Where it came from (CRM Landing Page & IP)
    'SourceURL'             => $landingPage,
    'sourceurl'             => $landingPage,
    'landing_page'          => $crmLandingPage,
    'landingPage'           => $crmLandingPage,
    'referrer'              => $crmReferrer,
    'ip_address'            => $userIP,
  ];

  $ptBodyStr = json_encode($ptPayload);

  $ptHeaders = [
    'Accept: application/json',
    'Content-Type: application/json',
    'User-Agent: Microsite',
  ];

  $ptStatus = null;
  $ptBody = null;

  try {
    $ch = curl_init($ptUrl);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST           => true,
      CURLOPT_POSTFIELDS     => $ptBodyStr,
      CURLOPT_HTTPHEADER     => $ptHeaders,
      CURLOPT_TIMEOUT        => 20,
      CURLOPT_CONNECTTIMEOUT => 10,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_SSL_VERIFYPEER => false,
      CURLOPT_SSL_VERIFYHOST => false,
    ]);
    $ptBody = curl_exec($ch);
    $ptStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $ptError = curl_error($ch);
    curl_close($ch);
  } catch (Exception $e) {
    $ptError = $e->getMessage();
  }

  // Save log entry to proptiger.log
  $logEntry = date('Y-m-d H:i:s') . "\nHTTP: " . $ptStatus . ($ptError ? " | Error: " . $ptError : "") . "\nCRM URL:\n" . $ptUrl . "\nPayload:\n" . $ptBodyStr . "\nResponse:\n" . $ptBody . "\n\n";
  file_put_contents(__DIR__ . '/proptiger.log', $logEntry, FILE_APPEND);

  echo json_encode([
    'status' => true,
    'crm'    => $ptStatus,
  ]);
  exit;

} catch (Exception $err) {
  http_response_code(500);
  echo json_encode(['status' => false, 'msg' => 'Server error']);
  exit;
}
