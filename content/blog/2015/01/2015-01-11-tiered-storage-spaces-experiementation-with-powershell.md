---
title: "Tiered Storage Spaces Experiementation with PowerShell"
date: "2015-01-11"
categories:
  - "windows-server-2012"
---

I've been recently experiementing with the interesting Tiered Storage Spaces features in Windows Server 2012 R2. As part of this I've been going through some of the excellent MSFT File Server team blogs on TechNet.

This [one](http://blogs.technet.com/b/josebda/archive/2013/08/28/step-by-step-for-storage-spaces-tiering-in-windows-server-2012-r2.aspx "Step-by-step for Storage Spaces Tiering in Windows Server 2012 R2") in particular by Jose Barreto was supremely useful and I highly recommend it. It contains some excellent PowerShell code for setting up a VM for experimenting with Tiered Storage Spaces as well as configuring them within the VM.

I did find it the PowerShell code is fragmented throughout the long article and was a little bit hard to use (lots of ALT+TAB, CTRL+C and CTRL+V). So I've assembled the code into two code snippets that you should be able to paste into a PowerShell ISE script window and then step through - it should save a lot of repetitive keypressing.

I also modified it slightly to have some of the configuration items, such as where to put the VM HDD and SSD VHDX files in variables at the beginning of the script to make it easier to manage.

This is the script to run on the Host OS that will install Hyper-V, create the VM, create the test VHDXs and start it up:

```powershell
# -------------------------------------------------------------------------- # Execute on HOST OS # -------------------------------------------------------------------------- # Configure these paths and names # Path to store the VM SSDs $SSD\_VHD\_Path = "F:\\VM\\VHD" # Path to store the VM HDDs $HDD\_VHD\_Path = "E:\\VM\\VHD" # Name of the VM To create/use $VMName = 'Windows Server 2012' # Path to the VM OS disk (if creating a VM). $VM\_OS\_Path = "F:\\VM\\OS\\Windows Server 2012.VHDX" # --------------------------------------------------------------------------

\# Preparation steps: Install Window Server 2012 R2 Preview # Install required roles and features, restart at the end # If Hyper-V is already installed comment out this line: Install-WindowsFeature Hyper-V -IncludeManagementTools –Restart

\# Create 4 VHDX files on the SSD with 10GB each 1..4 | % { New-VHD -Path "$SSD\_VHD\_Path\\VMA\_SSD\_$\_.VHDX" -Dynamic –Size 10GB}

\# Create 8 VHDX files on the HDD with 30GB each 1..8 | % { New-VHD -Path "$HDD\_VHD\_Path\\VMA\_HDD\_$\_.VHDX" -Dynamic –Size 30GB}

\# Create a new VM. Assumes you have an Windows Server 2012 R2 OS VHDX in place # If you already have a VM comment out this line: New-VM -Name $VMName -Path D:\\VMS –VHDPath $VM\_OS\_Path -Memory 2GB

\# Add all data disks to the VM 1..4 | % { Add-VMHardDiskDrive -VMName $VMName -ControllerType SCSI -Path "$SSD\_VHD\_Path\\VMA\_SSD\_$\_.VHDX" } 1..8 | % { Add-VMHardDiskDrive -VMName $VMName -ControllerType SCSI -Path "$HDD\_VHD\_Path\\VMA\_HDD\_$\_.VHDX" }

\# Start the VM Start-VM $VMName Get-VM $VMName Get-VM $VMName | Get-VMHardDiskDrive
```

Once you've got your VM up and running you can execute the following script on it to experiement with the actual Tiered Storage Spaces:

```powershell
# -------------------------------------------------------------------------- # Execute on GUEST OS # -------------------------------------------------------------------------- Get-PhysicalDisk | Sort Size | FT DeviceId, FriendlyName, CanPool, Size, MediaType -AutoSize Get-PhysicalDisk -CanPool $true | ? Size -lt 20GB | Sort Size | FT -AutoSize Get-PhysicalDisk -CanPool $true | ? Size -gt 20GB | Sort Size | FT -AutoSize

$s = Get-StorageSubSystem New-StoragePool -StorageSubSystemId $s.UniqueId -FriendlyName Pool1 -PhysicalDisks (Get-PhysicalDisk -CanPool $true)

\# Configure media type for virtual SAS disks Get-StoragePool Pool1 | Get-PhysicalDisk | ? Size -lt 20GB | Set-PhysicalDisk –MediaType SSD Get-StoragePool Pool1 | Get-PhysicalDisk | ? Size -gt 20GB | Set-PhysicalDisk –MediaType HDD Get-StoragePool Pool1 Get-StoragePool Pool1 | Get-PhysicalDisk | Sort Size | FT –AutoSize Get-StoragePool Pool1 | Get-PhysicalDisk | Sort Size | FT FriendlyName, Size, MediaType, HealthStatus, OperationalStatus -AutoSize Get-StoragePool Pool1 | Get-PhysicalDisk | Group MediaType, Size | Sort Name | FT -AutoSize Get-StoragePool Pool1 | FL Size, AllocatedSize Get-StoragePool Pool1 | New-StorageTier –FriendlyName SSDTier –MediaType SSD Get-StoragePool Pool1 | New-StorageTier –FriendlyName HDDTier –MediaType HDD Get-StorageTier | FT FriendlyName, MediaType, Size -AutoSize Get-StoragePool Pool1 | FL Size, AllocatedSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Simple | FT -AutoSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Mirror | FT -AutoSize Get-StorageTierSupportedSize HDDTier -ResiliencySettingName Simple | FT -AutoSize Get-StorageTierSupportedSize HDDTier -ResiliencySettingName Mirror | FT -AutoSize

\# Configure resiliency settings Get-StoragePool Pool1 | Set-ResiliencySetting -Name Simple -NumberOfColumnsDefault 4 Get-StoragePool Pool1 | Set-ResiliencySetting -Name Mirror -NumberOfColumnsDefault 2

\# Create simple and mirrored spaces with tiering $SSD = Get-StorageTier -FriendlyName SSDTier $HDD = Get-StorageTier -FriendlyName HDDTier Get-StoragePool Pool1 | New-VirtualDisk -FriendlyName Space1 -ResiliencySettingName Simple –StorageTiers $SSD, $HDD -StorageTierSizes 8GB, 32GB -WriteCacheSize 1GB Get-StoragePool Pool1 | New-VirtualDisk -FriendlyName Space2 -ResiliencySettingName Mirror -StorageTiers $SSD, $HDD -StorageTierSizes 8GB, 32GB –WriteCacheSize 1GB Get-StoragePool Pool1 | Get-ResiliencySetting | FT -AutoSize Get-VirtualDisk | FT -AutoSize Get-StorageTier | FT FriendlyName, MediaType, Size -AutoSize Get-StoragePool Pool1 | FL Size, AllocatedSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Simple | FT -AutoSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Mirror | FT -AutoSize Get-StorageTierSupportedSize HDDTier -ResiliencySettingName Simple | FT -AutoSize Get-StorageTierSupportedSize HDDTier -ResiliencySettingName Mirror | FT -AutoSize

\# Configure volume “F” on Space1 Get-VirtualDisk Space1 | Get-Disk | Set-Disk -IsReadOnly 0 Get-VirtualDisk Space1 | Get-Disk | Set-Disk -IsOffline 0 Get-VirtualDisk Space1 | Get-Disk | Initialize-Disk -PartitionStyle GPT Get-VirtualDisk Space1 | Get-Disk | New-Partition -DriveLetter “F” -UseMaximumSize Initialize-Volume -DriveLetter “F” -FileSystem NTFS -Confirm:$false

\# Configure volume “G” on Space2 Get-VirtualDisk Space2 | Get-Disk | Set-Disk -IsReadOnly 0 Get-VirtualDisk Space2 | Get-Disk | Set-Disk -IsOffline 0 Get-VirtualDisk Space2 | Get-Disk | Initialize-Disk -PartitionStyle GPT Get-VirtualDisk Space2 | Get-Disk | New-Partition -DriveLetter “G” -UseMaximumSize Initialize-Volume -DriveLetter “G” -FileSystem NTFS -Confirm:$false Get-Partition | ? DriveLetter -ge "F" | FT -AutoSize Get-Volume | ? DriveLetter -ge "F" | FT -AutoSize

\# Create 3 files on volume “F”, place them on different tiers 1..3 | % { fsutil file createnew f:\\file$\_.dat (4GB) fsutil file setvaliddata f:\\file$\_.dat (4GB) } Set-FileStorageTier -FilePath f:\\file1.dat -DesiredStorageTierFriendlyName Space1\_SSDTier Set-FileStorageTier -FilePath f:\\file2.dat -DesiredStorageTierFriendlyName Space1\_HDDTier Get-FileStorageTier -VolumeDriveLetter F

\# Create 3 files on volume “G”, place them on different tiers 1..3 | % { fsutil file createnew g:\\file$\_.dat (4GB) fsutil file setvaliddata g:\\file$\_.dat (4GB) } Set-FileStorageTier -FilePath g:\\file1.dat -DesiredStorageTierFriendlyName Space2\_SSDTier Set-FileStorageTier -FilePath g:\\file2.dat -DesiredStorageTierFriendlyName Space2\_HDDTier Get-FileStorageTier -VolumeDriveLetter G Dir F: Dir G: Get-Volume | ? DriveLetter -ge "F" | FT -AutoSize Get-FileStorageTier -VolumeDriveLetter F | FT -AutoSize Get-FileStorageTier -VolumeDriveLetter G | FT -AutoSize

\# Check tasks used by Storage Tiering Get-ScheduledTask -TaskName \*Tier\* | FT –AutoSize Get-ScheduledTask -TaskName \*Tier\* | Get-ScheduledTaskInfo

\# Manually running the “Storage Tiers Optimization” task Get-ScheduledTask -TaskName "Storage Tiers Optimization" | Start-ScheduledTask Get-ScheduledTask -TaskName \*Tier\* | FT –AutoSize Get-ScheduledTask -TaskName \*Tier\* | Get-ScheduledTaskInfo Get-ScheduledTask -TaskName "Storage Tiers Optimization" | Start-ScheduledTask Get-ScheduledTask -TaskName "Storage Tiers Optimization" | Get-ScheduledTaskInfo

\# These commands assume that the SQLIO2.EXE file was copied to the C:\\SQLIO folder # SQLIO workload 1 : 30 seconds, random, read, 8KB, 4 thread, 16 outstanding IOs, no buffering # SQLIO workload 2 : 30 seconds, sequential, read, 512KB, 4 thread, 4 outstanding IOs, no buffering # SQLIO can be found here: blogs.technet.com/b/josebda/archive/2013/03/25/sqlio-powershell-and-storage-performance-measuring-iops-throughput-and-latency-for-both-local-disks-and-smb-file-shares.aspx

\# Check file location on tiers for volume F: Get-FileStorageTier -VolumeDriveLetter F | FT -AutoSize

\# Running SQLIO on F:, using File1 (HDD tier), File2 (HDD tier) and File 3 (unspecified tier) c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN f:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN f:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN f:\\file3.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN f:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN f:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN f:\\file3.dat

\# Check file location on tiers for volume G: Get-FileStorageTier -VolumeDriveLetter G | FT -AutoSize

\# Running SQLIO on G:, using File1 (HDD tier), File2 (HDD tier) and File 3 (unspecified tier) c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN g:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN g:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN g:\\file3.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN g:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN g:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN g:\\file3.dat

Get-FileStorageTier -VolumeDriveLetter F | FT -AutoSize c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN f:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN f:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN f:\\file3.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN f:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN f:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN f:\\file3.dat Get-FileStorageTier -VolumeDriveLetter G | FT -AutoSize c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN g:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN g:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -frandom -kR -b8 -t4 -o16 -BN g:\\file3.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN g:\\file1.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN g:\\file2.dat c:\\sqlio\\sqlio2.exe -s30 -fsequential -kR -b512 -t4 -o4 -BN g:\\file3.dat

\# Check state before change Get-VirtualDisk Space1 | FT -AutoSize Get-StorageTier Space1\* | FT FriendlyName, Size –AutoSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Simple | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | FT –AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | Get-Volume | FT –AutoSize

\# Add 4GB on the SSD Tier Resize-StorageTier Space1\_SSDTier -Size 12GB Get-VirtualDisk Space1 | Get-Disk | Update-Disk

\# Check after Virtual Disk change Get-VirtualDisk Space1 | FT -AutoSize Get-StorageTier Space1\* | FT FriendlyName, Size –AutoSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Simple | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | FT –AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | Get-Volume | FT –AutoSize

\# Extend partition (also extends the volume) Resize-Partition -DriveLetter F -Size 43.87GB

\# Check after Partition/Volume change Get-VirtualDisk Space1 | Get-Disk | Get-Partition | FT –AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | Get-Volume | FT –AutoSize Get-VirtualDisk Space1 | FT -AutoSize Get-StorageTier Space1\* | FT FriendlyName, Size –AutoSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Simple | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | Get-Volume | FT -AutoSize Resize-StorageTier Space1\_SSDTier -Size 12GB Get-VirtualDisk Space1 | Get-Disk | Update-Disk Get-VirtualDisk Space1 | FT -AutoSize Get-StorageTier Space1\* | FT FriendlyName, Size –AutoSize Get-StorageTierSupportedSize SSDTier -ResiliencySettingName Simple | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | FT -AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | FT –AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | Get-Volume | FT –AutoSize Resize-Partition -DriveLetter F -Size 43.87GB Get-VirtualDisk Space1 | Get-Disk | Get-Partition | FT –AutoSize Get-VirtualDisk Space1 | Get-Disk | Get-Partition | Get-Volume | FT –AutoSize
```

Hopefully this saves someone out there a little time copying and pasting!
