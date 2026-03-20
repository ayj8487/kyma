"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, CameraOff, Aperture, RotateCcw, Search, Volume2, ImageIcon, Loader2 } from "lucide-react";
import { n5Words } from "@/data/words";
import { speakJapanese } from "@/lib/tts";

export default function CameraPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<{ word: string; reading: string; meaning: string }[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
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
    const found = n5Words.filter((w) =>
      w.word.includes(q) || w.reading.includes(q) || w.meaning.includes(q) ||
      q.includes(w.word) || q.includes(w.reading)
    ).map((w) => ({ word: w.word, reading: w.reading, meaning: w.meaning }));
    setResults(found.length > 0 ? found : [{ word: q, reading: "-", meaning: "학습 데이터에서 일치하는 단어를 찾을 수 없습니다." }]);
  };

  const processImage = async (imageData: string) => {
    setExtracting(true);
    setOcrProgress(0);
    setOcrText("");
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

      const cleaned = text.trim();
      setOcrText(cleaned);

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
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setResults([]);
    setOcrText("");
    setOcrProgress(0);
  };

  const handleSearch = () => {
    if (!inputText.trim()) return;
    searchWords(inputText.trim());
  };

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
                  </div>
                </div>
              )}
            </div>

            {ocrText && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-4">
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-1 font-medium">인식된 텍스트</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white break-words">{ocrText}</p>
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
            </div>
            <div className="flex gap-2">
              <button onClick={capturePhoto} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700">
                <Aperture size={18} /> 촬영
              </button>
              <button onClick={stopCamera} className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-2">
                <CameraOff size={16} /> 중지
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">💡 일본어 텍스트에 카메라를 맞추고 촬영 버튼을 누르세요</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

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

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-bold">{r.word}</span>
                    <span className="text-indigo-500 text-sm">{r.reading}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 break-words">{r.meaning}</p>
                </div>
                {r.reading !== "-" && (
                  <button onClick={() => speakJapanese(r.word)} className="shrink-0 text-indigo-500 hover:text-indigo-700 p-2"><Volume2 size={18} /></button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1">
          <span className="text-xs text-gray-400">빠른 검색:</span>
          {["食べる", "学校", "先生", "友達", "天気"].map((w) => (
            <button key={w} onClick={() => { setInputText(w); }} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600">{w}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
