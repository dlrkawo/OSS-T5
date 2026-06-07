param(
  [string]$BaseUrl = "http://localhost:8080/api",
  [string]$UserId = "demo-user"
)

$ErrorActionPreference = "Stop"

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )

  if (-not $Condition) {
    throw "ASSERTION FAILED: $Message"
  }

  Write-Host "[PASS] $Message"
}

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )

  $uri = "$BaseUrl$Path"
  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -TimeoutSec 10
  }

  $json = $Body | ConvertTo-Json -Depth 10
  return Invoke-RestMethod `
    -Method $Method `
    -Uri $uri `
    -ContentType "application/json" `
    -Body $json `
    -TimeoutSec 10
}

Write-Host "Focus Orbit API smoke check"
Write-Host "Base URL: $BaseUrl"
Write-Host "User ID : $UserId"
Write-Host ""

$health = Invoke-Api -Method "GET" -Path "/health"
Assert-True ($health.status -eq "ok") "GET /health returns ok"
Assert-True ($health.service -eq "focus-orbit-api") "GET /health returns service name"

$settings = Invoke-Api -Method "GET" -Path "/settings?userId=$UserId"
Assert-True ($settings.userId -eq $UserId) "GET /settings returns the requested user"

$patchedSettings = Invoke-Api -Method "PATCH" -Path "/settings?userId=$UserId" -Body @{
  demoShortTimer = $true
  minimalMode = $true
  reduceVisualEffects = $false
  soundAlert = $true
  desktopNotification = $false
  showTimerInTitle = $true
}
Assert-True ($patchedSettings.demoShortTimer -eq $true) "PATCH /settings updates demoShortTimer"
Assert-True ($patchedSettings.minimalMode -eq $true) "PATCH /settings updates minimalMode"

$cycleId = "smoke-cycle-" + (Get-Date -Format "yyyyMMddHHmmss")
$session = Invoke-Api -Method "POST" -Path "/sessions" -Body @{
  userId = $UserId
  taskName = "API smoke mission"
  taskType = "coding"
  plannedFocusMinutes = 40
  plannedBreakMinutes = 10
  cycleId = $cycleId
  cycleIndex = 1
  totalCycles = 4
  longBreak = $false
  outcome = "completed"
  pauseCount = 2
  startedAt = "2026-06-06T09:00:00Z"
  endedAt = "2026-06-06T09:40:00Z"
}
Assert-True ($session.id -gt 0) "POST /sessions creates a session"
Assert-True ($session.taskType -eq "coding") "POST /sessions accepts lowercase taskType"
Assert-True ($session.outcome -eq "completed") "POST /sessions accepts lowercase outcome"

$sessions = @(Invoke-Api -Method "GET" -Path "/sessions?userId=$UserId")
Assert-True ($sessions.Count -ge 1) "GET /sessions returns at least one session"
Assert-True (($sessions | Where-Object { $_.cycleId -eq $cycleId }).Count -eq 1) "GET /sessions includes the created session"

$recommendation = Invoke-Api -Method "GET" -Path "/recommendations?taskType=coding&userId=$UserId"
Assert-True ($recommendation.taskType -eq "coding") "GET /recommendations returns lowercase taskType"
Assert-True ($recommendation.focusMinutes -gt 0) "GET /recommendations returns focus minutes"
Assert-True ($recommendation.breakMinutes -gt 0) "GET /recommendations returns break minutes"
Assert-True ($recommendation.recentSessionCount -ge 1) "GET /recommendations uses mission log data"

$stats = Invoke-Api -Method "GET" -Path "/stats?userId=$UserId"
Assert-True ($stats.totalSessions -ge 1) "GET /stats returns totalSessions"
Assert-True ($stats.completedSessions -ge 1) "GET /stats returns completedSessions"
Assert-True ($stats.totalFocusMinutes -ge 40) "GET /stats returns accumulated focus minutes"

$invalidStatus = $null
try {
  Invoke-Api -Method "GET" -Path "/recommendations?taskType=unknown&userId=$UserId" | Out-Null
  $invalidStatus = 200
} catch {
  $invalidStatus = [int]$_.Exception.Response.StatusCode
}
Assert-True ($invalidStatus -eq 400) "Invalid taskType returns HTTP 400"

Write-Host ""
Write-Host "Smoke check completed successfully."
