---
title: "Publish an Azure RM Web App using a Service Principal in PowerShell"
date: 2017-07-12
description: "Publish an Azure RM Web App using a Service Principal in PowerShell"
tags:
  - "azure"
  - "powershell"
  - "service-principal"
  - "azure-web-app"
image: "/assets/images/blog/ss_webappdeploy_publishazurermwebappproject.png"
---

## Introduction

Deploying an [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/) is almost _stupidly simple._ If I were to list the methods and tools I'd still be typing next week. The problem with many of these tools and process is that they do a whole lot of magic under the hood which makes the process difficult to manage in **source control**.

I'm a big believer that all code (including deployment code) should be in the **application source repository** so it can be run by **any tool** or **release pipeline** - including **manually** by development teams. This ensures that whatever deployment process is used, it is the same no matter who or what runs it - and we end up **continuously testing** the deployment code and process.

So I decided to go and find out how to deploy an [Azure Web App](https://azure.microsoft.com/en-us/services/app-service/web/) using **PowerShell** using an [Service Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-application-objects).

### Where is Publish-AzureRMWebsiteProject?

If you look through the [Azure PowerShell](https://docs.microsoft.com/en-us/powershell/azure/overview?view=azurermps-4.1.0) cmdlets you'll find a **service manager** one called [Publish-AzureWebsiteProject](https://docs.microsoft.com/en-us/powershell/module/azure/publish-azurewebsiteproject?view=azuresmps-4.0.0). This cmdlet _looks like_ it should do the trick, but it isn't suitable because it _requires authentication_ by a **user account** **instead of a service principal**.

Only **service principal** accounts can be authenticated using automation. Therefore using [Publish-AzureWebsiteProject](https://docs.microsoft.com/en-us/powershell/module/azure/publish-azurewebsiteproject?view=azuresmps-4.0.0) would only work if a development team member was able to **interactively login**\- which would prevent the same process being used for **automation** or our **continuous delivery** pipeline. The newer Azure Resource Manager cmdlets (\*-AzureRM\*) all support a login using a **service principal**, but the problem is that there is no **Publish-AzureRMWebsiteProject** cmdlet.

So, to work around this limitation I determined I had to use [Web Deploy/MSDeploy](https://www.iis.net/downloads/microsoft/web-deploy). The purpose of this post is to **share the PowerShell function/code** and process I used to do this. This will work with and without [Web App deployment slots](https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-staged-publishing).

> [!NOTE]
> In my case our teams put all deployment code into a [PowerShell PSake](https://github.com/psake/psake) task in the _application source code repository_ to make it trivial for anyone to run the deployment. The **continuous delivery pipeline** was also able to call the exact same task to perform the deployment. There is no requirement to use [PowerShell PSake](https://github.com/psake/psake) - just a simple PowerShell script will do.

## The Code

So, I'll start by just pasting the function that does performs the task:

```powershell
[CmdletBinding()]
param (
    [Parameter(Mandatory = $True)]
    [pscredential]
    $Credential,

    [Parameter(Mandatory = $True)]
    [System.String]
    $TenantId,

    [Parameter(Mandatory = $True)]
    [System.String]
    $SubscriptionId,

    [Parameter(Mandatory = $True)]
    [System.String]
    $WebAppPath,

    [Parameter(Mandatory = $True)]
    [System.String]
    $ResourceGroupName,

    [Parameter(Mandatory = $True)]
    [System.String]
    $WebAppServiceName,

    [Parameter()]
    [System.String]
    $SlotName,

    [Parameter()]
    [System.String]
    $MSDeployPath = "$env:ProgramFiles\IIS\Microsoft Web Deploy V3\msdeploy.exe"
)

if (-not (Test-Path -Path $MSDeployPath))
{
    Throw "MSDeploy.exe not found at '$MSDeployPath'. Please install MSDeploy or specify the path to MSDeploy.exe on this system."
}

# Connect to Azure using SP
$connectParameters = @{
    Credential     = $Credential
    TenantId       = $TenantId
    SubscriptionId = $SubscriptionId
}

Write-Verbose -Message 'Connecting to Azure.'

$null = Add-AzureRmAccount @connectParameters -ServicePrincipal
  
# If a slot name is passed ensure all cmdlets use it
if ([String]::IsNullOrEmpty($SlotName)) {
    $slotParameters = $null
} else {
    $slotParameters = @{ Slot = $SlotName }
}

# Get the Publishing profile from Azure
$publishProfilePath = Join-Path -Path $ENV:Temp -ChildPath 'publishprofile.xml'

Write-Verbose -Message 'Getting publishing profile for web app'
$null = Get-AzureRmWebAppSlotPublishingProfile `
    -OutputFile $publishProfilePath `
    -Format WebDeploy `
    -ResourceGroupName $ResourceGroupName `
    -Name $WebAppServiceName `
    @slotParameters

# Stop the web app slot to make sure deployment is possible.
Write-Verbose -Message 'Stopping web app.'

$null = Stop-AzureRmWebAppSlot `
    -ResourceGroupName $ResourceGroupName `
    -Name $WebAppServiceName `
    @slotParameters

# Deploy the web site
$source = "-source:contentPath=$WebAppPath"
$dest = "-dest:contentPath=d:\home\site\wwwroot\,publishSettings=$publishProfilePath"

Write-Verbose -Message 'Publising web app content.'
& $MSDeployPath @('-verb:sync', $source, $dest)

# Start the web app back up
Write-Verbose -Message 'Starting web app.'

$null = Start-AzureRmWebAppSlot `
    -ResourceGroupName $ResourceGroupName `
    -Name $WebAppServiceName `
    @slotParameters

Write-Verbose -Message 'Waiting for web app to start up...'

$webappSlot = Get-AzureRmWebAppSlot `
    -ResourceGroupName $ResourceGroupName `
    -Name $WebAppServiceName `
    @slotParameters

# Wait for the site to report that it has started (optional)
while ($webappSlot.state -ne 'Running')
{
    Start-Sleep -Seconds 1

    Write-Verbose -Message 'Waiting for web app to start up...'
    $webappSlot = Get-AzureRmWebAppSlot `
        -ResourceGroupName $ResourceGroupName `
        -Name $WebAppServiceName `
        @slotParameters
}

Write-Verbose -Message 'Web app deployment complete.'
```

Just save this file as **Publish-AzureRMWebappProject.ps1** and you're ready to start publishing (almost).

Before you can use this function you'll need to get a few things sorted:

1. Create a [Service Principal with a password](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authenticate-service-principal#create-service-principal-with-password) to use to deploy the web app using the instructions on [this page](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authenticate-service-principal#create-service-principal-with-password).
1. Make sure you have got the latest version of the Azure PowerShell Modules installed (I used v4.0.0). See [this page](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-4.1.0) for instructions.
1. Make sure you've got MSDeploy.exe installed on your computer - see [this page](https://www.iis.net/downloads/microsoft/web-deploy) for instructions. _You can pass the **path** to MSDeploy.exe into the Publish-AzureRMWebappProject.ps1 using the **MSDeployPath** parameter._
1. Gather the following things (there are many ways of doing that - but I'll leave it up to you to figure out what works for you):
    1. the **Subscription Id** of the subscription you'll be deploying to.
    1. the **Tenant Id** of the Azure Active Directory containing your Service Principal.
    1. the **Application Id** that was displayed to you when you created the **Service Principal**.
    1. the **Password** you assigned when you created the **Service Principal**.

Once you have got all this information you can call the script above like this:

```powershell
$SubscriptionId = '3a54931f-5351-4ec4-9cf8-518e03257eff' # Not real
$TenantId = 'eef4615a-8a57-4519-99ea-e2a8bad20f82' # Not real
$Password = 'MyP@ssword99' # Not real
$Username = 'a3716a34-ae63-4ab8-8fb7-1e5f15ec3975' # Not real
$passwordSecure = ConvertTo-SecureString -String $Password -AsPlainText -Force
$Credential = New-Object -TypeName PSCredential ($Username, $passwordSecure)

.\Publish-AzureRMWebappProject `
    -Credential $Credential `
    -SubscriptionId $SubscriptionId `
    -TenantId $TenantId `
    -WebAppPath 'C:\Users\Dan\Source\MyAwesomeWebApp\debug\netcoreapp1.1\publish' `
    -ResourceGroupName 'MyAwesomeWebApp' `
    -WebAppServiceName 'WebApp' `
    -SlotName 'offline' `
    -Verbose
```

> [!NOTE]
> You'll need to make sure to replace the variables $SubscriptionId, $TenantId, $Password and $Username with the values for **your Azure Subscription**, **Tenancy** and **Service Principal**.

When everything is done correctly this is what happens when you run it (with -Verbose enabled):

![ss_webappdeploy_publishazurermwebappproject](/assets/images/blog/ss_webappdeploy_publishazurermwebappproject.png)

> [!NOTE]
> In the case above I was installing to a deployment staging slot called **offline**, so the new version of my website wouldn't have been visible in my **production** slot until I called the [Swap-AzureRmWebAppSlot](https://docs.microsoft.com/en-us/powershell/module/azurerm.websites/switch-azurermwebappslot?view=azurermps-4.1.0) cmdlet to swap the **offline** slot with my **production** slot.

All in all, this is fairly robust and allows our **development teams** and our **automation** and **continuous delivery pipeline** to all use the exact same deployment code which reduces deployment failures.

If you're interested in more details about the code/process, please feel free to ask questions.

Thanks for reading.
