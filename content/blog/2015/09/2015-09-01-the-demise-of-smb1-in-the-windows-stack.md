---
title: "The Demise of SMB1 in the Windows Stack"
date: "2015-09-01"
categories: 
  - "smb"
tags: 
  - "powershell"
---

If you're interested in **SMB** and the general progress of the protocol, I'd recommend this 30 minute video on Channel 9: [The Demise of SMB1 in the Windows Stack](https://channel9.msdn.com/Blogs/Regular-IT-Guy/The-Demise-of-SMB-1-in-the-Windows-Stack?wt.mc_id=player). It motivated me to rid all my desktops and servers of SMB 1.0 the _ancient_ and _insecure_ protocol support.

To disable SMB 1.0 on a **Windows Server**:

\[sourcecode language="powershell"\] Set-SmbServerConfiguration -EnableSMB1Protocol $false \[/sourcecode\]

You can uninstall SMB 1.0 on a **Windows Desktop**:

\[sourcecode language="powershell"\] Disable-WindowsOptionalFeature -FeatureName SMB1Protocol -Online \[/sourcecode\]

Warning! Don't do this if you have any older type devices (or OS's) that can only use SMB 1.0.

