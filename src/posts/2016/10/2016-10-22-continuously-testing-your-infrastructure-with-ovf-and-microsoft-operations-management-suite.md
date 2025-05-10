---
title: "Continuously Testing your Infrastructure with OVF and Microsoft Operations Management Suite"
date: 2016-10-22
description: "A guide to using OVF and Microsoft Operations Management Suite to continuously test your infrastructure."
tags:
  - "oms"
  - "ovf"
  - "powershell"
image: "/assets/images/blog/ss_ovfoms_omslogsearchevents.png"
---

## Introduction

One of the cool new features in Windows Server 2016 is [Operation Validation Framework](https://github.com/PowerShell/Operation-Validation-Framework). **Operation Validation Framework (OVF)** is an (open source) PowerShell module that contains:

> A set of tools for executing validation of the operation of a system. It provides a way to organize and execute Pester tests which are written to validate operation (rather than limited feature tests)

One of the things I've been using **OVF** for is to **continuously test** parts of my infrastructure. Any time a failure occurs an **error** event is written to the **Event Log**. I then have **Microsoft Operations Management Suite** set up to monitor my **Event Log** for any **errors** and then alert me (by e-mail) if they occur.

_Note: OVF tests are just [Pester](https://github.com/pester/Pester) tests, so if you've ever written a Pester test then you'll have no trouble at all with OVF. If you haven't written a Pester test before, [here is a great introduction](http://www.powershellmagazine.com/2014/03/12/get-started-with-pester-powershell-unit-testing-framework/). If you're going to just learn one thing about PowerShell this year, I'd definitely suggest Pester._

The great thing about **OVF** is that it can test _**anything**_ that PowerShell can get information about - which is practically anything. For some great examples showing how to use OVF to test your infrastructure, see [this article](https://pshirwin.wordpress.com/2016/04/08/active-directory-operations-test/) or [this article](https://pshirwin.wordpress.com/2015/11/06/pester-script-to-test-dns-configuration/) by the insightful [Irwin Strachan](https://twitter.com/IrwinStrachan).

In this article I'm going to show you how to set up a basic set of OVF tests to **continuously test** some DNS components on a server, write any failures to the **Event Log** and then configure **Microsoft OMS** to monitor the Event Log for **OVF failures** and alert you if and something breaks.

I am calling my tests **ValidateDNS** which is reflected in the files and **Event Log** **Source** for the events that are created, but you can call these tests what ever you like. I'm also going to create my tests and related files as a **PowerShell Module** with the same name (**ValidateDNS**). You don't have to do this - you could make a much simpler process, but for me it made sense because I could then publish my set of tests to my own [private PowerShell Gallery](https://github.com/PowerShell/PSPrivateGallery) or to a [Sonatype Nexus OSS](https://www.sonatype.com/nexus-repository-oss) server.

I am also going to assume you've got an [Microsoft Operations Management Suite](https://www.microsoft.com/en-us/cloud-platform/operations-management-suite) account all setup. If you don't have an OMS account, you can [get a free trial one here](https://www.microsoft.com/en-us/cloud-platform/operations-management-suite-trial). You should also have the **OMS Windows Agent** installed onto the machine that will execute your OVF tests.

## Let's Do This!

### Step 1 - Installing the OperationValidation Module

The **OperationValidation** PowerShell module comes in-box with **Windows Server 2016** (and **Windows 10 AE**), but must be downloaded for earlier operating systems.

To download and install the **OperationValidation** PowerShell module on earlier operating systems enter the following cmdlet in an Administrator PowerShell console:

```powershell
Install-Module -Name OperationValidation
```

![ss_ovfoms_installoperationvalidation](/assets/images/blog/ss_ovfoms_installoperationvalidation.png)

This will download the module from the [PowerShell Gallery](https://www.powershellgallery.com/packages/OperationValidation).

_Note: to download modules from the PowerShell Gallery you'll either need [WMF 5.0](https://www.microsoft.com/en-us/download/details.aspx?id=50395) or [PowerShell PackageManagement](https://www.microsoft.com/en-us/download/details.aspx?id=51451) installed. I strongly recommend the former option if possible._

### Step 2 - Create OVF Test Files

The next step is to create the OVF tests in a file. OVF work best if they are contained in a specific folder structure in the **PowerShell Modules** folder.

_Note: you can create the the OVF tests in a different location if that works for you, but it requires specifying the **\-testFilePath** parameter when calling **Invoke-OperationValidation**._

1. Create a folder in your PowerShell Modules folder (c:\\program files\\WindowsPowerShell\\Modules) with the name of your tests. I used **ValidateDNS**.
1. In the **ValidateDNS** folder create the following folder structure:

    - Diagnostics\\
        - Simple_\\_
        - Comprehensive_\\_

    ![ss_ovfoms_folderstructure](/assets/images/blog/ss_ovfoms_folderstructure1.png)
1. In the **Simple** folder create a file called **ValidateDNS.Simple.Tests.ps1** with the contents: 

    ```powershell
    Describe 'DNS' {
        It 'Should be running' {
            (Get-Service -Name DNS).Status | Should Be Running
        }
            
        $Forwarders = Get-DnsServerForwarder
            
        It 'First forwarder should be 8.8.8.8' {
            $Forwarders.IPAddress[0] | Should Be '8.8.8.8'
        }
    
        It 'Second forwarder should be 4.4.4.4' {
            $Forwarders.IPAddress[1] | Should Be '4.4.4.4'
        }
    
        It 'Should resolve microsoft.com' {
            { Resolve-DnsName -Server LocalHost -Name microsoft.com } | Should Not Throw
        }
    }
    ```

1. Edit the tests and create any that are validate the things you want to test for.

The OVF tests above just check some basic settings of a DNS Server and so would normally be run on a Windows DNS Server. As noted above, you could write tests for almost anything, including validating things on other systems. I intentionally have setup one of the tests to fail for demonstration purposes (a gold star for anyone who can tell which test will fail).

_In a future article I'll cover how to test components on remote machines so you can use a single central node to perform all your OVF testing._

### Step 3 - Create a Module for Running the Tests

Although we could just run the tests as is, the output will just end up in the console, which is not what we want here. We want any failed tests to be put into the **Application Event Log****.**

1. Create a file called **ValidateDNS.psm1** in the **ValidateDNS** folder created earlier.
1. Add the following code to this **ValidateDNS.psm1** file:

    ```powershell
    function Invoke-ValidateDNS {
        [cmdletbinding()]
        param (
            [String] $EventSource = 'ValidateDNS',
    
            [Int32] $EventId = 10000,
    
            [ValidateSet('Simple','Comprehensive')]
            [String] $TestType = 'Simple'
        )
    
        # Edit these settings
    
        # Add the Event Source if it doesn't exist
        if (-not [system.diagnostics.eventlog]::SourceExists($EventSource)) {
            [system.diagnostics.EventLog]::CreateEventSource($EventSource, 'Application')
        } # if
    
        # Execute the tests
        $FailedTests = Invoke-OperationValidation -ModuleName ValidateDNS -TestType $TestType |
            Where-Object -Property Result -EQ -Value 'Failed'
    
        # Add the Failed tests to the Event Log
        foreach ($FailedTest in $FailedTests) {
            Write-EventLog `
                -LogName Application `
                -Source $EventSource `
                -EntryType Error `
                -Message $FailedTest.Name `
                -EventId $EventId `
                -Category 0
            $EventId++
        } # foreach
    }
    ```

1. Save the **ValidateDNS.psm1**

The above file is a PowerShell Module will make available a single cmdlet called **Invoke-ValidateDNS**. We can now just run **Invoke-ValidateDNS** in a PowerShell console and the following tasks will be performed:

- create a new Event Source for the **Applications Event Log** that we can use in OMS to identify any errors thrown by our tests.
- Execute the OVF tests in **ValidateDNS.Simple.Tests.ps1**.
- Add **Error** entries to the **Applications Event Log** for _each failed test_.

## Step 4 - Schedule the Script

This step we will create a Scheduled Task to run the cmdlet we created in Step 3. You could use the **Task Scheduler UI** to do this, but this is a PowerShell blog after all, so here is a script you can run that will create the scheduled task:

```powershell
$Cred = Get-Credential -Message 'User to run task as'
$Action = New-ScheduledTaskAction `
    –Execute 'PowerShell.exe' `
    -Argument '-WindowStyle Hidden -Command "Import-Module ValidateDNS; Invoke-ValidateDNS;"'
$Trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date -Hour 0 -Minute 0 -Second 0) `
    -RepetitionInterval (New-TimeSpan -Minutes 60) `
    -RepetitionDuration ([System.TimeSpan]::MaxValue)
$Task = New-ScheduledTask `
    -Description 'Validate DNS' `
    -Action $Action `
    -Trigger $Trigger
Register-ScheduledTask `
    -TaskName 'Validate DNS' `
    -InputObject $Task `
    -User $Cred.UserName `
    -Password $Cred.GetNetworkCredential().Password
```

![ss_ovfoms_scheduletask](/assets/images/blog/ss_ovfoms_scheduletask2.png)

You will be prompted for the account details to run the task under, so enter **valid credentials** for this machine _that give the task the correct access to run the tests_. E.g. if the tests need Local Administrator access to the machine to run correctly, then ensure the account assigned is a Local Administrator.

This will run the script every 60 minutes. You could adjust it easily to run more or less frequently if you want to. This is what the Task Scheduler UI will show:

![ss_ovfoms_scheduletaskui.png](/assets/images/blog/ss_ovfoms_scheduletaskui1.png)

Every time the tests run and a test failure occurs the Application Event Log will show:

![ss_ovfoms_errorevent](/assets/images/blog/ss_ovfoms_errorevent.png)

Now that we have any test failures appearing in the Event Log, we can move onto Microsoft Operations Management Suite.

## Step 5 - Create a Log Search and Alert

As noted earlier, I'm assuming you have already set up the computer running your OVF tests to your OMS account as a data source:

![ss_ovfoms_omsagent](/assets/images/blog/ss_ovfoms_omsagent1.png)

What we need to do now is create and save a new Log Search that will select our OVF test failures. To do this:

1. In OMS, click the **Log Search** button.
1. In the **Search** box enter (adjust the Source= if you used a different name for your tests in earlier tests):

    (Type=Event) (EventLevelName=error) (Source=ValidateDNS)

    ![ss_ovfoms_omslogsearch](/assets/images/blog/ss_ovfoms_omslogsearch.png)
1. You will now be shown all the events on **all** **computers** matching these criteria: ![ss_ovfoms_omslogsearchevents](/assets/images/blog/ss_ovfoms_omslogsearchevents.png)_From here you could further refine your search if you want, for example, I could have added additional filters on Computer or EventId. But for me this is all I needed._
1. Click **Save** to save the **Log Search**.
1. In the **Name** enter 'Validate DNS Events' and in the **Category** enter 'OVF': ![ss_ovfoms_omslogsearchsave](/assets/images/blog/ss_ovfoms_omslogsearchsave.png)
1. You can actually enter whatever works for you here.
1. Click **Save**.
1. Click the **Alert** button to add a new **Alert Rule**.
1. Configure the Alert Rule as follows (customizing to suit you): ![ss_ovfoms_omslogsearchalert](/assets/images/blog/ss_ovfoms_omslogsearchalert.png)
1. Click **Save** to save the Alert.

You're now done!

The DNS Admins will now receive an e-mail whenever any of the DNS validation tests fail:

![ss_ovfoms_omserroremail](/assets/images/blog/ss_ovfoms_omserroremail.png)

If you look down in the **ParamaterXML** section you can even see the test that failed. So the DNS Admins can dive straight to the root of the problem.

How cool is that? Now we can feel more confident that problems will be noticed by our technical teams when they happen rather than waiting for an end user to complain.

Of course the tests above are fairly basic. They are just meant as an example of what sort of things can be done. Some of our teams have put together far more comprehensive sets of tests that validate things like ADFS tokens and SSL certificate validity.

## Final Thoughts

There are a few things worth pointing about the process above:

1. I chose to use **OVF** to execute the tests but I could have just as easily used plain old **Pester**. If it makes more sense to you to use Pester, go right ahead.
1. I used **Microsoft OMS** to centrally monitor the events, but I could just of easily used Microsoft System Center Operations Manager (SCOM). There are many other alternatives as well. I chose OMS though because of the slick UI and [mobile apps](https://www.microsoft.com/en-us/cloud-platform/operations-management-suite-mobile-apps). Use what works for you.
1. This guide is intended to show what sort of thing can be done. It isn't intended to tell you what you must do or how you must do it. If there is something else that works better for you, then use it!

Although I've focused on the technology and methods here, if you take away one thing from this article I'd like it to be this:

> **Continuous Testing** of your infrastructure is something that is **really easy** to implement and **has so many benefits**. It will allow **you** and **your stakeholders** to feel **more confident** that **problems are** **not going unnoticed** and **allow them to sleep better**. It will also ensure that **when things do go wrong** (and they always do) that the **first people to notice are the people who can do something about it**!

Happy infrastructure testing!
