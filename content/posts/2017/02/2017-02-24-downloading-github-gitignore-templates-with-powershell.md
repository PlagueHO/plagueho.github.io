---
title: "Downloading GitHub .GitIgnore templates with PowerShell"
date: "2017-02-24"
categories:
  - "github"
tags:
  - "powershell"
---

This will be a relatively short post today to get be back into the blogging rhythm. Most of my time has been spent of late working on the DSC Resource Kit adding [code coverage reporting](https://codecov.io/gh/PlagueHO/xNetworking/) and new xCertificate features.

So, today's post shows how you can use some simple PowerShell code to pull down the list of [.gitIgnore templates from GitHub](https://github.com/github/gitignore) and then retrieve the one I wanted. There are lots of different ways I could have done this, but I decided to use the [GitHub REST API](https://developer.github.com/v3/gitignore/).

First up, lets get the list of available _.gitIgnore templates:_

\[gist\]55330104b449cd78c4d1a00450cccffb\[/gist\]

This will get the list of _.GitIgnore templates_ to an array variable called **$templateList**. I could then display the list to a user:

![ss_ghgi_getgitignoretemplates](/images/ss_ghgi_getgitignoretemplates.png)

Now, all I need to do is to download the named _.gitIgnore Template_ to a folder:

\[gist\]f9e6ba57407f7974063c48a20d65fe88\[/gist\]

This will download the **VisualStudio** _.giIgnore_ template and save it with the filename **.gitignore** to the current folder.

![ss_ghgi_getgitignorefile](/images/ss_ghgi_getgitignorefile.png)

I could have specified a different _.gitIgnore template_ by changing the **VisualStudio** in the URL to another template that appears in the **$templateList**.

You might have noticed that I included the **\-UseBasicParsing** parameter in the **Invoke-WebRequest** call. This is to ensure the cmdlet works on machines that don't have Internet Explorer installed - e.g. Nano Server or Linux/OSX. I haven't tried this on PowerShell running on Linux or OSX, but I can't see any reason why it wouldn't work on those OS's.

The next steps for this code might be to get these included as some new cmdlets in [Trevor Sullivan's](https://twitter.com/pcgeek86) [PSGitHub PowerShell Module](https://github.com/pcgeek86/PSGitHub). You can download his module from the [PowerShell Gallery](https://www.powershellgallery.com/packages/PSGitHub) if you're not familiar with it.

Thanks for reading.

