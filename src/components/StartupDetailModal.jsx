import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  MapPin, 
  Calendar, 
  Star, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Layers, 
  Save, 
  Briefcase, 
  Handshake,
  CheckSquare,
  Square,
  Plus,
  Clock,
  UserCheck,
  ListTodo,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import VoiceInputButton from './VoiceInputButton';
import { PRIORITY_DEFINITIONS } from './StartupList';

export default function StartupDetailModal({ 
  startup, 
  meetings, 
  onClose, 
  onUpdateStartup, 
  onDeleteStartup,
  showToast
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPriorityGuideOpen, setIsPriorityGuideOpen] = useState(false);

  // Form State
  const [editCompanyType, setEditCompanyType] = useState(startup.companyType || 'startup');
  const [editName, setEditName] = useState(startup.name);
  const [editCreatedAtDate, setEditCreatedAtDate] = useState(
    startup.createdAtDate ? String(startup.createdAtDate).replace(/\//g, '-') : new Date().toISOString().split('T')[0]
  );
  const [editSector, setEditSector] = useState(startup.sector);
  const [editStage, setEditStage] = useState(startup.stage);
  const [editDealSource, setEditDealSource] = useState(startup.dealSource || 'VC / アクセラレーター紹介');
  const [editDealSourceDetail, setEditDealSourceDetail] = useState(startup.dealSourceDetail || '');
  const [editInternalPartnerDept, setEditInternalPartnerDept] = useState(startup.internalPartnerDept || '');
  const [editStatus, setEditStatus] = useState(startup.status);
  const [editBizDevStatus, setEditBizDevStatus] = useState(startup.bizDevStatus || 'Not Started / N/A (未着手 / 対象外)');
  const [editScore, setEditScore] = useState(startup.score);
  const [editContactPerson, setEditContactPerson] = useState(startup.contactPerson || '');
  const [editTagline, setEditTagline] = useState(startup.tagline);
  const [editWebsite, setEditWebsite] = useState(startup.website);
  const [editFoundedYear, setEditFoundedYear] = useState(startup.foundedYear || '');
  const [editLocation, setEditLocation] = useState(startup.location);
  const [editFunding, setEditFunding] = useState(startup.funding || '');
  const [editInvestmentMemo, setEditInvestmentMemo] = useState(startup.investmentMemo || '');
  const [editBizDevNotes, setEditBizDevNotes] = useState(startup.bizDevNotes || '');

  // Inline Task Creation States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const dealSourceOptions = [
    "VC / アクセラレーター紹介",
    "展示会・ピッチイベント",
    "社内事業部からの推薦",
    "直アプローチ (Outbound)",
    "Web問合せ / 自主応募",
    "その他"
  ];

  const sectors = ["AI", "SaaS / Enterprise", "Fintech", "Healthtech", "ClimateTech", "Logistics / Mobility", "Retail / Commerce", "HRTech", "Web3 / Crypto", "Others"];
  const stages = ["Seed", "Pre-A", "Series-A", "Series-B", "Series-C+", "N/A (一般企業)"];
  
  const investmentStatuses = [
    "Sourcing (ソーシング)",
    "Initial Meeting (初回面談済)",
    "Deep Review (詳細検討中)",
    "Due Diligence (DD実施中)",
    "Investment Committee (投資委員会)",
    "Invested (Portfolio) (投資実行済 / ポートフォリオ)",
    "Passed / On Hold (見送り / 保留)"
  ];

  const bizDevStatuses = [
    "Not Started / N/A (未着手 / 対象外)",
    "Sourcing (ソーシング)",
    "Initial Meeting (初回面談済)",
    "Collaboration Review (協業検討中)",
    "POC Consideration (POC検討中)",
    "POC Executing (POC実施中)",
    "POC Completed (POC実施済)",
    "Commercialized (事業化・提携済)"
  ];

  // Get historical meetings for this startup
  const startupMeetings = meetings
    .filter(m => m.startupId === startup.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Current tasks list
  const currentTasks = startup.tasks || [];

  // Task Actions
  const handleToggleTask = (taskId) => {
    const updatedTasks = currentTasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString().split('T')[0] : null } : t
    );
    const updatedStartup = { ...startup, tasks: updatedTasks };
    onUpdateStartup(startup.id, updatedStartup);
    if (showToast) showToast("タスクの状態を更新しました", "info");
  };

  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || '',
      assignedTo: newTaskAssignedTo.trim() || '',
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedTasks = [...currentTasks, newTask];
    const updatedStartup = { ...startup, tasks: updatedTasks };
    onUpdateStartup(startup.id, updatedStartup);

    // Reset task form
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskAssignedTo('');
    setIsAddingTask(false);
    if (showToast) showToast("新しいタスクを追加しました", "success");
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = currentTasks.filter(t => t.id !== taskId);
    const updatedStartup = { ...startup, tasks: updatedTasks };
    onUpdateStartup(startup.id, updatedStartup);
    if (showToast) showToast("タスクを削除しました", "info");
  };

  const handleCreateTaskFromNextStep = (nextStepText) => {
    if (!nextStepText) return;
    const newTask = {
      id: `task_${Date.now()}`,
      title: nextStepText,
      dueDate: '',
      assignedTo: '',
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updatedTasks = [...currentTasks, newTask];
    const updatedStartup = { ...startup, tasks: updatedTasks };
    onUpdateStartup(startup.id, updatedStartup);
    if (showToast) showToast("面談のNext Stepをタスクに追加しました", "success");
  };

  // Save changes handler
  const handleSave = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedStartup = {
      ...startup,
      companyType: editCompanyType,
      name: editName.trim(),
      sector: editSector,
      stage: editStage,
      dealSource: editDealSource,
      dealSourceDetail: editDealSourceDetail.trim(),
      internalPartnerDept: editInternalPartnerDept.trim(),
      status: editStatus,
      bizDevStatus: editBizDevStatus,
      score: Number(editScore),
      contactPerson: editContactPerson.trim(),
      tagline: editTagline.trim(),
      website: editWebsite.trim(),
      foundedYear: editFoundedYear.trim(),
      location: editLocation.trim(),
      funding: editFunding.trim(),
      investmentMemo: editInvestmentMemo.trim(),
      bizDevNotes: editBizDevNotes.trim()
    };

    onUpdateStartup(startup.id, updatedStartup);
    setIsEditing(false);
    if (showToast) showToast("企業プロファイルを更新しました", "success");
  };

  // Delete handler
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${startup.name}? This will also disassociate meeting logs.`)) {
      onDeleteStartup(startup.id);
      showToast(`${startup.name} profile removed.`, "info");
      onClose();
    }
  };

  const getInvestmentStatusColor = (status) => {
    const s = String(status || '');
    if (s.includes("Sourcing")) return "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-350";
    if (s.includes("Initial")) return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30";
    if (s.includes("Review") || s.includes("詳細検討")) return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100/50 dark:border-amber-900/30";
    if (s.includes("DD") || s.includes("Diligence")) return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100/50 dark:border-purple-900/30";
    if (s.includes("Committee")) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30";
    if (s.includes("Invested") || s.includes("Portfolio")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/30";
    if (s.includes("Passed") || s.includes("見送り")) return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-100/50 dark:border-rose-900/30";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  const getBizDevStatusColor = (status) => {
    const s = String(status || '');
    if (!status || s.includes("Not Started") || s.includes("未着手")) return "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400";
    if (s.includes("Collaboration Review") || s.includes("協業検討")) return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100/50 dark:border-sky-900/30";
    if (s.includes("POC Consideration") || s.includes("POC検討")) return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-100/50 dark:border-cyan-900/30";
    if (s.includes("POC Executing") || s.includes("POC実施中")) return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-100/50 dark:border-teal-900/30";
    if (s.includes("POC Completed") || s.includes("POC実施済")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/30";
    if (s.includes("Commercialized") || s.includes("事業化")) return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-100/50 dark:border-violet-900/30";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-850 flex flex-col animate-slide-in-right">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "スタートアップ情報の編集" : "スタートアップ詳細・プロファイル"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Edit Startup"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Delete Startup"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {isEditing ? (
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. 基本プロファイル */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  🏢 基本プロファイル＆評価
                </span>
              </div>

              {/* Company Type Selection Radio Group */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業区分 *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCompanyType('startup')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      editCompanyType === 'startup'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>🚀 スタートアップ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditCompanyType('enterprise')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      editCompanyType === 'enterprise'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>🏢 一般企業・パートナー企業</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業名 *</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">登録年月日 (登録日)</label>
                <input 
                  type="date" 
                  value={editCreatedAtDate}
                  onChange={(e) => setEditCreatedAtDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">セクター</label>
                <select 
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                >
                  {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">調達ステージ</label>
                <select 
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                >
                  {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">案件流入元</label>
                <select 
                  value={editDealSource}
                  onChange={(e) => setEditDealSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                >
                  {dealSourceOptions.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">案件流入元・詳細 (自由記述)</label>
                <input 
                  type="text" 
                  placeholder="例: ジャフコ金子様紹介" 
                  value={editDealSourceDetail}
                  onChange={(e) => setEditDealSourceDetail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">窓口担当者 (氏名・役職・連絡先)</label>
                <input 
                  type="text" 
                  placeholder="例: 山田 太郎 (代表取締役 / yamada@example.com)" 
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              <div className="space-y-1 md:col-span-2 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase flex items-center gap-1">
                    <span>優先度評価 (1-5)</span>
                    <button
                      type="button"
                      onClick={() => setIsPriorityGuideOpen(true)}
                      className="text-amber-500 hover:text-amber-600 ml-1"
                      title="優先度の定義を見る"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </label>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${PRIORITY_DEFINITIONS[editScore]?.bg}`}>
                    ★{editScore}: {PRIORITY_DEFINITIONS[editScore]?.label}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setEditScore(val)}
                        className="p-1 rounded hover:scale-110 text-slate-300 dark:text-slate-700 transition-all focus:outline-none"
                        title={`★${val}: ${PRIORITY_DEFINITIONS[val]?.label}`}
                      >
                        <Star 
                          className={`h-6 w-6 ${val <= editScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {PRIORITY_DEFINITIONS[editScore]?.desc}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">設立年</label>
                <input 
                  type="text" 
                  value={editFoundedYear}
                  onChange={(e) => setEditFoundedYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">拠点</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Webサイト URL</label>
                <input 
                  type="url" 
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">事業概要（タグライン）</label>
                <VoiceInputButton onTranscript={(text) => setEditTagline(prev => prev ? `${prev} ${text}` : text)} />
              </div>
              <input 
                type="text" 
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">資金調達履歴</label>
              <textarea 
                rows="2"
                placeholder="例: シードラウンドで1,500万を調達。主要投資家：グローバル・ブレイン。"
                value={editFunding}
                onChange={(e) => setEditFunding(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
              />
            </div>
            </div>

            {/* 2. 💳 投資検討トラック */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-blue-200/50 dark:border-blue-900/50 pb-2">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  💳 投資検討トラック (Investment Track)
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資ステータス</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                >
                  {investmentStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資検討メモ (投資トラック)</label>
                  <VoiceInputButton onTranscript={(text) => setEditInvestmentMemo(prev => prev ? `${prev}\n${text}` : text)} />
                </div>
                <textarea 
                  rows="2"
                  placeholder="例: 当社の投資基準に合致。DD結果良好につき投資委員会へ提出予定。"
                  value={editInvestmentMemo}
                  onChange={(e) => setEditInvestmentMemo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                />
              </div>
            </div>

            {/* 3. 🤝 事業開発・PoC協業トラック */}
            <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-teal-200/50 dark:border-teal-900/50 pb-2">
                <Handshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  🤝 事業開発・PoC協業トラック (BizDev & PoC Track)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業・PoC協業ステータス</label>
                  <select 
                    value={editBizDevStatus}
                    onChange={(e) => setEditBizDevStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                  >
                    {bizDevStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">社内連携先（事業部・部署名）</label>
                  <input 
                    type="text" 
                    placeholder="例: DX推進部、生産技術部第2課" 
                    value={editInternalPartnerDept}
                    onChange={(e) => setEditInternalPartnerDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業開発・PoC協業メモ / シナジー検討 (事業トラック)</label>
                  <VoiceInputButton onTranscript={(text) => setEditBizDevNotes(prev => prev ? `${prev}\n${text}` : text)} />
                </div>
                <textarea 
                  rows="3"
                  placeholder="例: ◯◯事業部と共同PoC検討中。2026年Q3開始目標。"
                  value={editBizDevNotes}
                  onChange={(e) => setEditBizDevNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                />
              </div>
            </div>

            {/* Save Buttons (Min 44x44px target) */}
            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 transition-all min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all min-h-[44px]"
              >
                <Save className="h-4.5 w-4.5" />
                <span>保存する</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Startup Banner Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
                    {startup.stage}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{startup.name}</h1>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${getInvestmentStatusColor(startup.status)}`}>
                    投資: {startup.status?.split(" (")?.[0]}
                  </span>
                  {startup.bizDevStatus && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${getBizDevStatusColor(startup.bizDevStatus)}`}>
                      事業: {startup.bizDevStatus?.split(" (")?.[0]}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-350 italic">
                "{startup.tagline}"
              </p>

              {/* Quick links & location & contact */}
              <div className="flex flex-wrap gap-y-2 gap-x-4 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {startup.website && (
                  <a 
                    href={startup.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center space-x-1.5 text-blue-650 hover:underline dark:text-blue-400 min-h-[40px]"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{startup.website}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex items-center space-x-1.5 py-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>設立: {startup.foundedYear || '未登録'} / 拠点: {startup.location}</span>
                </div>
                {startup.dealSource && (
                  <div className="flex items-center space-x-1.5 py-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>💡 流入元: {startup.dealSource} {startup.dealSourceDetail ? `(${startup.dealSourceDetail})` : ''}</span>
                  </div>
                )}
                {startup.contactPerson && (
                  <div className="flex items-center space-x-1.5 py-2 text-slate-700 dark:text-slate-300 font-semibold bg-slate-100/70 dark:bg-slate-800/60 px-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                    <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>窓口担当者: {startup.contactPerson}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 📋 Tasks & Action Items Section (New Feature) */}
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    タスク・アクションアイテム ({currentTasks.filter(t => !t.completed).length}件 未完了)
                  </h3>
                </div>

                {!isAddingTask && (
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(true)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all min-h-[36px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>タスク追加</span>
                  </button>
                )}
              </div>

              {/* Add Task Inline Form */}
              {isAddingTask && (
                <form onSubmit={handleAddTask} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm space-y-3 animate-fade-in">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300">新しいタスクの登録</div>
                  <input
                    type="text"
                    placeholder="タスク内容を入力 (例: NDAドラフト作成、事業部紹介アポ設定)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">期日</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">担当者 (任意)</label>
                      <input
                        type="text"
                        placeholder="例: 田中、法務部"
                        value={newTaskAssignedTo}
                        onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      追加
                    </button>
                  </div>
                </form>
              )}

              {/* Task List */}
              {currentTasks.length > 0 ? (
                <div className="space-y-2">
                  {currentTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                        task.completed
                          ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                          title={task.completed ? "未完了に戻す" : "完了にする"}
                        >
                          {task.completed ? (
                            <CheckSquare className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="h-4.5 w-4.5" />
                          )}
                        </button>

                        <div className="space-y-1 flex-1">
                          <p className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                            {task.dueDate && (
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-medium ${
                                !task.completed && new Date(task.dueDate) < new Date(new Date().toDateString())
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}>
                                <Clock className="h-3 w-3" />
                                <span>期日: {task.dueDate}</span>
                              </span>
                            )}
                            {task.assignedTo && (
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">
                                担当: {task.assignedTo}
                              </span>
                            )}
                            {task.completed && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" /> 完了済
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-350 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded-lg transition-colors ml-2"
                        title="タスク削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 rounded-xl border border-dashed border-blue-200/60 dark:border-blue-900/40 text-slate-400 text-xs">
                  現在設定されているタスクはありません。「タスク追加」からTODOを登録できます。
                </div>
              )}
            </div>

            {/* Structured Stats & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Sector & Priority Rating */}
              <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">デュアルトラック・進捗スペック</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">セクター:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{startup.sector}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                      <Briefcase className="h-3 w-3 mr-1 text-blue-500" /> 投資フェーズ:
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${getInvestmentStatusColor(startup.status)}`}>
                      {startup.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                      <Handshake className="h-3 w-3 mr-1 text-teal-500" /> 事業・PoC:
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${getBizDevStatusColor(startup.bizDevStatus)}`}>
                      {startup.bizDevStatus || "未着手"}
                    </span>
                  </div>

                  {startup.internalPartnerDept && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/40 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">社内連携先:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">🤝 {startup.internalPartnerDept}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/40 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span>優先度評価:</span>
                      <button
                        type="button"
                        onClick={() => setIsPriorityGuideOpen(true)}
                        className="text-amber-500 hover:text-amber-600"
                        title="優先度の定義を見る"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${PRIORITY_DEFINITIONS[startup.score]?.bg}`}>
                        ★{startup.score} {PRIORITY_DEFINITIONS[startup.score]?.label}
                      </span>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < startup.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funding history summary card */}
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/20">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">💳 資金調達履歴</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {startup.funding || "資金調達履歴はまだ登録されていません。"}
                </p>
              </div>

              {/* Investment memo summary card */}
              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/20">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">📝 投資検討メモ (投資トラック)</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {startup.investmentMemo || "投資検討メモはまだ登録されていません。"}
                </p>
              </div>

              {/* BizDev summary card */}
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20 md:col-span-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">🤝 事業開発＆PoC協業メモ (事業トラック)</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {startup.bizDevNotes || "事業・PoC協業メモはまだ登録されていません。"}
                </p>
              </div>

            </div>

            {/* Historically Linked Meeting Notes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">過去の面談履歴 ({startupMeetings.length})</h3>
              </div>

              {startupMeetings.length > 0 ? (
                <div className="space-y-4">
                  {startupMeetings.map((meeting, index) => (
                    <div 
                      key={meeting.id} 
                      className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{meeting.date}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30">
                            {meeting.purpose}
                          </span>
                        </div>
                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            同席者: {meeting.attendees.join(', ')}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                        {meeting.notes}
                      </p>

                      {meeting.nextStep && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center">
                            <ChevronRight className="h-3.5 w-3.5 text-blue-500 mr-1 shrink-0" />
                            <span>Next: {meeting.nextStep}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCreateTaskFromNextStep(meeting.nextStep)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold shadow-xs transition-all shrink-0 ml-2"
                            title="このNext Stepをタスク一覧に登録する"
                          >
                            <Plus className="h-3 w-3" />
                            <span>タスクに追加</span>
                          </button>
                        </div>
                      )}

                      {/* Render AI Synergy Brief inside history if available */}
                      {meeting.aiBrief && (
                        <div className="mt-3 p-4 rounded-lg bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/25 space-y-3">
                          <div className="flex items-center space-x-1.5 text-purple-700 dark:text-purple-400">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Gemini AI シナジー評価</span>
                          </div>

                          <div className="space-y-2 text-[11px] leading-relaxed">
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-500 dark:text-slate-450">事業モデル要約:</span>
                              <ul className="list-disc pl-4 space-y-0.5 text-slate-650 dark:text-slate-350 font-medium">
                                {meeting.aiBrief.summary?.map((b, i) => <li key={i}>{b}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-500 dark:text-slate-450">強みとリスク:</span>
                              <p className="text-slate-650 dark:text-slate-350 font-medium">{meeting.aiBrief.strengths_and_bottlenecks}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-500 dark:text-slate-450">事業会社シナジー案:</span>
                              <p className="text-slate-700 dark:text-slate-200 font-semibold">{meeting.aiBrief.cvc_synergy}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-xs">
                  <Info className="h-5 w-5 mx-auto mb-1.5 text-slate-350 dark:text-slate-800" />
                  このスタートアップの面談ログはまだ登録されていません。
                </div>
              )}

            </div>

            {/* Modal Footer with Updated Audit Trail Stamp */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span>🕒 最終更新:</span>
                <span className="font-semibold text-slate-600 dark:text-slate-350">{startup.updatedAt || startup.createdAt || '記録なし'}</span>
                {startup.updatedBy && (
                  <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold ml-1">
                    担当: {startup.updatedBy}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
              >
                閉じる
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 🌟 優先度定義ガイドモーダル (Priority Guide Modal) */}
      {isPriorityGuideOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    優先度評価（★1〜★5）の定義と判断基準
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    案件検討・フォローの指針となる5段階優先度
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsPriorityGuideOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Priority Cards */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {[5, 4, 3, 2, 1].map((level) => {
                const item = PRIORITY_DEFINITIONS[level];
                return (
                  <div 
                    key={level} 
                    className={`p-4 rounded-2xl border transition-all ${item.bg}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-black px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                          ★ {level}
                        </span>
                        <h3 className="font-bold text-sm">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < level ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs opacity-90 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPriorityGuideOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-all shadow-xs"
              >
                閉じる
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
