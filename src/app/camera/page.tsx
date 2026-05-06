"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  CameraOff,
  Aperture,
  RotateCcw,
  Search,
  Volume2,
  ImageIcon,
  Loader2,
  Bookmark,
  Edit3,
  Trash2,
  Clock,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { speakJapanese } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";

// ─── Types ─────────────────────────────────────────────────────────────
type AnalyzedWord = {
  word: string;
  reading: string;
  meaning: string;
  level?: string | null;
};

type AnalyzeResult = {
  cleanedText: string;
  translation: string;
  words: AnalyzedWord[];
  isJapanese: boolean;
};

type HistoryItem = {
  text: string;
  translation: string;
  timestamp: number;
};

// ─── Helpers ───────────────────────────────────────────────────────────
function filterJapaneseText(text: string): string {
  return text
    .replace(/[^぀-ゟ゠-ヿ一-龯㐀-䶿　-〿＀-￯\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

/** Resize image so longest side ≤ maxDim. JPEG output for smaller payload. */
async function resizeImage(dataUrl: string, maxDim = 1600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      if (ratio === 1) {
        resolve(dataUrl);
        return;
      }
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ─── Component ─────────────────────────────────────────────────────────
export default function CameraPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [inputText, setInputText] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [editingOcr, setEditingOcr] = useState(false);
  const [editedOcrText, setEditedOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
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
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kyma-camera-history");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
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

  // ─── Camera Control (mobile-robust) ──────────────────────────────────
  const startCamera = async () => {
    if (cameraStarting) return;
    setCameraStarting(true);
    setCameraError("");
    setCapturedImage(null);
    setOcrText("");
    setAnalysis(null);
    setZoom(1);

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // Try rear camera first, fallback to any camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraActive(true); // render <video> first

      // Wait for next paint so videoRef is mounted
      await new Promise((r) => requestAnimationFrame(r));

      const video = videoRef.current;
      if (!video) throw new Error("Video element not mounted");

      video.srcObject = stream;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");

      // Wait for metadata before play (more reliable on mobile Safari)
      if (video.readyState < 1) {
        await new Promise<void>((resolve) => {
          const onMeta = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            resolve();
          };
          video.addEventListener("loadedmetadata", onMeta);
        });
      }

      try {
        await video.play();
      } catch (playErr) {
        console.error("Video play failed:", playErr);
        // Some mobile browsers need a second attempt
        setTimeout(() => video.play().catch(() => {}), 100);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraActive(false);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setCameraError("카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setCameraError("사용 가능한 카메라를 찾을 수 없습니다.");
      } else if (err instanceof DOMException && err.name === "NotReadableError") {
        setCameraError("카메라가 다른 앱에서 사용 중입니다.");
      } else {
        setCameraError(
          "카메라를 시작할 수 없습니다. 갤러리에서 사진을 선택해보세요. " +
            "(HTTPS + 카메라 권한 필요)"
        );
      }
    } finally {
      setCameraStarting(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  // ─── Image preprocessing for OCR ─────────────────────────────────────
  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = preprocessCanvasRef.current;
        if (!canvas) {
          resolve(imageData);
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageData);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          const adjusted = ((gray / 255 - 0.5) * 1.5 + 0.5) * 255;
          const val = Math.max(0, Math.min(255, adjusted));
          const threshold = val > 140 ? 255 : 0;
          data[i] = threshold;
          data[i + 1] = threshold;
          data[i + 2] = threshold;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(imageData);
      img.src = imageData;
    });
  };

  // ─── AI analysis after OCR ───────────────────────────────────────────
  const analyzeWithAI = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/ai/ocr-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalyzeError(data.error || "AI 분석에 실패했습니다.");
        return;
      }
      setAnalysis(data);
      if (data.isJapanese && data.translation) {
        saveHistory({ text, translation: data.translation, timestamp: Date.now() });
      }
    } catch (err) {
      console.error("Analyze error:", err);
      setAnalyzeError("네트워크 오류로 AI 분석에 실패했습니다.");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // ─── OCR pipeline ────────────────────────────────────────────────────
  const processImage = async (imageData: string) => {
    setExtracting(true);
    setOcrProgress(0);
    setOcrStatus("이미지 준비 중...");
    setOcrText("");
    setEditingOcr(false);
    setAnalysis(null);
    setAnalyzeError(null);

    try {
      // Resize first to speed up OCR significantly
      const resized = await resizeImage(imageData, 1600);
      const processedImage = preprocess ? await preprocessImage(resized) : resized;

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
            setOcrProgress(60 + Math.round(m.progress * 35));
          }
        },
      });

      await worker.setParameters({
        tessedit_pageseg_mode: "6" as unknown as Tesseract.PSM,
      });

      const result = await worker.recognize(processedImage);
      await worker.terminate();

      const text = result.data.text;
      const confidence = result.data.confidence;
      const filtered = filterJapaneseText(text);
      const cleaned = filtered || text.trim().replace(/\s+/g, " ");

      setOcrText(cleaned);
      setEditedOcrText(cleaned);

      if (cleaned) {
        setOcrStatus(`인식 완료 (신뢰도: ${Math.round(confidence)}%) — AI 번역 중...`);
        setOcrProgress(100);
        // Auto-trigger AI analysis
        await analyzeWithAI(cleaned);
        setOcrStatus(`인식 완료 (신뢰도: ${Math.round(confidence)}%)`);
      } else {
        setOcrStatus("텍스트를 인식하지 못했습니다");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setOcrStatus("오류 발생");
      setAnalyzeError("OCR 처리 중 오류가 발생했습니다.");
    } finally {
      setExtracting(false);
    }
  };

  const handleOcrEdit = async () => {
    if (editingOcr) {
      setOcrText(editedOcrText);
      setEditingOcr(false);
      // Re-analyze with edited text
      await analyzeWithAI(editedOcrText);
    } else {
      setEditingOcr(true);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const cropW = video.videoWidth / zoom;
    const cropH = video.videoHeight / zoom;
    const cropX = (video.videoWidth - cropW) / 2;
    const cropY = (video.videoHeight - cropH) / 2;

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    processImage(dataUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, preprocess]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setOcrStatus("이미지 읽는 중...");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      await processImage(dataUrl);
    };
    reader.onerror = () => {
      setExtracting(false);
      setAnalyzeError("이미지를 읽지 못했습니다.");
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setOcrText("");
    setEditedOcrText("");
    setEditingOcr(false);
    setOcrProgress(0);
    setOcrStatus("");
    setAnalysis(null);
    setAnalyzeError(null);
  };

  const handleManualSearch = async () => {
    const text = inputText.trim();
    if (!text) return;
    await analyzeWithAI(text);
  };

  const isBookmarked = (word: string) => bookmarks.includes(`word:${word}`);

  const handleZoom = (dir: "in" | "out") => {
    setZoom((prev) => {
      if (dir === "in") return Math.min(prev + 0.5, 3);
      return Math.max(prev - 0.5, 1);
    });
  };

  const words = analysis?.words ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
        <Camera className="text-indigo-600 shrink-0" /> 카메라 번역
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
        일본어 텍스트를 촬영하면 AI가 번역하고 주요 단어를 추출해드립니다
      </p>

      {/* Camera Section */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📸 이미지 입력</h2>
          <button
            onClick={() => setShowPreprocessOption(!showPreprocessOption)}
            className="text-gray-400 hover:text-indigo-500 p-1"
            title="설정"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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

            {/* OCR + Translation result */}
            {ocrText && (
              <div className="space-y-3 mb-4">
                {/* OCR text */}
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">인식된 일본어</p>
                      {ocrStatus && !extracting && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{ocrStatus}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakJapanese(ocrText)}
                        className="text-indigo-500 hover:text-indigo-700"
                        aria-label="듣기"
                      >
                        <Volume2 size={14} />
                      </button>
                      <button
                        onClick={handleOcrEdit}
                        className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 shrink-0"
                      >
                        <Edit3 size={12} />
                        {editingOcr ? "다시 분석" : "수정"}
                      </button>
                    </div>
                  </div>
                  {editingOcr ? (
                    <textarea
                      value={editedOcrText}
                      onChange={(e) => setEditedOcrText(e.target.value)}
                      className="w-full text-base font-bold bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 resize-none"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-900 dark:text-white break-words leading-relaxed">{ocrText}</p>
                  )}
                </div>

                {/* AI Translation */}
                {analyzing && (
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl p-4 flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
                    <Loader2 size={14} className="animate-spin" />
                    AI가 번역하고 주요 단어를 추출하는 중...
                  </div>
                )}

                {analyzeError && !analyzing && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between gap-2 text-sm text-red-700 dark:text-red-300">
                    <span>{analyzeError}</span>
                    <button
                      onClick={() => analyzeWithAI(ocrText)}
                      className="shrink-0 px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 rounded text-xs font-medium"
                    >
                      재시도
                    </button>
                  </div>
                )}

                {analysis && !analyzing && analysis.isJapanese && (
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={14} className="text-violet-500" />
                      <p className="text-xs text-violet-500 dark:text-violet-400 font-medium">한국어 번역</p>
                    </div>
                    <p className="text-base text-violet-900 dark:text-violet-100 leading-relaxed break-words">
                      {analysis.translation}
                    </p>
                    {analysis.cleanedText !== ocrText && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        💡 OCR 정정: <span className="font-mono">{analysis.cleanedText}</span>
                      </p>
                    )}
                  </div>
                )}

                {analysis && !analysis.isJapanese && !analyzing && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300">
                    인식된 텍스트가 일본어가 아닌 것 같습니다. 더 선명한 일본어 이미지로 다시 시도해보세요.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={resetCapture} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm">
                <RotateCcw size={16} /> 처음으로
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
              <p className="text-gray-400 dark:text-gray-500 text-sm">카메라로 일본어 텍스트를 촬영하면<br />AI가 번역해 드립니다</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">인쇄된 글자, 간판, 메뉴판 등</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={startCamera}
                disabled={cameraStarting}
                className="px-2 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                {cameraStarting ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                <span>카메라</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Camera size={18} />
                <span>촬영</span>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="px-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <ImageIcon size={18} />
                <span>갤러리</span>
              </button>
            </div>
            {/* "촬영" uses native camera capture (mobile fallback if live preview fails) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {cameraError && (
              <p className="text-red-500 text-sm mt-3">{cameraError}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              💡 모바일에서 라이브 카메라가 안 되면 <strong>&quot;촬영&quot;</strong> 버튼을 사용하세요 (네이티브 카메라 앱 호출)
            </p>
          </div>
        ) : (
          <div>
            <div className="relative rounded-xl overflow-hidden bg-black mb-4">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full transition-transform duration-200 min-h-[240px] bg-black"
                style={{ transform: `scale(${zoom})`, objectFit: "cover" }}
              />
              <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> 촬영 중
              </div>
              {zoom > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                  {zoom.toFixed(1)}x
                </div>
              )}
              <div className="absolute inset-6 sm:inset-8 border-2 border-white/40 rounded-lg pointer-events-none">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  텍스트를 프레임 안에 맞춰주세요
                </div>
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
              </div>
            </div>

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

      {/* Words from analysis */}
      {words.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="font-bold mb-3">📖 주요 단어 <span className="text-sm font-normal text-gray-400">({words.length}개)</span></h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {words.map((r, i) => (
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

      {/* Manual Input Section */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="font-bold mb-4">✍️ 텍스트 입력 번역</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
            placeholder="일본어 단어 또는 문장을 입력..."
            className="min-w-0 flex-1 border dark:border-gray-600 rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:border-indigo-400 bg-white dark:bg-gray-800 text-sm"
          />
          <button onClick={handleManualSearch} disabled={analyzing} className="shrink-0 w-10 sm:w-12 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-400">빠른 검색:</span>
          {["食べる", "学校", "先生", "友達", "天気", "電車", "病院"].map((w) => (
            <button
              key={w}
              onClick={() => { setInputText(w); analyzeWithAI(w); }}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {w}
            </button>
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
              최근 번역 <span className="text-xs font-normal text-gray-400">({history.length})</span>
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
                  onClick={() => { setInputText(h.text); analyzeWithAI(h.text); }}
                  className="w-full text-left bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <p className="text-sm font-medium truncate">{h.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{h.translation}</p>
                  <span className="text-[10px] text-gray-300">{new Date(h.timestamp).toLocaleString("ko")}</span>
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
          <li>• 모바일에서 라이브 카메라가 안 되면 <strong>「촬영」</strong> 버튼으로 네이티브 카메라 사용</li>
          <li>• 인식 결과가 이상하면 <strong>수정 버튼</strong>으로 직접 보정 후 재분석</li>
        </ul>
      </div>
    </div>
  );
}
