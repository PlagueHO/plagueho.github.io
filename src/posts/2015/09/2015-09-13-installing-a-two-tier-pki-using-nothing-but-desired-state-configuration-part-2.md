---
title: "Installing a Two-Tier PKI using nothing but Desired State Configuration – Part 2"
date: 2015-09-13
description: "Continuing on from Part 1, this article covers the installation of the Subordinate CA and the issuing of the Subordinate CA certificate by the Root CA."
tags: 
  - "certificate-services"
  - "desired-state-configuration"
  - "powershell"
isArchived: true
---

Continuing on from yesterday, the goal of this series is show how it is possible to install a two-tier Active Directory Certificate Services environment using only Desired State Configuration. In [Part 1](/blog/installing-a-two-tier-pki-using-nothing-but-desired-state-configuration-part-1/), I covered the basic DSC setup and requirements, the AllNodes hash table and the first part of the Root CA configuration script.

### Other Parts in this Series

[Installing a Two-Tier PKI using nothing but Desired State Configuration - Part 1](/blog/installing-a-two-tier-pki-using-nothing-but-desired-state-configuration-part-1/)

Lets get going then!

### Step 2: Installing the Subordinate CA

In this configuration we'll need both _Local Credentials_ for installing the Web Enrollment feature and _Domain Credentials_ for joining the Sub CA to the domain and for registering the CA in AD:

```powershell
# Assemble the Local Admin and Domain Admin Credentials
Node $AllNodes.NodeName {
    if ($Node.LocalAdminPassword) {
        [PSCredential]$LocalAdminCredential = New-Object System.Management.Automation.PSCredential (
            "Administrator",
            (ConvertTo-SecureString $Node.LocalAdminPassword -AsPlainText -Force)
        )
    }
    if ($Node.DomainAdminPassword) {
        [PSCredential]$DomainAdminCredential = New-Object System.Management.Automation.PSCredential (
            "$($Node.DomainName)\Administrator",
            (ConvertTo-SecureString $Node.DomainAdminPassword -AsPlainText -Force)
        )
    }
}
```

Just like the Root CA the **ADCS Certificate Authority** and the **ADCS Web Enrollment** features need to be installed. But I'm also going to install the **Online Responder** service as well - you of course don't need to. I really should configure the CRLPublicationURLs node property as well to make use of this Online Responder, but I'm sure you can figure that part out.

```powershell
# Install the RSAT PowerShell Module which is required by the xWaitForResource
WindowsFeature RSATADPowerShell {
    Ensure = "Present"
    Name   = "RSAT-AD-PowerShell"
}

# Install the CA Service
WindowsFeature ADCSCA {
    Name      = 'ADCS-Cert-Authority'
    Ensure    = 'Present'
    DependsOn = "[WindowsFeature]RSATADPowerShell"
}

# Install the Web Enrollment Service
WindowsFeature WebEnrollmentCA {
    Name      = 'ADCS-Web-Enrollment'
    Ensure    = 'Present'
    DependsOn = "[WindowsFeature]ADCSCA"
}

# Install the Online Responder Service
WindowsFeature OnlineResponderCA {
    Name      = 'ADCS-Online-Cert'
    Ensure    = 'Present'
    DependsOn = "[WindowsFeature]WebEnrollmentCA"
}
```

You might have noticed that we're also installing the **RSAT-AD-PowerShell**. This is required by the **xWaitForADDomain DSC resource**. If you don't install this feature the domain will never be detected and the DSC Script will progress no further (I found this out the hard way).

On the agenda next, this machine needs to be joined to the domain. It is important to check the domain is up before trying to join it. In my case I was also creating the DC's (by DSC of course) at the same time as the CA's so sometimes there was a long wait for the Domain to come up (which is why the large retry count):

```powershell
# Wait for the Domain to be available so we can join it.
xWaitForADDomain DscDomainWait {
    DomainName          = $Node.DomainName
    DomainUserCredential = $DomainAdminCredential
    RetryCount          = 100
    RetryIntervalSec    = 10
    DependsOn           = "[WindowsFeature]OnlineResponderCA"
}

# Join this Server to the Domain so that it can be an Enterprise CA.
xComputer JoinDomain {
    Name     = $Node.NodeName
    DomainName = $Node.DomainName
    Credential = $DomainAdminCredential
    DependsOn = "[xWaitForADDomain]DscDomainWait"
}
```

The next step is to create a **CAPolicy.inf** file, but this file is slightly different from the one created on the _Root CA_. The process is the same though:

```powershell
# Create the CAPolicy.inf file that sets basic parameters for certificate issuance for this CA.
File CAPolicy {
    Ensure = 'Present'
    DestinationPath = 'C:\\Windows\\CAPolicy.inf'
    Contents = "\[Version\]\`r\`n Signature= \`"$Windows NT$\`"\`r\`n\[Certsrv\_Server\]\`r\`n RenewalKeyLength=2048\`r\`n RenewalValidityPeriod=Years\`r\`n RenewalValidityPeriodUnits=10\`r\`n LoadDefaultTemplates=1\`r\`n AlternateSignatureAlgorithm=1\`r\`n"
    Type = 'File'
    DependsOn = '\[xComputer\]JoinDomain' }
```

Easy enough so far. What I did next was create a **CertEnroll folder** (c:\\windows\\System32\\CertSrv\\CertEnroll) where the _Root CA certificate_ needed to be put. The Web Enrollment Service would have created this too but I can't configure this service until later. So I'm going to create it manually:

```powershell
# Make a CertEnroll folder to put the Root CA certificate into.
# The CA Web Enrollment server would also create this but we need it now.
File CertEnrollFolder {
    Ensure = 'Present'
    DestinationPath = 'C:\\Windows\\System32\\CertSrv\\CertEnroll'
    Type = 'Directory'
    DependsOn = '\[File\]CAPolicy'
}
```

Next up I wanted to download the Root CA Cert to this Sub CA. Strictly this isn't required till later but I was basically emulating the steps in [this document](http://social.technet.microsoft.com/wiki/contents/articles/15037.ad-cs-step-by-step-guide-two-tier-pki-hierarchy-deployment.aspx#Publish_the_Root_CA_Certificate_and_CRL).

The important thing to remember here though is that we need to ensure the Root CA DSC has reached the point where the Root CA certificate and Certificate Revocation List (CRL) is produced and available to us. So this is where we use the new [PowerShell DSC 5.0 WaitFor](http://blogs.msdn.com/b/powershell/archive/2015/07/09/validate-powershell-dsc-waitfor.aspx) resource:

```powershell
# Wait for the RootCA Web Enrollment to complete so we can grab the Root CA certificate # file.
WaitForAny RootCA {
    ResourceName = '\[xADCSWebEnrollment\]ConfigWebEnrollment'
    NodeName = $Node.RootCAName
    RetryIntervalSec = 30
    RetryCount = 30
    DependsOn = "\[File\]CertEnrollFolder"
}

# Download the Root CA certificate file.
xRemoteFile DownloadRootCACRTFile {
    DestinationPath = "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.RootCAName)\_$($Node.RootCACommonName).crt"
    Uri = "http://$($Node.RootCAName)/CertEnroll/$($Node.RootCAName)\_$($Node.RootCACommonName).crt"
    DependsOn = '\[WaitForAny\]RootCA'
}

# Download the Root CA certificate revocation list.
xRemoteFile DownloadRootCACRLFile {
    DestinationPath = "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.RootCACommonName).crl"
    Uri = "http://$($Node.RootCAName)/CertEnroll/$($Node.RootCACommonName).crl"
    DependsOn = '\[xRemoteFile\]DownloadRootCACRTFile'
}
```

**Note:** using HTTP to copy files between the _Root CA_ and the _Sub CA's_ is not strictly recommended by Microsoft when installing a _two-tier PKI_ because that means the Root CA system has to be connected to the network. Because the _Root CA_ and _Sub CA DSC_ scripts need the machines to directly interact there isn't any way around this that I can see. But if you were using this in a production environment you could put the _Root CA_ machine onto an **isolated virtual network** consisting of the _Root CA_ and _Sub CA_ machines only. It is not a perfect solution but it should be reasonable for most situations. The Root CA can still be taken off line and removed after the Sub CA's have been created.

Following this the _Root CA Certificate_ and _CRL_ can be imported into the **local machine root certificate store** and also the **Active Directory domain**. This is done in a single script resource:

```powershell
# Install the Root CA Certificate to the LocalMachine Root Store and DS
Script InstallRootCACert {
    PSDSCRunAsCredential = $DomainAdminCredential SetScript = {
        Write-Verbose "Registering the Root CA Certificate C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Using:Node.RootCAName)\_$($Using:Node.RootCACommonName).crt in DS..."
        "$($ENV:SystemRoot)\\system32\\certutil.exe" -f -dspublish "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Using:Node.RootCAName)\_$($Using:Node.RootCACommonName).crt" RootCA
        Write-Verbose "Registering the Root CA CRL C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.RootCACommonName).crl in DS..." "$($ENV:SystemRoot)\\system32\\certutil.exe" -f -dspublish "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.RootCACommonName).crl" "$($Using:Node.RootCAName)"
        Write-Verbose "Installing the Root CA Certificate C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Using:Node.RootCAName)\_$($Using:Node.RootCACommonName).crt..." "$($ENV:SystemRoot)\\system32\\certutil.exe" -addstore -f root "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Using:Node.RootCAName)\_$($Using:Node.RootCACommonName).crt"
        Write-Verbose "Installing the Root CA CRL C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.RootCACommonName).crl..." "$($ENV:SystemRoot)\\system32\\certutil.exe" -addstore -f root "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.RootCACommonName).crl"
    }
    GetScript = {
        Return @{
            Installed = ((Get-ChildItem -Path Cert:\\LocalMachine\\Root | Where-Object -FilterScript { ($\_.Subject -Like "CN=$($Using:Node.RootCACommonName),\*") -and ($\_.Issuer -Like "CN=$($Using:Node.RootCACommonName),\*") } ).Count -EQ 0)
        }
    }
    TestScript = {
        If ((Get-ChildItem -Path Cert:\\LocalMachine\\Root | Where-Object -FilterScript { ($\_.Subject -Like "CN=$($Using:Node.RootCACommonName),\*") -and ($\_.Issuer -Like "CN=$($Using:Node.RootCACommonName),\*") } ).Count -EQ 0) {
            Write-Verbose "Root CA Certificate Needs to be installed..."
            Return $False
        }
        Return $True
    }
    DependsOn = '\[xRemoteFile\]DownloadRootCACRTFile'
}
```

I'd actually prefer to break the above code into for separate resources and detect if each one has occurred (and I might do for a later version), but this configuration is extremely large as it is.

Notice here we also used another PowerShell DSC 5.0 feature, the **PSDSCRunAsCredential** parameter. This parameter is available in all _DSC Resources_ and allows us to specify an alternate credential to run this DSC Resource as. By default a DSC Resource is run as **NT AUTHORITY/SYSTEM**, which is usually OK, but in this case some of the commands write certificates into DS and therefore need to be run under a **Domain Admin** account.

Onwards: It is now time to configure the AD CS Certificate Authority and Web Enrollment. Except this time the Certificate Authority configuration will produce a **certificate request (REQ)** that has to be issued by our _Root CA_. So what I did was ensure the REQ file is put into the _CertEnroll_ folder - this should make it accessible by in the _http:\\\\SA\_SUBCA\\CertEnroll\\_ web site.

```powershell
# Configure the Sub CA which will create the Certificate REQ file that Root CA will use
# to issue a certificate for this Sub CA.
xADCSCertificationAuthority ConfigCA {
    Ensure                    = 'Present'
    Credential                = $DomainAdminCredential
    CAType                    = 'EnterpriseSubordinateCA'
    CACommonName              = $Node.CACommonName
    CADistinguishedNameSuffix = $Node.CADistinguishedNameSuffix
    OverwriteExistingCAinDS   = $True
    OutputCertRequestFile     = "c:\windows\system32\certsrv\certenroll\$($Node.NodeName).req"
    DependsOn                 = '[Script]InstallRootCACert'
}

# Configure the Web Enrollment Feature
xADCSWebEnrollment ConfigWebEnrollment {
    Ensure     = 'Present'
    Name       = 'ConfigWebEnrollment'
    Credential = $LocalAdminCredential
    DependsOn  = '[xADCSCertificationAuthority]ConfigCA'
}
```

Seems simple enough - except one small problem. By default IIS doesn't include **REQ** files as supported _mime types_ so the **file can't be downloaded**. To get around this we need to add **REQ** as a supported _mime type_. Unfortunately there is no DSC resource to do this so it's time to resort to the Script resource:

```powershell
# Set the IIS Mime Type to allow the REQ request to be downloaded by the Root CA
Script SetREQMimeType {
    SetScript = {
        Add-WebConfigurationProperty -PSPath IIS:\ -Filter //staticContent -Name "." -Value @{fileExtension='.req';mimeType='application/pkcs10'}
    }
    GetScript = {
        return @{
            'MimeType' = ((Get-WebConfigurationProperty -Filter "//staticContent/mimeMap[@fileExtension='.req']" -PSPath IIS:\ -Name *).mimeType)
        }
    }
    TestScript = {
        if (-not (Get-WebConfigurationProperty -Filter "//staticContent/mimeMap[@fileExtension='.req']" -PSPath IIS:\ -Name *)) {
            # Mime type is not set
            return $False
        }
        # Mime Type is already set
        return $True
    }
    DependsOn = '[xADCSWebEnrollment]ConfigWebEnrollment'
}
```

Right, now an issuing certificate needs to be issued to this _Sub CA_ by the _Root CA_ using the **REQ** that has been created in the **CertEnroll virtual folder** on the _Sub CA_. To do this we need to go back to the **Root CA DSC script** and continue on with it.

### Step 3: Issuing the Sub CA certificate on the Root CA

This is the second component of the **Root CA DSC configuration**. It is a bit more complicated than the first part because it may need to be run more than once - once for each Sub CA that is being created. Therefore the whole part is wrapped in **foreach** loop. This is also the purpose of the **SubCAs** array property of the **AllNodes** object. Each **Sub CA** that will be bought up should be in the list:

```powershell
SubCAs=@('SA\_SUBCA1','SA\_SUBCA2','SA\_SUBCA3')
```

So now that we've got that covered we can start adding to the Root CA DSC Configuration. So here's the start of that **foreach** loop I was talking about:

```powershell
# Generate Issuing certificates for any SubCAs Foreach ($SubCA in $Node.SubCAs) {
```

The first thing to do is wait for the _Sub CA_ to complete creation of the **REQ** file and download it. So once again we use the **WaitForAny** resource. Also note the use of the **$SubCA** variable that is defined by the **foreach** loop:

```powershell
# Wait for SubCA to generate REQ
WaitForAny "WaitForSubCA_$SubCA" {
    ResourceName     = '[xADCSCertificationAuthority]ConfigCA'
    NodeName         = $SubCA
    RetryIntervalSec = 30
    RetryCount       = 30
    DependsOn        = '[Script]ADCSAdvConfig'
}

# Download the REQ from the SubCA 
xRemoteFile "DownloadSubCA\_$SubCA" {
    DestinationPath = "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$SubCA.req"
    Uri = "http://$SubCA/CertEnroll/$SubCA.req"
    DependsOn = "\[WaitForAny\]WaitForSubCA\_$SubCA"
}
```

To make things simple I just downloaded the **REQ** to the **CertEnroll folder** of this _Root CA_. Now, things got a little bit tough here. There is no DSC Resource or even PowerShell modules for issuing a certificate from the **REQ**. We have to fall back to using the DSC Script resource and the **CertReq.exe** and **CertUtil.exe** tools. This is a little bit fiddly and reminds me why I love PowerShell's object based output. I won't go into detail of what is going on here, but if you want me to expand on it let me know.

```powershell
# Generate the Issuing Certificate from the REQ
Script "IssueCert\_$SubCA" {
    SetScript = {
        Write-Verbose "Submitting C:\\Windows\\System32\\CertSrv\\CertEnroll\\$Using:SubCA.req to $($Using:Node.CACommonName)"
        [String]$RequestResult = "$($ENV:SystemRoot)\\System32\\Certreq.exe" -Config ".\\$($Using:Node.CACommonName)" -Submit "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$Using:SubCA.req"
        $Matches = [Regex]::Match($RequestResult, 'RequestId:\\s(\[0-9\]\*)')
        If ($Matches.Groups.Count -lt 2) {
            Write-Verbose "Error getting Request ID from SubCA certificate submission."
            Throw "Error getting Request ID from SubCA certificate submission."
        }
        [int]$RequestId = $Matches.Groups\[1\].Value
        Write-Verbose "Issuing $RequestId in $($Using:Node.CACommonName)"
        [String]$SubmitResult = "$($ENV:SystemRoot)\\System32\\CertUtil.exe" -Resubmit $RequestId
        If ($SubmitResult -notlike 'Certificate issued.\*') {
            Write-Verbose "Unexpected result issuing SubCA request."
            Throw "Unexpected result issuing SubCA request."
        }
        Write-Verbose "Retrieving C:\\Windows\\System32\\CertSrv\\CertEnroll\\$Using:SubCA.req from $($Using:Node.CACommonName)"
        [String]$RetrieveResult = "$($ENV:SystemRoot)\\System32\\Certreq.exe" -Config ".\\$($Using:Node.CACommonName)" -Retrieve $RequestId "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$Using:SubCA.crt"
    }
    GetScript = {
        Return @{ 'Generated' = (Test-Path -Path "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$Using:SubCA.crt"); }
    }
    TestScript = {
        If (-not (Test-Path -Path "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$Using:SubCA.crt")) {
            # SubCA Cert is not yet created
            Return $False
        }
        # SubCA Cert has been created
        Return $True
    }
    DependsOn = "\[xRemoteFile\]DownloadSubCA\_$SubCA"
}
```

That is all we actually need to do in the loop on the _Root CA_. It is now up to each _Sub CA_ to download the new **Issuing Certificate** and install it.

### Step 4: Installing the Issuing Certificate on the Sub CA

Now that an Issuing Certificate is available to be downloaded from the _Root CA_ for each _Sub CA_, the configuration script for each _Sub CA_ can continue. But as always the script needs to use the **WaitFor resource** (really have to love this resource) to ensure that the certificate is available:

```powershell
# Wait for the Root CA to have completed issuance of the certificate for this SubCA.
WaitForAny SubCACer {
    ResourceName = "\[Script\]IssueCert\_$($Node.NodeName)"
    NodeName = $Node.RootCAName
    RetryIntervalSec = 30
    RetryCount = 30
    DependsOn = "\[Script\]SetREQMimeType"
}

# Download the Certificate for this SubCA.
xRemoteFile DownloadSubCACERFile {
    DestinationPath = "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Node.NodeName).cer"
    Uri = "http://$($Node.RootCAName)/CertEnroll/$($Node.NodeName).cer"
    DependsOn = '\[WaitForAny\]SubCACer'
}

# Register the Sub CA Certificate with the Certification Authority
Script RegisterSubCA {
    PSDSCRunAsCredential = $DomainAdminCredential
    SetScript = {
        Write-Verbose "Registering the Sub CA Certificate with the Certification Authority C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Using:Node.NodeName)\_$($Using:Node.CACommonName).crt..."
        "$($ENV:SystemRoot)\\system32\\certutil.exe" -installCert "C:\\Windows\\System32\\CertSrv\\CertEnroll\\$($Using:Node.NodeName)\_$($Using:Node.CACommonName).crt"
    }
    GetScript = {
        Return @{ }
    }
    TestScript = {
        If (-not (Get-ChildItem 'HKLM:\\System\\CurrentControlSet\\Services\\CertSvc\\Configuration').GetValue('CACertHash')) {
            Write-Verbose "Sub CA Certificate needs to be registered with the Certification Authority..."
            Return $False
        }
        Return $True
    }
    DependsOn = '\[xRemoteFile\]DownloadSubCACERFile'
}
```

**Note**: It is always important to remember that when using the **Script DSC Resource** if you want to use any variables that are declared outside the resource you'll need to prefix them with the **Using:** keyword. I have wasted many hours tracking down issues caused by missing this vital keyword!

Again, we're running the above script resource using the **PSDSCRunAsCredential** parameter to run it using **Domain Admin credentials** so that the command can register the certificates into AD DS.

Once this is done the AIA and CDP extensions can be configured using the same method as we did for the Root CA. This will also start up the _Certificate Service:_

```powershell
Script ADCSAdvConfig {
    SetScript = {
        if ($Using:Node.CADistinguishedNameSuffix) {
            "$($ENV:SystemRoot)\system32\certutil.exe" -setreg CA\DSConfigDN "CN=Configuration,$($Using:Node.CADistinguishedNameSuffix)"
            "$($ENV:SystemRoot)\system32\certutil.exe" -setreg CA\DSDomainDN "$($Using:Node.CADistinguishedNameSuffix)"
        }
        if ($Using:Node.CRLPublicationURLs) {
            "$($ENV:SystemRoot)\System32\certutil.exe" -setreg CA\CRLPublicationURLs $($Using:Node.CRLPublicationURLs)
        }
        if ($Using:Node.CACertPublicationURLs) {
            "$($ENV:SystemRoot)\System32\certutil.exe" -setreg CA\CACertPublicationURLs $($Using:Node.CACertPublicationURLs)
        }
        Restart-Service -Name CertSvc
        Add-Content -Path 'c:\windows\setup\scripts\certutil.log' -Value "Certificate Service Restarted ..."
    }
    GetScript = {
        return @{
            'DSConfigDN' = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSConfigDN')
            'DSDomainDN' = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('DSDomainDN')
            'CRLPublicationURLs' = (Get-ChildItem 'HKLM:\System\CurrentControlSet\Services\CertSvc\Configuration').GetValue('CRLPublicationURLs')
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
    DependsOn = '[Script]RegisterSubCA'
}
```

### Step 5: Shut down the Root CA

Once all the _Sub CAs_ have installed their certificates the _Root CA_ can be shutdown. This is a nice way of identifying that everything has gone according to plan and all _Sub CAs_ can now issue certificates. It also helps reduce the amount of time the _Root CA_ is online. To do this, once again we use the **WaitFor DSC Resource**. If there is more than one _Sub CA_ being installed then the _Root CA_ script should wait for the last one to be complete.

```powershell
WaitForAny "WaitForComplete_$SubCA" {
    ResourceName     = '[Script]InstallSubCACert'
    NodeName         = $SubCA
    RetryIntervalSec = 30
    RetryCount       = 30
    DependsOn        = "[Script]IssueCert_$SubCA"
}

Script ShutdownRootCA {
    SetScript = { Stop-Computer }
    GetScript = { return @{} }
    TestScript = {
        # SubCA Cert is not yet created
        return $false
    }
    DependsOn = "[WaitForAny]WaitForComplete_$SubCA"
}
```

At this point all the Sub CAs should be operational and the Root CA will have been shut down ready to be put away in a safe somewhere. There are still some minor tasks yet to complete such as configuring the Online Responder, generating and installing a Web Server certificate for the Web Enrollment Server etc. But seeing as this part is now getting extremely long I think I'll leave them till Part 3 in the next few days. I hope this has been useful!

### Additional Information

It is probably very useful to see the full complete DSC configuration files. These files change frequently as I optimize and test the process. As noted they are actually part of another project I'm working on - LabBuilder. They are currently available in my [LabBuilder project repository on GitHub](https://github.com/PlagueHO/LabBuilder).

- [Root CA](https://github.com/PlagueHO/LabBuilder/blob/master/LabBuilder/DSCLibrary/STANDALONE_ROOTCA.DSC.ps1)
- [Sub CA](https://github.com/PlagueHO/LabBuilder/blob/master/LabBuilder/DSCLibrary/MEMBER_SUBCA.DSC.ps1)

I will cover the LabBuilder project another day once I have completed testing and documentation on it.
