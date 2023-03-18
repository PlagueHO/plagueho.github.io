---
title: "Enable AKS Azure Active Directory integration with a Managed Identity from an ARM template"
date: "2020-08-08"
categories:
  - "azure-kubernetes-service"
tags:
  - "aks"
  - "azure"
coverImage: "ss_aksaadintegration_aadprofile.png"
---

When you're deploying an Azure Kubernetes Service (AKS) cluster in Azure, it is common that you'll want to integrate it into Azure Active Directory (AAD) to use it as an authentication provider.

The [original (legacy) method for enabling this](https://docs.microsoft.com/en-us/azure/aks/azure-ad-integration-cli) was to manually create a [Service Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal) and use that to grant your AKS cluster access to AAD. The problem with this approach was that you would need to manage this manually and as well as rolling worry about rolling secrets.

More recently an improved method of integrating your AKS cluster into AAD was announced: [AKS-managed Azure Active Directory integration](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal). This method allows your AKS cluster resource provider to take over the task of integrating to AAD for you. This simplifies things significantly.

You can easily do this integration by running PowerShell or Bash scripts, but if you'd prefer to use an ARM template, here is what you need to know.

1. You will need to have an `object id` of an **Azure Active Directory group** to use as your Cluster Admins.
    \[gist\]fa54c4e08386eea626fac7d9e3d7112a\[/gist\]

    ![ss_aksaadintegration_createaadgroup](/images/ss_aksaadintegration_createaadgroup.png)

    This will return the object Id for the newly create group in the variable `$clusterAdminGroupObjectIds`. You will need to pass this variable into your ARM template.
2. You need to add an `aadProfile` block into the `properties` of your AKS cluster deployment definition:
    ![](/images/ss_aksaadintegration_aadprofile.png)
    For example:
    \[gist\]6da009d41c531164fdb8f86c62a49906\[/gist\]
3. When you deploy the ARM template (using whatever method you choose), you'll need to pass the `$clusterAdminGroupObjectIds`​as a parameter. For example:
    \[gist\]5c395cc533880098b16d8e16ca3b2c05\[/gist\]

That is all you really need to get AKS-managed AAD integration going with your AKS cluster.

For a fully formed ARM template for that will deploy an AKS cluster with AKS-managed AAD integration plus a whole lot more, [check out this ARM template](https://github.com/PlagueHO/Workshop-AKS-Advanced-with-AGIC/blob/master/src/infrastructure/azuredeploy.json). It will deploy an AKS cluster including the following:

- A Log Analytics workspace integrated into the cluster with Cluster Insights and Diagnostics.
- A VNET for the cluster nodes.
- An ACR integrated into the VNET with Private Link and Diagnostics into the Log Analytics Workspace.
- Multiple node pools spanning availability zones:
    - A system node pool including automatic node scaler.
    - A Linux user node pool including automatic node scaler.
    - A Windows node pool including automatic node scaler and taints.

Thanks for reading.

