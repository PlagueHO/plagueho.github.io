---
title: "Using PowerShell to Install/Uninstall Microsoft Office Products by Group Policy"
date: "2015-04-06"
tags:
  - "group-policy"
  - "microsoft-office"
  - "powershell"
coverImage: "danrus.jpg"
---

I've been recently doing some experimentation with AD RMS templates and AD FS integration in my lab environment. Clearly, I lead a very exciting life. Of course to test AD RMS templates one needs a copy of Office installed into the lab environment. This, I thought, would be a good opportunity to configure Office (Office 2013 Pro Plus to be precise) to be installed via Group Policy.

I of course read the [Deploy Office 2013 by using Group Policy computer startup scripts](https://technet.microsoft.com/en-us/library/ff602181.aspx) documentation on TechNet, which directed me to use GPOs which called batch files on computer start-up. This is all simple enough and works well, but being a bit of a PowerShell fiend I'd prefer to use it whenever I can. Since Windows Server 2008 R2 and above supports PowerShell scripts for GPO startup and shutdown I thought I'd write some general purpose PowerShell scripts that could be used in place of the old batch file scripts:

[PowerShell Scripts to Install/Uninstall Office 2013 products using GPO](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-InstallUninst-0536b17b "PowerShell Scripts to Install/Uninstall Office 2013 products using GPO")

As a side note - I wonder why Microsoft doesn't support installing Office 2013 products using the standard Software Deployment policies in GPO (assigning, publishing etc). But that is a question only Microsoft can answer.

These PowerShell scripts accept parameters that allow key elements of the installation process (product, source folder, config file, log file location) to be specified in the GPO Script parameters themselves:

[![GPO PowerShell Startup Script](/images/ss_gpo_startupscript_ps_install_msoffice.png)](/images/ss_gpo_startupscript_ps_install_msoffice.png)

For example, to install a copy of Microsoft Office 2013 Pro Plus from the \\\\server\\software$\\Office15.ProPlus\\ share using the file \\\\server\\software$\\Office15.ProPlus\\ProPlus.ww\\SilentInstall.xml to control the configuration the following parameters could be used:

\-ProductId "Office15.ProPlus" -SourcePath "\\\\server\\software$\\Office15.ProPlus\\" -ConfigFile "\\\\server\\software$\\Office15.ProPlus\\ProPlus.ww\\SilentInstall.xml"

The full script parameters are documented in the PowerShell scripts as well as on the [Microsoft Script Repository page](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-InstallUninst-0536b17b "PowerShell Scripts to Install/Uninstall Office 2013 products using GPO") along with additional examples. The scripts can also accept a parameter for controlling where a brief log file can be written to so that it is easy to see if the product has been successfully installed on each machine that has been assigned the GPO.

## Creating a GPO using the PowerShell Scripts

1. In Group Policy Management Console, create a new GPO:[![ss_gpmc_new_gpo](/images/ss_gpmc_new_gpo.png)](/images/ss_gpmc_new_gpo.png)
2. Enter a name for the installation policy and click **OK**.[![ss_gpmc_new_gpo_name](/images/ss_gpmc_new_gpo_name.png)](/images/ss_gpmc_new_gpo_name.png)
3. Right click on the new policy and select **Edit**:[![ss_gpmc_gpo_edit](/images/ss_gpmc_gpo_edit.png)](/images/ss_gpmc_gpo_edit.png)
4. Select the **Computer Configuration\\Policies\\Windows Settings\\Scripts (Startup/Shutdown)** node:[![ss_gpmc_edit_startup_script](/images/ss_gpmc_edit_startup_script.png?w=660)](/images/ss_gpmc_edit_startup_script.png)
5. Double click the **Startup** item:[![ss_gpmc_startup_properties_scripts](/images/ss_gpmc_startup_properties_scripts.png)](/images/ss_gpmc_startup_properties_scripts.png)
6. Select the **PowerShell Scripts** tab:[![ss_gpmc_startup_powershell_scripts](/images/ss_gpmc_startup_powershell_scripts.png)](/images/ss_gpmc_startup_powershell_scripts.png)
7. Click **Add** to add a new startup script:[![ss_gpmc_startup_powershell_addascript](/images/ss_gpmc_startup_powershell_addascript.png)](/images/ss_gpmc_startup_powershell_addascript.png)
8. Click the **Browse** button to locate the folder where the policies scripts should be stored:[![ss_gpmc_startup_scripts_location](/images/ss_gpmc_startup_scripts_location.png?w=660)](/images/ss_gpmc_startup_scripts_location.png)
9. You will need to copy the PowerShell scripts downloaded from the [Microsoft Script Repository](https://gallery.technet.microsoft.com/scriptcenter/PowerShell-to-InstallUninst-0536b17b "PowerShell Scripts to Install/Uninstall Office 2013 products using GPO") into this folder and select the one that should be used with this policy.
10. Enter the PowerShell script parameters into the **Script Parameters** box:[![ss_gpmc_startup_powershell_script_properties](/images/ss_gpmc_startup_powershell_script_properties.png)](/images/ss_gpmc_startup_powershell_script_properties.png)
11. Click **OK** to save the PowerShell startup script:[![ss_gpmc_startup_powershell_scrpts_configured](/images/ss_gpmc_startup_powershell_scrpts_configured.png)](/images/ss_gpmc_startup_powershell_scrpts_configured.png)
12. Click **OK** to save the Startup Properties.
13. Close the GPME and apply the new GPO.

## Important Note about PowerShell Script Parameters

There appears to be a limit to the maximum number of characters supported in the GPO Startup/Shutdown PowerShell script parameters. This limit seems to be 207 characters, but I haven't been able to confirm this anywhere. Although more than this number of characters can be entered into the Parameter text box, anything above 207 does not get passed through to the script, which either causes the script to run incorrectly or not at all.

If you do encounter this limit, but still need additional parameters passed, you could use positional parameters to reduce the overhead or create another script that calls these scripts with the defined parameters.

Hopefully, someone will find this useful. If you have any comments or requests for improvements of the scripts, don't hesitate to let me know.
