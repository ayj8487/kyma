"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Volume2, RotateCcw, User, Bot } from "lucide-react";
import { speakJapanese } from "@/lib/tts";

interface ChatMessage {
  role: "user" | "ai";
  japanese: string;
  reading?: string;
  korean: string;
}

interface Scenario {
  id: string;
  title: string;
  titleJa: string;
  emoji: string;
  exchanges: { ai: ChatMessage; suggestions: { japanese: string; reading: string; korean: string }[] }[];
}

const scenarios: Scenario[] = [
  {
    id: "intro", title: "자기소개", titleJa: "自己紹介", emoji: "👋",
    exchanges: [
      { ai: { role: "ai", japanese: "こんにちは！はじめまして。お名前は何ですか？", reading: "こんにちは！はじめまして。おなまえはなんですか？", korean: "안녕하세요! 처음 뵙겠습니다. 이름이 뭐예요?" }, suggestions: [{ japanese: "はじめまして。私の名前はキムです。", reading: "はじめまして。わたしのなまえはキムです。", korean: "처음 뵙겠습니다. 제 이름은 김입니다." }, { japanese: "こんにちは！パクと申します。", reading: "こんにちは！パクともうします。", korean: "안녕하세요! 박이라고 합니다." }] },
      { ai: { role: "ai", japanese: "いい名前ですね！どこから来ましたか？", reading: "いいなまえですね！どこからきましたか？", korean: "좋은 이름이네요! 어디서 오셨어요?" }, suggestions: [{ japanese: "韓国から来ました。ソウルに住んでいます。", reading: "かんこくからきました。ソウルにすんでいます。", korean: "한국에서 왔습니다. 서울에 살고 있습니다." }, { japanese: "韓国の釜山から来ました。", reading: "かんこくのプサンからきました。", korean: "한국의 부산에서 왔습니다." }] },
      { ai: { role: "ai", japanese: "そうですか！趣味は何ですか？", reading: "そうですか！しゅみはなんですか？", korean: "그렇군요! 취미는 뭐예요?" }, suggestions: [{ japanese: "映画を見ることが好きです。", reading: "えいがをみることがすきです。", korean: "영화 보는 것을 좋아합니다." }, { japanese: "音楽を聞くことが趣味です。", reading: "おんがくをきくことがしゅみです。", korean: "음악 듣는 것이 취미입니다." }] },
      { ai: { role: "ai", japanese: "素敵ですね！日本語の勉強、頑張ってください！", reading: "すてきですね！にほんごのべんきょう、がんばってください！", korean: "멋지네요! 일본어 공부, 화이팅하세요!" }, suggestions: [{ japanese: "ありがとうございます！頑張ります！", reading: "ありがとうございます！がんばります！", korean: "감사합니다! 열심히 하겠습니다!" }] },
    ],
  },
  {
    id: "restaurant", title: "레스토랑", titleJa: "レストラン", emoji: "🍽️",
    exchanges: [
      { ai: { role: "ai", japanese: "いらっしゃいませ！何名様ですか？", reading: "いらっしゃいませ！なんめいさまですか？", korean: "어서오세요! 몇 분이세요?" }, suggestions: [{ japanese: "二人です。", reading: "ふたりです。", korean: "두 명입니다." }, { japanese: "一人です。カウンター席はありますか？", reading: "ひとりです。カウンターせきはありますか？", korean: "한 명입니다. 카운터석 있나요?" }] },
      { ai: { role: "ai", japanese: "こちらのお席にどうぞ。メニューです。ご注文はお決まりですか？", reading: "こちらのおせきにどうぞ。メニューです。ごちゅうもんはおきまりですか？", korean: "이쪽 자리로 앉으세요. 메뉴입니다. 주문 정하셨나요?" }, suggestions: [{ japanese: "すみません、おすすめは何ですか？", reading: "すみません、おすすめはなんですか？", korean: "실례합니다, 추천 메뉴는 뭔가요?" }, { japanese: "ラーメンをお願いします。", reading: "ラーメンをおねがいします。", korean: "라멘 주세요." }] },
      { ai: { role: "ai", japanese: "かしこまりました。お飲み物はいかがですか？", reading: "かしこまりました。おのみものはいかがですか？", korean: "알겠습니다. 음료는 어떻게 하시겠어요?" }, suggestions: [{ japanese: "水をください。", reading: "みずをください。", korean: "물 주세요." }, { japanese: "ビールをお願いします。", reading: "ビールをおねがいします。", korean: "맥주 주세요." }] },
      { ai: { role: "ai", japanese: "お会計は1500円です。ありがとうございました！", reading: "おかいけいは1500えんです。ありがとうございました！", korean: "계산은 1500엔입니다. 감사합니다!" }, suggestions: [{ japanese: "ごちそうさまでした！美味しかったです。", reading: "ごちそうさまでした！おいしかったです。", korean: "잘 먹었습니다! 맛있었어요." }] },
    ],
  },
  {
    id: "shopping", title: "쇼핑", titleJa: "買い物", emoji: "🛍️",
    exchanges: [
      { ai: { role: "ai", japanese: "いらっしゃいませ！何かお探しですか？", reading: "いらっしゃいませ！なにかおさがしですか？", korean: "어서오세요! 뭔가 찾으시는 게 있나요?" }, suggestions: [{ japanese: "Tシャツを探しています。", reading: "Tシャツをさがしています。", korean: "티셔츠를 찾고 있습니다." }, { japanese: "見ているだけです。", reading: "みているだけです。", korean: "구경만 하고 있습니다." }] },
      { ai: { role: "ai", japanese: "こちらはいかがですか？今セール中です。", reading: "こちらはいかがですか？いまセールちゅうです。", korean: "이건 어떠세요? 지금 세일 중입니다." }, suggestions: [{ japanese: "いいですね！試着してもいいですか？", reading: "いいですね！しちゃくしてもいいですか？", korean: "좋네요! 입어봐도 될까요?" }, { japanese: "もう少し大きいサイズはありますか？", reading: "もうすこしおおきいサイズはありますか？", korean: "좀 더 큰 사이즈 있나요?" }] },
      { ai: { role: "ai", japanese: "お似合いですよ！お買い上げになりますか？", reading: "おにあいですよ！おかいあげになりますか？", korean: "잘 어울려요! 구매하시겠어요?" }, suggestions: [{ japanese: "はい、これをください。", reading: "はい、これをください。", korean: "네, 이걸 주세요." }, { japanese: "少し考えます。", reading: "すこしかんがえます。", korean: "조금 생각해 볼게요." }] },
    ],
  },
  {
    id: "directions", title: "길찾기", titleJa: "道案内", emoji: "🗺️",
    exchanges: [
      { ai: { role: "ai", japanese: "すみません、何かお困りですか？", reading: "すみません、なにかおこまりですか？", korean: "실례합니다, 뭔가 곤란하신 건가요?" }, suggestions: [{ japanese: "すみません、駅はどこですか？", reading: "すみません、えきはどこですか？", korean: "실례합니다, 역은 어디인가요?" }, { japanese: "この近くにコンビニはありますか？", reading: "このちかくにコンビニはありますか？", korean: "이 근처에 편의점이 있나요?" }] },
      { ai: { role: "ai", japanese: "まっすぐ行って、二つ目の信号を右に曲がってください。", reading: "まっすぐいって、ふたつめのしんごうをみぎにまがってください。", korean: "직진해서, 두 번째 신호등에서 오른쪽으로 꺾어주세요." }, suggestions: [{ japanese: "ここから歩いてどのくらいですか？", reading: "ここからあるいてどのくらいですか？", korean: "여기서 걸어서 얼마나 걸리나요?" }, { japanese: "ありがとうございます！", reading: "ありがとうございます！", korean: "감사합니다!" }] },
      { ai: { role: "ai", japanese: "歩いて5分くらいです。道に迷ったらまた聞いてくださいね。", reading: "あるいてごふんくらいです。みちにまよったらまたきいてくださいね。", korean: "걸어서 5분 정도입니다. 길을 잃으면 다시 물어보세요." }, suggestions: [{ japanese: "ありがとうございます！助かりました！", reading: "ありがとうございます！たすかりました！", korean: "감사합니다! 도움이 되었습니다!" }] },
    ],
  },
  {
    id: "hotel", title: "호텔", titleJa: "ホテル", emoji: "🏨",
    exchanges: [
      { ai: { role: "ai", japanese: "いらっしゃいませ。ご予約のお名前をお願いします。", reading: "いらっしゃいませ。ごよやくのおなまえをおねがいします。", korean: "어서오세요. 예약하신 성함 부탁드립니다." }, suggestions: [{ japanese: "キムです。今日から2泊予約しています。", reading: "キムです。きょうからにはくよやくしています。", korean: "김입니다. 오늘부터 2박 예약했습니다." }] },
      { ai: { role: "ai", japanese: "確認できました。お部屋は5階の501号室です。朝食は7時から9時までです。", reading: "かくにんできました。おへやはごかいの501ごうしつです。ちょうしょくはしちじからくじまでです。", korean: "확인되었습니다. 방은 5층 501호입니다. 조식은 7시부터 9시까지입니다." }, suggestions: [{ japanese: "Wi-Fiのパスワードを教えてください。", reading: "Wi-Fiのパスワードをおしえてください。", korean: "와이파이 비밀번호를 알려주세요." }, { japanese: "チェックアウトは何時ですか？", reading: "チェックアウトはなんじですか？", korean: "체크아웃은 몇 시인가요?" }] },
      { ai: { role: "ai", japanese: "チェックアウトは11時です。何かあればフロントにお電話ください。ごゆっくりお過ごしください。", reading: "チェックアウトは11じです。なにかあればフロントにおでんわください。ごゆっくりおすごしください。", korean: "체크아웃은 11시입니다. 무슨 일이 있으면 프론트에 전화주세요. 편히 쉬세요." }, suggestions: [{ japanese: "ありがとうございます。お世話になります。", reading: "ありがとうございます。おせわになります。", korean: "감사합니다. 신세 지겠습니다." }] },
    ],
  },
];

export default function AIChatPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [exchangeIndex, setExchangeIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startScenario = (s: Scenario) => {
    setSelectedScenario(s);
    setMessages([s.exchanges[0].ai]);
    setExchangeIndex(0);
  };

  const selectResponse = (response: { japanese: string; reading: string; korean: string }) => {
    if (!selectedScenario) return;
    const userMsg: ChatMessage = { role: "user", japanese: response.japanese, reading: response.reading, korean: response.korean };
    const nextIdx = exchangeIndex + 1;
    setMessages((prev) => [...prev, userMsg]);

    if (nextIdx < selectedScenario.exchanges.length) {
      setTimeout(() => {
        setMessages((prev) => [...prev, selectedScenario.exchanges[nextIdx].ai]);
        setExchangeIndex(nextIdx);
      }, 800);
    }
  };

  const reset = () => {
    setSelectedScenario(null);
    setMessages([]);
    setExchangeIndex(0);
  };

  if (!selectedScenario) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/ai" className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-6"><ArrowLeft size={14} /> AI 학습</Link>
        <h1 className="text-3xl font-bold mb-2">💬 AI 회화 연습</h1>
        <p className="text-gray-600 mb-8">상황별 일본어 회화를 연습하세요</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s) => (
            <button key={s.id} onClick={() => startScenario(s)} className="bg-white border-2 border-gray-100 rounded-xl p-5 text-left hover:border-indigo-300 hover:shadow-lg transition-all">
              <span className="text-3xl">{s.emoji}</span>
              <h3 className="font-bold text-lg mt-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.titleJa}</p>
              <p className="text-xs text-gray-500 mt-2">{s.exchanges.length}개 대화</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentSuggestions = selectedScenario.exchanges[exchangeIndex]?.suggestions || [];
  const isComplete = exchangeIndex >= selectedScenario.exchanges.length - 1 && messages.length > selectedScenario.exchanges.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={reset} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <h2 className="font-bold">{selectedScenario.emoji} {selectedScenario.title}</h2>
        <button onClick={reset} className="text-gray-400 hover:text-gray-600"><RotateCcw size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              <div className="flex items-center gap-1 mb-1">
                {msg.role === "ai" ? <Bot size={14} className="text-gray-400" /> : <User size={14} className="text-indigo-200" />}
                <span className={`text-xs ${msg.role === "user" ? "text-indigo-200" : "text-gray-400"}`}>{msg.role === "ai" ? "AI" : "나"}</span>
              </div>
              <p className="text-base font-medium">{msg.japanese}</p>
              {msg.reading && <p className={`text-xs mt-0.5 ${msg.role === "user" ? "text-indigo-200" : "text-gray-400"}`}>{msg.reading}</p>}
              <p className={`text-sm mt-1 ${msg.role === "user" ? "text-indigo-100" : "text-gray-500"}`}>{msg.korean}</p>
              {msg.role === "ai" && (
                <button onClick={() => speakJapanese(msg.japanese)} className="mt-2 text-indigo-500 hover:text-indigo-700"><Volume2 size={14} /></button>
              )}
            </div>
          </div>
        ))}
        {isComplete && (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium mb-3">🎉 대화를 완료했습니다!</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => startScenario(selectedScenario)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">다시 하기</button>
              <button onClick={reset} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">다른 시나리오</button>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {!isComplete && currentSuggestions.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <p className="text-xs text-gray-400 mb-2">응답을 선택하세요:</p>
          {currentSuggestions.map((s, i) => (
            <button key={i} onClick={() => selectResponse(s)} className="w-full text-left px-4 py-3 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <p className="text-sm font-medium">{s.japanese}</p>
              <p className="text-xs text-gray-400">{s.korean}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
