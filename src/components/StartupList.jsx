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
  Download,
  LayoutGrid,
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { exportStartupsToCSV } from '../services/exportCsv';
import VoiceInputButton from './VoiceInputButton';

export default function StartupList({ startups, onSelectStartup, onAddStartup, onBulkDeleteStartups, showToast }) {
  const [companyType, setCompanyType] = useState('startup'); // 'startup' | 'enterprise'
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedInvestStatus, setSelectedInvestStatus] = useState('');
  const [selectedBizDevStatus, setSelectedBizDevStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Form State
  const [newCompanyType, setNewCompanyType] = useState('startup');
  const [newName, setNewName] = useState('');
  const [newCreatedAtDate, setNewCreatedAtDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSector, setNewSector] = useState('SaaS');
  const [newStage, setNewStage] = useState('Seed');
  const [newDealSource, setNewDealSource] = useState('VC / アクセラレーター紹介');
  const [newDealSourceDetail, setNewDealSourceDetail] = useState('');
  const [newInternalPartnerDept, setNewInternalPartnerDept] = useState('');
  const [newStatus, setNewStatus] = useState('Sourcing (ソーシング)');
  const [newBizDevStatus, setNewBizDevStatus] = useState('Not Started / N/A (未着手 / 対象外)');
  const [newScore, setNewScore] = useState(3);
  const [newTagline, setNewTagline] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFunding, setNewFunding] = useState('');
  const [newInvestmentMemo, setNewInvestmentMemo] = useState('');
  const [newBizDevNotes, setNewBizDevNotes] = useState('');

  const dealSourceOptions = [
    "VC / アクセラレーター紹介",
    "展示会・ピッチイベント",
    "社内事業部からの推薦",
    "直アプローチ (Outbound)",
    "Web問合せ / 自主応募",
    "その他"
  ];

  // Dropdown lists
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

  // Company Type Counts
  const startupCount = startups.filter(s => s.companyType !== 'enterprise').length;
  const enterpriseCount = startups.filter(s => s.companyType === 'enterprise').length;

  // Export CSV handler
  const handleExportCSV = () => {
    const filename = companyType === 'enterprise' 
      ? `CVC_Enterprises_${new Date().toISOString().split('T')[0]}.csv`
      : `CVC_Startups_${new Date().toISOString().split('T')[0]}.csv`;
    const success = exportStartupsToCSV(filteredStartups, filename);
    if (success) {
      if (showToast) showToast(`${filteredStartups.length}件の企業データを出力しました (Excel対応)`, "success");
    } else {
      if (showToast) showToast("出力対象のデータがありません。", "warning");
    }
  };

  // Filtering Logic
  const filteredStartups = startups.filter(startup => {
    const isEnterprise = startup.companyType === 'enterprise';
    const matchesType = companyType === 'enterprise' ? isEnterprise : !isEnterprise;

    const matchesSearch = 
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (startup.tagline && startup.tagline.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = selectedSector ? startup.sector === selectedSector : true;
    const matchesStage = selectedStage ? startup.stage === selectedStage : true;
    const matchesInvestStatus = selectedInvestStatus ? (startup.status === selectedInvestStatus || startup.status?.includes(selectedInvestStatus)) : true;
    const matchesBizDevStatus = selectedBizDevStatus ? (startup.bizDevStatus === selectedBizDevStatus || startup.bizDevStatus?.includes(selectedBizDevStatus)) : true;
    return matchesType && matchesSearch && matchesSector && matchesStage && matchesInvestStatus && matchesBizDevStatus;
  });

  // Sort Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sorted Array
  const sortedStartups = [...filteredStartups].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'no' || sortField === 'score') {
      aVal = Number(a[sortField] || 0);
      bVal = Number(b[sortField] || 0);
    } else if (sortField === 'createdAtDate') {
      aVal = a.createdAtDate || '';
      bVal = b.createdAtDate || '';
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase();
      bVal = (bVal || '').toLowerCase();
    } else if (!aVal) {
      aVal = '';
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Helper Sort Icon
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-300 dark:text-slate-600 ml-1 inline" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400 ml-1 inline font-bold" />
      : <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400 ml-1 inline font-bold" />;
  };

  // Toggle selection for a single row
  const toggleSelectOne = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all visible items
  const toggleSelectAll = () => {
    if (selectedIds.size === sortedStartups.length && sortedStartups.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedStartups.map(s => s.id)));
    }
  };

  // Handle Bulk Delete Confirmation
  const handleConfirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const confirmMsg = `選択した ${selectedIds.size} 件の企業データを一括削除しますか？\n（関連する面談ログも同時に削除されます）`;
    if (window.confirm(confirmMsg)) {
      if (onBulkDeleteStartups) {
        onBulkDeleteStartups(Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStartupObj = {
      name: newName,
      companyType: newCompanyType,
      createdAtDate: newCreatedAtDate ? newCreatedAtDate.replace(/-/g, '/') : new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      sector: newSector,
      stage: newCompanyType === 'enterprise' && newStage === 'Seed' ? 'N/A (一般企業)' : newStage,
      dealSource: newDealSource,
      dealSourceDetail: newDealSourceDetail,
      internalPartnerDept: newInternalPartnerDept,
      status: newStatus,
      bizDevStatus: newBizDevStatus,
      score: Number(newScore),
      tagline: newTagline,
      website: newWebsite,
      location: newLocation || `${new Date().getFullYear()} / Unknown`,
      funding: newFunding,
      investmentMemo: newInvestmentMemo,
      bizDevNotes: newBizDevNotes
    };

    onAddStartup(newStartupObj);
    
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
    setNewInvestmentMemo('');
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{companyType === 'enterprise' ? '一般企業・パートナー企業名簿' : 'スタートアップ名簿'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {companyType === 'enterprise' 
              ? '大手パートナー企業や事業会社との面談・協業（PoC）進捗管理。' 
              : '投資検討と事業開発（PoC・協業）のデュアルトラック管理。'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">

          {/* Bulk Delete Button */}
          {selectedIds.size > 0 && (
            <button
              onClick={handleConfirmBulkDelete}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all animate-fade-in min-h-[44px]"
            >
              <Trash2 className="h-4 w-4" />
              <span>選択した {selectedIds.size} 件を一括削除</span>
            </button>
          )}

          {/* View Mode Switcher (Grid vs Table) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center space-x-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="データテーブル（表）表示"
            >
              <Table className="h-4 w-4" />
              <span>テーブル</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center space-x-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="カードグリッド表示"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>カード</span>
            </button>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold shadow-sm transition-all min-h-[44px]"
            title="Excel/CSV形式で出力"
          >
            <Download className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            <span>CSV/Excel出力</span>
          </button>

          {/* Add Startup / Enterprise Button */}
          <button 
            onClick={() => {
              setNewCompanyType(companyType);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            <span>{companyType === 'enterprise' ? '一般企業を登録' : 'スタートアップ登録'}</span>
          </button>
        </div>
      </div>

      {/* Primary Category Switcher Sub-Tabs */}
      <div className="flex items-center space-x-1 p-1.5 bg-slate-100/80 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 w-fit backdrop-blur">
        <button
          type="button"
          onClick={() => setCompanyType('startup')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center space-x-2 min-h-[40px] ${
            companyType === 'startup'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm">🚀</span>
          <span>スタートアップ</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            companyType === 'startup'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {startupCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCompanyType('enterprise')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center space-x-2 min-h-[40px] ${
            companyType === 'enterprise'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm">🏢</span>
          <span>一般企業・パートナー企業</span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
            companyType === 'enterprise'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {enterpriseCount}
          </span>
        </button>
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

      {/* List of Startup Companies (Table View vs Grid View) */}
      {sortedStartups.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm backdrop-blur">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold select-none">
                  <th className="py-3.5 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === sortedStartups.length && sortedStartups.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th onClick={() => handleSort('no')} className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-14">
                    <div className="flex items-center justify-center space-x-0.5">
                      <span>No.</span>
                      <SortIcon field="no" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>企業名</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('sector')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>セクター</span>
                      <SortIcon field="sector" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('stage')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>ステージ</span>
                      <SortIcon field="stage" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('dealSource')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>案件流入元</span>
                      <SortIcon field="dealSource" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('score')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>優先度</span>
                      <SortIcon field="score" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('status')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>投資ステータス</span>
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('bizDevStatus')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>事業・PoC / 連携先</span>
                      <SortIcon field="bizDevStatus" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('createdAtDate')} className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <span>登録日</span>
                      <SortIcon field="createdAtDate" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">拠点 / Web</th>
                  <th className="py-3.5 px-4 text-right">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedStartups.map((startup) => (
                  <tr 
                    key={startup.id}
                    onClick={() => onSelectStartup(startup)}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                      selectedIds.has(startup.id) ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(startup.id)}
                        onChange={(e) => toggleSelectOne(startup.id, e)}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      No. {startup.no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                        {startup.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {startup.tagline}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                        {startup.sector}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
                        {startup.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 block font-medium">
                        {startup.dealSource || '未設定'}
                      </span>
                      {startup.dealSourceDetail && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px] block">
                          {startup.dealSourceDetail}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < startup.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getInvestmentStatusColor(startup.status)}`}>
                        {startup.status?.split(" (")?.[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getBizDevStatusColor(startup.bizDevStatus)}`}>
                        {startup.bizDevStatus ? startup.bizDevStatus.split(" (")[0] : "未着手"}
                      </span>
                      {startup.internalPartnerDept && (
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 truncate max-w-[120px]">
                          🤝 {startup.internalPartnerDept}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {startup.createdAtDate || '2026/08/01'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      <div>{startup.location}</div>
                      {startup.website && (
                        <a 
                          href={startup.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{startup.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectStartup(startup); }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all min-h-[32px]"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid of Startup Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStartups.map(startup => (
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
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      No.{startup.no}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
                      {startup.stage}
                    </span>
                  </div>
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
        )
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {newCompanyType === 'enterprise' ? '新規一般企業・パートナー登録' : '新規スタートアップ登録'}
              </h2>
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
                      onClick={() => setNewCompanyType('startup')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                        newCompanyType === 'startup'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span>🚀 スタートアップ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCompanyType('enterprise')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                        newCompanyType === 'enterprise'
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
                      required
                      placeholder={newCompanyType === 'enterprise' ? "例: 株式会社トヨタITソリューションズ" : "例: Aegis AI"} 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">登録年月日 (登録日)</label>
                    <input 
                      type="date" 
                      value={newCreatedAtDate}
                      onChange={(e) => setNewCreatedAtDate(e.target.value)}
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
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">優先度評価 (1-5)</label>
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
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Webサイト URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com" 
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">案件流入元</label>
                    <select 
                      value={newDealSource}
                      onChange={(e) => setNewDealSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                    >
                      {dealSourceOptions.map(src => <option key={src} value={src}>{src}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">案件流入元・詳細（自由記述）</label>
                    <input 
                      type="text" 
                      placeholder="例: ジャフコ金子様紹介、Interop 2026ピッチ等" 
                      value={newDealSourceDetail}
                      onChange={(e) => setNewDealSourceDetail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">事業概要（一言タグライン）</label>
                    <VoiceInputButton onTranscript={(text) => setNewTagline(prev => prev ? `${prev} ${text}` : text)} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="例: 倉庫車両の自動トラッキング向けクラウドプラットフォーム。" 
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">資金調達履歴</label>
                  <textarea 
                    rows="2"
                    placeholder="例: シードラウンドで1,500万を調達。共同投資家：グローバル・ブレイン。" 
                    value={newFunding}
                    onChange={(e) => setNewFunding(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {/* 2. 💳 投資検討トラック (Investment Track) */}
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
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-350 text-sm transition-all"
                  >
                    {investmentStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資検討メモ (投資トラック)</label>
                    <VoiceInputButton onTranscript={(text) => setNewInvestmentMemo(prev => prev ? `${prev}\n${text}` : text)} />
                  </div>
                  <textarea 
                    rows="3"
                    placeholder="投資的な評価点やデューデリジェンスの進捗状況..." 
                    value={newInvestmentMemo}
                    onChange={(e) => setNewInvestmentMemo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-450 transition-all resize-none"
                  />
                </div>
              </div>

              {/* 3. 🤝 事業開発・PoC協業トラック (BizDev & PoC Track) */}
              <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-teal-200/50 dark:border-teal-900/50 pb-2">
                  <Handshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    🤝 事業開発・PoC協業トラック (BizDev & PoC Track)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業・PoCステータス</label>
                    <select 
                      value={newBizDevStatus}
                      onChange={(e) => setNewBizDevStatus(e.target.value)}
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
                      value={newInternalPartnerDept}
                      onChange={(e) => setNewInternalPartnerDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業開発・PoC協業メモ / 検討内容</label>
                    <VoiceInputButton onTranscript={(text) => setNewBizDevNotes(prev => prev ? `${prev}\n${text}` : text)} />
                  </div>
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
