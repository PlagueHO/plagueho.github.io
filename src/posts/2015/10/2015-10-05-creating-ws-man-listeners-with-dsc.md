---
title: "Creating WS-Man Listeners with DSC"
date: 2015-10-05
description: "A quick article about creating WS-Man listeners with Desired State Configuration."
tags:
  - "desired-state-configuration"
  - "ws-management"
  - "powershell"
---

### Introduction

After my last post showing [how to create an SSL/HTTPS listener using GPO](https://dscottraynsford.wordpress.com/2015/09/27/install-an-ssl-ws-management-listener-with-gpo/), I thought this might be a good fit for a Desired State Configuration Resource. So after a rainy Saturday morning coding I had it working nicely.

You might ask "what is the point of adding HTTPS/SSL WS-Man Listeners when HTTP WS-Man Listeners are usually enabled by default"? Well, first off, it ensures you're going to be connecting to the server you actually think you're connecting to. This is pretty important and helps protect against _DNS poisoning_ and _man-in-the-middle_ attacks. It also means you don't have to set the WS-Man client trusted hosts setting on your client machines to bypass host name checking for your servers:

[![No more of this!](/assets/images/blog/ss_wsman_nomoretrustedhosts.png)](/assets/images/blog/ss_wsman_nomoretrustedhosts.png)
No more of this!

### HTTPS/SSL and Certificates

This DSC Resource essentially allows you to create, configure and remove HTTP and HTTPS/SSL WS-Man Listeners. That is pretty much it.

However, the most common use is going to be creating an HTTPS/SSL listener by automatically detecting the appropriate certificate to use. It uses the exact same method of doing this as described in [this](https://dscottraynsford.wordpress.com/2015/09/27/install-an-ssl-ws-management-listener-with-gpo/) post, so I won't go over it here. But essentially, all you need to do is provide the full name of the Issuing CA that will have issued the certificate to the computer. The certificate would normally have been created and assigned to each server using **Certificate Autoenrollment** using an _Active Directory Certificate Services PKI_ and _GPO_, but this is not required - you could use any certificate enrollment method.

### Installing the Resource

The first thing that needs to be done is installing the **cWSMan** Module. If you're using WMF 5.0 you can get this directly from the [PowerShell Gallery](https://www.powershellgallery.com/) by running this command:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\10\2015-10-05-creating-ws-man-listeners-with-dsc.md
Install-Module -Name cWSMan -MinimumVersion 1.0.0.0
```

If you're using WMF 4.0 then you'll need to get this from the [Microsoft Script Center](https://gallery.technet.microsoft.com/scriptcenter/cWSMan-DSC-Resource-c29af3fd). But of course, you're using [WMF 5.0](https://dscottraynsford.wordpress.com/2015/06/09/installing-windows-management-framework-5-0-with-a-gpo/) right?

Once it is installed you can integrate it into your DSC Scripts.

### Using the Resource

The most likely thing you're going to want to do is install an HTTPS/SSL Listener. To do that all you need to do is something like this:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\10\2015-10-05-creating-ws-man-listeners-with-dsc.md
configuration Sample_cWSManListener_HTTPS {
    Import-DscResource -Module cWSMan

    Node Server01 {
        cWSManListener HTTPS {
            Transport = 'HTTPS'
            Ensure    = 'Present'
            Issuer    = 'CN=CONTOSO.COM Issuing CA, DC=CONTOSO, DC=COM'
        }
        # End of cWSManListener Resource
    }
    # End of Node
}
# End of Configuration
```

This would install an HTTPS/SSL Listener onto the default port of 5986 using a certificate that was issued by _CN=CONTOSO.COM Issuing CA, DC=CONTOSO, DC=COM_. There really is nothing to it - it is actually more fiddly getting your PKI set up than doing this part.

You can also configure the **port** and **address to bind** the HTTPS/SSL Listener to by passing the **port** and **address** parameters as well:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\10\2015-10-05-creating-ws-man-listeners-with-dsc.md
configuration Sample_cWSManListener_HTTPS {
    Import-DscResource -Module cWSMan

    Node Server01 {
        cWSManListener HTTPS {
            Transport = 'HTTPS'
            Ensure    = 'Present'
            Issuer    = 'CN=CONTOSO.COM Issuing CA, DC=CONTOSO, DC=COM'
            Port      = 7000
            Address   = '192.168.1.55'
        }
        # End of cWSManListener Resource
    }
    # End of Node
}
# End of Configuration
```

If you don't provide the **port** and **address** parameters they default to 5986 (or 5985 for HTTP listeners) and '\*' respectively.

You can also use this resource to _remove_ an HTTP or HTTPS listener. For example you might want to remove the default HTTP listener so that it can't be used once your HTTPS listener has been created. To do that:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\10\2015-10-05-creating-ws-man-listeners-with-dsc.md
configuration Remove_cWSManListener_HTTP {
    Import-DscResource -Module cWSMan

    Node Server01 {
        cWSManListener HTTP {
            Transport = 'HTTP'
            Ensure    = 'Absent'
        }
        # End of cWSManListener Resource
    }
    # End of Node
}
# End of Configuration
```

### Feedback

If you're interested in contributing to this resource, providing feedback or raising issues or requesting features, please feel free (anything is appreciated). You'll find the resource GitHub repository [here](https://github.com/PlagueHO/cWSMan) where you can fork, issue pull requests and raise issues/feature requests.
