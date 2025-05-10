---
title: "Convert a Domain Name to a Distinguished Name in PowerShell"
date: 2015-09-03
description: "A quick PowerShell snippet to convert a domain name to a distinguished name."
tags: 
  - "powershell"
---

Here is a small **PowerShell** snippet to easily convert a domain name (e.g. `corp.bmdlab.com`) to a distinguished name (`DC=corp,DC=bmdlab,DC=com`):

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\09\2015-09-03-convert-a-domain-name-to-a-distinguished-name.md
[String]$Domain = 'corp.bmdlab.com'

# Create an empty string that the DN will be stored in
[String]$DN = ''

# Assemble the DN by splitting the DC and then looping to concatenate the new
$Domain.Split('.') | ForEach-Object { $DN = "DC=$($_),$DN" }

# An extra , will be left on the end of DN, so strip it off
$DN = $DN.Substring(0, $DN.Length - 1)
```

An even easier way would be to use the `Replace` method on a string object:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\09\2015-09-03-convert-a-domain-name-to-a-distinguished-name.md
[String]$Domain = 'corp.bmdlab.com'

# Assemble the DN by replacing
$DN = 'CN=' + $Domain.Replace('.', ',CN=')
```

That is all!
