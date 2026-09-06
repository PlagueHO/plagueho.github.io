import clarity from '@microsoft/clarity';

const consentStorageKey = 'neural-flow-analytics-consent-v1';
const consentValues = new Set(['granted', 'denied']);
const consentBanner = document.querySelector('[data-consent-banner]');
const consentSettingsButton = document.querySelector('[data-consent-settings]');
const consentActionButtons = document.querySelectorAll('[data-consent-action]');

clarity.init('i9o1b9f1tp');

const sendConsent = analyticsStorage => {
  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: analyticsStorage
  });
};

const setBannerVisibility = isVisible => {
  if (!consentBanner) {
    return;
  }

  consentBanner.hidden = !isVisible;
};

const saveConsent = analyticsStorage => {
  if (!consentValues.has(analyticsStorage)) {
    return;
  }

  localStorage.setItem(consentStorageKey, analyticsStorage);
  sendConsent(analyticsStorage);
  setBannerVisibility(false);
};

const storedConsent = localStorage.getItem(consentStorageKey);
const hasValidConsent = consentValues.has(storedConsent);

sendConsent(hasValidConsent ? storedConsent : 'denied');
setBannerVisibility(!hasValidConsent);

consentActionButtons.forEach(button => {
  button.addEventListener('click', () => {
    saveConsent(button.dataset.consentAction);
  });
});

consentSettingsButton?.addEventListener('click', () => {
  setBannerVisibility(true);
  consentBanner?.focus();
});
