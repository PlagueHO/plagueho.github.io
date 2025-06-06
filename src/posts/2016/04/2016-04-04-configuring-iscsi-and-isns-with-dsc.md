---
title: "Configuring iSCSI and iSNS with DSC"
date: 2016-04-04
description: "Configuring iSCSI and iSNS with DSC"
tags:
  - "dsc"
  - "iscsi"
  - "isns"
  - "desired-state-configuration"
  - "powershell"
isArchived: true
---

Several months back I created a [DSC Resource](https://www.powershellgallery.com/packages/ciSCSI) for configuring **iSCSI Server Targets** (including Virtual Disks) as well as **iSCSI Initiators** using **Desired State Configuration (DSC)**. I created this for several reasons:

1. I needed a way for [LabBuilder](https://github.com/PlagueHO/LabBuilder) to automatically build Scale-Out File Servers (with CSVs).
1. I needed something to use as an example in my [Creating Professional DSC Resources](https://dscottraynsford.wordpress.com/2015/12/14/creating-professional-dsc-resources-part-1/) series.
1. No one else had already created one.

This weekend I decided to add **iSNS Server** support to the resource—for both the **ciSCSIServerTarget** and **ciSCSIInitiator** resources. So with that feature added, I thought it might be a good opportunity for me to write a quick blog post on how to use these **DSC Resources**.

### Installing the Resource

You can find the new **ciSCSI** resource in the [PowerShell Gallery](https://www.powershellgallery.com/packages/ciSCSI).

For those of you using **Windows Management Framework 5.0** (or have the **PowerShellGet** module installed), you can just use the command:

```powershell
Install-Module -Name ciSCSI
```

If you don't have **Windows Management Framework 5.0** (and don't have the **PowerShellGet** module installed), you will need to download and install the resource from the [GitHub Repository](https://github.com/PlagueHO/ciSCSI/tree/master).

### Using the Resource

If you'd rather just jump right into the resource documentation and examples, you can find it [here](https://github.com/PlagueHO/ciSCSI/blob/master/README.md). Otherwise, read on and I'll cover this resource to configure both an **iSCSI Server Target** and an **iSCSI Initiator**. I'll also show how to register iSCSI Server Targets and Initiators with an **iSNS Server**.

_**Important:** Although the **ciSCSI DSC Resource** will work on **Windows Management Framework 4.0**, these examples require the use of the **WaitForAny** DSC Resource, which is only available in **Windows Management Framework 5.0**. This resource is used to ensure that the **iSCSI Server Target** has been created before trying to connect any **iSCSI Initiators** to it. The resource could be omitted, but errors will be reported by the LCM on the iSCSI Initiator computers if the iSCSI Server Target is not available before the iSCSI Initiator DSC MOF is applied._

#### The Example Environment

In this example, the DSC Configurations that are being created will refer to the following servers:

- **FS1.CONTOSO.COM** - This is the file server that will contain the **iSCSI Virtual Disks** and **iSCSI Server Target**.
- **CLUS1.CONTOSO.COM, CLUS2.CONTOSO.COM, CLUS3.CONTOSO.COM** - These are the Windows Server 2012 R2 (or Windows Server 2016) Cluster Server nodes that will be connecting to the **iSCSI Server Target**.
- **ISNS1.CONTOSO.COM** - This is a server with the **iSNS Server** Windows Feature installed on it. The **iSNS default domain** has been configured on this server already.

The DSC configurations that will be created will create four 128GB dynamic **iSCSI Virtual Disks** on the `D:\` drive of **FS1.CONTOSO.COM**. An **iSCSI Server Target** called **FS1-Server-Target** will be created, and the four **iSCSI Virtual Disks** will be attached to it.

#### Configuring the iSCSI Server Target

A DSC configuration that creates an **iSCSI Server Target** requires the following steps to be performed in the DSC Resource:

1. Install the **iSCSI Target Server** Windows Feature (`FS-iSCSITarget-Server`).
1. Initialize any physical disks that will be used to store the **iSCSI Virtual Disks** (optional).
1. Create the **iSCSI Virtual Disks** that will be used by the **iSCSI Server Target**.
1. Create the **iSCSI Server Target** and optionally register it with an **iSNS Server**.

Here is the DSC Configuration:

```powershell
Configuration ISCSI_SERVER_TARGET {
    Import-DscResource -ModuleName 'PSDesiredStateConfiguration'
    Import-DscResource -ModuleName xStorage
    Import-DscResource -ModuleName ciSCSI

    Node 'FS1' {
        # Step 1 - Install the iSCSI Target Server Windows Feature
        WindowsFeature ISCSITargetServerInstall {
            Ensure = "Present"
            Name = "FS-iSCSITarget-Server"
        }

        # Step 2 - Initialize any physical disks that will be used to store the iSCSI Virtual Disks
        xWaitforDisk Disk2 {
            DiskNumber = 1
            RetryIntervalSec = 60
            RetryCount = 60
        }
        xDisk DVolume {
            DiskNumber = 1
            DriveLetter = 'D'
            DependsOn = "[xWaitforDisk]Disk2"
        }
        File VirtualDisksFolder {
            Ensure = 'Present'
            DestinationPath = 'D:\iSCSIVirtualDisks'
            Type = 'Directory'
            DependsOn = '[xDisk]DVolume'
        }

        # Step 3 - Create the iSCSI Virtual Disks
        ciSCSIVirtualDisk VDisk1 {
            Ensure = 'Present'
            Path = 'D:\iSCSIVirtualDisks\VDisk1.vhdx'
            DiskType = 'Dynamic'
            SizeBytes = 128GB
            DependsOn = "[File]VirtualDisksFolder"
        }
        ciSCSIVirtualDisk VDisk2 {
            Ensure = 'Present'
            Path = 'D:\iSCSIVirtualDisks\VDisk2.vhdx'
            DiskType = 'Dynamic'
            SizeBytes = 128GB
            DependsOn = "[File]VirtualDisksFolder"
        }
        ciSCSIVirtualDisk VDisk3 {
            Ensure = 'Present'
            Path = 'D:\iSCSIVirtualDisks\VDisk3.vhdx'
            DiskType = 'Dynamic'
            SizeBytes = 128GB
            DependsOn = "[File]VirtualDisksFolder"
        }
        ciSCSIVirtualDisk VDisk4 {
            Ensure = 'Present'
            Path = 'D:\iSCSIVirtualDisks\VDisk4.vhdx'
            DiskType = 'Dynamic'
            SizeBytes = 128GB
            DependsOn = "[File]VirtualDisksFolder"
        }

        # Step 4 - Create the iSCSI Server Target and optionally register it with an iSNS Server
        ciSCSIServerTarget iSCSIServerTarget {
            Ensure = 'Present'
            TargetName = 'FS1-Server-Target'
            InitiatorIds = @(
                'Iqn:iqn.1991-05.com.microsoft:CLUS1.CONTOSO.COM',
                'Iqn:iqn.1991-05.com.microsoft:CLUS2.CONTOSO.COM',
                'Iqn:iqn.1991-05.com.microsoft:CLUS3.CONTOSO.COM'
            )
            Paths = @(
                'D:\iSCSIVirtualDisks\VDisk1.vhdx',
                'D:\iSCSIVirtualDisks\VDisk2.vhdx',
                'D:\iSCSIVirtualDisks\VDisk3.vhdx',
                'D:\iSCSIVirtualDisks\VDisk4.vhdx'
            )
            iSNSServer = 'isns1.contoso.com'
        }
    }
}
```

_**Important:** Note that the **TargetName** is set to 'FS1-Server-Target', which will automatically configure the **Target IQN** to 'iqn.1991-05.com.microsoft:FS1-FS1-Server-Target-Target'. This is because the **Microsoft iSCSI Server Target** cmdlets automatically name the **Server Target** for you using the following format:_

```text
iqn.1991-05.com.microsoft:$($ComputerName)-$($ServerTarget)-Target
```

_This is very important to remember because the **iSCSI Initiators** use this string to identify the **Server Target** to connect to._

#### Configuring the iSCSI Initiator

A DSC configuration for each of the iSCSI Initiators that will connect to the iSCSI Server Target requires the following steps to be performed in the DSC Resource:

1. Start the **Microsoft iSCSI Initiator Service** service (MSiSCSI).
1. Use the **WaitForAny** WMF 5.0 DSC Resource to wait for the **iSCSI Server Target** to be created (optional).
1. Connect the **iSCSI Initiator** to the **iSCSI Server Target** and optionally register it with an **iSNS Server**.

Here is the DSC Configuration for **CLUS1.CONTOSO.COM** (the configuration for the other nodes would be similar except with different InitiatorPortalAddress values):

```powershell
Configuration ISCSI_INITIATOR {
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -ModuleName xPSDesiredStateConfiguration
    Import-DscResource -ModuleName ciSCSI

    Node 'CLUS1' {
        # Step 1 - Start the Microsoft iSCSI Initiator Service service (MSiSCSI)
        Service iSCSIService {
            Name = 'MSiSCSI'
            StartupType = 'Automatic'
            State = 'Running'
        }

        # Step 2 - Use the WaitForAny WMF 5.0 DSC Resource to wait for the iSCSI Server Target to be created (optional).
        WaitForAny WaitForiSCSIServerTarget {
            ResourceName = "[ciSCSIServerTarget]ClusterServerTarget"
            NodeName = 'FS1'
            RetryIntervalSec = 30
            RetryCount = 30
            DependsOn = "[Service]iSCSIService"
        }

        # Step 3 - Connect the iSCSI Initiator to the iSCSI Server Target and optionally register it with an iSNS Server
        ciSCSIInitiator iSCSIInitiator {
            Ensure = 'Present'
            NodeAddress = 'iqn.1991-05.com.microsoft:fs1-fs1-server-target-target'
            TargetPortalAddress = '192.168.129.10'
            InitiatorPortalAddress = '192.168.129.24'
            IsPersistent = $true
            iSNSServer = 'isns1.contoso.com'
            DependsOn = "[WaitForAny]WaitForiSCSIServerTarget"
        } # End of ciSCSITarget Resource
    }
}
```

_**Important:** We need to make sure the **NodeAddress** is set to the the **Target IQN** from the **iSCSI Server Target** - in this case 'iqn.1991-05.com.microsoft:FS1-FS1-Server-Target-Target'._

It is also recommended that you use IP Addresses for the **TargetPortalAddress** and **InitiatorPortalAddress** parameters rather than server names, as this will force the iSCSI traffic to use the appropriate network adapter.

### iSNS Server Configuration

There are a few things to keep in mind when you have your iSCSI DSC Configurations registering with an iSNS Server:

1. The Default Domain on the **iSNS Server** should have been created.
2. If the **iSNS Server** is not available or contactable by the **iSCSI Server Target** or **Initiator** when the **DSC Configuration** is applied the DSC configuration will not throw an error, but the iSNS Server Address will not be set. However, next time the DSC configuration is applied by the LCM it will try again (and again the next time etc).

Using **iSNS Server** is completely optional and is mostly used in larger environments with more than twenty **iSCSI Server Targets** and where the Initiators will be connected to the **iSCSI Server Targets** manually or where DSC can't be used on the **iSCSI Server Targets**.

That is all there is to using this resource to configure a Windows Server 2012 iSCSI SAN using DSC.

_**Note**: I have submitted this DSC Resource to be included in the [Microsoft Community DSC Resources project](https://github.com/PowerShell/DscResources). If it is accepted then the name of the DSC Resource will change from **ciSCSI** to **iSCSI**. The resource hasn't yet been reviewed and I'm not aware of an ETA for it. The old 'c' and 'x' nomenclature used by DSC Resources is being phased out._
