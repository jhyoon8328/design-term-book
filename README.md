# Design Data Guide & Management Dashboard

본 프로젝트는 의류 디자인 및 현장 작업 시 필요한 데이터(스티치, 솔·시접, 현장 용어 등)를 한곳에서 가이드라인으로 제공하고 관리하기 위한 Next.js App Router 기반의 웹 애플리케이션입니다.

## 기술 스택
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase
- **Excel Handling**: xlsx
- **Icons**: lucide-react

## 핵심 기능
1. **데이터 가이드 조회**: 디자인 및 생산 공정별 카테고리(전체, 스티치, 솔·시접 등)에 따른 정보 검색 및 필터링 기능.
2. **관리자용 인라인 CRUD**: 화면의 테이블 내에서 직접 새로운 데이터를 추가(Create), 수정(Update), 삭제(Delete) 가능.
3. **엑셀 연동**: `xlsx` 라이브러리를 활용하여 로컬 엑셀 데이터를 테이블(DB)에 일괄 업로드하거나 현재 데이터를 다운로드하는 기능 포함.
4. **반응형 SaaS UI**: 깔끔하고 직관적인 카드형 레이아웃과 모던한 디자인 적용.

## 프로젝트 실행 방법

### 1. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성(이미 있다면 수정)하고, 아래와 같이 본인의 Supabase 프로젝트 정보를 입력합니다.
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 로컬 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000) 로 접속하여 확인합니다.

### 4. Supabase DB 스키마 설정
Supabase의 SQL Editor에서 다음 쿼리를 실행하여 테이블을 생성합니다.
```sql
CREATE TABLE data_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  situation TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Vercel 배포 방법
1. Vercel(https://vercel.com) 에 로그인 후 GitHub 레포지토리를 연동하여 새 프로젝트를 생성합니다.
2. `Framework Preset`은 `Next.js`로 자동 지정됩니다.
3. `Environment Variables` 설정란에 로컬에 설정했던 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 추가합니다.
4. `Deploy` 버튼을 눌러 배포를 완료합니다.
