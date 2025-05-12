---
title: "Azure AI Foundry Jumpstart"
description: "The Azure AI Foundry Jumpstart Solution Accelerator deploys an Azure AI Foundry environment and supporting services into your Azure subscription. This accelerator is designed to be used as a secure environment for exploring and experimenting with Azure AI Foundry capabilities."
projectUrl: "https://github.com/PlagueHO/azure-ai-foundry-jumpstart"
---

## Azure AI Foundry Jumpstart

The Azure AI Foundry Jumpstart Solution Accelerator deploys an [Azure AI Foundry environment](https://learn.microsoft.com/azure/ai-foundry/how-to/create-secure-ai-hub) and supporting services into your Azure subscription. This accelerator is designed to be used as a secure environment for exploring and experimenting with Azure AI Foundry capabilities.

This solution accelerator is intended to help getting started with Azure AI Foundry quickly and easily, while meeting security and well-architected framework best practices.

### Zero-trust with network isolation

By default, this soltion accelerator deploys Azure AI Foundry and most of the supporting resources into a *virtual network* using *private endpoints*, *disables public access* and uses *managed identities for services to authenticate* to each other. This aligns to [Microsoft's Secure Future Initiative](https://www.microsoft.com/trust-center/security/secure-future-initiative) and the [Zero Trust security model](https://learn.microsoft.com/security/zero-trust/).

It automates the deployment of the services using the same approach as the instructions on [How to create a secure Azure AI Foundry hub and project with a managed virtual network](https://learn.microsoft.com/azure/ai-foundry/how-to/secure-data-playground) page.

> [!NOTE]
> Zero-trust with network isolation is the default configuration for this solution accelerator. But you can choose to deploy the resources without a virtual network and public endpoints if you prefer. See the [Configuration Options](#configuration-options) section for more details.
