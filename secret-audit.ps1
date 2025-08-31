#!/usr/bin/env pwsh
# Secret Detection Script for strataregula-vscode (Microsoft Marketplace Extension)
# Enhanced patterns for VS Code extension security

param(
    [string]$ScanPath = ".",
    [switch]$Verbose = $false
)

Write-Host "🔍 VS Code Extension Secret Detection - strataregula-vscode" -ForegroundColor Cyan
Write-Host "⚠️  Microsoft Marketplace Extension - Enhanced Security" -ForegroundColor Yellow
Write-Host "Scanning path: $ScanPath" -ForegroundColor Yellow

$secretPatterns = @(
    @{Pattern = 'ghp_[a-zA-Z0-9]{36}'; Description = 'GitHub Personal Access Token'},
    @{Pattern = 'gho_[a-zA-Z0-9]{36}'; Description = 'GitHub OAuth Token'},
    @{Pattern = 'ghu_[a-zA-Z0-9]{36}'; Description = 'GitHub User-to-Server Token'},
    @{Pattern = 'ghs_[a-zA-Z0-9]{36}'; Description = 'GitHub Server-to-Server Token'},
    @{Pattern = 'AKIA[0-9A-Z]{16}'; Description = 'AWS Access Key ID'},
    @{Pattern = 'sk-[a-zA-Z0-9]{48}'; Description = 'OpenAI API Key'},
    @{Pattern = 'xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}'; Description = 'Slack Bot Token'},
    @{Pattern = 'Bearer\s+[a-zA-Z0-9+/=]{20,}'; Description = 'Bearer Token'},
    @{Pattern = '-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----'; Description = 'Private Key'},
    @{Pattern = 'eyJ[a-zA-Z0-9+/=]+\.[a-zA-Z0-9+/=]+\.[a-zA-Z0-9+/=]+'; Description = 'JWT Token'},
    @{Pattern = '"access_token"\s*:\s*"[^"]+'; Description = 'VS Code Access Token'},
    @{Pattern = '"publisherAccessToken"\s*:\s*"[^"]+'; Description = 'VS Code Publisher Token'},
    @{Pattern = 'vsce\s+publish\s+--pat\s+[a-zA-Z0-9]+'; Description = 'VSCE Publish Token'},
    @{Pattern = 'VSCE_PAT\s*=\s*[a-zA-Z0-9]+'; Description = 'VSCE Environment Token'}
)

$detectedSecrets = @()
$scannedFiles = 0
$vsixFiles = @()

# High-risk file patterns for VS Code extensions
$highRiskPatterns = @(
    '*.vsix',
    'package.json',
    '.vscode/settings.json',
    'src/**/*.ts',
    'src/**/*.js',
    '.env*',
    '*.config.*'
)

if (Test-Path $ScanPath) {
    Get-ChildItem -Path $ScanPath -Recurse -File | ForEach-Object {
        $file = $_
        $scannedFiles++
        
        # Check for .vsix files (critical security violation)
        if ($file.Extension -eq '.vsix') {
            $vsixFiles += $file.FullName
        }
        
        if ($Verbose) {
            Write-Host "  Scanning: $($file.FullName)" -ForegroundColor Gray
        }
        
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            foreach ($pattern in $secretPatterns) {
                $matches = [regex]::Matches($content, $pattern.Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                
                if ($matches.Count -gt 0) {
                    foreach ($match in $matches) {
                        $detectedSecrets += @{
                            File = $file.FullName
                            Type = $pattern.Description
                            Match = $match.Value
                            Line = ($content.Substring(0, $match.Index) -split "`n").Count
                        }
                    }
                }
            }
        }
    }
} else {
    Write-Host "⚠️  Path not found: $ScanPath" -ForegroundColor Yellow
}

Write-Host "`n📊 VS Code Extension Security Scan Results:" -ForegroundColor Green
Write-Host "Files scanned: $scannedFiles" -ForegroundColor White
Write-Host "Secrets detected: $($detectedSecrets.Count)" -ForegroundColor White
Write-Host ".vsix files found: $($vsixFiles.Count)" -ForegroundColor White

# Critical: .vsix files detection
if ($vsixFiles.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL: .VSIX FILES DETECTED IN REPOSITORY:" -ForegroundColor Red
    foreach ($vsixFile in $vsixFiles) {
        Write-Host "  ❌ $vsixFile" -ForegroundColor Red
    }
    Write-Host "  ⚠️  Microsoft Marketplace packages must NOT be in source repository!" -ForegroundColor Yellow
    Write-Host "  🔧 Action required: git rm *.vsix && git commit" -ForegroundColor Yellow
}

if ($detectedSecrets.Count -gt 0) {
    Write-Host "`n🚨 SECRETS DETECTED:" -ForegroundColor Red
    foreach ($secret in $detectedSecrets) {
        Write-Host "  File: $($secret.File)" -ForegroundColor Red
        Write-Host "  Type: $($secret.Type)" -ForegroundColor Yellow
        Write-Host "  Line: $($secret.Line)" -ForegroundColor Gray
        Write-Host "  Match: $($secret.Match.Substring(0, [Math]::Min(50, $secret.Match.Length)))..." -ForegroundColor Magenta
        Write-Host ""
    }
    exit 1
} elseif ($vsixFiles.Count -gt 0) {
    exit 1
} else {
    Write-Host "✅ No secrets or .vsix files detected" -ForegroundColor Green
    Write-Host "🛡️  Microsoft Marketplace extension security: COMPLIANT" -ForegroundColor Green
    exit 0
}