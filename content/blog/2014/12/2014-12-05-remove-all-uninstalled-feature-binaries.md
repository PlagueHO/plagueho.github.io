---
title: "Remove all Uninstalled Feature Binaries"
date: "2014-12-05"
categories:
  - "features-on-demand"
  - "windows-server-2012"
tags:
  - "powershell"
---

I'm still getting my head around this whole blog thing, but I'm going to write a quick article about trimming down a Windows Server 2012 install while I wait for my partner to recover from a small bout of vertigo.

The "Features on Demand" feature of Windows Server 2012 is really great at trimming down a Windows Server 2012 installation.

To use the "Features on Demand" you need to "remove" the binaries required by any features that aren't currently installed by your OS. You can remove them one by one, but this is a real drag.

The following command will remove the binaries for any non-installed features on your system:

get-windowsfeature | where-object -FilterScript { $\_.InstallState -eq 'Available' } | remove-windowsfeature -remove

[![Features on Demand Removal Progress](/images/ss_psfeaturesondemandremovalprogress.png?w=646)](/images/ss_psfeaturesondemandremovalprogress.png)
Features on Demand Removal Progress

[![Features on Demand Removal Complete ](/images/ss_psfeaturesondemandremovalcomplete.png?w=646)](/images/ss_psfeaturesondemandremovalcomplete.png)
Features on Demand Removal Complete

After you've run this command you'll need to have your windows install source available if you want to install any additional features. You might also need to specify an alternate source location when installing any future features. For more information on installing windows features from an alternate source, see this article on TechNet:

[Install or Uninstall Roles, Role Services, or Features](http://technet.microsoft.com/en-us/library/hh831809.aspx "Install or Uninstall Roles, Role Services, or Features")

I usually like to run this command when I'm preparing a new VM template after I've installed all the features I think will be needed for this VM. This results in a smaller deployment footprint.
