---
title: "Creating Professional DSC Resources – Part 6"
date: "2015-12-23"
categories: 
  - "desired-state-configuration"
  - "dsc"
  - "pester"
tags: 
  - "powershell"
---

The purpose of this series of articles is to try and document a few of the lessons I learned while releasing new DSC resources as well as contributing to the existing **Microsoft Community DSC resources**. These articles are not intended to tell you how to write DSC resources from a programming perspective, but to give you some ideas on what might be expected of a DSC resource you’re releasing to the public. For example, **unit** and **integration** tests (don’t worry if you aren’t familiar with those terms).

These articles are also not intended to tell you what you **must** do to release your resource, but more document what will help your resource be easier to use and extend by other people. Some of these these things are obvious for people who have come from the **development** community, but may be quite new to **operations** people.

If you missed any previous articles you can find them here:

- [Creating Professional DSC Resources – Part 1](https://dscottraynsford.wordpress.com/2015/12/14/creating-professional-dsc-resources-part-1/)
- [Creating Professional DSC Resources - Part 2](https://dscottraynsford.wordpress.com/2015/12/14/creating-professional-dsc-resoures-part-2/)
- [Creating Professional DSC Resources - Part 3](https://dscottraynsford.wordpress.com/2015/12/16/creating-professional-dsc-resources-part-3/)
- [Creating Professional DSC Resources - Part 4](https://dscottraynsford.wordpress.com/2015/12/18/creating-professional-dsc-resources-part-4/)
- [Creating Professional DSC Resources - Part 5](https://dscottraynsford.wordpress.com/2015/12/20/creating-professional-dsc-resources-part-5/)

 

## Recap

In the last couple of articles I covered the importance of **automated testing** and covered **unit testing** in particular (I'll get to **integration testing** later). I had covered creating new **unit tests** using the **unit** **test templates** that are available [here](https://github.com/PowerShell/xNetworking/tree/dev/Templates) (although they will probably move [here](https://github.com/PowerShell/DscResources)). I also covered how to complete the **Pester Test Initialization** and the **Get-TargetResource** and **Set-TargetResource** function areas of the **unit test**.

 

## Unit Testing Completion

The final task in completing the **unit tests** is to complete the **Set-TargetResource ** in tests and also optionally tests for any other supporting functions your **DSC Resource** may have required.

In these **unit tests** I am using a **DSC Resource** for creating _iSCSI Virtual Disks_ to illustrate the process. You don't need to know anything about _iSCSI Virtual Disks_ to understand these articles or resources, but if you're interested to know the **cmdlets** I'm using for these, see [this](https://technet.microsoft.com/en-us/library/jj612803%28v=wps.630%29.aspx) page. I'm using the **\*\_iSCSIVirtualDisk** cmdlets in this **DSC Resource**.

### Function Test-TargetResource

This area will contain the actual **Pester** tests that test the **Test-TargetResource** function. These are fairly similar to the **Set-TargetResource** except we will be checking these two things:

1. The output of the **Test-TargetFunction** is correct. E.g. it returns **false** if changes are required, which will cause **Set-TargetFunction** to be called.
2. The expected **Mocks** are called by the **Function**.

This area may contain a large number of tests depending on the complexity of your **DSC** **Resource**. In most cases, you should expect there to create the tests from the following list, but often you will need even more for 100% code coverage:

- Does the function return **false** when the _resource being configured_ **does exist** and **should**, but one of the configured parameters **does not match** the current values? This test is usually repeated for _each parameter_ in the **DSC Resource**.
- Does the function return **true** when the _resource being configured_ **does exist** and **should**, and **all** the configured parameters **match** the current values?
- Does the function return **false** when the _resource being configured_ **does not exist** but **should**?
- Does the function return **false** when the _resource being configured_ **does exist** but **should not**?
- Does the function return **true** when the _resource being configured_ **does not exist** and **should not**?

The bottom four of these tests are very similar. So I'll only show examples of the top two **contexts** here.

#### Context 'Virtual Disk exists and should but has a different ...'

In this scenario we **Mock** the **Get-iSCSIVirtualDisk** cmdlet to return the object we defined in the **Pester Test Initialization** section. This is the behavior we'd expect if the _resource being configured_ does exist:

\[gist\]782db99150f72e90f0b5\[/gist\]

This **context** will perform two tests:

1. **Should return false** - The **Test-TargetResource** should return false because we are changing the **Description** parameter so that the resource will require changes (e.g. **Set-TargetResource** should be called).
2. **Should call the expected mocks** - The **Test-TargetResource** should call the **mocked** cmdlets the expected number of times. In all contexts in this function this will always be just once.

The purpose of **cloning** the **$TestVirtualDisk** object is so we can modify the properties to simulate a property difference without modifying the **$TestVirtualDisk** object.

You should expect to repeat this **context** for each parameter that might be different.

 

#### Context 'Virtual Disk does not exist but should'

In this scenario we **Mock** the **Get-iSCSIVirtualDisk** cmdlet to return nothing. This is the behavior we'd expect if the _resource being configured_ does **not** exist:

\[gist\]d1f47fba25efc2a6afb9\[/gist\]

As you can see, there is not too much different with these tests and you shouldn't have any problems figuring out the remaining ones. Just remember, the goal is always to get 100% code coverage.

 

### Unit Testing Supporting Functions

It is quite common that you might have implemented some _supporting_ functions in your **DSC Resource**. These _supporting_ functions are usually called by your standard **\*-TargetResource** functions. If that is the case there are two **important** things you should do:

1. Write **unit tests** that cover all code paths in your _supporting_ functions.
2. Add **mocks** to your **\*-TargetResource** **unit tests** that prevent any constructive/destructive **cmdlets** that exist in your _supporting_ functions from being called.

The first item is fairly self explanatory. For example, I often implement a **get-\*** function in my **DSC Resources** which is used to pull the actual objects that will be used by the **\*-TargetResource** functions (e.g. **Get-VirtualDisk**):

\[gist\]374958535d7308925ac4\[/gist\]

To **unit test** this function I'd write **unit tests** that tested the following contexts:

1. **Context 'Virtual Disk does not exist'**
2. **Context 'Virtual Disk does exist'**

For example:

\[gist\]593cdfc77c63d5fe19b4\[/gist\]

As you can see, there isn't much to it.

**_Earn a Chocolate Fish_**_: If you look at the above **supporting function** and **unit tests** carefully, you'll notice that I haven't got 100% code coverage on it!_

_To get 100% code coverage I would have had to implement a **unit test** that covered the situation where the **Get-iSCSIVirtualDisk** function threw an exception that wasn't a **\[Microsoft.Iscsi.Target.Commands.IscsiCmdException\]** exception._

_In case you're wondering, the **Get-iSCSIVirtualDisk** function throws a **\[Microsoft.Iscsi.Target.Commands.IscsiCmdException\]** when the cmdlet is called with the **path** parameter set to a path that does not contain a valid **iSCSI** **Virtual Hard Disk** file._

 

### Unit Testing Exceptions

When creating **unit tests** you'll often need to test a scenario where the function that is being tested is **expected** to throw an exception. If you read the **Pester** documentation, you'd might write a test for an exception like this:

\[gist\]83a33073d9e29ccf35af\[/gist\]

This would of course will work. It will ensure that the code throws an exception in this situation. The problem is we aren't really sure if it is the exception that we expected it to throw. It could have been thrown by some other part of our code.

So to improve on this we need to do things:

1. Customize the exception that is thrown.
2. Change the **unit test** so that it checks for the customized exception.

 

#### Customize the Exception

To create a custom exception we need to create a new **exception object** containing our **custom error message**. The **exception object** is then used to create a custom **Error Record**:

\[gist\]1e9f3d8e8d885c3dfecc\[/gist\]

In the above code, you just need to customize the **$errorId** and **$errorMessage** variables. The **$errorId** should just contain a simply string identifier for this particular type of error, but the **$errorMessage** can contain a full description of the error, including related parameters.

Once you've created the **$errorRecord** object you can call the **ThrowTerminatingError** method of the **$PSCmdLet** object, passing the **$errorRecord** object as the parameter.

_**Important:** the **$PSCmdLet** object is only available in **Functions** that include the **\[CmdletBinding()\]** function attribute. So ensure your **\*-TargetResource** and **supporting functions** include this attribute if you want to be able to access this object._

 

#### Test for the Customized Exception

To test for the custom exception object we need to create an identical object in the **unit test** and test for it:

\[gist\]ab32cf7c028dfb0c0f87\[/gist\]

The above code creates an identical **exception object** to the one produced by the exception in our **DSC Resource** code. The **exception object** can then be passed to the **should** **throw** cmdlet. If a different exception is thrown by the code then the test will fail - it will only pass if the exception object is **exactly** the same.

_**Important:** Make sure both the **$errorId** and **$errorMessage** variables are exactly the same as what would be produced by the code when your **unit test** calls it. This includes ensuring that if your **$errorMessage** contains any parameters that the **unit test** **$errorMessage** contains the same parameter values._

 

That about completes creating **unit tests**. After you've implemented a few **unit tests** you'll no doubt come up with your own method of implementing them, but hopefully this has given you a place to start.

 

## Up Next - Integration Tests

In the next article, I'll cover the **integration tests**. There are often the most difficult to implement, but if you can take the time to implement them then your **DSC Resources** are guaranteed to be extremely robust and bugs are far less likely to slip through.

Further parts in this series:

- [Creating Professional DSC Resources - Part 7](https://dscottraynsford.wordpress.com/2016/01/25/creating-professional-dsc-resources-part-7/)
