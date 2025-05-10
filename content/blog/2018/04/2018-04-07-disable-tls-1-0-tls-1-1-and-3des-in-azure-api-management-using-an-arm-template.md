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


```json
"customProperties": {
  "Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Ciphers.TripleDes168": "false",
  "Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls11": "false",
  "Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls10": "false"
}
```

This is what the complete ARM template looks like:


```json
{
    "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "publisherEmail": {
            "type": "string",
            "minLength": 1,
            "metadata": {
                "description": "The email address of the owner of the service"
            }
        },
        "publisherName": {
            "type": "string",
            "minLength": 1,
            "metadata": {
                "description": "The name of the owner of the service"
            }
        },
        "sku": {
            "type": "string",
            "allowedValues": [
                "Developer",
                "Standard",
                "Premium"
            ],
            "defaultValue": "Developer",
            "metadata": {
                "description": "The pricing tier of this API Management service"
            }
        },
        "skuCount": {
            "type": "string",
            "allowedValues": [
                "1",
                "2"
            ],
            "defaultValue": "1",
            "metadata": {
                "description": "The instance size of this API Management service."
            }
        }
    },
    "variables": {
        "apiManagementServiceName": "[concat('apiservice', uniqueString(resourceGroup().id))]"
    },
    "resources": [
        {
            "apiVersion": "2017-03-01",
            "name": "[variables('apiManagementServiceName')]",
            "type": "Microsoft.ApiManagement/service",
            "location": "West US",
            "tags": {},
            "sku": {
                "name": "[parameters('sku')]",
                "capacity": "[parameters('skuCount')]"
            },
            "properties": {
                "publisherEmail": "[parameters('publisherEmail')]",
                "publisherName": "[parameters('publisherName')]",
                "customProperties": {
                    "Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Ciphers.TripleDes168": "false",
                    "Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls11": "false",
                    "Microsoft.WindowsAzure.ApiManagement.Gateway.Security.Protocols.Tls10": "false"
                }
            }
        }
    ]
}
```

> **Side note:** the template above is based off the [Azure Quickstart Template for API Management](https://github.com/Azure/azure-quickstart-templates/blob/master/101-azure-api-management-create/azuredeploy.json).

Hopefully you find this if you're looking for an example of how to do this and it saves you some time.


