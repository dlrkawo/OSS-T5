# Focus Orbit 백엔드 기능 문서

이 문서는 BE API / Recommendation 브랜치에서 FE 연동에 필요한 정보를 정리한 문서입니다.

## 실행 환경

- 백엔드 기본 URL: `http://localhost:8080/api`
- 데모 사용자: `demo-user`
- 로그인/회원가입은 이번 범위에서 제외합니다. `userId`를 보내지 않으면 API는 `demo-user`를 기본값으로 사용합니다.
- enum 값은 대소문자를 구분하지 않고 처리합니다. FE에서는 아래 표의 소문자 값을 보내면 됩니다.

## 작업 유형

| FE 값 | 의미 | 기본 집중 시간 | 기본 휴식 시간 |
| --- | --- | ---: | ---: |
| `coding` | 코딩 / 개발 | 40 | 10 |
| `memorization` | 암기 | 25 | 5 |
| `writing` | 글쓰기 | 45 | 10 |
| `exam` | 시험 공부 | 30 | 5 |

## 세션 API

### `POST /api/sessions`

완료되었거나 중단된 집중 미션 1건을 저장합니다.

요청 본문:

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

필수 필드: `taskName`, `taskType`, `plannedFocusMinutes`, `plannedBreakMinutes`

기본값:

- `userId`: `demo-user`
- `outcome`: `completed`
- `pauseCount`: `0`
- `startedAt`: 서버 현재 시간
- `longBreak`: `false`

응답 본문:

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

Mission Log에 표시할 세션 목록을 최신순으로 반환합니다.

## 추천 API

### `GET /api/recommendations?taskType=coding&userId=demo-user`

Mission Setup 화면에 진입했거나 사용자가 작업 유형을 변경했을 때 호출합니다.

응답 본문:

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

추천 로직에서 사용하는 정보:

- 작업 유형별 기본 시간
- 같은 `userId`와 `taskType`의 최근 5개 세션
- 최근 세션 완료율
- 최근 세션 평균 일시정지 횟수

FE에서는 setup form 근처에 `focusMinutes`, `breakMinutes`, `reasons`의 첫 번째 문장을 표시하면 됩니다.

## 통계 API

### `GET /api/stats?userId=demo-user`

Mission Log와 Galaxy Map에서 사용할 요약 통계를 반환합니다.

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

## 설정 API

### `GET /api/settings?userId=demo-user`

저장된 UI/타이머 설정을 반환합니다. 설정이 없으면 기본 설정을 자동으로 생성합니다.

### `PATCH /api/settings?userId=demo-user`

설정을 부분 수정합니다. 요청에 포함하지 않은 필드는 기존 값을 유지합니다.

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

## 에러 응답

validation 오류와 enum 파싱 오류는 HTTP `400`으로 반환합니다.

```json
{
  "message": "Invalid request",
  "details": {
    "taskName": "must not be blank"
  }
}
```

## FE 연동 체크리스트

- 미션 시작 전 `GET /api/recommendations`를 호출합니다.
- 집중이 완료되었거나 중단되면 `POST /api/sessions`로 세션을 저장합니다.
- 세션 저장 후 `GET /api/sessions`와 `GET /api/stats`를 다시 호출해 화면을 갱신합니다.
- 앱 시작 시 `GET /api/settings`를 호출하고, 설정 변경 시 `PATCH /api/settings`를 호출합니다.
- FE 상태에서는 `taskType`과 `outcome` 값을 소문자로 유지합니다.
