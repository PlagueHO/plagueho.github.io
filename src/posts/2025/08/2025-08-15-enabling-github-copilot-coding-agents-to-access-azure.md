---
title: "Enabling GitHub Copilot Coding Agents to Access Azure"
date: 2025-08-15
description: "Learn how to securely configure GitHub Copilot coding agents to access Azure resources using Entra ID app registrations, federated credentials and RBAC permissions."
tags: 
  - "azure"
  - "github"
  - "copilot"
  - "entra-id"
  - "authentication"
  - "rbac"
  - "devops"
  - "security"
  - "automation"
  - "neural-flow"
image: "/assets/banners/banner-2025-08-15-enabling-github-copilot-coding-agents-to-access-azure.png"
---

> [!IMPORTANT]
> Before I start with the details, I want to make something extremely clear: Do not give coding agents access to production. We've all read/seen the stories on the internet about AI's potential for causing chaos if not properly controlled. This is not specific to AI, but it's a general rule: Don't give developers/anyone permanent, ungoverned access to production resources without strict controls in place. I could spend the rest of this blog post lecturing about this, but then we'd never actually get to the point of this article. So warnings aside, lets get to it.

## Background

I've been experimenting with [GitHub Copilot coding agents](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/coding-agent/coding-agent), assigning them tasks alomost every day (and night) and they're pretty impressive. But on occasion I actually need coding agents to interact with Azure resources, usually as part of diagnosing an issue/fixing a bug that requires real-time access to those resources (only in dev/test, of course). This is also sometimes useful if I want the coding agent to be able to verify some infrastructure it's creating Bicep or Terraform files for.

So, this blog post shows you how to configure your coding agents to be able to use a federated identity to access Azure resources securely, without needing to store any secrets in your repository. As well as set up RBAC permissions so that they only get the level of access they need.

## Why This Matters

Here's what I can do now with my Copilot agents:

- Diagnose issues that might be occuring in dev/test environments
- Access key vault secrets that might be required to access dev/test databases or other resources
- Validate or obtain specific information about the Azure environment that is being worked with
- Automatically provision (and of course cleanup) Azure resources as part coding agent development process. But remember, deploying to Azure might have a cost associated with it.

> [!IMPORTANT]
> The most important thing to note however, is the principle of least privilege: If your coding agent doesn't need access to Azure, don't provide it access. If just needs to be able to read diagnostic logs from a Log Analytics workspace, then that's all it should be allowed to do. It's very easy to over-provision access, so always err on the side of caution.

## Azure Costs

If you give coding agents permission to deploy resources, be aware of the potential costs involved. Because coding agents now read the [copilot-instructions.md](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/configure-custom-instructions/add-repository-instructions) in your repository, it will be critical to provide cost management guidance within that file - including the fact that they should delete any resources they create once they are done with them.

My advice is to avoid giving them write/deploy access unless absolutely necessary, or at the very least have a method of tracking and auditing their resource usage. It would be quite simple to create a janitor (a GitHub Actions workflow) that deletes any resources that were created in a resource group that the Coding Agent has permission to create in.

## Getting the Security Right

Before we dive into the setup, let me be clear about the security principles I follow. I've seen too many "quick demos" that skip these fundamentals:

- **Least privilege always**: Give only the minimum permissions needed. You can expand later.
- **Federated credentials only**: Workload identity federation is the right way to give your coding agents access to Azure.
- **Environment isolation**: Dev/test, staging need separate identities. But I shouldn't have to repeat: don't give coding agents access to production.
- **Check what your agents are doing**: You need to know what your agents are doing in Azure.
- **Your agent, your cost**: Coding agents don't care about your budget (unless you tell them to and what to do about it).

These aren't optional "best practices"—they're requirements if you want to sleep well at night.

## How to Set This Up

### 1. Create the Entra ID App Registration

First, you need a dedicated identity for your Copilot agents. I always create separate app registrations for different projects—it makes tracking and auditing much easier.

1. Head to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Entra ID** → **App registrations** 
3. Click **New registration**
4. Name it something meaningful like `GitHub-Copilot-YourRepo`
5. Leave the redirect URI blank (we're using federated credentials)
6. Click **Register**

Once it's created, grab these values from the **Overview** page:

- **Application (client) ID** - You'll need this for GitHub secrets
- **Directory (tenant) ID** - Also required for GitHub secrets

```bash
# Example values (yours will be different)
AZURE_CLIENT_ID="12345678-1234-1234-1234-123456789012"
AZURE_TENANT_ID="87654321-4321-4321-4321-210987654321"
```

### 2. Configure Federated Credentials

This is where the magic happens. Federated credentials create a trust relationship between GitHub and Azure without storing any secrets. It's way more secure than cramming service principal secrets into your repo.

Here's the crucial part that tripped me up initially:

1. In your app registration, go to **Certificates & secrets**
2. Click the **Federated credentials** tab
3. Click **Add credential**
4. Select **GitHub Actions deploying Azure resources**
5. Fill in the details:
   - **Organization**: Your GitHub username or organization
   - **Repository**: Your repository name
   - **Entity type**: Environment
   - **Environment name**: `copilot` (this is crucial - must match exactly)
   - **Name**: Something descriptive like `GitHub-Copilot-Environment`

> [!IMPORTANT]
> The environment name must be exactly `copilot` with lowercase 'c'. I learned this the hard way when I kept getting AADSTS7002138 errors. Azure federated identity credentials are case-sensitive, so `Copilot` or `COPILOT` will fail.

### 3. Set Up Azure RBAC Roles

Now for the permissions. The specific roles depend on what your agents need to do, but I always start minimal and expand. Here's my approach:

To allow the coding agent to experiment in a single group for **resource deployment and management**:

```bash
# Contributor role to a single existing resource group
az role assignment create \
  --assignee $AZURE_CLIENT_ID \
  --role "Contributor" \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/your-resource-group"
```

For **read-only monitoring**:

```bash
# Reader role for subscription
az role assignment create \
  --assignee $AZURE_CLIENT_ID \
  --role "Reader" \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID"
```

For **Key Vault access**:

```bash
# Key Vault Secrets User
az role assignment create \
  --assignee $AZURE_CLIENT_ID \
  --role "Key Vault Secrets User" \
  --scope "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/your-rg/providers/Microsoft.KeyVault/vaults/your-keyvault"
```

I can't stress this enough: start with minimal permissions and expand as needed. I've seen too many demos where people just hand out Contributor at the subscription level. That's asking for trouble.

### 4. Add GitHub Repository Secrets

Your Copilot agents need three pieces of info to authenticate with Azure. Store these as repository secrets—not environment variables in your code.

1. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:

```text
AZURE_CLIENT_ID: 12345678-1234-1234-1234-123456789012
AZURE_TENANT_ID: 87654321-4321-4321-4321-210987654321
AZURE_SUBSCRIPTION_ID: 11111111-2222-3333-4444-555555555555
```

These aren't really "secrets" since they're identifiers, but storing them as repository secrets keeps your config centralized and secure.

### 5. Create the GitHub Actions Workflow

Here's where it all comes together. This workflow gives your Copilot agents the authentication context they need to actually manage Azure resources.

Create `.github/workflows/copilot-setup-steps.yml`:

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:
    inputs:
      action:
        description: 'Action to perform'
        required: true
        default: 'authenticate'
        type: choice
        options:
          - authenticate
          - deploy-resources
          - check-status

permissions:
  id-token: write
  contents: read

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    environment: copilot  # This must match your federated credential environment name
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Azure login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: Verify Azure access
        run: |
          echo "Successfully authenticated to Azure!"
          az account show
          az group list --query "[].{Name:name, Location:location}" --output table
      
      - name: Set up Azure CLI extensions
        run: |
          az extension add --name containerapp --upgrade
          az extension add --name application-insights --upgrade
      
      - name: Deploy resources (if requested)
        if: github.event.inputs.action == 'deploy-resources'
        run: |
          echo "Deploying Azure resources..."
          # Add your deployment commands here
          # az deployment group create --resource-group myRG --template-file main.bicep
      
      - name: Check resource status
        if: github.event.inputs.action == 'check-status'
        run: |
          echo "Checking Azure resource status..."
          # Add your status check commands here
          # az webapp show --name myapp --resource-group myRG --query "state"
```

This workflow provides a solid foundation that your Copilot agents can build on for various Azure automation tasks. The key is the `environment: copilot` line—that's what ties everything together with your federated credential.

### 6. Test It Out

Time to see if everything works. Let's test the authentication flow:

1. Go to your GitHub repository
2. Click **Actions** → **Copilot Setup Steps**
3. Click **Run workflow**
4. Select `authenticate` as the action
5. Click **Run workflow**

If everything's configured correctly, you should see:

- Successful authentication to Azure
- Your account information displayed
- A list of your resource groups

**When things go wrong** (and they will):

**Error: `AADSTS7002138: No matching federated identity record found`**

- Verify the environment name is exactly `copilot` (lowercase)
- Check that your repository and organization names match exactly
- Ensure the federated credential subject pattern is correct

**Error: `AADSTS70021: No matching federated identity record found for presented assertion`**

- Verify your GitHub repository secrets are correct
- Check that the app registration client ID matches
- Ensure the federated credential is properly configured

**Error: `Authorization failed`**

- Verify RBAC role assignments are correct
- Check that permissions are assigned to the correct scope
- Ensure the service principal has the necessary roles

## Beyond the Basics

### Authentication Patterns for Different Azure Services

Different Azure services sometimes need specific authentication approaches:

```yaml
# For Azure Container Registry
- name: Login to ACR
  run: az acr login --name myregistry

# For Azure Key Vault
- name: Get secret from Key Vault
  run: |
    SECRET=$(az keyvault secret show --vault-name myvault --name mysecret --query value -o tsv)
    echo "::add-mask::$SECRET"

# For Azure Storage
- name: Access Azure Storage
  run: |
    az storage blob list --container-name mycontainer --account-name mystorageaccount --auth-mode login
```

### Scaling This Across Multiple Repos

For organizations with multiple repositories, I recommend:

1. **Shared app registrations** per environment (dev, staging, prod)
2. **Standardized naming conventions** for consistency  
3. **Centralized role assignment** using Azure Policy or Bicep templates
4. **Template repositories** with pre-configured workflows

### Integration with Other Tools

You can extend this pattern to work with:

- **Azure DevOps**: Use service connections with workload identity federation
- **Terraform**: Configure the Azure provider to use OIDC authentication
- **Bicep/ARM**: Deploy templates using the authenticated context
- **Azure CLI/PowerShell**: Run any Azure management commands

## Don't Forget Monitoring

You absolutely need to monitor what your Copilot agents are doing:

```yaml
- name: Enable Azure activity logging
  run: |
    az monitor activity-log list \
      --caller ${{ secrets.AZURE_CLIENT_ID }} \
      --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
      --query "[].{Time:eventTimestamp, Operation:operationName, Status:status}" \
      --output table
```

Set up alerts for:

- Unusual authentication patterns
- Failed authentication attempts
- High-privilege operations
- Resource creation/deletion activities

Trust me, you want to know when your agents start doing unexpected things.

## Conclusion

Setting up GitHub Copilot coding agents with secure Azure access completely changes your development workflow. No more manual Azure management tasks, no more security debt from stored secrets.

What I love about this approach:

- **Enhanced security** through keyless authentication
- **Reduced operational overhead** with automated Azure management
- **Improved compliance** with audit trails and proper access controls
- **Faster development cycles** with intelligent infrastructure management

The federated credential approach follows enterprise security best practices while actually being easier to set up than the old "secrets everywhere" approach.

## What's Next

Ready to expand this? Consider:

1. **Gradually expanding permissions** as your agents take on more responsibilities
2. **Creating reusable workflows** for common Azure operations
3. **Implementing infrastructure as code** with Bicep or Terraform
4. **Setting up multi-environment deployments** with different app registrations

Remember: the goal isn't to replace human oversight—it's to automate the tedious stuff so you can focus on building great solutions.

## Related Links

- [Azure Workload Identity Federation Documentation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [GitHub Actions Azure Login](https://github.com/Azure/login)
- [Azure RBAC Documentation](https://learn.microsoft.com/azure/role-based-access-control/)
- [Entra ID App Registration Guide](https://learn.microsoft.com/entra/identity-platform/quickstart-register-app)
- [GitHub Copilot Enterprise Documentation](https://docs.github.com/enterprise-cloud@latest/copilot)
- [Reference Workflow Example](https://github.com/PlagueHO/foundryvtt-azure/blob/main/.github/workflows/copilot-setup-steps.yml)