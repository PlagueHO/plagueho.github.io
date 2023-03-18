---
title: "Allow PowerShell to Traverse a Secure Proxy"
date: "2016-06-24"
tags: 
  - "powershell"
  - "proxy"
coverImage: "fi_useproxy.png"
---

One of the first things I like to do when setting up my development machine in a new environment is to update PowerShell help with the **update-help** cmdlet. After that, I will then go and download a slew of modules from the [PowerShell Gallery](http://www.powershellgallery.com/).

However, recently I needed to set up my development machine on an environment that is behind an internet proxy that requires authentication. This meant that a lot of PowerShell cmdlets can't be used because they don't have support for traversing a proxy - or at least, not one that requires authentication. Take the aforementioned **update-help** and **install-module** cmdlets - I just couldn't do with out these.

So I set about trying to find a way around this. So after lots of googling and trial and error (and also getting my Active Directory account locked out on more than one occasion) I came up with a solution.

Basically it requires using the **NETSH** command to configure the proxy settings and then configure the web client with my proxy credentials (which were AD integrated):

\[gist\]9f71fd855ce7d4c6100921fb7ffc9c4a\[/gist\]

The code I needed to traverse the proxy could then be executed. Once it has completed the task using the proxy I would then reset it back to the default state (using settings from internet explorer):

\[gist\]c26fc9cacb10891d473680b4c18aad3b\[/gist\]

After using this a bit I thought it would be great to turn it into a function that I could just call, passing a script block that I wanted to be able to traverse the proxy with. So I came up with this:

\[gist\]6fdbd56618b7d7ca88ad11248dc0951a\[/gist\]

To use this script, simply save it as a PS1 file (e.g. Use-Proxy.ps1), customizing the default proxy URL if you like and then dot source the file. Once it has been dot sourced it can be called, optionally passing the URL of the proxy server and credentials to use to authenticate to it:

\[gist\]d6fc7f2922898a24e7f13838bb19fddc\[/gist\]

If you don't pass any credentials, you will be prompted to enter them. I also added some code into this function so that you can specify a global variable containing the credentials to use to traverse the proxy. This can save on lots of typing, but might be frowned upon by your security team.

Finally, I also added the proxy reset code into the **finally** block of a **try**...**catch** to ensure that if the code in the script block throws an error the proxy will be reset. In my case I also loaded this function into a PowerShell module that can be distributed to other team members.

Happy proxy traversing!

