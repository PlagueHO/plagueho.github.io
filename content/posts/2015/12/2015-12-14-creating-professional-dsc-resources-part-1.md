---
title: "Creating Professional DSC Resources -Part 1"
date: "2015-12-14"
categories:
  - "desired-state-configuration"
  - "dsc"
tags:
  - "powershell"
---

## Introduction

Writing **desired state configuration (DSC) resources** can be a little bit tricky at first if you've not come from a programming background. But once you've written one or two, you'll quickly find yourself churning them out like [Disney releases Star Wars branded rubbish](http://imgur.com/vtX5yJh). That is how it went for me.

However, I quickly found that there is a big difference between writing a simple resource for your own consumption and releasing a **community** **DSC resource** that may be used and abused by tens, hundreds or even thousands of people. After I decided to release my first resource ([this one](https://github.com/PlagueHO/cWSMan)) to the public, I quickly found that it really wasn't measuring up to what was being released by [Microsoft](https://github.com/PowerShell) and other folk in the community. So I spent about 6 months releasing and re-releasing my resources as I got to know the best practices.

So that gets us to the purpose of this post: to try and document the lessons I learned over the last year creating my own DSC resources and contributing to the Microsoft Community DSC resources. Hopefully by doing this it might save someone else a bit of time and avoid the joys or re-writing your resources.

_**Tip:** The **best practices** for creating DSC resources change quite often as better ways of doing things are discovered it is useful to keep and eye on some of the more active DSC resources (like [this one](https://github.com/PowerShell/xNetworking)) in the **Microsoft Community DSC resources**. Even since I started contributing the processes and best practices have changed quite a lot._

## Where to Start

If have no idea what **Desired State Configuration (DSC)** is, then [this](http://blogs.technet.com/b/privatecloud/archive/2013/08/30/introducing-powershell-desired-state-configuration-dsc.aspx) is a good place to start.

If you've _not_ created a **custom DSC resource** before, then you should first get to know the basic process before reading this guide. There are many [really great tutorials on creating DSC resources](http://powershell.org/wp/2014/03/13/building-desired-state-configuration-custom-resources/).

If you have written a resource or two or are familiar with the process, but you want to know how to go about releasing your **custom DSC resource** to the community then this post might interest you. So read on!

## Does it Already Exist?

Before even getting started writing a **custom DSC Resource** it is a good idea to see if it already exists. It might not be included in the standard DS resources or in the **Microsoft Community DSC Resources**, but someone else may have already created one that will work for you. So why re-invent the wheel?

The best places to look for DSC resources is to search on [PowerShell Gallery](https://www.powershellgallery.com/PSModule?q=DSC) (you'll find the **Microsoft Community DSC Resources** here as well). If you can't find anything that looks like it'll work for you, then you could also do a search on [GitHub](https://github.com/search?utf8=%E2%9C%93&q=DSC+language%3APowerShell+language%3APowerShell&type=Repositories&ref=advsearch&l=PowerShell&l=PowerShell).

If you have **WMF 5.0** installed (or have installed the [PowerShell Package Modules](https://www.microsoft.com/en-us/download/details.aspx?id=49186) installed) then you can search the **PowerShell Gallery** for DSC resources using **PowerShell** cmdlets:

\[gist\]ea7e54b197f4e85afd2d\[/gist\]

![ss_powershell_findmoduletagdsc](/images/ss_powershell_findmoduletagdsc.png)

**Note**: this will only find modules tagged with **DSC**. Some resources may not be tagged with this so they will not appear in this search. Therefore you may need to tweak the search.

If you find a resource you want to examine, you can install it using:

\[gist\]5e5080e5132655ca71e7\[/gist\]

Or if you're not sure you want to trust it you can use the **save-module** cmdlet to save a copy to a folder so you can open and examine the resource code:

\[gist\]270fa0b326e0c74506b1\[/gist\]

If you find the DSC resource module else where you'll need to download and install it manually - the same way install any other module.

## Modifying an Existing Resource

If you find something that is close to what you need, but is missing some parameter or functionality, rather than starting a whole new resource you could ask the maintainer if they would be able to add the feature for you. Or even better, you could ask the maintainer if they'd object to you making the change and submitting it back to them via a **Pull Request**. Even if they're not interested including your change, at least you can modify their resource adding the functionality you need - which will save you a lot of time**.** But in my experience, most maintainers are grateful for the assistance and welcome new features (as long as they go along with the resources overall design).

In fact, I've learned more from helping out on the community resources than from writing my own. If you have some spare time and want to help the community out, I'd strongly recommend helping out on the [Microsoft Community DSC Resources](https://github.com/PowerShell). Just head over there, take a look at a resource you're interested in then have a look at the **issues** for the resource and you're bound to find a request or two for additional features. If you don't find a request for a new feature but you see that one is missing that you'd like to see implemented, raise an issue yourself and offer to create it.

At the time I wrote this post there were some big holes in the functionality of most of the existing DSC community resources. The [xDNSServer](https://github.com/PowerShell/xDnsServer) resource is a prime example.

_**Tip:** one of the best ways to learn how to write professional quality resources is to look at some of the **Microsoft Community DSC Resources**. I'd strongly recommend the [xNetworking](https://github.com/PowerShell/xNetworking) resource (no, not because I contributed to it a bit) because it is very active and when best practices are updated this tends to be one of the first resources to get updated._

## Source Control

So you've decided you're going to write a new DSC resource (or modify an existing one). First thing you'll need to be a little bit familiar with is **Source Control**. This used to be mainly the realm of developers, but it should now be a key tool in the **Operations** toolbox. I'm going to assume that you are a little bit familiar with **Git** and **GitHub** for this series.

If you're not familiar with using **Git** and **GitHub**, [this](https://github.com/PowerShell/DscResources/blob/master/GettingStartedWithGitHub.md) is the article you should read. It is written by the **DSC Community** and covers the basics, all from a **DSC** perspective. Even if you are familiar with **Git** and **GitHub** but haven't used it for **DSC resources**, this document is worth a read.

Here is a summary of the **Source Control** things you should already know/have done:

1. You should have a [GitHub](https://github.com/) account (it's free). This is the most likely place you'll be storing your DSC Resources, and you'll find the other community ones here too.
2. You should have downloaded and installed the [Git](https://git-scm.com/downloads) client, [GitHub Desktop](https://desktop.github.com/) client or be using a tool like [Microsoft Code](https://code.visualstudio.com/Download) that has a **Git** client built in.
3. Ideally you should be familiar with what **Forks, Branches** and a **Pull Requests** are. There are some pretty [amazing guides](http://rogerdudler.github.io/git-guide/) out there that will tell you everything you need to know in about 10 minutes.
4. Decided if you're going to create a **new** resource or **fork** someone elses and modify it.

## Gitter: Asking Questions

Something I didn't find out till many months after I started to contribute was that there is a [Gitter chat channel](https://gitter.im/PowerShell/DscResources) where you can chat directly with some of the many of the people who contribute to the **Microsoft Community DSC Resources**. It is a great place to lurk and just see what is going on. If you want to contribute to a resource but you're not sure what, if you ask, I'm sure you'll receive lots of suggestions as to what needs some work. You'll learn a lot just watching the discussion and if you need some help it's a great place to ask.

_**Tip:** If you have a **GitHub** account, you can sign in to **Gitter** with it._

## What Next?

So, that is pretty the introduction over with. In the next article in this series I'm going to cover what you should do when you're going to start a **DSC Resource** from scratch - one that you intend on releasing to the community. The final part of the series I'll cover adding features to an existing **Microsoft Community DSC Resource**.

Hopefully this is of interest to a few out there and it doesn't scare off any potential DSC contributors. It really is a great feeling to contribute back to the community.

Further parts in this series:

- [Creating Professional DSC Resources - Part 2](https://dscottraynsford.wordpress.com/2015/12/14/creating-professional-dsc-resoures-part-2)
- [Creating Professional DSC Resources - Part 3](https://dscottraynsford.wordpress.com/2015/12/16/creating-professional-dsc-resources-part-3/)
- [Creating Professional DSC Resources - Part 4](https://dscottraynsford.wordpress.com/2015/12/18/creating-professional-dsc-resources-part-4/)
- [Creating Professional DSC Resources - Part 5](https://dscottraynsford.wordpress.com/2015/12/20/creating-professional-dsc-resources-part-5/)
- [Creating Professional DSC Resources - Part 6](https://dscottraynsford.wordpress.com/2015/12/23/creating-professional-dsc-resources-part-6/)
- [Creating Professional DSC Resources - Part 7](https://dscottraynsford.wordpress.com/2016/01/25/creating-professional-dsc-resources-part-7/)

