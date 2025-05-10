---
title: "Managing Users and Permissions in Cosmos DB with PowerShell"
date: 2018-01-14
description: "Managing Users and Permissions in Cosmos DB with PowerShell"
tags:
  - "azure"
  - "documentdb"
  - "powershell"
  - "cosmosdb"
image: "/assets/images/blog/ss_cdb_cosmosdblogo.png"
---

If you're just getting started with [Cosmos DB](https://docs.microsoft.com/en-us/azure/cosmos-db/), you might not have come across [users and permissions in a Cosmos DB database](https://docs.microsoft.com/en-us/azure/cosmos-db/database-security). However, there are certain use cases where managing **users** and **permissions** are necessary. For example, if you're wanting to be able to limit access to a particular resource (e.g. a collection, document, stored procedure) by user.

The most common usage scenario for users and permissions is if you're implementing a [Resource Token Broker](https://docs.microsoft.com/en-us/azure/cosmos-db/secure-access-to-data) type pattern, allowing client applications to directly access the Cosmos DB database.

> [!NOTE]
> The Cosmos DB implementation of **users** and **permissions** only provides **authorization** - it does not provide **authentication**. It would be up to your own implementation to manage the **authentication**. In most cases you'd use something like **Azure Active Directory** to provide an **authentication** layer.

But if you go hunting through the Azure Management Portal **Cosmos DB data explorer** (or [Azure Storage Explorer](https://azure.microsoft.com/en-us/features/storage-explorer/)) you won't find any way to configure or even view **users** and **permissions**.

![ss_cdb_cosmosdbdataexplorer](/assets/images/blog/ss_cdb_cosmosdbdataexplorer.png)

To manage **users** and **permissions** you need to use the [Cosmos DB API](https://docs.microsoft.com/en-us/rest/api/documentdb/users) directly or one of the [SDKs](https://docs.microsoft.com/en-us/azure/cosmos-db/sql-api-sdk-dotnet).

But to make **Cosmos DB** **users** and **permissions** easier to manage from PowerShell, I created the [Cosmos DB PowerShell module](https://www.powershellgallery.com/packages/CosmosDB). This is an open source project hosted on [GitHub](https://github.com/PlagueHO/CosmosDB). The Cosmos DB module allows you to manage [much more](https://github.com/PlagueHO/CosmosDB#introduction) than just **users** and **permissions**, but for this post I just wanted to start with these.

## Requirements

This module works on **PowerShell 5.x** and **PowerShell Core 6.0.0**. It probably works on **PowerShell 3** and **4**, but I don't have any more machines running this version to test on.

The Cosmos DB module does not have any dependencies, **except** if you call the **New-CosmosDbContext** function with the **ResourceGroup** parameter specified as this will use the [AzureRM PowerShell modules](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-5.1.1) to read the **Master Key** for the connection directly from your **Cosmos DB** account. So I'd recommend [installing the Azure PowerShell modules](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps) or if you're using PowerShell 6.0, install the [AzureRM.NetCore modules](https://www.powershellgallery.com/packages/AzureRM.Netcore/0.9.1).

## Installing the Module

The best way to install the [Cosmos DB PowerShell module](https://www.powershellgallery.com/packages/CosmosDB) is from the [PowerShell Gallery](https://www.powershellgallery.com). To install it for only your user account execute this PowerShell command:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\src\posts\2018\01\2018-01-14-managing-users-permissions-in-cosmosdb-with-powershell.md
Install-Module -Name CosmosDB -Scope CurrentUser
```

![ss_cdb_cosmosdbinstallmodulecurrentuser](/assets/images/blog/ss_cdb_cosmosdbinstallmodulecurrentuser.png)

Or to install it for all users on the machine (requires administrator permissions):

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\src\posts\2018\01\2018-01-14-managing-users-permissions-in-cosmosdb-with-powershell.md
Install-Module -Name CosmosDB
```

![ss_cdb_cosmosdbinstallmoduleallusers](/assets/images/blog/ss_cdb_cosmosdbinstallmoduleallusers.png)

## Context Variable

> Update 2018-03-06
>
> As of Cosmos DB module v2.0.1, the **connection** parameter has been renamed to **context** and the **New-CosmosDbConnection** function has been renamed **New-CosmosDbContext**. This was to be more inline with naming adopted by the Azure PowerShell project. The old **connection** parameters and **New-CosmosDbConnection** function is still available as an alias, so older scripts won't break. But these should be changed to use the new naming if possible as I plan to deprecate the **connection** version at some point in the future.
>
> This post was updated to specify the new naming, but screenshots still show the **Connection** aliases.

Before you get down to the process of working with Cosmos DB resources, you'll need to create a **context** variable containing the information required to connect. This requires the following information:

1. The Cosmos DB Account name
1. The Cosmos DB Database name
1. The Master Key for the account (you can have the Cosmos DB PowerShell module get this directly from your Azure account if you wish).

To create the **connection variable** we just use the **New-CosmosDbContext**:

```powershell
$account = 'MyCosmosDBAccount'
$database = 'MyDatabase'
$key = ConvertTo-SecureString -String 'this is your master key, get it from the Azure portal' -AsPlainText -Force
$context = New-CosmosDbContext -Account $account -Database $database -Key $key
```

![ss_cdb_cosmosdbnewconnection](/assets/images/blog/ss_cdb_cosmosdbnewconnection.png)

If you do not wish to specify your **master key**, you can have the **New-CosmosDbContext** function pull your **master key** from the **Azure Management Portal** directly:

```powershell
Add-AzureRmAccount
$account = 'MyCosmosDBAccount'
$database = 'MyDatabase'
$resourceGroup = 'MyCosmosDBResourceGroup'
$context = New-CosmosDbContext -Account $account -Database $database -ResourceGroup $resourceGroup
```

![ss_cdb_cosmosdbnewconnectionviaportal](/assets/images/blog/ss_cdb_cosmosdbnewconnectionviaportal.png)

_Note: This requires the **AzureRM.Profile** and **AzureRM.Resources** module on **Windows PowerShell 5.x** or **AzureRM.Profile.NetCore** and **AzureRM.Resources.NetCore** on **PowerShell Core 6.0.0**._

## Managing Users

To **add a user** to the Cosmos DB Database use the **New-CosmosDbUser** function:

```powershell
New-CosmosDbUser -Context $context -Id 'daniel'
```

![ss_cdb_cosmosdbnewuser](/assets/images/blog/ss_cdb_cosmosdbnewuser.png)

To **get a list of users** in the database:

```powershell
Get-CosmosDbUser -Context $context
```

![ss_cdb_cosmosdbgetusers](/assets/images/blog/ss_cdb_cosmosdbgetusers.png)

To **get a specific** user:

```powershell
Get-CosmosDbUser -Context $context -Id 'daniel'
```

![ss_cdb_cosmosdbgetuser](/assets/images/blog/ss_cdb_cosmosdbgetuser1.png)

To **remove a user** (this will also remove all permissions assigned to the user):

```powershell
Remove-CosmosDbUser -Context $context -Id 'daniel'
```

![ss_cdb_cosmosdbremoveuser](/assets/images/blog/ss_cdb_cosmosdbremoveuser.png)

## Managing Permissions

Permissions in Cosmos DB are granted to a user for a specific resource. For example, you could grant a user access to just a single document, an entire collection or to a stored procedure.

To grant a permission you need to provide four pieces of information:

1. The **Id** of the **user** to grant the permission to.
2. An **Id** for the **permission** to create. This is just string to uniquely identify the permission.
3. The permission mode to the permission: **All** or **Read**.
4. The **Id** of the resource to grant access to. This can be generated from one of the **Get-CosmosDb\*ResourcePath** functions in the **CosmosDB PowerShell module**.

In the following example, we'll grant the user **daniel** _all_ access to the **TestCollection**:

```powershell
$userId = 'TestUserId'
$resourcePath = Get-CosmosDbCollectionResourcePath -Database 'TestDatabase' -Id 'TestCollection'
New-CosmosDbPermission -Context $context -Id 'AccessTestCollection' -UserId $userId -PermissionMode All -Resource $resourcePath
```

![ss_cdb_cosmosdbnewpermission](/assets/images/blog/ss_cdb_cosmosdbnewpermission.png)

Once a **permission** has been **granted**, you can use the **Get-CosmosDbPermission** function to retrieve the permission _and with it_ the **Resource Token** that can be used to access the resource for a limited amount of time (between 10 minutes and 5 hours).

_Note: as you have the **Master Key** already, using the **Resource Token** isn't required._

For example, to retrieve all permissions for the user with **Id** daniel and a resource token expiration of 600 seconds:

```powershell
Get-CosmosDbPermission -Context $context -UserId 'daniel' -TokenExpiry '600' | 
    Format-List *
```

![ss_cdb_cosmosdbgetpermission](/assets/images/blog/ss_cdb_cosmosdbgetpermission.png)

You can as expected delete a permission by using the **Remove-CosmosDbPermission** function:

```powershell
Remove-CosmosDbPermission -Context $context -UserId 'daniel' -Id 'AccessTestCollection'
```

![ss_cdb_cosmosdbremovepermission](/assets/images/blog/ss_cdb_cosmosdbremovepermission.png)

## Final Thoughts

So this is pretty much all there is to managing **users** and **permissions** using the **Cosmos DB PowerShell** module. This module can also be used to manage the following Cosmos DB resources:

- Attachments
- Collections
- Databases
- Documents
- Offers
- Stored procedures
- Triggers
- User Defined Functions

You can find additional documentation and examples of how to manage these resources over in the [Cosmos DB PowerShell module readme file](https://github.com/PlagueHO/CosmosDB/blob/dev/README.md) on GitHub.

Hopefully this will help you in any **Cosmos DB** automation tasks you might need to implement.
