---
title: "Setting the Computer Name installing Nano Server bug resolved"
date: "2015-06-16"
categories: 
  - "windows-server-nano"
---

When I [originally wrote the script](https://dscottraynsford.wordpress.com/2015/05/08/install-windows-server-nano-the-easy-way/) to help install Nano Server I ran into a problem where I couldn't get the Computer Name of the Nano Server to set during the _OfflineServicing_ phase. This was supposed to be a new feature of Windows Server 2016 where the computer name could now be set in this phase rather than having to wait for the _Specialize_ phase - which meant one less reboot during installation of the OS - saving precious seconds. And when installing Nano, saving an extra few seconds actually matter. I spent some time trying to get this new feature to work but nothing I tried worked, so I resorted to setting it in the _Specialize_ phase like installations of old.

But thanks to [Michael Birtwistle](https://gallery.technet.microsoft.com/scriptcenter/site/profile?userName=Michael%20Birtwistle) for pointing out [this forum post](https://social.technet.microsoft.com/Forums/en-US/bb6ea8b9-7390-4461-8f0e-a70b0dcc83c6/error-at-applyunattend-to-nano-server-image?forum=WinServerPreview). It points out that the Unattend.xml file in the original Nano Server instructions from Microsoft was incorrect. So I have corrected the [Install-NanoServerVHD.ps1](https://gallery.technet.microsoft.com/scriptcenter/Create-a-New-Nano-Server-61f674f1) script to reflect this as well. So even faster Nano Server provisioning should be available now.

