"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Timer, Target, Zap, RotateCcw, Keyboard, SkipForward, Eye, MessageSquare, Infinity as InfinityIcon } from "lucide-react";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
import { n1Words } from "@/data/words-n1";

type Mode = "hiragana" | "katakana" | "word" | "sentence";

interface TypingItem {
  display: string;
  answer: string;
  meaning?: string;
}

// 탁음 · 반탁음 · 합자 (히라가나)
const hiraganaDakuten: TypingItem[] = [
  { display: "が", answer: "ga" }, { display: "ぎ", answer: "gi" }, { display: "ぐ", answer: "gu" }, { display: "げ", answer: "ge" }, { display: "ご", answer: "go" },
  { display: "ざ", answer: "za" }, { display: "じ", answer: "ji" }, { display: "ず", answer: "zu" }, { display: "ぜ", answer: "ze" }, { display: "ぞ", answer: "zo" },
  { display: "だ", answer: "da" }, { display: "で", answer: "de" }, { display: "ど", answer: "do" },
  { display: "ば", answer: "ba" }, { display: "び", answer: "bi" }, { display: "ぶ", answer: "bu" }, { display: "べ", answer: "be" }, { display: "ぼ", answer: "bo" },
  { display: "ぱ", answer: "pa" }, { display: "ぴ", answer: "pi" }, { display: "ぷ", answer: "pu" }, { display: "ぺ", answer: "pe" }, { display: "ぽ", answer: "po" },
  { display: "きゃ", answer: "kya" }, { display: "きゅ", answer: "kyu" }, { display: "きょ", answer: "kyo" },
  { display: "しゃ", answer: "sha" }, { display: "しゅ", answer: "shu" }, { display: "しょ", answer: "sho" },
  { display: "ちゃ", answer: "cha" }, { display: "ちゅ", answer: "chu" }, { display: "ちょ", answer: "cho" },
  { display: "にゃ", answer: "nya" }, { display: "にゅ", answer: "nyu" }, { display: "にょ", answer: "nyo" },
  { display: "ひゃ", answer: "hya" }, { display: "ひゅ", answer: "hyu" }, { display: "ひょ", answer: "hyo" },
  { display: "みゃ", answer: "mya" }, { display: "みゅ", answer: "myu" }, { display: "みょ", answer: "myo" },
  { display: "りゃ", answer: "rya" }, { display: "りゅ", answer: "ryu" }, { display: "りょ", answer: "ryo" },
  { display: "ぎゃ", answer: "gya" }, { display: "ぎゅ", answer: "gyu" }, { display: "ぎょ", answer: "gyo" },
  { display: "じゃ", answer: "ja" },  { display: "じゅ", answer: "ju" },  { display: "じょ", answer: "jo" },
  { display: "びゃ", answer: "bya" }, { display: "びゅ", answer: "byu" }, { display: "びょ", answer: "byo" },
  { display: "ぴゃ", answer: "pya" }, { display: "ぴゅ", answer: "pyu" }, { display: "ぴょ", answer: "pyo" },
];

// 탁음 · 반탁음 · 합자 (가타카나)
const katakanaDakuten: TypingItem[] = [
  { display: "ガ", answer: "ga" }, { display: "ギ", answer: "gi" }, { display: "グ", answer: "gu" }, { display: "ゲ", answer: "ge" }, { display: "ゴ", answer: "go" },
  { display: "ザ", answer: "za" }, { display: "ジ", answer: "ji" }, { display: "ズ", answer: "zu" }, { display: "ゼ", answer: "ze" }, { display: "ゾ", answer: "zo" },
  { display: "ダ", answer: "da" }, { display: "デ", answer: "de" }, { display: "ド", answer: "do" },
  { display: "バ", answer: "ba" }, { display: "ビ", answer: "bi" }, { display: "ブ", answer: "bu" }, { display: "ベ", answer: "be" }, { display: "ボ", answer: "bo" },
  { display: "パ", answer: "pa" }, { display: "ピ", answer: "pi" }, { display: "プ", answer: "pu" }, { display: "ペ", answer: "pe" }, { display: "ポ", answer: "po" },
  { display: "キャ", answer: "kya" }, { display: "キュ", answer: "kyu" }, { display: "キョ", answer: "kyo" },
  { display: "シャ", answer: "sha" }, { display: "シュ", answer: "shu" }, { display: "ショ", answer: "sho" },
  { display: "チャ", answer: "cha" }, { display: "チュ", answer: "chu" }, { display: "チョ", answer: "cho" },
  { display: "ニャ", answer: "nya" }, { display: "ニュ", answer: "nyu" }, { display: "ニョ", answer: "nyo" },
  { display: "ヒャ", answer: "hya" }, { display: "ヒュ", answer: "hyu" }, { display: "ヒョ", answer: "hyo" },
  { display: "ミャ", answer: "mya" }, { display: "ミュ", answer: "myu" }, { display: "ミョ", answer: "myo" },
  { display: "リャ", answer: "rya" }, { display: "リュ", answer: "ryu" }, { display: "リョ", answer: "ryo" },
  { display: "ギャ", answer: "gya" }, { display: "ギュ", answer: "gyu" }, { display: "ギョ", answer: "gyo" },
  { display: "ジャ", answer: "ja" },  { display: "ジュ", answer: "ju" },  { display: "ジョ", answer: "jo" },
  { display: "ビャ", answer: "bya" }, { display: "ビュ", answer: "byu" }, { display: "ビョ", answer: "byo" },
  { display: "ピャ", answer: "pya" }, { display: "ピュ", answer: "pyu" }, { display: "ピョ", answer: "pyo" },
];

// 문장 연습 풀 (N5~N1, 각 10문장)
const sentencePool: Record<string, TypingItem[]> = {
  N5: [
    { display: "私は学生です。",          answer: "わたしはがくせいです",         meaning: "저는 학생입니다." },
    { display: "今日は天気がいいです。",   answer: "きょうはてんきがいいです",      meaning: "오늘은 날씨가 좋습니다." },
    { display: "水をください。",           answer: "みずをください",               meaning: "물 주세요." },
    { display: "学校に行きます。",         answer: "がっこうにいきます",            meaning: "학교에 갑니다." },
    { display: "日本語を勉強します。",     answer: "にほんごをべんきょうします",    meaning: "일본어를 공부합니다." },
    { display: "今何時ですか。",           answer: "いまなんじですか",              meaning: "지금 몇 시입니까?" },
    { display: "これはいくらですか。",     answer: "これはいくらですか",            meaning: "이것은 얼마입니까?" },
    { display: "お名前は何ですか。",       answer: "おなまえはなんですか",          meaning: "성함이 어떻게 되세요?" },
    { display: "毎日運動しています。",     answer: "まいにちうんどうしています",    meaning: "매일 운동하고 있습니다." },
    { display: "好きな食べ物は何ですか。", answer: "すきなたべものはなんですか",    meaning: "좋아하는 음식은 무엇입니까?" },
  ],
  N4: [
    { display: "もう少し待ってください。",         answer: "もうすこしまってください",          meaning: "조금만 더 기다려 주세요." },
    { display: "雨が降りそうですね。",             answer: "あめがふりそうですね",              meaning: "비가 올 것 같네요." },
    { display: "料理を作るのが好きです。",         answer: "りょうりをつくるのがすきです",       meaning: "요리 만드는 것을 좋아합니다." },
    { display: "電車が遅刻しています。",           answer: "でんしゃがちこくしています",         meaning: "전철이 지연되고 있습니다." },
    { display: "風邪をひいてしまいました。",       answer: "かぜをひいてしまいました",           meaning: "감기에 걸려 버렸습니다." },
    { display: "週末は何をしますか。",             answer: "しゅうまつはなにをしますか",         meaning: "주말에 무엇을 합니까?" },
    { display: "この映画を見たことがありますか。", answer: "このえいがをみたことがありますか",   meaning: "이 영화를 본 적이 있습니까?" },
    { display: "友達に手紙を書きました。",         answer: "ともだちにてがみをかきました",        meaning: "친구에게 편지를 썼습니다." },
    { display: "日本に来て三年になります。",       answer: "にほんにきてさんねんになります",      meaning: "일본에 온 지 3년이 됩니다." },
    { display: "彼女はとても優しい人です。",       answer: "かのじょはとてもやさしいひとです",   meaning: "그녀는 매우 친절한 사람입니다." },
  ],
  N3: [
    { display: "電車が遅れているようです。",           answer: "でんしゃがおくれているようです",          meaning: "전철이 늦고 있는 것 같습니다." },
    { display: "彼のおかげで合格しました。",           answer: "かれのおかげでごうかくしました",           meaning: "그 덕분에 합격했습니다." },
    { display: "最近運動不足が気になります。",         answer: "さいきんうんどうぶそくがきになります",      meaning: "최근 운동 부족이 신경 쓰입니다." },
    { display: "外国語を話せるようになりたい。",       answer: "がいこくごをはなせるようになりたい",        meaning: "외국어를 말할 수 있게 되고 싶다." },
    { display: "来月から新しい仕事を始めます。",       answer: "らいげつからあたらしいしごとをはじめます",  meaning: "다음 달부터 새로운 일을 시작합니다." },
    { display: "彼女に会うたびに元気をもらいます。",   answer: "かのじょにあうたびにげんきをもらいます",    meaning: "그녀를 만날 때마다 힘을 얻습니다." },
    { display: "早く日本語が上手になりたいです。",     answer: "はやくにほんごがじょうずになりたいです",    meaning: "빨리 일본어를 잘하게 되고 싶습니다." },
    { display: "田中さんはとても真面目な人です。",     answer: "たなかさんはとてもまじめなひとです",        meaning: "다나카 씨는 매우 성실한 사람입니다." },
    { display: "もし時間があれば一緒に行きましょう。", answer: "もしじかんがあればいっしょにいきましょう",  meaning: "만약 시간이 있으면 함께 갑시다." },
    { display: "この問題を解くのに時間がかかった。",   answer: "このもんだいをとくのにじかんがかかった",    meaning: "이 문제를 푸는 데 시간이 걸렸다." },
  ],
  N2: [
    { display: "徹夜して締め切りに間に合わせた。",         answer: "てつやしてしめきりにまにあわせた",           meaning: "밤을 새워 마감에 맞췄다." },
    { display: "どんなに忙しくても運動します。",           answer: "どんなにいそがしくてもうんどうします",        meaning: "아무리 바빠도 운동합니다." },
    { display: "この結果にはとても満足しています。",       answer: "このけっかにはとてもまんぞくしています",      meaning: "이 결과에 매우 만족하고 있습니다." },
    { display: "たとえ難しくても挑戦します。",             answer: "たとえむずかしくてもちょうせんします",        meaning: "설령 어려워도 도전합니다." },
    { display: "すべては自分の努力次第です。",             answer: "すべてはじぶんのどりょくしだいです",          meaning: "모든 것은 자신의 노력 나름입니다." },
    { display: "やってみなければわからないものです。",     answer: "やってみなければわからないものです",           meaning: "해보지 않으면 알 수 없는 것입니다." },
    { display: "彼の言い方は少しひどいと思う。",           answer: "かれのいいかたはすこしひどいとおもう",        meaning: "그의 말하는 방식이 조금 심하다고 생각한다." },
    { display: "今日中に報告書を出してください。",         answer: "きょうじゅうにほうこくしょをだしてください",  meaning: "오늘 안으로 보고서를 제출해 주세요." },
    { display: "うまくいかなくてもあきらめないでいる。",   answer: "うまくいかなくてもあきらめないでいる",         meaning: "잘 안 되더라도 포기하지 않고 있다." },
    { display: "こんなに楽しいのは久しぶりです。",         answer: "こんなにたのしいのはひさしぶりです",           meaning: "이렇게 즐거운 것은 오랜만입니다." },
  ],
  N1: [
    { display: "物事は見方によって変わります。",           answer: "ものごとはみかたによってかわります",           meaning: "사물은 보는 방식에 따라 달라집니다." },
    { display: "自分の信じる道を進めばいい。",             answer: "じぶんのしんじるみちをすすめばいい",           meaning: "자신이 믿는 길을 나아가면 된다." },
    { display: "さまざまな経験が人を育てる。",             answer: "さまざまなけいけんがひとをそだてる",           meaning: "다양한 경험이 사람을 성장시킨다." },
    { display: "いかなる状況でも冷静さを保つ。",           answer: "いかなるじょうきょうでもれいせいさをたもつ",   meaning: "어떤 상황에서도 냉정함을 유지한다." },
    { display: "経験を生かして新たな挑戦をする。",         answer: "けいけんをいかしてあらたなちょうせんをする",   meaning: "경험을 살려 새로운 도전을 한다." },
    { display: "日本語の敬語は難しいが楽しい。",           answer: "にほんごのけいごはむずかしいがたのしい",       meaning: "일본어 경어는 어렵지만 재밌다." },
    { display: "継続することが最大の力になる。",           answer: "けいぞくすることがさいだいのちからになる",     meaning: "지속하는 것이 최대의 힘이 된다." },
    { display: "何事もこつこつ積み重ねることが大事だ。",   answer: "なにごともこつこつつみかさねることがだいじだ", meaning: "무슨 일이든 꾸준히 쌓아가는 것이 중요하다." },
    { display: "時代の変化に柔軟に対応する必要がある。",   answer: "じだいのへんかにじゅうなんにたいおうするひつようがある", meaning: "시대의 변화에 유연하게 대응할 필요가 있다." },
    { display: "一概に良い悪いとは言えない問題だ。",       answer: "いちがいによいわるいとはいえないもんだいだ",   meaning: "일괄적으로 좋다 나쁘다고 할 수 없는 문제다." },
  ],
};

const wordsByLevel: Record<string, typeof n5Words> = {
  N5: n5Words, N4: n4Words, N3: n3Words, N2: n2Words, N1: n1Words,
};

// 0 = 무제한
const TIME_OPTIONS = [30, 60, 90, 120, 180, 0] as const;
type TimeOption = (typeof TIME_OPTIONS)[number];

// 모드별 추천 시간
const MODE_DEFAULT_TIME: Record<Mode, TimeOption> = {
  hiragana: 60,
  katakana: 60,
  word: 90,
  sentence: 120,
};

export default function TypingPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [gameVariant, setGameVariant] = useState<string>("basic");
  const [selectedTime, setSelectedTime] = useState<TimeOption>(60);
  const [totalTime, setTotalTime] = useState<TimeOption>(60); // time chosen for the active game
  const [items, setItems] = useState<TypingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0); // for unlimited mode termination
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsed, setElapsed] = useState(0); // for unlimited mode display
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = useCallback((m: Mode, variant: string, timeOverride?: TimeOption) => {
    setMode(m);
    setGameVariant(variant);
    const time = timeOverride ?? selectedTime;
    setTotalTime(time);

    let pool: TypingItem[] = [];

    if (m === "hiragana") {
      const basic = hiraganaData
        .filter((k) => k.category === "gojuon")
        .map((k) => ({ display: k.character, answer: k.romaji }));
      pool = variant === "full" ? [...basic, ...hiraganaDakuten] : basic;
    } else if (m === "katakana") {
      const basic = katakanaData
        .filter((k) => k.category === "gojuon")
        .map((k) => ({ display: k.character, answer: k.romaji }));
      pool = variant === "full" ? [...basic, ...katakanaDakuten] : basic;
    } else if (m === "word") {
      if (variant === "전체") {
        pool = [...n5Words, ...n4Words, ...n3Words, ...n2Words, ...n1Words].map((w) => ({
          display: w.word, answer: w.reading, meaning: w.meaning,
        }));
      } else {
        pool = (wordsByLevel[variant] ?? n5Words).map((w) => ({
          display: w.word, answer: w.reading, meaning: w.meaning,
        }));
      }
    } else if (m === "sentence") {
      if (variant === "전체") {
        pool = Object.values(sentencePool).flat();
      } else {
        pool = sentencePool[variant] ?? sentencePool.N5;
      }
    }

    setItems([...pool].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setCompletedCount(0);
    setInput("");
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(time === 0 ? 0 : time);
    setElapsed(0);
    setIsRunning(true);
    setIsFinished(false);
    setFeedback(null);
    setShowAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedTime]);

  // Countdown timer (timed mode only)
  useEffect(() => {
    if (!isRunning || isFinished || totalTime === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setIsRunning(false); setIsFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, isFinished, totalTime]);

  // Stopwatch (unlimited mode only — for display)
  useEffect(() => {
    if (!isRunning || isFinished || totalTime !== 0) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, isFinished, totalTime]);

  const advanceToNext = useCallback(() => {
    setCompletedCount((c) => {
      const newCount = c + 1;
      // Unlimited mode: end when every item has been seen at least once.
      if (totalTime === 0 && newCount >= items.length) {
        setIsRunning(false);
        setIsFinished(true);
      }
      return newCount;
    });
    setCurrentIndex((i) => (i + 1) % items.length);
  }, [items.length, totalTime]);

  const handleInput = (value: string) => {
    setInput(value);
    if (!items[currentIndex]) return;
    const answer = items[currentIndex].answer;

    if (value.toLowerCase() === answer.toLowerCase()) {
      setScore((s) => s + 1);
      setStreak((s) => { const ns = s + 1; setBestStreak((b) => Math.max(b, ns)); return ns; });
      setFeedback("correct");
      setInput("");
      setShowAnswer(false);
      advanceToNext();
      setTimeout(() => setFeedback(null), 300);
    } else if (value.length >= answer.length) {
      setMistakes((m) => m + 1);
      setStreak(0);
      setFeedback("wrong");
      setInput("");
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const skipCurrent = () => {
    if (!items[currentIndex]) return;
    setMistakes((m) => m + 1);
    setStreak(0);
    setFeedback("wrong");
    setInput("");
    setShowAnswer(false);
    advanceToNext();
    setTimeout(() => setFeedback(null), 300);
    inputRef.current?.focus();
  };

  const accuracy = score + mistakes > 0 ? Math.round((score / (score + mistakes)) * 100) : 0;

  const variantLabel = (() => {
    if (mode === "hiragana") return gameVariant === "full" ? "전체 (탁음 포함)" : "기본 (오십음도)";
    if (mode === "katakana") return gameVariant === "full" ? "전체 (탁음 포함)" : "기본 (오십음도)";
    return gameVariant;
  })();

  // ── 모드 선택 화면 ──────────────────────────────────────────
  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <h1 className="text-3xl font-bold mb-2 dark:text-zinc-50">⌨️ 일본어 타자 연습</h1>
        <p className="text-gray-600 dark:text-zinc-400 mb-6">제한 시간 안에 최대한 많은 문자를 정확하게 입력하세요</p>

        {/* 시간 선택 */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white dark:border-zinc-700 dark:bg-zinc-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={14} className="text-indigo-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">제한 시간</span>
            <span className="ml-auto text-xs text-gray-400 dark:text-zinc-500">
              현재 선택: {selectedTime === 0 ? "무제한" : `${selectedTime}초`}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedTime === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                }`}
              >
                {t === 0 ? (
                  <>
                    <InfinityIcon size={12} />
                    무제한
                  </>
                ) : (
                  `${t}초`
                )}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-gray-400 dark:text-zinc-500">
            💡 무제한 모드는 모든 문제를 풀면 자동으로 종료됩니다.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* 히라가나 */}
          <div className="rounded-xl border-2 border-indigo-200 bg-white p-6 dark:bg-zinc-800 dark:border-indigo-800">
            <div className="text-4xl mb-3 w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold dark:bg-indigo-900/40 dark:text-indigo-400">あ</div>
            <h3 className="font-bold text-lg dark:text-zinc-100">히라가나 타이핑</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 mb-2">히라가나를 보고 로마지 입력</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-3">추천: {MODE_DEFAULT_TIME.hiragana}초</p>
            <div className="flex gap-2">
              <button onClick={() => startGame("hiragana", "basic")} className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 font-medium">
                기본<br /><span className="text-xs font-normal opacity-70">46자</span>
              </button>
              <button onClick={() => startGame("hiragana", "full")} className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 font-medium">
                전체<br /><span className="text-xs font-normal opacity-80">탁음 포함</span>
              </button>
            </div>
          </div>

          {/* 가타카나 */}
          <div className="rounded-xl border-2 border-violet-200 bg-white p-6 dark:bg-zinc-800 dark:border-violet-800">
            <div className="text-4xl mb-3 w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 font-bold dark:bg-violet-900/40 dark:text-violet-400">ア</div>
            <h3 className="font-bold text-lg dark:text-zinc-100">가타카나 타이핑</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 mb-2">가타카나를 보고 로마지 입력</p>
            <p className="text-xs text-violet-500 dark:text-violet-400 mb-3">추천: {MODE_DEFAULT_TIME.katakana}초</p>
            <div className="flex gap-2">
              <button onClick={() => startGame("katakana", "basic")} className="flex-1 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60 font-medium">
                기본<br /><span className="text-xs font-normal opacity-70">46자</span>
              </button>
              <button onClick={() => startGame("katakana", "full")} className="flex-1 py-2 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-600 font-medium">
                전체<br /><span className="text-xs font-normal opacity-80">탁음 포함</span>
              </button>
            </div>
          </div>

          {/* 단어 */}
          <div className="rounded-xl border-2 border-purple-200 bg-white p-6 dark:bg-zinc-800 dark:border-purple-800">
            <div className="text-4xl mb-3 w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold dark:bg-purple-900/40 dark:text-purple-400">漢</div>
            <h3 className="font-bold text-lg dark:text-zinc-100">단어 타이핑</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 mb-2">단어를 보고 히라가나 입력</p>
            <p className="text-xs text-purple-500 dark:text-purple-400 mb-3">추천: {MODE_DEFAULT_TIME.word}초</p>
            <div className="flex flex-wrap gap-1.5">
              {(["N5", "N4", "N3", "N2", "N1", "전체"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => startGame("word", lv)}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs hover:bg-purple-500 hover:text-white dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white transition-colors font-medium"
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {/* 문장 */}
          <div className="rounded-xl border-2 border-emerald-200 bg-white p-6 dark:bg-zinc-800 dark:border-emerald-800">
            <div className="text-4xl mb-3 w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold dark:bg-emerald-900/40 dark:text-emerald-400">
              <MessageSquare size={28} />
            </div>
            <h3 className="font-bold text-lg dark:text-zinc-100">문장 타이핑</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 mb-2">문장을 보고 히라가나 읽기 입력</p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mb-3">추천: {MODE_DEFAULT_TIME.sentence}초</p>
            <div className="flex flex-wrap gap-1.5">
              {(["N5", "N4", "N3", "N2", "N1", "전체"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => startGame("sentence", lv)}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors font-medium"
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 안내 */}
        <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-gray-500 dark:text-zinc-400">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span><strong className="text-zinc-700 dark:text-zinc-300">가나 기본</strong>: あいうえお 등 오십음도 46자</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            <span><strong className="text-zinc-700 dark:text-zinc-300">가나 전체</strong>: 탁음(が行), 반탁음(ぱ行), 합자(きゃ 등) 포함</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span><strong className="text-zinc-700 dark:text-zinc-300">단어 타이핑</strong>: N5~N1 레벨별 단어의 히라가나 읽기 입력</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-700 dark:text-zinc-300">문장 타이핑</strong>: JLPT 레벨별 문장의 히라가나 읽기 입력</span>
          </div>
        </div>
      </div>
    );
  }

  // ── 결과 화면 ────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold mb-1 dark:text-zinc-50">타이핑 결과</h2>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mb-6">
          {mode === "hiragana" && "히라가나"}{mode === "katakana" && "가타카나"}{mode === "word" && "단어"}{mode === "sentence" && "문장"} · {variantLabel} ·{" "}
          {totalTime === 0
            ? `무제한 (${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")})`
            : `${totalTime}초`}
        </p>
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{score}</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400">정답 수</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{accuracy}%</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400">정확도</div>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{bestStreak}</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400">최고 연속</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{mistakes}</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400">오답 수</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => startGame(mode, gameVariant)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2">
            <RotateCcw size={16} /> 다시 하기
          </button>
          <button onClick={() => setMode(null)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
            모드 선택
          </button>
        </div>
      </div>
    );
  }

  // ── 게임 화면 ────────────────────────────────────────────────
  const current = items[currentIndex];
  const isSentenceMode = mode === "sentence";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { setMode(null); setIsRunning(false); }} className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs text-gray-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
          {mode === "hiragana" && "히라가나"}{mode === "katakana" && "가타카나"}{mode === "word" && "단어"}{mode === "sentence" && "문장"} · {variantLabel}
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            {totalTime === 0 ? (
              <><InfinityIcon size={15} />{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</>
            ) : (
              <><Timer size={15} />{timeLeft}초</>
            )}
          </span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><Target size={15} />{score}점</span>
          <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400"><Zap size={15} />{streak}연속</span>
        </div>
      </div>

      {/* 문제 표시 */}
      <div className={`bg-white dark:bg-zinc-900 border-2 dark:border-zinc-700 rounded-2xl p-8 text-center mb-5 shadow-sm transition-colors ${
        feedback === "correct" ? "border-green-400" : feedback === "wrong" ? "border-red-400" : "border-gray-200"
      }`}>
        {isSentenceMode ? (
          <>
            <p className={`text-2xl sm:text-3xl font-bold mb-3 leading-relaxed transition-colors ${
              feedback === "correct" ? "text-green-500" : feedback === "wrong" ? "text-red-500" : "text-gray-800 dark:text-gray-100"
            }`}>
              {current?.display}
            </p>
            {current?.meaning && (
              <p className="text-sm text-gray-400 dark:text-zinc-500 mb-2">{current.meaning}</p>
            )}
            <p className="text-xs text-gray-300 dark:text-zinc-600">
              읽기: {current?.answer.length}자
            </p>
          </>
        ) : (
          <>
            <div className={`text-6xl sm:text-7xl font-bold mb-3 transition-colors ${
              feedback === "correct" ? "text-green-500" : feedback === "wrong" ? "text-red-500" : "text-gray-800 dark:text-gray-100"
            }`}>
              {current?.display}
            </div>
            {current?.meaning && (
              <p className="text-sm text-gray-400 dark:text-zinc-500">{current.meaning}</p>
            )}
          </>
        )}

        {showAnswer && (
          <div className="mt-3 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl inline-block">
            <span className="text-yellow-700 dark:text-yellow-300 font-bold">{current?.answer}</span>
          </div>
        )}

        <p className="text-gray-400 dark:text-zinc-500 text-xs mt-3">
          {mode === "word" || mode === "sentence" ? "히라가나(읽기)를 입력하세요" : "로마지를 입력하세요"}
        </p>
      </div>

      {/* 건너뛰기 · 정답보기 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setShowAnswer((v) => !v); inputRef.current?.focus(); }}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors ${
            showAnswer
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
          }`}
        >
          <Eye size={15} /> {showAnswer ? "정답 숨기기" : "정답 보기"}
        </button>
        <button
          onClick={skipCurrent}
          className="flex-1 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-zinc-700"
        >
          <SkipForward size={15} /> 건너뛰기
        </button>
      </div>

      {/* 입력 */}
      <div className="relative">
        <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className={`w-full pl-12 pr-4 py-4 text-xl text-center border-2 rounded-xl outline-none transition-colors ${
            feedback === "correct"
              ? "border-green-400 bg-green-50 dark:bg-green-900/20"
              : feedback === "wrong"
                ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                : "border-gray-200 focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500"
          }`}
          placeholder="여기에 입력..."
          autoFocus
        />
      </div>

      {/* 타임바 / 진행바 */}
      <div className="mt-4 bg-gray-100 dark:bg-zinc-700 rounded-full h-2">
        {totalTime === 0 ? (
          // 무제한: 진행도 표시 (완료/전체)
          <div
            className="h-2 rounded-full transition-all bg-emerald-500"
            style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
          />
        ) : (
          // 시간 제한: 남은 시간 비율
          <div
            className={`h-2 rounded-full transition-all ${timeLeft <= 10 ? "bg-red-500" : "bg-indigo-500"}`}
            style={{ width: `${(timeLeft / totalTime) * 100}%` }}
          />
        )}
      </div>
      {totalTime === 0 && (
        <p className="text-xs text-gray-400 dark:text-zinc-500 text-center mt-2">
          {completedCount} / {items.length} 문항 완료
        </p>
      )}
    </div>
  );
}
