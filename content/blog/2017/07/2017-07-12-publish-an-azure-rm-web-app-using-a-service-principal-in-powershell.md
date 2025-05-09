---
title: "Publish an Azure RM Web App using a Service Principal in PowerShell"
date: "2017-07-12"
categories:
  - "azure-web-app"
tags:
  - "azure"
  - "powershell"
  - "service-principal"
coverImage: "ss_webappdeploy_publishazurermwebappproject.png"
---

# Introduction

Deploying an [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/) is almost _stupidly simple._ If I were to list the methods and tools I'd still be typing next week. The problem with many of these tools and process is that they do a whole lot of magic under the hood which makes the process difficult to manage in **source control**.

I'm a big believer that all code (including deployment code) should be in the **application source repository** so it can be run by **any tool** or **release pipeline** - including **manually** by development teams. This ensures that whatever deployment process is used, it is the same no matter who or what runs it - and we end up **continuously testing** the deployment code and process.

So I decided to go and find out how to deploy an [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/) using **PowerShell** using an [Service Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-application-objects).

## Where is Publish-AzureRMWebsiteProject?

If you look through the [Azure PowerShell](https://docs.microsoft.com/en-us/powershell/azure/overview?view=azurermps-4.1.0) cmdlets you'll find a **service manager** one called [Publish-AzureWebsiteProject](https://docs.microsoft.com/en-us/powershell/module/azure/publish-azurewebsiteproject?view=azuresmps-4.0.0). This cmdlet _looks like_ it should do the trick, but it isn't suitable because it _requires authentication_ by a **user account** **instead of a service principal**.

Only **service principal** accounts can be authenticated using automation. Therefore using [Publish-AzureWebsiteProject](https://docs.microsoft.com/en-us/powershell/module/azure/publish-azurewebsiteproject?view=azuresmps-4.0.0) would only work if a development team member was able to **interactively login**\- which would prevent the same process being used for **automation** or our **continuous delivery** pipeline. The newer Azure Resource Manager cmdlets (\*-AzureRM\*) all support a login using a **service principal**, but the problem is that there is no **Publish-AzureRMWebsiteProject** cmdlet.

So, to work around this limitation I determined I had to use [Web Deploy/MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy). The purpose of this post is to **share the PowerShell function/code** and process I used to do this. This will work with and without [Web App deployment slots](https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-staged-publishing).

> **Note:** in my case our teams put all deployment code into a [PowerShell PSake](https://github.com/psake/psake) task in the _application source code repository_ to make it trivial for anyone to run the deployment. The **continuous delivery pipeline** was also able to call the exact same task to perform the deployment. There is no requirement to use [PowerShell PSake](https://github.com/psake/psake) - just a simple PowerShell script will do.

# The Code

So, I'll start by just pasting the function that does performs the task:

{{< gist PlagueHO c028ce068df16c3afa68eaa810bcb9f6 >}}

Just save this file as **Publish-AzureRMWebappProject.ps1** and you're ready to start publishing (almost).

Before you can use this function you'll need to get a few things sorted:

1. Create a [Service Principal with a password](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authenticate-service-principal#create-service-principal-with-password) to use to deploy the web app using the instructions on [this page](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authenticate-service-principal#create-service-principal-with-password).
2. Make sure you have got the latest version of the Azure PowerShell Modules installed (I used v4.0.0). See [this page](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-4.1.0) for instructions.
3. Make sure you've got MSDeploy.exe installed on your computer - see [this page](https://www.iis.net/downloads/microsoft/web-deploy) for instructions. _You can pass the **path** to MSDeploy.exe into the Publish-AzureRMWebappProject.ps1 using the **MSDeployPath** parameter._
4. Gather the following things (there are many ways of doing that - but I'll leave it up to you to figure out what works for you):
    1. the **Subscription Id** of the subscription you'll be deploying to.
    2. the **Tenant Id** of the Azure Active Directory containing your Service Principal.
    3. the **Application Id** that was displayed to you when you created the **Service Principal**.
    4. the **Password** you assigned when you created the **Service Principal**.

Once you have got all this information you can call the script above like this:

{{< gist PlagueHO aa3604e4d820768a7ec79164187adbb2 >}}

> **Note:** You'll need to make sure to replace the variables $SubscriptionId, $TenantId, $Password and $Username with the values for **your Azure Subscription**, **Tenancy** and **Service Principal**.

When everything is done correctly this is what happens when you run it (with -Verbose enabled):

![ss_webappdeploy_publishazurermwebappproject](/images/ss_webappdeploy_publishazurermwebappproject.png)

> **Note**: in the case above I was installing to a deployment staging slot called **offline**, so the new version of my website wouldn't have been visible in my **production** slot until I called the [Swap-AzureRmWebAppSlot](https://docs.microsoft.com/en-us/powershell/module/azurerm.websites/switch-azurermwebappslot?view=azurermps-4.1.0) cmdlet to swap the **offline** slot with my **production** slot.

All in all, this is fairly robust and allows our **development teams** and our **automation** and **continuous delivery pipeline** to all use the exact same deployment code which reduces deployment failures.

If you're interested in more details about the code/process, please feel free to ask questions.

Thanks for reading.

