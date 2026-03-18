"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Volume2,
  RotateCcw,
  User,
  Bot,
  Loader2,
  AlertCircle,
  Sparkles,
  Mic,
  MicOff,
} from "lucide-react";
import { speakJapanese } from "@/lib/tts";

interface ParsedAIMessage {
  japanese: string;
  reading: string;
  korean: string;
  correction: {
    wrong: string;
    correct: string;
    explanation: string;
  } | null;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  parsed?: ParsedAIMessage;
}

const levels = [
  { id: "beginner", label: "초급", desc: "N5-N4", emoji: "🌱" },
  { id: "intermediate", label: "중급", desc: "N3-N2", emoji: "🌿" },
  { id: "advanced", label: "고급", desc: "N2-N1", emoji: "🌳" },
];

const topics = [
  { id: "free", label: "자유 대화", emoji: "💬" },
  { id: "travel", label: "여행", emoji: "✈️" },
  { id: "daily", label: "일상", emoji: "☀️" },
  { id: "business", label: "비즈니스", emoji: "💼" },
  { id: "food", label: "음식", emoji: "🍣" },
  { id: "hobby", label: "취미", emoji: "🎮" },
];

function tryParseJSON(text: string): ParsedAIMessage | null {
  try {
    // Remove markdown code block wrappers if present
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.japanese) return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function AIConversationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState("beginner");
  const [topic, setTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ja-JP";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setMessages([]);
    setError(null);

    const topicPrompts: Record<string, string> = {
      free: "自由に会話を始めてください。まず挨拶をして、相手のことを聞いてください。",
      travel:
        "旅行について会話を始めてください。日本旅行について聞いてください。",
      daily: "日常生活について会話を始めてください。今日何をしたか聞いてください。",
      business:
        "ビジネスの場面で会話を始めてください。仕事について聞いてください。",
      food: "食べ物について会話を始めてください。好きな日本料理について聞いてください。",
      hobby: "趣味について会話を始めてください。週末に何をするか聞いてください。",
    };

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: topicPrompts[selectedTopic] }],
          level,
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const fullText = await response.text();

      const parsed = tryParseJSON(fullText);
      setMessages([
        {
          role: "ai",
          content: fullText,
          parsed: parsed || {
            japanese: fullText,
            reading: "",
            korean: "",
            correction: null,
          },
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "대화를 시작할 수 없습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: input.trim() },
      ];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, level }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const fullText = await response.text();

      const parsed = tryParseJSON(fullText);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: fullText,
          parsed: parsed || {
            japanese: fullText,
            reading: "",
            korean: "",
            correction: null,
          },
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "메시지를 보낼 수 없습니다"
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setTopic(null);
    setMessages([]);
    setInput("");
    setError(null);
  };

  // Topic selection screen
  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/ai"
          className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-6"
        >
          <ArrowLeft size={14} /> AI 학습
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          <Sparkles className="inline text-indigo-500 mr-2" size={28} />
          AI 자유 대화
        </h1>
        <p className="text-gray-600 mb-8">
          AI와 자유롭게 일본어로 대화하세요. 실시간으로 교정도 받을 수 있습니다.
        </p>

        {/* Level selection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            난이도 선택
          </h2>
          <div className="flex gap-3">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-center ${
                  level === l.id
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className="text-xl">{l.emoji}</span>
                <p className="font-semibold text-sm mt-1">{l.label}</p>
                <p className="text-xs text-gray-400">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Topic selection */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            대화 주제
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => startConversation(t.id)}
                className="bg-white border-2 border-gray-100 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <span className="text-2xl">{t.emoji}</span>
                <h3 className="font-bold mt-2">{t.label}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={reset} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-sm">
            {topics.find((t) => t.id === topic)?.emoji}{" "}
            {topics.find((t) => t.id === topic)?.label}
          </h2>
          <p className="text-xs text-gray-400">
            {levels.find((l) => l.id === level)?.emoji}{" "}
            {levels.find((l) => l.id === level)?.label}
          </p>
        </div>
        <button
          onClick={reset}
          className="text-gray-400 hover:text-gray-600"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {msg.role === "ai" ? (
                  <Bot size={14} className="text-gray-400" />
                ) : (
                  <User size={14} className="text-indigo-200" />
                )}
                <span
                  className={`text-xs ${msg.role === "user" ? "text-indigo-200" : "text-gray-400"}`}
                >
                  {msg.role === "ai" ? "AI 선생님" : "나"}
                </span>
              </div>

              {msg.role === "ai" && msg.parsed && msg.parsed.japanese ? (
                <>
                  <p className="text-base font-medium">
                    {msg.parsed.japanese}
                  </p>
                  {msg.parsed.reading && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {msg.parsed.reading}
                    </p>
                  )}
                  {msg.parsed.korean && (
                    <p className="text-sm text-gray-500 mt-1">
                      {msg.parsed.korean}
                    </p>
                  )}

                  {/* Correction */}
                  {msg.parsed.correction && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-amber-700 mb-1">
                        <AlertCircle
                          size={12}
                          className="inline mr-1"
                        />
                        교정
                      </p>
                      <p className="text-red-500 line-through text-xs">
                        {msg.parsed.correction.wrong}
                      </p>
                      <p className="text-green-600 font-medium text-xs">
                        → {msg.parsed.correction.correct}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {msg.parsed.correction.explanation}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      speakJapanese(msg.parsed!.japanese)
                    }
                    className="mt-2 text-indigo-500 hover:text-indigo-700"
                  >
                    <Volume2 size={14} />
                  </button>
                </>
              ) : (
                <p className="text-base whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4">
              <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-red-500 text-sm bg-red-50 inline-block px-4 py-2 rounded-lg">
              {error}
            </p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t pt-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={isListening ? "듣고 있습니다..." : "메시지를 입력하세요..."}
            className={`flex-1 px-4 py-3 border-2 rounded-xl resize-none focus:outline-none text-sm ${
              isListening
                ? "border-red-400 bg-red-50 focus:border-red-400"
                : "border-gray-200 focus:border-indigo-400"
            }`}
            rows={1}
            disabled={isLoading}
          />
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`px-4 py-3 rounded-xl transition-colors ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {speechSupported ? "마이크로 음성 입력 · " : ""}Enter로 전송 · Shift+Enter로 줄바꿈
        </p>
      </div>
    </div>
  );
}
