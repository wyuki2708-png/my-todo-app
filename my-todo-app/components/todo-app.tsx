"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, LogOut, MessageSquare, Send } from "lucide-react";
import { LoginPage } from "./login-page";
import { RegisterPage } from "./register-page";

// ─── 型定義 ────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
};

type Comment = {
  id: number;
  text: string;
  authorName: string;
};

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  userId: string;
  comments: Comment[];
};

type Screen = "login" | "register" | "app";
type Column = "incomplete" | "completed";

// ─── 定数 ──────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  users: "myboard_users",
  todos: "myboard_todos",
  currentUserId: "myboard_current_user_id",
} as const;

const DEFAULT_USERS: User[] = [
  { id: "default-1", name: "田中太郎", email: "tanaka@example.com" },
  { id: "default-2", name: "佐藤花子", email: "sato@example.com" },
  { id: "default-3", name: "山田次郎", email: "yamada@example.com" },
];

// ─── ローカルストレージユーティリティ ────────────────────────────────────────────

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return DEFAULT_USERS;
    return JSON.parse(raw) as User[];
  } catch {
    return DEFAULT_USERS;
  }
}

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.todos);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Todo[];
    // 旧データにcomments未定義の場合は空配列で補完
    return parsed.map((t) => ({ ...t, comments: t.comments ?? [] }));
  } catch {
    return [];
  }
}

function loadCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.currentUserId);
}

// ─── TaskCard コンポーネント ──────────────────────────────────────────────────

function TaskCard({
  todo,
  currentUserName,
  onToggle,
  onDelete,
  onDragStart,
  onAddComment,
}: {
  todo: Todo;
  currentUserName: string;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onAddComment: (text: string) => void;
}) {
  const [commentInput, setCommentInput] = useState("");

  const handleAddComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    onAddComment(text);
    setCommentInput("");
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddComment();
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
    >
      {/* タスク本体 */}
      <div className="flex items-start gap-3 p-4 cursor-grab active:cursor-grabbing">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer shrink-0"
        />
        <span
          className={`flex-1 text-sm leading-relaxed break-words ${
            todo.completed ? "line-through text-gray-400" : "text-gray-700"
          }`}
        >
          {todo.text}
        </span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
          aria-label="削除"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* コメントセクション */}
      <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl px-4 pt-3 pb-3">
        {/* コメントヘッダー */}
        <div className="flex items-center gap-1.5 mb-2">
          <MessageSquare size={12} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-400">
            コメント {todo.comments.length > 0 ? `(${todo.comments.length})` : ""}
          </span>
        </div>

        {/* コメント一覧 */}
        {todo.comments.length === 0 ? (
          <p className="text-xs text-gray-400 italic mb-2">コメントはありません</p>
        ) : (
          <ul className="space-y-2 mb-2">
            {todo.comments.map((comment) => (
              <li
                key={comment.id}
                className="bg-white rounded-lg px-3 py-2 border border-gray-100"
              >
                <p className="text-xs font-semibold text-blue-500 mb-0.5">
                  {comment.authorName}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed break-words">
                  {comment.text}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* コメント入力欄 */}
        <div className="flex gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder={`${currentUserName}としてコメント…`}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentInput.trim()}
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="コメントを送信"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KanbanColumn コンポーネント ─────────────────────────────────────────────

function KanbanColumn({
  title,
  count,
  accentColor,
  children,
  onDragOver,
  onDrop,
  isEmpty,
  emptyMessage,
}: {
  title: string;
  count: number;
  accentColor: string;
  children: React.ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isEmpty: boolean;
  emptyMessage: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl p-4 transition-colors ${
        isDragOver ? "bg-blue-50" : "bg-gray-100/80"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e);
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
        <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
        <span className="ml-auto text-xs font-medium bg-white text-gray-500 rounded-full px-2 py-0.5 shadow-sm">
          {count}
        </span>
      </div>

      <div className="space-y-3 min-h-[120px]">
        {isEmpty ? (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ─── KanbanBoard コンポーネント ───────────────────────────────────────────────

function KanbanBoard({
  currentUser,
  todos,
  onAddTodo,
  onDeleteTodo,
  onToggleTodo,
  onMoveTodo,
  onAddComment,
  onLogout,
}: {
  currentUser: User;
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onDeleteTodo: (id: number) => void;
  onToggleTodo: (id: number) => void;
  onMoveTodo: (id: number, column: Column) => void;
  onAddComment: (todoId: number, text: string) => void;
  onLogout: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const dragIdRef = useRef<number | null>(null);

  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    onAddTodo(text);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (column: Column) => {
    const id = dragIdRef.current;
    if (id === null) return;
    onMoveTodo(id, column);
    dragIdRef.current = null;
  };

  const renderCard = (todo: Todo) => (
    <TaskCard
      key={todo.id}
      todo={todo}
      currentUserName={currentUser.name}
      onToggle={() => onToggleTodo(todo.id)}
      onDelete={() => onDeleteTodo(todo.id)}
      onDragStart={(e) => handleDragStart(e, todo.id)}
      onAddComment={(text) => onAddComment(todo.id, text)}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Board</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              ようこそ、{currentUser.name}さん 👋
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <LogOut size={15} />
            ログアウト
          </button>
        </div>

        {/* タスク入力 */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium shadow-sm hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            追加
          </button>
        </div>

        {/* 進捗サマリー */}
        {todos.length > 0 && (
          <p className="text-xs text-gray-400 mb-4">
            {completedTodos.length}/{todos.length}件完了
          </p>
        )}

        {/* カンバンボード */}
        <div className="flex flex-col sm:flex-row gap-4">
          <KanbanColumn
            title="未完了"
            count={incompleteTodos.length}
            accentColor="bg-blue-400"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("incomplete")}
            isEmpty={incompleteTodos.length === 0}
            emptyMessage="タスクをここにドロップ"
          >
            {incompleteTodos.map(renderCard)}
          </KanbanColumn>

          <KanbanColumn
            title="完了済み"
            count={completedTodos.length}
            accentColor="bg-emerald-400"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("completed")}
            isEmpty={completedTodos.length === 0}
            emptyMessage="完了したタスクをここにドロップ"
          >
            {completedTodos.map(renderCard)}
          </KanbanColumn>
        </div>
      </div>
    </div>
  );
}

// ─── TodoApp（ルートコンポーネント）────────────────────────────────────────────

export function TodoApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [users, setUsers] = useState<User[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 初期ロード
  useEffect(() => {
    const savedUsers = loadUsers();
    const savedTodos = loadTodos();
    const savedUserId = loadCurrentUserId();

    setUsers(savedUsers);
    setTodos(savedTodos);

    if (savedUserId && savedUsers.find((u) => u.id === savedUserId)) {
      setCurrentUserId(savedUserId);
      setScreen("app");
    }
  }, []);

  // ユーザー変更をlocalStorageに保存
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    }
  }, [users]);

  // Todo変更をlocalStorageに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
  }, [todos]);

  // 認証ハンドラー
  const handleLogin = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEYS.currentUserId, userId);
    setScreen("app");
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    setScreen("login");
  };

  const handleRegister = (name: string, email: string) => {
    const newUser: User = { id: `user-${Date.now()}`, name, email };
    setUsers((prev) => [...prev, newUser]);
    handleLogin(newUser.id);
  };

  // Todo操作ハンドラー
  const currentUser = users.find((u) => u.id === currentUserId) ?? null;
  const userTodos = todos.filter((t) => t.userId === currentUserId);

  const handleAddTodo = (text: string) => {
    if (!currentUserId) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text, completed: false, userId: currentUserId, comments: [] },
    ]);
  };

  const handleDeleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleMoveTodo = (id: number, column: Column) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: column === "completed" } : t
      )
    );
  };

  const handleAddComment = (todoId: number, text: string) => {
    if (!currentUser) return;
    const comment: Comment = {
      id: Date.now(),
      text,
      authorName: currentUser.name,
    };
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId ? { ...t, comments: [...t.comments, comment] } : t
      )
    );
  };

  // 画面切り替え
  if (screen === "register") {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onGoLogin={() => setScreen("login")}
      />
    );
  }

  if (screen === "app" && currentUser) {
    return (
      <KanbanBoard
        currentUser={currentUser}
        todos={userTodos}
        onAddTodo={handleAddTodo}
        onDeleteTodo={handleDeleteTodo}
        onToggleTodo={handleToggleTodo}
        onMoveTodo={handleMoveTodo}
        onAddComment={handleAddComment}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoginPage
      users={users}
      onLogin={handleLogin}
      onGoRegister={() => setScreen("register")}
    />
  );
}
