/**
 * Vanilla cookie consent banner for GA4 + Google Consent Mode v2.
 * No dependencies. Include via <script src="/cookie-consent.js" defer></script>
 * AFTER the gtag consent-default + gtag.js snippets in <head>.
 *
 * Only controls analytics_storage. ad_storage / ad_user_data / ad_personalization
 * remain permanently 'denied' — this site does not use Google Ads or Signals.
 * If that changes, extend GRANTED_ON_ACCEPT below.
 */
(function () {
  var STORAGE_KEY = 'cookie_consent_v1';
  var EXPIRY_DAYS = 180; // re-prompt after this period (CNIL guidance: 6 months)

  var GRANTED_ON_ACCEPT = {
    analytics_storage: 'granted'
  };
  var DENIED = {
    analytics_storage: 'denied'
  };

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function readStoredConsent() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null; // localStorage unavailable (private mode, blocked, etc.)
    }
    if (!raw) return null;
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return null;
    }
    var ageMs = Date.now() - parsed.ts;
    if (ageMs > EXPIRY_DAYS * 86400000) return null;
    return parsed.choice; // 'granted' | 'denied'
  }

  function storeConsent(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: choice, ts: Date.now() }));
    } catch (e) {
      /* non-fatal */
    }
  }

  function applyConsent(choice) {
    gtag('consent', 'update', choice === 'granted' ? GRANTED_ON_ACCEPT : DENIED);
  }

  function buildBanner(onChoice) {
    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<p id="cc-text">Curious how many people find this site? Same. Anonymous analytics only.</p>' +
      '<div id="cc-actions">' +
      '<button id="cc-reject" type="button">Reject</button>' +
      '<button id="cc-accept" type="button">Accept</button>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;' +
      'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;' +
      'padding:14px 18px;background:#1a1a1a;color:#f2f2f2;' +
      'font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
      'box-shadow:0 -2px 10px rgba(0,0,0,.25)}' +
      '#cc-text{margin:0;flex:1 1 260px}' +
      '#cc-actions{display:flex;gap:8px;flex:0 0 auto}' +
      '#cc-banner button{cursor:pointer;border:1px solid #555;border-radius:4px;' +
      'padding:8px 16px;font:inherit;background:transparent;color:#f2f2f2}' +
      '#cc-accept{background:#f2f2f2;color:#1a1a1a;border-color:#f2f2f2}' +
      '@media (max-width:480px){#cc-banner{flex-direction:column;align-items:stretch}' +
      '#cc-actions{justify-content:flex-end}}';
    document.head.appendChild(style);

    el.querySelector('#cc-accept').addEventListener('click', function () {
      onChoice('granted');
      el.remove();
    });
    el.querySelector('#cc-reject').addEventListener('click', function () {
      onChoice('denied');
      el.remove();
    });

    return el;
  }

  function init() {
    var stored = readStoredConsent();
    if (stored) {
      applyConsent(stored);
      return;
    }
    var banner = buildBanner(function (choice) {
      storeConsent(choice);
      applyConsent(choice);
    });
    document.body.appendChild(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
