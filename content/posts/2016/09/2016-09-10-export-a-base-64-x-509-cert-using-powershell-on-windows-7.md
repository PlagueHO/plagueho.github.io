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

\[gist\]40c20a6cc143d3856c9c23da88843642\[/gist\]

Hope someone finds it useful.
