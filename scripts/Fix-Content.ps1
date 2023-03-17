[CmdletBinding()]
param(
    [System.String]
    $Path = '..\content\posts'
)

<#
    .SYNOPSIS Download all the images referenced in the markdown to the images folder.
#>
function Download-ImagesFromMarkdown {
[CmdletBinding()]
    param (
        [System.String]
        $Content,

        [System.String]
        $ImagesPath
    )

    $images = [regex]::Matches($Content,'!\[.*\]\((.*)\)')
    foreach ($image in $images) {
        $imageUri = $image.Groups[1].Value
        if (-not $imageUri.StartsWith("https://")) {
            Write-Verbose -Message "Image $image already proceesed"
            continue
        }
        # Remove everything after the end of the ?

        $imageUri = ($imageUri -Split "\?")[0]
        $imageDestination = Join-Path -Path $ImagesPath -ChildPath (Split-Path -Path $imageUri -Leaf)

        Write-Verbose -Message "Downloading image uri: $imageUri to image: $imageDestination"
        if (Test-Path -Path $imageDestination) {
            Write-Verbose -Message "File image: $imageDestination already exists"
        }
        else {
            Write-Verbose -Message "Downloading uri: $imageUri to image: $imageDestination"
            Invoke-WebRequest -Uri $imageUri -OutFile $imageDestination
            Start-Sleep -Seconds 0.5
        }
    }
}

# Main
$posts = Get-ChildItem -Path (Join-Path -Path $Path -ChildPath '\**\*.md') -Recurse

foreach ($post in $posts) {
    $postPath = Split-Path -Path $post.FullName -Parent
    $postName = Split-Path -Path $post.FullName -Leaf
    $imagesPath = Join-Path -Path $postPath -ChildPath 'Images'
    Write-Verbose -Message "Processing post path: $postPath, name: $postName, imagesPath: $imagesPath"

    $content = Get-Content -Path $post -Raw
    Download-ImagesFromMarkdown -Content $content -ImagesPath $imagesPath
}
