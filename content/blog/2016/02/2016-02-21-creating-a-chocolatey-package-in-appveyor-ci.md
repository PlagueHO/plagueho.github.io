---
title: "Creating a Chocolatey Package in AppVeyor CI"
date: "2016-02-21"
categories:
  - "appveyor"
  - "chocolatey"
  - "continuous-integration"
tags:
  - "devops"
coverImage: "fi_chocolatey.jpg"
---

## Introduction

Recently I had a need to have an application published in [Chocolatey](http://www.chocolatey.org/). If you're not familiar with Chocolatey, it is:

> a Machine Package Manager, somewhat like apt-get, but built with Windows in mind.

The application I needed to package was actually a Microsoft tool called [DevCon.exe](https://msdn.microsoft.com/en-us/library/windows/hardware/ff544707%28v=vs.85%29.aspx) and is available freely from Microsoft as part of the [Windows Driver Kit](https://msdn.microsoft.com/en-us/windows/hardware/hh852365) (WDK). The WDK is a massive 2.5GB download, and I needed this one tiny (80kb) executable to be automatically installed and used as part of some Integration tests for another project using [AppVeyor CI](http://www.appveyor.com/). Forcing AppVeyor CI to download and install a 2.5GB WDK just so some integration tests could be run was unreasonable and unworkable.

_If you are interested: the reason I needed DevCon.exe was to be able to automatically create Microsoft Loopback Adapters for use in testing some functions of the [xNetworking DSC resource](https://github.com/PowerShell/xNetworking). I did this by creating a [PowerShell LoopbackAdapter Module](https://www.powershellgallery.com/packages/LoopbackAdapter/1.0.0.16) that automatically downloads and installs this Chocolatey package._

 

## The Package

If you fancy skipping the details of the process and just want to jump in and have a look at the project, you [can find it on GitHub](https://github.com/PlagueHO/devcon-choco-package).

The package is fairly simple. It just contains a few files:

1. **AppVeyor.yml** - this is the AppVeyor CI definition file that tells AppVeyor how to build this project.
2. **Readme.md** - some details about this project.
3. **devcon.portable\\DevCon32.exe** - a 32-bit version of the **DevCon.exe** copied straight out of the **WDK**.
4. **devcon.portable\\DevCon64.exe** - a 64-bit version of the **DevCon.exe** copied straight out of the **WDK**.
5. **devcon.portable\\devcon.portable.nuspec** - this is the [nuspec package manifest](https://docs.nuget.org/create/nuspec-reference) file I created for this package.

![ss_devconchoco_filestructure](/images/ss_devconchoco_filestructure.png)

The really important files here are **AppVeyor.yml** and **devcon.portable.nuspec**. So I'll cover those in a bit more detail.

 

## Compiling DevCon from Source

The source code for the DevCon application is actually available [Microsoft's own GitHub repository](https://github.com/Microsoft/Windows-driver-samples). So in my original version of this project I was actually using AppVeyor to clone this source code and then compile the application using **MSBuild** as part of the packaging process. This worked really well, but the problem was that the purpose of Chocolatey is to actually install applications that can be validated as being from a trusted source.

What this means is that if I can't prove that the **DevCon32.exe** and **DevCon64.exe** files that are in the Chocolatey package are the ones provided by Microsoft then Chocolatey (will rightly) reject the package.

So if AppVeyor CI compiles the DevCon every time the package is built then the bits won't match those in the WDK. So unfortunately I had to disable this step in the process and include the **DevCon32.exe** and **DevCon64.exe** files copied straight out of the WDK. That way the team at **Chocolatey** can use the hashes of the files to ensure that they are the same ones in the WDK.

I have however left the compile step in the AppVeyor CI build even though the compiled executable files are not being used anymore.

 

## Devcon.Portable.Nuspec

This is the **Chocolatey** manifest file for the package. It is really just an XML file that contains the details of your package. To create it I just made a copy of the [template manifest file](https://github.com/chocolatey/chocolateytemplates/blob/master/_templates/chocolatey/__NAME__.nuspec), named it **devcon.portable.nuspec** and filled in the details.

Alternately, if you have **Chocolatey** installed, you can run (from PowerShell or CMD):

{{< gist PlagueHO fe0c3c1e2f91c16a2818 >}}

This will create a new folder called **devcon.portable** with a file **devcon.portable**.**nuspec** in it. You can then just customize the **devcon.portable**.**nuspec** with the details of the package. I also deleted the **tools** folder that was created as I had no need for that.

In my case I ended up with this:

{{< gist PlagueHO 360ae5e7d0b82d651158 >}}

 

#### Why "Portable"?

Most **Chocolatey** packages are designed to automatically download installers from the application creator themselves and install the app silently using the installer. But in our case this is unworkable (2.5GB download). So we need to include the application executables in the package itself and we need them to end up in our %PATH% so they can be found.

To enable this, **Chocolatey** has implemented a feature where packages that contain the **.portable** extension will automatically have the contained executables into a special folder called the **Chocolatey Tools Folder**. This folder is always in the system path.

For more information on .portable packages, see [this page](https://github.com/chocolatey/choco/wiki/ChocolateyFAQs#portable-application--something-that-doesnt-require-a-system-install-to-use).

 

## AppVeyor.YML

The **AppVeyor.yml** file looks like this:

{{< gist PlagueHO 46b8f4e4d87b5c42b205 >}}

The key part of this file is in the **deploy\_script** section:

{{< gist PlagueHO 3da1dec0d56d7e1e3650 >}}

The first line changes to the folder containing the **devcon.portable.nuspec** and **devcon\*.exe** files.

The second line sets the version number in the **devcon.portable.nuspec** package manifest to match the current AppVeyor version number.

The third line creates the package using the **cpack** tool.

The last line pushes the completed package to AppVeyor CI as an **artifact** that we can then download and submit to **Chocolatey**:

![ss_devconchoco_appveyorciartifacts](/images/ss_devconchoco_appveyorciartifacts.png)

It is probably possible to have AppVeyor CI automatically submit the package to **Chocolatey** on my behalf, but I didn't want that in this case. But if you're planning on doing that, you'll want to ensure you use the AppVeyor **Encrypt Data** tool to encrypt any **Chocolatey** credentials that your AppVeyor.yml file might use - otherwise your **Chocolatey** credentials are available for the world to see and **abuse**. This would be very bad indeed!

 

#### The Old Build

I have left in the original commands that pull the **DevCon** repository from GitHub and then compile it using **MSBuild**. The commands relating to this can be found in the **build\_script** and **install** sections of the **AppVeyor.yml** file.

 

## Final Thoughts

Hopefully this post might help you package up some of your own tools to use distribute with **Chocolatey** for easy installation or for use with CI services such as AppVeyor.

If you want some more information on using **Chocolatey** with PowerShell, check out [this blog post](https://blogs.technet.microsoft.com/heyscriptingguy/2014/08/23/weekend-scripter-powershell-and-chocolatey/).

