import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Briefcase, 
  ChevronRight, 
  Search, 
  Calendar,
  Handshake
} from 'lucide-react';

export default function Dashboard({ startups, meetings, onSelectStartup, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Calculate Metrics
  const totalPipeline = startups.length;
  const totalMeetings = meetings.length;
  
  const activeDD = startups.filter(s => 
    s.status === "Due Diligence (DD実施中)" || s.status?.includes("DD")
  ).length;

  const activeBizDev = startups.filter(s => 
    s.bizDevStatus && !s.bizDevStatus.includes("Not Started") && !s.bizDevStatus.includes("未着手")
  ).length;

  const portfolioInvestments = startups.filter(s => 
    s.status === "Invested (Portfolio) (投資実行済 / ポートフォリオ)" || s.status?.includes("Invested") || s.status?.includes("ポートフォリオ")
  ).length;

  // 2. Investment Funnel Progress Data
  const investmentStages = [
    { label: "Sourcing", jp: "ソーシング", match: ["Sourcing", "ソーシング"] },
    { label: "Initial Meeting", jp: "初回面談済", match: ["Initial Meeting", "初回面談済"] },
    { label: "Deep Review", jp: "詳細検討中", match: ["Deep Review", "詳細検討中"] },
    { label: "Due Diligence", jp: "DD実施中", match: ["Due Diligence (DD実施中)", "DD実施中"] },
    { label: "Investment Committee", jp: "投資委員会", match: ["Investment Committee", "投資委員会"] },
    { label: "Invested", jp: "投資実行済", match: ["Invested (Portfolio) (投資実行済 / ポートフォリオ)", "投資実行済"] }
  ];

  const investmentCounts = investmentStages.map(stage => {
    const count = startups.filter(s => 
      stage.match.some(m => s.status === m || (typeof s.status === 'string' && s.status.includes(m)))
    ).length;
    return { ...stage, count };
  });

  // 3. BizDev Funnel Progress Data
  const bizDevStages = [
    { label: "Sourcing", jp: "ソーシング", match: ["Sourcing", "ソーシング"] },
    { label: "Initial Meeting", jp: "初回面談済", match: ["Initial Meeting", "初回面談済"] },
    { label: "Collaboration Review", jp: "協業検討中", match: ["Collaboration Review", "協業検討中"] },
    { label: "POC Consideration", jp: "POC検討中", match: ["POC Consideration", "POC検討中"] },
    { label: "POC Executing", jp: "POC実施中", match: ["POC Executing", "POC実施中"] },
    { label: "POC Completed", jp: "POC実施済", match: ["POC Completed", "POC実施済"] },
    { label: "Commercialized", jp: "事業化・提携済", match: ["Commercialized", "事業化"] }
  ];

  const bizDevCounts = bizDevStages.map(stage => {
    const count = startups.filter(s => 
      stage.match.some(m => s.bizDevStatus === m || (typeof s.bizDevStatus === 'string' && s.bizDevStatus.includes(m)))
    ).length;
    return { ...stage, count };
  });

  // 4. Sector Distribution Chart Data (with Smart Fuzzy Matching)
  const sectorCategories = [
    { name: "AI", keywords: ["AI", "DeepTech"] },
    { name: "SaaS / Enterprise", keywords: ["SaaS", "Enterprise"] },
    { name: "Fintech", keywords: ["Fintech"] },
    { name: "Healthtech", keywords: ["Health", "Bio"] },
    { name: "ClimateTech", keywords: ["Climate", "Clean", "GX"] },
    { name: "Logistics / Mobility", keywords: ["Logistics", "Mobility"] },
    { name: "Retail / Commerce", keywords: ["Retail", "Commerce"] },
    { name: "HRTech", keywords: ["HR", "Work"] },
    { name: "Web3 / Crypto", keywords: ["Web3", "Crypto"] }
  ];
  
  const sectorCounts = sectorCategories.map(cat => {
    const count = startups.filter(s => 
      cat.keywords.some(k => typeof s.sector === 'string' && s.sector.toLowerCase().includes(k.toLowerCase()))
    ).length;
    return { name: cat.name, count };
  });

  // Count others
  const matchedTotal = sectorCounts.reduce((acc, curr) => acc + curr.count, 0);
  const othersCount = Math.max(startups.length - matchedTotal, 0);
  
  const allSectorData = [
    ...sectorCounts,
    { name: "Others", count: othersCount }
  ].filter(d => d.count > 0);

  // 5. Intelligence Feed (last 4 meetings)
  const sortedMeetings = [...(meetings || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredMeetings = sortedMeetings.filter(m => {
    const startup = startups.find(s => s.id === m.startupId);
    const searchString = `${startup?.name || ''} ${m.purpose || ''} ${m.notes || ''} ${Array.isArray(m.attendees) ? m.attendees.join(' ') : ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          CVC & 事業開発 ダッシュボード
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          投資パイプラインと事業会社連携（PoC・協業）の統合モニタリング。
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "全パイプライン", value: totalPipeline, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { title: "総面談ログ数", value: totalMeetings, icon: Calendar, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
          { title: "DD実施中", value: activeDD, icon: Activity, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
          { title: "PoC・協業中", value: activeBizDev, icon: Handshake, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/40" },
          { title: "ポートフォリオ", value: portfolioInvestments, icon: Briefcase, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={() => setActiveTab(idx === 1 ? 'meetings' : 'directory')}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.title}</span>
              <div className={`p-2 rounded-xl ${item.bg}`}>
                <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{item.value}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 font-semibold">件</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Funnel Progress - Simultaneous Dual Track (occupies 2/3 on desktop) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-6 shadow-sm backdrop-blur">
          
          <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>パイプライン進捗（投資 ＆ 事業・PoC 同時比較）</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">投資検討と事業開発（PoC・協業）のフェーズ推移をリアルタイムに同時モニタリング。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Track: Investment Track */}
            <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-blue-200/50 dark:border-blue-900/50">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">💳 投資検討トラック</h3>
              </div>

              <div className="space-y-3">
                {investmentCounts.map((stage, idx) => {
                  const maxInvest = Math.max(...investmentCounts.map(f => f.count), 1);
                  const percentage = (stage.count / maxInvest) * 100;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{stage.jp}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{stage.count} 件</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${stage.count > 0 ? Math.max(percentage, 10) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Track: BizDev Track */}
            <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-emerald-200/50 dark:border-emerald-900/50">
                <Handshake className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">🤝 事業開発・PoCトラック</h3>
              </div>

              <div className="space-y-3">
                {bizDevCounts.map((stage, idx) => {
                  const maxBizDev = Math.max(...bizDevCounts.map(f => f.count), 1);
                  const percentage = (stage.count / maxBizDev) * 100;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{stage.jp}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{stage.count} 件</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${stage.count > 0 ? Math.max(percentage, 10) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Sector Distribution - Proposal A: Progress Bar List (Right Column) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-6 shadow-sm backdrop-blur flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                  <span>セクター別構成比（上位順）</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">登録企業の技術・事業領域割合。</p>
              </div>
            </div>

            <div className="space-y-4">
              {allSectorData.length > 0 ? (
                allSectorData
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => {
                    const percentage = Math.round((item.count / totalPipeline) * 100);
                    const colorGradients = [
                      'from-blue-500 to-indigo-600',
                      'from-teal-500 to-emerald-600',
                      'from-purple-500 to-violet-600',
                      'from-amber-500 to-orange-600',
                      'from-pink-500 to-rose-600',
                      'from-sky-500 to-cyan-600',
                      'from-slate-500 to-slate-700'
                    ];
                    const gradient = colorGradients[index % colorGradients.length];

                    return (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{item.count} 件</span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">({percentage}%)</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden p-0.5">
                          <div 
                            className={`bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-500 ease-out`} 
                            style={{ width: `${Math.max(percentage, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">登録スタートアップデータがありません。</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Intelligence Feed Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">最新インテリジェンス・フィード</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">直近の面談ログおよびGeminiシナジー評価結果。</p>
          </div>
          
          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="フィード内を検索..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {/* Intelligence Cards */}
        {filteredMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMeetings.map(meeting => {
              const startup = startups.find(s => s.id === meeting.startupId);
              return (
                <div 
                  key={meeting.id}
                  onClick={() => startup && onSelectStartup(startup)}
                  className="group relative rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950/60 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {startup?.name || 'Unknown Startup'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/50">
                          {startup?.sector || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {meeting.date}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
                        {meeting.purpose}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {meeting.notes}
                    </p>
                  </div>

                  {meeting.aiBrief ? (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span className="font-semibold">AIシナジー要約あり</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex items-center font-medium">
                        プロファイルを開く <ChevronRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end text-xs">
                      <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 flex items-center font-medium">
                        プロファイルを開く <ChevronRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">検索条件に一致する面談ログがありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
