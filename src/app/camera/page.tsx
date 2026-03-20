"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, CameraOff, Aperture, RotateCcw, Search, Volume2, ImageIcon } from "lucide-react";
import { n5Words } from "@/data/words";
import { speakJapanese } from "@/lib/tts";

export default function CameraPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<{ word: string; reading: string; meaning: string }[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
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
    } catch {
      setCameraError("카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
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
    processImage();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
      processImage();
    };
    reader.readAsDataURL(file);
  };

  const processImage = () => {
    setExtracting(true);
    // Simulated OCR - in production, connect to a real OCR API (Google Vision, Tesseract.js, etc.)
    setTimeout(() => {
      setExtracting(false);
      setResults([{
        word: "📷",
        reading: "-",
        meaning: "촬영된 이미지에서 텍스트를 인식했습니다. 현재는 데모 모드입니다. 아래 텍스트 입력으로 직접 검색해보세요!"
      }]);
    }, 1500);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setResults([]);
  };

  const handleSearch = () => {
    if (!inputText.trim()) return;
    const q = inputText.trim();
    const found = n5Words.filter((w) =>
      w.word.includes(q) || w.reading.includes(q) || w.meaning.includes(q)
    ).map((w) => ({ word: w.word, reading: w.reading, meaning: w.meaning }));
    setResults(found.length > 0 ? found : [{ word: q, reading: "-", meaning: "단어를 찾을 수 없습니다. 학습 데이터에 포함된 단어를 검색해보세요." }]);
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
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">텍스트 인식 중...</p>
                  </div>
                </div>
              )}
            </div>
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
            <p className="text-xs text-gray-400 text-center mt-3">💡 촬영 버튼을 눌러 텍스트를 캡처하세요</p>
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
