import React, { useState } from "react";
import { ListTodo, Plus, Trash2, CheckCircle2, Circle, Star } from "lucide-react";
import { TodoItem, ThemeConfig } from "../types";

interface TodoWidgetProps {
  theme: ThemeConfig;
  todos: TodoItem[];
  onUpdateTodos: (updated: TodoItem[]) => void;
}

export default function TodoWidget({ theme, todos, onUpdateTodos }: TodoWidgetProps) {
  const [inputText, setInputText] = useState("");

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTodo: TodoItem = {
      id: "todo_" + Date.now(),
      text: inputText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateTodos([newTodo, ...todos]);
    setInputText("");
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    onUpdateTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter(todo => todo.id !== id);
    onUpdateTodos(updated);
  };

  const handleClearCompleted = () => {
    const updated = todos.filter(todo => !todo.completed);
    onUpdateTodos(updated);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full justify-between p-5" id="widget-todo-root">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: theme.textColor }}>
          <ListTodo size={12} style={{ color: theme.accentColor }} /> Personal Tasks
        </span>
        {completedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-[9px] font-mono hover:opacity-80 underline cursor-pointer"
            style={{ color: theme.textColor }}
          >
            Clear Done
          </button>
        )}
      </div>

      {/* Todo Form Input */}
      <form onSubmit={handleAddTodo} className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1 mb-2.5 focus-within:border-white/20 transition-all">
        <input
          type="text"
          placeholder="Add a new task..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="bg-transparent text-xs w-full px-2 py-1.5 focus:outline-none placeholder:text-white/30"
          style={{ color: theme.textColor }}
        />
        <button
          type="submit"
          className="p-1 rounded-md text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          style={{ backgroundColor: theme.accentColor }}
        >
          <Plus size={14} />
        </button>
      </form>

      {/* Scrollable Tasks List */}
      <div className="flex-1 overflow-y-auto max-h-[110px] pr-1 space-y-1.5">
        {todos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-40">
            <span className="text-[10px] font-mono" style={{ color: theme.textColor }}>No pending tasks today. Enjoy!</span>
          </div>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="group flex items-center justify-between gap-2 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 border border-white/5 transition-all"
            >
              <button
                type="button"
                onClick={() => handleToggleTodo(todo.id)}
                className="flex items-start text-left gap-2 cursor-pointer text-xs w-full"
                style={{ color: theme.textColor }}
              >
                <span className="mt-0.5" style={{ color: theme.accentColor }}>
                  {todo.completed ? (
                    <CheckCircle2 size={13} className="opacity-90 animate-scale-up" />
                  ) : (
                    <Circle size={13} className="opacity-50 hover:opacity-100" />
                  )}
                </span>
                <span className={`leading-tight select-none truncate max-w-[150px] ${todo.completed ? "line-through opacity-45" : ""}`}>
                  {todo.text}
                </span>
              </button>

              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 rounded transition-opacity cursor-pointer"
                title="Delete task"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Task Completion Bar */}
      {totalCount > 0 && (
        <div className="border-t border-white/5 pt-2 mt-2">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1" style={{ color: theme.textColor }}>
            <span className="opacity-60">Progress</span>
            <span>{completedCount}/{totalCount} Completed ({completionRate}%)</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${completionRate}%`,
                backgroundColor: theme.accentColor,
                boxShadow: `0 0 6px ${theme.accentColor}`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
