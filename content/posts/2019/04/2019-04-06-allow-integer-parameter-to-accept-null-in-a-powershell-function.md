---
title: "Allow Integer Parameter to Accept Null in a PowerShell Function"
date: "2019-04-06"
tags: 
  - "powershell"
---

One of the great things about PowerShell being based on .NET is that we get to the huge number of types built into the framework.

A problem I came across today was that I needed to have a function that took a mandatory integer parameter, but that parameter needed to allow **Null**. In .NET there is a generic type **System.Nullable<T>** that allows other types to take on a null value.

\[gist\]4d640f93053b230b6dc88171dba9aa92\[/gist\]

This allows me to call the function above with the following:

Set-AdapterVlan -Adapter $adapter -Vlan $null

Which will clear the Vlan ID from the virtual network adapter.

The magic is in the parameter definition:

\[Parameter(Mandatory = $true)\]
\[AllowNull()\]
\[Nullable\[System.Int32\]\]
$VlanId

The **\[AllowNull()\]** attribute allows the **$VlanId** parameter to accept a Null even though it is mandatory, and the **\[Nullable\[System.Int32\]\]** allows **$VlanId** to be assigned a null value.

This isn't something I use often, but thought it was worth sharing.

