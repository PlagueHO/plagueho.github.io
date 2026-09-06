---
title: Microsoft Clarity consent integration
layout: page
tags:
  - docs
permalink: false
---

## Configuration

The site loads the Microsoft Clarity project `i9o1b9f1tp` from
`src/assets/scripts/clarity.js`. The script starts Clarity in a denied state and
stores the visitor's analytics choice in `neural-flow-analytics-consent-v1`.
Advertising storage remains denied because the site does not request
advertising consent.

Consent Mode must be enabled in the Clarity project settings. The site then
passes Consent API v2 values for `analytics_Storage` and `ad_Storage` after
initialisation and whenever the visitor changes their preference.

## Verification

Use a browser with developer tools open and clear site storage before each
scenario:

1. On a first visit, confirm the banner is visible, the consent key is absent,
   and Clarity receives denied storage values.
2. Select **Allow analytics** and confirm the key is `granted`, the banner
   closes, and Clarity receives granted analytics storage with denied ad
   storage.
3. Select **Cookie settings** in the footer, then choose **No thanks**.
   Confirm the key is `denied` and Clarity no longer retains its consent
   cookies.
4. Reload after either choice and confirm the banner remains hidden and the
   stored choice is applied before any page interaction.

Recheck this flow after changing the Clarity package, project ID, consent copy,
or storage key. If the consent API changes, update the script and this
documentation together.
