---
title: "Generative AI Database Explorer"
description: "Deploy your onwn Foundry Virtual Table Top server into Azure using Azure Bicep and GitHub Actions. It support deploying into either Azure Web App or an Azure Container app, with the persistent data stored into Azure Files."
features:
  - Azure AI
  - SQL
  - DotNet
  - Semantic Kernel
projectUrl: "https://github.com/PlagueHO/genai-database-explorer"
---

With **Generative AI Database Explorer**, you can explore your database schema and stored procedures using Generative AI. This tool helps you understand your database schema and stored procedures by generating SQL queries based on the schema and explaining the schema and stored procedures in the database to the user based on the stored schema.

Although there are many other tools available that perform similar functions, this tool produces a **semantic model** of the database schema, combined with a data dictionary and enriched using Generative AI.

The reason that this approach of enriching a semantic model rather than just querying the database directly is:

1. Many databases are not normalized and have grown organically over time. This can make it difficult to understand the schema and stored procedures by just looking at the table & column names.
1. Data dictionaries are often not maintained or are incomplete, but can still be useful to provide additional information about the schema.
1. Additional grounding information may need to be provided by a user to ensure that the Generative AI can provide accurate information.
1. Enables greater control and the database owner can review and adjust the semantic model to ensure it is correct.
1. The semantic model can be stored in version control and used as an asset that is deployed as part of another application.
