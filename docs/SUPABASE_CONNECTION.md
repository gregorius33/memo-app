# Supabase DB 연결 (memo-app2)

**현재 프로젝트:** memo-app2 · Project ID: `dtcxxsnxqafqnwgghedy`

## 0. 이행 후 처음 한 번 할 일

1. `.env`에서 `[YOUR-PASSWORD]`를 **Supabase 대시보드 → Project Settings → Database** 에서 확인한 DB 비밀번호로 교체하세요.
2. 터미널에서:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   또는 마이그레이션 이력으로 관리하려면:
   ```bash
   npx prisma migrate dev --name init
   ```
3. 앱 실행: `npm run dev`

## 1. 프로젝트 일시 중지(Paused) 확인

무료 플랜은 비활성 시 **자동 일시 중지**됩니다.

1. [Supabase 대시보드](https://supabase.com/dashboard) 로그인
2. 프로젝트 **memo-app2** (또는 **dtcxxsnxqafqnwgghedy**) 선택
3. 상단에 **"Project is paused"** 가 보이면 **[Restore project]** 클릭
4. 복구 완료까지 1~2분 대기 후, 터미널에서 다시 실행:
   ```bash
   npx prisma migrate dev --name init
   ```
   또는
   ```bash
   npx prisma db push
   ```

## 2. 대시보드에서 연결 문자열 복사

코드에 적어 둔 호스트가 안 될 때는 **대시보드에 나온 주소**를 쓰는 것이 가장 확실합니다.

1. 대시보드 → **Project Settings** (왼쪽 하단 톱니바퀴)
2. **Database** 메뉴
3. **Connection string** 섹션에서:
   - **URI** 탭 선택
   - **Transaction pooler** 선택 시:
     - `DATABASE_URL`: 복사한 URI 끝에 `?sslmode=require&pgbouncer=true` 가 없으면 추가
     - `DIRECT_URL`: **Session** 또는 **Direct** 연결 문자열 사용 (마이그레이션용, 포트 5432)
4. `.env`에 비밀번호만 대시보드에서 설정한 DB 비밀번호로 교체
5. 저장 후 다시:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## 3. P1001 "Can't reach database server" — 원인과 회피

### 오류가 났던 이유

- Prisma **마이그레이션**은 **DIRECT_URL**(풀러를 거치지 않는 직접 연결)을 사용합니다.
- 문서/가이드에서는 보통 **Direct** 연결을 `db.프로젝트ID.supabase.co:5432` 로 안내합니다.
- 그런데 **일부 네트워크(회사·학교·일부 ISP)**에서는:
  - **포트 5432**가 막혀 있거나,
  - **`db.xxx.supabase.co`** 도메인으로의 연결이 차단/불안정할 수 있습니다.
- 그래서 `npx prisma migrate dev` 실행 시 **"Can't reach database server at db.xxx.supabase.co:5432" (P1001)** 가 발생할 수 있습니다.

### 회피 방법 (이번에 적용한 방식)

- **DIRECT_URL**을 **Direct 호스트가 아닌, pooler 호스트 + 포트 5432** 로 바꿉니다.
  - 기존(Direct): `db.dtcxxsnxqafqnwgghedy.supabase.co:5432`
  - 변경(Session pooler): `aws-1-ap-southeast-1.pooler.supabase.com:5432`
- 같은 pooler 호스트라서 **6543(Transaction)** 이 되는 환경이면 **5432(Session)** 도 대부분 열려 있는 경우가 많습니다.
- Prisma 마이그레이션은 Session 모드(5432)에서도 동작하므로, 이렇게 바꾸면 **마이그레이션까지 정상 수행**할 수 있습니다.

**정리:**

| 연결 용도       | 호스트                          | 포트  | 용도                |
|----------------|----------------------------------|-------|---------------------|
| DATABASE_URL   | pooler (Transaction)             | 6543  | 앱 런타임 쿼리      |
| DIRECT_URL     | pooler (Session) 또는 Direct     | 5432  | 마이그레이션/스키마 |

- `db.xxx.supabase.co` 가 안 되면 → **DIRECT_URL**을 **pooler 호스트:5432** 로 설정해 보세요.
- 그래도 5432가 막혀 있으면 → **`npx prisma db push`** 만 사용하면 됩니다. (Transaction pooler 6543만으로 스키마 반영 가능, 마이그레이션 이력은 남지 않음)

## 4. 네트워크/방화벽

- 회사·학교 Wi‑Fi에서는 **Supabase DB 포트(5432, 6543)가 막혀 있을 수** 있습니다.
- **모바일 핫스팟**이나 집 네트워크에서 같은 명령을 실행해 보세요.
- 그래도 안 되면: 로컬 개발만 필요할 때는 **SQLite**로 되돌려서 쓰는 방법이 있습니다 (아래 참고).

## 5. 로컬만 SQLite로 사용 (Supabase 연결 불가 시)

Supabase에 연결하지 않고 **로컬에서만** 앱을 돌리려면:

1. `.env` 에서 DB 부분을 SQLite로 변경:
   ```env
   DATABASE_URL="file:./dev.db"
   DIRECT_URL="file:./dev.db"
   ```
2. `prisma/schema.prisma` 의 datasource 를 다시 SQLite로 변경:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   (한 줄로 하려면 `directUrl` 제거)
3. 터미널에서:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. 앱 실행:
   ```bash
   npm run dev
   ```

나중에 Supabase 연결이 되면, `schema.prisma` 를 다시 `postgresql` + `directUrl` 로 바꾸고 `.env` 에 Supabase URI 를 넣은 뒤 `prisma migrate dev` 또는 `db push` 를 실행하면 됩니다.
