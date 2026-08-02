import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Briefcase, 
  ChevronRight, 
  Search, 
  Calendar,
  Layers,
  Handshake
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function Dashboard({ startups, meetings, onSelectStartup, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFunnelTab, setActiveFunnelTab] = useState('investment'); // 'investment' | 'bizdev'

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
      stage.match.some(m => s.status === m || s.status?.includes(m))
    ).length;
    return { ...stage, count };
  });

  // 3. BizDev Funnel Progress Data
  const bizDevStages = [
    { label: "Collaboration Review", jp: "協業検討中", match: ["Collaboration Review", "協業検討中"] },
    { label: "POC Consideration", jp: "POC検討中", match: ["POC Consideration", "POC検討中"] },
    { label: "POC Executing", jp: "POC実施中", match: ["POC Executing", "POC実施中"] },
    { label: "POC Completed", jp: "POC実施済", match: ["POC Completed", "POC実施済"] },
    { label: "Commercialized", jp: "事業化・提携済", match: ["Commercialized", "事業化"] }
  ];

  const bizDevCounts = bizDevStages.map(stage => {
    const count = startups.filter(s => 
      stage.match.some(m => s.bizDevStatus === m || s.bizDevStatus?.includes(m))
    ).length;
    return { ...stage, count };
  });

  const currentCounts = activeFunnelTab === 'investment' ? investmentCounts : bizDevCounts;
  const maxCount = Math.max(...currentCounts.map(f => f.count), 1);

  // 4. Sector Distribution Chart Data
  const sectors = ["AI", "SaaS / Enterprise", "Fintech", "Healthtech", "ClimateTech", "Logistics / Mobility", "Retail / Commerce", "HRTech", "Web3 / Crypto", "Others"];
  
  const sectorData = sectors.map(sector => {
    const count = startups.filter(s => {
      if (sector === "Others") {
        return !sectors.slice(0, -1).includes(s.sector);
      }
      return s.sector === sector;
    }).length;
    return { name: sector, value: count };
  }).filter(d => d.value > 0);

  const COLORS = [
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#10b981', // emerald
    '#f59e0b', // amber
    '#64748b'  // slate
  ];

  // 5. Intelligence Feed (last 4 meetings)
  const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const filteredMeetings = sortedMeetings.filter(m => {
    const startup = startups.find(s => s.id === m.startupId);
    const searchString = `${startup?.name || ''} ${m.purpose} ${m.notes} ${m.attendees?.join(' ')}`.toLowerCase();
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
        
        {/* Funnel Progress - Dual Track (occupies 2/3 on desktop) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-6 shadow-sm backdrop-blur">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">パイプライン進捗（デュアルトラック）</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">投資検討と事業開発（PoC・協業）のフェーズ推移。</p>
            </div>

            {/* Track Switcher Buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={() => setActiveFunnelTab('investment')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFunnelTab === 'investment'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>投資トラック</span>
              </button>

              <button
                onClick={() => setActiveFunnelTab('bizdev')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFunnelTab === 'bizdev'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Handshake className="h-3.5 w-3.5" />
                <span>事業・PoCトラック</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {currentCounts.map((stage, idx) => {
              const percentage = (stage.count / maxCount) * 100;
              const barGradient = activeFunnelTab === 'investment' 
                ? 'from-blue-500 to-indigo-600 group-hover:from-blue-400 group-hover:to-indigo-500'
                : 'from-teal-500 to-cyan-600 group-hover:from-teal-400 group-hover:to-cyan-500';

              return (
                <div key={idx} className="group relative">
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-400 dark:text-slate-600 w-5">{idx + 1}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{stage.jp}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">({stage.label})</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{stage.count} 件</span>
                  </div>
                  {/* Outer Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    {/* Inner Progress Bar */}
                    <div 
                      className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all duration-500 ease-out`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Distribution - Right Column */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-6 shadow-sm backdrop-blur flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">セクター比率</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">技術領域ごとのスタートアップ構成。</p>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>

            <div className="h-64 flex items-center justify-center">
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff' 
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-xs">登録スタートアップデータがありません。</div>
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
