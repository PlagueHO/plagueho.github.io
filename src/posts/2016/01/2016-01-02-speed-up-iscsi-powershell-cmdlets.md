---
title: "Speed up iSCSI PowerShell cmdlets"
date: 2016-01-02
description: "A quick tip about speeding up iSCSI PowerShell cmdlets."
tags:
  - "iscsi"
  - "powershell"
isArchived: true
---

I've been spending a bit of time lately completing a set of **DSC Resources** for configuring **iSCSI** **Targets** and **iSCSI Initiators**. One thing I've noticed is that these **iSCSI** cmdlets are extremely slow:

![ss_iscsi_measuregetiscsivirtualdisk](/assets/images/screenshots/ss_iscsi_measuregetiscsivirtualdisk.png)
21 seconds is just too slow!

Now, if I was just calling this cmdlet every now and then it really wouldn't matter so much - as long as it works. However, because this cmdlet is going to be called every few minutes when used in a **DSC Resource** it is unacceptable.

I've seen this sort of issue before. It is often caused by the cmdlet looking for things on the network that don't exist. This means that a TCP timeout might occur before the cmdlet will complete. So I thought a way of possibly eliminating this is to specify the computer the cmdlet should work against - in the case of a **DSC Resource** it is always **LocalHost**.

So I gave this a shot:

![ss_iscsi_measuregetiscsivirtualdisklocalhost](/assets/images/screenshots/ss_iscsi_measuregetiscsivirtualdisklocalhost.png)
49 milliseconds is very acceptable.

That is a 42,000% speed increase, which is definitely acceptable.

To confirm that the cmdlet is still working as expected:

![ss_iscsi_getiscsivirtualdisklocalhost](/assets/images/screenshots/ss_iscsi_getiscsivirtualdisklocalhost.png)
Yes, all the iSCSI Virtual Disks are there.

_**Important Note:** You must set the **ComputerName** to the exact test "**LocalHost"** and not the actual computer name of the local machine. If you use the local computer name, the cmdlet will still be slow:_

![ss_iscsi_measureiscsivirtualdisklocalcomputer](/assets/images/screenshots/ss_iscsi_measureiscsivirtualdisklocalcomputer.png)
21 seconds again, no good.

All of the **iSCSI Target** cmdlets in the **iSCSI Target** module seem to suffer from this problem, so adding the -**ComputerName LocalHost** parameter to them should speed things up across the board. Obviously, this is only going to work if you're actually manipulating **iSCSI Targets** on the **LocalHost** - if you're trying to configure a remote computer then you'll need to set the remote computer name.

Hope this one shaves a number of seconds off some scripts out there.

Also, Happy 2016!
