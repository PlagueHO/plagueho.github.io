---
title: "Your account settings are out of date in Windows 10 Universal Mail App"
date: 2015-07-31
description: "A quick fix for the 'Your account settings are out of date' error in the Windows 10 Universal Mail App."
tags:
  - "powershell"
  - "windows-10"
---

### The Problem

**Update**: This problem is a very long running issue that I'm surprised hasn't been resolved by Microsoft yet. The fix below _does work for some people_, but based on the comments on this post and those on the [Microsoft Forums](http://answers.microsoft.com/en-us/insider/forum/insider_apps-insider_mail/universal-mail-app-your-account-settings-are-out/562f4fad-c60a-4204-a8c3-94fa1d05bf65) this solution doesn't always work and many other fixes have been suggested (see the forum for a large number of other suggested solutions). Some folk have reported that the fix below can prevent the Mail and Calendar apps from working at all, so I'd recommend that you use this process with care and **recommend strongly that you back up the _comms_ folder before deleting the content**.

Recently I noticed on my Windows 10 desktop that I have been using to test all the Windows 10 Insider Preview releases the **Windows 10 Universal Mail and Calendar** app is was no longer working with my Outlook mail account. Every time the app loaded or I clicked on the Outlook account it would show a message at the top of the mail list stating "_Your account settings are out of date_" and giving me the option to **fix** or **dismiss** the problem. Clicking **fix** just flashed up a black window for a brief moment (too fast to see any details) and the message remained. I messed about with the account settings and everything I could find for the account in Mail settings but couldn't figure out how to fix it. I tried various suggested "fixes" I found online, but none of them worked for me.

My Gmail account worked fine in the Mail app as well and my outlook account also worked fine in the **Windows 10 Universal Mail and Calendar** app on my laptop. Unfortunately I didn't think to screenshot the problem before I managed to resolve it so I can't post an image of the error message here. After a lot of investigation and lots of messing around I found out where the Windows Universal Mail app stores its account data - as I thought this is probably where the problem probably was. The **Windows 10 Universal Mail and Calendar** seems to store all information in the folder **%LOCALAPPDATA%\\Comms\\** I thought perhaps if I could get rid of (back it up just in case) this folder the app might recreate it.

### The Solution

1. Open an **Administrator PowerShell** prompt (enter "powershell" in the start menu search and then right click the **Windows PowerShell** icon and select **Run as Administrator,** you might need to confirm a UAC prompt).
1. Uninstall the **Windows 10 Universal Mail and Calendar** app:

    ```powershell
    Get-AppxPackage |
        Where-Object Name -eq 'microsoft.windowscommunicationsapps' |
        Remove-AppxPackage
    ```

    ![Uninstall the Windows 10 Universal Mail and Calendar App](/assets/images/screenshots/ss_powershell_uninstallcomms.png)

1. **@Stephen** suggests restarting your computer at this point.  
1. **Delete** the **%LOCALAPPDATA%\Comms\\** folder (back it up first if you want):

    ```powershell
    Remove-Item -Path "$Home\AppData\Local\Comms" -Recurse -Force
    ```

    ![Deleting the Comms folder – some files can't be deleted; this is OK](/assets/images/screenshots/ss_powershell_uninstallcommsdeletefiles.png)

    _Note: you’ll probably find that some files are in use and can’t be deleted – this is OK._

1. Reinstall the [**Windows 10 Universal Mail and Calendar app**](http://apps.microsoft.com/webpdp/app/64a79953-cf0b-44f9-b5c4-ee5df3a15c63) from the Microsoft Store.  
    ![Reinstall the Windows 10 Universal Mail and Calendar app from the Windows Store](/assets/images/screenshots/ss_powershell_reinstallcomms.png)

Once this had all been done I loaded the Mail up and it asked me to configure all my mail accounts again (and authorize them with the providers). After this the error message had gone away and all my accounts worked normally. I did also however have to re-enter my credentials for both Google Drive and One Drive.

For more information, suggestions and discussion about this issue, take a look at [this](http://answers.microsoft.com/en-us/insider/forum/insider_apps-insider_mail/universal-mail-app-your-account-settings-are-out/562f4fad-c60a-4204-a8c3-94fa1d05bf65) discussion on the Microsoft Community boards.

I hope this works for someone else as well.
