---
title: "Persistent Storage in Azure Container Instances"
date: 2017-08-05
description: "A PowerShell script to create an Azure Container Instance with persistent storage using Azure File Shares."
tags:
  - "azure"
  - "gocd"
  - "azure-container-instance"
image: "/assets/images/screenshots/ss_aci_logo.png"
isArchived: true
---

_**Update 2018-04-26:** At some point Microsoft made a change to the requirements of the ARM template creating the Azure Container Instance. It now requires the Ports to be specified within the container as well as we the container group. I have **improved the ARM template** to meet the current requirements._

_**Update 2017-08-06:** I have **improved the script** so that it is idempotent (can be run more than once and will only create anything that is missing). The Azure Container Instance resource group can be deleted once you've finished with the container and then recreated again with this same script when you next need it. The storage will be preserved in the separate storage account resource group. The script can now be run with the **\-verbose** parameter and will produce much better progress information._

[Azure Container Instances](https://azure.microsoft.com/en-us/services/container-instances/) **(ACI)** is a new resource type in **Azure** that allows you to quickly and easily create containers without the complexity or overhead of [Azure Service Fabric](https://azure.microsoft.com/en-us/services/service-fabric/), [Azure Container Services](https://azure.microsoft.com/en-us/services/container-service/) or provisioning a Windows Server 2016 VM.

It allows you to _quickly_ create containers that are _billed by the second_ from container images stored in **Docker Hub** or your own [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/) **(ACR)**. Even though this feature is still in preview, it is [very easy to get up and running](https://docs.microsoft.com/en-us/azure/container-instances/) with it.

But this post _isn't_ about creating basic container instances, it is about running container instances where some of the **storage must persist**. This is a basic function of a container host, but if you don't have access to the host storage then things get more difficult. That said, **Azure Container Instances** do support _mounting Azure File Shares_ into the container as volumes. It is fairly easy to do, but requires quite a number of steps.

There is some provided [documentation for persisting storage in a container instance](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-mounting-azure-files-volume), but it is quite a manual process and the **example ARM templates are currently broken**: there are some typos and missing properties. So this post aims to make the whole thing a lot _simpler_ and _automatable_.

So in this post, I'm going to **share a PowerShell function** and Azure Resource Manager (ARM) template that will allow you to easily provision an **Azure Container Instance** with an **Azure File Share** mounted. The process defaults to installing a [GoCD Server](https://www.gocd.org/) container (version 17.8.0 if you're interested), but you could use it to **install any other Linux Container that needs persistent storage**. The script is parameterized so other containers and mount points can be specified - e.g. it should be fairly easy to use this for other servers like [Sonatype Nexus](https://www.sonatype.com/download-oss-sonatype) or [Jenkins Server](https://jenkins.io/).

Update 2017-08-06: I documented my findings trying out these other servers in [my following blog post](https://dscottraynsford.wordpress.com/2017/08/06/sonatype-nexus-containers-with-persistent-storage-in-azure-container-instances/).

## Requirements

To perform this process you will need the following:

- PowerShell 5.0+ (PowerShell 4.0 may work, but I haven't tested it).
- The [Azure PowerShell module installed](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-4.2.0).
- Created an Application Service Principal - see below.

### Azure Service Principal

Before you start this process you will need to have created an Application Service Principal in Azure that will be used to perform the deployment. Follow [the instructions on this page](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal#create-an-azure-active-directory-application) to create an application and then get the Service Principal from it.

You will need to record these values as they will be provided to the script later on:

- **Application Id**
- **Application Key**
- **Tenant Id**
- **Subscription Name**

## The Process

The process will perform the following tasks:

1. The **Service Principal** is used to login to Azure to perform the deployment.
1. An **Azure Resource Group** is created to contain a **Azure Storage Account** and **Azure Key Vault**.
1. An **Azure Storage Account** is created and an **Azure File Share** is created in it.
1. An **Azure Key Vault** is created to store the **Storage Account Key** and make it accessible to the **Azure Container Instance**.
1. The **Service Principal** is granted permission to the **Azure Key Vault** to read and write secrets.
1. The key to the **Storage Account Key** is added as a secret to the **Azure Key Vault**.
1. The parameters are set in an ARM Template parameter file.
1. An **Azure Resource Group** is created to contain the **Azure Container Instance**.

## The Script

This is the content of the script:

```powershell
[CmdletBinding()]
param
(
    [Parameter(Mandatory = $True)]
    [String] $ServicePrincipalUsername,

    [Parameter(Mandatory = $True)]
    [SecureString] $ServicePrincipalPassword,

    [Parameter(Mandatory = $True)]
    [String] $TenancyId,

    [Parameter(Mandatory = $True)]
    [String] $SubscriptionName,

    [String] $AppCode = 'gocd', # just a short code to identify this app

    [String] $UniqueCode = 'dsr', # a short unique code to ensure that resources are unique

    [String] $ContainerImage = 'gocd/gocd-server:v17.8.0', # the container image name and version to deploy

    [String] $ContainerPort = '8153', # The port to expose on the container

    [String] $VolumeName = 'gocd', # The name of the volume to mount

    [String] $MountPoint = '/godata/', # The mount point

    [Int] $CPU = 1, # The number of CPUs to assign to the instance

    [String] $MemoryInGB = '1.5' # The amount of memory to assign to the instance
)

$supportRGName = '{0}{1}rg' -f $UniqueCode, $AppCode
$storageAccountName = '{0}{1}storage' -f $UniqueCode, $AppCode
$storageShareName = '{0}{1}share' -f $UniqueCode, $AppCode
$keyvaultName = '{0}{1}akv' -f $UniqueCode, $AppCode
$keyvaultStorageSecretName = '{0}key' -f $storageAccountName
$aciRGName = '{0}{1}acirg' -f $UniqueCode, $AppCode
$aciName = '{0}{1}aci' -f $UniqueCode, $AppCode
$location = 'eastus'

# Login to Azure using Service Principal
Write-Verbose -Message ('Connecting to Azure Subscription "{0}" using Service Principal account "{1}"' -f $SubscriptionName, $ServicePrincipalUsername)
$servicePrincipalCredential = New-Object -TypeName 'System.Management.Automation.PSCredential' -ArgumentList ($ServicePrincipalUsername, $ServicePrincipalPassword)
$null = Add-AzureRmAccount -TenantId $TenancyId -SubscriptionName $SubscriptionName -ServicePrincipal -Credential $servicePrincipalCredential

# Create resource group for Key Vault and Storage Account
if (-not (Get-AzureRmResourceGroup -Name $supportRGName -ErrorAction SilentlyContinue))
{
    Write-Verbose -Message ('Creating Resource Group "{0}" for Storage Account and Key Vault' -f $supportRGName)
    $null = New-AzureRmResourceGroup -Name $supportRGName -Location $location
}

# Create Key Vault
if (-not (Get-AzureRmKeyVault -ResourceGroupName $supportRGName -VaultName $keyVaultName -ErrorAction SilentlyContinue))
{
    Write-Verbose -Message ('Creating Key Vault "{0}" in Resource Group "{1}"' -f $keyVaultName, $supportRGName)
    $null = New-AzureRmKeyVault -ResourceGroupName $supportRGName -VaultName $keyVaultName -Location $location -EnabledForTemplateDeployment -EnabledForDeployment
}
Write-Verbose -Message ('Setting Key Vault "{0}" access policy to enable Service Principal "{1}" to Get,List and Set secrets' -f $keyVaultName, $ServicePrincipalUsername)
$null = Set-AzureRmKeyVaultAccessPolicy -ResourceGroupName $supportRGName -VaultName $keyVaultName -ServicePrincipalName $ServicePrincipalUsername -PermissionsToSecrets get, list, set
Write-Verbose -Message ('Getting Key Vault "{0}" Id' -f $keyVaultName)
$keyvaultNameId = (Get-AzureRmKeyVault -Name $keyVaultName).ResourceId

# Create Storage Account
if (-not (Get-AzureRmStorageAccount -ResourceGroupName $supportRGName -Name $storageAccountName -ErrorAction SilentlyContinue))
{
    Write-Verbose -Message ('Creating Storage Account "{0}" in Resource Group "{1}"' -f $storageAccountName, $supportRGName)
    $null = New-AzureRmStorageAccount -ResourceGroupName $supportRGName -Name $storageAccountName -SkuName Standard_LRS -Location $location
}
Write-Verbose -Message ('Getting Storage Account "{0}" key' -f $storageAccountName)
$storageAccountKey = Get-AzureRmStorageAccountKey -ResourceGroupName $supportRGName -Name $storageAccountName
$storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName={0};AccountKey={1};' -f $storageAccountName, $storageAccountKey[0].value
$storageContext = New-AzureStorageContext -ConnectionString $storageConnectionString
if (-not (Get-AzureStorageShare -Name $storageShareName -Context $storageContext -ErrorAction SilentlyContinue))
{
    Write-Verbose -Message ('Creating Azure Storage Share "{0}" in Storage Account {1}' -f $storageShareName, $storageAccountName)
    $null = New-AzureStorageShare -Name $storageShareName -Context $storageContext
}

# Add the Storage Key to the Key Vault
Write-Verbose -Message ('Adding Storage Account "{0}" key to Key Vault "{1}"' -f $storageAccountName, $keyvaultName)
$null = Set-AzureKeyVaultSecret -VaultName $keyvaultName -Name $keyvaultStorageSecretName -SecretValue (ConvertTo-SecureString -String $storageAccountKey[0].value -AsPlainText -Force)

# Create Azure Container Intstance
if (-not (Get-AzureRmResourceGroup -Name $aciRGName -ErrorAction SilentlyContinue))
{
    Write-Verbose -Message ('Creating Resource Group "{0}" for Container Group' -f $aciRGName)
    $null = New-AzureRmResourceGroup -Name $aciRGName -Location $location
}

# Generate the azure deployment parameters
$azureDeployParametersPath = (Join-Path -Path $PSScriptRoot -ChildPath 'aci-azuredeploy.parameters.json')
$azureDeployPath = (Join-Path -Path $PSScriptRoot -ChildPath 'aci-azuredeploy.json')

$azureDeployParameters = ConvertFrom-Json -InputObject (Get-Content -Path $azureDeployParametersPath -Raw)
$azureDeployParameters.parameters.containername.value = $aciName
$azureDeployParameters.parameters.containerimage.value = $ContainerImage
$azureDeployParameters.parameters.cpu.value = $CPU
$azureDeployParameters.parameters.memoryingb.value = $MemoryInGB
$azureDeployParameters.parameters.containerport.value = $ContainerPort
$azureDeployParameters.parameters.sharename.value = $storageShareName
$azureDeployParameters.parameters.storageaccountname.value = $storageAccountName
$azureDeployParameters.parameters.storageaccountkey.reference.keyVault.id = $keyvaultNameId
$azureDeployParameters.parameters.storageaccountkey.reference.secretName = $keyvaultStorageSecretName
$azureDeployParameters.parameters.volumename.value = $VolumeName
$azureDeployParameters.parameters.mountpoint.value = $MountPoint
Set-Content -Path $azureDeployParametersPath -Value (ConvertTo-Json -InputObject $azureDeployParameters -Depth 6) -Force

$deploymentName = ((Get-ChildItem -Path $azureDeployPath).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm'))
Write-Verbose -Message ('Deploying Container Group "{0}" to Resource Group "{1}"' -f $aciName, $aciRGName)
$null = New-AzureRmResourceGroupDeployment -Name $deploymentName `
    -ResourceGroupName $aciRGName `
    -TemplateFile $azureDeployPath `
    -TemplateParameterFile $azureDeployParametersPath `
    -Force `
    -ErrorVariable errorMessages

# Get the container info and display it
$subscriptionId = (Get-AzureRmSubscription -SubscriptionName $SubscriptionName).Id
$resourceId = ('/subscriptions/{0}/resourceGroups/{1}/providers/Microsoft.ContainerInstance/containerGroups/{2}' -f $subscriptionId, $aciRGName, $aciName)
$containerState = 'Unknown'
while ($containerState -ne 'Running')
{
    Write-Verbose -Message 'Waiting for container to enter running state'
    $containerResource = Get-AzureRmResource -ResourceId $resourceId
    $containerState = $containerResource.Properties.state
    Start-Sleep -Seconds 2
}

Write-Verbose -Message ('Container is running on http://{0}:{1}' -f $containerResource.Properties.ipAddress.ip, $containerResource.Properties.ipAddress.ports.port)
```

The script requires a four parameters to be provided:

- **ServicePrincipalUsername** - the **Application Id** obtained when creating the **Service Principal**.
- **ServicePrincipalPassword** - the **Application Key** we got (or set) when creating the **Service Principal**.
- **TenancyId** - The **Tenancy Id** we got during the **Service Principal** creation process.
- **SubscriptionName** - the name of the subscription to install the ACI and other resources into.

There are also some other optional parameters that can be provided that allow the container image that is used, the _TCP port the container_ listens on and _mount point_ for the **Auzre File Share**. If you don't provide these parameters will be used which will create a GoCD Server.

- **AppCode** - A short code to identify this application. It gets added to the resource names and resource group names. Defaults to **'gocd'**.
- **UniqueCode** - this string is just used to ensure that globally unique names for the resources can be created. Defaults to '**zzz**'.
- **ContainerImage** - this is the name and version of the container image to be deployed to the ACI. Defaults to '**gocd/gocd-server:v17.8.0**'.
- **CPU** \- The number of cores to assign to the container instance. Defaults to **1**.
- **MemoryInGB** \- The amount of memory (in GB) to assign to the container instance. Defaults to **1.5**.
- **ContainerPort** - The port that the container listens on. Go CD Server defaults to 8153.
- **VolumeName** - this is a volume name that is used to represent the volume in the ARM template. It can really be set to anything. Defaults to '**gocd**'.
- **MountPoint** - this is the folder in the Container that the **Azure File Share** is mounted to. Defaults to '**/godata/**'.

## ARM Template Files

There are two other files that are required for this process:

1. **ARM template** - the ARM template file that will be used to install the ACI.
1. **ARM template parameters** - this file will be used to pass in the settings to the ARM Template.

## ARM Template

This file is called **aci-azuredeploy.json** and should be downloaded to the same folder as the script above.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "containername": {
      "type": "string"
    },
    "containerimage": {
      "type": "string"
    },
    "cpu": {
      "type": "int"
    },
    "memoryingb": {
      "type": "string"
    },
    "containerport": {
      "type": "string"
    },
    "sharename": {
      "type": "string"
    },
    "storageaccountname": {
      "type": "string"
    },
    "storageaccountkey": {
      "type": "securestring"
    },
    "volumename": {
      "type": "string"
    },
    "mountpoint": {
      "type": "string"
    }
  },
  "resources": [{
    "name": "[parameters('containername')]",
    "type": "Microsoft.ContainerInstance/containerGroups",
    "apiVersion": "2018-04-01",
    "location": "[resourceGroup().location]",
    "properties": {
      "containers": [{
        "name": "[parameters('containername')]",
        "properties": {
          "image": "[parameters('containerimage')]",
          "ports": [{
            "port": "[parameters('containerport')]"
          }],
          "resources": {
            "requests": {
              "cpu": "[parameters('cpu')]",
              "memoryInGb": "[parameters('memoryingb')]"
            }
          },
          "volumeMounts": [{
            "name": "[parameters('volumename')]",
            "mountPath": "[parameters('mountpoint')]"
          }]
        }
      }],
      "osType": "Linux",
      "ipAddress": {
        "type": "Public",
        "ports": [{
          "protocol": "tcp",
          "port": "[parameters('containerport')]"
        }]
      },
      "volumes": [{
        "name": "[parameters('volumename')]",
        "azureFile": {
          "shareName": "[parameters('sharename')]",
          "storageAccountName": "[parameters('storageaccountname')]",
          "storageAccountKey": "[parameters('storageaccountkey')]"
        }
      }]
    }
  }]
}
```

### ARM Template Parameters

This file is called **aci-azuredeploy.parameters.json** and should be downloaded to the same folder as the script above.

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "containername": {
            "value": ""
        },
        "containerimage": {
            "value": ""
        },
        "cpu": {
            "value": 1
        },
        "memoryingb": {
            "value": "1.5"
        },
        "containerport": {
            "value": ""
        },
        "sharename": {
            "value": ""
        },
        "storageaccountname": {
            "value": ""
        },
        "storageaccountkey": {
            "reference": {
                "keyVault": {
                    "id": ""
                },
                "secretName": ""
            }
        },
        "volumename": {
            "value": ""
        },
        "mountpoint": {
            "value": ""
        }
    }
}
```

## Steps

To use the script the following steps need to be followed:

1. Download the three files above (the script and the two ARM template files) and put them into the same folder:![ss_aci_filesrequires](/assets/images/screenshots/ss_aci_filesrequires1.png)
1. Open a **PowerShell** window.
1. Change directory to the folder you place the files into by executing:
1. CD `<folder location>`
1. Execute the script like this (passing in the variables):

    ```powershell
    .\Install-AzureContainerInstancePersistStorage.ps1 `
        -ServicePrincipalUsername 'ce6fca5e-a22d-44b2-a75a-f3b20fcd1b16' `
        -ServicePrincipalPassword (ConvertTo-SecureString -String 'JUJfenwe89hwNNF723ibw2YBybf238ybflA=' -AsPlainText -Force) `
        -TenancyId '8871b1ba-7d3d-45f3-8ee0-bb60c0e4733e' `
        -SubscriptionName 'Visual Studio Enterprise' `
        -AppCode 'gocd' `
        -UniqueCode 'mine' `
        -ContainerImage 'gocd/gocd-server:v17.8.0' `
        -ContainerPort '8153' `
        -VolumeName 'gocd' `
        -MountPoint '/godata/' `
        -Verbose
    ```

    ![ss_aci_executingscript](/assets/images/screenshots/ss_aci_executingscript.png)
1. The process will then begin and make take a few minutes to complete:![ss_aci_creategocd](/assets/images/screenshots/ss_aci_creategocd.gif)**Note:** I've changed the keys to this service principal and deleted this storage account, so I using these Service Principal or Storage Account keys won't work!
1. Once completed you will be able to log in to the Azure Portal and find the newly created Resource Groups:![ss_aci_resourcegroup](/assets/images/screenshots/ss_aci_resourcegroup.png)
1. Open the resource group **\*gocdacirg** and then select the container group **\*gocdaci****:**![ss_aci_getcontainerip](/assets/images/screenshots/ss_aci_getcontainerip.png)
1. The IP Address of the container is displayed. You can copy this and paste it into a browser window along with the port the container exposed. In the case of Go CD it is 8153:
    ![ss_aci_runninggocdserver](/assets/images/screenshots/ss_aci_runninggocdserver.png)
1. The process is now completed.

The Azure Container Instance can now be **deleted** and **recreated** at will, to reduce cost or simply upgrade to a new version. The **Azure File Share** will persist the data stored by the container into the mounted volume:

![ss_aci_storageexplorerfileshare](/assets/images/screenshots/ss_aci_storageexplorerfileshare.png)

Hopefully this process will help you implement persisted storage containers in Azure Container Instances more easily and quickly.

Thanks for reading!
