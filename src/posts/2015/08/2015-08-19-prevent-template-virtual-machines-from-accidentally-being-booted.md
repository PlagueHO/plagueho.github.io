---
title: "Prevent Template Virtual Machines from Accidentally Being Booted"
date: 2015-08-19
description: "A quick tip to prevent template VMs from being booted."
tags: 
  - "hyper-v"
  - "sysprep"
isArchived: true
---

Here's a quick tip for Wednesday night:

If you have a VM you have **sysprepped** so that you can use it as a template to create other new VMs, set the **VHD/VHDx** file(s) for the VM **read-only** so that you won't _unsysprep_ (is that a word?) it by accident. I have spent many wasted minutes _re-sysprepping_ VMs because I accidentally booted a template VM.
