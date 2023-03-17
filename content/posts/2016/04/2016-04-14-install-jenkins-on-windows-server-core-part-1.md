---
title: "Install Jenkins on Windows Server Core - Part 1"
date: "2016-04-14"
categories: 
  - "desired-state-configuration"
  - "jenkins"
tags: 
  - "powershell"
  - "windows-server-core"
---

I'll admit it- I love Windows Server Core and I use it whenever possible. I think everyone should try and do the same. However, I know not everyone is a PowerShell expert or has any desire to be one.

So for this blog post I'm going to show how I created a simple script that will install [Jenkins CI](https://jenkins.io/) on a **Windows Server Core** system to be a **Jenkins Master server**. Feel free to just skip down to the end and use the completed script if you want to. I did this on a **Windows Server 2012 R2 Core** system, but this would probably work on **Windows Server 2016 TP4** (the currently available version). You could of course use this on a **Windows Server Full** system as well.

_Note: Installing a Windows Server Core as a **Jenkins Slave server** is a similar process but there is no need to install the Jenkins Server software or service. I won't cover the process of installing a Windows Jenkins Slave in this post._

This is post is part one of a two part post. In the part two I'll convert the process over to a **DSC configuration** that can be applied to one or more nodes to make the process even easier and ensure your Jenkins servers maintain their state.

## Requirements

You'll need:

- A physical or virtual machine running Windows Server 2012 R2 Core (or Full) - it should be a completely clean install with nothing already installed.
- An administrator login to the server.
- An internet connection to the server.

## The Script

The first thing I like to do is get all the variables into one place so I can easily see what options I might want to set. In this case the only thing I care about is setting a static IP Address details of the server and also the port Jenkins will be assigned to:

 

\[sourcecode language="powershell"\] # Configure the settings to use to setup this Jenkins Executor $Port = 80 $IPAddress = '192.168.1.96' $SubnetPrefixLength = 24 $DNSServers = @('192.168.1.1') $DefaultGateway = '192.168.1.1' \[/sourcecode\]

The next thing I need to do is ensure the **.NET Framework v3.5** is installed (required by Jenkins on Windows):

\[sourcecode language="powershell"\] # Install .NET Framework 3.5 Install-WindowsFeature -Name NET-Framework-Core \[/sourcecode\]

For this installation I'm actually going to let the [Chocolatey](https://chocolatey.org/) package manager do most of the heavy lifting of actually downloading and installing the Jenkins bits. So I need to install **Chocolatey**:

\[sourcecode language="powershell"\] # Install Chocolatey iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1')) \[/sourcecode\] Next up, I use **Chocolatey** to install both the **Oracle JDK 8** and the **Jenkins** bits. These will be downloaded off the internet so may take a little while depending on your connection. The **\-y** parameter forces the install to occur without prompting:

\[sourcecode language="powershell"\] # Install Chocolatey # Install JDK 8 choco install jdk8 -y

\# Install Jenkins using Chocolatey choco install Jenkins -y \[/sourcecode\]

What I'm going to do next is configure the port Jenkins should run on. This is done by changing the **\--httpPort** setting in the **c:\\program files (x86)\\Jenkins\\Jenkins.xml** file. I'll use a simple **RegEx** to do this. Also, because the **Jenkins Service** is already running at this point I'll need to restart it before the changed setting will be read:

\[sourcecode language="powershell"\] # Set the port Jenkins uses $Config = Get-Content \` -Path &quot;${ENV:ProgramFiles(x86)}\\Jenkins\\Jenkins.xml&quot; $NewConfig = $Config \` -replace '--httpPort=\[0-9\]\*\\s',&quot;--httpPort=$Port &quot; Set-Content \` -Path &quot;${ENV:ProgramFiles(x86)}\\Jenkins\\Jenkins.xml&quot; \` -Value $NewConfig \` -Force Restart-Service \` -Name Jenkins \[/sourcecode\]

The Chocolatey Jenkins package automatically configures a firewall rule named "Jenkins" that allows inbound traffic to the Java.exe application. This means that external machines will be able to connect to this Jenkins server. You may want to change this by removing the "Jenkins" firewall rule and replace it with something more specific to your needs, however I didn't do this in my script.

The final section is optional - it just configures the network connection on the machine to use a static IP address. You could omit this section completely if you were using DHCP or some other method of configuring the network connection:

\[sourcecode language="powershell"\] # Set a static IP Address - optional New-NetIPAddress \` -IPAddress $IPAddress \` -InterfaceAlias Ethernet \` -DefaultGateway $DefaultGateway \` -AddressFamily IPv4 \` -PrefixLength $SubnetPrefixLength Set-DnsClientServerAddress \` -InterfaceAlias Ethernet \` -Addresses $DNSServers \[/sourcecode\]

That's all there is to it**.**

## The Complete Script

Here is the complete script. You can just fire up PowerShell on the Core server and copy/paste this directly into the PowerShell console, or use some other method of running it:

\[gist\]0691483fa1be4b9e79cc7d078b3e1bb2\[/gist\]

Tomorrow I'll improve on this process by converting it into a **DSC configuration**, which will ensure the Jenkins Server maintains it's state and makes provisioning them even easier.

Thanks for reading.
