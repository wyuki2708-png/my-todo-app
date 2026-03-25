"use client";

import { useState } from "react";
import { User } from "./todo-app";

export function LoginPage({
  users,
  onLogin,
  onGoRegister,
}: {
  users: User[];
  onLogin: (userId: string) => void;
  onGoRegister: () => void;
}) {
  const [selectedId, setSelectedId] = useState(users[0]?.id ?? "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">My Board</h1>
          <p className="text-sm text-gray-500 mt-1">ログインしてください</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              ユーザーを選択
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => selectedId && onLogin(selectedId)}
            disabled={!selectedId}
            className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            ログイン
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            onClick={onGoRegister}
            className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            新規登録
          </button>
        </div>
      </div>
    </div>
  );
}
