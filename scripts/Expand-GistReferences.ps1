<#
.SYNOPSIS
    Replaces '{{< gist PlagueHO ... >}}' short-codes in blog Markdown files
    with the actual gist code, wrapped in fenced code blocks.

.PARAMETER Path
    Root folder that contains the Markdown files. Default = 'content\blog'.

.PARAMETER WhatIf
    Shows the changes that would be made without modifying any file.

.EXAMPLE
    .\Expand-GistReferences.ps1               # Process all posts
    .\Expand-GistReferences.ps1 -WhatIf       # Preview only
#>
[CmdletBinding(SupportsShouldProcess)]
param
(
    [string] $Path = 'content\blog',
    [string] $GitHubToken = $env:GITHUB_TOKEN   # ← new optional PAT
)

Write-Verbose -Message "Starting Expand-GistReferences.ps1. Root path = '$Path'."

#--- Helper to fetch a gist ----------------------------------------------------
function Get-GistContent {
    param (
        [string] $GistId,
        [string] $Token = $GitHubToken          # bubble the PAT in
    )

    Write-Verbose -Message "Fetching gist '$GistId'..."
    $uri = "https://api.github.com/gists/$GistId"

    $headers = @{ 'User-Agent' = 'PlagueHO-GistExpander' }
    if ($Token) { $headers['Authorization'] = "token $Token" }

    # --- retry block ---------------------------------------------------------
    $maxRetry = 3
    for ($try = 1; $try -le $maxRetry; $try++) {
        try {
            $gist = Invoke-RestMethod -Uri $uri -Headers $headers  # ← use new headers
            break
        }
        catch {
            $resp = $_.Exception.Response
            if ($resp -and $resp.StatusCode -eq 403) {
                # Pull the rate-limit header (falls back to 1 min if missing/unparseable)
                $waitMs = 60000
                $header = $resp.Headers['X-RateLimit-Remaining']
                if ([int]::TryParse($header, [ref]$null)) { $waitMs = [int]$header }

                Write-Warning -Message "GitHub rate-limit hit on gist '$GistId'; waiting $waitMs ms then retrying ($try/$maxRetry)."
                Start-Sleep -Milliseconds $waitMs
                continue
            }

            # Any other error – surface it to the caller
            Write-Warning -Message "Failed to retrieve gist '$GistId' - HTTP error: $($_.Exception.Message)"
            throw
        }
    }

    if (-not $gist) { throw "Unable to retrieve gist '$GistId' after $maxRetry attempts." }

    Write-Debug  -Message "Gist response: $($gist | ConvertTo-Json -Depth 3)"

    # Many gists contain a single file – take the first one.
    $file  = $gist.files.PSObject.Properties.Value | Select-Object -First 1

    Write-Verbose -Message "Retrieved gist '$GistId' (language = '$($file.language)')."
    return [pscustomobject]@{
        Language = ($file.language -replace ' ', '').ToLower()  # e.g. 'PowerShell'
        Content  = $file.content.TrimEnd()
    }
}

# local cache so we only download each gist once per session
$gistCache = @{}

#--- Process every markdown file ----------------------------------------------
$mdFiles = Get-ChildItem -Path $Path -Filter *.md -Recurse
Write-Verbose -Message "Discovered $($mdFiles.Count) markdown files."

foreach ($file in $mdFiles) {
    Write-Verbose -Message "Scanning '$($file.FullName)'."
    $content = Get-Content -LiteralPath $file.FullName -Raw

    # Regex for '{{< gist PlagueHO XXXXX >}}'
    $pattern = '\{\{\s*<\s*gist\s+PlagueHO\s+([0-9a-f]+)\s*>\s*\}\}'

    $matchCount = ([regex]::Matches($content, $pattern)).Count
    if ($matchCount -eq 0) {
        Write-Verbose -Message "No gist references found."
        continue
    }

    Write-Verbose -Message "Found $matchCount gist reference(s). Building replacements."

    # Use [regex]::Replace so we get the full Match object – this handles *all*
    # occurrences in one pass.
    $updated = [regex]::Replace(
        $content,
        $pattern,
        {
            param($m)                                  # $m is [regex]::Match
            $gistId = $m.Groups[1].Value
            Write-Verbose -Message "Replacing reference to gist '$gistId' in '$($file.Name)'."

            # reuse if already fetched during this run
            if (-not $gistCache.ContainsKey($gistId)) {
                try {
                    $gistCache[$gistId] = Get-GistContent -GistId $gistId
                }
                catch {
                    Write-Warning -Message "Failed to retrieve gist '$gistId' - leaving shortcode unchanged."
                    return $m.Value          # keep original shortcode on error
                }
            }

            $gistInfo = $gistCache[$gistId]
            $langTag  = if ($gistInfo.Language) { $gistInfo.Language } else { '' }

            # Build fenced code block
            $codeBlock = "`n``````$langTag`n$($gistInfo.Content)`n``````"

            # Show the new block when the caller supplies -Debug
            Write-Debug  -Message "Generated replacement for gist '$gistId':`n$codeBlock"

            return $codeBlock
        },
        'IgnoreCase'                         # allow upper/lower-case ids
    )

    # Skip if no change
    if ($updated -eq $content) { continue }

    if ($PSCmdlet.ShouldProcess($file.FullName, 'Replace Gist short-codes')) {
        # ---- NEW : back-up ---------------------------------------------------
        $backupPath = Join-Path -Path $file.DirectoryName -ChildPath "$($file.BaseName).bak.md"
        Write-Verbose -Message "Creating backup '$backupPath'."
        Copy-Item -LiteralPath $file.FullName -Destination $backupPath -Force
        # ---------------------------------------------------------------------

        Write-Verbose -Message "Writing updated content back to '$($file.FullName)'."
        Set-Content -LiteralPath $file.FullName -Value $updated -Encoding UTF8
    }
}
