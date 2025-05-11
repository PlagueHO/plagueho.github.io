---
title: "Windows Distributed File System DSC Resource"
date: 2015-10-10
description: "A DSC Resource for configuring Windows Distributed File System Replication Groups."
tags:
  - "desired-state-configuration"
  - "distributed-file-system"
  - "powershell"
isArchived: true
---

### Introduction

While studying for my MS 70.411 exam, I found that one way of getting a good understanding of a feature is to perform as many feature tasks as possible using PowerShell. One especially useful way of doing this for me was to implement a _DSC resource_ for the feature. So, this week the feature was [Distributed File System Replication Groups](https://technet.microsoft.com/en-us/library/jj127250.aspx). I'll refer to _Distributed File Systems_ as **DFS** in future to save typing.

Note: I am going to implement **DFS Namespaces** as well, but that will be left to next week.

**Update**: After releasing this version I had an idea for some improvements to simplify this resource. See the details [here](/blog/distributed-file-system-dsc-resource-update/).

### Node vs. Active Directory

The first thing to note with implementing a DSC resource for Windows Distributed File System is that the resource is actually setting the Desired State of Active Directory elements rather than that of a Node. What that means is that when you use the PowerShell (or Management Console) to manage **Windows DFS Replication Groups** or **DFS Namespaces** you're actually configuring items in the _Active Directory database_ - you're not changing anything on the actual node/computer you're running the commands on.

This means that a DSC Resource for configuring **Windows DFS** could be run on any computer within the AD Domain. This is actually very handy as it turns out. At first though, I wasn't sure DSC should be used for configuring elements that aren't actually on a Node/Computer, but I couldn't see why not, and then I remembered that there are other resources that do this ([xActiveDirectory](https://github.com/PowerShell/xActiveDirectory) for example).

### Server Core Not Supported

The first problem I ran into when implementing this DSC Resource is that you **can't** install the DFS Replication (DFSR) PowerShell module onto a **Windows Server Core** installation. This is because the **PowerShell DFSR** **module** is _only_ installed with the **DFS Management Tools** feature, which requires a **Full Server install** (or at least the _Graphical Management Tools and Infrastructure feature_).

[![This feature is required to enable the DFSR PowerShell Module.](/assets/images/screenshots/ss_dfs_installmanagementtools.png)](/assets/images/screenshots/ss_dfs_installmanagementtools.png)
This feature is required to enable the DFSR PowerShell Module.

This isn't the end of the world, but it is annoying because all my file servers are Server Core. Therefore I'd need to run this resource on a **node** with a **Full Server** **install** that is also **part of the AD Domain.** So it is great that this resource can be run on any Full Server install (or even a Desktop with RSAT).

### Setting AD Credentials

Because this resource calls PowerShell CmdLets that interact with the **AD Database**, **AD credentials** need to be supplied that can have the _appropriate permissions_. This means that the **PSDSCRunAsCredential** property must be set for each resource entry, which in turn means this Resource **can only be used on nodes with Windows Management Framework 5.0 (WMF 5.0) or greater installed**. If you're not familiar with this property, see [this link](http://blogs.msdn.com/b/powershell/archive/2015/07/06/validate-powershell-dsc-runascredential.aspx).

### Installing the Resource

Because this resource requires **WMF 5.0** you can just download this directly from the [PowerShell Gallery](https://www.powershellgallery.com/) by running this command:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\10\2015-10-10-windows-distributed-file-system-dsc-resource.md
Install-Module -Name cDFS
```

### Using the Resource

The following example creates a **DFS Replication Group** called **Public** containing two members, **FileServer1** and **FileServer2**. The **Replication Group** contains a single folder called **Software**. A description will be set on the **Software** folder and it will be set to exclude the directory **Temp** from replication.

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\10\2015-10-10-windows-distributed-file-system-dsc-resource.md
configuration Sample_cDFSRepGroup {
    Import-DscResource -Module cDFS

    Node $NodeName {
        [PSCredential]$Credential = New-Object System.Management.Automation.PSCredential (
            "CONTOSO.COM\Administrator",
            (ConvertTo-SecureString "MyP@ssw0rd!1" -AsPlainText -Force)
        )

        # Install the Prerequisite features first
        # Requires Windows Server 2012 R2 Full install
        WindowsFeature RSATDFSMgmtConInstall {
            Ensure = "Present"
            Name   = "RSAT-DFS-Mgmt-Con"
        }

        # Configure the Replication Group
        cDFSRepGroup RGPublic {
            GroupName            = 'Public'
            Description          = 'Public files for use by all departments'
            Ensure               = 'Present'
            Members              = 'FileServer1','FileServer2'
            Folders              = 'Software'
            PSDSCRunAsCredential = $Credential
            DependsOn            = "[WindowsFeature]RSATDFSMgmtConInstall"
        }

        cDFSRepGroupConnection RGPublicC1 {
            GroupName                = 'Public'
            Ensure                   = 'Present'
            SourceComputerName       = 'FileServer1'
            DestinationComputerName  = 'FileServer2'
            PSDSCRunAsCredential     = $Credential
        }

        cDFSRepGroupConnection RGPublicC2 {
            GroupName                = 'Public'
            Ensure                   = 'Present'
            SourceComputerName       = 'FileServer2'
            DestinationComputerName  = 'FileServer1'
            PSDSCRunAsCredential     = $Credential
        }

        cDFSRepGroupFolder RGSoftwareFolder {
            GroupName                = 'Public'
            FolderName               = 'Software'
            Description              = 'DFS Share for storing software installers'
            DirectoryNameToExclude   = 'Temp'
            PSDSCRunAsCredential     = $Credential
            DependsOn                = '[cDFSRepGroup]RGPublic'
        }

        cDFSRepGroupMembership RGPublicSoftwareFS1 {
            GroupName                = 'Public'
            FolderName               = 'Software'
            ComputerName             = 'FileServer1'
            ContentPath              = 'd:\Public\Software'
            PrimaryMember            = $true
            PSDSCRunAsCredential     = $Credential
            DependsOn                = '[cDFSRepGroupFolder]RGSoftwareFolder'
        }

        cDFSRepGroupMembership RGPublicSoftwareFS2 {
            GroupName                = 'Public'
            FolderName               = 'Software'
            ComputerName             = 'FileServer2'
            ContentPath              = 'e:\Data\Public\Software'
            PSDSCRunAsCredential     = $Credential
            DependsOn                = '[cDFSRepGroupFolder]RGPublicSoftwareFS1'
        }
    }
}
```

### Example Breakdown

The resource usage hopefully is fairly straight forward and the Module itself contains documentation in the **Readme.md** (you can also see it [here](https://github.com/PlagueHO/cDFS/blob/master/README.md)). But I'll provide a quick breakdown of the resources just in case.

#### WindowsFeature RSATDFSMgmtConInstall

Install the Windows Feature that is required to use this DSC Resource. It installs the **Windows DFSR/DFSN PowerShell Modules**.

#### cDFSRepGroup

This resource creates, configures or removes a **DFS Replication Group**. You should specify both the **Members** and the **Folders** that are in this Replication Group. Both of these properties take an array of strings so you can specify more than one member (not much of a Distributed File System without that right?) and more than one folder. You of course also need to specify a **DFS Replication Group Name**.

This resource also contains an optional **Topology** parameter that defaults to **Manual**. If this parameter is set to **Fullmesh** then a **Full Mesh** connection topology will be configured automatically for this **Replication Group**, based on the members specified in the resource.

#### cDFSRepGroupConnection

This is an optional resource that allows the **Replication Group Connections** to be defined manually. I used the above example, so that it was obvious how they should be used. It allows a **Replication Group Connection** to be defined for a **Replication Group** between two members. A description can also be set on each connection. The connections can be disabled and also have RDC (Remote Differential Compression) disabled.

**Note:** this resource should only be used if the **Topology** parameter of the **cDFSRepGroup** resource is set to **Manual** (which is the default). If you set the **Topology** parameter to **Fullmesh**, a set of **Replication Group Connections** will automatically be created in a **Full Mesh** structure. The **Hub and Spoke** structure is not currently supported but may be in the future.

#### cDFSRepGroupFolder

This is an optional resource that can be used to configure specific properties of any of the folders in a **DFS Replication Group**. It is **not** used to create a folder within the **Replication Group**, that is the job of the _cDFSRepGroup_ resource. This job of this resource is to configure the following properties of a **Replication Group Folder**:

- **Description**
- **FilenameToExclude** - if this is not specified the default value that DFS assigns is automatically used.
- **DirectoryNameToExclude** - if this is not specified the default value that DFS assigns is automatically used.

#### cDFSRepGroupMembership

This resource is used to configure the actual _content folders_ on each member of the **Replication Group Folder**. An instance of this resource should be used for each combination of **member** and **folder** in a **Replication Group** to set the **Content Folder**. It can also be used to set the following optional properties:

- **StagingPath** - this can be used to override the default staging path. Usually this should be left to the default.
- **ReadOnly** - this property can be used to make this content folder read only.
- **PrimaryMember** - this property allows a **Primary Member** of the replication group to be set. At least one member of each Replication Group folder **must** set as the **Primary Member** otherwise initial replication will never take place.

#### Common Parameters

There are a couple of parameters that are common to each resource:

- **GroupName** - this is the name of the **Replication Group**.
- **Domain** - this is the name of the AD Domain this **Replication Group** is part of. If not specified then the AD Domain that the computer that is running the config is part of is used. Usually it should not be specified.

### Summary

Well, there is not much more to say about this. Hopefully someone finds it useful. I intend to add **DFS Namespace** support over the next week or so, so if you're needing that, keep an eye out.

### Feedback

If you're interested in contributing to this resource, providing feedback or raising issues or requesting features, please feel free (anything is appreciated). You'll find the resource GitHub repository [here](https://github.com/PlagueHO/cDFS) where you can fork, issue pull requests and raise issues/feature requests.
