"use client";

import { useState } from "react";

export function RegisterPage({
  onRegister,
  onGoLogin,
}: {
  onRegister: (name: string, email: string) => void;
  onGoLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = name.trim() && email.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onRegister(name.trim(), email.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">新規登録</h1>
          <p className="text-sm text-gray-500 mt-1">アカウントを作成してください</p>
        </div>

        {/* 登録カード */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="田中太郎"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            登録してログイン
          </button>

          <button
            type="button"
            onClick={onGoLogin}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← ログイン画面に戻る
          </button>
        </form>
      </div>
    </div>
  );
}
