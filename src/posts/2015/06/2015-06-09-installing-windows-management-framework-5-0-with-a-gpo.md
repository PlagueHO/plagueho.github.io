---
title: "Installing Windows Management Framework 5.0 with a GPO"
date: 2015-06-09
description: "A quick article about installing Windows Management Framework 5.0 with a GPO."
tags:
  - "desired-state-configuration"
  - "group-policy"
  - "powershell"
  - "windows-management-framework-5-0"
---

## The Need

Last week I decided I needed to get to know the new features that come with DSC in the new Windows Management Framework 5.0 (aka PowerShell 5.0) April Preview release (available to download [here](https://www.microsoft.com/en-us/download/details.aspx?id=46889)). I figured I'd also need to look at updating my [DSCTools module](https://dscottraynsford.wordpress.com/2015/05/02/dsc-tools-hopefully-making-dsc-easier/) to use the new features as well. But first up I'd need to update all my lab machines with the WMF 5.0 update. Being a proper lazy nerd I thought I'd just automate it.

## The Problem

After downloading the .MSU file for installing WMF 5.0 from Microsoft I decided that WSUS would be the proper way to get this out to all my machines. Nope. Wrong! WSUS only supports pushing updates that appear in the [Microsoft Update Catalogue (looking for Windows Management Framework)](http://catalog.update.microsoft.com/v7/site/Search.aspx?q=Windows%20Management%20Framework) - but no update packages greater than Windows Management Frameworks 2.0 are available in the catalogue:

[caption id="attachment\_205" align="alignnone" width="660"\][![Where is PowerShell 5.0? Or 4.0? Or 3.0?](/assets/images/blog/ss_microsoft_update_catalogue_windows_management_framework.png)](/assets/images/blog/ss_microsoft_update_catalogue_windows_management_framework.png)
Where is PowerShell 5.0? Or 4.0? Or 3.0?

As an aside after doing a bit of reading on the reason for this it appears that updating to later versions of PS can cause problems with some applications and so it is kept as a manual process.

Next on the drawing board was push the update out using GPO's software installation policies - except it only supports MSI files. So that won't work (although converting an MSU to an MSI might be possible according to some sources).

## The Solution

Finally I settled on pushing the MSU onto the machines by using a GPO Startup Script - of the PowerShell flavour of course. It seemed like I could just adapt the PS script I wrote for [installing Office 2013 via GPO](https://dscottraynsford.wordpress.com/2015/04/06/using-powershell-to-installuninstall-microsoft-office-products-by-group-policy/). After a bit of coding I had the update installing (in silent mode of course).

The next problem was that I needed some sort of registry key that could be checked to see if the update was already installed so it didn't try to repeatedly reinstall every time the computer started up. I spent a few hours hunting around for information on where in the registry a record of installed updates was kept and couldn't seemed to find any.

So instead I just used a simple WMI query to find out if the update was installed:

```powershell
Get-WmiObject -Class Win32_QuickFixEngineering -Filter "HotfixID = 'KB2908075'"
```

The above command will return a list of KBs installed with a matching **HotfixID**.  
There will be zero results if the KB is not present, so to use it I needed to count the objects returned:

```powershell
(Get-WmiObject -Class Win32_QuickFixEngineering -Filter "HotfixID = 'KB2908075'" |
    Measure-Object).Count -gt 0
```

If the MSU or EXE (did I mention this script will work with hot-fixes in EXE form) does indeed need installing, the script just builds a command line and calls it:

```powershell
if ([IO.Path]::GetExtension($InstallerPath) -eq '.msu') {
    $Command = "WUSA.EXE $InstallerPath /quiet /norestart"
    $Type    = "MSU $KBID"
}
else {
    $Command = "$InstallerPath /quiet /norestart"
    $Type    = "EXE $KBID"
}

# Call the installer
& cmd.exe /c "$Command"
$ErrorCode = $LASTEXITCODE
```

## The Script

So after putting all the pieces together I had a finished script that seemed to do exactly what I needed. It can be downloaded from the Microsoft Script Center [PowerShell Scripts to Install Application (EXE) or Update (MSU) using GPO](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-Install-70009e38). It is also available in [my GitHub repo](https://github.com/PlagueHO/InstallUsingGPOTools) (edit: I moved this out of my generic PowerShell tools repo and into it's own repo).

### Warning

Before getting started, I strongly suggest you read my post about the problems encountered using PowerShell parameters in GPO [here](https://dscottraynsford.wordpress.com/2015/06/03/powershell-paramters-in-gpo-scripts/). There are some really annoying issues with PowerShell script parameters in GPO that will have you tearing your hair out - luckily I tore my hair out for you.

### Using It

1. Download the [PowerShell Scripts to Install Application (EXE) or Update (MSU) using GPO](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-Install-70009e38) from Microsoft Script Center.
1. Download the MSU/EXE update file and put it in a shared folder all of your machines can get to. I used _\\\\plague-pdc\\Software$\\Updates\\WindowsBlue-KB3055381-x64.msu_
1. Create a new GPO that will be used to install the update - I called mine _Install WMF 5.0 Policy_:[![New Policy](/assets/images/blog/ss_gpo_installwmf5.png)](/assets/images/blog/ss_gpo_installwmf5.png)
1. Locate the **Startup** setting under _Computer Configuration/Policies/Windows Settings/Scripts_:[![The Startup Script of a Computer GPO.](/assets/images/blog/ss_gpo_installwmf5_startup.png)](/assets/images/blog/ss_gpo_installwmf5_startup.png)
1. Double click the **Startup** item to edit the scripts and select the **PowerShell** **Scripts** tab: [![Setting the Startup PowerShell Scripts](/assets/images/blog/ss_gpo_installwmf5_startuppsscripts.png)](/assets/images/blog/ss_gpo_installwmf5_startuppsscripts.png)
1. Click the **Show Files** button and copy the **Install-Update.ps1** file that was in the zip file downloaded from Microsoft Script Center into this location:[![GPO Folder containing script](/assets/images/blog/ss_gpo_installwmf5_startuppsscripts_folder.png)](/assets/images/blog/ss_gpo_installwmf5_startuppsscripts_folder.png)
1. Close the folder and go back to the **Startup Properties** window and click the **Add** button.
1. Set the **Script Name** to _Install-Update.ps1_.
1. Set the **Script Parameters** to be the following (customized the **bold** sections to your environment):

    ```powershell
    -InstallerPath "**\\\\plague-pdc\\Software$\\Updates\\WindowsBlue-KB3055381-x64.msu**" -KBID "**KB3055381**" -LogPath **\\\\plague-pdc\\LogFiles$\\**
    ```

    > [!NOTE]
    > You can leave off the -LogPath parameter if you don't want to create logs stating if the update was installed correctly on each machine.

    [![Add the script and parameters](/assets/images/blog/ss_gpo_installwmf5_startuppsscripts_details.png)](/assets/images/blog/ss_gpo_installwmf5_startuppsscripts_details.png)
1. Click **OK**.
1. Click **OK** on the **Startup Properties** window.
1. Close the **GPME** window and assign the policy to whichever OUs you want to try WMF 5.0 out on.

That was probably a lot more detail than most people needed, but I thought I throw it in there just in case.

If you require more details on the parameters available in the script, use the PowerShell cmdlet Get-Help `.\Install-Update.ps1` in the folder that Install-Update.ps1 is installed into - or just look at the [PowerShell Scripts to Install Application (EXE) or Update (MSU) using GPO](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-Install-70009e38) Microsoft Script Center page.

### Installing an Application Script

While I was at it I also decided that I wanted to install applications contained in an EXE by this method too ([Notepad++](https://notepad-plus-plus.org/) was my excuse). This required a slightly different approach to detect if the application was already installed. Basically depending on the application a registry key and/or value needs to be checked to see if the application needs installation. These registry entries differ for every application being installed so which keys to check for an app need to be passed in via parameters to the PowerShell script.

For example, for Notepad++ version 6.7.8.2 the registry key _HKLM:\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Notepad++_ must exist and requires a string value called _DisplayVersion_ to be equal to "6.7.8.2".

I also wrote a script, `Install-Application.ps1` to do all this as well, and it is available in the same package as the `Install-Update.ps1` script. I will write a separate blog post on using this one as it can be a little bit trickier thanks to the limitations with passing parameters to PS scripts in GPOs. So I'll leave this post till next week.

Thanks for reading!
