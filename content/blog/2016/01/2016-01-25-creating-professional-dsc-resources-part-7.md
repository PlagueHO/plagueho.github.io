---
title: "Creating Professional DSC Resources – Part 7"
date: "2016-01-25"
categories:
  - "desired-state-configuration"
  - "dsc"
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
- [Creating Professional DSC Resources - Part 6](https://dscottraynsford.wordpress.com/2015/12/23/creating-professional-dsc-resources-part-6/)

 

## Recap

In the last couple of articles I covered the importance of **automated testing** with **unit testing** in particular. I had covered creating new **unit tests** using the **unit** **test templates** that are now available [here](https://github.com/PowerShell/DscResources/tree/master/Tests.Template). I also covered how to complete the **Pester Test Initialization** and the **Get-TargetResource,** **Set-TargetResource** and **Test-TargetResource** function areas of the **unit test**.

 

## Integration Testing

**Integration testing** is a great way of catching many errors that can't be easily picked up by **Unit testing**. It effectively tests your **DSC Resource** by actually using it in a **DSC configuration** file and applying it to a computer and checking the results. So this is as close to real-life testing as you can get.

**Integration testing** of a PowerShell DSC resource should be performed after **unit testing**. When a PowerShell DSC Resource is **integration tested** the following process occurs:

1. A DSC configuration file using the DSC resource to be integration tested is compiled into a MOF.
2. The MOF file is applied to the _test machine_.
3. The parameters current DSC Configuration of this DSC Resource on the _test machine_ is obtained.
4. The parameters of the current DSC Configuration are compared with what was set in the DSC configuration file in step 1.

Just like **unit testing** we use **Pester** to test the above steps and ensure that errors don't occur and the output is as expected.

 

 

## Sometimes Integration Tests are not Possible

**Integration testing** is not always possible on a resource. Some resources may rely on external servers being available or they might be destructive to the machine performing the tests.

For example, **integration tests** could not be implemented for the [MSFT\_xIPAddress](https://github.com/PowerShell/xNetworking/tree/dev/DSCResources/MSFT_xIPAddress) resource in the [xNetworking DSC Resource module](https://github.com/PowerShell/xNetworking) because it would have caused the network to disconnect during testing which would have resulted in a failure of the AppVeyor CI machine running the tests.

But, if there is a reasonable way of implementing **integration tests** for a resource in a non-destructive manor, then I'd strongly recommend it - especially as it is usually really easy.

 

## Don't Be Destructive!

Unlike **unit testing**, **integration testing** actually changes configuration on the machine performing the tests. If you're using a **continuous integration** service like [AppVeyor](https://www.appveyor.com/) to perform your tests then this isn't such a problem as the test machine is "destroyed" after your tests are run.

However, many people also run any **integration tests** on their local machines before committing code, therefore, your **integration tests** should always leave the machine in the state that it was before running them. This means that any changes that will be made applying the **integration tests** should be undone at the completion of your **integration tests** script.

 

## Integration Test Files

**Integration tests** for a DSC resource actually consist of two different files:

![ss_dsc_inttestfiles](/images/ss_dsc_inttestfiles1.png)

1. **\*.config.ps1** - The DSC Configuration file that will use the DSC Resource being tested.
2. **\*.Integration.Tests.ps1** - The Integration Test script file containing the **Pester** tests.

These files should be stored in the **Tests\\Integration** folder in the DSC Resource module:

![ss_dsc_inttestfolders](/images/ss_dsc_inttestfolders.png)

You must also ensure that the names of these files exactly matches the name of the resource itself. For example, if your **DSC Resource** is called **BMD\_MyResource** then these files must be called:

 

1. **BMD\_MyResource.config.ps1**
2. **BMD\_MyResource.Integration.Tests.ps1**

 

 

## Creating a New Integration Test

Luckily, a good amount of the work in implementing **integration tests** is already done for you. Like **unit tests**, templates for the two integration files are available in the [DscResources repository](https://github.com/PowerShell/DscResources/tree/master/Tests.Template) in GitHub:

![ss_dsc_inttesttemplatesrepo](/images/ss_dsc_inttesttemplatesrepo.png)

You need to copy the **integration test template** files and rename them to match your **DSC Resource**.

The easiest way to do this is to **clone** the repository containing the **test template** files and copy the **integration\_template.ps1** and **integration\_config\_template.ps1** files to your **Tests/Integration** folder:


```powershell
git clone https://github.com/PowerShell/DSCResources.git
Copy-Item .\DSCResources\Tests.Template\integration_config_template.ps1 .\ciSCSI\Tests\Integration\BMD_ciSCSIVirtualDisk.config.ps1
Copy-Item .\DSCResources\Tests.Template\integration_template.ps1 .\ciSCSI\Tests\Integration\BMD_ciSCSIVirtualDisk.Integration.Tests.ps1
```

![ss_dsc_createnewinttestfromtemplate](/images/ss_dsc_createnewinttestfromtemplate.png)

You'll now have two new **integration test** files that you can open in your PowerShell editor of choice.

 

### Modifying the Config File

The first file I usually edit is the \*.**config.ps1** file:

![ss_dsc_newinttestconfigtemplate](/images/ss_dsc_newinttestconfigtemplate1.png)

Next, you'll want to change any **<ResourceName>** occurrences in this file to the name of your resource. I also like to remove the **#TODO** bits at the same time so I know what I've completed: 
```powershell
configuration 'BMD_ciSCSIVirtualDisk_config' {
    Import-DscResource -Name 'BMD_ciSCSIVirtualDisk'
    node localhost {
       BMD_ciSCSIVirtualDisk Integration_Test {
            # TODO: Fill Configuration Code Here
       }
    }
}
```

Next, we need to configure the **config** file with the parameters we want to use as tests of the resource.

The best way of doing this is actually to create a **hash table** object at the beginning of the file with the parameters that we're going to set. This is so that we can use this **hash table** object in the other **integration file** (\*.Integration.Tests.ps1) when we're comparing the values that are expected to be set.


```powershell
$VirtualDisk = @{
    Path            = Join-Path -Path $ENV:Temp -ChildPath 'TestiSCSIVirtualDisk.vhdx'
    Ensure          = 'Present'
    DiskType        = 'Dynamic'
    Size            = 100MB
    Description     = 'Integration Test iSCSI Virtual Disk'
}

Configuration BMD_ciSCSIVirtualDisk_Config {
    Import-DscResource -Name BMD_ciSCSIVirtualDisk_Config
    node localhost {
        BMD_ciSCSIVirtualDis Ikntegration_Test {
            Path            = $VirtualDisk.Path
            Ensure          = $VirtualDisk.Ensure
            DiskType        = $VirtualDisk.DiskType
            SizeBytes       = $VirtualDisk.Size
            Description     = $VirtualDisk.Description
        }
    }
}
```

As you can see in the example above, I create a **$VirtualDisk** hash table that contains all the parameters and values that will be used to test this DSC Resource. The **$VirtualDisk** object is then also accessible in the **\*.Integration.Tests.ps1** file.

 

### Modifying the Integration Tests File

Now that the **integration tests config** file has been completed it is time to move on to the **integration test script (\*.Integration.Tests.ps1)** itself, so open it in your editor of choice:

![ss_dsc_newinttesttemplate](/images/ss_dsc_newinttesttemplate1.png)

Next, customize the **TODO** area in the **header** with the your **DSC Resource Name** and **DSC Module Name**:

![ss_dsc_inttestsheader](/images/ss_dsc_inttestsheader.png)

Feel free to remove the **TODO** comments if you want (I always do).

 

### Initialization Code

After customizing the header we need to add any code that might be required to set this machine up to actually perform these **integration tests**. The first thing I like to do is add code to check that these integration tests can actually be performed on this machine. In my example resource, the **iSCSI Virtual Disk** resource will require the **iSCSI Target Server** feature to be installed, which also means the OS must be a Server OS. So, first thing in the **try/catch** block I add these checks:


```powershell
# Ensure that the tests can be performed on this computer
$ProductType = (Get-CimInstance Win32_OperatingSystem).ProductType
Describe 'Environment' {
    Context 'Operating System' {
        It 'Should be a Server OS' {
            $ProductType | Should Be 3
        }
    }
}
if ($ProductType -ne 3)
{
    Break
}

$Installed = (Get-WindowsFeature -Name FS-iSCSITarget-Server).Installed
Describe 'Environment' {
    Context 'Windows Features' {
        It 'Should have the iSCSI Target Feature Installed' {
            $Installed | Should Be $true
        }
    }   
}
if ($Installed -eq $false)
{
    Break
}
```

This will cause the **try/catch** block to be **exited** straight away if these tests can't actually be performed on this machine.

_Note: The **cleanup** code in the **finally** block will still be called if we **exit** with a **break** command._

After this you might also need to add code to configure anything that these i**ntegration tests** might depend on. For example, if you were implementing **integration tests** for testing an **iSCSI Server Target**, you'd need to make sure that there was an **iSCSI Virtual Disk** available to use, so you'd need to create one at this point. However, in the **integration tests** for the **iSCSI Virtual Disk** resource I don't need anything else.

 

### Testing the Resource Was Applied

Next, we need to add the tests that check that after the **DSC Configuration** has been applied to the machine that the changes have actually been made and that the parameters match those set by the **Configuration**:

To do this, we complete this section:

![ss_dsc_inttestsvalidate](/images/ss_dsc_inttestsvalidate.png)

In this case, I've changed it to:


```powershell
It 'Should have set the resource and all the parameters should match' {
  # Get the Rule details
  $virtualDiskNew = Get-iSCSIVirtualDisk -Path $VirtualDisk.Path
  $VirtualDisk.Path               | Should Be $virtualDiskNew.Path
  $VirtualDisk.DiskType           | Should Be $virtualDiskNew.DiskType
  $VirtualDisk.Size               | Should Be $virtualDiskNew.Size
  $VirtualDisk.Description        | Should Be $virtualDiskNew.Description
}
```

What this code does is gets the iSCSI Virtual Disk that is at the path specified in the **$VirtualDisk.path** into a variable **$VirtualDiskNew**.

The parameters in **$VirtualDiskNew** are then matched to ensure they are the same as those in the **$VirtualDisk** hash table object that was created in the **DSC Configuration** script (\*.config.ps1).

 

### Cleaning Up

It is important that after the tests have been run that any changes that were made to the testing computer are reverted. So, after the end of the last test I add any clean up code. In my case, I want to remove the **iSCSI Virtual Disk** that was created:


```powershell
# Clean up
Remove-iSCSIVirtualDisk `
  -Path $VirtualDisk.Path
Remove-Item `
  -Path $VirtualDisk.Path `
  -Force
```

The above code just removes the **iSCSI Virtual Disk** and then also makes sure that the **VHD** file was also deleted. This is also very important because if the clean up does not occur and the tests are run again on the same computer they may fail.

 

## And We're Done!

Now, that may all seem like quite a bit of work, but it becomes second nature after creating a few of them. They will also save you far more time in addressing future issues with the resource every time you make a simple change to the MOF (but forget to change the resource code). These tests will give users and other maintainers much more confidence in your resources as well.

This series actually ended up being a bit longer than I intended, but hopefully you've stuck with it and it has helped in some small way. If you've got this far and you're wanting to know what to do next, why not head over to the [PowerShell DSCResources GitHub repository](https://github.com/PowerShell/DscResources) and see if you could help out on some resources. You could start off adding some small but useful parameter to an existing resource, fixing a bug or contribute an entire new resource to an existing module. There are numerous issues that need to be addressed on these resources, many of which are requests for new features or resources.

If you have an idea for a new resource in an existing module, raise an issue in the DSC Resource Module repository and offer to create the new resource. You may find that someone is already working on one, but if not, then this is a great opportunity to get started. It is quite a rewarding feeling the first time one of your contributions gets published in the official community DSC Resources!

So, thanks again for reading.


