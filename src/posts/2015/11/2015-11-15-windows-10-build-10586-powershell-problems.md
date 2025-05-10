---
title: "Windows 10 Build 10586 - PowerShell Problems"
date: 2015-11-15
description: "PowerShell Direct and DSC problems in Windows 10 Build 10586."
tags:
  - "desired-state-configuration"
  - "windows-10"
  - "dsc"
  - "powershell"
  - "powershell-direct"
image: "/assets/images/blog/ss_powershell_version10586.png"
---

## PowerShell Direct Broken

Unfortunately my Sunday afternoon of planned study has been slightly derailed, as last night I just upgraded my primary work machine to Windows 10 Build 10586. Everything went fine with the upgrade and seemed to be working just perfectly. However, when I started to get to work with my Hyper-V lab machines today I ran into a significant bug with PowerShell on this build:

**PowerShell Direct** no longer connects to any of my VMs. It pauses for approximately 30 seconds and then reports a rather mysterious error:

An error has occurred which Windows PowerShell cannot handle. A remote session might have ended.

[![But it was working yesterday!](/assets/images/blog/ss_powershelldirect_errormessage.png)](/assets/images/blog/ss_powershelldirect_errormessage.png)
But it was working yesterday!

Passing credentials that are correct or incorrect for the VM have no effect - the error message is always the same.

Fortunately connecting via plain old **PowerShell Remoting** still works fine, but I have many scripts that are dependent on using **PowerShell Direct** that are no longer functioning - including my [LabBuilder](https://github.com/PlagueHO/LabBuilder) project, which I use every day to get my Hyper-V lab up and running for my studies.

I've logged this issue in Windows Connect right [here](https://connect.microsoft.com/PowerShell/Feedback/Details/2018831). So if you're being affected by this issue please go and vote it up to see if it can't be resolved quickly. This was a fantastic feature that was only added recently and it is sad to see it being broken so soon!

## Encrypting Credentials in DSC MOF Files

Anyone who has put properly encrypted credentials in DSC configuration files knows that they need to be encrypted using a certificate that was issued to the Node that will be reading the configuration. This is usually fairly straight forward, but some care needs to be taken when generating the certificate for the Node to use.

I have an automated process designed for my Lab where any new VM's that get built are automatically issued with a **self-signed** certificate that will be used to encrypt the DSC config files. This certificate is automatically downloaded to the host (via **PowerShell Direct** of course) and then used to **encrypt** the _DSC config_ files for that node. All completely seamless and automatic. Until build 10586, when these certificates are no longer able to be used to encrypt the MOF file. Instead I get this error:

ConvertTo-MOFInstance : System.ArgumentException error processing property 'Password' OF TYPE 'MSFT\_Credential': Certificate '8E474886A6AA72859BDC3C2FBEEFAAD7E089A5DD' cannot be used for encryption. Encryption certificates
must contain the Data Encipherment or Key Encipherment key usage, and include the Document Encryption Enhanced Key Usage (1.3.6.1.4.1.311.80.1).

Ok, so this isn't the end of the world and it is pretty clear what has changed here. After looking at my existing self-signed certificates they didn't include the **EKU** (Enhanced Key Usage) of **Document Encrpytion**.

[![My previous certificates - now useless because the Document Encryption EKU is missing.](/assets/images/blog/ss_certificate_selfsignedbad.png)](/assets/images/blog/ss_certificate_selfsignedbad.png)
My previous certificates - now useless because the Document Encryption EKU is missing.

It seems this is now required to encrypt credentials in MOF Files. I guess this makes sense and I'm sure not that many people are going to run into the problem. But in case you do, you'll need to reissue these certificates including the following EKU:

**Document Encryption (1.3.6.1.4.1.311.80.1)**

You also need to ensure the Key Usage contains either **Data Encipherment** or **Key Encipherment**.

Finally, I have one strong recommendation related to the topic of encrypting DSC credentials: Don't use the built in PowerShell cmdlet **New-SelfSignedCertificate** to create self-signed certificates for this purpose. It creates certificates that are not compatible for other reasons (I won't go into detail but you can look the issue up I'm sure). Instead I strongly recommend you use [this script](https://gallery.technet.microsoft.com/scriptcenter/Self-signed-certificate-5920a7c6) on MSDN Script Center.

## Decryption Failed

**Update 2015-12-18:** Installing **Windows Management Framework (WMF) 5.0 RTM** on the **DSC node** resolves the **Decryption Failed** error described below. So if you're experiencing this issue, install [this](https://www.microsoft.com/en-us/download/details.aspx?id=50395) update on any **DSC nodes** experiencing this problem.

**Edit: Karl** in his comment on this post mentioned a problem he was having where the DSC node was failing to decrypt any credentials provided in DSC MOF files created on the build 10586. He was receiving a **Dercyption Failed** error when the MOF was being applied to the node:

![ss_dsc_decryptionfailed](/assets/images/blog/ss_dsc_decryptionfailed.png)

I hadn't noticed this issue because I hadn't been working on DSC for a week, but when I tried to apply a rebuilt MOF file I experienced the same issue.

It was also reported that the **password** property format of the **MSFT\_Credential** object in the **MOF** seems to have changed in one of the recent releases from:

instance of MSFT\_Credential as $MSFT\_Credential2ref
{
  Password = "...Base64Password...";
  UserName = "LABBUILDER.COM\\\\Administrator";
};

To:

instance of MSFT\_Credential as $MSFT\_Credential2ref
{
  Password = "-----BEGIN CMS-----\\n...base64Password...\\n-----END CMS-----";
  UserName = "LABBUILDER.COM\\\\Administrator";
};

After a full day of investigating this issue, I can confirm it has been caused by a change the Microsoft has made in the _PSDesiredStateConfigration_ module supplied with this build (specifically the **Get-EncryptedPassword** function, in case you're interested). This issue has been reported to Microsoft on **PowerShell Connect** [here](https://connect.microsoft.com/PowerShell/Feedback/Details/2080033). Please go an **upvote** it if you're having this problem (even if you're not). **Karl** has posted this issue on [Stack Overflow](http://stackoverflow.com/questions/34006865/dsc-problems-with-credentials-and-build-10586).

In the mean time I have posted a work around (roll back to a previous version of the **PSDesiredStateConfiguration** module on the [Stack Overflow page](http://stackoverflow.com/questions/34006865/dsc-problems-with-credentials-and-build-10586)) - so if you want to work around this problem, [go](http://stackoverflow.com/questions/34006865/dsc-problems-with-credentials-and-build-10586) and take a look.

## DSC is Practically Broken in 10586

**Update**: After finishing this last post I've run into some critical problems with **DSC** on build 10586. Specifically, when I build a DSC configuration on this machine and include the **PSDesiredStateConfiguration** resource (by way of **Import-DSCResource** cmdlet) the MOF file that is created references a 1.0 version of the module - **which doesn't exist:**

[![Version 1.0 isn't on the machine!](/assets/images/blog/ss_dsc_badmofversion.png)](/assets/images/blog/ss_dsc_badmofversion.png)
Version 1.0 isn't on the machine!

Applying the MOF file to any node immediately throws an error because of course this module doesn't exist (1.1 is the earliest version of this module that are on any of the nodes).

However, if I _force_ the module version to **1.1** in the **Import-DSCResource** cmdlet then the MOF file that is created has the correct module version and can be applied to the node without any issue:

[![Forcing the Module Version.](/assets/images/blog/ss_dsc_howtofixmoduleversion.png)](/assets/images/blog/ss_dsc_howtofixmoduleversion.png)
Forcing the Module Version.

But of course going around all my config files and forcing the module version to 1.1 is a very unsatisfactory solution. Also, I'm not sure if it is just the **PSDesiredStateConfiguration** resource that has this problem or all modules. I haven't had the time to investigate this further yet.

If you are suffering from any of these issues in build 10586, please let me know.

Thanks for reading!
