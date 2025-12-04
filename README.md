# LMS 강의 플랫폼

라이선스 키 기반의 온라인 강의 플랫폼입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui 기반 커스텀
- **백엔드/DB**: Supabase (PostgreSQL)
- **영상**: Vimeo Player SDK
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 `.env.local`로 복사하고 값을 입력하세요:

```bash
cp .env.local.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Project Settings > API에서 URL과 anon key 복사

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 주요 기능

### 사용자
- 라이선스 키로 로그인
- 강의 목록 및 상세 보기
- Vimeo 영상 시청
- 진도율 자동 저장
- 기기 제한 (1기기)

### 관리자 (/admin)
- 강의/레슨 CRUD
- 라이선스 키 생성 및 관리
- 만료일/활성화 상태 관리

## 폴더 구조

```
lms-project/
├── app/
│   ├── page.tsx              # 키 입력 페이지
│   ├── courses/              # 강의 목록/상세
│   ├── watch/[lessonId]/     # 영상 시청
│   ├── admin/                # 관리자
│   └── api/                  # API 라우트
├── components/
│   ├── ui/                   # shadcn/ui 컴포넌트
│   ├── Header.tsx
│   └── VimeoPlayer.tsx
├── lib/
│   ├── supabase.ts          # Supabase 클라이언트
│   ├── license.ts           # 라이선스 로직
│   └── device.ts            # 기기 fingerprint
├── hooks/
├── types/
└── supabase/
    └── schema.sql           # DB 스키마
```

## Vimeo 설정

1. [Vimeo](https://vimeo.com)에서 Standard 플랜 가입
2. 영상 업로드
3. 영상 설정 > Privacy > 도메인 제한 설정
4. 영상 ID를 레슨에 등록

## 배포 (Vercel)

1. GitHub에 푸시
2. [Vercel](https://vercel.com)에서 Import
3. 환경 변수 설정
4. 배포

## 라이선스 키 흐름

1. 관리자가 키 생성 → 구매자에게 전달
2. 구매자가 키 입력 → 검증 (존재/활성/만료/기기)
3. 검증 통과 → sessionStorage에 저장
4. 브라우저 닫으면 세션 만료 → 재입력 필요

## 진도율 저장

- 영상 90% 이상 시청 시 자동 완료 처리
- 10초마다 현재 위치 저장
- 다음 접속 시 이어보기 가능

## 기기 제한

- 브라우저 fingerprint로 기기 식별
- 동시에 1기기만 사용 가능
- 30분 이상 비활성 시 다른 기기 허용

## 문의

문제가 있으면 이슈를 등록해주세요.
