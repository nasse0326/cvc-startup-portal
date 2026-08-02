import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Globe, 
  Star, 
  ExternalLink,
  SlidersHorizontal,
  X,
  Briefcase,
  Handshake,
  Download
} from 'lucide-react';
import { exportStartupsToCSV } from '../services/exportCsv';

export default function StartupList({ startups, onSelectStartup, onAddStartup, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedInvestStatus, setSelectedInvestStatus] = useState('');
  const [selectedBizDevStatus, setSelectedBizDevStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('SaaS');
  const [newStage, setNewStage] = useState('Seed');
  const [newStatus, setNewStatus] = useState('Sourcing (ソーシング)');
  const [newBizDevStatus, setNewBizDevStatus] = useState('Not Started / N/A (未着手 / 対象外)');
  const [newScore, setNewScore] = useState(3);
  const [newTagline, setNewTagline] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFunding, setNewFunding] = useState('');
  const [newBizDevNotes, setNewBizDevNotes] = useState('');

  // Dropdown lists
  const sectors = ["AI", "SaaS / Enterprise", "Fintech", "Healthtech", "ClimateTech", "Logistics / Mobility", "Retail / Commerce", "HRTech", "Web3 / Crypto", "Others"];
  const stages = ["Seed", "Pre-A", "Series-A", "Series-B", "Series-C+"];
  
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

  // Export CSV handler
  const handleExportCSV = () => {
    const success = exportStartupsToCSV(filteredStartups, `CVC_Startups_${new Date().toISOString().split('T')[0]}.csv`);
    if (success) {
      if (showToast) showToast(`${filteredStartups.length}件のスタートアップを出力しました (Excel対応)`, "success");
    } else {
      if (showToast) showToast("出力対象のデータがありません。", "warning");
    }
  };

  // Filtering Logic
  const filteredStartups = startups.filter(startup => {
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      startup.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector ? startup.sector === selectedSector : true;
    const matchesStage = selectedStage ? startup.stage === selectedStage : true;
    const matchesInvestStatus = selectedInvestStatus ? (startup.status === selectedInvestStatus || startup.status?.includes(selectedInvestStatus)) : true;
    const matchesBizDevStatus = selectedBizDevStatus ? (startup.bizDevStatus === selectedBizDevStatus || startup.bizDevStatus?.includes(selectedBizDevStatus)) : true;
    return matchesSearch && matchesSector && matchesStage && matchesInvestStatus && matchesBizDevStatus;
  });

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStartup = {
      name: newName,
      sector: newSector,
      stage: newStage,
      status: newStatus,
      bizDevStatus: newBizDevStatus,
      score: Number(newScore),
      tagline: newTagline,
      website: newWebsite,
      location: newLocation || `${new Date().getFullYear()} / Unknown`,
      funding: newFunding,
      bizDevNotes: newBizDevNotes
    };

    onAddStartup(newStartup);
    
    // Reset Form
    setNewName('');
    setNewSector('SaaS');
    setNewStage('Seed');
    setNewStatus('Sourcing (ソーシング)');
    setNewBizDevStatus('Not Started / N/A (未着手 / 対象外)');
    setNewScore(3);
    setNewTagline('');
    setNewWebsite('');
    setNewLocation('');
    setNewFunding('');
    setNewBizDevNotes('');
    setIsAddModalOpen(false);
  };

  const getInvestmentStatusColor = (status) => {
    if (status?.includes("Sourcing")) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    if (status?.includes("Initial")) return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30";
    if (status?.includes("Review") || status?.includes("詳細検討")) return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100/50 dark:border-amber-900/30";
    if (status?.includes("DD") || status?.includes("Diligence")) return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100/50 dark:border-purple-900/30";
    if (status?.includes("Committee")) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30";
    if (status?.includes("Invested") || status?.includes("Portfolio")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/30";
    if (status?.includes("Passed") || status?.includes("見送り")) return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-100/50 dark:border-rose-900/30";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  const getBizDevStatusColor = (status) => {
    if (!status || status?.includes("Not Started") || status?.includes("未着手")) return "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400";
    if (status?.includes("Collaboration Review") || status?.includes("協業検討")) return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100/50 dark:border-sky-900/30";
    if (status?.includes("POC Consideration") || status?.includes("POC検討")) return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-100/50 dark:border-cyan-900/30";
    if (status?.includes("POC Executing") || status?.includes("POC実施中")) return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-100/50 dark:border-teal-900/30";
    if (status?.includes("POC Completed") || status?.includes("POC実施済")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/30";
    if (status?.includes("Commercialized") || status?.includes("事業化")) return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-100/50 dark:border-violet-900/30";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">スタートアップ名簿</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">投資検討と事業開発（PoC・協業）のデュアルトラック管理。</p>
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

          {/* Add Startup Button (Min 44x44px target) */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            <span>スタートアップ登録</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-4 shadow-sm backdrop-blur flex flex-col lg:flex-row items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="企業名や事業概要で検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all text-sm"
          />
        </div>

        {/* Sector Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full sm:w-40 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-xs font-medium transition-all"
          >
            <option value="">全セクター</option>
            {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </div>

        {/* Stage Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full sm:w-36 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-xs font-medium transition-all"
          >
            <option value="">全ステージ</option>
            {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
          </select>
        </div>

        {/* Investment Status Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedInvestStatus}
            onChange={(e) => setSelectedInvestStatus(e.target.value)}
            className="w-full sm:w-44 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-xs font-medium transition-all"
          >
            <option value="">全 投資ステータス</option>
            {investmentStatuses.map(st => <option key={st} value={st}>{st.split(" (")[0]}</option>)}
          </select>
        </div>

        {/* BizDev Status Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedBizDevStatus}
            onChange={(e) => setSelectedBizDevStatus(e.target.value)}
            className="w-full sm:w-44 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-xs font-medium transition-all"
          >
            <option value="">全 事業・PoCステータス</option>
            {bizDevStatuses.map(st => <option key={st} value={st}>{st.split(" (")[0]}</option>)}
          </select>
        </div>

      </div>

      {/* Grid of Startup Cards */}
      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.map(startup => (
            <div 
              key={startup.id}
              onClick={() => onSelectStartup(startup)}
              className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: Name and Stage Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {startup.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
                    {startup.stage}
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-sm text-slate-650 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {startup.tagline}
                </p>

                {/* Meta details: Sector, Location */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-400 dark:text-slate-500 mr-2">SECTOR</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                      {startup.sector}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                    <span>{startup.location}</span>
                  </div>
                </div>

                {/* Dual Track Status Display Badges */}
                <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center">
                      <Briefcase className="h-3 w-3 mr-1 text-blue-500" /> 投資ステータス
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getInvestmentStatusColor(startup.status)}`}>
                      {startup.status?.split(" (")?.[0]}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center">
                      <Handshake className="h-3 w-3 mr-1 text-teal-500" /> 事業・PoC
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getBizDevStatusColor(startup.bizDevStatus)}`}>
                      {startup.bizDevStatus ? startup.bizDevStatus.split(" (")[0] : "未着手"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Rating Stars */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">優先度評価</span>
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
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 backdrop-blur">
          <SlidersHorizontal className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">指定のフィルター条件に該当するスタートアップが見つかりません。</p>
        </div>
      )}

      {/* Add Startup Modal Dialogue */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-250 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">新規スタートアップ登録</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* 1. 基本プロファイル */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    🏢 基本プロファイル
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業名 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="例: Aegis AI" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">セクター</label>
                    <select 
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                    >
                      {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">調達ステージ</label>
                    <select 
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                    >
                      {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Webサイト URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com" 
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">設立年 / 拠点</label>
                    <input 
                      type="text" 
                      placeholder="例: 2024年設立 / 東京" 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">事業概要（一言タグライン）</label>
                    <input 
                      type="text" 
                      placeholder="例: 倉庫車両の自動トラッキング向けクラウドプラットフォーム。" 
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. 💳 投資トラック (Investment Track) */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-blue-200/50 dark:border-blue-900/50 pb-2">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    💳 投資検討トラック (Investment Track)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資ステータス</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 text-sm transition-all"
                    >
                      {investmentStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase block mb-1">優先度評価 (1-5)</label>
                    <div className="flex items-center space-x-1.5 h-[44px]">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setNewScore(val)}
                          className="p-1 rounded hover:scale-110 text-slate-300 dark:text-slate-700 transition-all focus:outline-none"
                        >
                          <Star 
                            className={`h-6 w-6 ${val <= newScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">資金調達履歴・投資家メモ</label>
                  <textarea 
                    rows="2"
                    placeholder="例: シードラウンドで1,500万を調達。共同投資家：グローバル・ブレイン。" 
                    value={newFunding}
                    onChange={(e) => setNewFunding(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {/* 3. 🤝 事業・PoC協業トラック (BizDev & PoC Track) */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-emerald-200/50 dark:border-emerald-900/50 pb-2">
                  <Handshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    🤝 事業開発・PoC協業トラック (BizDev / PoC Track)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業・PoC協業ステータス</label>
                  <select 
                    value={newBizDevStatus}
                    onChange={(e) => setNewBizDevStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 dark:text-slate-300 text-sm transition-all"
                  >
                    {bizDevStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業開発・PoC協業メモ / 検討内容</label>
                  <textarea 
                    rows="3"
                    placeholder="例: 当社物流事業部とのデータ連携実証（PoC）案件。2026年Q3開始を目標に協議中。" 
                    value={newBizDevNotes}
                    onChange={(e) => setNewBizDevNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons (Min 44x44px target) */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 transition-all min-h-[44px]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all min-h-[44px]"
                >
                  保存する
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
