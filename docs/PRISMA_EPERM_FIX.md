# Prisma EPERM 오류 해결 가이드 (Windows)

Windows에서 `prisma generate` 실행 시 발생하는 `EPERM: operation not permitted` 오류 해결 방법입니다.

## 오류 원인

- Prisma가 `query_engine-windows.dll.node` 파일을 생성/교체할 때 다른 프로세스가 파일을 사용 중
- 바이러스 백신이 파일을 스캔 중
- 권한 문제

## 해결 방법

### 방법 1: 실행 중인 프로세스 종료 (가장 일반적)

1. **개발 서버 종료**
   - `npm run dev` 또는 `next dev` 실행 중이면 `Ctrl+C`로 종료

2. **IDE/에디터 재시작**
   - Cursor, VS Code 등에서 Prisma 파일을 열어두고 있으면 닫기

3. **다시 시도**
   ```bash
   npx prisma generate
   ```

### 방법 2: Prisma 캐시 폴더 삭제 후 재생성

```bash
# Prisma 생성 파일 삭제
rmdir /s /q node_modules\.prisma

# 또는 PowerShell에서
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# 재생성
npx prisma generate
```

### 방법 3: npm install 재실행 (권장)

```bash
# node_modules와 lock 파일 삭제
rmdir /s /q node_modules
del package-lock.json

# 재설치 (postinstall에서 자동으로 prisma generate 실행)
npm install
```

### 방법 4: 수동으로 Prisma Generate 실행

`postinstall` 스크립트가 실패해도 계속 진행되도록 수정했습니다. 수동으로 실행:

```bash
npm run prisma:generate
```

또는

```bash
npx prisma generate
```

### 방법 5: 바이러스 백신 예외 추가

Windows Defender나 다른 백신이 `node_modules\.prisma` 폴더를 스캔하지 않도록 예외 추가:

1. Windows 보안 → 바이러스 및 위협 방지
2. 설정 관리 → 제외 추가 또는 제거
3. `node_modules\.prisma` 폴더 추가

## package.json 변경 사항

- `postinstall`: 실패해도 계속 진행되도록 수정 (`|| echo ...`)
- `dev`: 시작 전에 `prisma generate` 실행
- `prisma:generate`: 수동 실행용 스크립트 추가

## Vercel 배포 시

Vercel에서는 `postinstall`이 실패해도 `build` 스크립트에서 `prisma generate`가 실행되므로 문제없습니다.

## 참고

- Prisma 클라이언트는 스키마가 변경될 때만 재생성이 필요합니다
- 개발 중에는 `npm run dev`를 실행하면 자동으로 `prisma generate`가 실행됩니다
- 프로덕션 빌드 시에는 `npm run build`가 자동으로 처리합니다
