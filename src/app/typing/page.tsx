"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Timer, Target, Zap, RotateCcw, Keyboard } from "lucide-react";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";

type Mode = "hiragana" | "katakana" | "word";

export default function TypingPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [items, setItems] = useState<{ display: string; answer: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = useCallback((m: Mode) => {
    setMode(m);
    let pool: { display: string; answer: string }[] = [];
    if (m === "hiragana") {
      pool = hiraganaData.filter((k) => k.category === "gojuon").map((k) => ({ display: k.character, answer: k.romaji }));
    } else if (m === "katakana") {
      pool = katakanaData.filter((k) => k.category === "gojuon").map((k) => ({ display: k.character, answer: k.romaji }));
    } else {
      pool = n5Words.map((w) => ({ display: w.word, answer: w.reading }));
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentIndex(0);
    setInput("");
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(60);
    setIsRunning(true);
    setIsFinished(false);
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (!isRunning || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, isFinished]);

  const handleInput = (value: string) => {
    setInput(value);
    if (!items[currentIndex]) return;
    const answer = items[currentIndex].answer;

    if (value.toLowerCase() === answer.toLowerCase()) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      setFeedback("correct");
      setInput("");
      setCurrentIndex((i) => (i + 1) % items.length);
      setTimeout(() => setFeedback(null), 300);
    } else if (value.length >= answer.length) {
      setMistakes((m) => m + 1);
      setStreak(0);
      setFeedback("wrong");
      setInput("");
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const accuracy = score + mistakes > 0 ? Math.round((score / (score + mistakes)) * 100) : 0;

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> 대시보드
        </Link>
        <h1 className="text-3xl font-bold mb-2">⌨️ 일본어 타자 연습</h1>
        <p className="text-gray-600 mb-8">60초 안에 최대한 많은 문자를 정확하게 입력하세요</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { m: "hiragana" as Mode, icon: "あ", title: "히라가나 타이핑", desc: "히라가나를 보고 로마지 입력", color: "indigo" },
            { m: "katakana" as Mode, icon: "ア", title: "가타카나 타이핑", desc: "가타카나를 보고 로마지 입력", color: "violet" },
            { m: "word" as Mode, icon: "漢", title: "단어 타이핑", desc: "단어를 보고 히라가나 입력", color: "purple" },
          ].map(({ m, icon, title, desc, color }) => (
            <button key={m} onClick={() => startGame(m)} className={`p-6 rounded-xl border-2 border-${color}-200 hover:border-${color}-400 bg-white hover:shadow-lg transition-all text-left`}>
              <div className={`text-4xl mb-3 w-14 h-14 bg-${color}-100 rounded-xl flex items-center justify-center text-${color}-600 font-bold`}>{icon}</div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-gray-500 text-sm mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold mb-2">타이핑 결과</h2>
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-indigo-600">{score}</div>
            <div className="text-sm text-gray-500">정답 수</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-gray-500">정확도</div>
          </div>
          <div className="bg-violet-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-violet-600">{bestStreak}</div>
            <div className="text-sm text-gray-500">최고 연속</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-orange-600">{score}</div>
            <div className="text-sm text-gray-500">WPM</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => startGame(mode)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2">
            <RotateCcw size={16} /> 다시 하기
          </button>
          <button onClick={() => setMode(null)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">
            모드 선택
          </button>
        </div>
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => { setMode(null); setIsRunning(false); }} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1 text-orange-600"><Timer size={16} />{timeLeft}초</span>
          <span className="flex items-center gap-1 text-green-600"><Target size={16} />{score}점</span>
          <span className="flex items-center gap-1 text-violet-600"><Zap size={16} />{streak}연속</span>
        </div>
      </div>

      <div className="bg-white border-2 rounded-2xl p-12 text-center mb-6 shadow-sm">
        <div className={`text-7xl font-bold mb-4 transition-colors ${feedback === "correct" ? "text-green-500" : feedback === "wrong" ? "text-red-500" : "text-gray-800"}`}>
          {current?.display}
        </div>
        {mode !== "word" && (
          <p className="text-gray-400 text-sm">로마지를 입력하세요</p>
        )}
        {mode === "word" && (
          <p className="text-gray-400 text-sm">히라가나(읽기)를 입력하세요</p>
        )}
      </div>

      <div className="relative">
        <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className={`w-full pl-12 pr-4 py-4 text-xl text-center border-2 rounded-xl outline-none transition-colors ${
            feedback === "correct" ? "border-green-400 bg-green-50" : feedback === "wrong" ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-indigo-400"
          }`}
          placeholder="여기에 입력..."
          autoFocus
        />
      </div>

      <div className="mt-4 bg-gray-100 rounded-full h-2">
        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(timeLeft / 60) * 100}%` }} />
      </div>
    </div>
  );
}
