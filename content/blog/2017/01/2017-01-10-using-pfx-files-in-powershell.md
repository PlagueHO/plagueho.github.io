---
title: "Using PFX Files in PowerShell"
date: "2017-01-10"
categories:
  - "certificate-services"
tags:
  - "certificates"
  - "pfx"
  - "powershell"
coverImage: "ss_readpfx_loadingthepfx.png"
---

One of the things I've been working on lately is adding a new resource to the [xCertificate DSC Resource module](https://github.com/PowerShell/xCertificate) for exporting an certificate with (or without) the private key from the Windows Certificate Store as a .CER or .PFX file. The very insightful (and fellow DSC Resource maintainer) [@JohanLjunggren](https://twitter.com/johanljunggren) has been giving some really great direction on this new resource.

One of these suggested features was to be able to identify if the certificate chain within a PFX file is different to the chain in the Windows Certificate Store. This is because a PFX file can contain not just a single certificate but the entire trust chain required by the certificate being exported.

Therefore what we would need to do is be able to step through the certificates in the PFX and examine each one. It turns out this is pretty simple using the .NET Class:

System.Security.Cryptography.X509Certificates.X509Certificate2Collection

So, to read the PFX in to a variable called $PFX all we need to do is this:


```powershell
$PFXPath = 'd:\Cert.pfx'
$PFXPassword = 'pass'
$PFX = New-Object -TypeName 'System.Security.Cryptography.X509Certificates.X509Certificate2Collection'
$PFX.Import($PFXPath,$PFXPassword,[System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet)
```

The $PFXPath variable is set to the path to the PFX file we're going to read in. The $PFXPassword is a string (not SecureString) containing the password used to protect the PFX file when it was exported.

We now have all the certificates loaded into an array in the $PFX variable and work with them like any other array:

![ss_readpfx_loadingthepfx](/images/ss_readpfx_loadingthepfx.png)

Now, that we have the #PFX array, we can identify the thumbprint of the certificate that was actually exported (as opposed to the certificates in the trust chain) by looking at the last array item:


```
$PFX[$PFX.Count-1] | fl *
```

I'm piping the output Format-List so we can see the entire x509 certificate details.

![ss_readpfx_showissuedcertificate](/images/ss_readpfx_showissuedcertificate.png)

In the case of the DSC Resource we'll compare the certificate thumbprint of the last certificate in the PFX with the thumbprint that of the certificate in the Windows Certificate Store that we're wanting to export. If they're different we will then perform another export using the Export-PFXCertificate cmdlet.

_Protip: You can actually verify the certificate and the entire trust chain is valid and not expired by calling the verify method on the last certificate:_


```powershell
foreach ($Cert in $PFX) { "$($Cert.Subject) is valid: $($Cert.Verify())" }
```

![ss_readpfx_validateissuedcertificate](/images/ss_readpfx_validateissuedcertificate.png)

_In the case above, the certificate I exported was actually invalid (it had expired):_

![ss_readpfx_expiredcertificate](/images/ss_readpfx_expiredcertificate.png)

_So we could easily use the Validate method to test the certificates validity before we import them into the Windows Certificate Store. But beware, the Validate method will check that the certificate chain is trusted. To be trusted the entire chain must have been imported into the Windows Certificate Store in the appropriate stores (e.g. Trusted Root CA/Intermedicate CA stores)._

So, finally this gives us the code required to implement the **xCertificateExport** Resource in the DSC Resource Kit. We can now perform a comparison of the certificates a PFX file to ensure that they are the same as the certificates that have already been exported.

This information is not something that you might use every day, but hopefully it's information that someone might find useful. So thank you for taking the time to read this.


