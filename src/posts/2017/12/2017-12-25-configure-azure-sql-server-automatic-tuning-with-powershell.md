---
title: "Configure Azure SQL Server Automatic Tuning with PowerShell"
date: 2017-12-25
description: "Configure Azure SQL Server Automatic Tuning with PowerShell"
tags:
  - "azure"
  - "powershell"
  - "azure-sql-server"
image: "/assets/images/screenshots/ss_sqlserver_databaseautotuning.png"
isArchived: true
---

One thing I've found with configuring Azure services using automation (e.g. [Azure PowerShell Modules](https://docs.microsoft.com/en-us/powershell/azure/overview), [Azure Resource Manager template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates)) is that the automation features are a little bit behind the feature set. For example, the Azure PowerShell modules may not yet implement settings for new or preview features. This can be a an issue if you're strictly deploying everything via code (e.g. infrastructure as code). But if you run into a problem like this, all is not lost. So read on for an example of how to solve this issue.

## Azure REST APIs

One of the great things about Azure is that everything is configurable by making direct requests to the [Azure REST APIs](https://docs.microsoft.com/en-us/rest/api/), even if it is not available in ARM templates or Azure PowerShell.

Depending on the feature/configuration you can sometimes use the **Set-AzureRmResource** cmdlets to make calls to the REST APIs. But this cmdlet is limited to using an HTTP method of POST. So if you need to use PATCH, you'll need to find an alternate way to make the call.

So, what you need then is to use the **Invoke-RestMethod** cmdlet to create a custom call to the REST API. This is the process I needed to use to configure the [Azure SQL Server Automatic Tuning settings](https://docs.microsoft.com/en-us/azure/sql-database/sql-database-automatic-tuning-enable) and what I'll show in my script below.

## The Script

The following script can be executed in PowerShell (of course) and requires a number of parameters to be passed to it:

- **SubscriptionId** - the subscription Id of the Azure subscription that contains the Azure SQL Server.
- **ResourceGroupName** - The name of the resource group containing SQL Server or database.
- **ServerName** - The name of the Azure SQL Server to set the automatic tuning options on.
- **DatabaseName** **-** The name of the Azure SQL Database to set the automatic tuning options on. If you pass this parameter then the automatic tuning settings are applied to the Azure SQL Database, not the server.
- **Mode** - This defines where the settings for the automatic tuning are obtained from. Inherit is only valid if the **DatabaseName** is specified.
- **CreateIndex** **-** Enable automatic tuning for creating an index.
- **DropIndex** **-** Enable automatic tuning for dropping an index.
- **ForceLastGoodPlan -** Enable automatic tuning for forcing last good plan.

_**Requirements:** You need to have the [installed](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps) the **AzureRM.Profile PowerShell** module (part of the AzureRM PowerShell Modules) to use this script. The script also requires you to have logged into your Azure Subscription using **Add-AzureRmAccount** (as a user or [Service Principal](https://docs.microsoft.com/en-us/powershell/azure/create-azure-service-principal-azureps))._

```powershell
#Requires -Modules 'AzureRM.Profile' 

<#
.SYNOPSIS
Configure Azure SQL Autotuning on an Azure SQL server
or database.

.DESCRIPTION
This function will retrieve a current access token from
the Azure RM PowerShell context and use it to make a direct
request to the Azure management portal endpoint for the
SQL Server or database. It will configure the Autotuning
parameters for the server.

Requires AzureRM PowerShell Modules 5.1.1 or above*.
* May work on lower versions but untested

.PARAMETER SubscriptionId
The Azure subscription Id of the subscription containing
SQL Server or database.

.PARAMETER ResourceGroupName
The name of the resource grou containing SQL Server or
database.

.PARAMETER ServerName
The name of the Azure SQL Server to set the autotuning
options on.

.PARAMETER DatabaseName
The name of the Azure SQL Database to set the autotuning
options on.

.PARAMETER Mode
This defines where the settings for the Autotuning are
obtained from.

Inherit is only valid if the DatabaseName is specified.

.PARAMETER CreateIndex
Enable autotuning for creating an index.

.PARAMETER DropIndex
Enable autotuning for dropping an index.

.PARAMETER ForceLastGoodPlan
Enable autotuning for forcing last good plan.
#>
param (
    [Parameter(Mandatory = $true)]
    [System.String]
    $SubscriptionId,

    [Parameter(Mandatory = $true)]
    [System.String]
    $ResourceGroupName,

    [Parameter(Mandatory = $true)]
    [System.String]
    $ServerName,

    [Parameter()]
    [System.String]
    $DatabaseName,

    [Parameter()]
    [ValidateSet('Auto', 'Custom', 'Inherit')]
    [System.String]
    $Mode = 'Auto',

    [Parameter()]
    [ValidateSet('On', 'Off', 'Default')]
    [System.String]
    $CreateIndex = 'Default',

    [Parameter()]
    [ValidateSet('On', 'Off', 'Default')]
    [System.String]
    $DropIndex = 'Default',

    [Parameter()]
    [ValidateSet('On', 'Off', 'Default')]
    [System.String]
    $ForceLastGoodPlan = 'Default'
)

# Get an access token from the Auzre RM PowerShell token cache for accessing the Azure Management Portal
$context = Get-AzureRmContext
$cache = $context.TokenCache

if (-not $cache)
{
    # Use an older method of accessing the Token Cache (for old versions of AzureRM.Profile)
    $cache = [Microsoft.IdentityModel.Clients.ActiveDirectory.TokenCache]::DefaultShared
}

$cacheItems = $cache.ReadItems()
$cacheItem = $cacheItems |
    Where-Object -FilterScript { $_.TenantId -eq $context.Tenant.TenantId } |
    Select-Object -First 1

if (-not $cacheItem)
{
    Throw ('A current access token could not be found for the tenant Id {0}.' -f $context.Tenant.TenantId)
}

$accessToken = $cacheItem.AccessToken
    
# Generate the Body of the request
$body = @{
    properties = @{
        desiredState = $Mode
        options      = @{
            createIndex       = @{
                desiredState = $CreateIndex
            }
            dropIndex         = @{
                desiredState = $DropIndex
            }
            forceLastGoodPlan = @{
                desiredState = $ForceLastGoodPlan
            }
        }
    }
}

# Generate the URI to the endpoint
$uri = ('https://management.azure.com/subscriptions/{0}/resourceGroups/{1}/providers/Microsoft.Sql/servers/{2}' -f $SubscriptionId, $ResourceGroupName, $ServerName )

if ($PSBoundParameters.ContainsKey('DatabaseName'))
{
    $uri = ('{0}/databases/{1}' -f $uri, $DatabaseName)
}
else
{
    if ($Mode -eq 'Inherit')
    {
        Throw 'Inherit mode is only valid for a SQL database. Either use a different not or specify a database name.'
    }
}

$uri = ('{0}/automaticTuning/current?api-version=2017-03-01-preview' -f $uri)

$bodyText = ConvertTo-Json -InputObject $body -Depth 10

$headers = @{
    'Authorization' = ('Bearer {0}' -f $accessToken)
    'Cache-Control' = 'no-cache'
}

$invokeRestMethodParameters = @{
    Uri         = $Uri
    Method      = 'PATCH'
    Headers     = $headers
    ContentType = 'application/json'
    Body        = $bodyText
}

return Invoke-RestMethod @invokeRestMethodParameters
```

## Example Usage

To apply custom automatic tuning to an Azure SQL Server:

```powershell
.\\Set-AzureRMSqlServerAutotuning.ps1 -SubscriptionId '<Subscription Id>' -ResourceGroupName '<Resource Group name>' -ServerName '<Azure SQL server name>' -Mode Custom -CreateIndex On -DropIndex On -ForceLastGoodPlan Off
```

![ss_sqlserver_serverautotuning](/assets/images/screenshots/ss_sqlserver_serverautotuning1.png)

To apply custom automatic tuning to an Azure SQL Database:

```powershell
.\\Set-AzureRMSqlServerAutotuning.ps1 -SubscriptionId '<Subscription Id>' -ResourceGroupName '<Resource Group name>' -ServerName '<Azure SQL server name>' -DatabaseName '<Azure SQL database name>' -Mode Custom -CreateIndex On -DropIndex On -ForceLastGoodPlan Off
```

![ss_sqlserver_databaseautotuning](/assets/images/screenshots/ss_sqlserver_databaseautotuning.png)

## Conclusion

I've not yet encountered something in Azure that I can't configure via the Azure REST APIs. This is because the Azure Management Portal uses the same APIs - so if it is available in the portal then you can do it via the Azure REST APIs. The biggest challenge is determining the body, header and methods available if the APIs are not yet documented.

If the API you need is not documented then you can raise a question in the [Microsoft Azure Forums](https://azure.microsoft.com/en-in/support/forums/) or on [Stack Overflow](https://stackoverflow.com/). Failing that you can use the developer tools in your browser of choice to watch the API calls being made to the portal - I've had to resort to this many times, but documenting that process is something I'll save for another day.
