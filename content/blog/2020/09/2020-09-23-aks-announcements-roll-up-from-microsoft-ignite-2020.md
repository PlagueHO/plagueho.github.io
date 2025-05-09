---
title: "AKS Announcements Roll-up from Microsoft Ignite 2020"
date: "2020-09-23"
categories: 
  - "azure-kubernetes-service"
tags: 
  - "aks"
  - "azure"
  - "ignite"
coverImage: "aks-1.png"
---

There were a whole lot of announcements around Azure Kubernetes Service (AKS) at Ignite 2020. I thought I'd quickly sum them all up and provide links:

## [Brendan Burn's post on AKS Updates](https://techcommunity.microsoft.com/t5/azure-developer-community-blog/enterprise-grade-kubernetes-on-azure/ba-p/1659386)

A great summary of recent investments in AKS from Kubernetes co-creator, Brendan Burns.

## Preview: [AKS now available on Azure Stack HCI](https://azure.microsoft.com/en-us/blog/bring-innovation-anywhere-with-azures-multicloud-multiedge-hybrid-capabilities/)

AKS on Azure Stack HCI enables customers to deploy and manage containerized apps at scale on Azure Stack HCI, just as they can run AKS within Azure.

## Public Preview: [AKS Stop/Start Cluster](https://docs.microsoft.com/en-us/azure/aks/start-stop-cluster)

Pause an AKS cluster and pick up where they left off later with a switch of a button, saving time and cost.

## GA: [Azure Policy add on for AKS](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes#install-azure-policy-add-on-for-aks)

Azure Policy add on for AKS allows customers to audit and enforce policies to their Kubernetes resources.

## Public Preview: [Confidential computing nodes on Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/confidential-computing/confidential-nodes-aks-overview)

Azure Kubernetes Service (AKS) supports adding [DCsv2 confidential computing nodes](https://docs.microsoft.com/en-us/azure/confidential-computing/confidential-computing-enclaves) on Intel SGX.

## GA: [AKS support for new Base image Ubuntu 18.04](https://azure.microsoft.com/en-us/updates/ga-aks-support-for-new-base-image-ubuntu-1804/)

You can now create Node Pools using Ubuntu 18.04.

## GA: [Mutate default storage class](https://docs.microsoft.com/en-us/azure/aks/azure-files-dynamic-pv#create-a-storage-class)

You can now use a different storage class in place of the default storage class to better fit their workload needs.

## Public preview: [Kubernetes 1.19 support](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.19.md#whats-new-major-themes)

AKS now supports Kubernetes release 1.19 in public preview. Kubernetes release 1.19 includes several new features and enhancements such as support for TLS 1.3, Ingress and seccomp feature GA, and others.

## Public preview: [RBAC for K8s auth](https://docs.microsoft.com/en-us/azure/aks/manage-azure-rbac)

With this capability, you can now manage RBAC for AKS and its resources using Azure or native Kubernetes mechanisms. When enabled, Azure AD users will be validated exclusively by Azure RBAC while regular Kubernetes service accounts are exclusively validated by Kubernetes RBAC.

## Public Preview: [VSCode ext. diag+periscope](https://azure.microsoft.com/en-us/updates/public-preview-visual-studio-code-extension-diagnostics-periscope/)

This Visual Studio Code extension enables developers to use AKS periscope and AKS diagnostics in their development workflow to quickly diagnose and troubleshoot their clusters.This Visual Studio Code extension enables developers to use AKS periscope and AKS diagnostics in their development workflow to quickly diagnose and troubleshoot their clusters.

## **Enhanced protection for containers**

**Enhanced protection for containers**: As containers and specifically Kubernetes are becoming more widely used, the Azure Defender for Kubernetes offering has been extended to include Kubernetes-level policy management, hardening and enforcement with admission control to make sure that Kubernetes workloads are secured by default. In addition, container image scanning by Azure Defender for Container Registries will now support continuous scanning of container images to minimize the exploitability of running containers

**Learn more about [Microsoft Defender](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Faka.ms%2FAA9g2sn&data=02%7C01%7CDaniel.ScottRaynsford%40microsoft.com%7C9a03bbafdd804e73eb3f08d85f60dd3d%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637364216928474975&sdata=2tanwckRc6o2N2x7t%2F%2Bl41mU%2B0V6XLlnbPGdk%2FRyHEc%3D&reserved=0), [Azure Defender](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Faka.ms%2FAA9k0nf&data=02%7C01%7CDaniel.ScottRaynsford%40microsoft.com%7C9a03bbafdd804e73eb3f08d85f60dd3d%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637364216928484933&sdata=8Vnt%2FZeq0kjHxTu0SRKC6ZbVEiB3AQ1mcimiy7gm%2FAc%3D&reserved=0) and [Azure Sentinel](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Faka.ms%2FAA9jt2s&data=02%7C01%7CDaniel.ScottRaynsford%40microsoft.com%7C9a03bbafdd804e73eb3f08d85f60dd3d%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637364216928484933&sdata=eeYpp2%2BXp0VjCM%2FbLMQvq7nxBtpLPBvMoPlmqWl1Cqs%3D&reserved=0).**

There may indeed been more, and I'll update them as they come to hand. Hope this roll up helps.

Head over to [https://myignite.microsoft.com](https://myignite.microsoft.com) and watch some of the AKS content to get even an even better view of the updates.

