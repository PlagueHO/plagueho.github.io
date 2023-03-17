---
title: "Change the Friendly Name of a Cert with PowerShell"
date: "2017-06-09"
categories: 
  - "certificate-services"
tags: 
  - "powershell"
---

While working on adding a new feature in the certificate request DSC resource, I came across this handy little trick: You can change the Friendly Name of a certificate using PowerShell.

All you need to do is identify the certificate using Get-ChildItem and then assign the new FriendlyName to it.

\[gist\]ab6ed6e6e9f38a286608ffda6b9aca0c\[/gist\]

![ss_cert_changefriendlyname](images/ss_cert_changefriendlyname.png)

![ss_cert_changefriendlynamecertlm](images/ss_cert_changefriendlynamecertlm.png)

Sometimes PowerShell still surprises me at how easy it can make things. I didn't need to search help or the internet - just typed it in and it worked!
