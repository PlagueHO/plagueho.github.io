---
title: "Installing a Two-Tier PKI using nothing but Desired State Configuration - Part 1"
date: 2015-09-12
description: "A post about using Desired State Configuration to install a two-tier PKI."
tags: 
  - "certificate-services"
  - "dsc"
  - "powershell"
isArchived: true
---

I am a firm believer in the concept of [Infrastructure as Code](http://devops.com/2014/05/05/meet-infrastructure-code/). I do think technologies such as [Chef](https://www.chef.io/) and [Windows PowerShell Desired State Configuration (DSC)](https://technet.microsoft.com/en-us/library/dn249912.aspx) will eventually replace 'clickety-click' administration in medium to large environments, and even some smaller sites. If you're not familiar with these technologies or concepts I'd strongly recommend you take a look at the above links.

Note: This post is going to be quite long and it does assume you have a basic understanding of [Desired State Configuration (DSC)](https://technet.microsoft.com/en-us/library/dn249912.aspx) and [Windows Active Directory Certificate Services (AD CS)](http://social.technet.microsoft.com/wiki/contents/articles/1137.active-directory-certificate-services-ad-cs-introduction.aspx). If you're not comfortable creating basic DSC configuration files or have never installed AD CS then you might want to get familiar with doing this before jumping into this post.

### Other Parts in this Series

[Installing a Two-Tier PKI using nothing but Desired State Configuration - Part 2](https://dscottraynsford.wordpress.com/2015/09/13/installing-a-two-tier-pki-using-nothing-but-desired-state-configuration-part-2/)

### The Goal

But it's all well and good to say I think it is the future, but how about I put my money where my mouth is and actually use DSC to implement something much more complicated than a simple IIS web site. Sure, DSC can and should be used for straight forward infrastructure configuration, but what about something like a two-tier PKI with an offline **Standalone Root CA** as well as one or more **Enterprise Subordinate CAs**? As part of my [LabBuilder](https://github.com/PlagueHO/LabBuilder) project I was going to have to find out. Basically, I was going to try and implement [this](http://social.technet.microsoft.com/wiki/contents/articles/15037.ad-cs-step-by-step-guide-two-tier-pki-hierarchy-deployment.aspx) using nothing more than Desired State Configuration. If you're interested in seeing how this is done, continue reading.

### Why is this Complicated?

The difficulty with installing a two-tier PKI is that the Root CA and Issuing/Sub CA installation processes are interdependent. For example, to install the Sub CA an Issuing certificate must be issued by the Root CA, but this can only be done by the Sub CA issuing the request. The Request gets copied to the Root CA and issued and then the Issuing Certificate copied back to the Sub CA and installed. Therefore, there would need to be at least two DSC configurations, one on the Root CA and one on each Sub CA and they would be running at the same time, interacting with each other and waiting for various processed on each machine to complete before proceeding. This will become clearer later on in this post. To allow a DSC configuration to wait for a step to complete on another machine in another DSC configuration requires the [WaitFor DSC resource](http://blogs.msdn.com/b/powershell/archive/2015/07/09/validate-powershell-dsc-waitfor.aspx) that is only available in [WMF 5.0](http://blogs.msdn.com/b/powershell/archive/2015/08/31/windows-management-framework-5-0-production-preview-is-now-available.aspx).

### Requirements

To be able to do this you'll need several things:

1. A Hyper-V Host with the following Guest VMs:
    1. A standalone clean Windows Server 2012 R2 Core server that will become the Standalone Root CA. In my system this computer is called **SS\_ROOTCA**.
    1. A Domain Controller that the Enterprise Issuing/Sub CA will become a part of. My domain was called **LABBUILDER.COM**.
    1. One or more standalone clean Windows Server 2012 R2 Core servers that will become the Enterprise Issuing/Sub CAs. In my system I was only using a single Sub CA and it was named  **SA\_SUBCA**. But you could use multiple Sub CAs, the following scripts do support more than one Sub CA.
1. A computer to create the DSC configuration files on that has [RSAT](https://www.microsoft.com/en-us/download/details.aspx?id=45520) installed (the version appropriate to the operating system).
1. [WMF 5.0](http://blogs.msdn.com/b/powershell/archive/2015/08/31/windows-management-framework-5-0-production-preview-is-now-available.aspx) installed on all the above servers as well as the computer you're creating the DSC configuration on.
1. The above servers need to be able to communicate with one another via networking (virtual or physical).

> [!NOTE]
> In a production environment it is recommended that the Root CA is kept _offline_ and is _never connected to a network_. Therefore this DSC process wouldn't actually work. It could be made to work by doing some tricky things like waiting for external storage to be connected and so on, but I'm not even going to go there for this post.

### Server Core vs. Full

I used **Windows Server Core** installations for my PKI servers, but you could just as easily use Full installations if you wanted. However, I think given what I'm trying to achieve, using Server Core makes more sense - and besides, it's simply the way to go when you're talking about _Infrastructure as Code_. In fact, if AD CS was available on [Server Nano](https://dscottraynsford.wordpress.com/2015/05/08/install-windows-server-nano-the-easy-way/) I would be trying to use that instead. You can still use RSAT to work with these Server Core installations should you need to.

### Resources

The DSC configuration files are going to require a few additional **DSC resources**. These DSC resources will need to be installed onto the PKI servers _and_ the computer you're using to compile the DSC Configurations into MOF files. The resources you'll need are:

1. **PSDesiredStateConfiguration** - this is build in to the core DSC installation, so it doesn't need to be downloaded.
2. **xADCSDeployment** - this is a [community DSC resource](https://github.com/PowerShell/xAdcsDeployment) required to perform post installation configuration of ADCS.
3. **xPSDesiredStateConfiguration** - we need this [community DSC resource](https://github.com/PowerShell/xPSDesiredStateConfiguration) for the xRemoteFile DSC Resource.
4. **xComputerManagement** \- this [community DSC resource](https://github.com/PowerShell/xComputerManagement) is required to join the Sub CA to the domain.

The easiest way to do this on PowerShell 5.0 is using the **Find-Module** and **Install-Module** cmdlets from the **PowerShellGet** module to download these from the [PowerShell Gallery](https://www.powershellgallery.com/):

```powershell
Find-Module xPSDesiredStateConfiguration, xADCSDeployment, xComputerManagement | Install-Module
```

### AllNodes

To make things a little bit more generic I like to put all the variables that the DSC configuration files are going to require into an **AllNodes** hash table, with one for each server. Also, normally I'll have a self-signed certificate generated on each server and copied down to the computer that is creating the configuration files so that the various credentials can be encrypted - see [this post](http://blogs.msdn.com/b/powershell/archive/2014/01/31/want-to-secure-credentials-in-windows-powershell-desired-state-configuration.aspx) or [this post](https://technet.microsoft.com/en-us/library/dn781430.aspx) for details on how this works. This is optional and you can use the **PSDscAllowPlainTextPassword = $true** option in the Node if you want to just send the credentials in the clear.

#### Important Note Regarding Credential Encryption in DSC

**Don't** use the _New-SelfSignedCertificate_ cmdlet to create a self-signed certificate to encrypt your credentials. It creates a certificate that will not work here (the private key is not accessible). Instead, use [this script](https://gallery.technet.microsoft.com/scriptcenter/Self-signed-certificate-5920a7c6) from the script center. You will waste a lot of time trying to figure out what is wrong.

#### AllNodes for Root CA

These are the Node parameters that contain the variables that you'll want to configure for the Root CA. They are fairly self explanatory but they will be covered later on in the post.

```powershell
AllNodes = @(
    @{
        NodeName = 'SS_ROOTCA'
        Thumbprint = 'CDD4EEAE6000AC7F40C3802C171E30148030C072'
        LocalAdminPassword = 'P@ssword!1'
        CACommonName = "LABBUILDER.COM Root CA"
        CADistinguishedNameSuffix = "DC=LABBUILDER,DC=COM"
        CRLPublicationURLs = "1:C:\Windows\system32\CertSrv\CertEnroll\%3%8%9.crl\n10:ldap:///CN=%7%8,CN=%2,CN=CDP,CN=Public Key Services,CN=Services,%6%10\n2:http://pki.labbuilder.com/CertEnroll/%3%8%9.crl"
        CACertPublicationURLs = "1:C:\Windows\system32\CertSrv\CertEnroll\%1_%3%4.crt\n2:ldap:///CN=%7,CN=AIA,CN=Public Key Services,CN=Services,%6%11\n2:http://pki.labbuilder.com/CertEnroll/%1_%3%4.crt"
        SubCAs = @('SA_SUBCA')
    }
)
```

#### AllNodes for Sub CA

And these are the parameters for each Subordinate CA. If you had more than one Sub CA then you could add additional nodes. The variables are fairly self explanatory but they will be covered later on in the post.

```powershell
AllNodes = @(
    @{
        NodeName = 'SA_SUBCA'
        Thumbprint = '8F43288AD272F3103B6FB1428485EA3014C0BCFE'
        LocalAdminPassword = 'P@ssword!1'
        DomainName = "LABBUILDER.COM"
        DomainAdminPassword = "P@ssword!1"
        PSDscAllowDomainUser = $True
        CACommonName = "LABBUILDER.COM Issuing CA"
        CADistinguishedNameSuffix = "DC=LABBUILDER,DC=COM"
        CRLPublicationURLs = "65:C:\Windows\system32\CertSrv\CertEnroll\%3%8%9.crl\n79:ldap:///CN=%7%8,CN=%2,CN=CDP,CN=Public Key Services,CN=Services,%6%10\n6:http://pki.labbuilder.com/CertEnroll/%3%8%9.crl"
        CACertPublicationURLs = "1:C:\Windows\system32\CertSrv\CertEnroll\%1_%3%4.crt\n2:ldap:///CN=%7,CN=AIA,CN=Public Key Services,CN=Services,%6%11\n2:http://pki.labbuilder.com/CertEnroll/%1_%3%4.crt"
        RootCAName = "SS_ROOTCA"
        RootCACRTName = "SS_ROOTCA_LABBUILDER.COM Root CA.crt"
    }
)
```

### Step 1: Installing the Root CA

First things first. We need to create a credential object that will be used to perform various steps in the process. This is a local credential as this is a standalone server.

```powershell
Node $AllNodes.NodeName {
    # Assemble the Local Admin Credentials
    if ($Node.LocalAdminPassword) {
        [PSCredential]$LocalAdminCredential = New-Object System.Management.Automation.PSCredential (
            "Administrator",
            (ConvertTo-SecureString $Node.LocalAdminPassword -AsPlainText -Force)
        )
    }
}
```

Next up we'll install the **ADCS Certificate Authority** and the **ADCS Web Enrollment** features. Normally on a standalone Root CA you wouldn't bother installing the ADCS Web Enrollment feature, but in our case it is an easy way to have the _CertEnroll_ website virtual folder created which we use to transfer the Root CA Cert and the Issuing CA Cert (later on).

```powershell
# Install the ADCS Certificate Authority
WindowsFeature ADCSCA {
    Name   = 'ADCS-Cert-Authority'
    Ensure = 'Present'
}

# Install ADCS Web Enrollment - only required because it creates the CertEnroll virtual folder
# Which we use to pass certificates to the Issuing/Sub CAs
WindowsFeature ADCSWebEnrollment {
    Ensure    = 'Present'
    Name      = 'ADCS-Web-Enrollment'
    DependsOn = '[WindowsFeature]ADCSCA'
}
```

Next on the agenda is we create a **CAPolicy.inf** file - this file configures some basic parameters that will be used by the Root CA certificate and server:

```powershell
# Create the CAPolicy.inf file which defines basic properties about the ROOT CA certificate
File CAPolicy {
    Ensure          = 'Present'
    DestinationPath = 'C:\Windows\CAPolicy.inf'
    Contents        = "[Version]`r`nSignature=`"$Windows NT$`"`r`n[Certsrv_Server]`r`nRenewalKeyLength=4096`r`nRenewalValidityPeriod=Years`r`nRenewalValidityPeriodUnits=20`r`nCRLDeltaPeriod=Days`r`nCRLDeltaPeriodUnits=0`r`n[CRLDistributionPoint]`r`n[AuthorityInformationAccess]`r`n"
    Type            = 'File'
    DependsOn       = '[WindowsFeature]ADCSWebEnrollment'
}
```

And now the **ADCS Certificate Authority** and the **ADCS Web Enrollment** features can be configured. Notice we are using some of the Nodes parameters here as well as the Local Administrator Credentials:

```powershell
# Configure the CA as Standalone Root CA
xADCSCertificationAuthority ConfigCA {
    Ensure                   = 'Present'
    Credential               = $LocalAdminCredential
    CAType                   = 'StandaloneRootCA'
    CACommonName             = $Node.CACommonName
    CADistinguishedNameSuffix = $Node.CADistinguishedNameSuffix
    ValidityPeriod           = 'Years'
    ValidityPeriodUnits      = 20
    DependsOn                = '[File]CAPolicy'
}

# Configure the ADCS Web Enrollment
xADCSWebEnrollment ConfigWebEnrollment {
    Ensure    = 'Present'
    Name      = 'ConfigWebEnrollment'
    Credential = $LocalAdminCredential
    DependsOn = '[xADCSCertificationAuthority]ConfigCA'
}
```

Now, here is where things get interesting. We need to configure some of the more advanced properties of the CA such as the _AIA_ and _CDP extensions_. The problem is that there is no DSC resource for doing this and there aren't even any native PowerShell cmdlets either! So I had to resort to the _DSC Script resource_ in combination with the **CertUtil.exe** tool and **registry** entries:

```powershell
# Set the advanced CA properties
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

The above section was actually detailed in my previous post [here](https://dscottraynsford.wordpress.com/2015/09/03/advanced-certificate-services-configuration-with-dsc/). With all that done the Root CA is installed and ready to go. But this DSC configuration script is not yet finished, but we can't go any further until the Sub CA DSC has progressed. It is important to keep in mind that these DSC scripts are running at the same time on different machines and will interact with one another during this process.

This also seems like an appropriate time to take a break. The really interesting stuff is yet to come, but it is getting close to my bedtime and so I'll continue this in part 2 tomorrow. This will cover the **Sub CA DSC configuration** and the final part of the **Root CA DSC configuration**. Hopefully someone out there has stuck with me till this point! :)

### Next Part

[Installing a Two-Tier PKI using nothing but Desired State Configuration - Part 2](https://dscottraynsford.wordpress.com/2015/09/13/installing-a-two-tier-pki-using-nothing-but-desired-state-configuration-part-2/)
