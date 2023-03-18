---
title: "Disable TLS 1.0, TLS 1.1 and 3DES in Azure API Management using an ARM Template"
date: "2018-04-07"
categories:
  - "azure-api-management"
tags:
  - "api-management"
  - "arm-template"
coverImage: "ss_apim_disabletls3des.png"
---

Recently, I've been putting together a continuous delivery pipeline (using VSTS) for our [Azure API Management service](https://azure.microsoft.com/en-us/services/api-management/) using **Azure Resource Manager** (ARM) templates. One of the things I needed to be able to do to _secure this service properly_ is to disable **TLS 1.0**, **TLS 1.1** and **3DES**. This is pretty easy to do in the portal:

![ss_apim_disabletls3des](/images/ss_apim_disabletls3des.png)

However, we only allow changes to be made via our continuous delivery pipeline (a good thing by the way) then I had to change the ARM template.

> **Side note:** Disabling **TLS 1.0**, **TLS 1.1** and **3DES** is pretty important for keeping your system secure. But if you have an Azure Application Gateway in front of your API Management service, then you'll also need to configure the Azure Application Gateway to disable **TLS 1.0** and **TLS 1.1**. This is done in a [slightly different way](https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-ssl-policy-overview), but can also be done in an ARM Template (post a comment if you're not sure how to do this and I'll write another post).

I found the documentation for the API Management service resource [here](https://docs.microsoft.com/en-us/azure/templates/microsoft.apimanagement/service). This shows it can be done by setting the **customProperties** object in the ARM Template. But the documentation isn't completely clear.

But after a little bit of trial and error I managed to figure it out and get it working. What you need to do is add the following **customProperties** to the **properties** of the API Management service resource:

\[gist\]54e3b84971a7be64859df62a881b8247\[/gist\]

This is what the complete ARM template looks like:

\[gist\]59c53066c53f5272488a95f9c27d3f23\[/gist\]

> **Side note:** the template above is based off the [Azure Quickstart Template for API Management](https://github.com/Azure/azure-quickstart-templates/blob/master/101-azure-api-management-create/azuredeploy.json).

Hopefully you find this if you're looking for an example of how to do this and it saves you some time.

