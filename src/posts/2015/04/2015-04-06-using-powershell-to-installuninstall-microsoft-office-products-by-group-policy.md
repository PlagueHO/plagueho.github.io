---
title: "Using PowerShell to Install/Uninstall Microsoft Office Products by Group Policy"
date: 2015-04-06
description: "Using PowerShell to Install/Uninstall Microsoft Office Products by Group Policy"
tags:
  - "group-policy"
  - "microsoft-office"
  - "powershell"
image: "/assets/images/blog/danrus.jpg"
---

I've been recently doing some experimentation with AD RMS templates and AD FS integration in my lab environment. Clearly, I lead a very exciting life. Of course, to test AD RMS templates, one needs a copy of Office installed into the lab environment. This, I thought, would be a good opportunity to configure Office (Office 2013 Pro Plus to be precise) to be installed via Group Policy.

I, of course, read the [Deploy Office 2013 by using Group Policy computer startup scripts](https://technet.microsoft.com/en-us/library/ff602181.aspx) documentation on TechNet, which directed me to use GPOs that called batch files on computer start-up. This is all simple enough and works well, but being a bit of a PowerShell fiend, I'd prefer to use it whenever I can. Since Windows Server 2008 R2 and above supports PowerShell scripts for GPO startup and shutdown, I thought I'd write some general-purpose PowerShell scripts that could be used in place of the old batch file scripts:

[PowerShell Scripts to Install/Uninstall Office 2013 products using GPO](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-InstallUninst-0536b17b "PowerShell Scripts to Install/Uninstall Office 2013 products using GPO")

As a side note - I wonder why Microsoft doesn't support installing Office 2013 products using the standard Software Deployment policies in GPO (assigning, publishing, etc.). But that is a question only Microsoft can answer.

These PowerShell scripts accept parameters that allow key elements of the installation process (product, source folder, config file, log file location) to be specified in the GPO Script parameters themselves:

![GPO PowerShell Startup Script](/assets/images/blog/ss_gpo_startupscript_ps_install_msoffice.png)

For example, to install a copy of Microsoft Office 2013 Pro Plus from the `\\server\software$\Office15.ProPlus\` share using the file `\\server\software$\Office15.ProPlus\ProPlus.ww\SilentInstall.xml` to control the configuration, the following parameters could be used:

```powershell
-ProductId "Office15.ProPlus" -SourcePath "\\server\software$\Office15.ProPlus\" -ConfigFile "\\server\software$\Office15.ProPlus\ProPlus.ww\SilentInstall.xml"
```

The full script parameters are documented in the PowerShell scripts as well as on the [Microsoft Script Repository page](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-InstallUninst-0536b17b "PowerShell Scripts to Install/Uninstall Office 2013 products using GPO") along with additional examples. The scripts can also accept a parameter for controlling where a brief log file can be written to so that it is easy to see if the product has been successfully installed on each machine that has been assigned the GPO.

## Creating a GPO using the PowerShell Scripts

1. In Group Policy Management Console, create a new GPO:  
   ![Create a new GPO](/assets/images/blog/ss_gpmc_new_gpo.png)
1. Enter a name for the installation policy and click **OK**:  
   ![Enter GPO name](/assets/images/blog/ss_gpmc_new_gpo_name.png)
1. Right-click on the new policy and select **Edit**:  
   ![Edit GPO](/assets/images/blog/ss_gpmc_gpo_edit.png)
1. Select the **Computer Configuration\Policies\Windows Settings\Scripts (Startup/Shutdown)** node:  
   ![Edit Startup Script](/assets/images/blog/ss_gpmc_edit_startup_script.png)
1. Double-click the **Startup** item:  
   ![Startup Properties](/assets/images/blog/ss_gpmc_startup_properties_scripts.png)
1. Select the **PowerShell Scripts** tab:  
   ![PowerShell Scripts Tab](/assets/images/blog/ss_gpmc_startup_powershell_scripts.png)
1. Click **Add** to add a new startup script:  
   ![Add PowerShell Script](/assets/images/blog/ss_gpmc_startup_powershell_addascript.png)
1. Click the **Browse** button to locate the folder where the policy scripts should be stored:  
   ![Script Location](/assets/images/blog/ss_gpmc_startup_scripts_location.png)
1. Copy the PowerShell scripts downloaded from the [Microsoft Script Repository](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-InstallUninst-0536b17b "PowerShell Scripts to Install/Uninstall Office 2013 products using GPO") into this folder and select the one that should be used with this policy.
1. Enter the PowerShell script parameters into the **Script Parameters** box:  
   ![Script Parameters](/assets/images/blog/ss_gpmc_startup_powershell_script_properties.png)
1. Click **OK** to save the PowerShell startup script:  
   ![Configured Scripts](/assets/images/blog/ss_gpmc_startup_powershell_scrpts_configured.png)
1. Click **OK** to save the Startup Properties.
1. Close the GPME and apply the new GPO.

## Important Note about PowerShell Script Parameters

There appears to be a limit to the maximum number of characters supported in the GPO Startup/Shutdown PowerShell script parameters. This limit seems to be 207 characters, but I haven't been able to confirm this anywhere. Although more than this number of characters can be entered into the Parameter text box, anything above 207 does not get passed through to the script, which either causes the script to run incorrectly or not at all.

If you do encounter this limit but still need additional parameters passed, you could use positional parameters to reduce the overhead or create another script that calls these scripts with the defined parameters.

Hopefully, someone will find this useful. If you have any comments or requests for improvements to the scripts, don't hesitate to let me know.
