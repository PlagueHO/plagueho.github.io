---
title: "Generative AI Database Explorer"
description: "A tool that builds enriched semantic models of relational database schemas so users can explore tables, stored procedures, and SQL queries with generative AI."
features:
  - Azure AI
  - SQL
  - DotNet
  - Semantic Kernel
projectUrl: "https://github.com/PlagueHO/genai-database-explorer"
---

With **Generative AI Database Explorer**, you can explore database schemas and stored procedures with generative AI. It generates SQL queries, explains database objects, and answers questions based on a semantic model built from the stored schema.

Unlike tools that query a database directly, this project produces a version-controlled **semantic model** enriched with a data dictionary and generative AI. That model lets database owners review, refine, and ground the information before it is used to answer questions.

The reason that this approach of enriching a semantic model rather than just querying the database directly is:

1. Many databases are not normalized and have grown organically over time. This can make it difficult to understand the schema and stored procedures by just looking at the table & column names.
1. Data dictionaries are often not maintained or are incomplete, but can still be useful to provide additional information about the schema.
1. Additional grounding information may need to be provided by a user to ensure that the Generative AI can provide accurate information.
1. Enables greater control and the database owner can review and adjust the semantic model to ensure it is correct.
1. The semantic model can be stored in version control and used as an asset that is deployed as part of another application.
