export function speakJapanese(text: string) {
  if (typeof window === "undefined") return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
