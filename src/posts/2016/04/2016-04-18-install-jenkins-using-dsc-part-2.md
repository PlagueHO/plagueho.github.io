---
title: "Install Jenkins using DSC – Part 2"
date: 2016-04-18
description: "A DSC configuration to install Jenkins on Windows Server Core."
tags:
  - "desired-state-configuration"
  - "dsc"
  - "jenkins"
  - "powershell"
---

In my [previous post](https://dscottraynsford.wordpress.com/2016/04/14/install-jenkins-on-windows-server-core-part-1/), I showed how to create a PowerShell script that would install a Jenkins CI Master server onto a Windows Server Core installation. The obvious next step for such a script was to convert it into a DSC configuration file.

In this post, I'm assuming WMF 5.0 is installed onto the server that will be converted into a Jenkins Master. You could manage this without WMF 5.0, but you'd need to manually install the DSC Resource modules that the configuration will use.

Once again, the full DSC Configuration script can be found at the end of the post.

## Requirements

You'll need:

- A physical or virtual machine running Windows Server 2012 R2 Core (or Full)—it should be a completely clean install with WMF 5.0 installed on it.
- An administrator login to the server.
- An internet connection to the server.

### Resource Modules

This DSC Configuration requires the use of three DSC Resources:

- **cChoco** - This community resource is used to install Chocolatey and Jenkins.
- **xNetworking** - This resource is used to configure the networking on the server if required.
- **PSDesiredStateConfiguration** - This resource comes with PowerShell by default and is used to provide the **Script** resource.

The easiest way to install these resource modules is by executing these commands on the Jenkins server:

```powershell
# Make sure the DSC Resource modules are downloaded
Install-Module -Name cChoco -Force
Install-Module -Name xNetworking -Force
```

However, if you're using a Pull server or compiling the DSC MOF on a development machine (rather than the Jenkins node), you would need to use other methods of ensuring the modules are available.

## The Configuration Components

The DSC Configuration needs to do the following things:

1. **Configure Networking** (optional)
2. **Install .NET 3.5 Framework**
3. **Install Chocolatey**
4. **Install JDK 8**
5. **Install Jenkins**
6. **Configure Jenkins Port** (optional)

### Configure Networking

I like to use the **xNetworking** DSC resource to configure the IPv4 and IPv6 settings on the network adapter to have a static configuration. However, you won't need to do this if you're using DHCP or manual configuration. Note, in my case, my adapter was called "Ethernet".

```powershell
xIPAddress IPv4_1 {
    InterfaceAlias = 'Ethernet'
    AddressFamily  = 'IPv4'
    IPAddress      = '192.168.128.20'
    SubnetMask     = '24'
}
xDefaultGatewayAddress IPv4G_1 {
    InterfaceAlias = 'Ethernet'
    AddressFamily  = 'IPv4'
    Address        = '192.168.128.19'
}
xDnsServerAddress IPv4D_1 {
    InterfaceAlias = 'Ethernet'
    AddressFamily  = 'IPv4'
    Address        = '192.168.128.10'
}
xIPAddress IPv6_1 {
    InterfaceAlias = 'Ethernet'
    AddressFamily  = 'IPv6'
    IPAddress      = 'fd53:ccc5:895a:bc00::14'
    SubnetMask     = '64'
}
xDefaultGatewayAddress IPv6G_1 {
    InterfaceAlias = 'Ethernet'
    AddressFamily  = 'IPv6'
    Address        = 'fd53:ccc5:895a:bc00::13'
}
xDnsServerAddress IPv6D_1 {
    InterfaceAlias = 'Ethernet'
    AddressFamily  = 'IPv6'
    Address        = 'fd53:ccc5:895a:bc00::a'
}
```

### Install .NET 3.5 Framework

Jenkins requires the .NET 3.5 Framework, so I'm going to use the WindowsFeature DSC Resource to install it:

```powershell
WindowsFeature NetFrameworkCore {
    Ensure = "Present"
    Name   = "NET-Framework-Core"
}
```

### Install Chocolatey

Next up, I'm going to use the **cChocoInstaller** resource in the **cChoco** resource module (available on PowerShell Gallery [here](https://www.powershellgallery.com/packages/cChoco)) to install the **Chocolatey** package manager:

```powershell
cChocoInstaller installChoco {
    InstallDir = "c:\choco"
    DependsOn  = "[WindowsFeature]NetFrameworkCore"
}
```

### Install JDK 8 and Jenkins

The **cChocoPackageInstaller** resource module is then used to install JDK 8 and Jenkins:

```powershell
# Install JDK8
cChocoPackageInstaller installJdk8 {
    Name      = "jdk8"
    DependsOn = "[cChocoInstaller]installChoco"
}

# Install Jenkins
cChocoPackageInstaller installJenkins {
    Name      = "Jenkins"
    DependsOn = "[cChocoInstaller]installChoco"
}
```

### Configure Jenkins Port

The last step of the configuration is optional. By default, Jenkins is configured to listen on port 8080; however, I want to change it to 80. So this next part uses the **Script** resource to change the `--httpPort` setting in the **Jenkins.xml** file. I use **Regex** to do this:

```powershell
Script SetJenkinsPort {
    SetScript = {
        Write-Verbose -Verbose "Setting Jenkins Port to $Using:JenkinsPort"
        $Config = Get-Content `
            -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml"
        $NewConfig = $Config `
            -replace '--httpPort=[0-9]*\s',"--httpPort=$Using:JenkinsPort "
        Set-Content `
            -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml" `
            -Value $NewConfig `
            -Force
        Write-Verbose -Verbose "Restarting Jenkins"
        Restart-Service `
            -Name Jenkins
    }
    GetScript = {
        $Config = Get-Content `
            -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml"
        $Matches = @([regex]::matches($Config, "--httpPort=([0-9]*)\s", 'IgnoreCase'))
        $CurrentPort = $Matches.Groups[1].Value
        Return @{
            'JenkinsPort' = $CurrentPort
        }
    }
    TestScript = { 
        $Config = Get-Content `
            -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml"
        $Matches = @([regex]::matches($Config, "--httpPort=([0-9]*)\s", 'IgnoreCase'))
        $CurrentPort = $Matches.Groups[1].Value
        
        If ($Using:JenkinsPort -ne $CurrentPort) {
            # Jenkins port must be changed
            Return $False
        }
        # Jenkins is already on correct port
        Return $True
    }
    DependsOn = "[cChocoPackageInstaller]installJenkins"
}
```

### Create the MOF

The final thing to do is download the cChoco and xNetworking DSC Resources, create the MOF, and then ask the LCM to apply it:

```powershell
$ConfigData = @{
    AllNodes = 
    @(
        @{
            NodeName = "LocalHost"
        }
    )
}

JENKINS_CI -JenkinsPort 80 -ConfigurationData $ConfigData

Start-DscConfiguration -Path .\JENKINS_CI -Wait -Verbose
```

## The Complete DSC Configuration

Here is the complete DSC Configuration file. You just need to copy it to the server and run it. It will compile the configuration into a MOF and tell the LCM to apply it. Just remember to ensure required DSC Resource modules are installed.

```powershell
Configuration JENKINS_CI {
    param (
        $JenkinsPort = 8080
    )
    Import-DscResource -ModuleName 'PSDesiredStateConfiguration'
    Import-DscResource -ModuleName 'cChoco'
    Import-DscResource -ModuleName 'xNetworking'

    Node $AllNodes.NodeName {
        # Configure networking (optional)
        xIPAddress IPv4_1 {
            InterfaceAlias = 'Ethernet'
            AddressFamily  = 'IPv4'
            IPAddress      = '192.168.128.20'
            SubnetMask     = '24'
        }
        xDefaultGatewayAddress IPv4G_1 {
            InterfaceAlias = 'Ethernet'
            AddressFamily  = 'IPv4'
            Address        = '192.168.128.19'
        }
        xDnsServerAddress IPv4D_1 {
            InterfaceAlias = 'Ethernet'
            AddressFamily  = 'IPv4'
            Address        = '192.168.128.10'
        }
        xIPAddress IPv6_1 {
            InterfaceAlias = 'Ethernet'
            AddressFamily  = 'IPv6'
            IPAddress      = 'fd53:ccc5:895a:bc00::14'
            SubnetMask     = '64'
        }
        xDefaultGatewayAddress IPv6G_1 {
            InterfaceAlias = 'Ethernet'
            AddressFamily  = 'IPv6'
            Address        = 'fd53:ccc5:895a:bc00::13'
        }
        xDnsServerAddress IPv6D_1 {
            InterfaceAlias = 'Ethernet'
            AddressFamily  = 'IPv6'
            Address        = 'fd53:ccc5:895a:bc00::a'
        }
        
        # Install .NET 3.5
        WindowsFeature NetFrameworkCore {
            Ensure = "Present"
            Name   = "NET-Framework-Core"
        }

        # Install Chocolatey
        cChocoInstaller installChoco {
            InstallDir = "c:\choco"
            DependsOn  = "[WindowsFeature]NetFrameworkCore"
        }

        # Install JDK8
        cChocoPackageInstaller installJdk8 {
            Name      = "jdk8"
            DependsOn = "[cChocoInstaller]installChoco"
        }

        # Install Jenkins
        cChocoPackageInstaller installJenkins {
            Name      = "Jenkins"
            DependsOn = "[cChocoInstaller]installChoco"
        }

        # Set the Jenkins Port
        Script SetJenkinsPort {
            SetScript = {
                Write-Verbose -Verbose "Setting Jenkins Port to $Using:JenkinsPort"
                $Config = Get-Content `
                    -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml"
                $NewConfig = $Config `
                    -replace '--httpPort=[0-9]*\s',"--httpPort=$Using:JenkinsPort "
                Set-Content `
                    -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml" `
                    -Value $NewConfig `
                    -Force
                Write-Verbose -Verbose "Restarting Jenkins"
                Restart-Service `
                    -Name Jenkins
            }
            GetScript = {
                $Config = Get-Content `
                    -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml"
                $Matches = @([regex]::matches($Config, "--httpPort=([0-9]*)\s", 'IgnoreCase'))
                $CurrentPort = $Matches.Groups[1].Value
                Return @{
                    'JenkinsPort' = $CurrentPort
                }
            }
            TestScript = { 
                $Config = Get-Content `
                    -Path "${ENV:ProgramFiles(x86)}\Jenkins\Jenkins.xml"
                $Matches = @([regex]::matches($Config, "--httpPort=([0-9]*)\s", 'IgnoreCase'))
                $CurrentPort = $Matches.Groups[1].Value
                
                If ($Using:JenkinsPort -ne $CurrentPort) {
                    # Jenkins port must be changed
                    Return $False
                }
                # Jenkins is already on correct port
                Return $True
            }
            DependsOn = "[cChocoPackageInstaller]installJenkins"
        }
    }
}

$ConfigData = @{
    AllNodes = 
    @(
        @{
            NodeName = "LocalHost"
        }
    )
}

JENKINS_CI -JenkinsPort 80 -ConfigurationData $ConfigData

Start-DscConfiguration -Path .\JENKINS_CI -Wait -Verbose
```

Within five to ten minutes, the Jenkins server will be configured and ready to go.
