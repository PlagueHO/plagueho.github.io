---
title: "Pester as an Operation Validation Framework"
date: "2015-11-13"
categories: 
  - "pester"
  - "windows-server-2016"
---

In [this](https://channel9.msdn.com/Shows/about-it/Episode-003-Jeffrey-on-Nano-Containers-and-the-Modern-App-Platform) latest video on Channel 9 Jeffrey Snover (the grand wizard of PowerShell) is suggesting might be on the horizon in Windows Server 2016. In it he is saying they are looking at using Pester (or a form of it) to allow you to create Operational Validation tests for your servers and environment so that after any environmental changes are made the environment is validated automatically. This sound like a fantastic idea to me and such an obvious fit to Pester. After doing a bit of digging around it seems like this idea has been around for a while - see this [post here](https://pshirwin.wordpress.com/2015/11/06/pester-script-to-test-dns-configuration/) for an example of how it can be used in practice.

Of course there does feel like there is a little bit of an overlap here with DSC, but I'm sure the implementation will play well with DSC. All of these new ideas technologies (Nano, Containers, DSC, Operational Pester tests etc) are just more tools in the "Infrastructure as Code" tool belt. So I'm very happy.

I suggest watching the whole video (found [here](https://channel9.msdn.com/Shows/about-it/Episode-003-Jeffrey-on-Nano-Containers-and-the-Modern-App-Platform)) as it is really interesting, but if you want to just jump to the bit about Pester, it starts at about 11:48. I am really eager to see where Microsoft is going with this stuff in Windows Server 2016. Roll on TP4!
