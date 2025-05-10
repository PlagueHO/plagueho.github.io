---
title: "Tiered Storage Spaces Experimentation with PowerShell"
date: 2015-01-11
description: "Experimenting with Tiered Storage Spaces in Windows Server 2012 R2 using PowerShell."
tags:
  - "windows-server-2012"
---

I've been recently experimenting with the interesting Tiered Storage Spaces features in Windows Server 2012 R2. As part of this, I've been going through some of the excellent MSFT File Server team blogs on TechNet.

This [one](http://blogs.technet.com/b/josebda/archive/2013/08/28/step-by-step-for-storage-spaces-tiering-in-windows-server-2012-r2.aspx) in particular by Jose Barreto was supremely useful, and I highly recommend it. It contains some excellent PowerShell code for setting up a VM for experimenting with Tiered Storage Spaces as well as configuring them within the VM.

I did find the PowerShell code fragmented throughout the long article, which made it a little bit hard to use (lots of ALT+TAB, CTRL+C, and CTRL+V). So I've assembled the code into two code snippets that you should be able to paste into a PowerShell ISE script window and then step through—it should save a lot of repetitive keypressing.

I also modified it slightly to have some of the configuration items, such as where to put the VM HDD and SSD VHDX files, in variables at the beginning of the script to make it easier to manage.

### Script to Run on the Host OS

This script will install Hyper-V, create the VM, create the test VHDXs, and start it up:

```powershell
# --------------------------------------------------------------------------
# Execute on HOST OS
# --------------------------------------------------------------------------

# Configure these paths and names
$SSD_VHD_Path = "F:\VM\VHD"  # Path to store the VM SSDs
$HDD_VHD_Path = "E:\VM\VHD"  # Path to store the VM HDDs
$VMName = 'Windows Server 2012'  # Name of the VM to create/use
$VM_OS_Path = "F:\VM\OS\Windows Server 2012.VHDX"  # Path to the VM OS disk (if creating a VM)

# Install required roles and features, restart at the end
# If Hyper-V is already installed, comment out this line:
Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart

# Create 4 VHDX files on the SSD with 10GB each
1..4 | ForEach-Object { New-VHD -Path "$SSD_VHD_Path\VMA_SSD_$_.VHDX" -Dynamic -SizeBytes 10GB }

# Create 8 VHDX files on the HDD with 30GB each
1..8 | ForEach-Object { New-VHD -Path "$HDD_VHD_Path\VMA_HDD_$_.VHDX" -Dynamic -SizeBytes 30GB }

# Create a new VM. Assumes you have a Windows Server 2012 R2 OS VHDX in place
# If you already have a VM, comment out this line:
New-VM -Name $VMName -Path "D:\VMS" -VHDPath $VM_OS_Path -MemoryStartupBytes 2GB

# Add all data disks to the VM
1..4 | ForEach-Object { Add-VMHardDiskDrive -VMName $VMName -ControllerType SCSI -Path "$SSD_VHD_Path\VMA_SSD_$_.VHDX" }
1..8 | ForEach-Object { Add-VMHardDiskDrive -VMName $VMName -ControllerType SCSI -Path "$HDD_VHD_Path\VMA_HDD_$_.VHDX" }

# Start the VM
Start-VM $VMName
Get-VM $VMName | Get-VMHardDiskDrive
```

### Script to Run on the Guest OS

Once you've got your VM up and running, you can execute the following script on it to experiment with the actual Tiered Storage Spaces:

```powershell
# --------------------------------------------------------------------------
# Execute on GUEST OS
# --------------------------------------------------------------------------

# Display physical disks
Get-PhysicalDisk | Sort-Object Size | Format-Table DeviceId, FriendlyName, CanPool, Size, MediaType -AutoSize

# Create a storage pool
$s = Get-StorageSubSystem
New-StoragePool -StorageSubSystemId $s.UniqueId -FriendlyName Pool1 -PhysicalDisks (Get-PhysicalDisk -CanPool $true)

# Configure media type for virtual SAS disks
Get-StoragePool Pool1 | Get-PhysicalDisk | Where-Object Size -lt 20GB | Set-PhysicalDisk -MediaType SSD
Get-StoragePool Pool1 | Get-PhysicalDisk | Where-Object Size -gt 20GB | Set-PhysicalDisk -MediaType HDD

# Create storage tiers
Get-StoragePool Pool1 | New-StorageTier -FriendlyName SSDTier -MediaType SSD
Get-StoragePool Pool1 | New-StorageTier -FriendlyName HDDTier -MediaType HDD

# Create virtual disks with tiering
$SSD = Get-StorageTier -FriendlyName SSDTier
$HDD = Get-StorageTier -FriendlyName HDDTier
Get-StoragePool Pool1 | New-VirtualDisk -FriendlyName Space1 -ResiliencySettingName Simple -StorageTiers $SSD, $HDD -StorageTierSizes 8GB, 32GB
Get-StoragePool Pool1 | New-VirtualDisk -FriendlyName Space2 -ResiliencySettingName Mirror -StorageTiers $SSD, $HDD -StorageTierSizes 8GB, 32GB

# Initialize and format the virtual disks
Get-VirtualDisk Space1 | Get-Disk | Initialize-Disk -PartitionStyle GPT
Get-VirtualDisk Space1 | Get-Disk | New-Partition -DriveLetter F -UseMaximumSize
Initialize-Volume -DriveLetter F -FileSystem NTFS -Confirm:$false

Get-VirtualDisk Space2 | Get-Disk | Initialize-Disk -PartitionStyle GPT
Get-VirtualDisk Space2 | Get-Disk | New-Partition -DriveLetter G -UseMaximumSize
Initialize-Volume -DriveLetter G -FileSystem NTFS -Confirm:$false
```

Hopefully, this saves someone out there a little time copying and pasting!
