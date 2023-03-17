---
title: "PowerShell Paramters in GPO Scripts"
date: "2015-06-03"
tags: 
  - "group-policy"
  - "powershell"
---

# introduction

This morning I decided I wanted to update all my lab servers to Windows Management Framework 5.0 so I could do some work on the new DSC features that come with it. To do this, I though I'd use a GPO with a startup PowerShell script that would perform the installation of the WMF 5.0 April hotfix (available [here)](https://www.microsoft.com/en-us/download/details.aspx?id=46889 "Windows Management Framework 5.0 Preview April 2015").

\[caption id="attachment\_197" align="alignnone" width="660"\][![A GPO Startup PowerShell script with parameters.](https://dscottraynsford.files.wordpress.com/2015/06/ss_gpo_startuppowershellscriptparametersexample.png?w=660)](https://dscottraynsford.files.wordpress.com/2015/06/ss_gpo_startuppowershellscriptparametersexample.png) A GPO Startup PowerShell script with parameters.\[/caption\]

On thinking about this I decided it might also be a good idea to modify the PowerShell script designed to install Microsoft Office 2013 products via GPO (see the post [here](https://dscottraynsford.wordpress.com/2015/04/06/using-powershell-to-installuninstall-microsoft-office-products-by-group-policy/ "Using PowerShell to Install/Uninstall Microsoft Office Products by Group Policy")). After producing the new scripts and testing them by manually running them to ensure they worked correctly, I put them into some GPOs.  And that is when things started to go wrong!

## Parameter Problems

The issue I ran into was that the parameters set in the GPO PowerShell script parameters seemed to misbehave in several ways. After about 6 hours of investigating and testing I've found the following things cause problems when you do them.

### Parameter Length Limit

There seems to be a maximum number of characters that will be used in the Script Parameters setting in a GPO Startup/Shutdown/Logon/Logoff PowerShell script. The limit appears to be 207 but I can't find official documentation of this. If script parameters longer than this limit is entered the additional characters will simply be ignored, leading to the script either failing to run or running incorrectly.

If you do run into this issue, one way around it is to edit the script and wrap all the code in a function definition and then add a call with the parameters to the end of the script after the end of the function definition. For Example:

\[sourcecode language="powershell"\] Function Install-Application { ... Existing script code here ... } Install-Application -InstallerPath "\\\\Server\\Software$\\Notepad++\\npp.6.7.8.2.Installer.exe" -InstallerParameters "/S" -RegistryKey "HKLM:\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Notepad++" -RegistryName "DisplayVersion" -RegistryValue "6.7.8.2" -LogPath \\\\Server\\Logfiles$\\ \[/sourcecode\]

The PowerShell script parameters in the GPO can then be dropped as they are contained in the script itself - this is not ideal, but unless Microsoft lifts this limitation it may be required.

### Parameter Quotes

There is also some odd behaviour passing parameters with quotes (single or double) to the PowerShell scripts in a GPO. I have run into several situations where the use of quotes causes the parameters to either not be passed to the script or passed with additional quotes in them. I recommend the following:

1. DO NOT use single quotes around any parameters - use double quotes around string parameters only.
2. DO NOT end the parameter list with a quoted parameter - this seems to cause the last parameter content to contain an extra quote.

## Summary

In short, if you stick to the above when calling PowerShell scripts with parameters from GPO then you might save yourself a lot of time scratching your head.

As a quick aside, the scripts I wrote as part of this (for installing Windows QFE Hotfixes and Applications via GPO) are available on Microsoft Script Center [here](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-Install-70009e38 "PowerShell Scripts to Install Application (EXE) or Update (MSU) using GPO"). I will be writing a full post on these scripts later in the week.
