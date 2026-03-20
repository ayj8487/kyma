"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, CameraOff, Aperture, RotateCcw, Search, Volume2, ImageIcon, Loader2, Bookmark, Edit3, Trash2, Clock, ZoomIn, ZoomOut, SlidersHorizontal } from "lucide-react";
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

// Extract individual Japanese tokens from OCR text
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  // Full text first
  const full = text.trim();
  if (full) tokens.push(full);

  // Split by whitespace, punctuation, newlines
  const parts = full.split(/[\s\n\r、。！？「」『』（）(),.!?\-\u3000]+/).filter(Boolean);
  for (const p of parts) {
    if (p && !tokens.includes(p)) tokens.push(p);
  }

  // Extract kanji compound runs
  const kanjiMatch = text.match(/[\u4e00-\u9faf\u3400-\u4dbf]+/g);
  if (kanjiMatch) {
    for (const k of kanjiMatch) {
      if (!tokens.includes(k)) tokens.push(k);
      if (k.length > 1) {
        for (const ch of k) {
          if (!tokens.includes(ch)) tokens.push(ch);
        }
      }
    }
  }

  // Extract kana runs (hiragana + katakana)
  const kanaMatch = text.match(/[\u3040-\u309f\u30a0-\u30ff]+/g);
  if (kanaMatch) {
    for (const k of kanaMatch) {
      if (!tokens.includes(k)) tokens.push(k);
    }
  }

  // Extract kanji+kana combined words (e.g., 食べる, 走る)
  const mixedMatch = text.match(/[\u4e00-\u9faf\u3400-\u4dbf][\u3040-\u309f\u30a0-\u30ff]+/g);
  if (mixedMatch) {
    for (const m of mixedMatch) {
      if (!tokens.includes(m)) tokens.push(m);
    }
  }

  return tokens;
}

// Filter OCR text: keep only Japanese characters, basic punctuation, and spaces
function filterJapaneseText(text: string): string {
  // Keep: hiragana, katakana, kanji, Japanese punctuation, spaces
  return text.replace(/[^\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\u3000-\u303f\uff00-\uffef\s]/g, "").trim().replace(/\s+/g, " ");
}

type ResultItem = { word: string; reading: string; meaning: string; level?: string };
type HistoryItem = { text: string; timestamp: number; resultCount: number };

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
  const [ocrStatus, setOcrStatus] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [preprocess, setPreprocess] = useState(true);
  const [showPreprocessOption, setShowPreprocessOption] = useState(false);
  const [zoom, setZoom] = useState(1);
  const { bookmarks, toggleBookmark } = useStudyStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preprocessCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kyma-camera-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((h) => h.text !== item.text)].slice(0, 20);
      localStorage.setItem("kyma-camera-history", JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("kyma-camera-history");
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setCapturedImage(null);
      setOcrText("");
      setResults([]);
      setZoom(1);
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
      if (!token || token.length === 0) continue;
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

    // Sort: exact matches first, then by level
    found.sort((a, b) => {
      const aExact = a.word === q || a.reading === q ? 0 : 1;
      const bExact = b.word === q || b.reading === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return (a.level || "").localeCompare(b.level || "");
    });

    const finalResults = found.length > 0
      ? found.slice(0, 30)
      : [{ word: q, reading: "-", meaning: "학습 데이터(N5~N3)에서 일치하는 단어를 찾을 수 없습니다." }];

    setResults(finalResults);

    // Save to history
    if (found.length > 0) {
      saveHistory({ text: q, timestamp: Date.now(), resultCount: found.length });
    }
  };

  // Image preprocessing: grayscale + contrast enhancement + threshold
  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = preprocessCanvasRef.current;
        if (!canvas) { resolve(imageData); return; }
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(imageData); return; }

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Convert to grayscale + increase contrast
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

          // Increase contrast (factor 1.5)
          const contrast = 1.5;
          const adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;

          // Clamp
          const val = Math.max(0, Math.min(255, adjusted));

          // Adaptive threshold for cleaner text
          const threshold = val > 140 ? 255 : 0;

          data[i] = threshold;
          data[i + 1] = threshold;
          data[i + 2] = threshold;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageData;
    });
  };

  const processImage = async (imageData: string) => {
    setExtracting(true);
    setOcrProgress(0);
    setOcrStatus("준비 중...");
    setOcrText("");
    setEditingOcr(false);
    setResults([]);

    try {
      // Preprocess image if enabled
      const processedImage = preprocess ? await preprocessImage(imageData) : imageData;

      const Tesseract = await import("tesseract.js");

      setOcrStatus("일본어 모델 로딩 중...");
      const worker = await Tesseract.createWorker("jpn", undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "loading language traineddata") {
            setOcrStatus("일본어 모델 다운로드 중...");
            setOcrProgress(Math.round(m.progress * 50));
          } else if (m.status === "initializing api") {
            setOcrStatus("초기화 중...");
            setOcrProgress(55);
          } else if (m.status === "recognizing text") {
            setOcrStatus("텍스트 인식 중...");
            setOcrProgress(60 + Math.round(m.progress * 40));
          }
        },
      });

      // Set parameters for better Japanese recognition
      await worker.setParameters({
        tessedit_pageseg_mode: "6" as unknown as Tesseract.PSM, // Assume uniform block of text
      });

      const { data: { text, confidence } } = await worker.recognize(processedImage);
      await worker.terminate();

      // Filter to Japanese-only characters
      const filtered = filterJapaneseText(text);
      const cleaned = filtered || text.trim().replace(/\s+/g, " ");

      setOcrText(cleaned);
      setEditedOcrText(cleaned);

      if (cleaned) {
        searchWords(cleaned);
        setOcrStatus(`인식 완료 (신뢰도: ${Math.round(confidence)}%)`);
      } else {
        setResults([{ word: "—", reading: "-", meaning: "텍스트를 인식하지 못했습니다. 더 선명한 이미지로 다시 시도해보세요." }]);
        setOcrStatus("인식 실패");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setResults([{ word: "⚠️", reading: "-", meaning: "텍스트 인식 중 오류가 발생했습니다. 다시 시도해주세요." }]);
      setOcrStatus("오류 발생");
    } finally {
      setExtracting(false);
    }
  };

  const handleOcrEdit = () => {
    if (editingOcr) {
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

    // Calculate crop area based on zoom
    const cropW = video.videoWidth / zoom;
    const cropH = video.videoHeight / zoom;
    const cropX = (video.videoWidth - cropW) / 2;
    const cropY = (video.videoHeight - cropH) / 2;

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    stopCamera();
    processImage(dataUrl);
  }, [zoom, preprocess]);

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
    setOcrStatus("");
  };

  const handleSearch = () => {
    if (!inputText.trim()) return;
    searchWords(inputText.trim());
  };

  const isBookmarked = (word: string) => bookmarks.includes(`word:${word}`);

  const handleZoom = (dir: "in" | "out") => {
    setZoom((prev) => {
      if (dir === "in") return Math.min(prev + 0.5, 3);
      return Math.max(prev - 0.5, 1);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
        <Camera className="text-indigo-600 shrink-0" /> 카메라 번역
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
        일본어 텍스트를 촬영하거나 직접 입력하여 번역하세요
      </p>

      {/* Camera Section */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📸 카메라</h2>
          <button
            onClick={() => setShowPreprocessOption(!showPreprocessOption)}
            className="text-gray-400 hover:text-indigo-500 p-1"
            title="설정"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Preprocess toggle */}
        {showPreprocessOption && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preprocess}
                onChange={(e) => setPreprocess(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">이미지 전처리 (흑백 변환 + 대비 강화)</span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-6">텍스트 인식 정확도를 높여줍니다. 이미 선명한 이미지는 끄세요.</p>
          </div>
        )}

        {capturedImage ? (
          <div>
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img src={capturedImage} alt="촬영된 이미지" className="w-full rounded-xl" />
              {extracting && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-white text-center px-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">{ocrStatus}</p>
                    <p className="text-xs text-gray-300 mt-1">{ocrProgress}%</p>
                    <div className="w-48 h-1.5 bg-gray-600 rounded-full mt-2 mx-auto">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                    </div>
                    {ocrProgress < 50 && (
                      <p className="text-xs text-gray-400 mt-2">첫 실행 시 모델 다운로드로 시간이 걸릴 수 있습니다</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* OCR Result */}
            {ocrText && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">인식된 텍스트</p>
                    {ocrStatus && !extracting && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{ocrStatus}</p>
                    )}
                  </div>
                  <button
                    onClick={handleOcrEdit}
                    className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 shrink-0"
                  >
                    <Edit3 size={12} />
                    {editingOcr ? "검색" : "수정"}
                  </button>
                </div>
                {editingOcr ? (
                  <textarea
                    value={editedOcrText}
                    onChange={(e) => setEditedOcrText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleOcrEdit()}
                    className="w-full text-base font-bold bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 resize-none"
                    rows={2}
                    autoFocus
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900 dark:text-white break-words leading-relaxed">{ocrText}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={resetCapture} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm">
                <RotateCcw size={16} /> 다시 촬영
              </button>
              <button onClick={() => { resetCapture(); startCamera(); }} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-indigo-700">
                <Camera size={16} /> 새로 촬영
              </button>
            </div>
          </div>
        ) : !cameraActive ? (
          <div className="text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl py-12 sm:py-16 mb-4">
              <Camera size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">카메라로 일본어 텍스트를 촬영하면<br />번역해 드립니다</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">인쇄된 글자, 간판, 메뉴판 등</p>
            </div>
            <div className="flex gap-2">
              <button onClick={startCamera} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm sm:text-base">
                <Camera size={18} /> 카메라 시작
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 text-sm sm:text-base">
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
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
              <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> 촬영 중
              </div>
              {zoom > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                  {zoom.toFixed(1)}x
                </div>
              )}
              {/* Guide frame */}
              <div className="absolute inset-6 sm:inset-8 border-2 border-white/40 rounded-lg pointer-events-none">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  텍스트를 프레임 안에 맞춰주세요
                </div>
                {/* Corner markers */}
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={() => handleZoom("out")}
                disabled={zoom <= 1}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full disabled:opacity-30"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs text-gray-500 w-10 text-center">{zoom.toFixed(1)}x</span>
              <button
                onClick={() => handleZoom("in")}
                disabled={zoom >= 3}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full disabled:opacity-30"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={capturePhoto} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700">
                <Aperture size={18} /> 촬영
              </button>
              <button onClick={stopCamera} className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2">
                <CameraOff size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={preprocessCanvasRef} className="hidden" />

      {/* Results Section */}
      {results.length > 0 && results[0].reading !== "-" && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="font-bold mb-3">📖 검색 결과 <span className="text-sm font-normal text-gray-400">({results.length}개)</span></h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-bold">{r.word}</span>
                    <span className="text-indigo-500 text-sm">{r.reading}</span>
                    {r.level && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-medium">{r.level}</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 break-words">{r.meaning}</p>
                </div>
                <div className="shrink-0 flex items-center gap-0.5">
                  <button
                    onClick={() => toggleBookmark("word", r.word)}
                    className={`p-1.5 sm:p-2 ${isBookmarked(r.word) ? "text-yellow-500" : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"}`}
                  >
                    <Bookmark size={16} fill={isBookmarked(r.word) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => speakJapanese(r.word)} className="text-indigo-500 hover:text-indigo-700 p-1.5 sm:p-2">
                    <Volume2 size={16} />
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
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="font-bold mb-4">✍️ 텍스트 입력 번역</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="일본어 단어 또는 뜻을 입력..."
            className="min-w-0 flex-1 border dark:border-gray-600 rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-sm"
          />
          <button onClick={handleSearch} className="shrink-0 w-10 sm:w-12 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <Search size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-400">빠른 검색:</span>
          {["食べる", "学校", "先生", "友達", "天気", "電車", "病院"].map((w) => (
            <button key={w} onClick={() => { setInputText(w); searchWords(w); }} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600">{w}</button>
          ))}
        </div>
      </div>

      {/* Search History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="font-bold text-sm flex items-center gap-1.5"
            >
              <Clock size={14} className="text-gray-400" />
              최근 검색 <span className="text-xs font-normal text-gray-400">({history.length})</span>
            </button>
            {showHistory && (
              <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1">
                <Trash2 size={12} /> 전체 삭제
              </button>
            )}
          </div>
          {showHistory && (
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setInputText(h.text); searchWords(h.text); }}
                  className="w-full text-left bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span className="text-sm font-medium truncate">{h.text}</span>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-gray-400">{h.resultCount}개 결과</span>
                    <span className="text-[10px] text-gray-300">{new Date(h.timestamp).toLocaleDateString("ko")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 sm:p-6">
        <h3 className="font-bold text-sm mb-2">💡 인식 정확도를 높이는 팁</h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
          <li>• <strong>인쇄된 텍스트</strong>가 손글씨보다 인식률이 높습니다</li>
          <li>• <strong>가까이 촬영</strong>하여 글자가 크게 보이도록 하세요</li>
          <li>• <strong>밝은 조명</strong>에서 그림자 없이 촬영하세요</li>
          <li>• 인식 결과가 이상하면 <strong>수정 버튼</strong>으로 직접 보정할 수 있습니다</li>
          <li>• <strong>이미지 전처리</strong> 옵션으로 흑백 변환 + 대비 강화 가능</li>
        </ul>
      </div>
    </div>
  );
}
