---
title: "Test Website SSL Certificates Continuously with PowerShell and Pester"
date: "2016-12-23"
categories: 
  - "pester"
tags: 
  - "certificates"
  - "powershell"
  - "ssl"
  - "testing"
coverImage: "ss_chrome_certificateok.png"
---

One of the most **common problems** that our teams deal with is ensuring that **SSL certificates** are **working correctly**. We've all had that urgent call in telling us that the web site is down or some key API or authentication function is offline - only to find out it was caused by an expired certificate.

An easy way of preventing this situation would have been to set up a task that **continuously tests** your **SSL endpoints** (internal and external web apps and sites, REST API's etc.) and warns us if:

- The certificate is about to expire (with x days).
- The SSL endpoint is using safe SSL protocols (e.g. TLS 1.2).
- The certificate is using SHA256.

This seemed like a good task for Pester (or [Operation Validation Framework](https://dscottraynsford.wordpress.com/2016/10/23/continuously-testing-your-infrastructure-with-ovf-and-microsoft-operations-management-suite/)). So, after a bit of digging around I found [this awesome blog post](http://blog.whatsupduck.net/2014/10/checking-ssl-and-tls-versions-with-powershell.html) from [Chris Duck](https://twitter.com/gpduck) showing how to retrieve the certificate and SSL protocol information from an **SSL endpoint** using **PowerShell**.

Chris' post contained this PowerShell cmdlet:

\[gist\]7247c2eb35d8e888d5845ce4f0ed5591\[/gist\]

So that was the hard part done, all I needed was to add this function to some [Pester](https://blogs.technet.microsoft.com/heyscriptingguy/2015/12/14/what-is-pester-and-why-should-i-care/) tests.

> **Note:** If you are running these tests on an operating system older than Windows 10 or Windows Server 2016 then you will need to install the PowerShell Pester module by running this command in an Administrator PowerShell console:
> 
> Install-Module -Name Pester

So after a little bit of tinkering I ended up with a set of tests that I combined into the same file as Chris' function from earlier. I called the file **SSL.tests.ps1**. I used the file extension **.tests.ps1** because that is the file extension **Pester** looks for when it runs.

> The tests are located at the bottom of the file below the Test-SslProtocol function.

\[gist\]e63cb51d0c38fcb18b7c0d638fa7e81b\[/gist\]

So, now to test these SSL endpoints all I need to do is run in a PowerShell console with the current folder set to the folder containing my **SSL.tests.ps1** file:

cd C:\\SSLTests\\
Invoke-Pester

This is the result:

![ss_testssl_pesteroutput](images/ss_testssl_pesteroutput.png)

This shows that all the SSL endpoint certificates being used by google.com, bing.com and yahoo.com are all valid SHA-256 certificates and aren't going to expire in 14 days.

All I would then need to do is put this in a task to run every hour or so and perform some task when the tests fail:

\[gist\]c461fca2f66fe0338e510ae8274a3761\[/gist\]

At this point you will still need to use some mechanism to notify someone when they fail. One method could be to write an event into the **Windows Event Log** and then use **Microsoft Operations Management Suite** (or **SCOM**) to monitor for this event and send an e-mail or other alert to the appropriate administrators.

_For an example showing how to use OMS to monitor custom events created by failed _Pester and OVF_ tests, see my previous article [here](https://dscottraynsford.wordpress.com/2016/10/23/continuously-testing-your-infrastructure-with-ovf-and-microsoft-operations-management-suite/)._

## Potential Improvements

There are a number of ways you could go about improving this process, which our teams have in fact implemented. If you're considering implementing this process then you might want to also consider them:

1. Put the **Test-SSLProtocol** cmdlet into a PowerShell Module that you can share easily throughout your organization.
2. Put your tests into **source control** and have the task **clone the tests** directly from source control every time they are run - this allows tests to be stored centrally and can be change tracked.
3. **Parameterize** the tests so that you don't have to hard code the endpoints to test in the script file. Parameters can be passed into Pester tests [fairly easily](http://wahlnetwork.com/2016/07/28/using-the-script-param-to-pass-parameters-into-pester-tests/).
4. Use something like [Jenkins](https://jenkins.io/), [SCOM](https://technet.microsoft.com/en-us/library/hh205987(v=sc.12).aspx) or [Splunk](https://www.splunk.com/) to run the tests continuously.
5. Run the tests in an [Azure Automation](https://docs.microsoft.com/en-us/azure/automation/automation-intro) account in the Cloud.

Really, the options for implementing this methodology are nearly limitless. You can engineer a solution that will work for you and your teams, using whatever tools are at your disposal.

At the end of the day, the goal here should be:

- Reduce the risk that your internal or external applications or websites are using bad certificates.
- Reduce the risk that an application or website will be deployed without a valid certificate (write infrastructure tests before you deploy your infrastructure - [TDD](https://en.wikipedia.org/wiki/Test-driven_development) for operations).
- Reduce the risk you'll get woken up in the middle of the night with an expired certificate.

So, in this holiday season, I hope this post helps you ensure your certificates won't expire in the next two weeks and you won't get called into fix a certificate problem when you should be lying on a beach in the sun (in the southern hemisphere anyway).

Have a good one!