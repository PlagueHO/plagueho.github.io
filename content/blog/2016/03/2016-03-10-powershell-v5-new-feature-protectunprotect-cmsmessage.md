---
title: "PowerShell V5 New Feature: Protect/Unprotect-CmsMessage"
date: "2016-03-10"
---

This interesting article gives some background details on some of the problems I ran into after upgrading my DSC dev machine to WMF 5.0 10586. This is because in WMF5.0 the DSC credential encryption mechanism was converted to use Protect/Unprotect-CMSMessage. It clears up a lot of things for me and is a worthwhile read if you're using DSC credential encryption on WMF5.0.

