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

If you're a tabletop RPG enthusiast like me, you've probably heard of Foundry Virtual Table Top (VTT). It's a self-hosted, modern application for playing tabletop roleplaying games online with your friends. Unlike subscription-based alternatives, Foundry VTT operates on a one-time purchase model, giving you full control over your gaming experience.

Foundry VTT offers a rich set of features including:
- Dynamic lighting and vision systems
- Support for hundreds of game systems through modules
- Audio/video chat capabilities
- Interactive maps and tokens
- A powerful and flexible API for customization

But here's the catch - you need to host it yourself. That's where Azure comes in!

## Why deploy Foundry VTT to Azure?

Running Foundry VTT locally works well if you're always going to be the first one to join the game and the last one to leave. But what if you want more flexibility? Here's why hosting in Azure makes sense:

1. **Always available** - Your game server is always online, ready for your players to connect anytime
2. **No port forwarding hassles** - Skip the network configuration headaches
3. **Performance** - Azure's global infrastructure ensures low latency for players around the world
4. **Security** - Benefit from Azure's enterprise-grade security features
5. **Scalability** - Need more power for a bigger campaign? Scale up easily
6. **Separate storage** - Your game data is safely stored in Azure Files, separate from the compute resources

## How to deploy the solution accelerator

The Foundry VTT in Azure solution accelerator makes deployment incredibly simple using the Azure Developer CLI (azd). Let's walk through the process:

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

3. Initialize your environment:
   ```bash
   azd init
   ```

4. Start the deployment:
   ```bash
   azd up
   ```

5. When prompted, provide your Foundry VTT license key and admin password.

And that's it! In about 5 minutes, you'll have a fully deployed Foundry VTT instance running in Azure.

## See it in action

Here's a video walkthrough of the deployment process:

<custom-youtube slug="asb8bu0eRmM" label="Deploying Foundry VTT to Azure in 5 minutes using Azure Developer CLI"></custom-youtube>

If the embed doesn't work, you can [watch the video on YouTube](https://youtu.be/asb8bu0eRmM)

## Configuration options

The solution accelerator offers several configuration options to customize your deployment:

### Core Settings

- **Environment Name**: This becomes part of your URL and resource names
- **Azure Region**: Choose where your server will be hosted
- **Foundry VTT License Key**: Your license from foundryvtt.com
- **Admin Password**: For accessing your Foundry VTT instance

### Deployment Options

- **Deployment Type**: Choose between:
  - **Azure Web App** (default): Simpler setup, great for most users
  - **Azure Container App**: More advanced, containerized deployment
  
- **Foundry VTT Version**: Select which version of Foundry you want to deploy

- **Custom Domain**: Optionally configure your own domain name

- **Compute Size**: Select the performance tier that matches your needs:
  - Small (1 core, 2GB memory)
  - Medium (2 cores, 4GB memory)
  - Large (4 cores, 8GB memory)

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