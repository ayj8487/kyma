export interface KanaCharacter {
  id: string;
  character: string;
  romaji: string;
  type: "hiragana" | "katakana";
  category: "gojuon" | "dakuon" | "handakuon" | "yoon";
  row: string;
  orderIndex: number;
  strokeCount: number;
}

export interface Word {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  jlptLevel: string;
  partOfSpeech: string;
  exampleSentence?: string;
  exampleReading?: string;
  exampleMeaning?: string;
}

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "fill_blank";
  question: string;
  options: string[];
  correctAnswer: string;
  contentType: "kana" | "word";
  difficulty: string;
}

export interface UserProgress {
  contentType: string;
  contentId: string;
  status: "new" | "learning" | "mastered";
  correctCount: number;
  incorrectCount: number;
}

export interface StudyStats {
  totalKanaLearned: number;
  totalWordsLearned: number;
  totalQuizzesTaken: number;
  correctRate: number;
  streakDays: number;
  todayStudyCount: number;
}
