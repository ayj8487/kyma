import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Kyma 서비스의 개인정보 수집, 이용, 보관, 파기에 관한 방침입니다.",
};

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    items: [
      <>
        <strong>회원가입 시</strong>: 이메일 주소, 이름, 비밀번호 (해시 저장)
      </>,
      <>
        <strong>학습 활동 시 자동 수집</strong>: 학습 진도, 북마크, 퀴즈 기록, 학습 통계, 일일 학습량
      </>,
      <>
        <strong>이메일 인증 시</strong>: 6자리 인증 코드 (해시 저장, 10분 후 자동 삭제)
      </>,
      <>
        <strong>자동 수집 항목</strong>: 접속 IP, 브라우저 종류, OS (서버 로그)
      </>,
    ],
  },
  {
    title: "2. 개인정보 수집 및 이용 목적",
    items: [
      "회원 식별 및 로그인 인증",
      "학습 진도 동기화 (여러 기기에서 사용)",
      "이메일 인증 (회원가입 시 본인 확인)",
      "서비스 개선 및 통계 분석",
      "보안 및 부정 이용 방지",
    ],
  },
  {
    title: "3. 개인정보 보유 및 이용 기간",
    items: [
      <>
        <strong>회원정보</strong>: 회원 탈퇴 시까지 보관 후 즉시 파기
      </>,
      <>
        <strong>학습 데이터</strong>: 회원 탈퇴 시 함께 삭제
      </>,
      <>
        <strong>이메일 인증 코드</strong>: 발급 후 10분 (만료 시 자동 삭제)
      </>,
      <>
        <strong>접속 로그</strong>: 최대 30일 (Vercel 보관 정책)
      </>,
    ],
  },
  {
    title: "4. 개인정보 제3자 제공",
    items: [
      "Kyma는 회원의 개인정보를 외부에 제공하지 않습니다.",
      <>
        다만 다음 경우 예외적으로 처리됩니다:
        <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
          <li>법령에 의해 수사기관의 요청이 있는 경우</li>
          <li>회원이 사전에 동의한 경우</li>
        </ul>
      </>,
    ],
  },
  {
    title: "5. 개인정보 처리 위탁",
    items: [
      <>
        서비스 제공을 위해 다음 외부 서비스를 사용합니다:
      </>,
      <>
        <strong>Vercel</strong> (미국): 웹 호스팅
      </>,
      <>
        <strong>Neon</strong> (미국): 데이터베이스
      </>,
      <>
        <strong>Resend</strong> (미국): 이메일 인증 코드 발송 (수신자 이메일만 전달)
      </>,
      <>
        <strong>Groq</strong> (미국): AI 회화/번역 (회원 식별 정보는 전송하지 않음)
      </>,
    ],
  },
  {
    title: "6. 회원의 권리",
    items: [
      "개인정보 열람 요청",
      "개인정보 수정 요청",
      "개인정보 삭제 (회원 탈퇴) 요청",
      "개인정보 처리 정지 요청",
      <>
        위 권리 행사는 아래 연락처로 문의해주시면 신속히 처리해드립니다.
      </>,
    ],
  },
  {
    title: "7. 보안 조치",
    items: [
      "비밀번호는 scrypt 해시로 단방향 암호화 저장 (원본 비밀번호 복호화 불가)",
      "세션은 HTTP-only, Secure 쿠키로 관리",
      "전체 통신은 HTTPS로 암호화",
      "이메일 인증 코드는 SHA-256 해시로 저장",
    ],
  },
  {
    title: "8. 쿠키 및 로컬 스토리지",
    items: [
      <>
        <strong>세션 쿠키 (kyma_session)</strong>: 로그인 유지용. 로그아웃 시 삭제
      </>,
      <>
        <strong>localStorage</strong>: 학습 데이터 임시 저장 (오프라인 사용 + 미가입 사용자 지원)
      </>,
      <>
        <strong>kyma-theme</strong>: 다크/라이트 모드 설정 저장
      </>,
    ],
  },
  {
    title: "9. 개인정보 보호 책임자",
    items: [
      <>
        <strong>책임자</strong>: AnYoungJun
      </>,
      <>
        <strong>이메일</strong>: 960921@gmail.com
      </>,
      "개인정보 관련 문의·신고는 위 연락처로 부탁드립니다.",
    ],
  },
  {
    title: "10. 방침 변경",
    items: [
      "본 방침은 법령 및 서비스 변경에 따라 개정될 수 있습니다.",
      "주요 변경사항은 사이트 공지 또는 이메일로 안내해드립니다.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="text-pink-500 hover:underline text-sm flex items-center gap-1 mb-6"
      >
        <ArrowLeft size={14} /> 홈으로
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300">
          <Shield size={20} />
        </div>
        <h1 className="text-3xl font-bold dark:text-zinc-50">개인정보처리방침</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">
        Kyma는 회원의 개인정보를 소중히 다루며, 관련 법령을 준수합니다.
      </p>
      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-10">
        시행일: 2026년 5월 7일
      </p>

      <div className="space-y-8">
        {SECTIONS.map((section, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-3">
              {section.title}
            </h2>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
              {section.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-pink-400 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 p-5 text-sm text-gray-700 dark:text-zinc-300">
        <p>
          이 방침에 동의하지 않으시면 회원가입을 진행하지 마시기 바랍니다.
          궁금하신 점은 언제든{" "}
          <a
            href="mailto:960921@gmail.com"
            className="text-pink-600 dark:text-pink-400 font-medium hover:underline"
          >
            960921@gmail.com
          </a>
          으로 문의해주세요.
        </p>
      </div>
    </div>
  );
}
