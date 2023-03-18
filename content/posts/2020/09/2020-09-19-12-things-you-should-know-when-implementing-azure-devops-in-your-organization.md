---
title: "12 Things you Should Know when Implementing Azure DevOps in your Organization"
date: "2020-09-19"
categories:
  - "azure-devops"
coverImage: "fi_azuredevopstips.jpg"
---

[Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) is a really fantastic part of any DevOps tool chain. But when you're first starting out with it in an organization, there are a few things you should know that will make it even better... and _avoid making some doing some things you'll later regret._ These tips are most important if you're implementing it **across multiple teams** or in a **medium to large organization**. Even if you're implementing it in a small start-up, most of these tips will still help.

These tips are all based on my experience with implementing and using **Azure DevOps**, **Visual Studio Online** (VSO) and **Visual Studio Team Services** (VSTS). These are all things **I wish I'd known** **earlier** as they would have saved me time, made my life easier or kept me more secure. They are also **just my opinion**, so I encourage you to investigate further and decide what is _best for you in your situation/environment_.

This is by no means an exhaustive list either and they are in no particular order.

So, let's get into it:

## 1\. Projects: less is better.

![](/images/ss_azure_devops_12_things_1.png?w=893)

Less projects are better

Most things (work items, repositories, pipelines etc.) in Azure DevOps are organized into containers called [Projects](https://docs.microsoft.com/en-us/azure/devops/organizations/projects/about-projects). It is tempting to try to break your work into lots of small projects (e.g. one for each library, or one per team, or one per department). This results in **a lot of management overhead** trying to keep everything organized and adds little value _in most cases_ (there are exceptions). Implementing a project per team or a project per software component is _usually wrong_.

**Recommendation: The less projects you have the better.** Use **Area Paths** (covered next) to organize work in your project.

Documentation Reference: [When to add another project](https://docs.microsoft.com/en-us/azure/devops/organizations/projects/about-projects?view=azure-devops#reasons-to-add-another-project)

## 2\. Area Paths: Organize work.

![](/images/ss_azure_devops_12_things_2.png?w=784)

Organizing Area Paths

[Area Paths](https://docs.microsoft.com/en-us/azure/devops/organizations/settings/set-area-pathshttps://docs.microsoft.com/en-us/azure/devops/organizations/settings/set-area-paths) allow you to divide the **work items** and **test plans** into a hierarchy to make them easier to manage. Teams can be assigned to one or more **area paths**.

Area's are easily moved around, so they are much better suited to arranging your work by software component/product and organizational hierarchies.

**Recommendation: For your project, set up Area Paths and assign teams to them**.

Documentation Reference: [Define area paths for your project](https://docs.microsoft.com/en-us/azure/devops/organizations/settings/set-area-paths)

## 3\. Identity: Integrate with Azure AD.

![](/images/ss_azure_devops_12_things_5.png?w=339)

Connect AAD.

If you are using Azure AD as your primary identity source for your organization, then you should [connect your Azure DevOps organization to Azure AD](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad). This will allow your Azure AD identities to be used within Azure DevOps.

If you aren't using Azure AD, but have Active Directory, consider setting up [hybrid identity with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/whatis-hybrid-identity).

You should [manage access to your Azure DevOps organization](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/manage-azure-active-directory-groups) and to projects and other resources (e.g. Service Connections) using Azure AD Groups. I'd also strongly recommend reading the documentation on [security groups](https://docs.microsoft.com/en-us/azure/devops/organizations/security/add-manage-security-groups) and [permissions](https://docs.microsoft.com/en-us/azure/devops/organizations/security/about-permissions) for Azure DevOps as there are a lot of nuance to these and they deserve an entire post on their own.

**Recommendation: Use Azure AD as the identity source for Azure DevOps**. [Create and manage users](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/add-users-azure-active-directory) and [security groups](https://docs.microsoft.com/en-us/azure/devops/organizations/security/add-ad-aad-built-in-security-groups) within Azure AD.

Documentation Reference: [Connect organization to Azure Active Directory](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad), [Access with Active Directory Groups](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/manage-azure-active-directory-groups).

## 4\. Git or TFVC?

![](/images/ss_azure_devops_12_things_4a.png?w=480)

Importing a TFVC repository as Git

This might be controversial, but it shouldn't be. Unless you have a legacy TFVC repository that you need to keep around for historic/support reasons or some tools that only support TFVC that you can't live without (or can't replace) then **you should be using** [Git as your version control system](https://docs.microsoft.com/en-us/azure/devops/learn/git/what-is-git).

If you do have legacy TFVC repositories that you need to bring over, consider [importing them as Git repositories](https://docs.microsoft.com/en-us/azure/devops/learn/git/migrate-from-tfvc-to-git).

**Recommendation: Use Git.** Make sure all your teams [know how to use Git well](https://try.github.io/).

Documentation Reference: [When to add another project](https://docs.microsoft.com/en-us/azure/devops/organizations/projects/about-projects?view=azure-devops#reasons-to-add-another-project)

## 5\. Create a Sandbox Project.

![](/images/ss_azure_devops_12_things_3.png?w=462)

Create a Sandbox Project

You and your teams will often need a place to **experiment** and **learn** about Azure DevOps safely. A **sandbox project** is a great place to do this. You can create a sandbox project and **give teams higher levels of permissions** over it project to allow them to experiment with different settings (for example try out an alternate area path structure)

Don't confuse a sandbox project with a project for building proof-of-concepts/experimental code: you should not use a Sandbox project for creating anything that could end up in production or anything that has any value. **Content in sandbox projects often accidentally get deleted.**

**Recommendation: Create a Sandbox Project**. Assign an image and description for the project to make it clear that it is a Sandbox and what it can be used for.

Documentation Reference: [When to add another project](https://docs.microsoft.com/en-us/azure/devops/organizations/projects/about-projects?view=azure-devops#reasons-to-add-another-project)

## 6\. Install extensions... wisely

![](/images/ss_azure_devops_12_things_6.png?w=1024)

The Azure DevOps Extensions Marketplace

The [Azure DevOps marketplace](https://marketplace.visualstudio.com/azuredevops?utm_source=vstsproduct&utm_medium=L1BrowseMarketplace) is filled with [many](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.FolderManagement) [great](https://marketplace.visualstudio.com/items?itemName=azsdktm.AzSDK-task) [extensions](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.FolderManagement) that really enhance the value of Azure DevOps. It is well worth **browsing through the extensions** created by both [Microsoft](https://marketplace.visualstudio.com/publishers/Microsoft), [Microsoft DevLabs](https://marketplace.visualstudio.com/publishers/Microsoft%20DevLabs) and the hundreds of **3rd party** ones to really experience the full power of Azure DevOps.

You should set up a formal process around **validating**, **on-boarding** and **off-boarding** extensions from your organization. It is all too easy to end up with "extension sprawl" that results in a management nightmare, especially if you have strict security or governance practices (you might be familiar with this if you've ever managed Jenkins within a large organization).

It is also tempting to install pipeline extensions for any minor task that you might want to execute in a CI/CD pipeline. But you should consider if the governance & management of a task **is worth the time** that might be saved using it, especially when a short [Bash](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/bash) or [PowerShell](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/powershell) task might do just as well.

**Recommendation: Install important extensions from marketplace**. Formalize a process for **validating**, **on-boarding** and **off-boarding** extensions.

Documentation Reference: [](https://docs.microsoft.com/en-us/azure/devops/organizations/projects/about-projects?view=azure-devops#reasons-to-add-another-project)[Azure DevOps marketplace](https://marketplace.visualstudio.com/azuredevops?utm_source=vstsproduct&utm_medium=L1BrowseMarketplace), [Install Azure DevOps Extension](https://docs.microsoft.com/en-us/azure/devops/marketplace/install-extension)

## 7\. Use Multi-stage YAML Pipelines.

![](/images/ss_azure_devops_12_things_7.png?w=699)

Do NOT use "Classic Editor" and create pipelines without YAML

Early on the evolution of Azure DevOps pipelines, all pipelines had to created using a visual designer. The structure of this visually designed pipeline **was not stored in code**, rather it was stored separately without proper version control. This is no longer the case.

You should always create new **build pipelines** using YAML and store them in your repository with your source code (pipeline as code). You can still use the **assistant** to help you design your YAML:

![](/images/ss_azure_devops_12_things_9.png?w=941)

Click Show Assistant to edit your YAML.

The exception is **release pipelines** which don't support YAML and being stored in version control.

**Recommendation: Create all pipelines a multi-stage YAML pipelines.**

Documentation Reference: [Define pipelines using YAML syntax](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started/pipelines-get-started?view=azure-devops#define-pipelines-using-yaml-syntax)

## 9\. Release Pipelines... in code?

Release Pipelines are awesome, but are they worth missing out on pipeline as code?

**Release pipelines** don't support YAML. However, in _many cases_ you don't need release pipelines. Instead, you can use your **multi-stage YAML build pipeline** to **release** your software as well by adding a [deployment job](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs). This also **aligns much more closely to GitHub**, where there is no concept of a Release Pipeline and would make moving to GitHub Actions much easier _should you want to_.

As of writing this post, there are **two key feature that are missing from YAML build pipelines**: [Gates](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals/gates) and [Deployment Group jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-group-phases). Also, the release pipeline **visualization** and **dashboard** widgets are quite useful, so you may prefer these over the build pipeline visualization. But in my opinion the visualization is not worth losing version control over your pipeline.

**Recommendation: Use **multi-stage YAML pipeline** deployments if you don't need Gates or Deployment Group Jobs**. Use [conditions](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/conditions) to determine if a deployment job should be executed. Use [approvals](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops&tabs=check-pass#approvals) and checks on the [environment](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/environments?view=azure-devops) to control deployment.

Documentation Reference: [Deployment Job](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs), [Conditions](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/conditions), [Approvals](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops&tabs=check-pass#approvals), [Environments](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/environments?view=azure-devops).

## 10\. Deployment Group Agents?

![](/images/ss_azure_devops_12_things_10.png?w=1024)

Add a machine to a Deployment Group.

If the applications you are building and releasing need to be deployed to a physical or virtual machine (e.g. not to a Kubernetes cluster or managed service) that is **not accessible by an Azure DevOps Hosted agent**, then you can use a [Deployment Group agent](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/deployment-groups/howto-provision-deployment-group-agents).

This is just the Azure DevOps Hosted agent installed onto the machine and registered with Azure DevOps as a **Deployment Group agent** in a [Deployment Group](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/deployment-groups). Deployment Group agents only require outbound connectivity to Azure DevOps services.

This is a good solution if you're deploy to machines on-premises or on machines where inbound internet connectivity is blocked, but outbound internet is allowed.

**Recommendation: If you have to deploy your application to a machine that** **is not accessible from Azure DevOps Microsoft Hosted Agents.**

Documentation Reference: [Deployment Group agent](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/deployment-groups/howto-provision-deployment-group-agents), [Deployment Group](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/deployment-groups)

## 11\. Automate. Automate.

![](/images/ss_azure_devops_12_things_13.png?w=1024)

Get a list of Azure DevOps projects using Azure DevOps CLI

Just like most other Microsoft tools, you can automate them from the command line using either PowerShell, CMD or Bash (or even REST API). If you have to perform repetitive tasks in Azure DevOps, you might want to consider **automating these processes**.

This is also a good way to control certain processes and practices, such as creating **Service Connections** from code in a repository, or **rolling secrets in a Library Variable Group**.

You can also use these tools to **interact with Azure DevOps from within Azure DevOps pipelines**, leading to some interesting techniques such as release orchestrations (beyond the scope of this doc).

**Recommendation: Use Azure DevOps CLI or the VSTeams PowerShell module (created by [Donovan Brown](https://twitter.com/DonovanBrown)) to automate Azure DevOps.** Alternatively, use Azure DevOps REST API.

Documentation Reference: [Azure DevOps CLI](https://docs.microsoft.com/en-us/azure/devops/cli/?view=azure-devops), [VSTeam PowerShell module](https://github.com/MethodsAndPractices/vsteam), [Azure DevOps REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops/).

## 12\. Get Practical Experience.

![](/images/ss_azure_devops_12_things_12.png?w=1024)

The best way to learn Azure DevOps is to get hands-on practical experience. [Azure DevOps Labs](https://www.azuredevopslabs.com/) provides **free hands-on labs environments** (via your own DevOps organization) and covers practically everything you could ever want to know. The [Azure DevOps content on Microsoft Learn](https://docs.microsoft.com/en-us/learn/browse/?products=azure-devops) also has detailed walk throughs of the product and processes.

Making sure everyone in your organization has the skills/knowledge to work with Azure DevOps will help them be more successful and happy.

**Recommendation: Do some of the hands-on labs and complete some Microsoft Learn learning pathways.**

Documentation Reference: [](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/deployment-groups/howto-provision-deployment-group-agents)[Azure DevOps Labs](https://www.azuredevopslabs.com/), [Azure DevOps content on Microsoft Learn](https://docs.microsoft.com/en-us/learn/browse/?products=azure-devops)

## Wrapping Up

There are definitely lots more recommendations and considerations I could suggest, especially security and DevOps best-practices but to keep this (reasonably) short, I'll leave them for another post.

I hope you find this useful and it helps you avoid some of my mistakes.

