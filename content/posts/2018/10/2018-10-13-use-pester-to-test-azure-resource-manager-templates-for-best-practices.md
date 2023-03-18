---
title: "Use Pester to Test Azure Resource Manager Templates for Best Practices"
date: "2018-10-13"
categories:
  - "azsk"
  - "pester"
tags:
  - "azure"
  - "powershell"
---

Recently I came across the amazing [Secure DevOps Kit for Azure (AzSK)](https://azure.microsoft.com/en-gb/resources/videos/azure-friday-getting-started-with-the-secure-devops-kit-for-azure-azsk/). This contains a really useful [AzSK PowerShell Module](https://www.powershellgallery.com/packages/AzSK) that contains cmdlets for performing different types of security scanning on Azure Resources, Subscriptions and Resource Manager Templates.

The feature of this module that I was most interested in for my current project was being able to scan ARM templates for best practice violations. The module contains several

To install the module, open a PowerShell Window and run:

\[gist\]5cbc71984116172d0d28a1b85f315650\[/gist\]

> Important: At the time of writing this post, the AzSK module has dependencies on the **AzureRM.Profile** and other AzureRM.\* PowerShell modules. As of December 2018, the **AzureRM.\*** PowerShell Modules are going to be renamed to **Az.\*** (see [this post](https://github.com/Azure/azure-powershell/blob/preview/documentation/announcing-az-module.md)). The AzureRM and Az modules **can not** be installed side-by-side, so if you've installed the Az PowerShell modules on your system then the installation of AzSK will fail because the AzureRM modules will also be installed and a conflict will occur.

The cmdlet we're most interested in is the **Get-AzSKARMTemplateSecurityStatus**. It can be used to scan one or more ARM templates or entire folders of ARM templates for best practice violations:

![ss_azsk_scanning](/images/ss_azsk_scanning.png)

This will scan the ARM templates and produce a **CSV report** in a folder **Microsoft\\AzSKLogs\\ARMChecker** within your **$ENV:LOCALAPPDATA** folder and open the folder in Explorer. This isn't ideal for automation scenarios or using during Continuous Integration or Continuous Delivery pipelines. I've raised [an issue](https://github.com/azsk/DevOpsKit/issues/267) with the AzSK team on GitHub to see if this can be improved.

In my case, I wanted to be able to use the [PowerShell Pester Module](https://github.com/pester/Pester), a PowerShell testing framework, to execute tests on the output and then use the nUnit output Pester generates to publish into a Continuous Integration pipeline. To do that I needed to create a custom test script that would take the CSV report, count the failures of each level (High, Medium or Low) and fail if any are counted in the specific level.

This is what the script looks like:

\[gist\]1af35ee65a2276ca90b3a8a5b224a5d4\[/gist\]

You can download the script from GitHub Gist directly or get it from the [PowerShell Gallery](https://www.powershellgallery.com/packages/AzSKARMTemplateSecurityStatus.Test/1.0.0) by running:

Install-Script -Name AzSKARMTemplateSecurityStatus.Test

To use it you will need to install Pester 4.3.0 and AzSK 3.6.1 modules:

\[gist\]4a1884d10b44416a85c0a632e90fa2d7\[/gist\]

Once that is done, you can use **Invoke-Pester** and pass in the **TemplatePath** and **Severity** parameters to the test script:

\[gist\]a9cffa90bcaddcd9f905618b4c384d5e\[/gist\]

This will execute the Pester tests in the file above on the specified ARM template. The tests will fail when there are any best practice violations with the specified **Severity** or above. If you didn't pass in a **Severity** then it will default to failing on **Medium** and **High**.

![ss_azsk_invokepester](/images/ss_azsk_invokepester.png)

If you use the **OutputFile** and **OutputFormat** parameters to cause Pester to output an NUnit format file that most Continuous Integration tools will happily accept and use to display the output of the tests.

If you installed the script from the PowerShell Gallery, you can also run the tests like this:

AzSKARMTemplateSecurityStatus.Test -TemplatePath D:\\101-webapp-basic-windows\\azuredeploy.json

Finally, if you're using Azure DevOps, you can also get this function as part Secure DevOps Kit (AzSK) CICD Extensions for Azure in the [Azure DevOps Marketplace](https://marketplace.visualstudio.com/items?itemName=azsdktm.AzSDK-task).

Which ever way you choose to consume AzSK, it is a great module and well worth including in your CI/CD pipelines to ensure your ARM templates meet best practices.

