---
title: "Install an SSL WS-Management Listener with GPO"
date: 2015-09-27
description: "A quick article about installing an SSL WS-Management Listener with GPO."
tags:
  - "certificate-services"
  - "ws-management"
  - "group-policy"
  - "powershell"
---

## Introduction

One of the things I like to do whenever I install a new server is to enable an **HTTPS/SSL WS-Management Listener** on it so that I can disable the more insecure HTTP WS-Management listener. For more information on WS-Management Listeners see [this MSDN article](https://msdn.microsoft.com/en-us/library/aa384372%28v=vs.85%29.aspx).

There are many benefits to using a secure **HTTPS/SSL WS-Management Listener**:

1. **Security** - the communication channel between client and server is encrypted using SSL.
1. **Authentication** - the server is authenticated to the client so you can trust you're talking to the server you think you're talking to.

The downside to this is that you need a _valid and trusted server authentication certificate_ on the server to enable this - but if you have a **PKI** then this is no big deal as you'll probably have _certificate autoenrollment_ enabled. If you don't have a **PKI**, then you should look into [installing one](https://technet.microsoft.com/en-us/library/cc772393%28v=ws.10%29.aspx).

Installing these listeners _manually_ is fairly straight forward and requires only a single command:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\09\2015-09-27-install-an-ssl-ws-management-listener-with-gpo.md
New-WSManInstance -ResourceURI winrm/config/Listener `
  -SelectorSet @{ Address='*'; Transport="HTTPS" } `
  -ValueSet @{ Hostname="SERVER01.CONTOSO.COM"; CertificateThumbprint="09 49 93 24 53 81 32 16 b7 44 8b 47 ca af 56 3a ef 9f 10 2d" }
```

All you need to do is enter the appropriate **hostname** and **certificate thumbprint** for a _server authentication_ certificate that exists on the server. But who wants to do this manually, right?

## Installing with GPO

The slightly tricky part of installing this automatically onto your servers with a GPO is detecting which certificate to use. The certificate must:

- exist in the **local computer personal certificate store**.
- have an Extended Key Usage of **Server Authentication**.
- be issued by a **CA trusted** by any client connecting to the server.
- The **Subject** must contain a **Common Name** that contains _either_ the FQDN computer name or the flat computer name (e.g. CN=SERVER1.CONTOSO.COM or CN=SERVER1).

It is easy to ensure a certificate meets these criteria by using a GPO enabling **certificate autoenrollment** for computer certificates and that the Computer **autoenrollment certificate template** will create certificates meeting these requirements. See [this page](https://technet.microsoft.com/en-us/library/cc731522.aspx) for some basic information on certificate autoenrollment. There are some much more detailed instructions on this around the net if you're happy to search.

Once you've ensured all your computers have been issued such a certificate you would normally need to lookup the certificate on each computer and get the certificate thumbprint and execute the command I showed earlier. This would be a complete pain on any more than 10 computers, and probably pure insanity at a lot of facilities.

So, I put together the following PowerShell commands that could be used to automatically pull the certificate thumbprint for an appropriate certificate:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\09\2015-09-27-install-an-ssl-ws-management-listener-with-gpo.md
[String] $Issuer = 'CN=CONTOSO.COM Issuing CA, DC=CONTOSO, DC=COM'
[String] $HostName = [System.Net.Dns]::GetHostByName($ENV:computerName).Hostname
[String] $Thumbprint = (
    Get-ChildItem -Path Cert:\localmachine\my |
        Where-Object {
            ($_.Extensions.EnhancedKeyUsages.FriendlyName -contains 'Server Authentication') -and
            ($_.IssuerName.Name -eq $Issuer) -and
            ($HostName -in $_.DNSNameList.Unicode) -and
            ($_.Subject -eq "CN=$HostName")
        } |
        Select-Object -First 1
).Thumbprint
```

All you'd need to set was the Issuer to whatever the _Distinguished Name_ of your **issuing CA** is - which should be the same for all computers. This simplifies things a lot because the same code could be run on any computer and should always return the correct thumbprint.

The next step was to put it into a script where you could just pass the _Distinguished Name_ of the **issuing CA** as a parameter. I did this and also added some other optional parameters and uploaded the result to [Microsoft Script Center](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-used-to-easily-22067907). So you can download this script and put it into a GPO Startup Script:

[![Installing an HTTPS WS-Management Listener with GPO](/assets/images/blog/ss_gpo_httpswsmanlistener.png)](/assets/images/blog/ss_gpo_httpswsmanlistener.png)
Installing an HTTPS WS-Management Listener with GPO

The script is actually a little bit smarter than the above command. If a certificate with a subject can't be found that matches the **FQDN** of the computer it will automatically look for one that just uses the flat computer name. You can control this behavior by setting the **DNSNameType** parameter.

There are some other optional parameters that control other the behavior of the script as well:

### DNSNameType

The allowed DNS Name types that will be used to find a matching certificate. If set to **FQDN** then the script will only try to find a certificate with a subject matching the **FQDN** of the computer. If set to **ComputerName** it will only match on the computer name of the computer. By default this is set to **Both** which will try to match on **FQDN** first and then **ComputerName** if it can't find one matching the **FQDN**.

### MatchAlternate

The certificate found must also have an alternate subject name containing the DNS name found in the subject as well. This places additional restrictions on the certificate that is used, but is not usually required. This defaults to **False**.

### Port

This parameter lets you specify an alternate **port** to install the HTTPS/SSL listener on. If you don't specify it, it will use the default port of **5986**.

## Don't Forget your Firewall

It is important to remember that by default this listener is installed onto port **5986**, which is _not_ usually open inbound. So you'll want to _add a firewall rule_ to ensure this port can be reached - another job for GPO. You could even add this setting into the GPO that installs the HTTPS/SSL listener.

## Installing with DSC

In theory it should be possible to adapt this code to run in a **DSC Script Resource**. I haven't tried this yet, but you can be assured that I will fairly soon. If there was some interest in this I could convert it into a proper **DSC Resource** (unless there was one already - I haven't checked). If you are interested, let me know.

## Links

If you want to make a copy of the repository, you'll find it here:

[https://github.com/PlagueHO/WSManGPOTools](https://github.com/PlagueHO/WSManGPOTools)

Right, that is me out for another Sunday. Thanks for reading.
