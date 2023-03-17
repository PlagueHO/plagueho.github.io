---
title: "PowerShell DON'T of the Week - $Switch in a Swtich { }"
date: "2015-09-08"
tags: 
  - "powershell"
---

I just spent the last hour bashing my head against my keyboard trying to figure out what I had done wrong in one of my scripts.

It turns out when you are inside a **Switch** construct, the variable **$Switch** value is **redefined** (presumably by the switch construct itself) as an empty variable of type _System.Collections.IEnumerator_. The value is set to _$null_. This won't be a problem if you're not using a variable with the name **$Switch**. Unfortunately I was because I was working with a set to Virtual Switches so $Switch seemed like a fair choice of variable name.

[![PowerShell Switch redefining variable](https://dscottraynsford.files.wordpress.com/2015/09/ss_powershell_switchgremlin.png?w=660)](https://dscottraynsford.files.wordpress.com/2015/09/ss_powershell_switchgremlin.png)

I could go and research further into this and find out why this is, but I just don't have time right now. If anyone else has looked into this I'd be really interested to know why.
