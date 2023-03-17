---
title: "Prevent Template VIrtual Machines from Accidentally being Booted"
date: "2015-08-19"
categories: 
  - "hyper-v"
tags: 
  - "sysprep"
---

Here's a quick tip for Wednesday night:

If you have a VM you have **syspreped** so that you can use it as a template to create other new VM's, set the **VHD/VHDx** file(s) for the VM **read-only** so that you won't _unsysprep_ (is that a word?) it by accident. I have spent many wasted minutes _re-sysprepping_ VM's because I accidentally booted up a template VM.
