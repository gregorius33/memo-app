# Vercel Environment Variables 설정 가이드

Vercel에서 GitHub 저장소를 임포트할 때 설정해야 할 환경 변수 목록입니다.

## 필수 환경 변수

### 1. `DATABASE_URL`
**설명:** Prisma가 앱 런타임에서 사용하는 데이터베이스 연결 문자열 (Transaction pooler)

**값:**
```
postgresql://postgres.dtcxxsnxqafqnwgghedy:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**주의:** `[YOUR-PASSWORD]`를 Supabase 대시보드 → Project Settings → Database에서 확인한 실제 비밀번호로 교체하세요.

---

### 2. `DIRECT_URL`
**설명:** Prisma 마이그레이션 및 스키마 동기화용 직접 연결 문자열

**값:**
```
postgresql://postgres.dtcxxsnxqafqnwgghedy:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**주의:** 
- `[YOUR-PASSWORD]`는 `DATABASE_URL`과 동일한 비밀번호를 사용합니다.
- `db.dtcxxsnxqafqnwgghedy.supabase.co:5432`가 연결되지 않으면 pooler 호스트의 5432 포트를 사용하세요.

---

### 3. `JWT_SECRET`
**설명:** JWT 토큰 서명 및 검증에 사용되는 비밀키 (최소 32자 이상)

**값 예시:**
```
your-super-secret-key-change-in-production-min-32-chars-random-string-here
```

**보안 권장사항:**
- 프로덕션에서는 강력한 랜덤 문자열을 사용하세요.
- 로컬 개발과 프로덕션에서 다른 값을 사용하는 것을 권장합니다.
- 다음 명령어로 생성 가능:
  ```bash
  openssl rand -base64 32
  ```
  또는 온라인 생성기: https://randomkeygen.com/

---

## 선택적 환경 변수 (현재 미사용)

다음 변수들은 코드에 주석 처리되어 있어 현재는 필요하지 않습니다. 나중에 Supabase 클라이언트를 사용할 때 필요할 수 있습니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Vercel에서 설정하는 방법

1. **Vercel 대시보드** → 프로젝트 선택
2. **Settings** → **Environment Variables** 메뉴
3. 각 환경 변수를 추가:
   - **Name:** `DATABASE_URL`
   - **Value:** 위의 값 (비밀번호 포함)
   - **Environment:** Production, Preview, Development 모두 선택 (또는 필요에 따라 선택)
4. `DIRECT_URL`, `JWT_SECRET`도 동일하게 추가
5. **Save** 클릭

---

## 환경별 설정

- **Production:** 프로덕션 환경에서만 사용
- **Preview:** Pull Request 미리보기에서 사용
- **Development:** 로컬 개발 환경에서 사용 (Vercel CLI 사용 시)

**권장:** 모든 환경에서 동일한 값을 사용하거나, 필요에 따라 분리할 수 있습니다.

---

## 배포 후 확인

환경 변수 설정 후:
1. **Deployments** 탭에서 새 배포를 트리거하거나
2. GitHub에 푸시하면 자동으로 재배포됩니다.
3. 배포 로그에서 Prisma 마이그레이션이 성공적으로 실행되는지 확인하세요.

---

## 문제 해결

### Prisma 마이그레이션 실패 시
- `DIRECT_URL`이 올바른지 확인
- Supabase 프로젝트가 Active 상태인지 확인
- 방화벽/네트워크 문제가 없는지 확인

### 연결 오류 (P1001) 발생 시
- `docs/SUPABASE_CONNECTION.md` 참고
- `DIRECT_URL`을 pooler 호스트:5432로 변경 시도
