---
title: "NAP, DHCP and Windows 10 - Nope!"
date: 2015-09-29
description: "A quick article about NAP and Windows 10."
tags:
  - "dhcp"
  - "nap"
  - "windows-10"
  - "group-policy"
isArchived: true
---

I just spent a good hour trying to figure out why my **Windows 10** clients were not getting assigned an IP Address from my DHCP servers once I enabled _NAP integration on the scope_. The reason, of course, is obvious: [NAP was deprecated in Windows Server 2012 R2](http://windowsitpro.com/blog/3-reasons-why-network-access-protection-being-phased-out).

The NAP client is **not** available on Windows 10 computers. You can't even see the Network Access Policy node when you edit a GPO using **Windows 10 RSAT**:

![NAP on Windows 10? Nope.](/assets/images/screenshots/ss_nap_windows10gpedit.png)

So if you're wanting to configure your Windows 10 computers with DHCP and you're using NAP, you'll need to disable it or create a special scope without NAP enabled with a **DHCP Scope Policy** for your Windows 10 clients. As this technology has been deprecated, you're probably better off **removing NAP entirely**. Pity I'm having to spend time studying it for my 70.411 exam.
