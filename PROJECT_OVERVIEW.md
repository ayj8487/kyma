# Kyma (きょうま) - 일본어 학습 웹 애플리케이션

## 프로젝트 개요

**Kyma**는 한국어 사용자를 위한 일본어 학습 웹 애플리케이션입니다.
가나(히라가나/가타카나), 단어(JLPT N5~N2), 문법, 퀴즈, AI 대화, 애니메이션 대사 학습 등
다양한 학습 기능을 제공합니다.

- **프로젝트명**: kyma-app
- **버전**: 0.1.0
- **저장소**: https://github.com/ayj8487/kyma
- **배포**: Vercel (git push 시 자동 배포)
- **대상 사용자**: 일본어를 배우는 한국어 사용자

---

## 기술 스택

### Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.1.6 | App Router 기반 풀스택 프레임워크 |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.0 | 유틸리티 기반 스타일링 |
| Zustand | 5.0.11 | 클라이언트 상태 관리 (localStorage persist) |
| Lucide React | 0.577.0 | 아이콘 라이브러리 |
| Recharts | 3.8.0 | 진행도 차트 시각화 |
| class-variance-authority | 0.7.1 | 컴포넌트 변형 관리 |
| clsx / tailwind-merge | - | 조건부 클래스 유틸리티 |

### Backend

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js API Routes | 16.1.6 | 서버리스 API 엔드포인트 |
| Prisma ORM | 7.4.2 | 데이터베이스 ORM |
| pg (node-postgres) | 8.20.0 | PostgreSQL 드라이버 |
| Vercel AI SDK | 6.0.116 | AI 모델 통합 프레임워크 |
| @ai-sdk/groq | 3.0.29 | Groq API 연동 (Llama 3.3 70B) |
| next-auth | 5.0.0-beta.30 | 인증 (설치만, 미적용) |

### Database

| 기술 | 용도 |
|------|------|
| PostgreSQL (Neon) | 클라우드 관계형 데이터베이스 |
| Prisma Migrate | 스키마 마이그레이션 관리 |
| localStorage (Zustand) | 클라이언트 사이드 학습 진행/북마크 저장 |

### 배포 & 인프라

| 기술 | 용도 |
|------|------|
| Vercel | 호스팅 & 자동 배포 (master 브랜치 push 시) |
| Neon PostgreSQL | 서버리스 PostgreSQL 호스팅 |
| Groq Cloud | AI 모델 API 서비스 |
| GitHub | 소스코드 버전 관리 |

### 브라우저 API

| API | 용도 |
|-----|------|
| Web Speech Synthesis API | 일본어 텍스트 음성 변환 (TTS) |
| SpeechRecognition API | 음성 입력 (AI 대화) |
| Tesseract.js (7.0.0) | 카메라 OCR 텍스트 인식 |

---

## 프로젝트 구조

```
kyma/
├── prisma/
│   ├── schema.prisma          # DB 스키마 정의
│   ├── migrations/            # 마이그레이션 파일
│   └── seed.ts                # 시드 데이터
├── src/
│   ├── app/                   # Next.js App Router 페이지
│   │   ├── layout.tsx         # 루트 레이아웃 (Navbar 포함)
│   │   ├── page.tsx           # 홈 (랜딩 페이지)
│   │   ├── globals.css        # 전역 스타일 & 다크모드 변수
│   │   ├── dashboard/         # 대시보드
│   │   ├── kana/              # 가나 학습
│   │   │   ├── hiragana/      # 히라가나
│   │   │   ├── katakana/      # 가타카나
│   │   │   └── quiz/          # 가나 퀴즈
│   │   ├── words/             # 단어 학습
│   │   │   ├── [level]/       # 레벨별 단어 목록
│   │   │   └── flashcard/     # 단어 플래시카드
│   │   ├── grammar/           # 문법 학습
│   │   │   ├── [level]/       # 레벨별 문법 목록
│   │   │   └── flashcard/     # 문법 플래시카드
│   │   ├── quiz/              # 퀴즈
│   │   │   └── [type]/        # 퀴즈 유형별 (kana/word/grammar)
│   │   ├── review/            # 복습 (SRS)
│   │   ├── ai/                # AI 학습
│   │   │   ├── conversation/  # AI 자유 대화
│   │   │   └── correction/    # 문장 교정
│   │   ├── anime/             # 애니메이션 대사 학습
│   │   ├── bookmarks/         # 단어장 (저장 항목)
│   │   ├── typing/            # 타자 연습
│   │   ├── news/              # 일본어 뉴스
│   │   ├── camera/            # 카메라 OCR
│   │   ├── progress/          # 진행도 & 통계
│   │   ├── goals/             # 학습 목표
│   │   ├── login/             # 로그인
│   │   ├── register/          # 회원가입
│   │   ├── admin/             # 관리자 (미들웨어로 차단)
│   │   └── api/               # API 라우트
│   │       ├── ai/chat/       # AI 대화 API
│   │       ├── kana/          # 가나 데이터 API
│   │       ├── words/         # 단어 검색/일일 단어 API
│   │       ├── quiz/          # 퀴즈 생성/제출 API
│   │       └── progress/      # 진행도 API
│   ├── components/
│   │   └── layout/
│   │       └── Navbar.tsx     # 네비게이션 바
│   ├── data/                  # 정적 학습 데이터
│   │   ├── kana.ts            # 가나 문자 데이터
│   │   ├── words.ts           # N5 단어 (40개)
│   │   ├── words-n4.ts        # N4 단어
│   │   ├── words-n3.ts        # N3 단어
│   │   ├── words-n2.ts        # N2 단어 (40개)
│   │   ├── grammar.ts         # 문법 포인트 (N5~N2, 1266줄)
│   │   ├── anime-quotes.ts    # 애니메이션 명대사
│   │   ├── conversations.ts   # 대화 예문
│   │   └── news.ts            # 뉴스 기사
│   ├── lib/                   # 유틸리티
│   │   ├── auth.ts            # 클라이언트 인증 (localStorage)
│   │   ├── correction.ts      # 문법 교정 엔진
│   │   ├── prisma.ts          # Prisma 클라이언트 싱글톤
│   │   ├── tts.ts             # TTS (speakJapanese)
│   │   └── utils.ts           # CSS 유틸리티 (cn 함수)
│   ├── store/
│   │   └── useStudyStore.ts   # Zustand 스토어 (학습 상태 관리)
│   ├── types/
│   │   ├── index.ts           # 타입 정의
│   │   └── speech.d.ts        # Speech API 타입
│   ├── generated/             # Prisma 자동 생성 파일
│   └── middleware.ts          # 라우트 미들웨어 (/admin 차단)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── prisma.config.ts
```

---

## API 엔드포인트

### AI 대화

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/ai/chat` | AI 일본어 대화 (Groq Llama 3.3 70B) |

**요청**: `{ messages: ChatMessage[], level: "beginner" | "intermediate" | "advanced" }`
**응답**: JSON `{ japanese, reading, korean, correction? }`

### 단어

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/words?jlpt_level=N5&page=1&limit=20&search=&pos=noun` | 단어 검색/페이지네이션 |
| GET | `/api/words/daily` | 오늘의 단어 5개 (날짜 기반 시드) |

### 가나

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/kana?type=hiragana&category=gojuon` | 가나 문자 조회 |

### 퀴즈

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/quiz?type=kana&count=10` | 퀴즈 문제 생성 |
| POST | `/api/quiz/submit` | 퀴즈 답안 제출 & 채점 |

### 진행도

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/progress` | 진행도 정보 (클라이언트 저장 안내) |

---

## 데이터베이스 스키마 (Prisma)

### User
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| email | String (unique) | 이메일 |
| name | String? | 이름 |
| passwordHash | String | 비밀번호 해시 |
| role | String (default: "user") | 역할 |
| jlptLevel | String (default: "N5") | JLPT 레벨 |
| totalPoints | Int (default: 0) | 총 포인트 |
| streakCount | Int (default: 0) | 연속 학습일 |
| lastStudyDate | DateTime? | 마지막 학습일 |

### Word
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| word | String | 한자/가나 표기 |
| reading | String | 읽기 (히라가나) |
| meaning | String | 한국어 뜻 |
| jlptLevel | String | JLPT 레벨 (N1~N5) |
| partOfSpeech | String | 품사 |
| exampleSentence/Reading/Meaning | String? | 예문 |

### UserProgress (SRS)
| 필드 | 타입 | 설명 |
|------|------|------|
| userId + contentType + contentId | Unique | 복합 유니크 키 |
| status | String | new / learning / mastered |
| correctCount / incorrectCount | Int | 정답/오답 횟수 |
| easeFactor | Float (default: 2.5) | SM-2 난이도 계수 |
| interval | Int (default: 0) | 복습 간격 (일) |
| nextReviewAt | DateTime? | 다음 복습 예정일 |

### QuizAttempt, KanaCharacter, Bookmark
- 퀴즈 기록, 가나 문자 정의, 북마크 관리

---

## 주요 기능

### 1. 가나 학습 (`/kana`)
- 히라가나/가타카나 50음도 그리드 표시
- 문자 클릭 시 상세 모달 (획순, TTS)
- 카테고리별 필터 (청음/탁음/반탁음/요음)
- 단어장 저장 기능

### 2. 단어 학습 (`/words`)
- JLPT N5~N2 레벨별 단어 목록
- 품사 필터 (명사/동사/형용사)
- 검색 기능
- 플래시카드 (3D 뒤집기 애니메이션)
- 단어 클릭 시 TTS 발음 재생
- 단어장 저장

### 3. 문법 학습 (`/grammar`)
- JLPT N5~N2 레벨별 문법 포인트
- 태그 기반 필터링
- 패턴 / 설명 / 접속 방법 / 예문 제공
- 문법 플래시카드
- 문법 패턴 클릭 시 TTS 발음

### 4. 퀴즈 (`/quiz`)
- 가나 퀴즈 (로마지 맞추기)
- 단어 퀴즈 (레벨 선택 + 혼합 모드)
- 문법 퀴즈 (레벨 선택 + 혼합 모드)
- 타이머, 점수 추적, 틀린 문제 복습
- 문제 클릭 시 TTS 발음

### 5. 복습 (`/review`)
- SM-2 간격 반복 알고리즘
- 오늘의 복습 / 틀린 문제 / 전체 복습 탭
- 플래시카드 방식 복습
- 5단계 자기 평가 (모르겠음 ~ 완벽)

### 6. AI 학습 (`/ai`)
- **AI 자유 대화**: Groq (Llama 3.3 70B) 기반 일본어 회화 연습
  - 18개 주제 (여행/일상/비즈니스/음식 등)
  - 3단계 난이도 (초급/중급/고급)
  - 실시간 문법 교정
  - 음성 입력 (SpeechRecognition API)
- **문장 교정**: 규칙 기반 문법 교정 엔진

### 7. 애니 대사 (`/anime`)
- 인기 애니메이션 명대사로 학습
- 난이도별/작품별 필터링
- 랜덤 명대사, 단어 해설
- 번역 토글, TTS 재생
- 작품 가나다순 정렬 + 대사 수 표시

### 8. 단어장 (`/bookmarks`)
- 학습 중 저장한 항목 모아보기
- 4개 탭: 애니 대사 / 단어 / 문법 / 가나
- 전체 삭제, 개별 삭제
- TTS 재생

### 9. 기타 기능
- **대시보드** (`/dashboard`): 오늘의 명언, 빠른 접근 카드, 학습 현황
- **진행도** (`/progress`): 학습 통계, 퀴즈 기록 차트
- **타자 연습** (`/typing`): 일본어 타이핑 연습
- **카메라** (`/camera`): OCR 텍스트 인식 (Tesseract.js)
- **뉴스** (`/news`): 일본어 뉴스 기사 읽기
- **목표** (`/goals`): 일일/주간 학습 목표 설정

---

## 상태 관리 (Zustand Store)

**스토어명**: `kyma-study-store` (localStorage 영속화)

```typescript
interface StudyState {
  progress: Record<string, ProgressEntry>  // SRS 진행 데이터
  quizHistory: QuizRecord[]                // 퀴즈 기록
  streakCount: number                      // 연속 학습일
  lastStudyDate: string | null
  totalPoints: number
  todayStudyCount: number
  bookmarks: string[]                      // "contentType:contentId" 형식
  dailyGoal: number                        // 기본 10
  weeklyGoal: number                       // 기본 50
  studyHistory: Record<string, number>     // 날짜별 학습 횟수
}
```

**핵심 메서드**:
- `updateProgress(contentType, contentId, isCorrect)` - 학습 진행 업데이트
- `updateSRS(contentType, contentId, quality)` - SM-2 알고리즘 적용
- `getDueItems()` - 복습 예정 항목 조회
- `toggleBookmark(type, id)` / `isBookmarked(type, id)` - 단어장 관리
- `addQuizRecord(record)` - 퀴즈 기록 & 연속 학습 업데이트
- `resetAllProgress()` - 전체 초기화

---

## 디자인 시스템

### 컬러 팔레트
- **Primary**: Sakura (사쿠라 핑크) `#f06f90` 계열
- **Secondary**: Warm (따뜻한 베이지) `#faf6f2` 계열
- **Accent**: Indigo (`#6b7280`), Gold (`#d4a853`)
- **다크모드**: CSS 변수 기반 전환, 전체 페이지 적용 완료

### 폰트
- **Primary**: Jua (한국어 친화적)
- **Secondary**: Noto Sans JP (일본어)
- **Fallback**: 시스템 폰트

---

## 환경 변수

| 변수명 | 용도 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 (Neon) |
| `POSTGRES_PRISMA_URL` | Prisma용 PostgreSQL URL |
| `GROQ_API_KEY` | Groq AI API 키 |

---

## 빌드 & 배포

### 스크립트
```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # prisma generate → prisma migrate deploy → next build
npm run start     # 프로덕션 서버
npm run lint      # ESLint 검사
```

### 배포 프로세스
1. `git push origin master` → Vercel 자동 배포
2. Vercel이 `npm run build` 실행
3. Prisma 마이그레이션 → Next.js 빌드 → 배포 완료

---

## 미들웨어

- `/admin/*` 경로: 미들웨어에서 `/not-found`로 리다이렉트하여 차단
