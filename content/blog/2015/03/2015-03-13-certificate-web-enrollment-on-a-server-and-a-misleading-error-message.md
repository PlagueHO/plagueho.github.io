---
title: "Certificate Web Enrollment on a Server and a Misleading Error Message"
date: "2015-03-13"
categories:
  - "certificate-services"
tags:
  - "certificate-web-enrollment"
  - "https"
  - "internet-explorer"
coverImage: "ss_cs_advancedcertificateqrequest_misleading.png"
---

The Certificate Web Enrollment component of Certificate Services is fairly helpful for allowing easy certificate request and enrollment from any computer.

[![Requesting a certificate via the Web Enrollment service web page.](/images/ss_cs_advancedcertificaterequest_ok.png?w=660)](/images/ss_cs_advancedcertificaterequest_ok.png)
Requesting a certificate via the Web Enrollment service web page.

It does require Internet Explorer because of an Active X control that runs on the page, but this is acceptable. It also needs to be connected to using HTTPS - which is also fine. Except when it isn't. Or more accurately, reports that you are not connected via HTTPS when you in fact are.

The following error message appears when connecting to this page from Internet Explorer 11 on a Windows Server 2012 R2 member server or DC:

[![The page requires an HTTPS connection - but it is connected via HTTPS!](/images/ss_cs_advancedcertificateqrequest_sslerror.png?w=660)](/images/ss_cs_advancedcertificateqrequest_sslerror.png)
The page requires an HTTPS connection - but it is connected via HTTPS!

"In order to complete certificate enrollment, the Web site for the CA must be configured to use HTTPS authentication."

Clearly, Internet Explorer was using HTTPS to communicate with this web site. Clicking OK on the error message and hoping to just ignore it wasn't possible because most of the drop down boxes on the form were not being populated - preventing it from being submitted:

[![After clicking OK on the error message the page is broken.](/images/ss_cs_advancedcertificateqrequest_aftererror.png?w=660)](/images/ss_cs_advancedcertificateqrequest_aftererror.png)
After clicking OK on the error message the page is broken.

I spent quite some time investigating the cause of this error, including checking the certificate chain that the client was using:

[![The certificate and certificate chain - nothing wrong here.](/images/ss_cs_advancedcertificateqrequest_certificatechain.png)](/images/ss_cs_advancedcertificateqrequest_certificatechain.png)
The certificate and certificate chain - nothing wrong here.

Of course if the certificate or the chain was bad then SSL wouldn't be being used - which it clearly was.

Eventually I identified the cause of the problem. The Active X was being prevented from being run properly because of IE security. This is probably a good thing on a Server operating system, but the error message being presented in this case was very misleading.

The way to fix this is to add the web site to the trusted sites list in Internet Explorer:

1. Select **Internet Options** from the Internet Explorer Settings menu:[![ss_cs_advancedcertificateqrequest_internetexplorersettings](/images/ss_cs_advancedcertificateqrequest_internetexplorersettings.png)](/images/ss_cs_advancedcertificateqrequest_internetexplorersettings.png)
2. Select the **Security** tab and click **Trusted Sites**:[![ss_cs_advancedcertificateqrequest_ietrustedsites](/images/ss_cs_advancedcertificateqrequest_ietrustedsites.png)](/images/ss_cs_advancedcertificateqrequest_ietrustedsites.png)
3. Click the **Sites** button.
4. Enter the **https URL** of the Certificate Web Enrollment site and click **Add**:[![ss_cs_advancedcertificateqrequest_trustthissite](/images/ss_cs_advancedcertificateqrequest_trustthissite.png)](/images/ss_cs_advancedcertificateqrequest_trustthissite.png)
5. Click **Close**.

The web site can now be refreshed and should work correctly at last:

[![Certificate Web Enrollment form working correctly with SSL. ](/images/ss_cs_advancedcertificateqrequest_workingcorrectly.png?w=660)](/images/ss_cs_advancedcertificateqrequest_workingcorrectly.png)
Certificate Web Enrollment form working correctly with SSL.

Hopefully this helps someone out there avoid this annoying problem.

B\\M/D
