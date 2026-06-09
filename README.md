# Focus Orbit

Focus Orbit은 사용자의 Mission Log를 기반으로 다음 집중/휴식 루틴을 추천하는 적응형 뽀모도로 타이머입니다.

기존 Pomodoro는 보통 `25분 집중 / 5분 휴식`이라는 고정 루틴을 사용하지만, 실제 작업과 사용자별 집중 패턴은 모두 다릅니다. Focus Orbit은 사용자의 집중 시간, 휴식 시간, 완료 여부, 중단 여부, 일시정지 횟수 같은 기록을 활용해 다음 미션에 더 적합한 루틴을 제안합니다. 집중 과정은 우주 탐사 Mission으로 표현되며, Mission Log와 Galaxy Map을 통해 기록과 성취를 확인할 수 있습니다.

## 프로젝트 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Focus Orbit |
| 주제 | 나만의 적응형 뽀모도로 타이머 |
| 저장소 | https://github.com/dlrkawo/OSS-T5.git |
| 구조 | FE와 BE를 하나의 레포지토리에서 함께 관리 |
| FE | React, TypeScript, Vite |
| BE | Spring Boot 3.5, Java 21 |
| DB | H2 File DB |
| 개발 방식 | `develop` 기반 feature branch workflow |

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| FE UI | React |
| FE 언어 | TypeScript |
| FE 빌드 | Vite |
| FE 라우팅 | React Router |
| FE 스타일 | CSS |
| FE 상태 관리 | React Context, localStorage |
| FE 시각화 | Three.js, React Three Fiber, Drei |
| BE | Spring Boot 3.5, Java 21 |
| DB | H2 File DB |
| 컨테이너 | Docker Compose |
| 패키지 매니저 | Yarn, Gradle Wrapper |

## 실행 방법

저장소 clone:

```bash
git clone https://github.com/dlrkawo/OSS-T5.git
cd OSS-T5
```

FE 실행:

```bash
cd front
yarn
yarn dev
```

FE 빌드와 린트:

```bash
cd front
yarn build
yarn lint
```

BE 실행:

```bash
cd server
./gradlew bootRun
```

BE 테스트:

```bash
cd server
./gradlew test
```

Docker로 BE 실행:

```bash
docker compose up --build
```

Health 확인:

```bash
curl http://localhost:8080/api/health
```

## 핵심 기능

### 1. Mission Setup

사용자가 집중할 작업과 루틴을 설정하는 화면입니다.

- 사용자 작업 추가
- 작업 이름 입력
- 집중 시간과 휴식 시간 저장
- 저장된 작업 선택
- 목표 Orbit 수 설정
- Mission Log 기반 추천 루틴 표시
- 미션 시작

### 2. Active Timer

집중 세션을 진행하는 메인 타이머 화면입니다.

- 남은 시간 표시
- 일시정지, 재개, 완료 처리, 중단
- 현재 Orbit 진행도 표시
- 전체 Mission 진행도 표시
- 행성 궤도와 로켓 이동을 활용한 시간 흐름 시각화
- Minimal Mode와 Reduce Visual Effects 지원
- 브라우저 탭 제목, 사운드, 데스크톱 알림을 통한 상태 전달

### 3. Session Cycle

한 번 끝나는 타이머가 아니라 `1뽀모 -> 2뽀모 -> 3뽀모`처럼 반복되는 세션 구조를 제공합니다.

- `Orbit 1/4`, `Orbit 2/4`처럼 현재 세션 상태 표시
- 집중 -> 휴식 -> 다음 집중 흐름
- 마지막 Orbit 또는 4번째 Orbit 이후 긴 휴식 제공
- Mission Log에 세션 묶음 정보 저장

세션 기록 데이터:

```ts
cycleId: string
cycleIndex: number
totalCycles: number
isLongBreak: boolean
```

### 4. Rest Station

집중 세션 후 휴식을 진행하는 화면입니다.

- 휴식 카운트다운
- 짧은 휴식과 긴 휴식 구분
- 휴식 종료 후 다음 Orbit으로 이동
- 휴식 콘텐츠와 회복 분위기 제공

### 5. Mission Log

사용자의 집중 기록을 저장하고 보여주는 화면입니다.

- 작업 이름
- 계획 집중/휴식 시간
- 완료 또는 중단 여부
- 일시정지 횟수
- Orbit 정보
- 다음 추천 루틴의 입력 데이터로 활용

### 6. Galaxy Map

완료한 집중 미션을 시각적으로 보여주는 보상 화면입니다.

- 완료한 미션을 별로 기록
- 누적 집중 시간 표시
- 집중 시간에 따른 행성 해금
- 사용자의 성취감 강화

### 7. Settings

데모와 데이터 관리를 위한 설정 화면입니다.

- Demo Short Sessions
- Reset Mission Data

알림, 브라우저 제목 타이머, 사운드 알림은 기본 활성화되어 있으며, Minimal Mode와 Reduce Visual Effects는 Active Timer 화면에서 바로 조정합니다.

## Adaptiveness 정의

Focus Orbit에서 adaptiveness는 고정된 시간을 강제하는 것이 아니라, 사용자의 Mission Log를 기반으로 집중 시간과 휴식 시간을 개인화해 추천하는 것입니다.

추천에 반영하는 정보:

- 최근 세션 완료율
- 중단 여부
- 일시정지 횟수
- 최근 성공 패턴
- 저장된 작업의 기존 집중/휴식 시간

현재 FE는 localStorage에 저장된 Mission Log를 기반으로 로컬 추천을 계산합니다. BE 서버가 실행 중이면 추천 API를 함께 사용할 수 있으며, 서버에 연결할 수 없는 환경에서도 프론트 단독으로 추천 루틴을 표시합니다.

## 추천 알고리즘 방향

Focus Orbit은 특정 작업에 대해 하나의 정답 시간을 강제하지 않습니다. 사용자가 저장한 작업 루틴을 기준으로 최근 기록을 분석해 다음 미션에 더 적합한 시간을 추천합니다.

예시:

- 최근 완료율이 낮음 -> 집중 시간을 줄이고 휴식 시간을 늘림
- 일시정지 횟수가 많음 -> 집중 시간을 줄이거나 휴식을 늘림
- 최근 세션이 안정적임 -> 집중 시간을 조금 늘림
- 기록이 아직 없음 -> 저장된 작업 루틴을 기본값으로 사용

## 프로젝트 구조

```txt
OSS-T5/
├── front/                      # FE React 앱
│   ├── public/                 # 정적 파일
│   ├── src/
│   │   ├── components/         # Three.js 기반 시각화 컴포넌트
│   │   ├── data/               # 휴식 콘텐츠 데이터
│   │   ├── domain/             # 타이머, 추천, 알림, 행성, 타입 도메인 로직
│   │   ├── layout/             # 공통 앱 레이아웃
│   │   ├── pages/              # 페이지 컴포넌트
│   │   ├── services/           # BE API 요청 함수
│   │   ├── state/              # React Context, localStorage 상태 관리
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── yarn.lock
│
├── server/                     # BE Spring Boot 서버
│   ├── build.gradle
│   ├── Dockerfile
│   ├── scripts/                # API smoke check script
│   ├── src/
│   │   ├── main/java/com/focusorbit/server/
│   │   │   ├── config/         # CORS 등 서버 설정
│   │   │   ├── controllers/    # API controller
│   │   │   ├── db/             # 데모 사용자 값
│   │   │   ├── dto/            # 요청/응답 DTO
│   │   │   ├── models/         # JPA entity
│   │   │   ├── repositories/   # Spring Data JPA repository
│   │   │   └── services/       # 세션, 추천, 설정, 통계 service
│   │   └── main/resources/application.yml
│   └── gradlew
│
├── docs/                       # API 확인 및 프로젝트 보조 문서
├── docker-compose.yml          # BE Docker 실행
├── .env.example                # BE 환경 변수 예시
├── FEATURES.md                 # BE API 연동 참고 문서
└── README.md                   # 프로젝트 소개, 실행 방법, 역할 분담
```

## 역할 분담

| 인원 | 역할 | 담당 범위 | 브랜치 |
| --- | --- | --- | --- |
| 이감재 | 팀장 / 기획 / UI 디자인 / FE UI Lead | 프로젝트 컨셉 정리, 전체 UI 방향, 발표 흐름, 주요 화면 레이아웃, Mission Setup/Active Timer/Galaxy Map 중심 FE 화면 구성, 사용자 흐름 개선 | `feature/ui-layout` |
| 김성원 | FE Logic / API Integration | 타이머 동작 보조, form 처리, 상태 관리, API 연동, loading/error 처리, 데이터 표시 | `feature/fe-integration` |
| 박찬건 | BE Core / Database | `server/` 세팅, DB 설계, 엔티티, repository, 환경 변수, Docker 구성 | `feature/be-core-database` |
| 한승준 | BE API / Recommendation | session/settings/stats/recommendation API, controller, service, 추천 로직, 집중 점수 계산 | `feature/be-api-recommendation` |
| 엄태용 | DevOps / QA / Docs / Demo | README 정리, 실행 검증, API smoke check, 최종 빌드 확인, 데모 데이터, 발표 시나리오, Git tag 관리 | `chore/release-docs-demo` |

## API 범위

BE는 아래 API를 제공합니다.

```txt
GET    /api/health
POST   /api/sessions
GET    /api/sessions
GET    /api/recommendations?taskType={taskType}&userId=demo-user
GET    /api/stats
GET    /api/settings
PATCH  /api/settings
```

로그인/회원가입은 우선 제외하고 데모용 `userId`를 사용합니다.

```txt
userId: "demo-user"
```

## 공통 파일 관리 규칙

아래 파일은 충돌 가능성이 높으므로 수정 전에 팀 채팅에 먼저 공유합니다.

```txt
front/src/pages/MissionSetup.tsx
front/src/pages/ActiveTimer.tsx
front/src/pages/RestStation.tsx
front/src/pages/MissionLog.tsx
front/src/pages/GalaxyMap.tsx
front/src/pages/SettingsPage.tsx
front/src/state/*
front/src/domain/*
front/src/services/*
server/src/main/java/com/focusorbit/server/controllers/*
server/src/main/java/com/focusorbit/server/models/*
server/src/main/java/com/focusorbit/server/services/*
server/src/main/java/com/focusorbit/server/repositories/*
README.md
FEATURES.md
front/package.json
server/build.gradle
```

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
- UI, FE 연동, BE 기능 구현 등에 사용합니다.

### chore/*

- 빌드, 린트, 패키지, 릴리즈 체크, 문서 정리 등에 사용합니다.

## 권장 브랜치

```txt
main
develop
feature/ui-layout
feature/fe-integration
feature/be-core-database
feature/be-api-recommendation
chore/release-docs-demo
```

## 작업 흐름

```bash
git switch develop
git pull origin develop
git switch -c feature/ui-layout

# 작업 후
git status
git add front README.md
git commit -m "feat(ui): update mission setup flow"
git push -u origin feature/ui-layout
```

작업 완료 후 GitHub에서 `develop`을 대상으로 Pull Request를 생성합니다.

## 커밋 메시지 규칙

```txt
type(scope): summary
```

예시:

```txt
feat(ui): add mission setup layout
feat(timer): implement session cycle
feat(api): add session create endpoint
feat(server): add health endpoint and dev cors config
fix(timer): prevent duplicate pause count increment
fix(setup): use local recommendation fallback
docs(readme): update project structure
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

1. Mission Setup에서 새 작업을 추가합니다.
2. 작업 이름, 집중 시간, 휴식 시간을 저장합니다.
3. 저장된 작업을 선택하고 목표 Orbit 수를 설정합니다.
4. 추천 루틴이 Mission Log 기반으로 표시되는 것을 보여줍니다.
5. Active Timer에서 `Orbit 1/4` 집중 세션을 시작합니다.
6. 일시정지, 재개, 완료 처리, 중단 버튼을 보여줍니다.
7. 집중 종료 후 알림이 표시되고 Rest Station으로 이동합니다.
8. 휴식 종료 후 다음 Orbit으로 이어지는 흐름을 보여줍니다.
9. Mission Log에서 완료/중단 기록과 일시정지 횟수를 확인합니다.
10. Galaxy Map에서 누적 집중 시간과 행성 해금 상태를 확인합니다.
