---
title: "Get Azure API Management Git Credentials using PowerShell"
date: "2017-09-16"
categories:
  - "azure-api-management"
tags:
  - "api-management"
  - "azure"
  - "git"
  - "powershell"
coverImage: "ss_apim_gitrepositoryclone.png"
---

One of the many great features of [Azure API Management](https://azure.microsoft.com/en-us/services/api-management/) is the fact that it has a built in **Git repository** for storing the **current configuration** as well as **publishing new configurations**.

![ss_apim_gitrepository](/images/ss_apim_gitrepository.png)

This allows you to **push** updated Azure API Management configurations to this **internal Git repository** as a **new branch** and then **Deploy the configuration to API Management**.

> The **internal Git repository** in Azure API Management is _not intended_ to be used for a normal development workflow. You'll still want to develop and store your Azure API management configuration in an external Git repository such as GitHub or TFS/VSTS and then **copy** configuration updates to the **internal Git repository** in Azure API Management using some sort of automated process (e.g. Continuous Integration/Continuous Delivery could be adopted for this).

# The Internal Git Repository

To access the **Internal Git Repository** requires **short lived** (30 days maximum) Git credentials to be generated. This is fairly easy through the Azure API Management portal:

![ss_apim_gitrepositorygeneratecreds](/images/ss_apim_gitrepositorygeneratecreds.png)

Unfortunately using the portal to get these credentials is a manual process and so would not be so good for an automated delivery process (e.g. CI/CD). You'd need to update these Git credentials in your CI/CD automation system every time they expired (every 30 days).

# Get Git Credentials

A better approach to generating the Git Credentials is to use [Azure PowerShell](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-4.3.1) **API Management** cmdlets connected with a [Service Principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-application-objects) to **generate** the **Git credentials** whenever you need them in your CI/CD pipeline.

This is not a completely straightforward process right now (which is unusual for the Azure PowerShell team), so I've created a simple PowerShell script that will take care of the nuts and bolts for you.

## Requirements

To run this script you'll need:

1. PowerShell 5 (WMF 5.0) or greater.
2. Azure PowerShell Modules installed (make sure you've got the latest versions - 4.0.3 at the time of writing this).

You'll also need to supply the following parameters to the script:

1. The Azure Subscription Id of the subscription containing the API Management instance.
2. The name of the Resource Group where the API Management instance is installed to.
3. The service name of the API Management instance.

You can also optionally supply which of the two _internal API Management keys_, **primary** or **secondary**, to use to generate the credential and also the length of time that the Git credential will be valid for (up to 30 days).

## Steps

### Download the Script

1. Download the script [Get-AzureRMApiManagementGitCredential.ps1](70ae184e1c8d22848ade6a7bc0f8255d) using the PowerShell command:
```powershell
iwr https://gist.githubusercontent.com/PlagueHO/70ae184e1c8d22848ade6a7bc0f8255d/raw/a9ca51e690c04654dfcb934ccbc7ca9358c97f08/Get-AzureRMApiManagementGitCredential.ps1 -OutFile Get-AzureRMApiManagementGitCredential.ps1
```
2. Unblock the script using the PowerShell command:
```powershell
Unblock-File -Path .\Get-AzureRMApiManagementGitCredential.ps1
```

### Using the Script

1. Use the **Login-AzureRMAccount** cmdlet to authenticate to Azure. This would normally be done using a **Service Principal** if using an automated process, but could be done interactively when testing.
2. Execute the script providing the **SubscriptionId**, **ResourceGroup** and **ServiceName** parameters (and optionally the **KeyType** and **ExpiryTimespan**) using the following PowerShell command:
```powershell
.\Get-AzureRMApiManagementGitCredential.ps1 `
  -SubscriptionId '605e2ba7-056b-4982-a48b-12ff1da3c038' `
  -ResourceGroup 'apimanagement-shrp-p-rgp' `
  -ServiceName 'ApiManagementdsrshrpp' `
  -KeyType 'primary' `
  -ExpiryTimespan '4:00:00'
```

![ss_apim_gitrepositoryinvoke](/images/ss_apim_gitrepositoryinvoke.png)

The script will return an object containing the properties **GitUsername** and **GitPassword** that can be provided to Git when cloning the **internal Git repository**.

> The **GitPassword** is **not escaped** so can not be directly used within a Git Clone **URL** without replacing any **/** or **@** with **%2F** and **%40** respectively.

In the example above I generated an **internal Git Credential** using the **Primary Secret Key** that will expire in _4 hours_.

Typically you'd assign the output of this script to a variable and use the properties to generate the URL to pass into the Git Clone. For example:

![ss_apim_gitrepositoryclone](/images/ss_apim_gitrepositoryclone.png)

# Tips

- When cloning the **internal Git Repository** you'll need the clone **URL** of the repository. This is always the name of your **Azure API Management** instance followed by with **scm.azure-api.net** appended to it E.g. **https://myapimanagementinstance.scm.azure-api.net**
- Once you've uploaded a new **Git branch** containing a new or updated Azure API Management configuration you'll need to use the **Publish-AzureRmApiManagementTenantGitConfiguration** cmdlet to tell **Azure API Management** to publish the configuration contained in the branch. _I have not detailed this process here, but if there is interest I can cover the entire end-to-end process._
- The **Primary** and **Secondary** **Secret Keys** that are used to generate the **internal Git Credential** can be **re-generated** (rolled) individually if a Git credential is compromised. However, this will _invalidate_ all Git Credentials generated using that **Secret Key**.

# The Script

If you wish to review the script itself, here it is:


```powershell
param
(
    [Parameter(Mandatory = $True)]
    [System.String]
    $SubscriptionId,

    [Parameter(Mandatory = $True)]
    [System.String]
    $ResourceGroup,

    [Parameter(Mandatory = $True)]
    [System.String]
    $ServiceName,

    [Parameter()]
    [ValidateSet('primary','secondary')]
    [System.String]
    $KeyType = 'primary',

    [Parameter()]
    [timespan]
    $ExpiryTimespan = (New-Timespan -Hours 2)
    
)

$context = New-AzureRmApiManagementContext -ResourceGroupName $ResourceGroup -ServiceName $ServiceName

// Correction thanks to @Shaun Titus
$expiry = (Get-Date).ToUniversalTime() + $ExpiryTimespan
$parameters = @{
    "keyType"= $KeyType
    "expiry"= ('{0:yyyy-MM-ddTHH:mm:ss.000Z}' -f $expiry)
}

$resourceId = '/subscriptions/{0}/resourceGroups/{1}/providers/Microsoft.ApiManagement/service/{2}/users/git' -f $SubscriptionId,$ResourceGroup,$ServiceName

$gitUsername = 'apim'
$gitPassword = (Invoke-AzureRmResourceAction -Action 'token' -ResourceId $resourceId -Parameters $parameters -ApiVersion '2016-10-10' -Force).Value

return @{
    GitUsername = $gitUsername
    GitPassword = $gitPassword
}
```

So, hopefully that will be enough information to get anyone else started on building a CI/CD pipeline for deploying **Azure API Management** configurations.


