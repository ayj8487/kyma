import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Kyma 서비스의 이용 조건과 책임 범위에 관한 약관입니다.",
};

const SECTIONS = [
  {
    title: "제1조 (목적)",
    body: [
      "본 약관은 Kyma(이하 '서비스')가 제공하는 일본어 학습 플랫폼의 이용에 관한 조건과 절차, 회원과 서비스 운영자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.",
    ],
  },
  {
    title: "제2조 (용어 정의)",
    body: [
      <>
        <strong>회원</strong>: 본 약관에 동의하고 서비스에 가입한 사람
      </>,
      <>
        <strong>비회원</strong>: 회원가입 없이 서비스를 이용하는 사람 (학습 데이터는 브라우저에만 저장)
      </>,
      <>
        <strong>학습 데이터</strong>: 회원이 서비스를 통해 생성한 진도, 북마크, 퀴즈 기록 등
      </>,
    ],
  },
  {
    title: "제3조 (서비스 제공)",
    body: [
      "본 서비스는 무료로 제공되며, 별도의 광고나 결제 기능을 포함하지 않습니다.",
      "다음과 같은 학습 기능을 제공합니다: 히라가나/가타카나, JLPT N5~N1 단어, 문법, 퀴즈, SRS 복습, AI 회화 연습, AI 문법 교정, NHK 뉴스, 카메라 OCR 번역, 타자 연습, 애니 명언 등",
      "서비스 운영자는 학습 콘텐츠를 지속적으로 보강·수정할 수 있습니다.",
    ],
  },
  {
    title: "제4조 (회원가입)",
    body: [
      "회원가입은 본인의 유효한 이메일로만 가능하며, 이메일 인증 절차를 거칩니다.",
      "허위 정보 또는 타인의 정보로 가입한 경우, 운영자는 통보 없이 계정을 삭제할 수 있습니다.",
      "만 14세 미만은 보호자의 동의 후 가입을 권장합니다.",
    ],
  },
  {
    title: "제5조 (회원 탈퇴)",
    body: [
      "회원은 언제든 운영자에게 탈퇴를 요청할 수 있으며, 운영자는 즉시 처리합니다.",
      "탈퇴 시 회원의 개인정보 및 학습 데이터는 즉시 영구 삭제됩니다 (복구 불가).",
    ],
  },
  {
    title: "제6조 (서비스의 변경 및 중단)",
    body: [
      "운영자는 서비스 개선을 위해 사전 공지 후 기능을 추가·변경·삭제할 수 있습니다.",
      "기술적 결함, 외부 API(Groq, Resend 등) 장애, 법령 변경 등 불가피한 사유로 서비스가 일시 중단될 수 있으며, 이로 인한 손해에 운영자는 책임지지 않습니다.",
      "본 서비스는 개인이 운영하는 무료 학습 도구이므로, 영구적 운영을 보장하지 않습니다.",
    ],
  },
  {
    title: "제7조 (이용 제한)",
    body: [
      "회원은 다음 행위를 해서는 안 됩니다:",
      <>
        <ul className="list-disc ml-5 space-y-1 text-sm mt-1">
          <li>서비스의 정상 운영을 방해하는 행위</li>
          <li>다른 회원의 정보를 도용하거나 부정 사용</li>
          <li>API를 자동화 도구로 무차별 호출 (Rate limiting 우회 시도)</li>
          <li>서비스 또는 운영자의 명예를 훼손하는 행위</li>
          <li>저작권·지적재산권 침해 행위</li>
        </ul>
      </>,
      "위반 시 운영자는 통보 없이 계정을 정지·삭제할 수 있습니다.",
    ],
  },
  {
    title: "제8조 (저작권 및 콘텐츠)",
    body: [
      "서비스 내 학습 콘텐츠(단어, 문법, 예문, 디자인 등)의 저작권은 운영자 또는 정당한 권리자에게 있습니다.",
      "회원은 학습 목적의 개인적 사용에 한해 콘텐츠를 이용할 수 있으며, 무단 복제·재배포·상업적 이용은 금지됩니다.",
      "NHK 뉴스 등 제3자 콘텐츠는 해당 출처의 저작권 정책을 따릅니다.",
      "AI 응답(번역, 회화, 문법 교정)의 정확성은 보장되지 않으므로, 중요한 의사결정에는 전문가 검수를 권장합니다.",
    ],
  },
  {
    title: "제9조 (면책 조항)",
    body: [
      "본 서비스는 학습 보조 도구로 제공되며, 학습 결과나 시험 성적을 보장하지 않습니다.",
      "AI가 생성한 번역·교정 결과의 정확성에 대해 운영자는 보증하지 않습니다.",
      "회원의 부주의(비밀번호 분실, 무단 사용 등)로 인한 손해는 회원 본인이 부담합니다.",
      "천재지변, 외부 서비스 장애 등 불가항력적 사유로 인한 손해는 면책됩니다.",
    ],
  },
  {
    title: "제10조 (분쟁 해결)",
    body: [
      "본 약관에 명시되지 않은 사항은 대한민국 관계 법령 및 일반 관례에 따릅니다.",
      "서비스 이용에 관한 분쟁이 발생하면 운영자와 회원이 신의성실의 원칙에 따라 협의하여 해결합니다.",
    ],
  },
  {
    title: "제11조 (약관의 변경)",
    body: [
      "본 약관은 법령 및 서비스 변경에 따라 개정될 수 있으며, 변경 시 사이트 공지 또는 이메일로 안내합니다.",
      "변경된 약관에 동의하지 않는 회원은 탈퇴할 수 있습니다.",
    ],
  },
  {
    title: "제12조 (문의처)",
    body: [
      <>
        <strong>운영자</strong>: AnYoungJun
      </>,
      <>
        <strong>이메일</strong>:{" "}
        <a
          href="mailto:960921@gmail.com"
          className="text-pink-600 dark:text-pink-400 hover:underline"
        >
          960921@gmail.com
        </a>
      </>,
    ],
  },
];

export default function TermsPage() {
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
          <FileText size={20} />
        </div>
        <h1 className="text-3xl font-bold dark:text-zinc-50">이용약관</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">
        Kyma 서비스 이용 시 적용되는 약관입니다.
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
              {section.body.map((item, j) => (
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
          본 약관은 회원가입 시 동의 절차를 거치며, 가입 이후에는{" "}
          <Link href="/privacy" className="text-pink-600 dark:text-pink-400 font-medium hover:underline">
            개인정보처리방침
          </Link>
          과 함께 적용됩니다.
        </p>
      </div>
    </div>
  );
}
