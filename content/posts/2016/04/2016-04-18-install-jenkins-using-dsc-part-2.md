---
title: "Install Jenkins using DSC – Part 2"
date: "2016-04-18"
categories:
  - "desired-state-configuration"
  - "dsc"
  - "jenkins"
tags:
  - "powershell"
---

In my [previous post](https://dscottraynsford.wordpress.com/2016/04/14/install-jenkins-on-windows-server-core-part-1/) I showed how to create a PowerShell script that would install a Jenkins CI Master server onto a Windows Server Core installation. The obvious next step for such a script was to convert it into a DSC configuration file.

In this post I'm assuming WMF 5.0 is installed onto the server that will be converted into a Jenkins Master. You could manage this without WMF 5.0, but you'd need to manually install the DSC Resource modules that the configuration will use.

Once again, the full DSC Configuration script can be found at the end of the post.

## Requirements

You'll need:

- A physical or virtual machine running Windows Server 2012 R2 Core (or Full) - it should be a completely clean install with WMF 5.0 installed on it.
- An administrator login to the server.
- An internet connection to the server.

### Resource Modules

This DSC Configuration requires the use of three DSC Resources:

- **cChoco** - this community resource is used to install Chocolatey and Jenkins.
- **xNetworking** - this resource is used to configure the networking on the server if required.
- **PSDesiredStateConfiguration** - this resource comes with PowerShell by default and is used to provide the **Script** resource.

The easiest way to install these resource modules is by executing these commands on the Jenkins server:

\[sourcecode language="powershell"\] # Make sure the DSC Resource modules are downloaded Install-Module -Name cChoco -Force Install-Module -Name xNetworking -Force \[/sourcecode\]

However, if you're using a Pull server or compiling the DSC MOF on a development machine (rather than the Jenkins node) you would need to use other methods of ensuring the modules are available.

## The Configuration Components

The DSC Configuration needs to do the following things:

- **Configure Networking** (optional)
- **Install .NET 3.5 Framework**
- **Install Chocolatey**
- **Install JDK 8**
- **Install Jenkins**
- **Configure Jenkins Port** (optional)

### Configure Networking

I like to use the **xNetwoking** DSC resource to configure the IPv4 and IPv6 settings on the Network adapter to have a static configuration. However, you won't need to do this if you're using DHCP or manual configuration. Note, in my case my adapter was called "Ethernet".

\[sourcecode language="powershell"\] xIPAddress IPv4\_1 { InterfaceAlias = 'Ethernet' AddressFamily = 'IPv4' IPAddress = '192.168.128.20' SubnetMask = '24' } xDefaultGatewayAddress IPv4G\_1 { InterfaceAlias = 'Ethernet' AddressFamily = 'IPv4' Address = '192.168.128.19' } xDnsServerAddress IPv4D\_1 { InterfaceAlias = 'Ethernet' AddressFamily = 'IPv4' Address = '192.168.128.10' } xIPAddress IPv6\_1 { InterfaceAlias = 'Ethernet' AddressFamily = 'IPv6' IPAddress = 'fd53:ccc5:895a:bc00::14' SubnetMask = '64' } xDefaultGatewayAddress IPv6G\_1 { InterfaceAlias = 'Ethernet' AddressFamily = 'IPv6' Address = 'fd53:ccc5:895a:bc00::13' } xDnsServerAddress IPv6D\_1 { InterfaceAlias = 'Ethernet' AddressFamily = 'IPv6' Address = 'fd53:ccc5:895a:bc00::a' } \[/sourcecode\]

### Install .NET 3.5 Framework

Jenkins requires the .NET 3.5 Framework, so I'm going to use the WindowsFeature DSC Resource to install it:

\[sourcecode language="powershell"\] WindowsFeature NetFrameworkCore { Ensure = "Present" Name = "NET-Framework-Core" } \[/sourcecode\]

### Install Chocolatey

Next up, I'm going to use the **cChocoInstaller** resource in the **cChoco** resource module (available on PowerShell Gallery [here](https://www.powershellgallery.com/packages/cChoco)) to install the **Chocolatey** package manager:

\[sourcecode language="powershell"\] # Install Chocolatey cChocoInstaller installChoco { InstallDir = "c:\\choco" DependsOn = "\[WindowsFeature\]NetFrameworkCore" } \[/sourcecode\]

### Install JDK 8 and Jenkins

The **cChocoPackageInstaller** resource module is the used to install JDK 8 and Jenkins

\[sourcecode language="powershell"\] # Install JDK8 cChocoPackageInstaller installJdk8 { Name = "jdk8" DependsOn = "\[cChocoInstaller\]installChoco" }

\# Install Jenkins cChocoPackageInstaller installJenkins { Name = "Jenkins" DependsOn = "\[cChocoInstaller\]installChoco" } \[/sourcecode\]

### Configure Jenkins Port

The last step of the configuration is optional. By default Jenkins is configured to listen on port 8080, however I want to change it to 80. So this next part uses the **Script** resource to change the "--httpPort" setting in the **Jenkins.xml** file. I use **Regex** to do this:

\[sourcecode language="powershell"\] # Set the Jenkins Port Script SetJenkinsPort { SetScript = { Write-Verbose -Verbose "Setting Jenkins Port to $Using:JenkinsPort" $Config = Get-Content \` -Path "${ENV:ProgramFiles(x86)}\\Jenkins\\Jenkins.xml" $NewConfig = $Config \` -replace '--httpPort=\[0-9\]\*\\s',"--httpPort=$Using:JenkinsPort " Set-Content \` -Path "${ENV:ProgramFiles(x86)}\\Jenkins\\Jenkins.xml" \` -Value $NewConfig \` -Force Write-Verbose -Verbose "Restarting Jenkins" Restart-Service \` -Name Jenkins } GetScript = { $Config = Get-Content \` -Path "${ENV:ProgramFiles(x86)}\\Jenkins\\Jenkins.xml" $Matches = @(\[regex\]::matches($Config, "--httpPort=(\[0-9\]\*)\\s", 'IgnoreCase')) $CurrentPort = $Matches.Groups\[1\].Value Return @{ 'JenkinsPort' = $CurrentPort } } TestScript = { $Config = Get-Content \` -Path "${ENV:ProgramFiles(x86)}\\Jenkins\\Jenkins.xml" $Matches = @(\[regex\]::matches($Config, "--httpPort=(\[0-9\]\*)\\s", 'IgnoreCase')) $CurrentPort = $Matches.Groups\[1\].Value

If ($Using:JenkinsPort -ne $CurrentPort) { # Jenkins port must be changed Return $False } # Jenkins is already on correct port Return $True } DependsOn = "\[cChocoPackageInstaller\]installJenkins" } \[/sourcecode\]

### Create the MOF

The final thing to do is download the cChoco and xNetworking DSC Resources,create the MOF and then ask the LCM to apply it:

\[sourcecode language="powershell"\] $ConfigData = @{ AllNodes = @( @{ NodeName = "LocalHost" } ) }

JENKINS\_CI -JenkinsPort 80 -ConfigurationData $ConfigData

Start-DscConfiguration -Path .\\JENKINS\_CI -Wait -Verbose \[/sourcecode\]

## The Complete DSC Configuration

Here is the complete DSC Configuration file. You just need to copy it to the Server and run it. It will compile the configuration into a MOF and tell the LCM to apply it. Just remember to ensure required DSC Resource modules are installed.

{{< gist PlagueHO c883691c32c04e8404f2354910e86f47 >}}

Within five to ten minutes the Jenkins server will be configured and ready to go.

