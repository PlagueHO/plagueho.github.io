---
title: "Distributed File System DSC Resource Update"
date: "2015-10-11"
categories: 
  - "desired-state-configuration"
  - "distributed-file-system"
tags: 
  - "powershell"
coverImage: "fi_sweetpea.png"
---

After releasing the **DFS DSC Resource Module** [yesterday](https://dscottraynsford.wordpress.com/2015/10/10/windows-distributed-file-system-dsc-resource/), I had an idea of how to simplify it if you're deploying a DFS folder that contains the same path content path for all members. I added a **ContentPaths** parameter (an array of strings) to the **cDFSRepGroup** resource so that if the folder exists in the same location on every member, you won't need to use the **cDFSRepGroupMembership** resource to individually set the Content Path for each member.

For example:

\[sourcecode language="powershell"\] configuration Sample\_cDFSRepGroup\_Simple { Import-DscResource -Module cDFS

Node $NodeName { \[PSCredential\]$Credential = New-Object System.Management.Automation.PSCredential ("CONTOSO.COM\\Administrator", (ConvertTo-SecureString $"MyP@ssw0rd!1" -AsPlainText -Force))

\# Install the Prerequisite features first # Requires Windows Server 2012 R2 Full install WindowsFeature RSATDFSMgmtConInstall { Ensure = "Present" Name = "RSAT-DFS-Mgmt-Con" }

\# Configure the Replication Group cDFSRepGroup RGPublic { GroupName = 'Public' Description = 'Public files for use by all departments' Ensure = 'Present' Members = 'FileServer1','FileServer2' Folders = 'Software','Misc' Topology = 'Fullmesh' ContentPaths = 'd:\\public\\software','d:\\public\\misc' PSDSCRunAsCredential = $Credential DependsOn = "\[WindowsFeature\]RSATDFSMgmtConInstall" } # End of RGPublic Resource } # End of Node } # End of Configuration \[/sourcecode\]

The above example creates a **DFS Replication Group** called **Public** containing two folders, **Software** and **Misc**. The DFS Replication Group replicates to two members, **FileServer1** and **FileServer2**. It is maintaining a **Fullmesh** connection topology.

The thing to note is that the **ContentPaths** array should have the elements in a matching order to the **Folders** parameter. So this:

\[sourcecode language="powershell"\] Folders = 'Misc','Software' ContentPaths = 'd:\\public\\software','d:\\public\\misc' \[/sourcecode\]

Would result in the **Misc** folder being set with the **Content Path** '_d:\\public\\software'_ and the **Public** folder being set with the **Content Path** '_d:\\public\\misc_' - which is probably not ideal.

#### The Primary Member

Every **Resource Group** Folder needs a **Primary Member** set for initial replication to take place. If you use this automatic assigning of content paths the **Primary Member** will automatically be set to the computer listed first in the **Members** parameter. If you want to change this you'll need to use the manual **cDFSRepGroupMembership** resource instead.

#### Partially Setting Content Paths

It is actually possible to only automatically configure some of the content paths in a **DFS Replication Group** by leaving the appropriate **ContentPaths** array entry blank. This would allow you to automatically configure some folders but leave other folders to be manually configured.

For example:

\[sourcecode language="powershell"\] cDFSRepGroup RGPublic { GroupName = 'Public' Description = 'Public files for use by all departments' Ensure = 'Present' Members = 'FileServer1','FileServer2' Folders = 'Software','Misc','Video' Topology = 'Fullmesh' ContentPaths = 'd:\\public\\software','','e:\\video' PSDSCRunAsCredential = $Credential DependsOn = "\[WindowsFeature\]RSATDFSMgmtConInstall" } # End of RGPublic Resource \[/sourcecode\]

This would create a **Replication Group** called **Public**, with three folders **Software, Misc** and **Video**. The **Software** and **Video** folders will be automatically configured with **Content Paths** but the **Misc** folder will be left unconfigured so that it can be configured manually.

#### Optional Use

Using the **ContentPaths** or **Topology** parameters _is_ optional. You can still define the folder Content Paths manually using the **cDFSRepGroupMembership** resource and/or configure the connection topology manually using the **cDFSRepGroupConnection** resource if you want to.

**Important**: It is not recommended that you define a **ContentPath** for a folder in the **cDFSRepGroup ContentPaths** parameter if you are also setting it in a **cDFSRepGroupMembership** resource. The same applies to defining and automatic **Topology** and using the **cDFSRepGroupConnection** resource.

And again, in case you missed it, the post covering the original resource is [here](https://dscottraynsford.wordpress.com/2015/10/10/windows-distributed-file-system-dsc-resource/).
