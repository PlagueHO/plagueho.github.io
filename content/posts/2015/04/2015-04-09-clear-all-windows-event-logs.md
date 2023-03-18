---
title: "Clear All Windows Event Logs"
date: "2015-04-09"
tags:
  - "event-log"
  - "powershell"
---

Just a quick one this time.

One thing I often like to do on my lab machines (servers and clients) is clear out all event logs. Not just the older style Windows Logs, but the newer Applications and Services Logs as well: [![Event Viewer Logs](/images/ss_eventviewer.png?w=646)](/images/ss_eventviewer.png)

The easiest way I've found to do this is just run the following PowerShell command in an Administrator PowerShell console:

get-winevent -ListLog \* | % { \[System.Diagnostics.Eventing.Reader.EventLogSession\]::GlobalSession.ClearLog($\_.LogName) }

This will dump the content of every Windows Log and Applications and Services log in one go.

Be aware, this is a one-way ticket - you can't recover the content of these logs after they've been deleted!

So if you're a bit concerned and want to archive the content before it gets deleted use this command instead:

get-winevent -ListLog \* | % { \[System.Diagnostics.Eventing.Reader.EventLogSession\]::GlobalSession.ClearLog($\_.LogName,"d:\\LogArchive\\$($\_.LogName -replace '/','.').evtx") }

You'll want to configure the **d:\\ArchiveLog** to set the path you want the old events saved to. All the events will be saved into this folder with one file for each event log:

[![Events after they've been archived](/images/ss_events_archived.png?w=660)](/images/ss_events_archived.png)

Simple as that!

\\m/

