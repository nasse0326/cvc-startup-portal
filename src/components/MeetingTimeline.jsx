import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  FileText,
  Filter,
  Search,
  Download,
  X,
  Edit3
} from 'lucide-react';
import { analyzeMeetingNotes } from '../services/gemini';
import { exportMeetingsToCSV } from '../services/exportCsv';
import VoiceInputButton from './VoiceInputButton';

export default function MeetingTimeline({ 
  meetings, 
  startups, 
  onAddMeeting, 
  onUpdateMeeting, 
  showToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStartupFilter, setSelectedStartupFilter] = useState('');
  const [selectedPurposeFilter, setSelectedPurposeFilter] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Edit Meeting State
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editStartupId, setEditStartupId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editAttendees, setEditAttendees] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editNextStep, setEditNextStep] = useState('');

  // Gemini loading states mapping meetingId -> boolean
  const [aiLoadingState, setAiLoadingState] = useState({});
  const [aiErrorState, setAiErrorState] = useState({});

  // Form State
  const [formStartupId, setFormStartupId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPurpose, setFormPurpose] = useState('Initial pitch');
  const [formAttendees, setFormAttendees] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formNextStep, setFormNextStep] = useState('');

  const meetingPurposes = [
    "初回ピッチ (Initial pitch)", 
    "デモ (Demo)", 
    "シナジー/M&A検討 (Synergy/M&A)", 
    "DDインタビュー (DD Interview)", 
    "投資条件交渉 (Term Sheet Negotiation)", 
    "ポートフォリオ支援 (Portfolio Follow-up)"
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    const success = exportMeetingsToCSV(filteredMeetings, startups, `CVC_Meetings_${new Date().toISOString().split('T')[0]}.csv`);
    if (success) {
      if (showToast) showToast(`${filteredMeetings.length}件の面談ログを出力しました (Excel対応)`, "success");
    } else {
      if (showToast) showToast("出力対象の面談ログがありません。", "warning");
    }
  };

  // Filtering meetings
  const filteredMeetings = [...meetings]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(meeting => {
      const startup = startups.find(s => s.id === meeting.startupId);
      const matchesStartupDropdown = selectedStartupFilter ? meeting.startupId === selectedStartupFilter : true;
      const matchesPurpose = selectedPurposeFilter ? meeting.purpose === selectedPurposeFilter : true;
      
      const targetText = `${startup?.name || ''} ${startup?.tagline || ''} ${meeting.purpose || ''} ${meeting.notes || ''} ${meeting.nextStep || ''} ${meeting.attendees?.join(' ') || ''}`.toLowerCase();
      const matchesSearch = searchTerm ? targetText.includes(searchTerm.toLowerCase()) : true;

      return matchesStartupDropdown && matchesPurpose && matchesSearch;
    });

  // Handle Add Meeting
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formStartupId) {
      showToast("Please select a startup first.", "warning");
      return;
    }

    const attendeesArray = formAttendees
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newMeeting = {
      startupId: formStartupId,
      date: formDate,
      purpose: formPurpose,
      attendees: attendeesArray,
      notes: formNotes,
      nextStep: formNextStep,
      aiBrief: null
    };

    onAddMeeting(newMeeting);

    // Reset Form
    setFormStartupId('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPurpose('Initial pitch');
    setFormAttendees('');
    setFormNotes('');
    setFormNextStep('');
    setIsAddFormOpen(false);
    showToast("Meeting log created successfully!", "success");
  };

  // Open Edit Modal
  const handleOpenEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setEditStartupId(meeting.startupId || '');
    setEditDate(meeting.date || new Date().toISOString().split('T')[0]);
    setEditPurpose(meeting.purpose || 'Initial pitch');
    setEditAttendees(meeting.attendees ? meeting.attendees.join(', ') : '');
    setEditNotes(meeting.notes || '');
    setEditNextStep(meeting.nextStep || '');
  };

  // Submit Update Meeting
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingMeeting || !editStartupId) return;

    const attendeesArray = editAttendees
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const updatedMeeting = {
      ...editingMeeting,
      startupId: editStartupId,
      date: editDate,
      purpose: editPurpose,
      attendees: attendeesArray,
      notes: editNotes,
      nextStep: editNextStep
    };

    onUpdateMeeting(editingMeeting.id, updatedMeeting);
    setEditingMeeting(null);
    if (showToast) showToast("面談ログを更新しました！", "success");
  };

  // Trigger Gemini Analysis
  const handleTriggerAI = async (meeting) => {
    const startup = startups.find(s => s.id === meeting.startupId);
    if (!startup) {
      showToast("Linked startup profile not found.", "error");
      return;
    }

    setAiLoadingState(prev => ({ ...prev, [meeting.id]: true }));
    setAiErrorState(prev => ({ ...prev, [meeting.id]: null }));

    try {
      showToast(`Generating AI Brief for ${startup.name}...`, "info");
      const aiResponse = await analyzeMeetingNotes(meeting.notes, startup);
      
      const updatedMeeting = {
        ...meeting,
        aiBrief: aiResponse
      };

      await onUpdateMeeting(meeting.id, updatedMeeting);
      showToast(`Synergy Brief generated for ${startup.name}!`, "success");
    } catch (err) {
      console.error(err);
      setAiErrorState(prev => ({ ...prev, [meeting.id]: err.message }));
      showToast(err.message || "Failed to generate Synergy Brief.", "error");
    } finally {
      setAiLoadingState(prev => ({ ...prev, [meeting.id]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">面談ログ・履歴</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">面談内容を記録し、Geminiで戦略的なシナジー評価を行います。</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* CSV Export Button (Min 44x44px target) */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold shadow-sm transition-all min-h-[44px]"
            title="Excel/CSV形式で出力"
          >
            <Download className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            <span>CSV/Excel出力</span>
          </button>

          {/* Add Meeting Button */}
          <button 
            onClick={() => {
              if (startups.length === 0) {
                showToast("Register at least one startup before logging a meeting.", "warning");
                return;
              }
              if (!formStartupId && startups.length > 0) {
                setFormStartupId(startups[0].id);
              }
              setIsAddFormOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            <span>新規面談ログを登録</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-4 shadow-sm backdrop-blur flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Bar Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="企業名・キーワード・面談内容で検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm transition-all placeholder-slate-400"
          />
        </div>

        {/* Startup Select Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 hidden md:block" />
          <select
            value={selectedStartupFilter}
            onChange={(e) => setSelectedStartupFilter(e.target.value)}
            className="w-full md:w-48 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-350 text-sm font-medium transition-all"
          >
            <option value="">すべてのスタートアップ</option>
            {startups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Purpose Filter */}
        <div className="w-full md:w-auto">
          <select
            value={selectedPurposeFilter}
            onChange={(e) => setSelectedPurposeFilter(e.target.value)}
            className="w-full md:w-48 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-350 text-sm font-medium transition-all"
          >
            <option value="">すべての目的</option>
            {meetingPurposes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

      </div>

      {/* Timeline Section */}
      {filteredMeetings.length > 0 ? (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 py-2">
          {filteredMeetings.map(meeting => {
            const startup = startups.find(s => s.id === meeting.startupId);
            const isAnalyzing = aiLoadingState[meeting.id];
            const aiError = aiErrorState[meeting.id];

            return (
              <div key={meeting.id} className="relative group">
                
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 flex items-center justify-center bg-white dark:bg-slate-950 rounded-full border border-blue-500 w-4 h-4 shadow-sm z-10">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                </div>

                {/* Log Card */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm group-hover:shadow-md transition-all duration-300">
                  
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase">
                        {meeting.date}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {startup?.name || "Unknown Startup"}
                      </h3>
                    </div>
                    
                    {/* Badge purpose & Edit Button */}
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30">
                        {meeting.purpose}
                      </span>
                      <button
                        onClick={() => handleOpenEditModal(meeting)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all flex items-center space-x-1 min-h-[36px]"
                        title="過去の面談ログを修正"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>編集</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-4">
                    
                    {/* Raw details column */}
                    <div className="space-y-4">
                      {/* Attendees */}
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-400">同席者:</span>
                          <span>{meeting.attendees.join(', ')}</span>
                        </div>
                      )}

                      {/* Discussion Notes */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase">ディスカッションメモ</span>
                        <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                          {meeting.notes}
                        </p>
                      </div>

                      {/* Next Step */}
                      {meeting.nextStep && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-start space-x-2">
                          <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <span className="font-bold text-slate-800 dark:text-slate-300">次回のタスク (Next Step):</span>{' '}
                            <span className="text-slate-650 dark:text-slate-450 font-medium">{meeting.nextStep}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gemini Synergy Brief Panel (Hidden by user request) */}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 bg-white/40 dark:bg-slate-955/20 backdrop-blur">
          <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">該当する面談ログが見つかりませんでした。</p>
        </div>
      )}

      {/* Add Meeting Dialog Box */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">面談ログを登録</h2>
              <button 
                onClick={() => setIsAddFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-660 dark:hover:text-slate-200 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Startup Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">スタートアップ企業 *</label>
                  <select 
                    value={formStartupId}
                    onChange={(e) => setFormStartupId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-350 text-sm font-medium transition-all"
                  >
                    {startups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Meeting Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">面談実施日 *</label>
                  <input 
                    type="date" 
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-955 dark:text-slate-100 text-sm transition-all"
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">目的</label>
                  <select 
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-355 text-sm transition-all"
                  >
                    {meetingPurposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Attendees */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">同席者（カンマ区切り）</label>
                  <input 
                    type="text" 
                    placeholder="例：田中 健二, サラ・ジェンキンス" 
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all"
                  />
                </div>
              </div>

              {/* Discussion Notes */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ディスカッションメモ *</label>
                  <VoiceInputButton onTranscript={(text) => setFormNotes(prev => prev ? `${prev}\n${text}` : text)} />
                </div>
                <textarea 
                  rows="4"
                  required
                  placeholder="面談の詳細なメモや文字起こしなどをここに貼り付けます..." 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all resize-none"
                />
              </div>

              {/* Next Steps */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">次回のタスクと期限</label>
                  <VoiceInputButton onTranscript={(text) => setFormNextStep(prev => prev ? `${prev} ${text}` : text)} />
                </div>
                <input 
                  type="text" 
                  placeholder="例：7月30日までにAPI技術検証を実施" 
                  value={formNextStep}
                  onChange={(e) => setFormNextStep(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-955 transition-all min-h-[44px]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/10 hover:shadow-lg transition-all min-h-[44px]"
                >
                  保存
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal Dialogue */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-blue-500" />
                <span>過去の面談ログを編集</span>
              </h2>
              <button 
                onClick={() => setEditingMeeting(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Select Startup */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">対象企業 *</label>
                <select 
                  required
                  value={editStartupId}
                  onChange={(e) => setEditStartupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm font-medium transition-all"
                >
                  <option value="" disabled>企業を選択してください</option>
                  {startups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Date & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">面談実施日 *</label>
                  <input 
                    type="date" 
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">面談目的 *</label>
                  <select 
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm transition-all"
                  >
                    {meetingPurposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">同席メンバー / 担当者</label>
                <input 
                  type="text" 
                  placeholder="カンマ区切りで入力 (例: 山田太郎, 佐藤次郎)" 
                  value={editAttendees}
                  onChange={(e) => setEditAttendees(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all"
                />
              </div>

              {/* Discussion Notes */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">ディスカッションメモ *</label>
                  <VoiceInputButton onTranscript={(text) => setEditNotes(prev => prev ? `${prev}\n${text}` : text)} />
                </div>
                <textarea 
                  rows="5"
                  required
                  placeholder="面談の詳細なメモや文字起こしなど..." 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all resize-none"
                />
              </div>

              {/* Next Steps */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">次回のタスクと期限</label>
                  <VoiceInputButton onTranscript={(text) => setEditNextStep(prev => prev ? `${prev} ${text}` : text)} />
                </div>
                <input 
                  type="text" 
                  placeholder="例：7月30日までにAPI技術検証を実施" 
                  value={editNextStep}
                  onChange={(e) => setEditNextStep(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setEditingMeeting(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-all min-h-[44px]"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/10 text-sm transition-all min-h-[44px]"
                >
                  更新内容を保存
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
