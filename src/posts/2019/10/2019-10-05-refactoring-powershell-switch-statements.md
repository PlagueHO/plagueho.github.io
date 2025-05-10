---
title: "Refactoring PowerShell - Switch Statements"
date: 2019-10-05
description: "Refactoring PowerShell switch statements to use hash tables and enumerated types."
tags:
  - "powershell"
  - "refactoring"
  - "switch"
---

Regardless of your experience within technology, the process of creating code usually starts out with a solution that is just enough to get the job done. The solution is then typically tweaked and improved continuously until it is either "_production worthy_" or "_good enough for the requirements_". This process of improvement is called **refactoring**. Refactoring is a skill that all technical professionals should become proficient in, regardless if you are an IT Pro, a developer or just someone who needs to automate things.

There are many reasons to refactor code, including:

- Add new features
- Remove unused features
- Improve performance
- Increase readability, maintainability or test-ability
- Improve design
- Improve adherence to standards or best practices

## Refactoring in Code Reviews

One of the jobs of a code reviewer is to suggest areas that could be refactored to improve some of the areas above. I've often found that I'll suggest the same set of refactorings in my reviews. So rather than just putting the suggesting into the code review, I thought I'd start writing them down here in a series that I could refer contributors to as well as help anyone else who happens to come across these.

## Unit Tests and Refactoring

Because refactoring requires changing code, how can we be sure that we're not breaking functionality or introducing bugs? That is where [unit testing](https://devblogs.microsoft.com/scripting/unit-testing-powershell-code-with-pester/) comes in. With PowerShell, we'll typically use the [PowerShell Pester module](https://github.com/pester/Pester) to create unit tests that allow us to more safely refactor code. Unit testing is beyond the scope of this post.

## Switch Statement Refactoring

One of the common patterns I've come across is [PowerShell switch statements](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_switch?view=powershell-6) being used is to map from one values to another set of values. For example:


```powershell
$colourName = 'green'

$colourValue = switch ($colourName) {
    'red' { 0xFF0000; break }
    'green' { 0x00FF00; break }
    'blue' { 0x0000FF; break }
    'white' { 0xFFFFFF; break }
    default { 0x0 }
}

return $colourValue
```

This converts a colour name (e.g. _red_, _green_, _blue_, _white_) to a colour value. If a colour name can not be matched then it returns _0x0_ (_black_). Admittedly, this is a bit of an unlikely example, but it demonstrates the pattern.

This is by no means incorrect or "bad code". It is completely valid and solves the problem perfectly well. But as you can see this requires a lot of code to perform a simple mapping.

### Mapping using a Hash Table

An alternative to using a switch statement is to use a [hash table](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_hash_tables?view=powershell-6):


```powershell
$colourName = 'green'

$colourMap = @{
    red = 0xFF0000
    green = 0x00FF00
    blue = 0x0000FF
    white = 0xFFFFFF
}
$colourValue = $colourMap[$colourName]

return $colourValue
```

This can simplify the code slightly by removing the **break** **statement** and **braces**.

Note: The break statement is not strictly required _in this example_ from a functional perspective, but including them increases overall performance of the switch statement.

You may have noticed that the hash table above does not quite match the behavior of the switch statement: the default mapping to _0x0_ is not handled. So, in this case, we'd need to include additional code to handle this:

```powershell
$colourName = 'green'

$colourMap = @{
    red = 0xFF0000
    green = 0x00FF00
    blue = 0x0000FF
    white = 0xFFFFFF
}
$colourValue = ($colourMap[$colourName], 0x0, 1 -ne $null)[0] # Null Coalescing

return $colourValue
```

To handle the default we're using a quasi [null coalescing operator](https://en.wikipedia.org/wiki/Null_coalescing_operator). PowerShell doesn't have a native null coalescing operator like many languages, but it does have a way of simulating it using the line:

```powershell
$notNull = ($x, $y, 1 -ne $null)[0] # Null Coalescing in PowerShell
```

You could definitely argue that using a **hash table** mapping with a **null coalescing operator** does not make the code easier to read or maintain. But the purpose here is not to define which approach is best, rather to offer alternative patterns.

One other benefit of using a **hash table** for mapping is that it can be separated out into a separate **psd1** file. This allows editing of the mapping table elements without having to edit the code itself:

```powershell
$colourName = 'green'
$colourMap = Import-LocalizedData -FileName mapping.psd1
$colourValue = ($colourMap[$colourName], 0x0, 1 -ne $null)[0] # Null Coalescing
return $colourValue
```

The **psd1** file containing the mapping data (mapping.psd1):

```powershell
@{
    red = 0xFF0000
    green = 0x00FF00
    blue = 0x0000FF
    white = 0xFFFFFF
}
```

### Reversing the Mapping

How do we use a similar pattern to reverse the mapping? For example, mapping a colour value back to a colour name:

```powershell
$colourValue = 0x00FF00

$colourName = switch ($colourValue) {
    0xFF0000 { 'red'; break }
    0x00FF00 { 'green' ; break }
    0x0000FF { 'blue'; break }
    0xFFFFFF { 'white'; break }
    default { 'none' }
}

return $colourName
```

To implement the same functionality using a **hash table** also including the **null coalescing operator** you could use:

```powershell
$colourValue = 0x00FF00

$colourMap = @{
    0xFF0000 = 'red'
    0x00FF00 = 'green'
    0x0000FF = 'blue'
    0xFFFFFF = 'white'
}
$colourName = ($colourMap[$colourValue], 0x0, 1 -ne $null)[0] # Null Coalescing

return $colourName
```

### Using a Hash Table with Script Values

Switch blocks may contain more than just a single statement. For example:

```powershell
$VerbosePreference = 'Continue'
$action = 'New'
$path = 'c:\somefile.txt'

$result = switch ($action) {
    'New' {
        Write-Verbose -Message 'Execute New-Item'
        New-Item -Path $path
        break
    }

    'Remove' {
        Write-Verbose -Message 'Execute Remove-Item'
        Remove-Item -Path $path
        break
    }

    'Get' {
        Write-Verbose -Message 'Execute Get-Item'
        Get-Item -Path $path
        break
    }

    Default {
        Write-Verbose -Message 'Invalid Action'
    }
}

return $result
```

If your switch blocks do more than just perform a mapping, you can assign **script blocks** to the **hash table** values instead:

```powershell
$VerbosePreference = 'Continue'
$action = 'New'
$path = 'c:\somefile.txt'

$actions = @{
    'New' = {
        Write-Verbose -Message 'Execute New-Item'
        New-Item -Path $path
    }

    'Remove' = {
        Write-Verbose -Message 'Execute Remove-Item'
        Remove-Item -Path $path
    }

    'Get' = {
        Write-Verbose -Message 'Execute Get-Item'
        Get-Item -Path $path
    }
}

return ($actions[$action], {Write-Verbose -Message 'Invalid Action'}, 1 -ne $null)[0].Invoke()
```

Instead of containing a value in each **hash table** item, a **script block** is specified. The **Invoke()** method can then be called on the **script block.**

### Enumerated Types

If you're using PowerShell 5.0 or above (you hopefully are), you're also able to use the **enum** keyword to define an **enumerated type** that can also be used to replace switch statements in some situations.

```powershell
$colourName = 'green'

# Only needs to be declared once
enum colour {
    red = 0xFF0000 
    green = 0x00FF00
    blue = 0x0000FF
    white = 0xFFFFFF
}

return ([colour] $colourName).value__
```

The **enumerated type** only needs to be declared once.

But what do we need to do if we want to have a default returned if the value is invalid in the mapping? In that case we need to use the **TryParse** method of the **enumerated type** to try and parse the value and return a default value if it is invalid:

```powershell
$colourName = 'grey'

# Only needs to be declared once
enum colour {
    red = 0xFF0000 
    green = 0x00FF00
    blue = 0x0000FF
    white = 0xFFFFFF
}

$colourValue = [colour]::white

if (-not [colour]::TryParse($colourName, $true, [ref] $colourValue)) {
    return 0x0
} else {
    return $colourValue.value__
}
```

However, we can't assign **scriptblocks** to the values in an **enumerated type** - only constant values may be assigned. This means we can't implement scenarios where we'd like to have the value contain more than one instruction. But this shouldn't be too much of a problem, because if you do find yourself being limited by this, then you should probably be looking to use more advanced **object oriented programming** patterns such as **polymorphism** \- which is well beyond the scope of this post. But if you're interested to know more, review [this article](https://refactoring.guru/replace-conditional-with-polymorphism) (not PowerShell specific).

## Wrapping Up

This post is all about looking at different ways of writing the same code. It isn't trying to say which way is better or worse. If you have a preference and it works for you, by all means, keep on using it. This is simply to provide alternative methods that may or may not make code more readable and maintainable.

Feel free to comment with alternative methods of refactoring switch statements.
