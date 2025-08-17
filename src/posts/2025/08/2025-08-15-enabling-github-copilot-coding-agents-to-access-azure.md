---
title: "Enabling GitHub Copilot Coding Agents to Access Azure"
date: 2025-08-15
description: "Learn how to securely configure GitHub Copilot coding agents to access Azure resources using Entra ID app registrations, federated credentials, RBAC permissions, and GitHub Actions workflows."
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

## Introduction

GitHub Copilot coding agents are revolutionizing how we approach development workflows, but their true power emerges when they can securely interact with your Azure resources. Whether you're automating infrastructure deployments, managing cloud resources, or integrating with Azure services, giving your Copilot agents secure access to Azure opens up incredible possibilities for automation and efficiency.

In this post, I'll walk you through the complete process of setting up GitHub Copilot coding agents to securely access Azure resources. We'll cover everything from creating Entra ID app registrations to configuring federated credentials and implementing the necessary GitHub Actions workflow.

## Why This Matters

Imagine having a Copilot agent that can:
- Automatically provision Azure resources when you create new features
- Monitor and adjust your cloud infrastructure based on usage patterns
- Deploy applications directly to Azure App Service or Container Apps
- Manage Azure Key Vault secrets and configuration
- Scale resources up or down based on demand

The key to all of this is secure, keyless authentication that follows enterprise security best practices. No more storing API keys or connection strings in your repositories!

## Security Considerations and Best Practices

Before we dive into the setup, let's establish some important security principles:

- **Principle of least privilege**: Grant only the minimum permissions required
- **Federated credentials**: Use workload identity federation instead of secrets
- **Environment isolation**: Separate credentials for different environments
- **Audit logging**: Enable monitoring for all Azure access
- **Time-bound access**: Leverage short-lived tokens rather than long-lived secrets

## Step-by-Step Setup Process

### 1. Creating the Entra ID App Registration

The first step is creating a dedicated Entra ID application registration for your GitHub Copilot agents. This application will serve as the identity that your agents use to authenticate with Azure.

<!-- Screenshot: ss_entra_id_app_registration_creation.png -->
*Screenshot placeholder: Azure Portal showing the Entra ID → App registrations → New registration screen*

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Go to **Entra ID** → **App registrations**
3. Click **New registration**
4. Provide a meaningful name like `GitHub-Copilot-YourRepo`
5. Leave the redirect URI blank (we're using federated credentials)
6. Click **Register**

Once created, make note of the following values from the **Overview** page:
- **Application (client) ID** - You'll need this for GitHub secrets
- **Directory (tenant) ID** - Also required for GitHub secrets

```bash
# Example values (yours will be different)
AZURE_CLIENT_ID="12345678-1234-1234-1234-123456789012"
AZURE_TENANT_ID="87654321-4321-4321-4321-210987654321"
```

### 2. Setting Up Federated Credentials

Federated credentials create a trust relationship between GitHub and Azure without requiring secrets. This is much more secure than storing service principal secrets in your repository.

<!-- Screenshot: ss_federated_credential_configuration.png -->
*Screenshot placeholder: Federated credentials configuration screen in Azure Portal*

1. In your app registration, go to **Certificates & secrets**
2. Click on the **Federated credentials** tab
3. Click **Add credential**
4. Select **GitHub Actions deploying Azure resources**
5. Fill in the details:
   - **Organization**: Your GitHub username or organization
   - **Repository**: Your repository name
   - **Entity type**: Environment
   - **Environment name**: `copilot` (this is crucial - must match exactly)
   - **Name**: A descriptive name like `GitHub-Copilot-Environment`

> **Important**: The environment name must be exactly `copilot` with lowercase 'c'. This addresses the AADSTS7002138 error related to case-sensitive matching that some users encounter. Azure federated identity credentials are case-sensitive, so using `Copilot` or `COPILOT` will cause authentication failures.

### 3. Configuring Azure RBAC Roles

Now we need to grant the appropriate permissions to our app registration. The specific roles depend on what your Copilot agents need to do, but here are common scenarios:

<!-- Screenshot: ss_azure_rbac_role_assignment.png -->
*Screenshot placeholder: Azure RBAC role assignment interface*

For **resource deployment and management**:
```bash
# Contributor role for resource group
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

**Best Practice**: Start with minimal permissions and expand as needed. You can always add more roles later.

### 4. Adding GitHub Repository Secrets

Your Copilot agents need access to three key pieces of information to authenticate with Azure. These should be stored as repository secrets, not environment variables in your code.

<!-- Screenshot: ss_github_repository_secrets.png -->
*Screenshot placeholder: GitHub repository secrets configuration page*

1. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following repository secrets:

```
AZURE_CLIENT_ID: 12345678-1234-1234-1234-123456789012
AZURE_TENANT_ID: 87654321-4321-4321-4321-210987654321
AZURE_SUBSCRIPTION_ID: 11111111-2222-3333-4444-555555555555
```

**Security Note**: These aren't really "secrets" in the traditional sense since they're identifiers, but storing them as repository secrets keeps your configuration centralized and secure.

### 5. Creating the GitHub Actions Workflow

Now for the magic - creating a workflow that your Copilot agents can use to authenticate with Azure. This workflow establishes the authentication context that other workflows can inherit.

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
    environment: copilot  # This must match your federated credential
    
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

This workflow provides a foundation that your Copilot agents can build upon for various Azure automation tasks.

### 6. Testing and Validation

Time to verify everything works correctly! Let's test the authentication flow.

<!-- Screenshot: ss_workflow_execution_results.png -->
*Screenshot placeholder: GitHub Actions workflow run showing successful Azure authentication*

1. Go to your GitHub repository
2. Click **Actions** → **Copilot Setup Steps**
3. Click **Run workflow**
4. Select `authenticate` as the action
5. Click **Run workflow**

If everything is configured correctly, you should see:
- Successful authentication to Azure
- Your account information displayed
- A list of your resource groups

**Common troubleshooting scenarios:**

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

## Advanced Topics

### Different Authentication Patterns for Various Azure Services

Different Azure services may require specific authentication approaches:

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

### Scaling This Approach Across Multiple Repositories

For organizations with multiple repositories, consider:

1. **Shared app registrations** per environment (dev, staging, prod)
2. **Standardized naming conventions** for consistency
3. **Centralized role assignment** using Azure Policy or Bicep templates
4. **Template repositories** with pre-configured workflows

### Integration with Azure DevOps and Other Tools

You can extend this pattern to work with:
- **Azure DevOps**: Use service connections with workload identity federation
- **Terraform**: Configure the Azure provider to use OIDC authentication
- **Bicep/ARM**: Deploy templates using the authenticated context
- **Azure CLI/PowerShell**: Run any Azure management commands

## Monitoring and Logging Considerations

Don't forget to monitor your Copilot agent activities:

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

## Conclusion

Setting up GitHub Copilot coding agents with secure Azure access transforms your development workflow from manual processes to intelligent automation. The federated credential approach we've implemented provides enterprise-grade security without the complexity of managing secrets.

The benefits of this setup include:
- **Enhanced security** through keyless authentication
- **Reduced operational overhead** with automated Azure management
- **Improved compliance** with audit trails and proper access controls
- **Faster development cycles** with intelligent infrastructure management

By following the principle of least privilege and using workload identity federation, you've created a foundation that scales with your organization's needs while maintaining security best practices.

## Next Steps and Additional Resources

Ready to take this further? Consider:

1. **Expanding permissions** gradually as your Copilot agents take on more responsibilities
2. **Creating reusable workflows** for common Azure operations
3. **Implementing infrastructure as code** with Bicep or Terraform
4. **Setting up multi-environment deployments** with different app registrations

Remember: the goal isn't to replace human oversight, but to automate the routine tasks so you can focus on building great solutions. Start small, validate your approach, and gradually expand your Copilot agents' capabilities.

## Related Links

- [Azure Workload Identity Federation Documentation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [GitHub Actions Azure Login](https://github.com/Azure/login)
- [Azure RBAC Documentation](https://learn.microsoft.com/azure/role-based-access-control/)
- [Entra ID App Registration Guide](https://learn.microsoft.com/entra/identity-platform/quickstart-register-app)
- [GitHub Copilot Enterprise Documentation](https://docs.github.com/enterprise-cloud@latest/copilot)
- [Reference Workflow Example](https://github.com/PlagueHO/foundryvtt-azure/blob/main/.github/workflows/copilot-setup-steps.yml)