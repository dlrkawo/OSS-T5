# Focus Orbit Backend Features

This document is the FE integration guide for the BE API / Recommendation branch.

## Runtime

- Backend base URL: `http://localhost:8080/api`
- Demo user: `demo-user`
- Authentication is out of scope for this project. If `userId` is omitted, the API uses `demo-user`.
- Enum values are accepted case-insensitively. FE should send lower-case values shown below.

## Task Types

| FE value | Meaning | Base focus | Base break |
| --- | --- | ---: | ---: |
| `coding` | Coding / development | 40 | 10 |
| `memorization` | Memorization | 25 | 5 |
| `writing` | Writing | 45 | 10 |
| `exam` | Exam study | 30 | 5 |

## Session API

### `POST /api/sessions`

Stores one finished or aborted focus mission.

Request body:

```json
{
  "userId": "demo-user",
  "taskName": "Implement recommendation API",
  "taskType": "coding",
  "plannedFocusMinutes": 40,
  "plannedBreakMinutes": 10,
  "cycleId": "cycle-20260606-1",
  "cycleIndex": 1,
  "totalCycles": 4,
  "longBreak": false,
  "outcome": "completed",
  "pauseCount": 1,
  "startedAt": "2026-06-06T10:00:00Z",
  "endedAt": "2026-06-06T10:40:00Z"
}
```

Required fields: `taskName`, `taskType`, `plannedFocusMinutes`, `plannedBreakMinutes`.

Defaults:

- `userId`: `demo-user`
- `outcome`: `completed`
- `pauseCount`: `0`
- `startedAt`: server current time
- `longBreak`: `false`

Response body:

```json
{
  "id": 1,
  "userId": "demo-user",
  "taskName": "Implement recommendation API",
  "taskType": "coding",
  "plannedFocusMinutes": 40,
  "plannedBreakMinutes": 10,
  "cycleId": "cycle-20260606-1",
  "cycleIndex": 1,
  "totalCycles": 4,
  "longBreak": false,
  "outcome": "completed",
  "pauseCount": 1,
  "startedAt": "2026-06-06T10:00:00Z",
  "endedAt": "2026-06-06T10:40:00Z",
  "createdAt": "2026-06-06T10:40:01Z"
}
```

### `GET /api/sessions?userId=demo-user`

Returns mission log rows in newest-first order.

## Recommendation API

### `GET /api/recommendations?taskType=coding&userId=demo-user`

Call this when Mission Setup opens or when the selected task type changes.

Response body:

```json
{
  "userId": "demo-user",
  "taskType": "coding",
  "focusMinutes": 40,
  "breakMinutes": 10,
  "focusScore": 75,
  "recentSessionCount": 0,
  "completionRate": 0.0,
  "averagePauseCount": 0.0,
  "reasons": [
    "Base preset for coding",
    "No mission log yet, so the default rhythm is used"
  ]
}
```

Recommendation inputs:

- Task type base preset
- Last 5 sessions for the same `userId` and `taskType`
- Completion rate
- Average pause count

FE should display `focusMinutes`, `breakMinutes`, and the first item in `reasons` near the setup form.

## Stats API

### `GET /api/stats?userId=demo-user`

Returns summary numbers for Mission Log and Galaxy Map.

```json
{
  "userId": "demo-user",
  "totalSessions": 3,
  "completedSessions": 2,
  "abortedSessions": 1,
  "totalFocusMinutes": 80,
  "totalPauseCount": 5,
  "completionRate": 0.67,
  "averagePauseCount": 1.67,
  "focusScore": 70
}
```

## Settings API

### `GET /api/settings?userId=demo-user`

Returns saved UI/timer preferences. Missing settings are created automatically.

### `PATCH /api/settings?userId=demo-user`

Partially updates settings. Omitted fields keep their previous value.

```json
{
  "demoShortTimer": true,
  "minimalMode": false,
  "reduceVisualEffects": true,
  "soundAlert": true,
  "desktopNotification": false,
  "showTimerInTitle": true
}
```

## Error Response

Validation and enum parsing errors return HTTP `400`.

```json
{
  "message": "Invalid request",
  "details": {
    "taskName": "must not be blank"
  }
}
```

## FE Integration Checklist

- Use `GET /api/recommendations` before starting a mission.
- Save a mission with `POST /api/sessions` when focus is completed or aborted.
- Refresh `GET /api/sessions` and `GET /api/stats` after saving a mission.
- Use `GET /api/settings` on app start and `PATCH /api/settings` when settings change.
- Keep `taskType` and `outcome` values lower-case in FE state.
