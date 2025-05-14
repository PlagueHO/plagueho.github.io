---
title: "FoundryVTT in Azure"
description: "Deploy your onwn Foundry Virtual Table Top server into Azure using Azure Bicep and GitHub Actions. It support deploying into either Azure Web App or an Azure Container app, with the persistent data stored into Azure Files."
features:
  - Azure
  - Bicep
projectUrl: "https://github.com/PlagueHO/foundryvtt-azure"
---

Deploy your own [Foundry Virtual Table Top](https://foundryvtt.com/) server (that you've purchased a license for) to Azure using Azure Bicep and GitHub Actions.

The project uses GitHub actions to deploy the resources to Azure using the [GitHub Action for Azure Resource Manager (ARM) deployment task](https://github.com/Azure/arm-deploy) and [Azure Bicep](https://aka.ms/Bicep).

This repository will deploy a Foundry Virtual Table top using various different Azure architectures to suit your requirements. The compute and storage is separated into different services to enable update and redeployment of the server without loss of the Foundry VTT data.
