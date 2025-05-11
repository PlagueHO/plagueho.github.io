---
title: "PowerShell DON'T of the Week - $Switch in a Switch { }"
date: 2015-09-08
description: "A quick tip about the $Switch variable in PowerShell."
tags:
  - "powershell"
isArchived: true
---

I just spent the last hour bashing my head against my keyboard trying to figure out what I had done wrong in one of my scripts.

It turns out when you are inside a **switch** construct, the variable `$Switch` is **redefined** (presumably by the switch construct itself) as an empty variable of type `System.Collections.IEnumerator`. The value is set to `$null`. This won't be a problem if you're not using a variable with the name `$Switch`. Unfortunately, I was—because I was working with a set of Virtual Switches, so `$Switch` seemed like a fair choice of variable name.

[![PowerShell Switch redefining variable](/assets/images/screenshots/ss_powershell_switchgremlin.png)](/assets/images/screenshots/ss_powershell_switchgremlin.png)

I could go and research further into this and find out why this is, but I just don't have time right now. If anyone else has looked into this, I'd be really interested to know why.
