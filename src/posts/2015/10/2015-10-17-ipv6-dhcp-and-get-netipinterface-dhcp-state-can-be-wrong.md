---
title: "IPv6, DHCP and Get-NetIPInterface - DHCP State can be WRONG!"
date: 2015-10-17
description: "A quick article about a bug in Get-NetIPInterface that misreports the DHCP state of IPv6 interfaces."
tags:
  - "dhcp"
  - "ipv6"
  - "powershell"
isArchived: true
---

Recently I've been attempting to help out with the awesome Microsoft Community DSC Resources by throwing in a bit of code here and there - especially into the [xNetworking](https://github.com/PowerShell/xNetworking) resource. I started contributing to them because I had a need for some specific features in these resources for some other projects I was working on.

Anyway, long story short I found myself investigating an odd little bug with the xIPAddress resource (it configures an IPv4 or IPv6 address on a Network adapter). The problem was that even though I had a network adapter with a **statically** assigned **IPv6** address, the **Get-NetIPInterface** cmdlet _always_ seemed to say that **DHCP** was **enabled**:

[![The IPv6 address is clearly statically assigned but it says DHCP is enabled!](/assets/images/screenshots/ss_ip_dhcpmisreported.png)](/assets/images/screenshots/ss_ip_dhcpmisreported.png)
The IPv6 address is clearly statically assigned but it says DHCP is enabled!

I am not sure if this is a bug in **Get-NetIPInterface** that causes the **DHCP** property to be misreported for **IPv6** interfaces or if using this property to determine **DHCP** status on an **IPv6** address is not recommended.

Either way, I'm a bit stumped. I need an alternate and reliable way that can be used to detect the DHCP state of an **IPv6** interface. I've looked at using the **PrefixOrigin** and/or **SuffixOrigin** properties of objects returned by **Get-NetIPAddress** but this feels a little bit untrustworthy to me.

Well, if anyone reads this and has any ideas I'd be very grateful to hear about it!

**Edit:** After a bit more investigation on this, it seems you can quite happily set the **DHCP** property on an **IPv6** Interface using the **Set-NetIPInterface** cmdlet to whatever you like, regardless of whether or not a _static IP address_ is assigned. So it seems that the **DHCP** property returned by the **Get-NetIPInterface** cmdlet for **IPv6** addresses is meaningless. But I'd still love to know for sure.
