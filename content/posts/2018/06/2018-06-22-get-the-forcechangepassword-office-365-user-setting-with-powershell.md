---
title: "Get the ForceChangePassword Office 365 User Setting with PowerShell"
date: "2018-06-22"
categories:
  - "office-365"
tags:
  - "azuread"
  - "forcechangepassword"
  - "powershell"
coverImage: "ss_o365_getforcechangepassword.png"
---

Recently I was asked by a friend if I knew of a way to get the value of the setting that forces a user to change their password when the next log in to Office 365. The friend wanted to get this value for all users using PowerShell.

Changing this setting is fairly straight forward either in the Office 365 portal or using the [Set-MsolUserPassword](https://docs.microsoft.com/en-us/powershell/module/msonline/set-msoluserpassword) cmdlet in the MSOnline PowerShell module:

![ss_o365_setmsoluserpassword](/images/ss_o365_setmsoluserpassword.png)

However retrieving the current value of the setting isn't possible using [Get-MoslUser](https://docs.microsoft.com/en-us/powershell/module/msonline/get-msoluser) cmdlet - the attribute does not appear in the returned object:

![ss_o365_getmsoluser](/images/ss_o365_getmsoluser.png)

Instead, we need to use the [Get-AzureADUser](https://docs.microsoft.com/en-us/powershell/module/azuread/get-azureaduser) cmdlet in the [AzureAD PowerShell Module](https://docs.microsoft.com/en-us/powershell/module/azuread) to query the Azure Active Directory for the Office 365 tenant.

If you don't have the AzureAD module installed, use **Install-Module** cmdlet to install it from the PowerShell Gallery:

\[gist\]c86942259470983b0e3f2833e2549a8f\[/gist\]

Then connect to the AzureAD using the **Connect-AzureAD** cmdlet. Once connected you can run the following command to get the user object and show only the appropriate property (**ForceChangePasswordNextLogin** of the **PasswordProfile** object):

\[gist\]844b4febf8f89d863e1e2f5c6680221b\[gist\]

![ss_o365_getazureaduser](/images/ss_o365_getazureaduser1.png)

If you wanted to get a list of all users with the **ForceChangePasswordNextLogin** property set to **true** then you could use:

\[gist\]c679486a599b2fb18f3149669bfca4af\[/gist\]

![ss_o365_getazureadallforcechangepasswordnextlogin](/images/ss_o365_getazureadallforcechangepasswordnextlogin.png)

This is all fairly straight forward once you figure out which object in Azure AD contains the information required.

