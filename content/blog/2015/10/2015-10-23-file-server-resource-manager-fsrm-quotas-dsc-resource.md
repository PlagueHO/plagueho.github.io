---
title: "File Server Resource Manager (FSRM) Quotas DSC Resource"
date: "2015-10-23"
categories: 
  - "desired-state-configuration"
  - "dsc"
  - "file-server-resource-manager"
  - "quotas"
tags: 
  - "fsrm"
---

### Introduction

After implementing (but not yet completing) the my [DFS Replication Groups](https://dscottraynsford.wordpress.com/2015/10/11/distributed-file-system-dsc-resource-update/) resource last week, I had an epiphany about another resource that I had begun writing some time ago but had run into problems with. The epiphany allowed me to resolve the issues holding up completion of this resource as well as dig more deeply into the **FSRM** for my studies.

### Resources

Initially I was going to create all of the **FSRM Resources** (File Groups, File Classifications etc) in a single module, but I quickly realized that this wasn't ideal as the number of modules to support this was actually quite large. Therefore I've decided to break this down into more manageable chunks. This is the first chunk. It contains the following resources:

- **cFSRMFileQuota** - configures FSRM Quotas.
- **cFSRMFileQuotaAction** - configures FSRM Quota Actions for Quotas.
- **cFSRMFileQuotaTemplate** - configures FSRM Quota Templates.
- **cFSRMFileQuotaTemplateAction** - configures FSRM Quota Template Actions for Quota Templates.
- **cFSRMAutoQuota** - configures FSRM Auto Quotas.

The purpose of the resources should be fairly self explanatory, as long as you have a basic understanding of how FSRM Quotas are used. If you aren't familiar with FSRM Quotas, [this](http://blogs.technet.com/b/josebda/archive/2008/08/20/the-basics-of-windows-server-2008-fsrm-file-server-resource-manager.aspx) is a good place to start - although why you'd be reading this if you're not familiar with FSRM Quotas already is beyond me.

There are some other Quota management DSC Resources available online and they look very easy to use, but they don't provide the complete set of functionality that these resources do because I tried to ensure that every Quota is available and as complete as possible. Which resources to use depends on your needs.

### Installing the Resource

If you have installed **WMF 5.0** you can just download this directly from the [PowerShell Gallery](https://www.powershellgallery.com/) by running this command:

\[sourcecode language="powershell"\] Install-Module -Name cFSRMQuotas \[/sourcecode\]

Otherwise you'll need to download this from the Microsoft Script Center [here](https://gallery.technet.microsoft.com/scriptcenter/cFSRMQuotas-DSC-Resource-114ec8cc) and unzip it into your **PowerShell modules path**.

### Using the Resource

Rather than go into detail on using this resource in this post, I thought I'd try and keep it short and just provide a [link to the documentation](https://github.com/PlagueHO/cFSRMQuotas). This covers the parameters available in the resources as well as some usage examples.

If you need some additional guidance or other specific examples, please feel free to let me know and I'll do my best to help you out.

### Summary

Well, there is not much more to say about this. Hopefully someone finds it useful. I intend to add complete the other chunks of the FSRM Resources over the coming weeks when I have time.

### Feedback

If you're interested in contributing to this resource, providing feedback or raising issues or requesting features, please feel free (anything is appreciated). You'll find the resource GitHub repository [here](https://github.com/PlagueHO/cFSRMQuotas) where you can fork, issue pull requests and raise issues/feature requests.

