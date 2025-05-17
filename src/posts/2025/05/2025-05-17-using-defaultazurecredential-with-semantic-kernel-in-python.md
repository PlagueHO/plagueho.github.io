---
title: "Using AzureDefaultCredential with Semantic Kernel in Python"
date: 2025-05-17
description: "In this post, I show how to use a managed identity (via AzureDefaultCredential) with Semantic Kernel in Python to authenticate to Azure OpenAI Service."
tags: 
  - "azure"
  - "python"
  - "openai"
  - "semantic-kernel"
  - "managed-identity"
---

## Background

I am working on a project for simplifying the deployment of a zero-trust [secure Azure AI Foundry environment](https://learn.microsoft.com/azure/ai-foundry/how-to/create-secure-ai-hub). As part of this project I am creating some [Python scripts to generate synthetic data](https://github.com/PlagueHO/azure-ai-foundry-jumpstart/tree/main/scripts/data-generators#readme) for use as sample data.

## Securing with Managed Identities

It is always best practice to use managed identities to authenticate to Azure services wherever possible, especially in production. I'm very familiar with using managed identities in C# and .NET, but I haven't used them much in Python version of Semantic Kernel before. So, it's time to learn how to do that.

To do this, I needed to use the `DefaultAzureCredential` class from the [Azure Identity SDK](https://learn.microsoft.com/python/api/overview/azure/identity-readme?view=azure-python) to provide a token provider to the `AzureChatCompletion` class from the [Semantic Kernel Python SDK](https://github.com/microsoft/semantic-kernel/tree/main/python#readme).

```python
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion

azure_openai_deployment = "<your_deployment_name>" # The name of your Azure OpenAI deployment
azure_openai_endpoint = "https://<your_endpoint>.openai.azure.com" # The endpoint for your Azure OpenAI Service

kernel = sk.Kernel() # Create the Semantic Kernel instance

# Create the Entra ID token provider using the DefaultAzureCredential
# https://learn.microsoft.com/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default" # The scope for Azure OpenAI Service
)

# Attach an AzureChatCompletion service to the kernel using the token provider
service = AzureChatCompletion(
    deployment_name=azure_openai_deployment,
    endpoint=azure_openai_endpoint,
    ad_token_provider=token_provider, # Pass the token provider to the service
    service_id="azure_open_ai",
)
```

That's it. It is fairly straight forward to get away from using API keys to authenticate to your Azure OpenAI Service endpoints. You can see the complete implementation in the [Azure AI Foundry jumpstart data generator](https://github.com/PlagueHO/azure-ai-foundry-jumpstart/blob/main/scripts/data-generators/synthetic_data_generator.py).

## Conclusion

This is a fairly simple example and probably super obvious to many people, but I couldn't find this clearly documented anywhere, and even my trusty GenAI tooling wasn't getting it right. I suspect this is most likely because Semantic Kernel is undergoing rapid development.

Chances are I'll run into this again in the future, so I thought it was worth documenting. But hopefully someone else finds it useful too.

## Related links

- [Semantic Kernel Python SDK](https://github.com/microsoft/semantic-kernel/tree/main/python#readme)
- [Azure Identity SDK for Python](https://learn.microsoft.com/python/api/overview/azure/identity-readme?view=azure-python)
- [DefaultAzureCredential Class in Python](https://learn.microsoft.com/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python)
- [Python scripts to generate synthetic data](https://github.com/PlagueHO/azure-ai-foundry-jumpstart/tree/main/scripts/data-generators#readme) that demonstrate this approach.
