import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  User, 
  Edit2, 
  Trash2, 
  Check, 
  Clock, 
  MessageSquareText,
  TrendingUp,
  Briefcase,
  Handshake
} from 'lucide-react';

export default function ProgressTimelinePopover({ 
  isOpen, 
  onClose, 
  startup, 
  type = 'bizDev', // 'bizDev' | 'investment'
  onUpdateLogs,
  currentUser
}) {
  const isBizDev = type === 'bizDev';
  const typeLabel = isBizDev ? '事業開発進捗' : '投資検討進捗';
  const typeIcon = isBizDev ? <Handshake className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
  const badgeColor = isBizDev 
    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/50' 
    : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/50';

  // Extract initial logs, falling back to legacy single text if logs don't exist yet
  const getInitialLogs = () => {
    if (!startup) return [];
    const logsField = isBizDev ? startup.bizDevLogs : startup.investmentLogs;
    if (Array.isArray(logsField) && logsField.length > 0) {
      return logsField;
    }
    // Fallback from legacy notes
    const legacyText = isBizDev ? startup.bizDevNotes : startup.investmentMemo;
    if (legacyText && legacyText.trim()) {
      return [{
        id: `log_legacy_${Date.now()}`,
        date: startup.createdAtDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        author: startup.assignedMember || startup.pic || '初期登録',
        text: legacyText.trim(),
        createdAt: new Date().toISOString()
      }];
    }
    return [];
  };

  const [logs, setLogs] = useState([]);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newText, setNewText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAuthor, setEditAuthor] = useState('');

  useEffect(() => {
    if (isOpen && startup) {
      const initial = getInitialLogs();
      setLogs(initial);
      const defaultAuthor = currentUser?.displayName || currentUser?.email?.split('@')[0] || startup.assignedMember || startup.pic || '';
      setNewAuthor(defaultAuthor);
      setNewDate(new Date().toISOString().split('T')[0]);
      setNewText('');
      setIsAdding(initial.length === 0);
      setEditingId(null);
    }
  }, [isOpen, startup, type]);

  if (!isOpen || !startup) return null;

  // Add new log entry
  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const formattedDate = newDate ? newDate.replace(/-/g, '/') : new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const newEntry = {
      id: `log_${Date.now()}`,
      date: formattedDate,
      author: newAuthor.trim() || '担当者',
      text: newText.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [newEntry, ...logs];
    setLogs(updated);
    onUpdateLogs(startup.id, type, updated);
    setNewText('');
    setIsAdding(false);
  };

  // Delete a log entry
  const handleDeleteLog = (id) => {
    if (!window.confirm('この進捗ログを削除してもよろしいですか？')) return;
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    onUpdateLogs(startup.id, type, updated);
  };

  // Start editing a log
  const handleStartEdit = (log) => {
    setEditingId(log.id);
    setEditText(log.text);
    setEditDate(log.date ? log.date.replace(/\//g, '-') : new Date().toISOString().split('T')[0]);
    setEditAuthor(log.author || '');
  };

  // Save edited log
  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    const formattedDate = editDate ? editDate.replace(/-/g, '/') : new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const updated = logs.map(l => {
      if (l.id === id) {
        return {
          ...l,
          date: formattedDate,
          author: editAuthor.trim() || l.author,
          text: editText.trim(),
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });
    setLogs(updated);
    onUpdateLogs(startup.id, type, updated);
    setEditingId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700">
              {typeIcon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                  {typeLabel}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  No.{startup.no}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[280px] sm:max-w-sm">
                {startup.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>進捗を追記</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Add New Log Form */}
          {isAdding && (
            <form onSubmit={handleAddLog} className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-blue-200/50 dark:border-blue-900/50 pb-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  新しい進捗を記録
                </span>
                {logs.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    キャンセル
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">日付</label>
                  <input 
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">記入者 / 担当</label>
                  <input 
                    type="text"
                    placeholder="例: 田中 健二"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">進捗内容・打ち合わせメモ・ネクストステップ</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="例: DX推進部とのPoCキックオフを実施。2026年Q3に向けた検証要件を確定。"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg text-xs leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-250 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    閉じる
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>この内容で追加</span>
                </button>
              </div>
            </form>
          )}

          {/* Timeline List */}
          {logs.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {logs.map((log, index) => {
                const isEditing = editingId === log.id;
                const isLatest = index === 0;

                return (
                  <div key={log.id || index} className="relative group">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                      isLatest 
                        ? (isBizDev ? 'bg-teal-500 border-white dark:border-slate-900 ring-2 ring-teal-500/30' : 'bg-purple-500 border-white dark:border-slate-900 ring-2 ring-purple-500/30')
                        : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900'
                    }`} />

                    <div className={`p-3.5 rounded-xl border transition-all ${
                      isLatest 
                        ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-250 dark:border-slate-700 shadow-xs' 
                        : 'bg-white dark:bg-slate-800/50 border-slate-200/90 dark:border-slate-700/60'
                    }`}>
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">日付</label>
                              <input 
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded text-xs font-medium text-slate-900 dark:text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">記入者</label>
                              <input 
                                type="text"
                                value={editAuthor}
                                onChange={(e) => setEditAuthor(e.target.value)}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded text-xs font-medium text-slate-900 dark:text-slate-100"
                              />
                            </div>
                          </div>
                          <textarea 
                            rows="3"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg text-xs leading-relaxed text-slate-900 dark:text-slate-100"
                          />
                          <div className="flex justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              キャンセル
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(log.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>更新</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 rounded">
                                <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-300" />
                                {log.date || '日付未設定'}
                              </span>
                              {log.author && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {log.author}
                                </span>
                              )}
                              {isLatest && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  最新
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(log)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                                title="この進捗を編集"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                                title="この進捗を削除"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-normal">
                            {log.text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !isAdding && (
              <div className="py-8 text-center space-y-2">
                <MessageSquareText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  進捗履歴はまだ登録されていません。
                </p>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>最初の進捗を記録する</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>全 {logs.length} 件の進捗ログ</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
