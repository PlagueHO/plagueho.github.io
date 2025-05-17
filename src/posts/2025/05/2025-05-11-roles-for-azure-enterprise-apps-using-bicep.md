---
title: "Assigning Roles for Azure Enterprise Apps using Bicep"
date: 2025-05-11
description: "Learn a practical solution for assigning RBAC roles to Azure Enterprise Applications—like Azure AI Foundry & Azure ML—using Bicep and the Microsoft Graph extension for Bicep."
tags: 
  - "bicep"
  - "azure"
  - "security"
  - "enterprise-apps"
  - "rbac"
  - "microsoft-graph"
  - "service-principal"
---

## Welcome back

It's been a while since I last posted, but with the amount of things going on in the world of AI, I thought it was time to get back into the swing of things. Today, I'm going to share a problem I faced recently and how I solved it with Bicep.

## The problem

I am working on a project for simplifying the deployment of a zero-trust [secure Azure AI Foundry environment](https://learn.microsoft.com/azure/ai-foundry/how-to/create-secure-ai-hub), an [Azure AI Foundry jumpstart](https://github.com/PlagueHO/azure-ai-foundry-jumpstart) if you will. This project deploys the resources using [Bicep](http://aka.ms/bicep), but one of the requirements is to assign the `reader` role to the service principal for the Enterprise Application added  `Azure Machine Learning`.

However, this is not as straightforward as it seems. The `Azure Machine Learning` Enterprise Application is a multi-tenant application, and the service principal object ID is different across all tenants. This means that you cannot hardcode the Object ID in your Bicep template and you can't use the Application ID of the `Azure Machine Learning` Enterprise Application either, as the role assignement requires the Object ID of the service principal in your tenant.

> [!NOTE]
> I'm using the `Azure Machine Learning` Enterprise Application as an example, but this applies to any multi-tenant application in Entra ID that you want to assign roles to in your tenant. For more information on application and service principals objects in Entra ID, see [this article](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals?tabs=browser#relationship-between-application-objects-and-service-principals).

## The solution

The solution to this is to use the experiemental `extensibility` feature of Bicep that allows you to use the [Microsoft Graph Extension](https://learn.microsoft.com/en-us/graph/templates/bicep/reference/overview?view=graph-bicep-1.0) to work with Entra ID resources, such as service principals, groups, and users. This feature is still in preview, but it works well for this use case.

Here is a list of the steps we're going to follow:

1. Enable the extensibility feature of Bicep by adding a `bicepconfig.json` file to your project.
1. Add the Microsoft Graph Bicep extension to your Bicep template.
1. Create the service principal resource for the `Azure Machine Learning` Enterprise Application.
1. Create the role assignment for the service principal using the `id` property of the service principal resource.

And now for the fun part! Let's get started with the code.

### Step 1: Enable Bicep extensibility

To enable the extensibility feature of Bicep, you need to add a `bicepconfig.json` file to your Bicep project. In general this file should be in the same folder as your Bicep files. If you're using Visual Studio Code you open the Command Palette ([CTRL/CMD]+[SHIFT]+P) and select `Bicep: Create Bicep Configuration File` to create the file. To the `bicepconfig.json` file, you need to add the following settings:

- `"extensibility": true` to the `experimentalFeaturesEnabled` section to enable the extensibility feature.
- `"microsoftGraphV1": "br:mcr.microsoft.com/bicep/extensions/microsoftgraph/v1.0:0.2.0-preview"` to the `extensions` section to use the Microsoft Graph Bicep extension.

```json
{
  // See https://aka.ms/bicep/config for more information on Bicep configuration options
  // Press CTRL+SPACE at any location to see Intellisense suggestions
  "analyzers": {
    "core": {
      "rules": {
        "no-unused-params": {
          "level": "warning"
        }
      }
    }
  },
  "experimentalFeaturesEnabled": {
    "extensibility": true
  },
  "extensions": {
    "microsoftGraphV1": "br:mcr.microsoft.com/bicep/extensions/microsoftgraph/v1.0:0.2.0-preview"
  }
}
```

> [!NOTE]
> Once the extensibility feature is out of preview, setting the `"extensibility": true` will no longer be required.

### Step 2: Add the Microsoft Graph Bicep extension

At the beginning of your Bicep template, you need to add the Microsoft Graph Bicep extension. This is done by adding the following line:

```bicep
// Use the Microsoft Graph Bicep extension to work with Entra ID resources
extension microsoftGraphV1
```

### Step 3: Reference the existing service principal resource

You can use the existing [Microsoft.Graph/servicePrincipals@v1.0](https://learn.microsoft.com/en-us/graph/templates/bicep/reference/serviceprincipals?view=graph-bicep-1.0) resource that has the `appId` property set to the GUID of the `Azure Machine Learning` Enterprise Application.

```bicep
// The Service Principal of the Azure Machine Learning service.
resource azureMachineLearningServicePrincipal 'Microsoft.Graph/servicePrincipals@v1.0' existing = {
  appId: '0736f41a-0425-4b46-bdb5-1563eff02385' // Azure Machine Learning service principal
}
```

> [!NOTE]
> If you don't know the `appId` of the Enterprise Application you want to assign, you can find it in the Azure portal by going to `Microsoft Entra ID` > `Enterprise applications` and searching for `Azure Machine Learning`. The `appId` is the `Application ID` of the Enterprise Application. You might need to remove the `Application type == Enterprise Applications` filter to see the `Azure Machine Learning` Enterprise Application in the list.

![The Azure Machine Learning enterprise application in Entra ID](/assets/images/screenshots/ss-entra-id-enterprise-app-azure-machine-learning.png 'The Azure Machine Learning enterprise application in Entra ID')

### Step 4: Create the role assignment

Once the `azureMachineLearningServicePrincipal` resource is available to your Bicep template, you can use the `id` property of the service principal to assign the `reader` role to the resource for the Enterprise Application. In this example, I'm using assigning the `reader` role to an existing `Azure AI Search` service, but you can assign it to any role to any resource, existing or being created in the template.

```bicep
// The existing Azure AI Search service (can be a new or existing resource).
resource azureAiSearch 'Microsoft.Search/searchServices@2025-02-01-preview' existing = {
  name: 'my-azure-ai-search'
}

// The role assignment for the Azure AI Search service to grant reader role to Azure Machine Learning.
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(subscription().subscriptionId, azureAiSearch.id, 'acdd72a7-3385-48ef-bd42-f606fba81ae7' )
  scope: azureAiSearch
  properties: {
    principalType: 'ServicePrincipal'
    principalId: azureMachineLearningServicePrincipal.id
    roleDefinitionId: 'acdd72a7-3385-48ef-bd42-f606fba81ae7' // Role definition ID for Reader role
  }
}
```

## The complete Bicep template

The complete Bicep template looks like this:

```bicep
// Use the Microsoft Graph Bicep extension to work with Entra ID resources
extension microsoftGraphV1

// The Service Principal of the Azure Machine Learning service.
resource azureMachineLearningServicePrincipal 'Microsoft.Graph/servicePrincipals@v1.0' existing = {
  appId: '0736f41a-0425-4b46-bdb5-1563eff02385' // Azure Machine Learning service principal
}

// The existing Azure AI Search service (can be a new or existing resource).
resource azureAiSearch 'Microsoft.Search/searchServices@2025-02-01-preview' existing = {
  name: 'my-azure-ai-search'
}

// The role assignment for the Azure AI Search service to grant reader role to Azure Machine Learning.
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(subscription().subscriptionId, azureAiSearch.id, 'acdd72a7-3385-48ef-bd42-f606fba81ae7' )
  scope: azureAiSearch
  properties: {
    principalType: 'ServicePrincipal'
    principalId: azureMachineLearningServicePrincipal.id
    roleDefinitionId: 'acdd72a7-3385-48ef-bd42-f606fba81ae7' // Role definition ID for Reader role
  }
}
```

You can find the Github Gist containing the code above [here](https://gist.github.com/PlagueHO/0f3a2b1c4d5e7f8a6c9b8e4d5e7f8a6).

To see the entire complete process in action, check out the Bicep for the [Azure AI Foundry Jumpstart](https://github.com/PlagueHO/azure-ai-foundry-jumpstart/blob/main/infra/main.bicep).

## Conclusion

In this post, I showed you how to assign the `reader` role to the service principal for the `Azure Machine Learning` Enterprise Application using Bicep. This is a common scenario deploying services in Azure that are consumed by multi-tenant applications (such as Azure Machine Learning). Using experiemental features in production enviornments is generally not recommended, but hopefully the extensions feature of Bicep will be available in a stable release soon. So keep an eye out for that!

## Related links

- [Bicep documentation](https://aka.ms/bicep)
- [Bicep experimental features](https://github.com/Azure/bicep/blob/main/docs/experimental-features.md)
- [Creating a Bicep configuration file](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config)
- [Microsoft Graph Bicep resource reference](https://learn.microsoft.com/en-us/graph/templates/bicep/reference/overview?view=graph-bicep-1.0)
- [Relationship between application objects and service principals](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals?tabs=browser#relationship-between-application-objects-and-service-principals)
