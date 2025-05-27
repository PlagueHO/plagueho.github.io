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

If you're a tabletop RPG enthusiast like me, you might have heard of Foundry Virtual Table Top (VTT). It's a self-hosted, modern application for playing tabletop roleplaying games online with your friends. Foundry VTT gives you full control over your TTRPG gaming experience - and is super extensible with a vibrant community creating modules, systems, and content to enhance your games.

Many people choose to just run Foundry VTT on a machine on their home network and make it accessible via port forwarding on their router, which all works perfectly. But if you're playing with people spread over many different locations or just like to host things in the cloud, then this is for you - that's where Azure comes in!

## Why deploy Foundry VTT to Azure?

If you're considering cloud hosting for Foundry VTT, and happen to have access to a Microsoft Azure subscription, deploying Foundry VTT to Azure has several advantages:

1. **Always available** - Your game server is always online, ready for your players to connect anytime.
1. **No port forwarding** - You keep your home network secure without needing to expose it to the internet.
1. **Performance** - Azure's global infrastructure ensures low latency for players around the world.
1. **Scalability** - Need more power for a bigger campaign? Scale up easily.
1. **Storage Reliability** - Your game data is stored in Azure Files, which can be replicated and backed up for durability. This also means you can leverage features of Azure storage like snapshots and backups to protect your valuable campaign data.
1. **Security** - Azure provides built-in security features like managed identities and Key Vault for sensitive information.

Of course, you may not need all of these features, and be perfectly happy running Foundry VTT on your home network. But this blog post is for those who want to take advantage of the cloud to host their Foundry VTT server.

## How to deploy the solution accelerator

So, to make deploying Foundry VTT to Azure as easy as possible, I've created a solution accelerator that automates the entire process. It uses the [Azure Developer CLI](https://aka.ms/azd) (azd) and [Azure Bicep](https://aka.ms/bicep). The Azure Developer CLI is a powerful tool that simplifies the process of provisioning and managing Azure resources as well as building and deploying applications (however, in this case we don't need to build anything). I chose to use it for this solution because it makes it simple to "stamp" out environments as well as tearing them down when they're not needed - perfect for gaming sessions that might not run continuously - although be careful not to delete your storage account if you want to keep your game data!

Let's walk through the process:

### Prerequisites

Before we start, you'll need:

1. An Azure subscription (well, obviously!)
   - If you don't have one, you can [sign up for a free Azure account](https://azure.microsoft.com/free) which gives you some credits to get started.
2. A valid Foundry VTT license (purchase at [foundryvtt.com](https://foundryvtt.com))
3. [Azure Developer CLI](https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd) installed
4. [Git](https://git-scm.com/downloads) installed

### Deployment Steps

1. Open a terminal or command prompt.
1. Clone the Foundry VTT in Azure repository:

    ```bash
    git clone https://github.com/PlagueHO/foundryvtt-azure.git
    cd foundryvtt-azure
    ```

1. Log in to Azure using the Azure Developer CLI:

    ```bash
    azd auth login
    ```

1. The next step is to initialize the Azure Developer CLI project by setting an environment name. This is a unique name that will be used to create the Azure resources. You can choose any name you like, but it should be unique across your Azure subscription. Run the following command, replacing `<UniqueEnvironmentName>` with your chosen name:

    ```bash
    azd init -e <UniqueEnvironmentName>
    ```

1. Configure the Foundry VTT environment variables that allow the deployment to access your Foundry VTT account to get the application distribution and license. You can do this by running the following commands, replacing the placeholders with your actual Foundry VTT credentials:

    ```bash
    azd env set FOUNDRY_USERNAME "<your-foundry-username>"
    azd env set FOUNDRY_PASSWORD "<your-foundry-password>"
    azd env set FOUNDRY_ADMIN_KEY "<your-foundry-admin-key>"
    ```

    > [!IMPORTANT]
    > The `FOUNDRY_USERNAME` and `FOUNDRY_PASSWORD` are the credentials you use to log in to Foundry VTT website. These are used to retrieve your Foundry license and download the application distribution by the Foundry VTT Docker container. They are stored in an Azure Key Vault to protect them. The `FOUNDRY_ADMIN_KEY` is the admin password you'll use to log into your Foundry VTT once it is deployed.

    There are also a number of optional parameters you can also configure to control the deployment (this is just a few):

    ```bash
    azd env set AZURE_DEPLOY_NETWORKING "true"
    azd env set AZURE_STORAGE_CONFIGURATION "Premium_100GB"
    azd env set AZURE_COMPUTE_SERVICE "Web App"
    azd env set AZURE_APP_SERVICE_PLAN_SKUNAME "P0v3"
    ```

1. Start the deployment:

    ```bash
    azd provision
    ```

1. You will then be asked to select the Azure Subscription and the Azure region to deploy the resources to.

![The commands used to deploy the Foundry VTT solution accelerator](/assets/images/screenshots/ss_foundryvtt_deploy.png 'The commands used to deploy the Foundry VTT solution accelerator')

> [!NOTE]
> The Azure region should be the closest to you and your players for optimal latency.

And that's it! In about 5 minutes (give or take a minute), you'll have a fully deployed Foundry VTT instance running in Azure. At the end of the deployment, you'll see the URL where your Foundry VTT server is accessible displayed in the console.

## See it in action

Here's a video walkthrough of the deployment process:

<custom-youtube slug="asb8bu0eRmM" label="Deploying Foundry VTT to Azure in 5 minutes using Azure Developer CLI"></custom-youtube>

If the embed doesn't work, you can [watch the video on YouTube](https://youtu.be/asb8bu0eRmM)

## Configuration options

The solution accelerator does provide a number of configuration options you can use to customize your deployment. For example, you can change the SKU of the App Service Plan, the size of the Azure Storage account, whether to deploy a virtual network, and more. These can be set using the `azd env set` command as shown above.

### Required Parameters

- `FOUNDRY_USERNAME` - Your Foundry VTT username.
- `FOUNDRY_PASSWORD` - Your Foundry VTT password
- `FOUNDRY_ADMIN_KEY` - The admin key for Foundry VTT

### Optional Parameters

- `AZURE_COMPUTE_SERVICE` - `Web App` (default, recommended) or `Container Instance`
- `AZURE_DEPLOY_DDB_PROXY` - `true` (default) or `false` to deploy a DDB Proxy. The DDB Proxy is second Web App that runs Mr. Primates DDB-Proxy container. For more information see [DDB-Proxy](https://github.com/PlagueHO/foundryvtt-azure/?tab=readme-ov-file#ddb-proxy).
- `AZURE_DEPLOY_NETWORKING` - `true` (default) or `false` to deploy a virtual network
- `AZURE_STORAGE_CONFIGURATION` - `Premium_100GB` (default) or `Standard_100GB`
- `AZURE_STORAGE_PUBLIC_ACCESS` - `false` (default) to restrict public access to storage, or `true` to allow public access
- `AZURE_APP_SERVICE_PLAN_SKUNAME` - App Service SKU (e.g., `P0v3` is default)
- `AZURE_DEPLOY_DIAGNOSTICS` - `true` or `false` (default) to deploy diagnostics

> [!NOTE]
> There are other optional parameters you can set to control the deployment. You can find the full list of parameters in the [GitHub repository](https://github.com/PlagueHO/foundryvtt-azure).

## What gets deployed?

When you deploy the solution accelerator, these Azure resources are provisioned:

1. **Azure Storage Account**: Hosts your Foundry VTT data files, configurations, and worlds.
1. **Azure Web App**: Hosts the Foundry VTT application using the Felddy Docker container.
1. **Azure Key Vault**: Stores sensitive information like your Foundry VTT credentials securely.
1. **Azure Virtual Network** (optional): Provides a secure network for your resources.

The solution is designed with a separation of concerns - your data storage is independent from the compute resources. This means you can rebuild, upgrade, or modify your server without risking your valuable game data.

## Advanced: Deploying with GitHub Actions

For those who want to automate deployments further, the solution accelerator can be integrated with GitHub Actions. This allows you to:

1. Version control your infrastructure configuration
1. Automate deployments when you push changes
1. Easily deploy to multiple environments (e.g., testing and production)

To set this up, check out the [instructions](https://github.com/PlagueHO/foundryvtt-azure/?tab=readme-ov-file#deploy-with-github-actions) in the GitHub repository. It provides a step-by-step guide on how to configure GitHub Actions to deploy your Foundry VTT instance automatically whenever you push changes to your repository.

## What next?

I'm planning to add support to deploy the Foundry VTT and DDB-Proxy to Azure Container Apps in the future, which will allow you to run Foundry VTT in a serverless environment. In theory this should allow you to reduce hosting costs by enabling scale-to-zero for the Foundry VTT server when it's not in use, and scale up automatically when players connect. However, this will need some testing and evaluation to ensure it works well with the Foundry VTT application.

If you encounter any issues, have any questions or feature requests, please create an issue in the [GitHub repository](https://github.com/PlagueHO/foundryvtt-azure/issues).

Happy gaming in Azure!
