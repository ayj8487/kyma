"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, CameraOff, Aperture, RotateCcw, Search, Volume2, ImageIcon, Loader2, Bookmark, Edit3 } from "lucide-react";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { speakJapanese } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";

const allWords = [
  ...n5Words.map((w) => ({ ...w, level: "N5" })),
  ...n4Words.map((w) => ({ ...w, level: "N4" })),
  ...n3Words.map((w) => ({ ...w, level: "N3" })),
];

// Extract individual Japanese tokens (kanji compounds, kana runs) from OCR text
function tokenize(text: string): string[] {
  const tokens: string[] = [text];
  // Split by whitespace, punctuation, newlines
  const parts = text.split(/[\s\n\r、。！？「」『』（）\(\),.!?\-\u3000]+/).filter(Boolean);
  for (const p of parts) {
    if (p && !tokens.includes(p)) tokens.push(p);
  }
  // Also extract individual kanji
  const kanjiMatch = text.match(/[\u4e00-\u9faf\u3400-\u4dbf]+/g);
  if (kanjiMatch) {
    for (const k of kanjiMatch) {
      if (!tokens.includes(k)) tokens.push(k);
      // Individual kanji if compound
      if (k.length > 1) {
        for (const ch of k) {
          if (!tokens.includes(ch)) tokens.push(ch);
        }
      }
    }
  }
  // Extract kana runs
  const kanaMatch = text.match(/[\u3040-\u309f\u30a0-\u30ff]+/g);
  if (kanaMatch) {
    for (const k of kanaMatch) {
      if (!tokens.includes(k)) tokens.push(k);
    }
  }
  return tokens;
}

type ResultItem = { word: string; reading: string; meaning: string; level?: string };

export default function CameraPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [editingOcr, setEditingOcr] = useState(false);
  const [editedOcrText, setEditedOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const { bookmarks, toggleBookmark } = useStudyStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setCapturedImage(null);
      setOcrText("");
      setResults([]);
    } catch {
      setCameraError("카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const searchWords = (text: string) => {
    const q = text.trim();
    if (!q) return;

    const tokens = tokenize(q);
    const seen = new Set<string>();
    const found: ResultItem[] = [];

    for (const token of tokens) {
      if (!token) continue;
      for (const w of allWords) {
        const key = `${w.word}-${w.reading}`;
        if (seen.has(key)) continue;
        if (
          w.word.includes(token) || w.reading.includes(token) || w.meaning.includes(token) ||
          token.includes(w.word) || token.includes(w.reading)
        ) {
          seen.add(key);
          found.push({ word: w.word, reading: w.reading, meaning: w.meaning, level: w.level });
        }
      }
    }

    // Sort: exact matches first, then by level (N5 > N4 > N3)
    found.sort((a, b) => {
      const aExact = a.word === q || a.reading === q ? 0 : 1;
      const bExact = b.word === q || b.reading === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return (a.level || "").localeCompare(b.level || "");
    });

    setResults(found.length > 0 ? found.slice(0, 30) : [{ word: q, reading: "-", meaning: "학습 데이터(N5~N3)에서 일치하는 단어를 찾을 수 없습니다." }]);
  };

  const processImage = async (imageData: string) => {
    setExtracting(true);
    setOcrProgress(0);
    setOcrText("");
    setEditingOcr(false);
    setResults([]);

    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("jpn", undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      const cleaned = text.trim().replace(/\s+/g, " ");
      setOcrText(cleaned);
      setEditedOcrText(cleaned);

      if (cleaned) {
        searchWords(cleaned);
      } else {
        setResults([{ word: "—", reading: "-", meaning: "텍스트를 인식하지 못했습니다. 더 선명한 이미지로 다시 시도해보세요." }]);
      }
    } catch (err) {
      console.error("OCR error:", err);
      setResults([{ word: "⚠️", reading: "-", meaning: "텍스트 인식 중 오류가 발생했습니다. 다시 시도해주세요." }]);
    } finally {
      setExtracting(false);
    }
  };

  const handleOcrEdit = () => {
    if (editingOcr) {
      // Save and re-search
      setOcrText(editedOcrText);
      searchWords(editedOcrText);
      setEditingOcr(false);
    } else {
      setEditingOcr(true);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    stopCamera();
    processImage(dataUrl);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setResults([]);
    setOcrText("");
    setEditedOcrText("");
    setEditingOcr(false);
    setOcrProgress(0);
  };

  const handleSearch = () => {
    if (!inputText.trim()) return;
    searchWords(inputText.trim());
  };

  const isBookmarked = (word: string) => bookmarks.includes(`word:${word}`);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Camera className="text-indigo-600" /> 카메라 번역</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">일본어 텍스트를 촬영하거나 직접 입력하여 번역하세요</p>

      {/* Camera Section */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="font-bold mb-4">📸 카메라</h2>

        {capturedImage ? (
          <div>
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img src={capturedImage} alt="촬영된 이미지" className="w-full rounded-xl" />
              {extracting && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">일본어 텍스트 인식 중...</p>
                    <p className="text-xs text-gray-300 mt-1">{ocrProgress}%</p>
                    <div className="w-40 h-1.5 bg-gray-600 rounded-full mt-2 mx-auto">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">첫 실행 시 모델 다운로드로 시간이 걸릴 수 있습니다</p>
                  </div>
                </div>
              )}
            </div>

            {ocrText && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">인식된 텍스트</p>
                  <button
                    onClick={handleOcrEdit}
                    className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Edit3 size={12} />
                    {editingOcr ? "검색" : "수정"}
                  </button>
                </div>
                {editingOcr ? (
                  <input
                    type="text"
                    value={editedOcrText}
                    onChange={(e) => setEditedOcrText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleOcrEdit()}
                    className="w-full text-lg font-bold bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                    autoFocus
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900 dark:text-white break-words">{ocrText}</p>
                )}
              </div>
            )}

            <button onClick={resetCapture} className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2">
              <RotateCcw size={16} /> 다시 촬영
            </button>
          </div>
        ) : !cameraActive ? (
          <div className="text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl py-12 sm:py-16 mb-4">
              <Camera size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">카메라로 일본어 텍스트를 촬영하면<br />번역해 드립니다</p>
            </div>
            <div className="flex gap-2">
              <button onClick={startCamera} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Camera size={18} /> 카메라 시작
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                <ImageIcon size={18} /> 갤러리
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            {cameraError && <p className="text-red-500 text-sm mt-3">{cameraError}</p>}
            <p className="text-xs text-gray-400 mt-3">💡 선명한 일본어 텍스트가 포함된 이미지에서 가장 잘 인식됩니다</p>
          </div>
        ) : (
          <div>
            <div className="relative rounded-xl overflow-hidden bg-black mb-4">
              <video ref={videoRef} autoPlay playsInline className="w-full" />
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> 촬영 중
              </div>
              {/* Guide frame */}
              <div className="absolute inset-8 border-2 border-white/40 rounded-lg pointer-events-none">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  텍스트를 프레임 안에 맞춰주세요
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={capturePhoto} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700">
                <Aperture size={18} /> 촬영
              </button>
              <button onClick={stopCamera} className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2">
                <CameraOff size={16} /> 중지
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Results Section */}
      {results.length > 0 && results[0].reading !== "-" && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="font-bold mb-3">📖 검색 결과 <span className="text-sm font-normal text-gray-400">({results.length}개)</span></h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-bold">{r.word}</span>
                    <span className="text-indigo-500 text-sm">{r.reading}</span>
                    {r.level && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-medium">{r.level}</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 break-words">{r.meaning}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => toggleBookmark("word", r.word)}
                    className={`p-2 ${isBookmarked(r.word) ? "text-yellow-500" : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"}`}
                  >
                    <Bookmark size={16} fill={isBookmarked(r.word) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => speakJapanese(r.word)} className="text-indigo-500 hover:text-indigo-700 p-2">
                    <Volume2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No match message */}
      {results.length > 0 && results[0].reading === "-" && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">{results[0].meaning}</p>
          </div>
        </div>
      )}

      {/* Manual Input Section */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6">
        <h2 className="font-bold mb-4">✍️ 텍스트 입력 번역</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="일본어 단어 또는 뜻을 입력..."
            className="min-w-0 flex-1 border dark:border-gray-600 rounded-xl px-3 sm:px-4 py-3 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-sm sm:text-base"
          />
          <button onClick={handleSearch} className="shrink-0 px-3 sm:px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <Search size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-400">빠른 검색:</span>
          {["食べる", "学校", "先生", "友達", "天気", "電車", "病院"].map((w) => (
            <button key={w} onClick={() => { setInputText(w); searchWords(w); }} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600">{w}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
