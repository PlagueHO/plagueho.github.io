---
title: "Get the ForceChangePassword Office 365 User Setting with PowerShell"
date: 2018-06-22
description: "Get the ForceChangePassword Office 365 User Setting with PowerShell"
tags:
  - "azuread"
  - "forcechangepassword"
  - "powershell"
  - "office-365"
image: "/assets/images/blog/ss_o365_getforcechangepassword.png"
---

Recently I was asked by a friend if I knew of a way to get the value of the setting that forces a user to change their password when they next log in to Office 365. The friend wanted to get this value for all users using PowerShell.

Changing this setting is fairly straight forward either in the Office 365 portal or using the [Set-MsolUserPassword](https://docs.microsoft.com/en-us/powershell/module/msonline/set-msoluserpassword) cmdlet in the MSOnline PowerShell module:

![ss_o365_setmsoluserpassword](/assets/images/blog/ss_o365_setmsoluserpassword.png)

However, retrieving the current value of the setting isn't possible using [Get-MsolUser](https://docs.microsoft.com/en-us/powershell/module/msonline/get-msoluser) cmdlet—the attribute does not appear in the returned object:

![ss_o365_getmsoluser](/assets/images/blog/ss_o365_getmsoluser.png)

Instead, we need to use the [Get-AzureADUser](https://docs.microsoft.com/en-us/powershell/module/azuread/get-azureaduser) cmdlet in the [AzureAD PowerShell Module](https://docs.microsoft.com/en-us/powershell/module/azuread) to query the Azure Active Directory for the Office 365 tenant.

If you don't have the AzureAD module installed, use **Install-Module** cmdlet to install it from the PowerShell Gallery:

```powershell
Install-Module -Name AzureAD
```

Then connect to AzureAD using the **Connect-AzureAD** cmdlet. Once connected, you can run the following command to get the user object and show only the appropriate property (**ForceChangePasswordNextLogin** of the **PasswordProfile** object):

```powershell
Connect-AzureAD
(Get-AzureADUser -SearchString 'williammurderface@contoso.onmicrosoft.com').PasswordProfile.ForceChangePasswordNextLogin
```

![ss_o365_getazureaduser](/assets/images/blog/ss_o365_getazureaduser1.png)

If you wanted to get a list of all users with the **ForceChangePasswordNextLogin** property set to **true**, you could use:

```powershell
Get-AzureADUser | Where-Object -FilterScript { $_.PasswordProfile.ForceChangePasswordNextLogin }
```

![ss_o365_getazureadallforcechangepasswordnextlogin](/assets/images/blog/ss_o365_getazureadallforcechangepasswordnextlogin.png)

This is all fairly straight forward once you figure out which object in Azure AD contains the information required.
