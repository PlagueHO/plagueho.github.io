---
title: "Creating Professional DSC Resources - Part 5"
date: "2015-12-20"
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

 

## Recap

Yesterday I talked about  the importance of **automated testing** and covered **unit testing** in particular (I'll get to **integration testing** later). I had covered creating new **unit tests** using the **unit** **test templates** that are available [here](https://github.com/PowerShell/xNetworking/tree/dev/Templates) (although they will probably move [here](https://github.com/PowerShell/DscResources)). I also covered how to complete the **Pester Test Initialization** and the **Function Get-TargetResource** areas of the **unit test**.

 

## Unit Testing Continued

The next task in completing the **unit tests** is to complete the **Set-TargetResource** area in the **unit test**.

In these **unit tests** I am using a **DSC Resource** for creating _iSCSI Virtual Disks_ to illustrate the process. You don't need to know anything about _iSCSI Virtual Disks_ to understand these articles or resources, but if you're interested to know the **cmdlets** I'm using for these, see [this](https://technet.microsoft.com/en-us/library/jj612803%28v=wps.630%29.aspx) page. I'm using the **\*\_iSCSIVirtualDisk** cmdlets in this **DSC Resource**.

### Function Set-TargetResource

This area will contain the actual **Pester** tests that test the **Set-TargetResource** function. Unlike the **Get-TargetResource** this area may contain a large number of tests depending on the complexity of your **DSC** **Resource**. In most cases, you should expect there to create the tests from the following list, but often you will need even more for 100% code coverage:

- Does each parameter get set/updated correctly when the _resource being configured_ **does exist** and **should?** This test is usually repeated for _each parameter_ in the **DSC Resource**.
- Does it work when the _resource being configured_ **does not exist** but **should**?
- Does it work when the _resource being configured_ **does exist** but **should not**?
- Does it work when the _resource being configured_ **does not exist** and **should not**?

#### Context 'Virtual Disk exists and should but has a different ...'

In this scenario we **Mock** the **Get-iSCSIVirtualDisk** cmdlet to return the object we defined in the **Pester Test Initialization** section. This is the behavior we'd expect if the _resource being configured_ does exist.

We are also going to **Mock** the **Set-iSCSIVirtualDisk**, **New-iSCSIVirtualDisk** and **Remove-iSCSIVirtual****Disk**. This is so we can ensure the expected cmdlets are called as well as preventing the _real_ cmdlets from being run:


```powershell
Context 'Virtual Disk exists and should but has a different Description' {
	
	Mock Get-iSCSIVirtualDisk -MockWith { return @($MockVirtualDisk) }
	Mock New-iSCSIVirtualDisk
	Mock Set-iSCSIVirtualDisk
	Mock Remove-iSCSIVirtualDisk

	It 'should not throw error' {
		{ 
			$Splat = $TestVirtualDisk.Clone()
			$Splat.Description = 'Different'
			Set-TargetResource @Splat
		} | Should Not Throw
	}
	It 'should call expected Mocks' {
		Assert-MockCalled -commandName Get-iSCSIVirtualDisk -Exactly 1
		Assert-MockCalled -commandName New-iSCSIVirtualDisk -Exactly 0
		Assert-MockCalled -commandName Set-iSCSIVirtualDisk -Exactly 1
		Assert-MockCalled -commandName Remove-iSCSIVirtualDisk -Exactly 0
	}
}
```

This **context** will perform two tests:

1. **Should not throw error** - The **Set-TargetResource** should not throw an error when called in this context.
2. **Should call the expected mocks** - The **Set-TargetResource** should call the **mocked** cmdlets the expected number of times.

The purpose of **cloning** the **$TestVirtualDisk** object is so we can modify the properties to simulate a property difference without modifying the **$TestVirtualDisk** object.

It is also important to ensure that we are not only checking that the expected **cmdlets** are called, but also that the other **cmdlets** in this **function** are **not called**. This is why we are checking the **New-iSCSIVirtualDisk** and **Remove-iSCSIVirtualDisk** are being called zero times.

You should expect to repeat this **context** for each parameter that might be updated.

_**Note:** It is possible that updating some parameters may not be possible because of limitations in the underlying cmdlets. In this case I like to throw an **exception** so that the user is made aware that they are configuring a scenarios that can not be performed. In that case the test would be to ensure the correct **exception** occurs. I'll cover testing **exceptions** in a later article._

 

#### Context 'Virtual Disk does not exist but should'

In this scenario we **Mock** the **Get-iSCSIVirtualDisk** cmdlet to return nothing. This is the behavior we'd expect if the _resource being configured_ does **not** exist.

We are also going to **Mock** the **Set-iSCSIVirtualDisk**, **New-iSCSIVirtualDisk** and **Remove-iSCSIVirtual****Disk**. This is so we can ensure the expected cmdlets are called as well as preventing the _real_ cmdlets from being run:


```powershell
Context 'Virtual Disk does not exist but should' {
	
	Mock Get-iSCSIVirtualDisk
	Mock New-iSCSIVirtualDisk
	Mock Set-iSCSIVirtualDisk
	Mock Remove-iSCSIVirtualDisk

	It 'should not throw error' {
		{ 
			$Splat = $TestVirtualDisk.Clone()
			Set-TargetResource @Splat
		} | Should Not Throw
	}
	It 'should call expected Mocks' {
		Assert-MockCalled -commandName Get-iSCSIVirtualDisk -Exactly 1
		Assert-MockCalled -commandName New-iSCSIVirtualDisk -Exactly 1
		Assert-MockCalled -commandName Set-iSCSIVirtualDisk -Exactly 0
		Assert-MockCalled -commandName Remove-iSCSIVirtualDisk -Exactly 0
	}
}
```

The **context** tests are very similar to all the other tests so I won't go into detail on them here. It is important to note that the expected **Mocks** will be different.

 

#### Context 'Virtual Disk exists but should not'

In this scenario we **Mock** the **Get-iSCSIVirtualDisk** cmdlet to return the object we defined in the **Pester Test Initialization** section. This is the behavior we'd expect if the _resource being configured_ does exist.

We are also going to **Mock** the **Set-iSCSIVirtualDisk**, **New-iSCSIVirtualDisk** and **Remove-iSCSIVirtual****Disk**. This is so we can ensure the expected cmdlets are called as well as preventing the _real_ cmdlets from being run:


```powershell
Context 'Virtual Disk exists but should not' {
	
	Mock Get-iSCSIVirtualDisk -MockWith { return @($MockVirtualDisk) }
	Mock New-iSCSIVirtualDisk
	Mock Set-iSCSIVirtualDisk
	Mock Remove-iSCSIVirtualDisk

	It 'should not throw error' {
		{ 
			$Splat = $TestVirtualDisk.Clone()
			$Splat.Ensure = 'Absent'
			Set-TargetResource @Splat
		} | Should Not Throw
	}
	It 'should call expected Mocks' {
		Assert-MockCalled -commandName Get-iSCSIVirtualDisk -Exactly 1
		Assert-MockCalled -commandName New-iSCSIVirtualDisk -Exactly 0
		Assert-MockCalled -commandName Set-iSCSIVirtualDisk -Exactly 0
		Assert-MockCalled -commandName Remove-iSCSIVirtualDisk -Exactly 1
	}
}
```

The **context** tests are very similar to all the other tests so I won't go into detail on them here. It is important to note that the expected **Mocks** will be different.

 

#### Context 'Virtual Disk does not exist and should not'

In this scenario we **Mock** the **Get-iSCSIVirtualDisk** cmdlet to return the object we defined in the **Pester Test Initialization** section. This is the behavior we'd expect if the _resource being configured_ does **not** exist.

We are also going to **Mock** the **Set-iSCSIVirtualDisk**, **New-iSCSIVirtualDisk** and **Remove-iSCSIVirtual****Disk**. This is so we can ensure the expected cmdlets are called as well as preventing the _real_ cmdlets from being run:


```powershell
Context 'Virtual Disk does not exist and should not' {
	
	Mock Get-iSCSIVirtualDisk
	Mock New-iSCSIVirtualDisk
	Mock Set-iSCSIVirtualDisk
	Mock Remove-iSCSIVirtualDisk
		
	It 'should not throw error' {
		{ 
			$Splat = $TestVirtualDisk.Clone()
			$Splat.Ensure = 'Absent'
			Set-TargetResource @Splat
		} | Should Not Throw
	}
	It 'should call expected Mocks' {
		Assert-MockCalled -commandName Get-iSCSIVirtualDisk -Exactly 1
		Assert-MockCalled -commandName New-iSCSIVirtualDisk -Exactly 0
		Assert-MockCalled -commandName Set-iSCSIVirtualDisk -Exactly 0
		Assert-MockCalled -commandName Remove-iSCSIVirtualDisk -Exactly 0
	}
}
```

The **context** tests are very similar to all the other tests so I won't go into detail on them here. It is important to note that the expected **Mocks** will be different.

 

## Unit Tests to be Continued...

In the next article, I'll cover the **unit tests** for **Get-TargetResource** as well as unit testing any additional functions. Thanks again for reading and I hope it is useful.

Further parts in this series:

- [Creating Professional DSC Resources - Part 6](https://dscottraynsford.wordpress.com/2015/12/23/creating-professional-dsc-resources-part-6/)
- [Creating Professional DSC Resources - Part 7](https://dscottraynsford.wordpress.com/2016/01/25/creating-professional-dsc-resources-part-7/)


