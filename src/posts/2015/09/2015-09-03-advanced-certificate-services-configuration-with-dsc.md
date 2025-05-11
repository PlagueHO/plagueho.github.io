---
title: "Advanced Certificate Services Configuration with DSC"
date: 2015-09-03
description: "Advanced Certificate Services Configuration with DSC"
tags: 
  - "certificate-services"
  - "dsc"
  - "powershell"
isArchived: true
---

Recently I've been rebuilding my Hyper-V lab environment from scratch (as part of my MCSA/MCSE studying) and decided I would completely script the process using PowerShell only. My goal was to not require a single interactive session with any of the servers to set up the entire environment. This was a multi-site AD environment with several other member servers performing other duties including NPS & NAP, ADCS, WDS, WSUS, ADFS, ADRMS, IIS, DirectAccess, SQL, etc. I also wanted this to include a proper Multi-tier PKI environment with both a standalone Root CA and an Enterprise Subordinate CA (as is recommended by Microsoft).

### The Problem

To configure an AD CS using DSC is very straightforward using the [xADCSDeployment](https://github.com/PowerShell/xAdcsDeployment) DSC Resource. However, anyone who has installed an enterprise PKI is probably familiar with the fact that **AIA** and **CDP** settings need to be configured for the CA so that any generated certificates can include these extensions. Unfortunately, the xADCSDeployment DSC Resource doesn't support setting these Certificate Services options because the underlying AD CS PowerShell cmdlets don't allow setting these options either.

### The Solution

The solution to this problem is to use the DSC [Script](https://technet.microsoft.com/en-us/library/dn282130.aspx) Resource to call the [CertUtil.exe](https://technet.microsoft.com/en-us/library/cc732443.aspx) application to set these values. To do this, I set the **SetScript** resource parameter like this:

```powershell
SetScript = {
    if ($Using:Node.CADistinguishedNameSuffix) {
        & "$($ENV:SystemRoot)\system32\certutil.exe" -setreg CA\DSConfigDN "CN=Configuration,$($Using:Node.CADistinguishedNameSuffix)"
        & "$($ENV:SystemRoot)\system32\certutil.exe" -setreg CA\DSDomainDN "$($Using:Node.CADistinguishedNameSuffix)"
    }
    if ($Using:Node.CRLPublicationURLs) {
        & "$($ENV:SystemRoot)\System32\certutil.exe" -setreg CA\CRLPublicationURLs $($Using:Node.CRLPublicationURLs)
    }
    if ($Using:Node.CACertPublicationURLs) {
        & "$($ENV:SystemRoot)\System32\certutil.exe" -setreg CA\CACertPublicationURLs $($Using:Node.CACertPublicationURLs)
    }
    Restart-Service -Name CertSvc
    Add-Content -Path 'c:\windows\setup\scripts\certutil.log' -Value "Certificate Service Restarted ..."
}
```

The above code expects the `$Node` object to contain several properties that it will use to set applicable settings in the CA server:

- **CADistinguishedNameSuffix** - This is the Directory Services Distinguished Name (e.g., `DC=bmdlab,DC=com`). If left blank, then your CDP and AIA LDAP Addresses will be incorrect.
- **CRLPublicationURLs** - The CRL Publication URLs in the same format as you would normally pass to the **certutil.exe** application.
- **CACertPublicationURLs** - The CA Cert Publication URLs (AIA Extension) in the same format as you would normally pass to the **certutil.exe** application.

> **Note:** To access the `$Node` object in the script resource, you'll need to use the **Using** keyword; otherwise, the `$Node` object won't be available in the external script scope.

Finally, after these values have been set, the **CertSvc** needs to be restarted.

### What about TestScript?

You might look at the above code and wonder, "won't the CertSvc be restarted every 30 minutes no matter what?" That is where the **TestScript** resource parameter comes in. We'll use this to decide if the current values of the CA are different from what we want them to be. In this case, we dive straight to the registry rather than using the **CertUtil.exe** application.

```powershell
TestScript = {
    if (((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSConfigDN') -ne "CN=Configuration,$($Using:Node.CADistinguishedNameSuffix)")) { return $false }
    if (((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSDomainDN') -ne "$($Using:Node.CADistinguishedNameSuffix)")) { return $false }
    if (($Using:Node.CRLPublicationURLs) -and ((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CRLPublicationURLs') -ne $Using:Node.CRLPublicationURLs)) { return $false }
    if (($Using:Node.CACertPublicationURLs) -and ((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CACertPublicationURLs') -ne $Using:Node.CACertPublicationURLs)) { return $false }
    return $true
}
```

Once again, I need to ensure the **Using** scope is used with the **Node** variable. If any of the node properties don't match the registry value, then **false** is returned, which triggers **SetScript**. If all of the values match, **true** is returned (meaning everything is the same), and **SetScript** isn't fired.

### Is That It?

Almost. Finally, I needed to implement the **GetScript** parameter of the resource. This was the easiest part:

```powershell
GetScript = {
    return @{
        'DSConfigDN'          = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSConfigDN')
        'DSDomainDN'          = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSDomainDN')
        'CRLPublicationURLs'  = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CRLPublicationURLs')
        'CACertPublicationURLs' = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CACertPublicationURLs')
    }
}
```

I could also adjust the **TestScript** to call the **GetScript** and then use the returned hash table to compare with the **Node** values instead of comparing them directly with the registry values. But I didn't.

### Final Script

Here is what the final script looks like (I didn't include everything in the DSC Configuration as there were lots of other resources for creating the machine):

```powershell
Script ADCSAdvConfig {
    SetScript = {
        if ($Using:Node.CADistinguishedNameSuffix) {
            & "$($ENV:SystemRoot)\system32\certutil.exe" -setreg CA\DSConfigDN "CN=Configuration,$($Using:Node.CADistinguishedNameSuffix)"
            & "$($ENV:SystemRoot)\system32\certutil.exe" -setreg CA\DSDomainDN "$($Using:Node.CADistinguishedNameSuffix)"
        }
        if ($Using:Node.CRLPublicationURLs) {
            & "$($ENV:SystemRoot)\System32\certutil.exe" -setreg CA\CRLPublicationURLs $($Using:Node.CRLPublicationURLs)
        }
        if ($Using:Node.CACertPublicationURLs) {
            & "$($ENV:SystemRoot)\System32\certutil.exe" -setreg CA\CACertPublicationURLs $($Using:Node.CACertPublicationURLs)
        }
        Restart-Service -Name CertSvc
        Add-Content -Path 'c:\windows\setup\scripts\certutil.log' -Value "Certificate Service Restarted ..."
    }
    GetScript = {
        return @{
            'DSConfigDN'          = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSConfigDN')
            'DSDomainDN'          = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSDomainDN')
            'CRLPublicationURLs'  = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CRLPublicationURLs')
            'CACertPublicationURLs' = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CACertPublicationURLs')
        }
    }
    TestScript = {
        if (((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSConfigDN') -ne "CN=Configuration,$($Using:Node.CADistinguishedNameSuffix)")) { return $false }
        if (((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSDomainDN') -ne "$($Using:Node.CADistinguishedNameSuffix)")) { return $false }
        if (($Using:Node.CRLPublicationURLs) -and ((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CRLPublicationURLs') -ne $Using:Node.CRLPublicationURLs)) { return $false }
        if (($Using:Node.CACertPublicationURLs) -and ((Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CACertPublicationURLs') -ne $Using:Node.CACertPublicationURLs)) { return $false }
        return $true
    }
    DependsOn = '[xADCSWebEnrollment]ConfigWebEnrollment'
}
```

Hopefully, someone will make sense of all this. It should also be useful in other similar situations where there are no relevant DSC resources.
