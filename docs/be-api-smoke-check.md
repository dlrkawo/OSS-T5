# BE API Smoke Check

백엔드 API가 FE 연동에 필요한 최소 흐름을 만족하는지 확인하는 smoke check입니다.

## 1. 서버 실행

로컬 Gradle 실행:

```bash
cd server
./gradlew bootRun
```

또는 Docker 실행:

```bash
docker compose up --build
```

## 2. Smoke check 실행

프로젝트 루트에서 실행합니다.

```powershell
.\server\scripts\smoke-api.ps1
```

다른 서버 주소를 확인할 때는 `BaseUrl`을 지정합니다.

```powershell
.\server\scripts\smoke-api.ps1 -BaseUrl "http://localhost:8080/api"
```

## 3. 확인 범위

- `GET /api/health`
- `GET /api/settings`
- `PATCH /api/settings`
- `POST /api/sessions`
- `GET /api/sessions`
- `GET /api/recommendations?taskType=coding`
- `GET /api/stats`
- 잘못된 `taskType` 요청의 HTTP 400 처리

## 4. FE 인수인계 포인트

- `taskType`과 `outcome`은 FE에서 소문자로 보내도 정상 처리됩니다.
- `userId`를 생략하면 서버는 `demo-user`를 기본값으로 사용합니다.
- 세션 저장 후 `GET /api/sessions`, `GET /api/stats`, `GET /api/recommendations`를 다시 호출하면 화면 갱신에 필요한 데이터를 받을 수 있습니다.
- smoke check는 매번 새 세션을 저장하므로 데모 DB에 기록이 누적됩니다. 깨끗한 검증이 필요하면 `server/data/`를 비우고 다시 실행합니다.
