"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, HelpCircle } from "lucide-react";

interface CustomQuiz {
  id: string;
  questionType: string;
  question: string;
  correctAnswer: string;
  options: string[];
  jlptLevel: string;
}

export default function AdminQuizPage() {
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ questionType: "multiple_choice", question: "", correctAnswer: "", option1: "", option2: "", option3: "", jlptLevel: "N5" });

  const handleSubmit = () => {
    if (!form.question || !form.correctAnswer) return;
    const newQuiz: CustomQuiz = {
      id: `cq-${Date.now()}`,
      questionType: form.questionType,
      question: form.question,
      correctAnswer: form.correctAnswer,
      options: [form.correctAnswer, form.option1, form.option2, form.option3].filter(Boolean),
      jlptLevel: form.jlptLevel,
    };
    setQuizzes([...quizzes, newQuiz]);
    setForm({ questionType: "multiple_choice", question: "", correctAnswer: "", option1: "", option2: "", option3: "", jlptLevel: "N5" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">퀴즈 관리</h1>
          <p className="text-sm text-gray-500">퀴즈 문제를 등록하고 관리합니다</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-indigo-700">
          <Plus size={16} /> 문제 추가
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4"><div className="text-2xl font-bold text-indigo-600">{quizzes.length + 50}</div><div className="text-xs text-gray-500">총 퀴즈 문제</div></div>
        <div className="bg-white border rounded-xl p-4"><div className="text-2xl font-bold text-green-600">78%</div><div className="text-xs text-gray-500">평균 정답률</div></div>
        <div className="bg-white border rounded-xl p-4"><div className="text-2xl font-bold text-violet-600">{quizzes.length}</div><div className="text-xs text-gray-500">사용자 정의</div></div>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">새 퀴즈 문제</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">문제 유형</label>
                <select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="multiple_choice">객관식</option>
                  <option value="fill_blank">빈칸 채우기</option>
                  <option value="listening">듣기</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">JLPT 레벨</label>
                <select value={form.jlptLevel} onChange={(e) => setForm({ ...form, jlptLevel: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {["N5", "N4", "N3", "N2", "N1"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">문제</label>
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="문제를 입력하세요" />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">정답</label>
              <input value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="정답" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input value={form.option1} onChange={(e) => setForm({ ...form, option1: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" placeholder="오답 1" />
              <input value={form.option2} onChange={(e) => setForm({ ...form, option2: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" placeholder="오답 2" />
              <input value={form.option3} onChange={(e) => setForm({ ...form, option3: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" placeholder="오답 3" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">저장</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">문제</th>
              <th className="px-4 py-3 text-left text-gray-600">유형</th>
              <th className="px-4 py-3 text-left text-gray-600">레벨</th>
              <th className="px-4 py-3 text-left text-gray-600">정답</th>
              <th className="px-4 py-3 text-right text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400"><HelpCircle size={32} className="mx-auto mb-2 opacity-50" />사용자 정의 퀴즈가 없습니다</td></tr>
            ) : (
              quizzes.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{q.question}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">{q.questionType}</span></td>
                  <td className="px-4 py-3">{q.jlptLevel}</td>
                  <td className="px-4 py-3 text-green-600">{q.correctAnswer}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-gray-400 hover:text-gray-600 mr-2"><Edit2 size={14} /></button>
                    <button onClick={() => setQuizzes(quizzes.filter((x) => x.id !== q.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
