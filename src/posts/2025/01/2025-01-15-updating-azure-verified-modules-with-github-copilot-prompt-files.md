---
title: "Keep your Azure Bicep up-to-date with GitHub Copilot Prompt Files"
date: 2025-01-15
description: "Learn how to use GitHub Copilot's experimental Prompt Files feature to automate updating Azure Verified Modules in your Bicep infrastructure as code files."
tags: 
  - "azure"
  - "github-copilot"
  - "avm"
  - "agents"
image: "/assets/banners/banner-2025-01-15-updating-azure-verified-modules-with-github-copilot-prompt-files.png"
---

Nobody likes doing janitorial work, but keeping your Infrastructure as Code (IaC) up-to-date is one of those critical maintenance tasks that often gets pushed to the bottom of your to-do list. Today, I want to show you how to use GitHub Copilot's experimental Prompt Files feature to automate one of the most tedious but important maintenance tasks: updating your Azure Verified Modules (AVM) in Bicep to their latest versions.

## Why Keep Your Infrastructure as Code Up-to-Date?

Before we dive into the solution, let's talk about why this matters. When you're building cloud solutions, your Infrastructure as Code isn't just configuration—it's the foundation of your entire system. Keeping it current means:

- **Security patches**: New versions often include critical security fixes
- **New features**: You get access to the latest Azure capabilities and improvements
- **Bug fixes**: Issues you might not even know exist get resolved
- **Performance improvements**: Better resource allocation and optimization
- **Compliance**: Meeting organizational requirements for using current versions

The problem? Manually checking and updating dozens or hundreds of module references across multiple Bicep files is time-consuming and error-prone. So we often don't do it as frequently as we should.

## What are Azure Verified Modules?

If you're not familiar with [Azure Verified Modules (AVM)](https://aka.ms/avm), they're Microsoft's curated collection of Infrastructure as Code modules that follow consistent patterns and best practices. These modules are:

- **Thoroughly tested** by Microsoft and the community
- **Regularly updated** with new features and security patches
- **Consistent** in their parameter naming and structure
- **Well-documented** with clear examples and guidance

Using AVM modules in your Bicep templates means you're building on a solid, well-maintained foundation. But like any dependency, you need to keep them current to get the full benefit.

## The Manual Update Challenge

Let's be honest—manually updating AVM references is tedious. Here's what the process typically looks like:

1. Open each Bicep file that uses AVM modules
2. Identify which modules are being used and their current versions
3. Go to the Microsoft Container Registry to find the latest version for each module
4. Update the module reference in your Bicep file
5. Check the module documentation to see if any parameters have changed
6. Update your parameter usage if needed
7. Test everything to make sure it still works

Multiply this by the number of Bicep files in your project, and it quickly becomes a significant time investment. This is exactly the kind of repetitive, rule-based task that AI can help us automate.

## Enter GitHub Copilot Agent Mode and Prompt Files

GitHub Copilot's Agent mode allows you to create custom prompts that can perform complex, multi-step tasks. The experimental [Prompt Files feature](https://code.visualstudio.com/docs/copilot/copilot-customization#_prompt-files-experimental) takes this a step further by letting you create reusable, parameterized prompts that you can apply across different files and projects.

Think of Prompt Files as templates for AI tasks. You define the steps, the tools the agent can use, and the parameters it needs, then you can invoke that prompt on any file or context where it makes sense.

## The AVM Update Prompt File

Here's the Prompt File I've created for updating Azure Verified Modules. This file should be saved with a `.copilotprompt` extension in your project:

```markdown
---
mode: 'agent'
description: 'Update the Azure Verified Module to the latest version for the Bicep infrastructure as code file.'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'githubRepo', 'openSimpleBrowser', 'problems', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
---

Your goal is to update the Bicep file `${file}` to use the latest available versions of Azure Verified Modules (AVM).
You will need to perform these steps:

1. Get a list of all the Azure Verified Modules that are used in the specific `${file}` Bicep file and get the module names and their current versions.
2. Step through each module referenced in the Bicep file and find the latest version of the module. Do this by fetching the tags list from Microsoft Container Registry. E.g. for 'br/public:avm/res/compute/virtual-machine' fetch [https://mcr.microsoft.com/v2/bicep/avm/res/compute/virtual-machine/tags/list](https://mcr.microsoft.com/v2/bicep/avm/res/compute/virtual-machine/tags/list) and find the latest version tag.
3. If there is a newer version of the module available based on the tags list from Microsoft Container Registry than is currently used in the Bicep, fetch the documentation for the module from the Azure Verified Modules index page. E.g., for `br/public:avm/res/compute/virtual-machine` the docs are [https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/compute/virtual-machine](https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/compute/virtual-machine)
4. Update the Azure Verified Module in the Bicep file to use the latest available version and apply any relevant changes to the module parameters based on the documentation.
5. If there are no changes to the module, leave it as is and make no other changes.

## IMPORTANT

- Ensure that the Bicep file is valid after the changes and that it adheres to the latest standards for Azure Verified Modules and there are no linting errors.
- Do not try to find the latest version of an Azure Verified Module by any other mechanism than fetching the tags list from Microsoft Container Registry.
- The tags list returned from Microsoft Container Registry is an array of JSON strings, so is not in version order. You will need to parse the tags and find the latest version based on the semantic versioning scheme.
```

This prompt file gives the GitHub Copilot agent everything it needs to:

- Parse your Bicep files to find AVM module references
- Check the Microsoft Container Registry for the latest versions
- Compare current vs. latest versions using semantic versioning
- Fetch documentation to understand any parameter changes
- Update your files with the new versions and any necessary parameter adjustments

## Setting Up and Using Prompt Files

To use this prompt file, you'll need to:

### 1. Enable the Experimental Feature

First, enable Prompt Files in Visual Studio Code:

1. Open VS Code settings (`Ctrl/Cmd + ,`)
2. Search for "copilot prompt"
3. Enable the "Copilot: Enable Prompt Files" setting

### 2. Create Your Prompt File

Save the prompt content above as `update-avm-modules.copilotprompt` in your project root or a `.copilot` directory.

### 3. Run the Prompt

To use the prompt:

1. Open the Bicep file you want to update
2. Open the Command Palette (`Ctrl/Cmd + Shift + P`)
3. Type "Copilot: Run Prompt File"
4. Select your `update-avm-modules.copilotprompt` file
5. The agent will analyze your file and make the necessary updates

## The Process in Action

When you run this prompt on a Bicep file, here's what happens behind the scenes:

1. **Analysis**: The agent scans your Bicep file and identifies all AVM module references
2. **Version Check**: For each module, it queries the Microsoft Container Registry to get the latest available version
3. **Comparison**: It compares your current version with the latest using semantic versioning rules
4. **Documentation Review**: If an update is needed, it fetches the module documentation to understand any breaking changes
5. **Update**: It updates your Bicep file with the new version and adjusts parameters if necessary
6. **Validation**: It ensures the updated file is valid and follows current best practices

The entire process that might take you 30-60 minutes manually happens in just a few minutes with the AI agent.

## The Importance of Test Automation

Before you start using this kind of automated updating, make sure you have solid test automation in place. I can't stress this enough—automated infrastructure updates are only as safe as your testing strategy.

You should have:

- **Unit tests** for your Bicep modules
- **Integration tests** that deploy to a test environment
- **Validation tests** that check your deployed resources
- **Rollback procedures** in case something goes wrong

Tools like [Bicep's built-in validation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli#validate), [Azure Resource Manager Template Test Toolkit](https://github.com/Azure/arm-ttk), and [Pester tests for infrastructure](https://pester.dev/) can help you build a comprehensive testing strategy.

## Beyond AVM Updates: The Bigger Picture

What excites me most about this approach isn't just the AVM updates—it's the pattern. You can create Prompt Files for any repetitive, rule-based task that involves:

- **Code analysis and transformation**
- **Documentation updates**
- **Security vulnerability scanning and fixing**
- **Code style standardization**
- **Dependency management**

The key is identifying tasks that are:

1. **Well-defined**: Clear steps that you can articulate
2. **Repetitive**: You do them regularly across multiple files or projects
3. **Rule-based**: They follow consistent patterns and logic
4. **Time-consuming**: They take significant effort to do manually

## Wrapping Up

GitHub Copilot's Prompt Files feature represents a significant step forward in how we can automate routine maintenance tasks. By creating reusable prompts for complex processes like updating Azure Verified Modules, we can:

- Save significant time on routine maintenance
- Reduce human error in repetitive tasks
- Ensure consistency across our codebase
- Keep our infrastructure current with minimal effort

The future of development tooling is moving toward AI agents that can handle increasingly complex tasks. Prompt Files give us a way to encode our domain knowledge and processes into reusable AI workflows, making our entire team more productive.

Have you tried using GitHub Copilot Agent mode for infrastructure maintenance? I'd love to hear about your experiences and the creative ways you're using Prompt Files in your projects.

Remember: the goal isn't to replace human judgment, but to automate the tedious parts so we can focus on the creative and strategic aspects of building great cloud solutions.
