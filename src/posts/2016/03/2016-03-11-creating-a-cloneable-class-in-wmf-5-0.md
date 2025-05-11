---
title: "Creating a Cloneable Class in WMF 5.0"
date: 2016-03-11
description: "Creating a Cloneable Class in WMF 5.0"
tags:
  - "wmf-5-0"
  - "classes"
  - "powershell"
  - "wmf5-0"
isArchived: true
---

## Introduction

You might have noticed that instances of certain types of classes are created, a method called **Clone** is available that will create a ([shallow](http://stackoverflow.com/questions/184710/what-is-the-difference-between-a-deep-copy-and-a-shallow-copy)) copy of the object. A PowerShell **Hashtable** object is a classic example of a class that supports the **Clone** method:

```powershell
$Car = [Hashtable]::New()
$Car.Add('Make','Lamborghini')
$Car.Add('Model','Aventador')
$NewCar = $Car.Clone()
```

This is nothing new to developers, but for most Ops people it might be something they're not that familiar with. But if you are an Ops person who is implementing more advanced PowerShell modules or scripts in WMF 5.0 that require custom classes, then this might be something you need to do.

_Note: you can do this in WMF 3.0 and 4.0 but it requires reflection and a lot more code, so isn't something I'm going to cover here._

For this post, I'm assuming you have a basic knowledge of how to create classes in WMF 5.0. If you aren't familiar with creating classes, take a look at [this series](https://blogs.technet.microsoft.com/heyscriptingguy/2015/09/01/powershell-5-create-simple-class/) for a very good primer.

If you just go and create a new class in PowerShell and try to call the clone method, an error with be thrown:

![ss_cloneable_nolonemethoderror](/assets/images/screenshots/ss_cloneable_nolonemethoderror.png)

This is because by default a new class that is defined in PowerShell is based off the **System.Object** class which does not implement the **ICloneable** interface. The **ICloneable** interface is what gives us the **Clone** method on an object. So we need to tell PowerShell that we want our new class to implement the **ICloneable** interface.

_Note: You don't really need to know what an interface is to use it, but if you do want a better understanding of it, [this](https://msdn.microsoft.com/en-us/library/ms173156.aspx) is a good place to start. Details on the ICloneable Interface can be found [here](https://msdn.microsoft.com/en-us/library/system.icloneable%28v=vs.110%29.aspx)._

## Implementing an Interface

Creating a class that implements the **ICloneable** interface just requires that we add the name of the interface to implement after a colon following the class name:

```powershell
class Car:ICloneable {
  [String] $Make
  [String] $Model
}
```

However, if we try to define this class as is we'll get an error:

![ss_cloneable_classclonemethodnotimplementederror](/assets/images/screenshots/ss_cloneable_classclonemethodnotimplementederror.png)

The problem is that we've told PowerShell that the **Car** class implements **ICloneable** and should therefore have a **Clone** method, but we haven't actually created the **Clone** method in the class.

To do this we need to add the method to our class definition:

```powershell
class Car:ICloneable {
  [Object] Clone () {
      $NewCar = [Car]::New()
      foreach ($Property in ($this | Get-Member -MemberType Property))
      {
          $NewCar.$($Property.Name) = $this.$($Property.Name)
      } # foreach
      return $NewCar
  } # Clone
  [String] $Make
  [String] $Model
}
```

The above code first creates a new Car object, then gets a list of the **properties** on the existing (**$This**) object and uses a **foreach** loop to copy the content of each property to the new Car object (**$NewCar**). The **$NewCar** object is returned to the calling code.

> [!NOTE]
> This performs a [shallow copy](http://stackoverflow.com/questions/184710/what-is-the-difference-between-a-deep-copy-and-a-shallow-copy) of the object. If you want to perform a **deep copy** then you'll need to implement code based on the child objects within the existing object._

You've now created an class that implements an interface. The .NET framework provides hundreds (if not thousands) of interfaces that you potentially could implement on your PowerShell classes. Of course, you could have cloned the Car object without implementing the **ICloneable** interface at all, but this post is intended to be a general introduction to implementing interfaces in WMF 5.0 as well as the **ICloneable** interface.

Thanks for reading.
