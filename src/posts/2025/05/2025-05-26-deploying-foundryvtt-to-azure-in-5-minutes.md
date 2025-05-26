---
title: "Deploying Foundry VTT to Azure in 5 minutes"
date: 2025-05-26
description: "Learn how to quickly deploy Foundry Virtual Table Top to Azure using the Azure Developer CLI and the Foundry VTT in Azure solution accelerator."
tags: 
  - "azure"
  - "azd"
  - "foundryvtt"
  - "tabletop-gaming"
  - "cloud-deployment"
draft: true
---

## What is Foundry VTT?

If you're a tabletop RPG enthusiast like me, you might have heard of Foundry Virtual Table Top (VTT). It's a self-hosted, modern application for playing tabletop roleplaying games online with your friends. Foundry VTT gives you full control over your gaming experience.

But here's the catch - you need to host it yourself. Many folks just run Foundry locally on a machine in their network - and that works perfectly well. But if you're playing with people spread over many different locations or just like to host things in the cloud, then this is for you - that's where Azure comes in!

## Why deploy Foundry VTT to Azure?

Running Foundry works well locally if everyone is local, but if you and your players are all spread out geographically, then it might make sense to deploy it to the cloud - in this case Microsoft Azure. Here's why hosting in Azure makes sense:

1. **Always available** - Your game server is always online, ready for your players to connect anytime
2. **No port forwarding hassles** - Skip the network configuration headaches
3. **Performance** - Azure's global infrastructure ensures low latency for players around the world
4. **Security** - Benefit from Azure's enterprise-grade security features
5. **Scalability** - Need more power for a bigger campaign? Scale up easily
6. **Separate storage** - Your game data is safely stored in Azure Files, separate from the compute resources

This also means you can leverage features of Azure storage like snapshots and backups to protect your valuable campaign data.

## How to deploy the solution accelerator

The Foundry VTT in Azure solution accelerator makes deployment incredibly simple using the Azure Developer CLI (azd). The Azure Developer CLI is a powerful tool that simplifies the process of provisioning and managing Azure resources. I chose to use it for this solution because it makes it simple to "stamp" out environments as well as tearing them down when they're not needed - perfect for gaming sessions that might not run continuously.

Let's walk through the process:

### Prerequisites

Before we start, you'll need:

1. An Azure subscription
2. A valid Foundry VTT license (purchase at [foundryvtt.com](https://foundryvtt.com))
3. [Azure Developer CLI](https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd) installed
4. [Git](https://git-scm.com/downloads) installed

### Deployment Steps

1. Clone the Foundry VTT in Azure repository:
   ```bash
   git clone https://github.com/PlagueHO/foundryvtt-azure.git
   cd foundryvtt-azure
   ```

2. Log in to Azure using the Azure Developer CLI:
   ```bash
   azd auth login
   ```

3. Configure the required environment parameters:
   ```bash
   azd env set FOUNDRY_USERNAME "<your-foundry-username>"
   azd env set FOUNDRY_PASSWORD "<your-foundry-password>"
   azd env set FOUNDRY_ADMIN_KEY "<your-foundry-admin-key>"
   azd env set AZURE_ENV_NAME "myuniquefvtt"
   azd env set AZURE_LOCATION "EastUS2"
   ```

   You can also configure optional parameters:
   ```bash
   azd env set AZURE_DEPLOY_NETWORKING "true"
   azd env set AZURE_STORAGE_CONFIGURATION "Premium_100GB"
   azd env set AZURE_COMPUTE_SERVICE "Web App"
   azd env set AZURE_APP_SERVICE_PLAN_SKUNAME "P0v3"
   ```

4. Start the deployment:
   ```bash
   azd up
   ```

And that's it! In about 5 minutes, you'll have a fully deployed Foundry VTT instance running in Azure.

## See it in action

Here's a video walkthrough of the deployment process:

<custom-youtube slug="asb8bu0eRmM" label="Deploying Foundry VTT to Azure in 5 minutes using Azure Developer CLI"></custom-youtube>

If the embed doesn't work, you can [watch the video on YouTube](https://youtu.be/asb8bu0eRmM)

## Configuration options

The solution accelerator offers several configuration options to customize your deployment:

### Required Parameters

- `FOUNDRY_USERNAME` - Your Foundry VTT username
- `FOUNDRY_PASSWORD` - Your Foundry VTT password
- `FOUNDRY_ADMIN_KEY` - The admin key for Foundry VTT
- `AZURE_ENV_NAME` - Name for the environment (used in resource names)
- `AZURE_LOCATION` - Azure region for deployment

### Optional Parameters

- `AZURE_COMPUTE_SERVICE` - `Web App` (default) or `Container Instance`
- `AZURE_DEPLOY_NETWORKING` - `true` (default) or `false` to deploy a virtual network
- `AZURE_STORAGE_CONFIGURATION` - `Premium_100GB` (default) or `Standard_100GB`
- `AZURE_STORAGE_PUBLIC_ACCESS` - `false` (default) to allow public access to storage
- `AZURE_APP_SERVICE_PLAN_SKUNAME` - App Service SKU (e.g., `P0v3` is default)
- `AZURE_CONTAINER_INSTANCE_CPU` - CPU count for Container Instance, from `1` to `4` (default is `2`)
- `AZURE_CONTAINER_INSTANCE_MEMORY_IN_GB` - Memory (GB) for Container Instance, from `1` to `16` (default is `2`)
- `AZURE_DEPLOY_DDB_PROXY` - `true` or `false` (default) to deploy DDB-Proxy
- `AZURE_BASTION_HOST_DEPLOY` - `true` or `false` (default) to deploy Azure Bastion
- `AZURE_DEPLOY_DIAGNOSTICS` - `true` or `false` (default) to deploy diagnostics

## What gets deployed?

When you deploy the solution accelerator, these Azure resources are provisioned:

1. **Storage Account**: Hosts your Foundry VTT data files, configurations, and worlds
   - Azure File Share for persistent storage

2. **Web App or Container App**: Runs the Foundry VTT application
   - App Service Plan (for Web App option)
   - Container Registry (for Container App option)

3. **Public IP & DNS**: Allows your players to connect
   - App Service Domain or custom domain configuration

4. **Security Settings**:
   - Managed identities for secure access
   - Key Vault for storing sensitive configuration

The solution is designed with a separation of concerns - your data storage is independent from the compute resources. This means you can rebuild, upgrade, or modify your server without risking your valuable game data.

## Advanced: Deploying with GitHub Actions

For those who want to automate deployments further, the solution accelerator can be integrated with GitHub Actions. This allows you to:

1. Version control your infrastructure configuration
2. Automate deployments when you push changes
3. Easily deploy to multiple environments (e.g., testing and production)

To set this up:

1. Fork the [foundryvtt-azure](https://github.com/PlagueHO/foundryvtt-azure) repository
2. Configure your Azure credentials as GitHub secrets
3. Update the workflow files in `.github/workflows` with your settings
4. Push changes to trigger automated deployments

## What next?

Now that your Foundry VTT server is up and running in Azure, here are some next steps you might consider:

1. **Set up your first world** - Import an existing world or create a new one
2. **Install modules** - Enhance your game with community-created modules
3. **Invite your players** - Share your Azure URL with your gaming group
4. **Configure backups** - Set up Azure Backup for extra protection
5. **Monitor costs** - Use Azure Cost Management to keep an eye on your spending

If you encounter any issues or have questions, the [GitHub repository](https://github.com/PlagueHO/foundryvtt-azure) has detailed troubleshooting guides and a discussion forum.

Happy gaming in the cloud!