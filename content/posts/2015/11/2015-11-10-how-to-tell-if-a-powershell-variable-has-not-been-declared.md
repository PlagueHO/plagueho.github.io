---
title: "How to tell if a PowerShell variable has not been Declared"
date: "2015-11-10"
tags: 
  - "powershell"
---

In most situations in PowerShell, I am really only interested if a variable has a value or not (e.g. not null). Checking for this is easy:

\[sourcecode language="powershell"\] if ($myvariable -eq $null) { Write-Host -Message '$MyVariable is null' } else { Write-Host -Message '$MyVariable has a non-null and non-blank value' } \[/sourcecode\]

But what if I want to know if a variable is **not** declared at all? The method of doing that is not so obvious and being PowerShell there are many ways of doing it. By far the clearest I think is to use the **Test-Path** cmdlet using the **Variable** provider:

\[sourcecode language="powershell"\] if (Test-Path -Path Variable:\\MyVariable) { Write-Host -Message '$MyVariable is declared' } else { Write-Host -Message '$MyVariable is not declared' } \[/sourcecode\]

If there is a cleaner or officially recommended way of doing this I'd be most keen to hear about it.
