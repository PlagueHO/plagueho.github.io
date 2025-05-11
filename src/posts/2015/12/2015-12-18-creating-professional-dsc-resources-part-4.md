---
title: "Creating Professional DSC Resources - Part 4"
date: 2015-12-18
description: "Creating Professional DSC Resources - Part 4"
tags:
  - "distributed-file-system"
  - "dsc"
  - "desired-state-configuration"
  - "powershell"
isArchived: true
---

The purpose of this series of articles is to try and document a few of the lessons I learned while releasing new DSC resources as well as contributing to the existing **Microsoft Community DSC resources**. These articles are not intended to tell you how to write DSC resources from a programming perspective but to give you some ideas on what might be expected of a DSC resource you’re releasing to the public. For example, **unit** and **integration** tests (don’t worry if you aren’t familiar with those terms).

These articles are also not intended to tell you what you **must** do to release your resource but more to document what will help your resource be easier to use and extend by other people. Some of these things are obvious for people who have come from the **development** community but may be quite new to **operations** people.

If you missed any previous articles, you can find them here:

- [Creating Professional DSC Resources – Part 1](/blog/creating-professional-dsc-resources-part-1/)
- [Creating Professional DSC Resources - Part 2](/blog/creating-professional-dsc-resources-part-2/)
- [Creating Professional DSC Resources - Part 3](/blog/creating-professional-dsc-resources-part-3/)

## Automated Testing

**Automated testing** is something that is familiar to most **developers**, but for **operations** people, it is usually a new concept. However, it is one of the most important things you can add to your **DSC Resources**—and most DSC resource projects won't even accept your code contributions if they don't contain **automated tests**.

So, what are **automated tests**? Well, they are just **PowerShell scripts** that _you_ create and run that will check your **DSC Resource** is working correctly. Usually, **automated tests** are run on your **DSC Resources** every time you commit your code—and they'll tell you if anything has gone wrong. I could spend the next day listing reasons why **automated testing** is extremely important, but that is not the purpose of this post.

**PowerShell** contains a great **automated test** framework called [Pester](https://github.com/pester/Pester) that allows you to _describe_ your tests using special **PowerShell** functions.

> [!NOTE]
> If you aren't familiar with **Pester** and **automated testing**, you should get familiar with it before reading any further. [This series](http://blogs.technet.com/b/heyscriptingguy/archive/2015/12/14/what-is-pester-and-why-should-i-care.aspx) is a fantastic place to start. Even if you're familiar with **Pester**, it is a good read.

An example of a **Pester** test on a **DSC Resource**:

```powershell
Describe 'MSFT_xFirewall\Get-TargetResource' {
    Context 'Absent should return correctly' {
        Mock Get-NetFirewallRule

        It "Should return absent on firewall rule $($FirewallRule.Name)" {
            $result = Get-TargetResource -Name 'FirewallRule'
            $result.Name | Should Be 'FirewallRule'
            $result.Ensure | Should Be 'Absent'
        }
    }

    Context 'Present should return correctly' {
        $result = Get-TargetResource -Name $FirewallRule.Name

        # Looping these tests
        foreach ($parameter in $ParameterList) {
            $ParameterSource = (Invoke-Expression -Command "`$($($parameter.source))")
            $ParameterNew = (Invoke-Expression -Command "`$result.$($parameter.name)")
            It "should have the correct $($parameter.Name) on firewall rule $($FirewallRule.Name)" {
                $ParameterSource | Should Be $ParameterNew
            }
        }
    }
}
```

The above test is a **unit** test of the **xFirewall** resource in the **xNetworking** module. Don't worry if you don't completely understand this yet—that is the purpose of this article—although you should understand the basic structure of the **Pester** test. If you don't, you'll definitely want to go and review [this series](http://blogs.technet.com/b/heyscriptingguy/archive/2015/12/14/what-is-pester-and-why-should-i-care.aspx).

## Types of Automated Tests

There are two types of **automated tests** you should create for your **DSC Resources**:

1. **Unit Tests** - These test that each function in your **DSC Resource** works correctly in **isolation**. This means that if you call the **function** with a set of parameters, you get the expected output.
2. **Integration Tests** - These tests ensure that your **DSC Resource** works in a real environment—e.g., works correctly when they are actually **integrated** into a **DSC Configuration** file.

For every **DSC Resource** in your **DSC Resource Module**, you should ensure that there is one **unit test** file and one **integration test** file (although usually for integration tests, a support file is also needed, but we'll cover this later).

## Test Folders

You should place all tests inside a **Tests** folder in the root of your **DSC Module** folder:

![Test Folders](/assets/images/screenshots/ss_dsc_testfolders.png)

**Unit** tests should be placed in a **Unit** folder within **Tests**, and ... I'm sure you get where I'm going here.

---

In the next article, I'll cover **unit tests** for **Set-TargetResource** and **Test-TargetResource**, as well as unit testing any additional functions. Thanks again for reading, and I hope it is useful.

Further parts in this series:

- [Creating Professional DSC Resources - Part 5](/blog/creating-professional-dsc-resources-part-5/)
- [Creating Professional DSC Resources - Part 6](/blog/creating-professional-dsc-resources-part-6/)
- [Creating Professional DSC Resources - Part 7](/blog/creating-professional-dsc-resources-part-7/)
