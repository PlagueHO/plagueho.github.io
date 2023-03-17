---
title: "Which Physical Network Adapters are bound to Virtual Switches?"
date: "2016-04-08"
categories: 
  - "hyper-v"
tags: 
  - "powershell"
---

Today's post has quite a long title for what is going to be a fairly short post. While making some improvements to [LabBuilder](https://github.com/PlagueHO/LabBuilder), I had a need to find out which physical network adapters on a host are bound to Hyper-V Virtual Switches. This is because a single physical adapter can only be bound to a single External Virtual Switch.

So I wrote a few lines of PowerShell that would do the trick:

\[gist\]fc07435c7321be0f7ba072f3da601c84\[/gist\]

The first piece gets a list of MAC addresses for all Virtual Network Adapters that are configured for use by the host OS (managementOS) on External Switches.

The second piece then gets the list of Physical network adapters that match the MAC addresses from the first line. I had to use a -**Replace** to get rid of the dashes in the Physical network adapter MAC address so that I could compare it with the MAC Address in the Virtual Network Adapters. It would be nice if the MAC address format was standard across all modules, but it is a pretty minor complaint.

So as you can see, PowerShell makes this unbelievably easy. This piece of code allows me to ensure that when LabBuilder is creating a new External Switch it doesn't use a physical adapter that has already been used.
