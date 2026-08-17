import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  MapPin, 
  Globe, 
  LayoutGrid, 
  Table as TableIcon,
  X,
  SlidersHorizontal,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MoveHorizontal,
  Briefcase,
  Handshake,
  UserCheck,
  ListTodo,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Eye,
  EyeOff,
  RotateCw,
  AlertCircle,
  Table,
  Download
} from 'lucide-react';
import { exportStartupsToCSV } from '../services/exportCsv';
import VoiceInputButton from './VoiceInputButton';

// 🌟 検討Type (Engagement Type) 定義
export const ENGAGEMENT_TYPES = ['投資検討', '事業連携', '両方', '情報収集'];

// 🌟 優先度定義マッピング (ユーザー指定スキーマ)
export const PRIORITY_DEFINITIONS = {
  5: { level: 5, stars: "★★★★★", label: "5 絶対追う（今期重要）", desc: "最優先でDD・事業部門とのPoC協業検討を推進する最重要案件", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50" },
  4: { level: 4, stars: "★★★★☆", label: "4 積極フォロー", desc: "定期的な面談を実施し、事業連携や次回調達ラウンドを積極追跡する案件", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50" },
  3: { level: 3, stars: "★★★☆☆", label: "3 継続ウォッチ", desc: "四半期ごとの動向確認や市場展開の進捗を観察する案件", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/50" },
  2: { level: 2, stars: "★★☆☆☆", label: "2 情報収集のみ", desc: "業界リサーチの一環として登録。必要に応じた情報アップデートのみ", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  1: { level: 1, stars: "★☆☆☆☆", label: "1 実質見送り", desc: "現時点で投資・連携の可能性が極めて低く、アーカイブ対象の案件", color: "text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50" }
};

// 🌟 協業ステータス (1〜10) 定義
export const COLLAB_STATUS_OPTIONS = [
  "1 発掘",
  "2 面談済",
  "3 評価中",
  "4 事業部協議",
  "5 NDA",
  "6 PoC",
  "7 事業化検討",
  "8 事業化済",
  "9 保留",
  "10 クローズ"
];

// 🌟 協業 到達ステージ (Reached Stage, 1〜7) 定義
export const REACHED_STAGE_OPTIONS = [
  "1 発掘",
  "2 面談",
  "3 技術評価",
  "4 事業部紹介",
  "5 NDA",
  "6 PoC",
  "7 事業化"
];

// 🌟 投資ステータス (1〜8) 定義
export const INVESTMENT_STATUS_OPTIONS = [
  "1 ソーシング",
  "2 初回面談済",
  "3 詳細検討中",
  "4 DD中",
  "5 IC承認",
  "6 投資実行済",
  "7 保留",
  "8 見送り"
];

// 🌟 投資 到達ステージ (1〜6) 定義
export const INVESTMENT_REACHED_STAGE_OPTIONS = [
  "1 ソーシング",
  "2 初回面談",
  "3 詳細検討",
  "4 DD",
  "5 投資委員会",
  "6 投資実行"
];

// 🌟 投資 見送り・クローズ理由 定番サジェスト
export const INVESTMENT_CLOSE_REASONS = [
  "Valuation/株価目線不一致",
  "市場規模(TAM)・成長性懸念",
  "競合優位性・Moat不足",
  "Unit Economics/収益化モデル懸念",
  "チーム・経営陣体制の懸念",
  "リード投資家不在/調達枠終了",
  "CVC投資テーマ・ファンド基準外"
];

// 🌟 協業 見送り・クローズ理由 定番サジェスト
export const COLLAB_CLOSE_REASONS = [
  "事業部ニーズ/優先度不一致",
  "オンプレ/セキュリティ要件不適合",
  "価格帯/導入コストミスマッチ",
  "競合他社製品を採用済",
  "社内リソース/担当者不足",
  "製品完成度/機能不足",
  "時期尚早(将来再検討)"
];

// 🌟 復活可能性 (Revival Feasibility, A〜D) 定義
export const REVIVAL_FEASIBILITY_OPTIONS = [
  "A 高い",
  "B 普通",
  "C 低い",
  "D ほぼ無し"
];

// 協業ステータスカラーヘルパー
export const getCollabStatusColor = (status) => {
  if (!status) return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  if (status.includes("8 事業化済")) return "bg-emerald-600 text-white font-bold";
  if (status.includes("7 事業化検討")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold";
  if (status.includes("6 PoC")) return "bg-teal-500 text-white font-bold";
  if (status.includes("5 NDA")) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold";
  if (status.includes("4 事業部協議")) return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold";
  if (status.includes("3 評価中")) return "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800";
  if (status.includes("2 面談済")) return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800";
  if (status.includes("1 発掘")) return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
  if (status.includes("9 保留")) return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold";
  if (status.includes("10 クローズ")) return "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
};

// 投資ステータスカラーヘルパー
export const getInvestmentStatusColor = (status) => {
  if (!status) return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  const s = String(status);
  if (s.includes("6 投資実行済") || s.includes("Invested") || s.includes("Portfolio")) return "bg-emerald-600 text-white font-bold";
  if (s.includes("5 IC承認") || s.includes("Committee") || s.includes("投資委員会")) return "bg-indigo-600 text-white font-bold";
  if (s.includes("4 DD中") || s.includes("DD") || s.includes("Diligence")) return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold";
  if (s.includes("3 詳細検討中") || s.includes("Review") || s.includes("詳細検討")) return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold";
  if (s.includes("2 初回面談済") || s.includes("Initial")) return "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800";
  if (s.includes("1 ソーシング") || s.includes("Sourcing")) return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
  if (s.includes("7 保留")) return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold";
  if (s.includes("8 見送り") || s.includes("Passed") || s.includes("クローズ")) return "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
};

export const getEngagementTypeColor = (type) => {
  if (type === '投資検討') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/50';
  if (type === '事業連携') return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/50';
  if (type === '両方') return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/50 font-bold';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
};

export const getRevivalColor = (feasibility) => {
  if (!feasibility) return "text-slate-400";
  if (feasibility.includes("A")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold";
  if (feasibility.includes("B")) return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
  if (feasibility.includes("C")) return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  if (feasibility.includes("D")) return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
  return "text-slate-400";
};

// 🌟 表示列のワンクリック・プリセット定義
export const COLUMN_PRESETS = {
  default: {
    name: "標準 (総合)",
    icon: "🌟",
    desc: "Type・優先度・協業/投資ステータス・タスクを表示",
    columns: { 
      no: true, 
      name: true, 
      engagementType: true, 
      score: true, 
      collabStatus: true, 
      investmentStatus: true, 
      partnerDept: true, 
      tasks: true, 
      sector: true, 
      stage: true, 
      createdAtDate: true, 
      contactPerson: false, 
      reachedStage: false, 
      closeReason: false, 
      revivalScenario: false, 
      revivalFeasibility: false, 
      investmentReachedStage: false, 
      investmentCloseReason: false, 
      dealSource: false, 
      location: false 
    }
  },
  bizDev: {
    name: "🤝 協業・事業連携重視",
    icon: "🤝",
    desc: "協業ステータス・協業部署・到達ステージ・タスクに特化",
    columns: { 
      no: true, 
      name: true, 
      engagementType: true, 
      score: true, 
      collabStatus: true, 
      partnerDept: true, 
      reachedStage: true, 
      tasks: true, 
      contactPerson: true, 
      sector: true, 
      stage: false, 
      closeReason: false, 
      revivalScenario: false, 
      revivalFeasibility: false, 
      investmentStatus: false, 
      investmentReachedStage: false, 
      investmentCloseReason: false, 
      dealSource: false, 
      createdAtDate: false, 
      location: false 
    }
  },
  investment: {
    name: "💳 投資検討重視",
    icon: "💳",
    desc: "投資ステータス・到達ステージ・調達ステージ・流入元に特化",
    columns: { 
      no: true, 
      name: true, 
      engagementType: true, 
      score: true, 
      investmentStatus: true, 
      investmentReachedStage: true, 
      stage: true, 
      dealSource: true, 
      tasks: true, 
      contactPerson: true, 
      sector: true, 
      collabStatus: false, 
      partnerDept: false, 
      reachedStage: false, 
      closeReason: false, 
      revivalScenario: false, 
      revivalFeasibility: false, 
      investmentCloseReason: false, 
      createdAtDate: true, 
      location: false 
    }
  },
  lostRevival: {
    name: "🔄 クローズ・復活検討",
    icon: "🔄",
    desc: "協業・投資それぞれの到達ステージ・理由・復活シナリオ",
    columns: { 
      no: true, 
      name: true, 
      engagementType: true, 
      score: true, 
      collabStatus: true, 
      reachedStage: true, 
      closeReason: true, 
      revivalScenario: true, 
      revivalFeasibility: true, 
      investmentStatus: true, 
      investmentReachedStage: true, 
      investmentCloseReason: true, 
      partnerDept: false, 
      contactPerson: false, 
      tasks: false, 
      sector: false, 
      stage: false, 
      dealSource: false, 
      createdAtDate: false, 
      location: false 
    }
  },
  compact: {
    name: "⚡ コンパクト",
    icon: "⚡",
    desc: "Type・優先度・主要ステータスのみの最小表示",
    columns: { 
      no: true, 
      name: true, 
      engagementType: true, 
      score: true, 
      collabStatus: true, 
      investmentStatus: true, 
      tasks: true, 
      partnerDept: false, 
      reachedStage: false, 
      closeReason: false, 
      revivalScenario: false, 
      revivalFeasibility: false, 
      investmentReachedStage: false, 
      investmentCloseReason: false, 
      contactPerson: false, 
      sector: false, 
      stage: false, 
      dealSource: false, 
      createdAtDate: false, 
      location: false 
    }
  },
  all: {
    name: "👁️ 全項目表示",
    icon: "👁️",
    desc: "すべての列をフル表示",
    columns: { 
      no: true, 
      name: true, 
      engagementType: true, 
      score: true, 
      collabStatus: true, 
      investmentStatus: true, 
      partnerDept: true, 
      reachedStage: true, 
      closeReason: true, 
      revivalScenario: true, 
      revivalFeasibility: true, 
      investmentReachedStage: true, 
      investmentCloseReason: true, 
      contactPerson: true, 
      tasks: true, 
      sector: true, 
      stage: true, 
      dealSource: true, 
      createdAtDate: true, 
      location: true 
    }
  }
};

const DEFAULT_COLUMN_WIDTHS = {
  select: 48,
  no: 60,
  name: 220,
  engagementType: 110,
  score: 110,
  collabStatus: 140,
  investmentStatus: 140,
  partnerDept: 170,
  reachedStage: 130,
  investmentReachedStage: 130,
  closeReason: 220,
  investmentCloseReason: 220,
  revivalFeasibility: 120,
  revivalScenario: 220,
  contactPerson: 170,
  tasks: 200,
  sector: 120,
  stage: 110,
  dealSource: 160,
  createdAtDate: 110,
  location: 160,
  actions: 80
};

export default function StartupList({ startups, onSelectStartup, onAddStartup, onBulkDeleteStartups, showToast }) {
  const [companyType, setCompanyType] = useState('startup'); // 'startup' | 'enterprise'
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [selectedEngagementType, setSelectedEngagementType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(''); // '' | '5' | '4+' | '3+' | '2' | '1'
  const [selectedCollabStatus, setSelectedCollabStatus] = useState('');
  const [selectedInvestmentStatus, setSelectedInvestmentStatus] = useState('');
  const [selectedRevivalFeasibility, setSelectedRevivalFeasibility] = useState('');
  const [hasIncompleteTasksOnly, setHasIncompleteTasksOnly] = useState(false);
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isPriorityGuideOpen, setIsPriorityGuideOpen] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('cvc_visible_columns_v2');
    if (saved) {
      try {
        return {
          ...COLUMN_PRESETS.default.columns,
          ...JSON.parse(saved)
        };
      } catch (e) {}
    }
    return COLUMN_PRESETS.default.columns;
  });

  useEffect(() => {
    localStorage.setItem('cvc_visible_columns_v2', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Column Widths (Resize)
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('cvc_column_widths_v2');
    if (saved) {
      try {
        return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return DEFAULT_COLUMN_WIDTHS;
  });

  useEffect(() => {
    localStorage.setItem('cvc_column_widths_v2', JSON.stringify(columnWidths));
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
    startWidth.current = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 140;

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

  // Form State (New Schema)
  const [newCompanyType, setNewCompanyType] = useState('startup');
  const [newEngagementType, setNewEngagementType] = useState('投資検討');
  const [newName, setNewName] = useState('');
  const [newCreatedAtDate, setNewCreatedAtDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSector, setNewSector] = useState('SaaS');
  const [newStage, setNewStage] = useState('Seed');
  const [newScore, setNewScore] = useState(3);
  const [newPartnerDept, setNewPartnerDept] = useState('');
  const [newCollabStatus, setNewCollabStatus] = useState('1 発掘');
  const [newReachedStage, setNewReachedStage] = useState('1 発掘');
  const [newCloseReason, setNewCloseReason] = useState('');
  const [newInvestmentStatus, setNewInvestmentStatus] = useState('1 ソーシング');
  const [newInvestmentReachedStage, setNewInvestmentReachedStage] = useState('1 ソーシング');
  const [newInvestmentCloseReason, setNewInvestmentCloseReason] = useState('');
  const [newRevivalFeasibility, setNewRevivalFeasibility] = useState('');
  const [newRevivalScenario, setNewRevivalScenario] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newDealSource, setNewDealSource] = useState('VC / アクセラレーター紹介');
  const [newDealSourceDetail, setNewDealSourceDetail] = useState('');
  const [showNewCollabSuggestions, setShowNewCollabSuggestions] = useState(false);
  const [showNewInvestSuggestions, setShowNewInvestSuggestions] = useState(false);
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

  // Company Type Counts
  const startupCount = startups.filter(s => s.companyType !== 'enterprise').length;
  const enterpriseCount = startups.filter(s => s.companyType === 'enterprise').length;

  // Filtered List
  const filteredStartups = startups.filter(startup => {
    const isEnterprise = startup.companyType === 'enterprise';
    const matchesType = companyType === 'enterprise' ? isEnterprise : !isEnterprise;

    const matchesSearch = 
      String(startup.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (startup.tagline && String(startup.tagline).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.contactPerson && String(startup.contactPerson).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.partnerDept && String(startup.partnerDept).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.internalPartnerDept && String(startup.internalPartnerDept).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.closeReason && String(startup.closeReason).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.investmentCloseReason && String(startup.investmentCloseReason).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.revivalScenario && String(startup.revivalScenario).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.investmentRevivalScenario && String(startup.investmentRevivalScenario).toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type Filter (Engagement Type)
    const matchesEngagement = selectedEngagementType 
      ? (startup.engagementType === selectedEngagementType || (selectedEngagementType === '投資検討' && !startup.engagementType))
      : true;

    // Priority filter logic
    let matchesPriority = true;
    const scoreVal = Number(startup.score || 0);
    if (selectedPriority === '5') matchesPriority = scoreVal === 5;
    else if (selectedPriority === '4+') matchesPriority = scoreVal >= 4;
    else if (selectedPriority === '3+') matchesPriority = scoreVal >= 3;
    else if (selectedPriority === '2') matchesPriority = scoreVal === 2;
    else if (selectedPriority === '1') matchesPriority = scoreVal === 1;

    // Collab Status Filter
    const matchesCollabStatus = selectedCollabStatus
      ? (startup.collabStatus === selectedCollabStatus || (typeof startup.collabStatus === 'string' && startup.collabStatus.includes(selectedCollabStatus)))
      : true;

    // Investment Status Filter
    const matchesInvestmentStatus = selectedInvestmentStatus
      ? (startup.status === selectedInvestmentStatus || startup.investmentStatus === selectedInvestmentStatus || (typeof startup.status === 'string' && startup.status.includes(selectedInvestmentStatus)))
      : true;

    // Revival Feasibility Filter
    const matchesRevival = selectedRevivalFeasibility
      ? (startup.revivalFeasibility === selectedRevivalFeasibility || (typeof startup.revivalFeasibility === 'string' && startup.revivalFeasibility.includes(selectedRevivalFeasibility)) ||
         startup.investmentRevivalFeasibility === selectedRevivalFeasibility || (typeof startup.investmentRevivalFeasibility === 'string' && startup.investmentRevivalFeasibility.includes(selectedRevivalFeasibility)))
      : true;

    // Incomplete tasks filter logic
    const matchesTasks = hasIncompleteTasksOnly 
      ? (startup.tasks || []).some(t => !t.completed) 
      : true;

    const matchesSector = selectedSector ? startup.sector === selectedSector : true;
    const matchesStage = selectedStage ? startup.stage === selectedStage : true;
    
    return matchesType && matchesSearch && matchesEngagement && matchesPriority && matchesCollabStatus && matchesInvestmentStatus && matchesRevival && matchesTasks && matchesSector && matchesStage;
  });

  // Clear all filters helper
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedEngagementType('');
    setSelectedPriority('');
    setSelectedCollabStatus('');
    setSelectedInvestmentStatus('');
    setSelectedRevivalFeasibility('');
    setHasIncompleteTasksOnly(false);
    setSelectedSector('');
    setSelectedStage('');
  };

  const hasActiveFilters = Boolean(
    searchTerm || 
    selectedEngagementType || 
    selectedPriority || 
    selectedCollabStatus || 
    selectedInvestmentStatus || 
    selectedRevivalFeasibility || 
    hasIncompleteTasksOnly || 
    selectedSector || 
    selectedStage
  );

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

  // Submit Handler (New Schema)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStartupObj = {
      name: newName,
      companyType: newCompanyType,
      engagementType: newEngagementType,
      createdAtDate: newCreatedAtDate ? newCreatedAtDate.replace(/-/g, '/') : new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      sector: newSector,
      stage: newCompanyType === 'enterprise' && newStage === 'Seed' ? 'N/A (一般企業)' : newStage,
      score: Number(newScore),
      partnerDept: newPartnerDept,
      internalPartnerDept: newPartnerDept,
      collabStatus: newCollabStatus,
      reachedStage: newReachedStage,
      closeReason: newCloseReason,
      status: newInvestmentStatus || '1 ソーシング',
      investmentStatus: newInvestmentStatus || '1 ソーシング',
      investmentReachedStage: newInvestmentReachedStage || '1 ソーシング',
      investmentCloseReason: newInvestmentCloseReason || '',
      revivalFeasibility: newRevivalFeasibility,
      revivalScenario: newRevivalScenario,
      investmentRevivalFeasibility: newRevivalFeasibility,
      investmentRevivalScenario: newRevivalScenario,
      contactPerson: newContactPerson,
      dealSource: newDealSource,
      dealSourceDetail: newDealSourceDetail,
      tagline: newTagline,
      website: newWebsite,
      foundedYear: newFoundedYear || `${new Date().getFullYear()}年`,
      location: newLocation || 'Unknown',
      funding: newFunding,
      investmentMemo: newInvestmentMemo,
      bizDevNotes: newBizDevNotes,
      bizDevStatus: newCollabStatus || '1 発掘',
      tasks: []
    };

    onAddStartup(newStartupObj);
    
    // Reset Form
    setNewName('');
    setNewEngagementType('投資検討');
    setNewSector('SaaS');
    setNewStage('Seed');
    setNewScore(3);
    setNewPartnerDept('');
    setNewCollabStatus('1 発掘');
    setNewReachedStage('1 発掘');
    setNewCloseReason('');
    setNewInvestmentStatus('1 ソーシング');
    setNewInvestmentReachedStage('1 ソーシング');
    setNewInvestmentCloseReason('');
    setNewRevivalFeasibility('');
    setNewRevivalScenario('');
    setNewContactPerson('');
    setNewDealSource('VC / アクセラレーター紹介');
    setNewDealSourceDetail('');
    setNewTagline('');
    setNewWebsite('');
    setNewFoundedYear('');
    setNewLocation('');
    setNewFunding('');
    setNewInvestmentMemo('');
    setNewBizDevNotes('');
    setIsAddModalOpen(false);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const filename = companyType === 'enterprise' 
      ? `CVC_Enterprises_${new Date().toISOString().split('T')[0]}.csv`
      : `CVC_Startups_${new Date().toISOString().split('T')[0]}.csv`;
    const success = exportStartupsToCSV(filteredStartups, filename);
    if (success) {
      if (showToast) showToast(`${filteredStartups.length}件の企業データを出力しました (新スキーマ/Excel対応)`, "success");
    } else {
      if (showToast) showToast("出力対象のデータがありません。", "warning");
    }
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
              ? '大手パートナー企業や事業会社との協業ステータス・PoC進捗・連携パイプライン管理。' 
              : '投資検討・事業連携・協業ステータス（1〜10）およびロスト・復活シナリオ管理。'}
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
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="テーブル表示（列幅変更・スクロール固定）"
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
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="カードグリッド表示"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>カード</span>
            </button>
          </div>

          {/* 🌟 優先度定義ガイドボタン */}
          <button
            type="button"
            onClick={() => setIsPriorityGuideOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-xs transition-all min-h-[44px]"
            title="優先度★1〜★5の定義・判断基準を確認"
          >
            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>優先度定義</span>
          </button>

          {/* 📋 表示設定ドロップダウン (プリセット ＆ 一括On/Off) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnDropdownOpen(prev => !prev)}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-xs transition-all min-h-[44px]"
              title="表示する列の選択・プリセット切り替え"
            >
              <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>表示設定</span>
            </button>

            {/* Dropdown Menu */}
            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-40 space-y-3 animate-scale-up">
                
                {/* 1. ワンクリック・プリセット切替 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 flex items-center justify-between">
                    <span>✨ 表示プリセット</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">ワンクリック切替</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(COLUMN_PRESETS).map(([presetKey, preset]) => (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => {
                          setVisibleColumns(preset.columns);
                          if (showToast) showToast(`プリセット「${preset.name}」を適用しました`, "info");
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all group"
                      >
                        <div className="flex items-center space-x-1 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          <span>{preset.icon}</span>
                          <span className="truncate">{preset.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {preset.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. 一括 On / Off ボタン */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">一括切替</span>
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

                {/* 3. 個別列のチェックボックス (カテゴリ別グループ) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 max-h-64 overflow-y-auto pr-1 space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">個別列の表示 / 非表示</div>
                  
                  {[
                    {
                      group: "🏢 基本項目",
                      items: [
                        { key: "no", label: "No." },
                        { key: "name", label: "企業名 (固定)" },
                        { key: "engagementType", label: "検討Type" },
                        { key: "score", label: "優先度評価" },
                        { key: "sector", label: "セクター" },
                        { key: "stage", label: "調達ステージ" },
                        { key: "createdAtDate", label: "登録日" },
                      ]
                    },
                    {
                      group: "🤝 協業・事業連携",
                      items: [
                        { key: "collabStatus", label: "協業ステータス" },
                        { key: "partnerDept", label: "協業部署" },
                        { key: "reachedStage", label: "協業到達ステージ" },
                        { key: "closeReason", label: "協業クローズ理由" },
                        { key: "revivalScenario", label: "協業復活シナリオ" },
                        { key: "revivalFeasibility", label: "協業復活可能性" },
                      ]
                    },
                    {
                      group: "💳 投資・出資",
                      items: [
                        { key: "investmentStatus", label: "投資ステータス" },
                        { key: "investmentReachedStage", label: "投資到達ステージ" },
                        { key: "investmentCloseReason", label: "投資見送り理由" },
                      ]
                    },
                    {
                      group: "📋 プロファイル・アクション",
                      items: [
                        { key: "contactPerson", label: "窓口担当者" },
                        { key: "tasks", label: "タスク・TODO" },
                        { key: "dealSource", label: "案件流入元" },
                        { key: "location", label: "拠点" },
                      ]
                    }
                  ].map((category) => (
                    <div key={category.group} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-0.5">
                        {category.group}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {category.items.map(({ key, label }) => {
                          const isFixed = key === 'name';
                          return (
                            <label 
                              key={key} 
                              className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                visibleColumns[key] 
                                  ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-semibold' 
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
                  ))}
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
            <span>CSV出力</span>
          </button>

          {/* Add Startup / Enterprise Button */}
          <button 
            onClick={() => {
              setNewCompanyType(companyType);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] min-h-[44px]"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>{companyType === 'enterprise' ? '一般企業を追加' : '企業を追加'}</span>
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

      {/* Filters Bar & Quick Filter Badges (新スキーマ対応) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-4 shadow-sm backdrop-blur space-y-3">
        
        {/* Row 1: Search & Main Dropdowns */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="企業名、概要、担当者、協業部署、クローズ理由、復活シナリオ等で検索..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all text-sm"
            />
          </div>

          {/* 検討Type Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedEngagementType}
              onChange={(e) => setSelectedEngagementType(e.target.value)}
              className={`w-full sm:w-36 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-bold transition-all ${
                selectedEngagementType 
                  ? 'border-purple-400 text-purple-800 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/40 ring-1 ring-purple-400/50' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">全 検討Type</option>
              {ENGAGEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Priority (★) Filter Dropdown */}
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
              <option value="5">🔥 ★5: 絶対追う (今期重要)</option>
              <option value="4+">⭐ ★4以上 (積極フォロー以上)</option>
              <option value="3+">👀 ★3以上 (継続ウォッチ以上)</option>
              <option value="2">📄 ★2: 情報収集のみ</option>
              <option value="1">📁 ★1: (実質)見送り</option>
            </select>
          </div>

          {/* 協業ステータス (1〜10) Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedCollabStatus}
              onChange={(e) => setSelectedCollabStatus(e.target.value)}
              className={`w-full sm:w-40 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-bold transition-all ${
                selectedCollabStatus 
                  ? 'border-teal-400 text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-teal-400/50' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">全 協業ステータス</option>
              {COLLAB_STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {/* 復活可能性 Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedRevivalFeasibility}
              onChange={(e) => setSelectedRevivalFeasibility(e.target.value)}
              className={`w-full sm:w-36 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl focus:outline-none text-xs font-medium transition-all ${
                selectedRevivalFeasibility 
                  ? 'border-emerald-400 text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-emerald-400/50' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <option value="">復活可能性: 全て</option>
              {REVIVAL_FEASIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>復活: {opt}</option>)}
            </select>
          </div>

          {/* Sector Filter Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full sm:w-32 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs font-medium text-slate-700 dark:text-slate-350 transition-all"
            >
              <option value="">全セクター</option>
              {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: ⚡ Quick Filter Badges (ワンクリック絞り込みタグ) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">
              クイック絞込:
            </span>

            {/* Quick Badge: ★5 今期重要 */}
            <button
              type="button"
              onClick={() => setSelectedPriority(prev => prev === '5' ? '' : '5')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedPriority === '5'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100'
              }`}
            >
              <span>🔥 ★5 今期重要</span>
            </button>

            {/* Quick Badge: ★4以上 */}
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

            {/* Quick Badge: 6 PoC・7 事業化検討 */}
            <button
              type="button"
              onClick={() => setSelectedCollabStatus(prev => prev ? '' : '6 PoC')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCollabStatus.includes("PoC") || selectedCollabStatus.includes("事業化")
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/50 hover:bg-teal-100'
              }`}
            >
              <Handshake className="h-3.5 w-3.5" />
              <span>🤝 PoC・事業化</span>
            </button>

            {/* Quick Badge: 復活可能性 A 高い */}
            <button
              type="button"
              onClick={() => setSelectedRevivalFeasibility(prev => prev === 'A 高い' ? '' : 'A 高い')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedRevivalFeasibility === 'A 高い'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100'
              }`}
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>🔄 復活可能性: 高</span>
            </button>

            {/* Quick Badge: クローズ・保留 */}
            <button
              type="button"
              onClick={() => setSelectedCollabStatus(prev => prev === '10 クローズ' ? '' : '10 クローズ')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCollabStatus === '10 クローズ' || selectedCollabStatus === '9 保流'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>📁 クローズ・保留</span>
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
          </div>

          {/* Active Filter Clear & Hit Count */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              該当: <strong className="text-slate-800 dark:text-slate-200">{filteredStartups.length}</strong> 件
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
            
            {/* Top Sticky Horizontal Scroll Bar */}
            <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <MoveHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>横スクロール移動:</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                  （ヘッダー右端の縦線 <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">❙</span> ドラッグで列幅変更）
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

            {/* Scrollable Table View */}
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
                        <div 
                          onMouseDown={(e) => startResizing('name', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 検討Type col */}
                    {visibleColumns.engagementType && (
                      <th 
                        style={{ width: `${columnWidths.engagementType}px`, minWidth: `${columnWidths.engagementType}px` }} 
                        onClick={() => handleSort('engagementType')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Type</span>
                          <SortIcon field="engagementType" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('engagementType', e)} 
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
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
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
                        <div 
                          onMouseDown={(e) => startResizing('score', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 協業ステータス col */}
                    {visibleColumns.collabStatus && (
                      <th 
                        style={{ width: `${columnWidths.collabStatus}px`, minWidth: `${columnWidths.collabStatus}px` }} 
                        onClick={() => handleSort('collabStatus')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>協業ステータス</span>
                          <SortIcon field="collabStatus" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('collabStatus', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 投資ステータス col */}
                    {visibleColumns.investmentStatus && (
                      <th 
                        style={{ width: `${columnWidths.investmentStatus}px`, minWidth: `${columnWidths.investmentStatus}px` }} 
                        onClick={() => handleSort('status')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>投資ステータス</span>
                          <SortIcon field="status" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('investmentStatus', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 協業部署 col */}
                    {visibleColumns.partnerDept && (
                      <th 
                        style={{ width: `${columnWidths.partnerDept}px`, minWidth: `${columnWidths.partnerDept}px` }} 
                        onClick={() => handleSort('partnerDept')} 
                        className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>協業部署</span>
                          <SortIcon field="partnerDept" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('partnerDept', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 協業 到達ステージ col */}
                    {visibleColumns.reachedStage && (
                      <th 
                        style={{ width: `${columnWidths.reachedStage}px`, minWidth: `${columnWidths.reachedStage}px` }} 
                        onClick={() => handleSort('reachedStage')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>協業 到達ステージ</span>
                          <SortIcon field="reachedStage" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('reachedStage', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 投資 到達ステージ col */}
                    {visibleColumns.investmentReachedStage && (
                      <th 
                        style={{ width: `${columnWidths.investmentReachedStage}px`, minWidth: `${columnWidths.investmentReachedStage}px` }} 
                        onClick={() => handleSort('investmentReachedStage')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>投資 到達ステージ</span>
                          <SortIcon field="investmentReachedStage" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('investmentReachedStage', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 協業 Close Reason col */}
                    {visibleColumns.closeReason && (
                      <th 
                        style={{ width: `${columnWidths.closeReason}px`, minWidth: `${columnWidths.closeReason}px` }} 
                        className="py-3.5 px-4 relative group"
                      >
                        <span>協業クローズ理由</span>
                        <div 
                          onMouseDown={(e) => startResizing('closeReason', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 投資 Close Reason col */}
                    {visibleColumns.investmentCloseReason && (
                      <th 
                        style={{ width: `${columnWidths.investmentCloseReason}px`, minWidth: `${columnWidths.investmentCloseReason}px` }} 
                        className="py-3.5 px-4 relative group"
                      >
                        <span>投資見送り理由</span>
                        <div 
                          onMouseDown={(e) => startResizing('investmentCloseReason', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 復活可能性 col */}
                    {visibleColumns.revivalFeasibility && (
                      <th 
                        style={{ width: `${columnWidths.revivalFeasibility}px`, minWidth: `${columnWidths.revivalFeasibility}px` }} 
                        onClick={() => handleSort('revivalFeasibility')} 
                        className="py-3.5 px-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
                      >
                        <div className="flex items-center space-x-1">
                          <span>復活可能性</span>
                          <SortIcon field="revivalFeasibility" />
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('revivalFeasibility', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* 復活シナリオ col */}
                    {visibleColumns.revivalScenario && (
                      <th 
                        style={{ width: `${columnWidths.revivalScenario}px`, minWidth: `${columnWidths.revivalScenario}px` }} 
                        className="py-3.5 px-4 relative group"
                      >
                        <span>復活シナリオ</span>
                        <div 
                          onMouseDown={(e) => startResizing('revivalScenario', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Contact Person col */}
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
                        <div 
                          onMouseDown={(e) => startResizing('contactPerson', e)} 
                          className="absolute right-0 top-0 bottom-0 w-3 flex items-center justify-center cursor-col-resize z-30 group/resizer hover:bg-blue-500/20 transition-colors" 
                          title="左右にドラッグして列幅を変更" 
                        >
                          <div className="w-[2px] h-4 bg-slate-300 dark:bg-slate-650 group-hover/resizer:bg-blue-500 group-hover/resizer:h-full transition-all rounded-full" />
                        </div>
                      </th>
                    )}

                    {/* Tasks col */}
                    {visibleColumns.tasks && (
                      <th 
                        style={{ width: `${columnWidths.tasks}px`, minWidth: `${columnWidths.tasks}px` }} 
                        className="py-3.5 px-4 relative group"
                      >
                        <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                          <ListTodo className="h-3.5 w-3.5 mr-0.5 text-indigo-500" />
                          <span>タスク・TODO</span>
                        </div>
                        <div 
                          onMouseDown={(e) => startResizing('tasks', e)} 
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
                        <div 
                          onMouseDown={(e) => startResizing('dealSource', e)} 
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
                    const partnerDeptDisplay = startup.partnerDept || startup.internalPartnerDept;
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

                        {/* Name & Tagline cell */}
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

                        {/* 検討Type cell */}
                        {visibleColumns.engagementType && (
                          <td style={{ width: `${columnWidths.engagementType}px`, minWidth: `${columnWidths.engagementType}px` }} className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getEngagementTypeColor(startup.engagementType || '投資検討')}`}>
                              {startup.engagementType || '投資検討'}
                            </span>
                          </td>
                        )}

                        {/* Priority Score cell */}
                        {visibleColumns.score && (
                          <td 
                            style={{ width: `${columnWidths.score}px`, minWidth: `${columnWidths.score}px` }} 
                            className="py-3 px-3"
                            title={`優先度: ${priorityInfo.label}\n${priorityInfo.desc}`}
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
                              {priorityInfo.label}
                            </div>
                          </td>
                        )}

                        {/* 協業ステータス cell */}
                        {visibleColumns.collabStatus && (
                          <td style={{ width: `${columnWidths.collabStatus}px`, minWidth: `${columnWidths.collabStatus}px` }} className="py-3 px-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-2xs ${getCollabStatusColor(startup.collabStatus || '1 発掘')}`}>
                              {startup.collabStatus || '1 発掘'}
                            </span>
                          </td>
                        )}

                        {/* 投資ステータス cell */}
                        {visibleColumns.investmentStatus && (
                          <td style={{ width: `${columnWidths.investmentStatus}px`, minWidth: `${columnWidths.investmentStatus}px` }} className="py-3 px-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-2xs ${getInvestmentStatusColor(startup.status || startup.investmentStatus || '1 ソーシング')}`}>
                              {startup.status || startup.investmentStatus || '1 ソーシング'}
                            </span>
                          </td>
                        )}

                        {/* 協業部署 cell */}
                        {visibleColumns.partnerDept && (
                          <td style={{ width: `${columnWidths.partnerDept}px`, minWidth: `${columnWidths.partnerDept}px` }} className="py-3 px-4">
                            <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium break-words whitespace-normal max-h-16 overflow-y-auto pr-1" title={partnerDeptDisplay || '未設定'}>
                              {partnerDeptDisplay ? (
                                <div className="flex items-start space-x-1">
                                  <span className="text-teal-600 dark:text-teal-400 shrink-0">🤝</span>
                                  <span>{partnerDeptDisplay}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600 text-[10px]">未設定</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* 協業 到達ステージ cell */}
                        {visibleColumns.reachedStage && (
                          <td style={{ width: `${columnWidths.reachedStage}px`, minWidth: `${columnWidths.reachedStage}px` }} className="py-3 px-3 font-medium text-slate-600 dark:text-slate-350 text-[11px]">
                            {startup.reachedStage ? (
                              <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900 font-mono text-[10px] font-bold">
                                {startup.reachedStage}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>
                            )}
                          </td>
                        )}

                        {/* 投資 到達ステージ cell */}
                        {visibleColumns.investmentReachedStage && (
                          <td style={{ width: `${columnWidths.investmentReachedStage}px`, minWidth: `${columnWidths.investmentReachedStage}px` }} className="py-3 px-3 font-medium text-slate-600 dark:text-slate-350 text-[11px]">
                            {startup.investmentReachedStage ? (
                              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-mono text-[10px] font-bold">
                                {startup.investmentReachedStage}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>
                            )}
                          </td>
                        )}

                        {/* 協業 Close Reason cell */}
                        {visibleColumns.closeReason && (
                          <td style={{ width: `${columnWidths.closeReason}px`, minWidth: `${columnWidths.closeReason}px` }} className="py-3 px-4">
                            <div className="text-[11px] text-slate-600 dark:text-slate-350 max-h-16 overflow-y-auto break-words whitespace-normal leading-relaxed pr-1" title={startup.closeReason}>
                              {startup.closeReason || <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>}
                            </div>
                          </td>
                        )}

                        {/* 投資 Close Reason cell */}
                        {visibleColumns.investmentCloseReason && (
                          <td style={{ width: `${columnWidths.investmentCloseReason}px`, minWidth: `${columnWidths.investmentCloseReason}px` }} className="py-3 px-4">
                            <div className="text-[11px] text-slate-600 dark:text-slate-350 max-h-16 overflow-y-auto break-words whitespace-normal leading-relaxed pr-1" title={startup.investmentCloseReason}>
                              {startup.investmentCloseReason || <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>}
                            </div>
                          </td>
                        )}

                        {/* 復活可能性 cell */}
                        {visibleColumns.revivalFeasibility && (
                          <td style={{ width: `${columnWidths.revivalFeasibility}px`, minWidth: `${columnWidths.revivalFeasibility}px` }} className="py-3 px-3">
                            {startup.revivalFeasibility ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${getRevivalColor(startup.revivalFeasibility)}`}>
                                {startup.revivalFeasibility}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>
                            )}
                          </td>
                        )}

                        {/* 復活シナリオ cell */}
                        {visibleColumns.revivalScenario && (
                          <td style={{ width: `${columnWidths.revivalScenario}px`, minWidth: `${columnWidths.revivalScenario}px` }} className="py-3 px-4">
                            <div className="text-[11px] text-slate-600 dark:text-slate-350 max-h-16 overflow-y-auto break-words whitespace-normal leading-relaxed pr-1" title={startup.revivalScenario}>
                              {startup.revivalScenario || <span className="text-slate-400 dark:text-slate-600 text-[10px]">-</span>}
                            </div>
                          </td>
                        )}

                        {/* Contact Person cell */}
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

                        {/* Tasks cell */}
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

                        {/* Deal Source cell */}
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

                        {/* Registered Date cell */}
                        {visibleColumns.createdAtDate && (
                          <td style={{ width: `${columnWidths.createdAtDate}px`, minWidth: `${columnWidths.createdAtDate}px` }} className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {startup.createdAtDate || '2026/08/01'}
                          </td>
                        )}

                        {/* Location / Web cell */}
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
          /* Grid of Startup Cards (New Schema) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStartups.map(startup => {
              const uncompletedTasks = (startup.tasks || []).filter(t => !t.completed);
              const priorityInfo = PRIORITY_DEFINITIONS[startup.score] || PRIORITY_DEFINITIONS[3];
              const partnerDeptDisplay = startup.partnerDept || startup.internalPartnerDept;
              return (
                <div 
                  key={startup.id}
                  onClick={() => onSelectStartup(startup)}
                  className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Name, Type, and Stage Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEngagementTypeColor(startup.engagementType || '投資検討')}`}>
                            {startup.engagementType || '投資検討'}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {startup.no}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {startup.name}
                        </h3>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30 shrink-0">
                        {startup.stage}
                      </span>
                    </div>

                    {/* Tagline */}
                    <p className="text-sm text-slate-650 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {startup.tagline}
                    </p>

                    {/* 協業ステータス ＆ 協業部署 バッジ */}
                    <div className="space-y-2 mb-4 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center">
                          <Handshake className="h-3 w-3 mr-1 text-teal-500" /> 協業ステータス
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs ${getCollabStatusColor(startup.collabStatus || '1 発掘')}`}>
                          {startup.collabStatus || '1 発掘'}
                        </span>
                      </div>

                      {partnerDeptDisplay && (
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">協業部署</span>
                          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 truncate max-w-[170px]">
                            {partnerDeptDisplay}
                          </span>
                        </div>
                      )}

                      {/* 到達ステージ & 復活可能性 (クローズ・保留時表示) */}
                      {(startup.closeReason || startup.revivalFeasibility || startup.collabStatus?.includes("クローズ") || startup.collabStatus?.includes("保留")) && (
                        <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">到達: {startup.reachedStage || '未設定'}</span>
                          {startup.revivalFeasibility && (
                            <span className={`px-1.5 py-0.2 rounded font-bold ${getRevivalColor(startup.revivalFeasibility)}`}>
                              復活: {startup.revivalFeasibility}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta details: Sector, Location, Contact */}
                    <div className="space-y-1.5 mb-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                          {startup.sector}
                        </span>
                        <span>{startup.location}</span>
                      </div>
                      {startup.contactPerson && (
                        <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium truncate pt-1">
                          <UserCheck className="h-3.5 w-3.5 text-blue-500 mr-1.5 shrink-0" />
                          <span className="truncate">窓口: {startup.contactPerson}</span>
                        </div>
                      )}
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
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-350">
                        {priorityInfo.label}
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
          <p className="text-slate-500 dark:text-slate-400 text-sm">指定のフィルター条件に該当する企業が見つかりません。</p>
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
                <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                詳細画面や新規登録時にもいつでも定義を確認できます。
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

      {/* 🚀 新規登録モーダル (New Schema 全項目対応) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {newCompanyType === 'enterprise' ? '新規一般企業・パートナー企業登録' : '新規スタートアップ登録'}
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* 1. 基本プロファイル＆評価 (Type & Priority) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    🏢 基本プロファイル＆評価
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Type Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業区分 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCompanyType('startup')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
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
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
                          newCompanyType === 'enterprise'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <span>🏢 一般企業</span>
                      </button>
                    </div>
                  </div>

                  {/* 検討Type (Engagement Type) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">検討Type *</label>
                    <select 
                      value={newEngagementType}
                      onChange={(e) => setNewEngagementType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
                    >
                      {ENGAGEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">企業名 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="例: Aegis AI 株式会社" 
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
                </div>

                {/* Priority Star Rating with Interactive Definition Display */}
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
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium">
                      {PRIORITY_DEFINITIONS[newScore]?.desc}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. 🤝 協業・パイプライン管理 (Collaboration Pipeline) */}
              <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-teal-200/50 dark:border-teal-900/50 pb-2">
                  <Handshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    🤝 協業・事業連携パイプライン (BizDev Pipeline)
                  </span>
                </div>

                {/* 事業開発メモ (協業パイプラインの一番始め) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">事業開発・PoC協業メモ</label>
                  <textarea 
                    rows="2"
                    placeholder="例: DX推進部とのPoC検討中。2026年Q3開始を目標に協議。"
                    value={newBizDevNotes}
                    onChange={(e) => setNewBizDevNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業ステータス *</label>
                    <select 
                      value={newCollabStatus}
                      onChange={(e) => setNewCollabStatus(e.target.value)}
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
                      value={newPartnerDept}
                      onChange={(e) => setNewPartnerDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業 到達ステージ</label>
                  <select 
                    value={newReachedStage}
                    onChange={(e) => setNewReachedStage(e.target.value)}
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
                      onClick={() => setShowNewCollabSuggestions(prev => !prev)}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{showNewCollabSuggestions ? '候補を閉じる' : '💡 候補から選ぶ'}</span>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="例: 価格帯ミスマッチ、オンプレ要件不適合" 
                    value={newCloseReason}
                    onChange={(e) => setNewCloseReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                  {showNewCollabSuggestions && (
                    <div className="flex flex-wrap gap-1 p-2 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 rounded-xl animate-fade-in">
                      <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold w-full mb-0.5">クリックで入力:</span>
                      {COLLAB_CLOSE_REASONS.map(reason => (
                        <button
                          type="button"
                          key={reason}
                          onClick={() => {
                            setNewCloseReason(reason);
                            setShowNewCollabSuggestions(false);
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
                    placeholder="例: 次世代SaaS版ローンチ時、シリーズB調達完了時" 
                    value={newRevivalScenario}
                    onChange={(e) => setNewRevivalScenario(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>

                {/* 協業 復活可能性 (復活シナリオの次) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">協業 復活可能性</label>
                  <select 
                    value={newRevivalFeasibility}
                    onChange={(e) => setNewRevivalFeasibility(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                  >
                    <option value="">未設定</option>
                    {REVIVAL_FEASIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {/* 3. 💳 投資・出資パイプライン管理 (Investment Pipeline) */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-blue-200/50 dark:border-blue-900/50 pb-2">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    💳 投資・出資パイプライン (Investment Pipeline)
                  </span>
                </div>

                {/* 投資検討メモ (投資パイプラインの一番始め) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資検討メモ・所見</label>
                  <textarea 
                    rows="2"
                    placeholder="例: 独自のアルゴリズムに競合優位性あり。シリーズA以降での本格検討を推奨。"
                    value={newInvestmentMemo}
                    onChange={(e) => setNewInvestmentMemo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資ステータス *</label>
                    <select 
                      value={newInvestmentStatus}
                      onChange={(e) => setNewInvestmentStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
                    >
                      {INVESTMENT_STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資 到達ステージ</label>
                    <select 
                      value={newInvestmentReachedStage}
                      onChange={(e) => setNewInvestmentReachedStage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                    >
                      {INVESTMENT_REACHED_STAGE_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">
                      投資 見送り理由 (自由記述)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewInvestSuggestions(prev => !prev)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{showNewInvestSuggestions ? '候補を閉じる' : '💡 候補から選ぶ'}</span>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="例: Valuation目線不一致、競合優位性不足" 
                    value={newInvestmentCloseReason}
                    onChange={(e) => setNewInvestmentCloseReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                  {showNewInvestSuggestions && (
                    <div className="flex flex-wrap gap-1 p-2 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl animate-fade-in">
                      <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold w-full mb-0.5">クリックで入力:</span>
                      {INVESTMENT_CLOSE_REASONS.map(reason => (
                        <button
                          type="button"
                          key={reason}
                          onClick={() => {
                            setNewInvestmentCloseReason(reason);
                            setShowNewInvestSuggestions(false);
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
                      value={newInvestmentRevivalScenario}
                      onChange={(e) => setNewInvestmentRevivalScenario(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase">投資 復活可能性</label>
                    <select 
                      value={newInvestmentRevivalFeasibility}
                      onChange={(e) => setNewInvestmentRevivalFeasibility(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 text-sm transition-all"
                    >
                      <option value="">未設定</option>
                      {REVIVAL_FEASIBILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. 企業詳細プロファイル (詳細情報) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    📋 詳細プロファイル・連絡先
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">窓口担当者 (氏名・連絡先)</label>
                    <input 
                      type="text" 
                      placeholder="例: 山田 太郎 (CEO / yamada@example.com)" 
                      value={newContactPerson}
                      onChange={(e) => setNewContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">案件流入元</label>
                    <select 
                      value={newDealSource}
                      onChange={(e) => setNewDealSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-sm transition-all"
                    >
                      {dealSourceOptions.map(src => <option key={src} value={src}>{src}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">セクター</label>
                    <select 
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-sm transition-all"
                    >
                      {sectors.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">調達ステージ</label>
                    <select 
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-700 dark:text-slate-350 text-sm transition-all"
                    >
                      {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">事業概要（一言タグライン）</label>
                    <VoiceInputButton onTranscript={(text) => setNewTagline(prev => prev ? `${prev} ${text}` : text)} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="例: 金融コンプライアンス監査ワークフロー向けの次世代生成AIセーフティガードレール。" 
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Webサイト URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com" 
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">設立年</label>
                    <input 
                      type="text" 
                      placeholder="例: 2024年" 
                      value={newFoundedYear}
                      onChange={(e) => setNewFoundedYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">拠点</label>
                    <input 
                      type="text" 
                      placeholder="例: 東京" 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all"
                    />
                  </div>
                </div>

                {/* 資金調達状況 (詳細プロファイルへ移動) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">資金調達履歴 (ラウンド / 評価額 / 引受先)</label>
                  <textarea 
                    rows="2"
                    placeholder="例: シードラウンドで1,500万を調達。主要投資家：グローバル・ブレイン。"
                    value={newFunding}
                    onChange={(e) => setNewFunding(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 transition-all min-h-[44px]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all min-h-[44px]"
                >
                  登録する
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
