# Focus Orbit

Focus Orbit은 사용자의 작업 유형과 Mission Log를 기반으로 집중/휴식 루틴을 조정하는 adaptive pomodoro timer입니다.

기존 뽀모도로 타이머의 `25분 집중 / 5분 휴식` 고정 구조를 그대로 따르지 않고, 사용자의 작업 유형, 세션 완료 여부, 중단 횟수, 일시정지 횟수, 최근 집중 기록을 바탕으로 다음 집중 루틴을 추천합니다. 집중 세션은 우주 탐사 미션으로 표현되며, 사용자는 집중을 반복할수록 Mission Log와 Galaxy Map을 통해 자신의 집중 패턴과 성취를 확인할 수 있습니다.

## 프로젝트 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Focus Orbit |
| 주제 | 나만의 적응형 뽀모도로 타이머 |
| 형태 | FE-only 웹 애플리케이션 |
| 저장소 | https://github.com/dlrkawo/OSS-T5.git |
| 주요 저장 방식 | `localStorage` |
| 개발 방식 | `develop` 기반 feature branch workflow |

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| UI | React 19 |
| 언어 | TypeScript |
| 빌드 | Vite |
| 라우팅 | React Router |
| 스타일 | Tailwind CSS |
| 상태 관리 | React Context |
| 데이터 저장 | localStorage |
| 패키지 매니저 | Yarn |

## 실행 방법

```bash
git clone https://github.com/T5-OSS-TP/Focus-Orbit.git
cd Focus-Orbit
yarn
yarn dev
```

빌드 확인:

```bash
yarn build
```

린트 확인:

```bash
yarn lint
```

## 핵심 기능

### 1. Mission Setup

집중을 시작하기 전 작업 정보를 설정하는 화면입니다.

- 작업 이름 입력
- 작업 유형 선택
- 집중 시간과 휴식 시간 설정
- Mission Log 기반 추천 루틴 표시
- 목표 세션 수 설정
- 미션 시작

### 2. Active Timer

집중 세션을 진행하는 메인 타이머 화면입니다.

- 남은 시간 표시
- 시작, 일시정지, 재시작, 초기화, 중단
- 현재 세션 진행 상태 표시
- 예: `Orbit 1/4`, `Orbit 2/4`
- 집중 종료 시 알림
- 집중 종료 후 휴식 세션으로 전환

### 3. Session Cycle

기존 프로토타입의 `focus -> break -> setup` 흐름을 최종 프로젝트에서는 `focus -> break -> next focus` 흐름으로 확장합니다.

- 1뽀모, 2뽀모처럼 반복되는 세션 관리
- 사용자가 목표 세션 수 설정
- 4세션 완료 후 긴 휴식 제공
- 휴식 종료 후 다음 집중 자동 시작 또는 수동 시작 옵션
- Mission Log에 세션 묶음 정보 저장

추천 데이터 구조:

```ts
cycleId: string
cycleIndex: number
totalCycles: number
isLongBreak: boolean
```

### 4. Rest Station

집중 세션 후 휴식을 진행하는 화면입니다.

- 휴식 카운트다운
- 짧은 회복 행동 또는 휴식 콘텐츠 추천
- 휴식 종료 후 다음 집중으로 이동
- 긴 휴식 여부 표시

### 5. Mission Log

사용자의 집중 기록을 저장하고 보여주는 화면입니다.

- 작업 이름
- 작업 유형
- 계획 집중/휴식 시간
- 완료 또는 중단 여부
- 일시정지 횟수
- 세션 묶음 정보
- 추천 알고리즘의 입력 데이터로 활용

### 6. Galaxy Map

완료한 집중 미션을 시각적으로 보여주는 보상 화면입니다.

- 완료한 미션을 별로 기록
- 누적 집중 시간 표시
- 집중 시간에 따른 행성 해금
- 사용자의 성취감 강화

### 7. Settings

사용자 환경과 데모 설정을 관리하는 화면입니다.

- 데모용 짧은 타이머
- Minimal Mode
- Reduce Visual Effects
- Sound Alert
- Desktop Notification
- Show timer in browser title
- 전체 데이터 초기화

## Adaptiveness 정의

Focus Orbit에서 adaptiveness는 사용자의 작업 상황과 집중 기록에 따라 타이머와 인터페이스가 변화하는 성질을 의미합니다.

이 프로젝트의 적응성은 다음 세 가지 방식으로 구현됩니다.

1. 작업 유형 기반 적응
   - 코딩, 암기, 글쓰기, 시험 공부 등 작업 유형별 기본 집중/휴식 시간을 다르게 설정합니다.

2. Mission Log 기반 적응
   - 최근 세션의 완료율, 중단 횟수, 일시정지 횟수, 성공 패턴을 분석해 다음 집중 루틴을 추천합니다.

3. 사용자 상황 기반 적응
   - 사용자가 화면을 계속 보고 있지 않을 수 있으므로 Minimal Mode, 브라우저 탭 타이머, 알림 기능을 제공합니다.

## 추천 알고리즘 방향

기본 시간은 일반적인 생산성 기법과 관련 연구를 참고하되, 최종 추천은 사용자 기록을 기반으로 조정합니다.

예시 기본값:

| 작업 유형 | 집중 | 휴식 |
| --- | ---: | ---: |
| 코딩 | 40분 | 10분 |
| 암기 | 25분 | 5분 |
| 글쓰기 | 45분 | 10분 |
| 시험 공부 | 30분 | 5분 |

추천 로직에서 고려하는 요소:

- 최근 세션 완료율
- 중단 횟수
- 일시정지 횟수
- 작업 유형별 성공 패턴
- 최근 집중 피로도

설명 방향:

- 짧은 휴식은 지속적 주의 저하를 줄이는 데 도움이 될 수 있습니다.
- micro-break는 피로 감소와 활력 회복에 도움을 줄 수 있습니다.
- 단, 모든 사용자에게 같은 시간이 최적인 것은 아니므로 Focus Orbit은 고정 시간을 강제하지 않고 개인 기록에 따라 조정합니다.

## 프로젝트 구조

```txt
OSS-T5/
├── src/                    # FE React 코드
│   ├── api/                # BE API 요청 함수
│   ├── components/         # 공통 UI 컴포넌트
│   ├── domain/             # 타이머, 추천, 세션 관련 FE 도메인 로직
│   ├── hooks/              # 커스텀 훅
│   ├── layout/             # 공통 레이아웃
│   ├── pages/              # 페이지 컴포넌트
│   ├── state/              # FE 전역 상태
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server/                 # BE 서버 코드
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/         # 환경 변수, 서버 설정
│   │   ├── db/             # DB 연결 및 schema
│   │   ├── models/         # 데이터 모델
│   │   ├── repositories/   # DB 접근 로직
│   │   ├── routes/         # API 라우터
│   │   ├── controllers/    # 요청/응답 처리
│   │   ├── services/       # 비즈니스 로직
│   │   └── utils/          # 공통 유틸
│   └── package.json
│
├── public/                 # 정적 파일
├── README.md               # 프로젝트 소개, 실행 방법, 역할 분담
├── FEATURES.md             # 기능 상세 정리, 필요 시 유지
├── package.json            # FE 실행용 package.json
├── vite.config.ts
├── tsconfig.json
└── yarn.lock
```

## 역할 분담

충돌을 줄이기 위해 화면 단위가 아니라 모듈 책임 단위로 역할을 나눕니다.

| 파트 | 담당자 | 브랜치 | 담당 범위 | 주 담당 파일 |
| --- | --- | --- | --- | --- |
| Project Docs / 발표 총괄 | 이감재 | `docs/requirements-presentation` | 요구사항, 발표 흐름, 역할표, 발표 스크립트 | `docs/requirements-checklist.md`, `docs/concept.md`, `docs/final-presentation-script.md`, `docs/team-roles.md` |
| Timer Core / Session Cycle | 한승준 | `feature/session-cycle-core` | 반복 세션 구조, 타이머 계산, 세션 진행 상태 | `src/domain/sessionCycle.ts`, `src/domain/timerUtils.ts`, `src/hooks/useCountdownTimer.ts`, `src/components/SessionProgressBadge.tsx` |
| Adaptive Logic / Focus Score | 엄태용 | `feature/adaptive-core` | 추천 알고리즘, 집중 점수, 작업 유형별 기본값, 연구 근거 | `src/domain/adaptation.ts`, `src/domain/focusScore.ts`, `src/domain/taskTypes.ts`, `docs/adaptive-research.md` |
| Notification / Minimal UX | 김성원 | `feature/notification-minimal-ux` | 알림, 탭 제목 타이머, 미니멀 화면, 시각 효과 감소 옵션 | `src/hooks/useNotification.ts`, `src/hooks/useBrowserTitleTimer.ts`, `src/components/MinimalTimerView.tsx`, `src/components/NotificationBanner.tsx` |
| App Integration / Release Docs | 박찬건 | `feature/app-integration-release` | 페이지 연결, 전역 상태 통합, README, 데모 시나리오, 빌드 확인 | `src/pages/MissionSetup.tsx`, `src/pages/ActiveTimer.tsx`, `src/pages/RestStation.tsx`, `src/state/AppStateContext.tsx`, `src/domain/types.ts`, `README.md`, `FEATURES.md`, `docs/demo-scenario.md` |

## 공통 파일 관리 규칙

아래 파일은 충돌 가능성이 높기 때문에 App Integration 담당자가 주로 통합합니다.

```txt
src/pages/MissionSetup.tsx
src/pages/ActiveTimer.tsx
src/pages/RestStation.tsx
src/state/AppStateContext.tsx
src/domain/types.ts
README.md
FEATURES.md
```

다른 파트에서 위 파일 수정이 필요할 경우, 먼저 필요한 props, state, type을 공유한 뒤 최소 범위만 수정합니다.

## Git 브랜치 전략

### main

- 최종 제출 또는 데모 가능한 안정 버전만 유지합니다.
- 직접 push하지 않습니다.
- `develop`에서 충분히 검증된 내용만 병합합니다.

### develop

- 팀 개발의 기준 브랜치입니다.
- 모든 작업 브랜치는 `develop`에서 생성합니다.
- 기능 구현이 끝난 브랜치는 PR을 통해 `develop`로 병합합니다.

### feature/*

- 기능 개발용 브랜치입니다.
- 타이머, 추천 알고리즘, 알림, 통합 작업 등에 사용합니다.

### docs/*

- README, 발표 자료, 요구사항 체크리스트, 조사 문서 등 문서 작업에 사용합니다.

### chore/*

- 빌드, 린트, 패키지, 릴리즈 체크 등 운영 작업에 사용합니다.

## 현재 권장 브랜치

```txt
main
develop
docs/requirements-presentation
feature/session-cycle-core
feature/adaptive-core
feature/notification-minimal-ux
feature/app-integration-release
```

기존에 만들어둔 브랜치를 그대로 사용한다면 아래처럼 매칭합니다.

| 기존 브랜치 | 새 역할 |
| --- | --- |
| `feature/session-cycle` | Timer Core / Session Cycle |
| `feature/adaptive-recommendation` | Adaptive Logic / Focus Score |
| `feature/minimal-notification-mode` | Notification / Minimal UX |
| `chore/release-check` 또는 `docs/final-demo` | App Integration / Release Docs |

## 작업 흐름

```bash
git switch develop
git pull origin develop
git switch -c feature/session-cycle-core

# 작업 후
git status
git add .
git commit -m "feat(timer): implement session cycle core"
git push -u origin feature/session-cycle-core
```

작업 완료 후 GitHub에서 `develop`을 대상으로 Pull Request를 생성합니다.

## 커밋 메시지 규칙

```txt
type(scope): summary
```

예시:

```txt
feat(timer): implement focus and rest session cycle
feat(adaptive): add focus score calculation
feat(notification): show timer in browser title
docs(readme): update final project overview
chore(release): verify lint and build
```

커밋 타입:

| 타입 | 의미 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷, 공백 등 동작 변경 없는 수정 |
| `refactor` | 기능 변화 없는 구조 개선 |
| `test` | 테스트 추가 또는 수정 |
| `chore` | 빌드, 패키지, 설정, 유지보수 |

## 최종 데모 시나리오

1. Mission Setup에서 작업 유형을 선택합니다.
2. 작업 이름, 집중 시간, 휴식 시간, 목표 세션 수를 설정합니다.
3. 추천 루틴이 Mission Log 기반으로 제안되는 것을 보여줍니다.
4. Active Timer에서 `Orbit 1/4` 집중 세션을 시작합니다.
5. 일시정지, 재개, 중단 버튼을 보여줍니다.
6. 집중 종료 후 알림이 표시되고 Rest Station으로 이동합니다.
7. 휴식 종료 후 다음 세션으로 이어지는 흐름을 보여줍니다.
8. Mission Log에서 완료/중단 기록과 일시정지 횟수를 확인합니다.
9. Galaxy Map에서 누적 집중 시간과 행성 해금 상태를 확인합니다.
10. Settings에서 Minimal Mode, 알림, 탭 제목 타이머 옵션을 보여줍니다.
