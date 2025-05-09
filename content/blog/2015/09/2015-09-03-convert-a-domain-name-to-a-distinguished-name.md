---
title: "Convert a Domain Name to a Distinguished Name in PowerShell"
date: "2015-09-03"
tags: 
  - "powershell"
---

Here is a small **PowerShell** snippet to easily convert a Domain Name (e.g. corp.bmdlab.com) to a distinguished name (DC=corp,DC=bmdlab,DC=com):

\[sourcecode language="powershell"\] \[String\]$Domain = 'corp.bmdlab.com'

\# Create an empty string that the DN will be stored in \[String\]$DN = ''

\# Assemble the DN by splitting the DC and then looping to concatenate the new $Domain.Split('.') | % { $DN = "DC=$($\_),$DN" }

\# An extra . will be left on the end of DN, so strip it off $DN = $DN.SubString(0,$DN.Length-1) \[/sourcecode\]

An even easier way would be to use the Replace method on a string object:

\[sourcecode language="powershell"\] \[String\]$Domain = 'corp.bmdlab.com'

\# Assemble the DN by replacing $DN = 'CN=' + $Domain.Replace('.',',CN=') \[/sourcecode\]

That is all!

