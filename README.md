# Focus Orbit

Focus Orbit은 사용자의 작업 유형과 Mission Log를 기반으로 집중/휴식 루틴을 조정하는 adaptive pomodoro timer입니다.

기존 뽀모도로 타이머의 고정된 `25분 집중 / 5분 휴식` 구조에서 확장하여, 사용자의 작업 유형, 세션 완료 여부, 중단 횟수, 일시정지 횟수, 최근 집중 기록을 바탕으로 다음 집중 루틴을 추천합니다. 집중 세션은 우주 탐사 미션으로 표현되며, 사용자는 Mission Log와 Galaxy Map을 통해 자신의 집중 패턴과 성취를 확인할 수 있습니다.

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
| FE 스타일 | Tailwind CSS |
| FE 상태 관리 | React Context |
| BE | Spring Boot 3.5 + Java 21 |
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
yarn
yarn dev
```

FE 빌드와 린트:

```bash
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

집중을 시작하기 전 작업 정보를 설정하는 화면입니다.

- 작업 이름 입력
- 작업 유형 선택
- 집중 시간과 휴식 시간 설정
- 목표 세션 수 설정
- Mission Log 기반 추천 루틴 표시
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

`focus -> break -> setup` 흐름을 `focus -> break -> next focus` 흐름으로 확장합니다.

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
- 회복 행동 또는 휴식 콘텐츠 추천
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

이 프로젝트의 적응성은 다음 세 가지 방식으로 구현합니다.

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
│   ├── build.gradle
│   ├── Dockerfile
│   ├── src/
│   │   ├── main/java/com/focusorbit/server/
│   │   │   ├── config/         # CORS 등 서버 설정
│   │   │   ├── controllers/    # 요청/응답 처리
│   │   │   ├── db/             # 데모 사용자 등 DB 보조 값
│   │   │   ├── models/         # JPA 엔티티
│   │   │   └── repositories/   # Spring Data JPA repository
│   │   └── main/resources/application.yml
│   └── gradlew
│
├── docker-compose.yml      # BE Docker 실행
├── .env.example            # BE 환경 변수 예시
├── public/                 # 정적 파일
├── README.md               # 프로젝트 소개, 실행 방법, 역할 분담
├── FEATURES.md             # 기능 상세 정리, 필요 시 유지
├── package.json            # FE 실행용 package.json
├── vite.config.ts
├── tsconfig.json
└── yarn.lock
```

## 역할 분담

| 인원 | 역할 | 담당 범위 | 추천 브랜치 |
| --- | --- | --- | --- |
| 이감재 | 팀장 / 기획 / UI 디자인 / FE UI Lead | 전체 기획, 사용자 흐름, 전체 UI 컨셉, 디자인 방향, 주요 페이지 레이아웃, 발표 흐름 | `feature/ui-layout` |
| FE 팀원 | FE Logic / API Integration | 타이머 동작, form 처리, 상태 관리, API 연동, loading/error 처리, 데이터 표시 | `feature/fe-integration` |
| 박찬건 | BE Core / Database | `server/` 세팅, DB 설계, 모델, DB 연결, repository, `.env.example`, Docker | `feature/be-core-database` |
| BE 팀원 2 | BE API / Recommendation | API 라우터, controller, service, 추천 알고리즘, 집중 점수, 통계 응답 | `feature/be-api-recommendation` |
| DevOps/QA 팀원 | DevOps / QA / Docs / Demo | README, 실행 검증, API 명세, 테스트, 데모 데이터, 발표 시나리오, 최종 빌드 확인 | `chore/release-docs-demo` |

## API 범위

최종 프로젝트에서 BE는 아래 API를 우선 구현합니다.

```txt
GET    /api/health
POST   /api/sessions
GET    /api/sessions
GET    /api/recommendations?taskType=coding
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
src/pages/MissionSetup.tsx
src/pages/ActiveTimer.tsx
src/pages/RestStation.tsx
src/pages/MissionLog.tsx
src/pages/SettingsPage.tsx
src/state/*
src/domain/*
server/src/db/*
server/src/models/*
server/src/services/*
docs/api-spec.md
README.md
FEATURES.md
package.json
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
git switch -c feature/be-core-database

# 작업 후
git status
git add server .env.example docker-compose.yml README.md
git commit -m "feat(db): define backend core database"
git push -u origin feature/be-core-database
```

작업 완료 후 GitHub에서 `develop`을 대상으로 Pull Request를 생성합니다.

## 커밋 메시지 규칙

```txt
type(scope): summary
```

예시:

```txt
feat(ui): add mission setup layout
feat(timer): implement countdown hook
feat(api): add session create endpoint
feat(db): define session schema
feat(server): add health endpoint and dev cors config
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
