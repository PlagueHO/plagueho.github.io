---
title: "Comparing Objects using JSON in PowerShell for Pester Tests"
date: 2015-08-23
description: "A quick tip on how to compare objects in PowerShell using JSON for Pester tests."
tags:
  - "labbuilder"
  - "pester"
  - "powershell"
---

Recently I spent the good part of a weekend putting together _Pester Tests_ (click [here](http://www.powershellmagazine.com/2014/03/12/get-started-with-pester-powershell-unit-testing-framework/) if you aren't familiar with Pester) for my **LabBuilder PowerShell** module- a module to build a set of Virtual Machines based on an XML configuration file. In the module I have several cmdlets that take an XML configuration file (sample below) and return an array of hash tables as well as some hash table properties containing other arrays - basically a fairly complex object structure.

[![A Pester Test config file for the LabBuilder module](/assets/images/blog/ss_vs_pestertestconfigsample.png)](/assets/images/blog/ss_vs_pestertestconfigsample.png) A Pester Test config file for the LabBuilder module

In the _Pester Tests_ for these cmdlets I wanted to ensure the object that was returned **exactly** matched what I expected. So in the _Pester Test_ I programmatically created an object that matched what the _Pester Test_ should expect the output of the cmdlets would be:

```powershell
# Sample of the expected object built inside the Pester test
$ExpectedSwitches = @(
    @{
        name     = 'General Purpose External'
        type     = 'External'
        vlan     = $null
        adapters = [System.Collections.Hashtable[]]@(
            @{ name = 'Cluster';    macaddress = '00155D010701' }
            @{ name = 'Management'; macaddress = '00155D010702' }
            @{ name = 'SMB';        macaddress = '00155D010703' }
            @{ name = 'LM';         macaddress = '00155D010704' }
        )
    },
    @{ name = 'Pester Test Private Vlan'; type = 'Private'; vlan = '2'; adapters = @() },
    @{ name = 'Pester Test Private';      type = 'Private'; vlan = $null; adapters = @() },
    @{ name = 'Pester Test Internal Vlan'; type = 'Internal'; vlan = '3'; adapters = @() },
    @{ name = 'Pester Test Internal';     type = 'Internal'; vlan = $null; adapters = @() }
)
```

What I needed to do was try and make sure the objects were the same. At first I tried to use the **Compare-Object** cmdlet - this actually wasn't useful in this situation as it doesn't do any sort of deep property comparison. What was needed was to _serialize_ the objects and then perform a simple string comparison. The **ConvertTo-JSON** cmdlet seemed to be just what was needed. I also decided to use the \[String\]::Compare() method instead of using the PowerShell -eq operator because the -eq operator seems to have issues with Unicode strings.

The _Pester_ test that I first tried was:

```powershell
Context 'Valid configuration is passed' {

    $Switches = Get-LabSwitches -Config $Config

    It 'Returns Switches object that matches Expected object' {
        [string]::Compare(
            ($Switches        | ConvertTo-Json -Depth 4),
            ($ExpectedSwitches | ConvertTo-Json -Depth 4)
        ) | Should -Be 0
    }
}
```

This initially seemed to work, but if I changed any of the object properties below the root level (e.g. the **adapter name** property) the comparison still reported the objects were the same when they weren't. After reading the documentation it states that the **ConvertTo-JSON** cmdlet provides a **Depth** property that defaults to 2 - which limits the depth that an object structure would be converted to. In my case the object was actually 4 levels deep. So I needed to add a **Depth** parameter to the **ConvertTo-JSON** calls:

```powershell
[string]::Compare(
    ($Switches        | ConvertTo-Json -Depth 4),
    ($ExpectedSwitches | ConvertTo-Json -Depth 4)
) | Should -Be 0
```

This then did pretty much exactly what I wanted. However, I also needed the comparison to be case-insensitive, so I added a boolean parameter to the \[String\]::Compare static call:

```powershell
# Case-insensitive comparison
[string]::Compare(
    ($Switches        | ConvertTo-Json -Depth 4),
    ($ExpectedSwitches | ConvertTo-Json -Depth 4),
    $true          # ignore case
) | Should -Be 0
```

The end result was **a deep object comparison** between a reference object and the object the cmdlet being tested returned. It is by no means perfect as if the properties or contents of any arrays in the object are out of order the comparison will report that there are differences, but because we control the format of these objects this shouldn't be a problem and should enable some very test strict cmdlet tests.

[![How the the Final Pester Test in Visual Studio 2015 (with POSH tools)](/assets/images/blog/ss_vs_pestertest_object_comparison.png)](/assets/images/blog/ss_vs_pestertest_object_comparison.png)
How the the Final Pester Test in Visual Studio 2015 (with POSH tools)

**Edit**: after writing a number of _Pester_ tests using the approach I realized it could be simplified slightly by replacing the generation of the comparison object with the actual JSON output produced by the reference object _embedded_ inline in a variable. For example:

[![Performing the object comparison using JSON in a variable in the test.](/assets/images/blog/ss_vs_pestertest_inline_json1.png)](/assets/images/blog/ss_vs_pestertest_inline_json1.png)
Performing the object comparison using JSON in a variable in the test.

The JSON can be generated manually by hand (before writing the function itself) to stick to the Test Driven Design methodology or it can be generated from the object the function being tested created (once it it working correctly) and then written to a file using:

```powershell
# Generate reference JSON file
Set-Content -Path "$env:TEMP\Switches.json" -Value ($Switches | ConvertTo-Json -Depth 4)
```

The **$switches** variable contains the actual object that is produced by the  working command being tested.

### A Word of Caution about CRLF

I have noticed that when opening the JSON file in something like Notepad++ and copying the JSON to the clipboard (to paste into my _Pester_ test) that an additional CRLF appears at the bottom. You need to ensure you don't include this at the bottom of your variable too - otherwise the comparison will fail and the objects will appear to be different (when they aren't).

This is what the end of the JSON variable definition should look like:

[![Good JSON CRLF Formatting](/assets/images/blog/ss_vs_pestertest_inline_json_good.png)](/assets/images/blog/ss_vs_pestertest_inline_json_good.png)

And this is what it should **not** look like (the arrow indicates the location of the extra CRLF that should be removed):

[![Good JSON CRLF formatting](/assets/images/blog/ss_vs_pestertest_inline_json_bad.png)](/assets/images/blog/ss_vs_pestertest_inline_json_bad.png)

> [!NOTE]
> I could have used the **Export-CliXML** and **Import-CliXML** CmdLets instead to perform the object serialization and comparison, but these cmdlets write the content to disk and also generate much larger strings which would take much longer to compare and ending up with a more complicated test.

Well, hopefully someone else will find this useful!
