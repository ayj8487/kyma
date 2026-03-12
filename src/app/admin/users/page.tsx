"use client";

import { useState } from "react";
import { Search, User } from "lucide-react";

const mockUsers = [
  { id: "u1", name: "김민수", email: "minsu@test.com", joinDate: "2026-01-15", jlptLevel: "N5", totalPoints: 2450, role: "user", status: "active" },
  { id: "u2", name: "이지은", email: "jieun@test.com", joinDate: "2026-01-20", jlptLevel: "N4", totalPoints: 5200, role: "user", status: "active" },
  { id: "u3", name: "박서준", email: "seojun@test.com", joinDate: "2026-02-01", jlptLevel: "N5", totalPoints: 1800, role: "user", status: "active" },
  { id: "u4", name: "최유리", email: "yuri@test.com", joinDate: "2026-02-05", jlptLevel: "N3", totalPoints: 8900, role: "admin", status: "active" },
  { id: "u5", name: "정하늘", email: "haneul@test.com", joinDate: "2026-02-10", jlptLevel: "N5", totalPoints: 340, role: "user", status: "inactive" },
  { id: "u6", name: "한소희", email: "sohee@test.com", joinDate: "2026-02-15", jlptLevel: "N4", totalPoints: 4100, role: "user", status: "active" },
  { id: "u7", name: "오민혁", email: "minhyuk@test.com", joinDate: "2026-02-18", jlptLevel: "N5", totalPoints: 920, role: "user", status: "active" },
  { id: "u8", name: "송다영", email: "dayoung@test.com", joinDate: "2026-02-25", jlptLevel: "N4", totalPoints: 3600, role: "user", status: "active" },
  { id: "u9", name: "윤재호", email: "jaeho@test.com", joinDate: "2026-03-01", jlptLevel: "N5", totalPoints: 150, role: "user", status: "inactive" },
  { id: "u10", name: "임수빈", email: "subin@test.com", joinDate: "2026-03-05", jlptLevel: "N5", totalPoints: 680, role: "user", status: "active" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter((u) => u.name.includes(search) || u.email.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="text-sm text-gray-500">등록된 사용자를 확인하고 관리합니다</p>
        </div>
        <div className="text-sm text-gray-500">총 {mockUsers.length}명</div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 이메일로 검색..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">사용자</th>
              <th className="px-4 py-3 text-left text-gray-600">가입일</th>
              <th className="px-4 py-3 text-left text-gray-600">JLPT</th>
              <th className="px-4 py-3 text-left text-gray-600">포인트</th>
              <th className="px-4 py-3 text-left text-gray-600">역할</th>
              <th className="px-4 py-3 text-left text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center"><User size={14} className="text-indigo-600" /></div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.joinDate}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">{u.jlptLevel}</span></td>
                <td className="px-4 py-3 font-medium">{u.totalPoints.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{u.status === "active" ? "활성" : "비활성"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
