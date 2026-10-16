export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle submit-lead.php directly inside Cloudflare Worker
    if (url.pathname === '/submit-lead.php' || url.pathname === '/submit-lead') {
      if (request.method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          let data = {};

          if (contentType.includes('application/json')) {
            data = await request.json();
          } else {
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
              data[key] = value;
            }
          }

          // Format PropTiger CRM payload
          const fullName = data.fullname || '';
          const nameParts = fullName.trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || firstName;

          const phone = (data.phone || '').replace(/\D/g, '').slice(-10);
          const email = data.email || '';
          const projectId = data.projectId || data.projectid || '3523522';
          const projectName = data.projectName || data.projectname || 'Hiranandani Krisala Everland';

          const utmSource = data.utm_source || 'Microsite';
          const utmMedium = data.utm_medium || 'organic';
          const utmCampaign = data.utm_campaign || '';
          const utmTerm = data.utm_term || '';
          const utmContent = data.utm_content || '';
          const campaignName = data.campaign_name || '';

          const landingPage = data.landing_page || data.SourceURL || request.url;
          const userIP = request.headers.get('cf-connecting-ip') || '14.96.58.62';

          const ptQueryParams = new URLSearchParams({
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_term: utmTerm,
            utm_content: utmContent,
            gclid: data.gclid || '',
            gbraid: data.gbraid || '',
            wbraid: data.wbraid || '',
            campaign_name: campaignName,
            sub_source: data.sub_source || '',
            landing_page: landingPage,
            referrer: data.referrer || 'android-app://com.google.android.googlequicksearchbox/',
            sourceDomain: 'Microsite'
          });

          const ptUrl = 'https://www.proptiger.com/data/v1/entity/enquiry?' + ptQueryParams.toString();

          const ptPayload = {
            name: fullName.trim() || (firstName + ' ' + lastName).trim(),
            email: email,
            phone: phone,
            countryId: '1',
            source: utmSource,
            projectId: String(projectId),
            projectName: projectName,
            cityId: '1',
            cityName: 'Pune',
            city: 'Pune',
            gaMedium: utmMedium,
            campaign: utmCampaign,
            addgroup: data.adgroup_name || data.ad_group_name || '',
            utm_term: utmTerm,
            utm_content: utmContent,
            gclid: data.gclid || '',
            gbraid: data.gbraid || '',
            wbraid: data.wbraid || '',
            query: data.comments || 'Please arrange a callback',
            device: data.device || '',
            userIP: userIP,
            sendOtp: false,
            isTemp: false,
            fullname: fullName,
            form_name: data.form_name || 'Popup Modal',
            sheet_name: data.sheet_name || 'Pune'
          };

          const crmRes = await fetch(ptUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'Microsite'
            },
            body: JSON.stringify(ptPayload)
          });

          return new Response(JSON.stringify({ status: true, crm: crmRes.status }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (err) {
          return new Response(JSON.stringify({ status: false, error: err.message }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
    }

    // Default: Serve static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  }
};
