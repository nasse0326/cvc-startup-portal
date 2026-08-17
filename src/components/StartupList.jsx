import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Trash2,
  ListTodo,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  RotateCcw,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { exportStartupsToCSV } from '../services/exportCsv';
import VoiceInputButton from './VoiceInputButton';

// 🌟 優先度定義マッピング
export const PRIORITY_DEFINITIONS = {
  5: { level: 5, stars: "★★★★★", label: "絶対追う(重要案件)", desc: "最優先でDD・事業部門とのPoC協業検討を推進する最重要案件", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50" },
  4: { level: 4, stars: "★★★★☆", label: "積極フォロー", desc: "定期的な面談を実施し、事業連携や次回調達ラウンドを積極追跡する案件", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50" },
  3: { level: 3, stars: "★★★☆☆", label: "継続Watch", desc: "四半期ごとの動向確認や市場展開の進捗を観察する案件", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/50" },
  2: { level: 2, stars: "★★☆☆☆", label: "情報収集のみ", desc: "業界リサーチの一環として登録。必要に応じた情報アップデートのみ", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  1: { level: 1, stars: "★☆☆☆☆", label: "(実質)見送り", desc: "現時点で投資・連携の可能性が極めて低く、アーカイブ対象の案件", color: "text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50" }
};

// 🌟 表示列のワンクリック・プリセット定義
export const COLUMN_PRESETS = {
  default: {
    name: "標準",
    icon: "🌟",
    desc: "基本情報をバランスよく表示",
    columns: { no: true, name: true, sector: true, stage: true, dealSource: true, contactPerson: true, tasks: true, score: true, status: true, investmentMemo: false, bizDevStatus: true, bizDevNotes: false, createdAtDate: true, location: false }
  },
  investment: {
    name: "投資検討重視",
    icon: "💳",
    desc: "調達ステージや投資メモ・流入元に特化",
    columns: { no: true, name: true, sector: true, stage: true, dealSource: true, contactPerson: true, tasks: false, score: true, status: true, investmentMemo: true, bizDevStatus: false, bizDevNotes: false, createdAtDate: true, location: false }
  },
  bizDev: {
    name: "事業・PoC重視",
    icon: "🤝",
    desc: "PoCステータスや社内連携先・タスクに特化",
    columns: { no: true, name: true, sector: true, stage: false, dealSource: false, contactPerson: true, tasks: true, score: true, status: false, investmentMemo: false, bizDevStatus: true, bizDevNotes: true, createdAtDate: false, location: true }
  },
  all: {
    name: "全項目表示",
    icon: "👁️",
    desc: "すべての列をフル表示",
    columns: { no: true, name: true, sector: true, stage: true, dealSource: true, contactPerson: true, tasks: true, score: true, status: true, investmentMemo: true, bizDevStatus: true, bizDevNotes: true, createdAtDate: true, location: true }
  },
  compact: {
    name: "コンパクト",
    icon: "⚡",
    desc: "社名と重要ステータスのみの最小表示",
    columns: { no: true, name: true, sector: true, stage: false, dealSource: false, contactPerson: false, tasks: false, score: true, status: true, investmentMemo: false, bizDevStatus: true, bizDevNotes: false, createdAtDate: false, location: false }
  }
};

const DEFAULT_COLUMN_WIDTHS = {
  select: 48,
  no: 60,
  name: 240,
  sector: 120,
  stage: 110,
  dealSource: 160,
  contactPerson: 180,
  tasks: 210,
  score: 110,
  status: 160,
  investmentMemo: 240,
  bizDevStatus: 170,
  bizDevNotes: 240,
  createdAtDate: 110,
  location: 180,
  actions: 80
};

export default function StartupList({ startups, onSelectStartup, onAddStartup, onBulkDeleteStartups, showToast }) {
  const [companyType, setCompanyType] = useState('startup'); // 'startup' | 'enterprise'
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(''); // '' | '5' | '4+' | '3+' | '2' | '1'
  const [hasIncompleteTasksOnly, setHasIncompleteTasksOnly] = useState(false);
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedInvestStatus, setSelectedInvestStatus] = useState('');
  const [selectedBizDevStatus, setSelectedBizDevStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isPriorityGuideOpen, setIsPriorityGuideOpen] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('cvc_visible_columns');
    if (saved) {
      try {
        return {
          contactPerson: true,
          tasks: true,
          ...JSON.parse(saved)
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      no: true,
      name: true,
      sector: true,
      stage: true,
      dealSource: true,
      contactPerson: true,
      tasks: true,
      score: true,
      status: true,
      investmentMemo: true,
      bizDevStatus: true,
      bizDevNotes: true,
      createdAtDate: true,
      location: true
    };
  });

  useEffect(() => {
    localStorage.setItem('cvc_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Column Widths (Resize)
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('cvc_column_widths');
    if (saved) {
      try {
        return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return DEFAULT_COLUMN_WIDTHS;
  });

  useEffect(() => {
    localStorage.setItem('cvc_column_widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  // Horizontal Scroll & Sticky Header Controls
  const tableContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [maxScrollLeft, setMaxScrollLeft] = useState(0);

  // Column Resize Dragging State
  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const startResizing = useCallback((colKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    resizingCol.current = colKey;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 150;

    const handleMouseMove = (moveEvent) => {
      if (!resizingCol.current) return;
      const deltaX = moveEvent.clientX - startX.current;
      const newWidth = Math.max(60, startWidth.current + deltaX);
      setColumnWidths(prev => ({
        ...prev,
        [resizingCol.current]: newWidth
      }));
    };

    const handleMouseUp = () => {
      resizingCol.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths]);

  const resetColumnWidths = () => {
    setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    if (showToast) showToast("列の幅を初期サイズにリセットしました", "info");
  };

  // Sync scroll progress on table scroll
  const handleTableScroll = () => {
    if (!tableContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
    const max = scrollWidth - clientWidth;
    setMaxScrollLeft(max > 0 ? max : 0);
    if (max > 0) {
      setScrollProgress((scrollLeft / max) * 100);
    } else {
      setScrollProgress(0);
    }
  };

  // Sync scroll when slider is dragged
  const handleSliderChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    setScrollProgress(newPercent);
    if (tableContainerRef.current && maxScrollLeft > 0) {
      tableContainerRef.current.scrollLeft = (newPercent / 100) * maxScrollLeft;
    }
  };

  const handleStepScroll = (direction) => {
    if (!tableContainerRef.current) return;
    const step = 250;
    tableContainerRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    handleTableScroll();
    const handleResize = () => handleTableScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [startups, visibleColumns, columnWidths]);

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
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newInternalPartnerDept, setNewInternalPartnerDept] = useState('');
  const [newStatus, setNewStatus] = useState('Sourcing (ソーシング)');
  const [newBizDevStatus, setNewBizDevStatus] = useState('Not Started / N/A (未着手 / 対象外)');
  const [newScore, setNewScore] = useState(3);
  const [newTagline, setNewTagline] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newFoundedYear, setNewFoundedYear] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFunding, setNewFunding] = useState('');
  const [newInvestmentMemo, setNewInvestmentMemo] = useState('');
  const [newBizDevNotes, setNewBizDevNotes] = useState('');

  const sectors = ['SaaS', 'AI / ML', 'Fintech', 'CleanTech', 'HealthTech', 'Robotics', 'IoT', 'Logistics', 'Mobility', 'Other'];
  const stages = ['Pre-Seed', 'Seed', 'Early', 'Series A', 'Series B', 'Series C+', 'Growth', 'N/A (一般企業)'];
  const dealSourceOptions = ['VC / アクセラレーター紹介', '銀行・証券会社紹介', 'ピッチイベント・展示会', '直接コンタクト・Web応募', '社内事業部・役員紹介', 'その他'];

  const investmentStatuses = [
    'Sourcing (ソーシング)',
    'Initial Contact (初回面談)',
    'Review / Detailed Screening (詳細検討・定例)',
    'Due Diligence (デューデリジェンス)',
    'Investment Committee (投資委員会)',
    'Invested / Portfolio (投資済・LP出資)',
    'Passed / Archived (見送り・終了)'
  ];

  const bizDevStatuses = [
    'Not Started / N/A (未着手 / 対象外)',
    'Collaboration Review (協業検討中・ニーズ調査)',
    'POC Consideration (POC検討・要件定義)',
    'POC Executing (POC実施・実証実験中)',
    'POC Completed (POC実施済・効果検証中)',
    'Commercialized / Partnered (事業化・本導入・業務提携)'
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

  // Filtered List
  const filteredStartups = startups.filter(startup => {
    const isEnterprise = startup.companyType === 'enterprise';
    const matchesType = companyType === 'enterprise' ? isEnterprise : !isEnterprise;

    const matchesSearch = 
      String(startup.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (startup.tagline && String(startup.tagline).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.contactPerson && String(startup.contactPerson).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.internalPartnerDept && String(startup.internalPartnerDept).toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Priority filter logic
    let matchesPriority = true;
    const scoreVal = Number(startup.score || 0);
    if (selectedPriority === '5') matchesPriority = scoreVal === 5;
    else if (selectedPriority === '4+') matchesPriority = scoreVal >= 4;
    else if (selectedPriority === '3+') matchesPriority = scoreVal >= 3;
    else if (selectedPriority === '2') matchesPriority = scoreVal === 2;
    else if (selectedPriority === '1') matchesPriority = scoreVal === 1;

    // Incomplete tasks filter logic
    const matchesTasks = hasIncompleteTasksOnly 
      ? (startup.tasks || []).some(t => !t.completed) 
      : true;

    const matchesSector = selectedSector ? startup.sector === selectedSector : true;
    const matchesStage = selectedStage ? startup.stage === selectedStage : true;
    const matchesInvestStatus = selectedInvestStatus ? (startup.status === selectedInvestStatus || (typeof startup.status === 'string' && startup.status.includes(selectedInvestStatus))) : true;
    const matchesBizDevStatus = selectedBizDevStatus ? (startup.bizDevStatus === selectedBizDevStatus || (typeof startup.bizDevStatus === 'string' && startup.bizDevStatus.includes(selectedBizDevStatus))) : true;
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
      contactPerson: newContactPerson,
      internalPartnerDept: newInternalPartnerDept,
      status: newStatus,
      bizDevStatus: newBizDevStatus,
      score: Number(newScore),
      tagline: newTagline,
      website: newWebsite,
      foundedYear: newFoundedYear || `${new Date().getFullYear()}年`,
      location: newLocation || 'Unknown',
      funding: newFunding,
      investmentMemo: newInvestmentMemo,
      bizDevNotes: newBizDevNotes,
      tasks: []
    };

    onAddStartup(newStartupObj);
    
    // Reset Form
    setNewName('');
    setNewSector('SaaS');
    setNewStage('Seed');
    setNewDealSource('VC / アクセラレーター紹介');
    setNewDealSourceDetail('');
    setNewContactPerson('');
    setNewInternalPartnerDept('');
    setNewStatus('Sourcing (ソーシング)');
    setNewBizDevStatus('Not Started / N/A (未着手 / 対象外)');
    setNewScore(3);
    setNewTagline('');
    setNewWebsite('');
    setNewFoundedYear('');
    setNewLocation('');
    setNewFunding('');
    setNewInvestmentMemo('');
    setNewBizDevNotes('');
    setIsAddModalOpen(false);
  };

  const getInvestmentStatusColor = (status) => {
    const s = String(status || '');
    if (s.includes("Sourcing")) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
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

          {/* Priority Definition Guide Button */}
          <button
            type="button"
            onClick={() => setIsPriorityGuideOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold shadow-xs transition-all min-h-[40px] text-xs"
            title="優先度 (★1〜★5) の定義と判断基準"
          >
            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>優先度定義</span>
          </button>

          {/* Column Visibility Selector with Presets & Bulk On/Off */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold shadow-sm transition-all min-h-[40px] text-xs"
              title="表示列のワンクリック切替・一括設定"
            >
              <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>表示設定</span>
            </button>
            
            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4 flex flex-col space-y-4 animate-scale-up">
                
                {/* 1. Presets Header (ワンクリックまとめ表示) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      ワンクリック・表示プリセット
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {Object.entries(COLUMN_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setVisibleColumns(prev => ({ ...prev, ...preset.columns, name: true }));
                          if (showToast) showToast(`プリセット「${preset.name}」を適用しました`, 'info');
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 text-left transition-all group"
                      >
                        <div className="flex items-center space-x-1 font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          <span>{preset.icon}</span>
                          <span className="truncate">{preset.name}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {preset.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Bulk Action Buttons (一括On/Off) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">列の一括切替</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn = Object.keys(visibleColumns).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                        setVisibleColumns(allOn);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>全てON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allOff = Object.keys(visibleColumns).reduce((acc, k) => ({ ...acc, [k]: k === 'name' }), {});
                        setVisibleColumns(allOff);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1"
                    >
                      <EyeOff className="h-3 w-3" />
                      <span>全てOFF</span>
                    </button>
                  </div>
                </div>

                {/* 3. Individual Column Checkbox Grid */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 max-h-56 overflow-y-auto pr-1">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">個別列の表示 / 非表示</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries({
                      no: "No.",
                      name: "企業名 (固定)",
                      sector: "セクター",
                      stage: "ステージ",
                      dealSource: "案件流入元",
                      contactPerson: "窓口担当者",
                      tasks: "タスク・TODO",
                      score: "優先度評価",
                      status: "投資ステータス",
                      investmentMemo: "投資検討メモ",
                      bizDevStatus: "事業・PoC",
                      bizDevNotes: "事業開発メモ",
                      createdAtDate: "登録日",
                      location: "拠点 / Web"
                    }).map(([key, label]) => {
                      const isFixed = key === 'name';
                      return (
                        <label 
                          key={key} 
                          className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            visibleColumns[key] 
                              ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200' 
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isFixed}
                            checked={visibleColumns[key]}
                            onChange={() => !isFixed && setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                            className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                          />
                          <span className="truncate">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsColumnDropdownOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all"
                  >
                    閉じる
                  </button>
                </div>

              </div>
            )}
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

      {/* Filters Bar & Quick Filter Badges */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-4 shadow-sm backdrop-blur space-y-3">
        
        {/* Row 1: Search & Main Dropdowns */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="企業名や事業概要、担当者名、社内連携先で検索..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all text-sm"
            />
          </div>

          {/* Priority (★) Filter Dropdown (🌟 Recommended) */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`w-full sm:w-44 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-bold transition-all ${
                selectedPriority 
                  ? 'border-amber-400 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/40 ring-1 ring-amber-400/50' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">全 優先度 (★1〜5)</option>
              <option value="5">🔥 ★5: 絶対追う (最重要)</option>
              <option value="4+">⭐ ★4以上 (積極フォロー以上)</option>
              <option value="3+">👀 ★3以上 (継続Watch以上)</option>
              <option value="2">📄 ★2: 情報収集のみ</option>
              <option value="1">📁 ★1: (実質)見送り</option>
            </select>
          </div>

          {/* BizDev Status Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedBizDevStatus}
              onChange={(e) => setSelectedBizDevStatus(e.target.value)}
              className={`w-full sm:w-44 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-medium transition-all ${
                selectedBizDevStatus 
                  ? 'border-teal-400 text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-teal-400/50' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">全 事業・PoCステータス</option>
              {bizDevStatuses.map(st => <option key={st} value={st}>{st.split(" (")[0]}</option>)}
            </select>
          </div>

          {/* Investment Status Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedInvestStatus}
              onChange={(e) => setSelectedInvestStatus(e.target.value)}
              className={`w-full sm:w-40 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-medium transition-all ${
                selectedInvestStatus 
                  ? 'border-blue-400 text-blue-800 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-400/50' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">全 投資ステータス</option>
              {investmentStatuses.map(st => <option key={st} value={st}>{st.split(" (")[0]}</option>)}
            </select>
          </div>

          {/* Sector Filter Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className={`w-full sm:w-36 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-medium transition-all ${
                selectedSector 
                  ? 'border-indigo-400 text-indigo-800 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
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
              className={`w-full sm:w-32 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-medium transition-all ${
                selectedStage 
                  ? 'border-indigo-400 text-indigo-800 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">全ステージ</option>
              {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: ⚡ Quick Filter Badges (ワンクリック絞り込みタグ) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <span>クイック絞込:</span>
            </span>

            {/* Quick Badge: ★5 最重要 */}
            <button
              type="button"
              onClick={() => setSelectedPriority(prev => prev === '5' ? '' : '5')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedPriority === '5'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100'
              }`}
            >
              <span>🔥 ★5 最重要</span>
            </button>

            {/* Quick Badge: ★4以上 積極フォロー */}
            <button
              type="button"
              onClick={() => setSelectedPriority(prev => prev === '4+' ? '' : '4+')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedPriority === '4+'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100'
              }`}
            >
              <span>⭐ ★4以上</span>
            </button>

            {/* Quick Badge: 未完了タスクあり */}
            <button
              type="button"
              onClick={() => setHasIncompleteTasksOnly(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                hasIncompleteTasksOnly
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>📋 要タスク対応</span>
            </button>

            {/* Quick Badge: PoC進行中 */}
            <button
              type="button"
              onClick={() => setSelectedBizDevStatus(prev => prev ? '' : 'POC Executing (POC実施・実証実験中)')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedBizDevStatus.includes("POC")
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/50 hover:bg-teal-100'
              }`}
            >
              <Handshake className="h-3.5 w-3.5" />
              <span>🤝 PoC実施・検討中</span>
            </button>

            {/* Quick Badge: 投資DD・投資済 */}
            <button
              type="button"
              onClick={() => setSelectedInvestStatus(prev => prev ? '' : 'Due Diligence (デューデリジェンス)')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedInvestStatus.includes("DD") || selectedInvestStatus.includes("Invested")
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-100'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>💳 DD・投資中</span>
            </button>
          </div>

          {/* Active Filter Clear & Hit Count */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              表示: <strong className="text-slate-800 dark:text-slate-200">{filteredStartups.length}</strong> 件
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-all flex items-center gap-1"
                title="すべての検索・フィルター条件をリセット"
              >
                <X className="h-3 w-3" />
                <span>条件クリア</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* List of Startup Companies (Table View vs Grid View) */}
      {sortedStartups.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View Container */
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm backdrop-blur overflow-hidden flex flex-col">
            
            {/* 🌟 Top Sticky Horizontal Scroll & Width Controller Bar (ヘッダー直下の固定移動カーソル) */}
            <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <MoveHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>横スクロール移動カーソル:</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                  （ヘッダー右端の縦線バー <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">❙</span> ドラッグで列幅変更）
                </span>
              </div>

              {/* Slider & Quick Scroll Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleStepScroll('left')}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-xs"
                  title="左へスクロール"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={scrollProgress}
                    onChange={handleSliderChange}
                    className="w-36 sm:w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    title="横移動スライダー"
                  />
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 w-8">
                    {Math.round(scrollProgress)}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepScroll('right')}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-xs"
                  title="右へスクロール"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={resetColumnWidths}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-all ml-2"
                  title="列幅を初期値にリセット"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="hidden sm:inline">幅リセット</span>
                </button>
              </div>
            </div>

            {/* Scrollable Table View with Sticky Header and Resizable Columns */}
            <div 
              ref={tableContainerRef} 
              onScroll={handleTableScroll}
              className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto relative scroll-smooth"
            >
              <table className="text-left border-collapse text-xs table-fixed" style={{ minWidth: '100%' }}>
                <thead className="sticky top-0 z-20 shadow-xs">
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold select-none backdrop-blur">
                    
                    {/* Checkbox col */}
                    <th 
                      style={{ width: `${columnWidths.select}px`, minWidth: `${columnWidths.select}px` }} 
                      className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-900 py-3.5 px-3 text-center border-r border-slate-200/60 dark:border-slate-800/60"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.size === sortedStartups.length && sortedStartups.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </th>

                    {/* No. col */}
                    {visibleColumns.no && (
                      <th 
                        style={{ 
                          width: `${columnWidths.no}px`, 
                          minWidth: `${columnWidths.no}px`,
                          left: `${columnWidths.select}px` 
                        }} 
                        onClick={() => handleSort('no')} 
                        className="sticky z-20 bg-slate-100 dark:bg-slate-900 py-3.5 px-2 text-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center justify-center space-x-0.5">
                          <span>No.</span>
                          <SortIcon field="no" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('no', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Name col (Sticky) */}
                    {visibleColumns.name && (
                      <th 
                        style={{ 
                          width: `${columnWidths.name}px`, 
                          minWidth: `${columnWidths.name}px`,
                          left: `${columnWidths.select + (visibleColumns.no ? columnWidths.no : 0)}px` 
                        }} 
                        onClick={() => handleSort('name')} 
                        className="sticky z-20 bg-slate-100 dark:bg-slate-900 py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.4)] relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>企業名</span>
                          <SortIcon field="name" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('name', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Sector col */}
                    {visibleColumns.sector && (
                      <th 
                        style={{ width: `${columnWidths.sector}px`, minWidth: `${columnWidths.sector}px` }} 
                        onClick={() => handleSort('sector')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>セクター</span>
                          <SortIcon field="sector" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('sector', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Stage col */}
                    {visibleColumns.stage && (
                      <th 
                        style={{ width: `${columnWidths.stage}px`, minWidth: `${columnWidths.stage}px` }} 
                        onClick={() => handleSort('stage')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>ステージ</span>
                          <SortIcon field="stage" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('stage', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Deal Source col */}
                    {visibleColumns.dealSource && (
                      <th 
                        style={{ width: `${columnWidths.dealSource}px`, minWidth: `${columnWidths.dealSource}px` }} 
                        onClick={() => handleSort('dealSource')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>案件流入元</span>
                          <SortIcon field="dealSource" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('dealSource', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Contact Person col (New) */}
                    {visibleColumns.contactPerson && (
                      <th 
                        style={{ width: `${columnWidths.contactPerson}px`, minWidth: `${columnWidths.contactPerson}px` }} 
                        onClick={() => handleSort('contactPerson')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <UserCheck className="h-3.5 w-3.5 mr-0.5 text-blue-500" />
                          <span>窓口担当者</span>
                          <SortIcon field="contactPerson" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('contactPerson', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Tasks col (New) */}
                    {visibleColumns.tasks && (
                      <th 
                        style={{ width: `${columnWidths.tasks}px`, minWidth: `${columnWidths.tasks}px` }} 
                        className="py-3.5 px-4 relative group"
                      >
                        <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                          <ListTodo className="h-3.5 w-3.5 mr-0.5 text-indigo-500" />
                          <span>タスク・TODO</span>
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('tasks', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Priority Score col */}
                    {visibleColumns.score && (
                      <th 
                        style={{ width: `${columnWidths.score}px`, minWidth: `${columnWidths.score}px` }} 
                        onClick={() => handleSort('score')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>優先度</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPriorityGuideOpen(true);
                            }}
                            className="text-amber-500 hover:text-amber-600 p-0.5 rounded transition-transform hover:scale-110"
                            title="優先度 (★1〜★5) の定義と判断基準を見る"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                          <SortIcon field="score" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('score', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Status col */}
                    {visibleColumns.status && (
                      <th 
                        style={{ width: `${columnWidths.status}px`, minWidth: `${columnWidths.status}px` }} 
                        onClick={() => handleSort('status')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>投資ステータス</span>
                          <SortIcon field="status" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('status', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Investment Memo col */}
                    {visibleColumns.investmentMemo && (
                      <th 
                        style={{ width: `${columnWidths.investmentMemo}px`, minWidth: `${columnWidths.investmentMemo}px` }} 
                        onClick={() => handleSort('investmentMemo')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>投資検討メモ</span>
                          <SortIcon field="investmentMemo" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('investmentMemo', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* BizDev Status col */}
                    {visibleColumns.bizDevStatus && (
                      <th 
                        style={{ width: `${columnWidths.bizDevStatus}px`, minWidth: `${columnWidths.bizDevStatus}px` }} 
                        onClick={() => handleSort('bizDevStatus')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>事業・PoC / 連携先</span>
                          <SortIcon field="bizDevStatus" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('bizDevStatus', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* BizDev Notes col */}
                    {visibleColumns.bizDevNotes && (
                      <th 
                        style={{ width: `${columnWidths.bizDevNotes}px`, minWidth: `${columnWidths.bizDevNotes}px` }} 
                        onClick={() => handleSort('bizDevNotes')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>事業開発メモ</span>
                          <SortIcon field="bizDevNotes" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('bizDevNotes', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Registered Date col */}
                    {visibleColumns.createdAtDate && (
                      <th 
                        style={{ width: `${columnWidths.createdAtDate}px`, minWidth: `${columnWidths.createdAtDate}px` }} 
                        onClick={() => handleSort('createdAtDate')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>登録日</span>
                          <SortIcon field="createdAtDate" />
                        </div>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('createdAtDate', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Location / Web col */}
                    {visibleColumns.location && (
                      <th 
                        style={{ width: `${columnWidths.location}px`, minWidth: `${columnWidths.location}px` }} 
                        className="py-3.5 px-4 relative group"
                      >
                        <span>設立 / 拠点 / Web</span>
                        {/* 🌟 視認性の高いリサイズハンドル */}
                        <div 
                          onMouseDown={(e) => startResizing('location', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Actions col */}
                    <th style={{ width: `${columnWidths.actions}px`, minWidth: `${columnWidths.actions}px` }} className="py-3.5 px-4 text-right">
                      操作
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sortedStartups.map((startup) => {
                    const uncompletedTasks = (startup.tasks || []).filter(t => !t.completed);
                    const priorityInfo = PRIORITY_DEFINITIONS[startup.score] || PRIORITY_DEFINITIONS[3];
                    return (
                      <tr 
                        key={startup.id}
                        onClick={() => onSelectStartup(startup)}
                        className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                          selectedIds.has(startup.id) ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                        }`}
                      >
                        {/* Checkbox cell */}
                        <td 
                          style={{ width: `${columnWidths.select}px`, minWidth: `${columnWidths.select}px` }} 
                          className={`sticky left-0 z-10 py-3 px-3 text-center border-r border-slate-200/60 dark:border-slate-800/60 ${
                            selectedIds.has(startup.id) ? 'bg-blue-100 dark:bg-blue-900/90' : 'bg-white dark:bg-slate-900 group-hover:bg-blue-50/70 dark:group-hover:bg-slate-800'
                          } transition-colors`} 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(startup.id)}
                            onChange={(e) => toggleSelectOne(startup.id, e)}
                            className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                          />
                        </td>

                        {/* No. cell */}
                        {visibleColumns.no && (
                          <td 
                            style={{ 
                              width: `${columnWidths.no}px`, 
                              minWidth: `${columnWidths.no}px`,
                              left: `${columnWidths.select}px` 
                            }} 
                            className={`sticky z-10 py-3 px-2 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400 ${
                              selectedIds.has(startup.id) ? 'bg-blue-100 dark:bg-blue-900/90' : 'bg-white dark:bg-slate-900 group-hover:bg-blue-50/70 dark:group-hover:bg-slate-800'
                            } transition-colors`}
                          >
                            {startup.no}
                          </td>
                        )}

                        {/* Name & Tagline cell (Sticky + Wrapped with limit) */}
                        {visibleColumns.name && (
                          <td 
                            style={{ 
                              width: `${columnWidths.name}px`, 
                              minWidth: `${columnWidths.name}px`,
                              left: `${columnWidths.select + (visibleColumns.no ? columnWidths.no : 0)}px` 
                            }} 
                            className={`sticky z-10 py-3 px-4 border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.4)] ${
                              selectedIds.has(startup.id) ? 'bg-blue-100 dark:bg-blue-900/90' : 'bg-white dark:bg-slate-900 group-hover:bg-blue-50/70 dark:group-hover:bg-slate-800'
                            } transition-colors`}
                          >
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm truncate" title={startup.name}>
                              {startup.name}
                            </div>
                            {startup.tagline && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 break-words whitespace-normal max-h-12 overflow-y-auto mt-0.5 leading-relaxed" title={startup.tagline}>
                                {startup.tagline}
                              </div>
                            )}
                          </td>
                        )}

                        {/* Sector cell */}
                        {visibleColumns.sector && (
                          <td style={{ width: `${columnWidths.sector}px`, minWidth: `${columnWidths.sector}px` }} className="py-3 px-4">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium inline-block truncate max-w-full">
                              {startup.sector}
                            </span>
                          </td>
                        )}

                        {/* Stage cell */}
                        {visibleColumns.stage && (
                          <td style={{ width: `${columnWidths.stage}px`, minWidth: `${columnWidths.stage}px` }} className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
                              {startup.stage}
                            </span>
                          </td>
                        )}

                        {/* Deal Source cell (Wrapped) */}
                        {visibleColumns.dealSource && (
                          <td style={{ width: `${columnWidths.dealSource}px`, minWidth: `${columnWidths.dealSource}px` }} className="py-3 px-4">
                            <div className="max-h-16 overflow-y-auto break-words whitespace-normal text-[11px] text-slate-700 dark:text-slate-300 font-medium pr-1">
                              <div>{startup.dealSource || '未設定'}</div>
                              {startup.dealSourceDetail && (
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5" title={startup.dealSourceDetail}>
                                  {startup.dealSourceDetail}
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Contact Person cell (Wrapped with height limit) */}
                        {visibleColumns.contactPerson && (
                          <td style={{ width: `${columnWidths.contactPerson}px`, minWidth: `${columnWidths.contactPerson}px` }} className="py-3 px-4">
                            <div className="max-h-16 overflow-y-auto break-words whitespace-normal text-[11px] text-slate-700 dark:text-slate-300 font-medium pr-1" title={startup.contactPerson || '未設定'}>
                              {startup.contactPerson ? (
                                <div className="flex items-start space-x-1">
                                  <UserCheck className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                  <span>{startup.contactPerson}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600 text-[10px]">未登録</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Tasks cell (New) */}
                        {visibleColumns.tasks && (
                          <td style={{ width: `${columnWidths.tasks}px`, minWidth: `${columnWidths.tasks}px` }} className="py-3 px-4">
                            <div className="max-h-16 overflow-y-auto break-words whitespace-normal pr-1 space-y-1">
                              {uncompletedTasks.length > 0 ? (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                                      未完 {uncompletedTasks.length}件
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-700 dark:text-slate-200 line-clamp-2" title={uncompletedTasks[0].title}>
                                    • {uncompletedTasks[0].title}
                                    {uncompletedTasks[0].dueDate && (
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                                        ({uncompletedTasks[0].dueDate})
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>タスク完了 / なし</span>
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Priority Score cell (with tooltip & definition indicator) */}
                        {visibleColumns.score && (
                          <td 
                            style={{ width: `${columnWidths.score}px`, minWidth: `${columnWidths.score}px` }} 
                            className="py-3 px-4"
                            title={`優先度★${startup.score}: ${priorityInfo.label}\n${priorityInfo.desc}`}
                          >
                            <div className="flex items-center space-x-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3.5 w-3.5 ${i < startup.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                                />
                              ))}
                            </div>
                            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[95px]">
                              {priorityInfo.label.split('(')[0]}
                            </div>
                          </td>
                        )}

                        {/* Investment Status cell */}
                        {visibleColumns.status && (
                          <td style={{ width: `${columnWidths.status}px`, minWidth: `${columnWidths.status}px` }} className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getInvestmentStatusColor(startup.status)}`}>
                              {startup.status?.split(" (")?.[0]}
                            </span>
                          </td>
                        )}

                        {/* Investment Memo cell (Wrapped with height limit) */}
                        {visibleColumns.investmentMemo && (
                          <td style={{ width: `${columnWidths.investmentMemo}px`, minWidth: `${columnWidths.investmentMemo}px` }} className="py-3 px-4">
                            <div className="text-[11px] text-slate-600 dark:text-slate-350 max-h-16 overflow-y-auto break-words whitespace-normal leading-relaxed pr-1" title={startup.investmentMemo}>
                              {startup.investmentMemo || <span className="text-slate-400 dark:text-slate-600 text-[10px]">未記入</span>}
                            </div>
                          </td>
                        )}

                        {/* BizDev Status cell */}
                        {visibleColumns.bizDevStatus && (
                          <td style={{ width: `${columnWidths.bizDevStatus}px`, minWidth: `${columnWidths.bizDevStatus}px` }} className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getBizDevStatusColor(startup.bizDevStatus)}`}>
                              {startup.bizDevStatus?.split?.(" (")?.[0] || "未着手"}
                            </span>
                            {startup.internalPartnerDept && (
                              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 truncate max-w-full" title={startup.internalPartnerDept}>
                                🤝 {startup.internalPartnerDept}
                              </div>
                            )}
                          </td>
                        )}

                        {/* BizDev Notes cell (Wrapped with height limit) */}
                        {visibleColumns.bizDevNotes && (
                          <td style={{ width: `${columnWidths.bizDevNotes}px`, minWidth: `${columnWidths.bizDevNotes}px` }} className="py-3 px-4">
                            <div className="text-[11px] text-slate-600 dark:text-slate-350 max-h-16 overflow-y-auto break-words whitespace-normal leading-relaxed pr-1" title={startup.bizDevNotes}>
                              {startup.bizDevNotes || <span className="text-slate-400 dark:text-slate-600 text-[10px]">未記入</span>}
                            </div>
                          </td>
                        )}

                        {/* Registered Date cell */}
                        {visibleColumns.createdAtDate && (
                          <td style={{ width: `${columnWidths.createdAtDate}px`, minWidth: `${columnWidths.createdAtDate}px` }} className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {startup.createdAtDate || '2026/08/01'}
                          </td>
                        )}

                        {/* Location / Web cell (Wrapped) */}
                        {visibleColumns.location && (
                          <td style={{ width: `${columnWidths.location}px`, minWidth: `${columnWidths.location}px` }} className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            <div className="max-h-16 overflow-y-auto break-words whitespace-normal pr-1">
                              <div>{startup.foundedYear ? `設立: ${startup.foundedYear} / ` : ''}拠点: {startup.location}</div>
                              {startup.website && (
                                <a 
                                  href={startup.website} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                                >
                                  <Globe className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[120px]">{startup.website?.replace(/^https?:\/\//, '')}</span>
                                </a>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Detail button cell */}
                        <td style={{ width: `${columnWidths.actions}px`, minWidth: `${columnWidths.actions}px` }} className="py-3 px-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSelectStartup(startup); }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all min-h-[32px]"
                          >
                            詳細
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid of Startup Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStartups.map(startup => {
              const uncompletedTasks = (startup.tasks || []).filter(t => !t.completed);
              const priorityInfo = PRIORITY_DEFINITIONS[startup.score] || PRIORITY_DEFINITIONS[3];
              return (
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
                          {startup.no}
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

                    {/* Meta details: Sector, Location, Contact */}
                    <div className="space-y-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 mr-2">SECTOR</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                          {startup.sector}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                        <span>{startup.foundedYear ? `設立: ${startup.foundedYear} / ` : ''}拠点: {startup.location}</span>
                      </div>
                      {startup.contactPerson && (
                        <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium truncate">
                          <UserCheck className="h-3.5 w-3.5 text-blue-500 mr-1.5 shrink-0" />
                          <span className="truncate">窓口: {startup.contactPerson}</span>
                        </div>
                      )}
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
                          {startup.bizDevStatus?.split?.(" (")?.[0] || "未着手"}
                        </span>
                      </div>
                    </div>

                    {/* Task summary badge */}
                    {uncompletedTasks.length > 0 && (
                      <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                        <span className="flex items-center text-amber-800 dark:text-amber-300 font-bold gap-1 text-[11px]">
                          <ListTodo className="h-3.5 w-3.5" />
                          未完了タスク {uncompletedTasks.length}件
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[120px]">
                          {uncompletedTasks[0].title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Rating Stars + Definition Badge */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">優先度</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPriorityGuideOpen(true);
                        }}
                        className="text-amber-500 hover:text-amber-600 p-0.5"
                        title="優先度の定義を見る"
                      >
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {priorityInfo.label.split('(')[0]}
                      </span>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < startup.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 backdrop-blur">
          <SlidersHorizontal className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">指定のフィルター条件に該当するスタートアップが見つかりません。</p>
        </div>
      )}

      {/* 🌟 優先度定義ガイドモーダル (Priority Definition Guide Modal) */}
      {isPriorityGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
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
            <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                各社の詳細画面や新規登録時にもいつでも定義を確認できます。
              </span>
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

                  {/* Priority Star Rating with Interactive Definition Display */}
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
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${PRIORITY_DEFINITIONS[newScore]?.bg}`}>
                        ★{newScore}: {PRIORITY_DEFINITIONS[newScore]?.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setNewScore(val)}
                            className="p-1 rounded hover:scale-110 text-slate-300 dark:text-slate-700 transition-all focus:outline-none"
                            title={`★${val}: ${PRIORITY_DEFINITIONS[val]?.label}`}
                          >
                            <Star 
                              className={`h-6 w-6 ${val <= newScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        {PRIORITY_DEFINITIONS[newScore]?.desc}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">窓口担当者 (氏名・連絡先)</label>
                    <input 
                      type="text" 
                      placeholder="例: 山田 太郎 (CEO / yamada@example.com)" 
                      value={newContactPerson}
                      onChange={(e) => setNewContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">設立年</label>
                    <input 
                      type="text" 
                      placeholder="例: 2024年" 
                      value={newFoundedYear}
                      onChange={(e) => setNewFoundedYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">拠点</label>
                    <input 
                      type="text" 
                      placeholder="例: 東京" 
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
