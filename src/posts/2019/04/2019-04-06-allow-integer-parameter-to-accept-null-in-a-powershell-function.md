---
title: "Allow Integer Parameter to Accept Null in a PowerShell Function"
date: 2019-04-06
description: "A PowerShell function that takes a mandatory integer parameter, but that parameter needs to allow Null."
tags:
  - "powershell"
---

One of the great things about PowerShell being based on .NET is that we get access to the huge number of types built into the framework.

A problem I came across today was that I needed to have a function that took a mandatory integer parameter, but that parameter needed to allow `Null`. In .NET, there is a generic type `System.Nullable<T>` that allows other types to take on a null value.

Here's how I solved it:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\src\posts\2019\04\2019-04-06-allow-integer-parameter-to-accept-null-in-a-powershell-function.md
function Set-AdapterVlan {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        $Adapter,

        [Parameter(Mandatory = $true)]
        [AllowNull()]
        [Nullable[System.Int32]]
        $VlanId
    )
    
    if ($null -eq $VlanId) {
        # If VlanId is null, clear the VLAN ID from the adapter
        $Adapter | Set-VMNetworkAdapterVlan -Untagged
    }
    else {
        # Otherwise, set the VLAN ID
        $Adapter | Set-VMNetworkAdapterVlan -VlanId $VlanId -Access
    }
}
```

This allows me to call the function above like this:

```powershell
Set-AdapterVlan -Adapter $adapter -VlanId $null
```

Which will clear the VLAN ID from the virtual network adapter.

The magic is in the parameter definition:

```powershell
[Parameter(Mandatory = $true)]
[AllowNull()]
[Nullable[System.Int32]]
$VlanId
```

The `[AllowNull()]` attribute allows the `$VlanId` parameter to accept a null even though it is mandatory, and the `[Nullable[System.Int32]]` allows `$VlanId` to be assigned a null value.

This isn't something I use often, but I thought it was worth sharing!
