import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Calendar, 
  Star, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ChevronDown,
  Sparkles, 
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
  HelpCircle
} from 'lucide-react';
import { 
  PRIORITY_DEFINITIONS, 
  ENGAGEMENT_TYPES, 
  COLLAB_STATUS_OPTIONS, 
  REACHED_STAGE_OPTIONS,
  INVESTMENT_STATUS_OPTIONS,
  INVESTMENT_REACHED_STAGE_OPTIONS,
  INVESTMENT_CLOSE_REASONS,
  COLLAB_CLOSE_REASONS, 
  REVIVAL_FEASIBILITY_OPTIONS, 
  getCollabStatusColor,
  getInvestmentStatusColor,
  getEngagementTypeColor, 
  getRevivalColor 
} from './StartupList';

export default function StartupDetailModal({ 
  startup, 
  meetings, 
  onClose, 
  onUpdateStartup, 
  onDeleteStartup,
  currentUser,
  showToast
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPriorityGuideOpen, setIsPriorityGuideOpen] = useState(false);

  // Accordion Section States (Chevron toggle)
  const [isCollabSectionOpen, setIsCollabSectionOpen] = useState(
    startup.engagementType !== '投資検討'
  );
  const [isInvestmentSectionOpen, setIsInvestmentSectionOpen] = useState(
    startup.engagementType !== '事業連携'
  );

  // Form State (New Schema)
  const [editCompanyType, setEditCompanyType] = useState(startup.companyType || 'startup');
  const [editEngagementType, setEditEngagementType] = useState(startup.engagementType || '投資検討');
  const [editName, setEditName] = useState(startup.name || '');
  const [editCreatedAtDate, setEditCreatedAtDate] = useState(
    startup.createdAtDate ? String(startup.createdAtDate).replace(/\//g, '-') : new Date().toISOString().split('T')[0]
  );
  const [editSector, setEditSector] = useState(startup.sector || 'SaaS');
  const [editStage, setEditStage] = useState(startup.stage || 'Seed');
  const [editScore, setEditScore] = useState(Number(startup.score || 3));
  
  const getInitialLogs = (logsField, legacyText) => {
    if (Array.isArray(logsField) && logsField.length > 0) return logsField;
    if (legacyText && legacyText.trim()) {
      return [{
        id: `log_init_${Date.now()}`,
        date: startup.createdAtDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        author: startup.assignedMember || startup.pic || '担当者',
        text: legacyText.trim(),
        createdAt: new Date().toISOString()
      }];
    }
    return [];
  };

  // Collab fields
  const [editPartnerDept, setEditPartnerDept] = useState(startup.partnerDept || startup.internalPartnerDept || '');
  const [editCollabStatus, setEditCollabStatus] = useState(startup.collabStatus || '1 発掘');
  const [editReachedStage, setEditReachedStage] = useState(startup.reachedStage || '1 発掘');
  const [editCloseReason, setEditCloseReason] = useState(startup.closeReason || '');
  const [editRevivalFeasibility, setEditRevivalFeasibility] = useState(startup.revivalFeasibility || '');
  const [editRevivalScenario, setEditRevivalScenario] = useState(startup.revivalScenario || '');
  const [editBizDevLogs, setEditBizDevLogs] = useState(getInitialLogs(startup.bizDevLogs, startup.bizDevNotes));
  const [editBizDevNotes, setEditBizDevNotes] = useState(startup.bizDevNotes || '');
  const [editAssignedMember, setEditAssignedMember] = useState(startup.assignedMember || startup.pic || '');
  const [editBizDevStatus] = useState(startup.bizDevStatus || startup.collabStatus || '1 発掘');

  // Investment fields
  const [editInvestmentStatus, setEditInvestmentStatus] = useState(startup.status || startup.investmentStatus || '1 ソーシング');
  const [editInvestmentReachedStage, setEditInvestmentReachedStage] = useState(startup.investmentReachedStage || '1 ソーシング');
  const [editInvestmentCloseReason, setEditInvestmentCloseReason] = useState(startup.investmentCloseReason || '');
  const [editInvestmentRevivalFeasibility, setEditInvestmentRevivalFeasibility] = useState(startup.investmentRevivalFeasibility || startup.revivalFeasibility || '');
  const [editInvestmentRevivalScenario, setEditInvestmentRevivalScenario] = useState(startup.investmentRevivalScenario || startup.revivalScenario || '');
  const [editInvestmentLogs, setEditInvestmentLogs] = useState(getInitialLogs(startup.investmentLogs, startup.investmentMemo));
  const [editInvestmentMemo, setEditInvestmentMemo] = useState(startup.investmentMemo || '');
  const [editFunding, setEditFunding] = useState(startup.funding || '');
  const [showEditCollabSuggestions, setShowEditCollabSuggestions] = useState(false);
  const [showEditInvestSuggestions, setShowEditInvestSuggestions] = useState(false);

  // New inline log states for detail modal
  const [newBizDevLogText, setNewBizDevLogText] = useState('');
  const [newInvestLogText, setNewInvestLogText] = useState('');

  // Profile & Contact fields
  const [editContactPerson, setEditContactPerson] = useState(startup.contactPerson || '');
  const [editDealSource, setEditDealSource] = useState(startup.dealSource || 'VC / アクセラレーター紹介');
  const [editDealSourceDetail, setEditDealSourceDetail] = useState(startup.dealSourceDetail || '');
  const [editTagline, setEditTagline] = useState(startup.tagline || '');
  const [editWebsite, setEditWebsite] = useState(startup.website || '');
  const [editFoundedYear, setEditFoundedYear] = useState(startup.foundedYear || '');
  const [editLocation, setEditLocation] = useState(startup.location || '');

  // Inline Task Creation States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const dealSourceOptions = [
    "VC / アクセラレーター紹介",
    "銀行・証券会社紹介",
    "ピッチイベント・展示会",
    "直接コンタクト・Web応募",
    "社内事業部・役員紹介",
    "その他"
  ];

  const sectors = ['SaaS', 'AI / ML', 'Fintech', 'CleanTech', 'HealthTech', 'Robotics', 'IoT', 'Logistics', 'Mobility', 'Other'];
  const stages = ['Pre-Seed', 'Seed', 'Early', 'Series A', 'Series B', 'Series C+', 'Growth', 'N/A (一般企業)'];

  // Get historical meetings for this startup
  const startupMeetings = (meetings || [])
    .filter(m => m.startupId === startup.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Sync edits if startup prop changes
  useEffect(() => {
    setEditCompanyType(startup.companyType || 'startup');
    setEditEngagementType(startup.engagementType || '投資検討');
    setEditName(startup.name || '');
    setEditCreatedAtDate(startup.createdAtDate ? String(startup.createdAtDate).replace(/\//g, '-') : new Date().toISOString().split('T')[0]);
    setEditSector(startup.sector || 'SaaS');
    setEditStage(startup.stage || 'Seed');
    setEditScore(Number(startup.score || 3));
    setEditPartnerDept(startup.partnerDept || startup.internalPartnerDept || '');
    setEditCollabStatus(startup.collabStatus || '1 発掘');
    setEditReachedStage(startup.reachedStage || '1 発掘');
    setEditCloseReason(startup.closeReason || '');
    setEditRevivalFeasibility(startup.revivalFeasibility || '');
    setEditRevivalScenario(startup.revivalScenario || '');
    setEditBizDevLogs(getInitialLogs(startup.bizDevLogs, startup.bizDevNotes));
    setEditBizDevNotes(startup.bizDevNotes || '');
    setEditAssignedMember(startup.assignedMember || startup.pic || '');
    setEditInvestmentStatus(startup.status || startup.investmentStatus || '1 ソーシング');
    setEditInvestmentReachedStage(startup.investmentReachedStage || '1 ソーシング');
    setEditInvestmentCloseReason(startup.investmentCloseReason || '');
    setEditInvestmentRevivalFeasibility(startup.investmentRevivalFeasibility || startup.revivalFeasibility || '');
    setEditInvestmentRevivalScenario(startup.investmentRevivalScenario || startup.revivalScenario || '');
    setEditInvestmentLogs(getInitialLogs(startup.investmentLogs, startup.investmentMemo));
    setEditInvestmentMemo(startup.investmentMemo || '');
    setEditFunding(startup.funding || '');
    setEditContactPerson(startup.contactPerson || '');
    setEditDealSource(startup.dealSource || 'VC / アクセラレーター紹介');
    setEditDealSourceDetail(startup.dealSourceDetail || '');
    setEditTagline(startup.tagline || '');
    setEditWebsite(startup.website || '');
    setEditFoundedYear(startup.foundedYear || '');
    setEditLocation(startup.location || '');
  }, [startup]);

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
    if (showToast) showToast("ネクストステップをタスクに追加しました", "success");
  };

  // Save changes handler
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const latestBizDevText = editBizDevLogs.length > 0 ? editBizDevLogs[0].text : editBizDevNotes;
    const latestInvestText = editInvestmentLogs.length > 0 ? editInvestmentLogs[0].text : editInvestmentMemo;

    const updatedData = {
      ...startup,
      companyType: editCompanyType,
      engagementType: editEngagementType,
      name: editName,
      createdAtDate: editCreatedAtDate ? editCreatedAtDate.replace(/-/g, '/') : startup.createdAtDate,
      sector: editSector,
      stage: editStage,
      score: Number(editScore),
      partnerDept: editPartnerDept,
      internalPartnerDept: editPartnerDept,
      collabStatus: editCollabStatus,
      reachedStage: editReachedStage,
      closeReason: editCloseReason,
      revivalFeasibility: editRevivalFeasibility,
      revivalScenario: editRevivalScenario,
      status: editInvestmentStatus,
      investmentStatus: editInvestmentStatus,
      investmentReachedStage: editInvestmentReachedStage,
      investmentCloseReason: editInvestmentCloseReason,
      investmentRevivalFeasibility: editInvestmentRevivalFeasibility,
      investmentRevivalScenario: editInvestmentRevivalScenario,
      contactPerson: editContactPerson,
      dealSource: editDealSource,
      dealSourceDetail: editDealSourceDetail,
      tagline: editTagline,
      website: editWebsite,
      foundedYear: editFoundedYear,
      location: editLocation,
      funding: editFunding,
      investmentLogs: editInvestmentLogs,
      investmentMemo: latestInvestText,
      bizDevLogs: editBizDevLogs,
      bizDevNotes: latestBizDevText,
      assignedMember: editAssignedMember,
      bizDevStatus: editCollabStatus || editBizDevStatus
    };

    onUpdateStartup(startup.id, updatedData);
    setIsEditing(false);
    if (showToast) showToast("企業情報を更新・保存しました", "success");
  };

  // Delete handler
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${startup.name}? This will also disassociate meeting logs.`)) {
      onDeleteStartup(startup.id);
      showToast(`${startup.name} profile removed.`, "info");
      onClose();
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in-right">
        
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "企業情報の編集" : "企業詳細・協業パイプライン"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="企業情報を編集"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="企業データを削除"
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

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  🏢 基本プロファイル＆評価
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業区分 *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCompanyType('startup')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
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
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
                      editCompanyType === 'enterprise'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>🏢 一般企業</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">検討Type *</label>
                  <select 
                    value={editEngagementType}
                    onChange={(e) => setEditEngagementType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
                  >
                    {ENGAGEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業名 *</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">登録年月日 (登録日)</label>
                  <input 
                    type="date" 
                    value={editCreatedAtDate}
                    onChange={(e) => setEditCreatedAtDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">セクター</label>
                  <select 
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-sm transition-all"
                  >
                    {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1 p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                    <span>優先度評価 (1-5) *</span>
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
                        className="p-1 rounded hover:scale-110 transition-all"
                      >
                        <Star 
                          className={`h-6 w-6 ${val <= editScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium">
                    {PRIORITY_DEFINITIONS[editScore]?.desc}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. 🤝 協業・パイプライン管理 (Collapsible Accordion with Chevron) */}
            <div className="rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20 overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => setIsCollabSectionOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-4 bg-teal-50/80 hover:bg-teal-100/70 dark:bg-teal-950/40 dark:hover:bg-teal-950/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <Handshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200">
                    🤝 協業・事業連携パイプライン (BizDev Pipeline)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs ${getCollabStatusColor(editCollabStatus)}`}>
                    {editCollabStatus}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-teal-700 dark:text-teal-300 transition-transform duration-200 ${isCollabSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isCollabSectionOpen && (
                <div className="p-4 space-y-4 border-t border-teal-200/60 dark:border-teal-900/40 animate-fade-in">
                  {/* 🤝 事業開発進捗 タイムライン管理 (編集モード) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase flex items-center gap-1.5">
                        <span>🤝 事業開発進捗 (タイムライン履歴)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60 font-mono">
                          {editBizDevLogs.length}件
                        </span>
                      </label>
                    </div>

                    {/* 既存ログ一覧 */}
                    {editBizDevLogs.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {editBizDevLogs.map((log, idx) => (
                          <div key={log.id || idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/60 dark:border-teal-900/40 text-xs flex justify-between items-start gap-2 shadow-2xs">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="font-mono font-bold text-teal-700 dark:text-teal-300">📅 {log.date}</span>
                                <span className="text-slate-500 font-semibold">👤 {log.author || '担当者'}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{log.text}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("この進捗ログを削除しますか？")) {
                                  setEditBizDevLogs(prev => prev.filter((_, i) => i !== idx));
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                              title="進捗を削除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 新規進捗追記エリア */}
                    <div className="p-2.5 rounded-xl bg-teal-100/50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 space-y-2">
                      <textarea 
                        rows="2"
                        placeholder="新しい事業開発進捗を追記..." 
                        value={newBizDevLogText}
                        onChange={(e) => setNewBizDevLogText(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-xs transition-all resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newBizDevLogText.trim()) return;
                            const newEntry = {
                              id: `log_${Date.now()}_biz`,
                              date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                              author: currentUser?.displayName || currentUser?.email?.split('@')[0] || editAssignedMember || '担当者',
                              text: newBizDevLogText.trim(),
                              createdAt: new Date().toISOString()
                            };
                            setEditBizDevLogs(prev => [newEntry, ...prev]);
                            setNewBizDevLogText('');
                          }}
                          disabled={!newBizDevLogText.trim()}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1 min-h-[30px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>進捗を追記</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 担当者 (事業開発進捗の直後) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">担当者 (自社 / CVC / BizDev担当)</label>
                    <input 
                      type="text" 
                      placeholder="例: 田中 健二, 佐藤 美咲" 
                      value={editAssignedMember}
                      onChange={(e) => setEditAssignedMember(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業ステータス *</label>
                      <select 
                        value={editCollabStatus}
                        onChange={(e) => setEditCollabStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
                      >
                        {COLLAB_STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業部署 (自由記述)</label>
                      <input 
                        type="text" 
                        placeholder="例: DX推進部、物流事業本部第2課" 
                        value={editPartnerDept}
                        onChange={(e) => setEditPartnerDept(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業 到達ステージ</label>
                    <select 
                      value={editReachedStage}
                      onChange={(e) => setEditReachedStage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                    >
                      {REACHED_STAGE_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>

                  {/* 協業クローズ理由 (サジェスト付き) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">
                        協業 クローズ理由 (自由記述)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowEditCollabSuggestions(prev => !prev)}
                        className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{showEditCollabSuggestions ? '候補を閉じる' : '💡 候補から選ぶ'}</span>
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="例: 価格帯ミスマッチ、オンプレ要件不適合" 
                      value={editCloseReason}
                      onChange={(e) => setEditCloseReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                    {showEditCollabSuggestions && (
                      <div className="flex flex-wrap gap-1 p-2 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 rounded-xl animate-fade-in">
                        <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold w-full mb-0.5">クリックで入力:</span>
                        {COLLAB_CLOSE_REASONS.map(reason => (
                          <button
                            type="button"
                            key={reason}
                            onClick={() => {
                              setEditCloseReason(reason);
                              setShowEditCollabSuggestions(false);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white border border-teal-200 dark:border-teal-800 shadow-2xs transition-all"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 協業 復活シナリオ */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業 復活シナリオ (再アプローチ条件・トリガー)</label>
                    <input 
                      type="text" 
                      placeholder="例: 次世代SaaS版ローンチ時、事業部ニーズ発生時" 
                      value={editRevivalScenario}
                      onChange={(e) => setEditRevivalScenario(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  {/* 協業 復活可能性 (復活シナリオの次) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業 復活可能性</label>
                    <select 
                      value={editRevivalFeasibility}
                      onChange={(e) => setEditRevivalFeasibility(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                    >
                      <option value="">未設定</option>
                      {REVIVAL_FEASIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. 💳 投資・出資パイプライン管理 (Collapsible Accordion with Chevron) */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => setIsInvestmentSectionOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-4 bg-blue-50/80 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-200">
                    💳 投資・出資パイプライン (Investment Pipeline)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs ${getInvestmentStatusColor(editInvestmentStatus)}`}>
                    {editInvestmentStatus}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-blue-700 dark:text-blue-300 transition-transform duration-200 ${isInvestmentSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isInvestmentSectionOpen && (
                <div className="p-4 space-y-4 border-t border-blue-200/60 dark:border-blue-900/40 animate-fade-in">
                  {/* 💳 投資検討進捗 タイムライン管理 (編集モード) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase flex items-center gap-1.5">
                        <span>💳 投資検討進捗 (タイムライン履歴)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 font-mono">
                          {editInvestmentLogs.length}件
                        </span>
                      </label>
                    </div>

                    {/* 既存ログ一覧 */}
                    {editInvestmentLogs.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {editInvestmentLogs.map((log, idx) => (
                          <div key={log.id || idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-900/40 text-xs flex justify-between items-start gap-2 shadow-2xs">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="font-mono font-bold text-blue-700 dark:text-blue-300">📅 {log.date}</span>
                                <span className="text-slate-500 font-semibold">👤 {log.author || '担当者'}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{log.text}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("この進捗ログを削除しますか？")) {
                                  setEditInvestmentLogs(prev => prev.filter((_, i) => i !== idx));
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                              title="進捗を削除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 新規進捗追記エリア */}
                    <div className="p-2.5 rounded-xl bg-blue-100/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                      <textarea 
                        rows="2"
                        placeholder="新しい投資検討進捗・DD所見を追記..." 
                        value={newInvestLogText}
                        onChange={(e) => setNewInvestLogText(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-xs transition-all resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newInvestLogText.trim()) return;
                            const newEntry = {
                              id: `log_${Date.now()}_inv`,
                              date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                              author: currentUser?.displayName || currentUser?.email?.split('@')[0] || editAssignedMember || '担当者',
                              text: newInvestLogText.trim(),
                              createdAt: new Date().toISOString()
                            };
                            setEditInvestmentLogs(prev => [newEntry, ...prev]);
                            setNewInvestLogText('');
                          }}
                          disabled={!newInvestLogText.trim()}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1 min-h-[30px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>進捗を追記</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資ステータス *</label>
                      <select 
                        value={editInvestmentStatus}
                        onChange={(e) => setEditInvestmentStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
                      >
                        {INVESTMENT_STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資 到達ステージ</label>
                      <select 
                        value={editInvestmentReachedStage}
                        onChange={(e) => setEditInvestmentReachedStage(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                      >
                        {INVESTMENT_REACHED_STAGE_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">
                        投資 見送り・クローズ理由 (自由記述)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowEditInvestSuggestions(prev => !prev)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{showEditInvestSuggestions ? '候補を閉じる' : '💡 候補から選ぶ'}</span>
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="例: Valuation目線不一致、競合優位性不足" 
                      value={editInvestmentCloseReason}
                      onChange={(e) => setEditInvestmentCloseReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                    {showEditInvestSuggestions && (
                      <div className="flex flex-wrap gap-1 p-2 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl animate-fade-in">
                        <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold w-full mb-0.5">クリックで入力:</span>
                        {INVESTMENT_CLOSE_REASONS.map(reason => (
                          <button
                            type="button"
                            key={reason}
                            onClick={() => {
                              setEditInvestmentCloseReason(reason);
                              setShowEditInvestSuggestions(false);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-800 shadow-2xs transition-all"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">次回検討トリガー・復活シナリオ</label>
                      <input 
                        type="text" 
                        placeholder="例: シリーズB調達時、ARR 1億円達成時" 
                        value={editInvestmentRevivalScenario}
                        onChange={(e) => setEditInvestmentRevivalScenario(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資 復活可能性</label>
                      <select 
                        value={editInvestmentRevivalFeasibility}
                        onChange={(e) => setEditInvestmentRevivalFeasibility(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                      >
                        <option value="">未設定</option>
                        {REVIVAL_FEASIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  📋 詳細プロファイル・連絡先
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">窓口担当者 (氏名・役職・連絡先)</label>
                  <input 
                    type="text" 
                    placeholder="例: 山田 太郎 (代表取締役 / yamada@example.com)" 
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">案件流入元</label>
                  <select 
                    value={editDealSource}
                    onChange={(e) => setEditDealSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-sm transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">調達ステージ</label>
                  <select 
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-sm transition-all"
                  >
                    {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">設立年</label>
                  <input 
                    type="text" 
                    value={editFoundedYear}
                    onChange={(e) => setEditFoundedYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">拠点</label>
                  <input 
                    type="text" 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Webサイト URL</label>
                <input 
                  type="url" 
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">事業概要（タグライン）</label>
                <input 
                  type="text" 
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                />
              </div>

              {/* 資金調達状況 (詳細プロファイルへ移動) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">資金調達履歴 (ラウンド / 評価額 / 引受先)</label>
                <textarea 
                  rows="2"
                  placeholder="例: Series A 5億円 (2024/01) リード: 〇〇キャピタル" 
                  value={editFunding}
                  onChange={(e) => setEditFunding(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-all min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all flex items-center space-x-1.5 min-h-[44px]"
              >
                <Save className="h-4 w-4" />
                <span>保存する</span>
              </button>
            </div>
          </form>
        ) : (
          /* Detailed View Mode */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header: Name, Type, Rating Stars, and Stage */}
            <div className="flex flex-col space-y-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getEngagementTypeColor(startup.engagementType || '投資検討')}`}>
                    {startup.engagementType || '投資検討'}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    No.{startup.no}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    登録: {startup.createdAtDate || '2026/08/01'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPriorityGuideOpen(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${PRIORITY_DEFINITIONS[startup.score]?.bg}`}
                  >
                    <span>{PRIORITY_DEFINITIONS[startup.score]?.label}</span>
                    <HelpCircle className="h-3 w-3 opacity-70" />
                  </button>
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

              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{startup.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
                    {startup.stage}
                  </span>
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed mt-1">
                  {startup.tagline}
                </p>
              </div>
            </div>

            {/* 1. 🤝 協業・パイプライン進捗 Card (Collapsible Accordion with Chevron) */}
            <div className="rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => setIsCollabSectionOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-4 bg-teal-50/80 hover:bg-teal-100/70 dark:bg-teal-950/40 dark:hover:bg-teal-950/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <Handshake className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-200">
                    🤝 協業・事業連携進捗 (BizDev Pipeline)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs ${getCollabStatusColor(startup.collabStatus || '1 発掘')}`}>
                    {startup.collabStatus || '1 発掘'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-teal-700 dark:text-teal-300 transition-transform duration-200 ${isCollabSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isCollabSectionOpen && (
                <div className="p-4 space-y-3.5 border-t border-teal-200/60 dark:border-teal-900/40 animate-fade-in text-xs">
                  {/* 🤝 事業開発進捗 (タイムライン履歴＆即時追記) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase flex items-center gap-1">
                        <span>🤝 事業開発進捗 (タイムライン)</span>
                        <span className="font-mono px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60">
                          {editBizDevLogs.length}件
                        </span>
                      </span>
                    </div>

                    {/* タイムラインリスト */}
                    {editBizDevLogs.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {editBizDevLogs.map((log, idx) => (
                          <div key={log.id || idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/60 dark:border-teal-900/40 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-teal-700 dark:text-teal-300">📅 {log.date}</span>
                              <span className="text-slate-500 font-semibold">👤 {log.author || '担当者'}</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{log.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px] py-1">進捗ログはまだ登録されていません。</p>
                    )}

                    {/* クイック追記フォーム */}
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 space-y-1.5">
                      <textarea 
                        rows="2"
                        placeholder="＋ 事業開発進捗を追記..." 
                        value={newBizDevLogText}
                        onChange={(e) => setNewBizDevLogText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100 text-xs transition-all resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddBizDevLogInline}
                          disabled={!newBizDevLogText.trim()}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1 min-h-[28px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>進捗を追記</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 担当者 (自社 / CVC / BizDev担当) */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">担当者 (自社 / CVC担当)</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {startup.assignedMember || startup.pic || '未設定'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">協業部署</span>
                      <p className="font-bold text-teal-800 dark:text-teal-300 text-sm mt-0.5">
                        {startup.partnerDept || startup.internalPartnerDept || '未設定'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">最高到達ステージ (Reached Stage)</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                        {startup.reachedStage || '未設定'}
                      </p>
                    </div>
                  </div>

                  {startup.closeReason && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">協業クローズ / 見送り理由</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                        {startup.closeReason}
                      </p>
                    </div>
                  )}

                  {startup.revivalScenario && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">協業 復活シナリオ（再アプローチ条件・トリガー）</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                        {startup.revivalScenario}
                      </p>
                    </div>
                  )}

                  {/* 復活可能性 (復活シナリオの次) */}
                  {startup.revivalFeasibility && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">協業 復活可能性</span>
                      <div className="mt-0.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${getRevivalColor(startup.revivalFeasibility)}`}>
                          {startup.revivalFeasibility}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. 💳 投資・出資パイプライン進捗 Card (Collapsible Accordion with Chevron) */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 overflow-hidden shadow-xs transition-all">
              <button
                type="button"
                onClick={() => setIsInvestmentSectionOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-4 bg-blue-50/80 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-200">
                    💳 投資・出資パイプライン進捗 (Investment Pipeline)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs ${getInvestmentStatusColor(startup.status || startup.investmentStatus || '1 ソーシング')}`}>
                    {startup.status || startup.investmentStatus || '1 ソーシング'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-blue-700 dark:text-blue-300 transition-transform duration-200 ${isInvestmentSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isInvestmentSectionOpen && (
                <div className="p-4 space-y-3.5 border-t border-blue-200/60 dark:border-blue-900/40 animate-fade-in text-xs">
                  {/* 💳 投資検討進捗 (タイムライン履歴＆即時追記) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase flex items-center gap-1">
                        <span>💳 投資検討進捗 (タイムライン)</span>
                        <span className="font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60">
                          {editInvestmentLogs.length}件
                        </span>
                      </span>
                    </div>

                    {/* タイムラインリスト */}
                    {editInvestmentLogs.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {editInvestmentLogs.map((log, idx) => (
                          <div key={log.id || idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-900/40 shadow-2xs space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">📅 {log.date}</span>
                              <span className="text-slate-500 font-semibold">👤 {log.author || '担当者'}</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{log.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px] py-1">進捗ログはまだ登録されていません。</p>
                    )}

                    {/* クイック追記フォーム */}
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
                      <textarea 
                        rows="2"
                        placeholder="＋ 投資検討進捗・所見を追記..." 
                        value={newInvestLogText}
                        onChange={(e) => setNewInvestLogText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100 text-xs transition-all resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddInvestLogInline}
                          disabled={!newInvestLogText.trim()}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1 min-h-[28px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>進捗を追記</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">調達ステージ</span>
                      <p className="font-bold text-blue-800 dark:text-blue-300 text-sm mt-0.5">
                        {startup.stage || '未設定'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">投資 到達ステージ</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                        {startup.investmentReachedStage || '未設定'}
                      </p>
                    </div>
                  </div>

                  {startup.investmentCloseReason && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">投資 見送り・クローズ理由</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                        {startup.investmentCloseReason}
                      </p>
                    </div>
                  )}

                  {startup.investmentRevivalScenario && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">次回検討トリガー・復活シナリオ</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                        {startup.investmentRevivalScenario}
                      </p>
                    </div>
                  )}

                  {(startup.investmentRevivalFeasibility || (!startup.isCollabOnly && startup.revivalFeasibility)) && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">投資 復活可能性</span>
                      <div className="mt-0.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${getRevivalColor(startup.investmentRevivalFeasibility || startup.revivalFeasibility)}`}>
                          {startup.investmentRevivalFeasibility || startup.revivalFeasibility}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. 📋 タスク・TODO管理 Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ListTodo className="h-4 w-4 text-indigo-500" />
                  タスク・アクション管理 ({currentTasks.filter(t => !t.completed).length}件未完)
                </span>
                {!isAddingTask && (
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(true)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>タスク追加</span>
                  </button>
                )}
              </div>

              {/* Inline Task Form */}
              {isAddingTask && (
                <form onSubmit={handleAddTask} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-2.5 animate-fade-in">
                  <input
                    type="text"
                    required
                    placeholder="タスク内容を入力 (例: 次回PoC提案書の作成)..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="担当者 (任意)"
                      value={newTaskAssignedTo}
                      onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      追加
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentTasks.length > 0 ? (
                  currentTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        task.completed 
                          ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center space-x-2 overflow-hidden mr-2">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {task.completed ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4" />}
                        </button>
                        <span className="truncate">{task.title}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 text-[10px] text-slate-400">
                        {task.dueDate && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {task.dueDate}
                          </span>
                        )}
                        {task.assignedTo && (
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                            {task.assignedTo}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                          title="タスク削除"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
                    登録されているタスクはありません。
                  </p>
                )}
              </div>
            </div>

            {/* 4. 🏢 企業詳細プロファイル Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                🏢 企業詳細プロファイル
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {startup.contactPerson && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">窓口担当者</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{startup.contactPerson}</span>
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">セクター / 拠点</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {startup.sector} / {startup.location} {startup.foundedYear ? `(${startup.foundedYear}設立)` : ''}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">案件流入元</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {startup.dealSource || '未設定'}
                    {startup.dealSourceDetail ? ` (${startup.dealSourceDetail})` : ''}
                  </p>
                </div>

                {startup.website && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Webサイト</span>
                    <p className="mt-0.5">
                      <a 
                        href={startup.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span className="truncate">{startup.website}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {/* 資金調達状況 (詳細プロファイルへ移動) */}
              {startup.funding && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">資金調達履歴</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50/60 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 whitespace-pre-wrap">
                    {startup.funding}
                  </p>
                </div>
              )}
            </div>

            {/* 5. 📝 過去の面談ログ＆AI要約 Card */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                過去の面談履歴 ({startupMeetings.length}件)
              </span>

              {startupMeetings.length > 0 ? (
                <div className="space-y-3">
                  {startupMeetings.map((meeting) => (
                    <div 
                      key={meeting.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-white">{meeting.date}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                            {meeting.purpose}
                          </span>
                        </div>
                        {meeting.attendees && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {Array.isArray(meeting.attendees) ? meeting.attendees.join(", ") : meeting.attendees}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-650 dark:text-slate-350 leading-relaxed">
                        {meeting.notes}
                      </p>

                      {meeting.nextStep && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            Next: {meeting.nextStep}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCreateTaskFromNextStep(meeting.nextStep)}
                            className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 font-bold transition-all"
                          >
                            + タスク化
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                  面談ログはまだ登録されていません。
                </p>
              )}
            </div>

            {/* Modal Footer with Updated Audit Trail */}
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

      {/* 🌟 優先度定義ガイドモーダル */}
      {isPriorityGuideOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
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
                    案件検討・リソース配分の指針となる5段階優先度基準
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
