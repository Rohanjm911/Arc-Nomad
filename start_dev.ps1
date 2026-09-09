# ARC-NOMADE PowerShell Launcher
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ScriptArgs
)

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$startBat = Join-Path $PSScriptRoot "start.bat"

if ($ScriptArgs.Count -gt 0) {
    & $startBat @ScriptArgs
} else {
    & $startBat
}
