---
title: "Keeping Azure Bicep up-to-date the easy way with GitHub Copilot Agents"
date: 2025-06-16
description: "Learn how to use GitHub Copilot Agents and the experimental Prompt Files feature to automate updating Azure Verified Modules in your Bicep infrastructure as code files."
tags: 
  - "azure"
  - "github-copilot"
  - "avm"
  - "agents"
image: "/assets/banners/banner-2025-06-16-updating-azure-verified-modules-with-github-copilot-prompt-files.png"
---

Nobody likes doing janitorial work, but keeping your Infrastructure as Code (IaC) up-to-date is one of those critical maintenance tasks that often gets pushed to the bottom of your to-do list. Today, I want to show you how to use GitHub Copilot Coding Agent and an experimental feature in Visual Studio Code, _Prompt Files_ to automate one of the most tedious but important maintenance tasks: updating your Azure Verified Modules (AVM) in Bicep to their latest versions.

> [!NOTE]
> Although I'm using the example of Bicep with Azure Verified Modules, the concepts and techniques discussed here can be applied to other IaC tools and module repositories as well. For example, updating ARM APIs, Terraform modules, or even DSC configurations can benefit from similar automation strategies.

## Why Keep Your Infrastructure as Code Up-to-Date?

Before we dive into the solution, let's talk about why this matters. When you're building cloud solutions, your Infrastructure as Code isn't just configuration—it's the foundation of your entire system. Keeping it current means:

- **Security patches**: New versions often include critical security fixes
- **New features**: You get access to the latest Azure capabilities and improvements
- **Bug fixes**: Issues you might not even know exist get resolved
- **Performance improvements**: Better resource allocation and optimization
- **Compliance**: Meeting organizational requirements for using current versions

The problem? Manually checking and updating dozens or hundreds of module references across multiple Bicep files is time-consuming and error-prone. So we often don't do it as frequently as we should. And the worst reason of all? We forget about it until something breaks, and then we're scrambling to catch up. Most engineering/platform teams are always overworked and asked to prioritize new features over maintenance tasks, which means that keeping your IaC up-to-date often falls by the wayside.

## What are Azure Verified Modules?

If you're not familiar with [Azure Verified Modules (AVM)](https://aka.ms/avm), they're Microsoft's curated collection of Infrastructure as Code modules that follow consistent patterns and best practices. They wrap up common resources together along with Microsoft Well-Architected Best practices and simplify and speed up the process of defining your IaC.

Using AVM modules in your Bicep templates (or Terraform - yes, there are Terraform versions) means you're building on a solid, well-maintained foundation. But like any dependency, you need to keep them current to get the full benefit.

For a quick primer into AVM, check out this video:

<custom-youtube slug="JbIMrJKW5N0" label="An Introduction to Azure Verified Modules (AVM)"></custom-youtube>

A Biceop module using AVM might look something like this:

```bicep
module aiSearchService 'br/public:avm/res/search/search-service:0.10.0' = {
  name: 'ai-search-service-deployment'
  scope: rg
  params: {
    name: aiSearchServiceName
    location: location
    sku: azureAiSearchSku
    // Other parameters and objects as needed
    publicNetworkAccess: azureNetworkIsolation ? 'Disabled' : 'Enabled'
    semanticSearch: 'standard'
    tags: tags
  }
}
```

In this example, the module `br/public:avm/res/search/search-service:0.10.0` is an AVM module for deploying an Azure AI Search Service. The version `0.10.0` is specified, and over time, newer versions will be released with improvements and fixes.

## The Manual Update Challenge

manually updating a Bicep file with lots of AVM resources is a real chore - but it must be done. Here's what the typical process looks like:

1. Open each Bicep file that uses AVM modules
2. Identify which modules are being used and their current versions
3. Go to the AVM index page to find the latest version of each module
4. If it's newer, update the module version in the Bicep file
5. Check the module documentation to see if any parameters have changed. An easy place for things to go wrong is if you update the module version but forget to update the parameters that may have changed in the new version
6. Update your parameter usage if needed
7. Test everything to make sure it still works - Automated tests are your best friend here, but simple linting and validation checks can help catch some issues early.

Multiply this by the number of Bicep files in your project, and it quickly becomes a significant time investment. This is exactly the kind of repetitive, rule-based task that AI can help us automate.

With the amount of work required it's lucky if this is done more thank once a year and often it is just done reactively when something breaks. This is not a good situation to be in, especially when you consider the security and compliance implications of running outdated modules.

## Enter GitHub Copilot Agent Mode and Prompt Files

GitHub Copilot's Agent mode allows you to create custom prompts that can perform complex, multi-step tasks. The experimental [Prompt Files feature](https://code.visualstudio.com/docs/copilot/copilot-customization#_prompt-files-experimental) takes this a step further by letting you create reusable, parameterized prompts that you can apply across different files and projects.

Think of Prompt Files as templates for AI tasks. You define the steps, the tools the agent can use, and the parameters it needs, then you can invoke that prompt on any file or context where it makes sense.

## The AVM Update Prompt File

Here's the Prompt File I've created for updating Azure Verified Modules. This file should be saved with a `.prompt.md` extension in the `/.github/prompts/` directory of your project. For example, you could name it `update-avm-modules.prompt.md`.

```markdown
---
mode: 'agent'
description: 'Update the Azure Verified Module to the latest version for the Bicep infrastructure as code file.'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'githubRepo', 'openSimpleBrowser', 'problems', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
---

Your goal is to update the Bicep file `${file}` to use the latest available versions of Azure Verified Modules (AVM).
You will need to perform these steps:

1. Get a list of all the Azure Verified Modules that are used in the specific `${file}` Bicep file and get the module names and their current versions.
2. Step through each module referenced in the Bicep file and find the latest version of the module. Do this by using the `fetch` tool to get the tags list from Microsoft Container Registry. E.g. for 'br/public:avm/res/compute/virtual-machine' fetch [https://mcr.microsoft.com/v2/bicep/avm/res/compute/virtual-machine/tags/list](https://mcr.microsoft.com/v2/bicep/avm/res/compute/virtual-machine/tags/list) and find the latest version tag.
3. If there is a newer version of the module available based on the tags list from Microsoft Container Registry than is currently used in the Bicep, use the `fetch` tool to get the documentation for the module from the Azure Verified Modules index page. E.g., for `br/public:avm/res/compute/virtual-machine` the docs are [https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/compute/virtual-machine](https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/compute/virtual-machine)
4. Compare the documentation for the module to the current usage in the Bicep file and identify any changes that need to be made to the module parameters or usage.
> [!IMPORTANT]
> If the changes to the module parameters are not compatible with the current usage, are new changes that would change the behaviour, are related to security or compliance, then these changes must be reviewed and approved before being applied. So, PAUSE and ask for user input before proceeding.
4. Update the Azure Verified Module version and the resource in the Bicep file to use the latest available version and apply any relevant changes based on the documentation and including guidance from the user if required, to the module parameters.
5. If there are no changes to the module, leave it as is and make no other changes.

## IMPORTANT

- Ensure that the Bicep file is valid after the changes and that it adheres to the latest standards for Azure Verified Modules and there are no linting errors.
- Do not try to find the latest version of an Azure Verified Module by any other mechanism than fetching the tags list from Microsoft Container Registry.
- The tags list returned from Microsoft Container Registry is an array of JSON strings, so is not in version order. You will need to parse the tags and find the latest version based on the semantic versioning scheme.
```

> [!NOTE]
> You can create prompt files in the `/.github/prompts` directory of your project and they'll be available to all users accessing the repository, or you can also create prompts in a `prompts` directory in your own User Data Directory for personal use. The latter is useful for prompts that are specific to your workflow or environment.

### Breaking Down the Prompt File

Let's take a closer look at the key sections of this prompt file:

#### Front Matter

- Mode: Set to `agent` to indicate that this prompt must be run in Agent mode. It can also be set to `edit` or `ask`. When you activate a prompt,chat will automatically switch to the appropriate mode - in this case `agent`.
- Description: A brief description of what the prompt does.
- Tools: An array of MCP tools that the agent can use to perform the task. Only `agent` mode supports tools, and the tools you specify here will be available to the agent when it runs the prompt.

#### On the Tools

There are several build-in tools including `fetch` for retrieving data from URLs, `editFiles` for modifying files, and others that help with retrieving information, running tasks, and interacting with the codebase. Many Visual Studio Code extensions also provide additional tools that can be used in prompts. And if you have custom tools defined in your MCP configuration, you can include those here as well.

Selecting the right tools for the task is crucial for the agent to be successful. If the prompt file needs a tool that the user doesn't have installed, the agent will inform them that it can't achieve the task that it needs to, but may try to work around it or simply stop and ask the user for guidance.

#### The Prompt Content

The prompt starts with a clear goal: to update the specified Bicep file to use the latest versions of Azure Verified Modules. It also specifies the file to act on using the `${file}` placeholder, which will be replaced with the actual file that is selected in the Copilot context.

![AVM Copilot Prompt File Update Chat Context](/assets/images/screenshots/ss_avm_copilot_prompt_file_update_chat_context.png 'AVM Copilot Prompt File Update Chat Context')

After that, it outlines a series of steps that the agent should follow to achieve this goal. Each step is clearly defined, and **explicitly** instructs the agent how to achieve each task, tools to use and documentation to reference.

> [!IMPORTANT]
> Prompt engineering is an art and a science. The more specific and clear you can be about the steps the agent should take, the better the results will be. Being explicit rather than assuming the agent will "just know" what to do is key to getting the desired outcome. Providing explicit references/links to documentation, APIs, or other resources also ensures the agent will have the information it needs to make informed decisions.

It outlines a series of steps that the agent should follow, including:

- Parse your Bicep files to find AVM module references
- Check the Microsoft Container Registry for the latest versions
- Compare current vs. latest versions using semantic versioning
- Fetch documentation to understand any parameter changes
- Update your files with the new versions and any necessary parameter adjustments

Finally, **IMPORTANT** guardrails and notes are provided at the end of the prompt to ensure the agent follows best practices and doesn't make changes that could break your infrastructure.

## Setting Up and Using Prompt Files

To use this prompt file, you'll need to:

### Pre-requisites

- **Visual Studio Code**: Make sure you have the latest version of [VS Code installed](https://aka.ms/vscode).
- **GitHub Copilot**: Ensure you have GitHub Copilot enabled in your GitHub account.
- **Visual Studio Code GitHub Copilot Extension**: Make sure you have the [GitHub Copilot extension installed](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) in Visual Studio Code.
- **Visual Studio Code GitHub Copilot Chat Extension**: Ensure you have the [GitHub Copilot Chat extension installed](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) in Visual Studio Code.

![GitHub Copilot Chat Extension](/assets/images/screenshots/ss_avm_copilot_prompt_file_update_copilot_extensions.png 'GitHub Copilot Chat Extension')

### 1. Enable the Experimental Feature

First, enable Prompt Files in Visual Studio Code:

1. Open VS Code settings (`Ctrl/Cmd + ,`)
1. Search for "prompt files"
1. Enable the "Copilot: Enable Prompt Files" setting (for either the User or Workspace settings, depending on your preference)

![Enabling Copilot Prompt Files in Visual Studio Code](/assets/images/screenshots/ss_avm_copilot_prompt_file_update_enable_prompt_files.png 'Enabling Copilot Prompt Files in Visual Studio Code')

### 2. Create Your Prompt File

In Visual Studio Code, create a new file named `update-avm-modules.prompt.md` in the `/.github/prompts/` directory of your project. If you don't have this directory, you can create it.

You can also create this by:

1. Pressing `Ctrl/Cmd + Shift + P` to open the Command Palette
1. Typing "Chat: New Prompt File"
1. Select the `prompts` or the `User Data Folder`.
1. Enter the name `update-avm-modules` (without the `.prompt.md` and paste the content from the prompt file above.
1. Save the file.

### 3. Run the Prompt

To use the prompt:

1. Open the Bicep file you want to update
1. Open the Copilot Chat sidebar by clicking the Copilot icon in the Activity Bar or pressing `Ctrl/Cmd + Shift + I`

> [!IMPORTANT]
> Before you run the prompt, make sure to enable all tools that will be used by this prompt file. You can do this by clicking on the gear icon in the Copilot Chat sidebar and ticking the tools. This will ensure that the agent has access to the `fetch`, `editFiles`, and other tools it needs to perform the update.

![Enabling tools in GitHub Copilot Chat Agent mode](/assets/images/screenshots/ss_avm_copilot_prompt_file_update_copilot_enable_tools.png 'Enabling tools in GitHub Copilot Chat Agent mode')

1. In the Copilot Chat sidebar, type `/` to invoke the prompt
1. Select your `update-avm-modules` prompt
1. Make sure to _click_ the bicep file you want to update in the Chat context so that it is used as the `${file}` parameter in the prompt.
1. Select the appropriate model to use. In my experience, `GPT-4.1`, `Gemini 2.5 Pro` and `Claude Sonnet 4` all work well for this task. But I have found reasoning models like `o4-mini` aren't as effective for this kind of task.
1. Start the agent by clicking the **Send** button or pressing `Enter`

## The Process in Action

When you run this prompt on a Bicep file, here's what happens behind the scenes:

1. **Analysis**: The agent scans your Bicep file and identifies all AVM module references
2. **Version Check**: For each module, it queries the Microsoft Container Registry to get the latest available version
3. **Comparison**: It compares your current version with the latest using semantic versioning rules
4. **Documentation Review**: If an update is needed, it fetches the module documentation to understand any breaking changes
5. **Update**: It updates your Bicep file with the new version and adjusts parameters if necessary
6. **Validation**: It ensures the updated file is valid and follows current best practices

> [!NOTE]
> The first time you run the prompt, the agent will ask you to confirm any tool calls it needs to make, such as fetching the tags list from the Microsoft Container Registry or updating the Bicep file. This is a safety measure to ensure you have control over what the agent is doing. You can approve them for the session, workspace or globally, depending on your preference.

The entire process that might take you 30-60 minutes manually happens in just a few minutes with the AI agent.

> [!IMPORTANT]
> It is possible that the agent may decide that there are significant or non-trivial changes required to a resource, in which case it will pause and ask for your feedback and direction before proceeding. This is a good thing! It means the agent is being cautious and not making potentially breaking changes without your approval.
>
> If you examine the prompt file, you'll notice that it includes instructions to ensure that this occurs, especially for changes that could affect security or compliance. This is a critical part of the process to ensure that the agent doesn't make changes that could have unintended consequences.

## The Importance of Test Automation

Before you start using this kind of automated updating, make sure you have solid test automation in place. I can't stress this enough—automated infrastructure updates are only as safe as your testing strategy.

You should have:

- **Linting** to ensure your Bicep files follow best practices and standards
- **Bicep validation** - perform Bicep What-If analysis to ensure the changes won't break your deployment
- **Integration tests** that deploy to a test environment
- **End-to-End tests** that validate the entire system works as expected after the update
- **Rollback procedures** (ideally roll forward) in case something goes wrong

Tools like [Bicep's built-in validation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-cli#validate), [Azure Resource Manager Template Test Toolkit](https://github.com/Azure/arm-ttk), and [Pester tests for infrastructure](https://pester.dev/) can help you build a comprehensive testing strategy.

For a complete video walkthrough of this process, check out my YouTube video showing the end to end process:

<custom-youtube slug="ZfYWh1qT-Us" label="Keeping your Azure Bicep up-to-date the easy way with GitHub Copilot Agents"></custom-youtube>

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

GitHub Copilot's Prompt Files feature is a great advancement that helps automate routine maintenance tasks and much more. By creating reusable prompts for complex processes or even using it to plan out one-off tasks helps us think through and document the process before we actually start coding - this in itself increases the chances of success and reduces the time spent on trial and error.

The future of development tooling is moving toward AI agents that can handle increasingly complex tasks. Prompt Files give us a way to encode our domain knowledge and processes into reusable AI workflows, making our entire team more productive.

Have you tried using GitHub Copilot Agent mode for infrastructure maintenance? I'd love to hear about your experiences and the creative ways you're using Prompt Files in your projects.

Remember: the goal isn't to replace human judgment, but to automate the tedious parts so we can focus on the creative and strategic aspects of building great cloud solutions. Less toil, more innovation!
