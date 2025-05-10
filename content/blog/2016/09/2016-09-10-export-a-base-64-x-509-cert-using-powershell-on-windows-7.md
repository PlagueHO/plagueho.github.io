---
title: "Export a Base-64 x.509 Cert using PowerShell on Windows 7"
date: "2016-09-10"
categories:
  - "certificate-services"
tags:
  - "powershell"
---

Exporting a Base-64 Encoded x.509 certificate using PowerShell is trivial if you have the [Export-Certificate](https://technet.microsoft.com/en-us/library/hh848628.aspx) cmdlet available. However, many of the nodes I work with are Windows 7 which unfortunately doesn't include these cmdlets. Therefore I needed an alternate method of exporting these Base-64 encoded x.509 certificates from these nodes.

So I came up with this little snippet of code:


```powershell
$certificate = Get-ChildItem -Path Get-ChildItem -path Cert:\CurrentUser\My\D675AE3AE9F7B56348C17EE527F261CFCEA0FD13
$base64certificate = @"
-----BEGIN CERTIFICATE-----
$([Convert]::ToBase64String($certificate.Export('Cert'), [System.Base64FormattingOptions]::InsertLineBreaks)))
-----END CERTIFICATE-----
"@
Set-Content -Path "$ENV:USERPROFILE\Documents\MyCert.cer" -Value $base64certificate
```

Hope someone finds it useful.


