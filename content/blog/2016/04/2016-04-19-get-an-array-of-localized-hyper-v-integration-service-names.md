---
title: "Get an Array of Localized Hyper-V Integration Service Names"
date: "2016-04-19"
categories:
  - "hyper-v"
tags:
  - "powershell"
---

Today's PowerShell snippet is used to get a list of Localized captions for the available Integration Services available on a Hyper-V host. I needed this because [LabBuilder](https://github.com/PlagueHO/LabBuilder) allows the individual Integration Services to be enabled or disabled per Lab Virtual Machine.

It does this using the Integration Service names configured in the configuration XML file. The problem of course is localization - something I often overlook. If you need to enable/disable an Integration Service on a VM, you need to know the name of it. The name of course is a localized string, so you need to know what the possible values are on the current machine culture.

So, after a lot of digging around in the WMI/CIM I managed to locate the various classes I need and converted them into a simple function:


```powershell
function GetIntegrationServiceNames {
    [CmdLetBinding()]
    param
    (
    )
    $Captions = @()
    $Classes = @(
        'Msvm_VssComponentSettingData'
        'Msvm_ShutdownComponentSettingData'
        'Msvm_TimeSyncComponentSettingData'
        'Msvm_HeartbeatComponentSettingData'
        'Msvm_GuestServiceInterfaceComponentSettingData'
        'Msvm_KvpExchangeComponentSettingData'
    )
    foreach ($Class in $Classes)
    {
        $Captions += (Get-CimInstance `
            -Class $Class `
            -Namespace Root\Virtualization\V2 `
            -Property Caption | Select-Object -First 1).Caption
    } # foreach
    # This Integration Service is registered in CIM but are not exposed in Hyper-V
    # 'Msvm_RdvComponentSettingData'
    return $Captions
} # GetIntegrationServiceNames

GetIntegrationServiceNames
```

The output of the function looks like this for English US:

VSS
Shutdown
Time Synchronization
Heartbeat
Guest Service Interface
Key-Value Pair Exchange

Hopefully someone will find it handy.


