---
title: "Azure AI Foundry Jumpstart"
description: "The Azure AI Foundry Jumpstart Solution Accelerator deploys an Azure AI Foundry environment and supporting services into your Azure subscription. This accelerator is designed to be used as a secure environment for exploring and experimenting with Azure AI Foundry capabilities."
features:
  - Azure AI
  - Azure
  - Bicep
  - Python
  - Semantic Kernel
projectUrl: "https://github.com/PlagueHO/azure-ai-foundry-jumpstart"
---

The Azure AI Foundry Jumpstart Solution Accelerator deploys an [Azure AI Foundry environment](https://learn.microsoft.com/azure/ai-foundry/how-to/create-secure-ai-hub) and supporting services into your Azure subscription. This accelerator is designed to be used as a secure environment for exploring and experimenting with Azure AI Foundry capabilities.

This solution accelerator is intended to help getting started with Azure AI Foundry quickly and easily, while meeting security and well-architected framework best practices.

## A Zero-trust AI Foundry Environment

By default, this solution accelerator deploys Azure AI Foundry and most of the supporting resources into a *virtual network* using *private endpoints*, *disables public access* and configures *managed identities for services to authenticate* to each other. This aligns to [Microsoft's Secure Future Initiative](https://www.microsoft.com/trust-center/security/secure-future-initiative) and the [Zero Trust security model](https://learn.microsoft.com/security/zero-trust/).

It automates the deployment of the services using the same approach as the instructions on [How to create a secure Azure AI Foundry hub and project with a managed virtual network](https://learn.microsoft.com/azure/ai-foundry/how-to/secure-data-playground) page.
