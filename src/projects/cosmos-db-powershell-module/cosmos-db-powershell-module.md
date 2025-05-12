---
title: "Cosmos DB PowerShell Module"
description: "The Cosmos DB PowerShell Module is a module for working with data in Azure Cosmos DB collections. It provides a set of cmdlets for managing and automating tasks related to Azure Cosmos DB."
projectUrl: "https://github.com/PlagueHO/CosmosDB"
---

## Cosmos DB PowerShell Module

This PowerShell module provides cmdlets for accessing Cosmos DB collections via the [Azure Cosmos DB REST API](https://learn.microsoft.com/rest/api/cosmos-db/).
It makes it easy to perform CRUD operations on Cosmos DB collections and documents and related entities while also implementing role-based access control or token-based authentication.

I created the Cosmos DB PowerShell Module before the [Az.CosmosDB](https://www.powershellgallery.com/packages/Az.CosmosDB) was available. However, they differ in functionallity in that this module provides access to data within collections using both token-based authentication and role-based access control (RBAC) while the Az.CosmosDB module is primarily focused on managing the Cosmos DB account itself. The Az.CosmosDB module does not provide access to data within collections.

I continue to maintain this project as a personal project and it is not officially supported by Microsoft.

I welcome contributions and feedback from the community. If you have any questions or suggestions, please feel free to open an issue on the [GitHub repository](https://github.com/PlagueHO/CosmosDB/issues) or reach out to me directly.
