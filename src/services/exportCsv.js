export const exportStartupsToCSV = (startups, filename = "CVC_Startups_List.csv") => {
  if (!startups || startups.length === 0) return false;

  const headers = [
    "No.",
    "企業名 (Name)",
    "検討Type (Engagement Type)",
    "企業種別 (Type)",
    "セクター (Sector)",
    "調達ステージ (Stage)",
    "登録日 (Registered Date)",
    "優先度評価 (Priority Score)",
    "窓口担当者 (Contact Person)",
    "協業部署 (Partner Dept)",
    "協業ステータス (Collab Status)",
    "到達ステージ (Reached Stage)",
    "クローズ理由 (Close Reason)",
    "復活可能性 (Revival Feasibility)",
    "復活シナリオ (Revival Scenario)",
    "設立年 (Founded Year)",
    "拠点 (Location)",
    "Webサイト (Website)",
    "事業概要 (Tagline)",
    "資金調達履歴 (Funding History)",
    "案件流入元 (Deal Source)",
    "案件流入元・詳細 (Deal Source Detail)",
    "投資ステータス (Investment Status)",
    "投資検討メモ (Investment Memo)",
    "事業・PoCステータス (BizDev Status)",
    "事業開発・PoC協業メモ (BizDev Notes)",
    "タスク (Tasks)"
  ];

  const rows = startups.map(s => [
    s.no || "",
    s.name || "",
    s.engagementType || "投資検討",
    s.companyType === 'enterprise' ? '一般企業' : 'スタートアップ',
    s.sector || "",
    s.stage || "",
    s.createdAtDate || "",
    s.score || "",
    s.contactPerson || "",
    s.partnerDept || s.internalPartnerDept || "",
    s.collabStatus || "1 発掘",
    s.reachedStage || "",
    s.closeReason || "",
    s.revivalFeasibility || "",
    s.revivalScenario || "",
    s.foundedYear || "",
    s.location || "",
    s.website || "",
    s.tagline || "",
    s.funding || "",
    s.dealSource || "",
    s.dealSourceDetail || "",
    s.status || "",
    s.investmentMemo || "",
    s.bizDevStatus || "",
    s.bizDevNotes || "",
    s.tasks && Array.isArray(s.tasks) ? s.tasks.map(t => `[${t.completed ? '完了' : '未完'}] ${t.title}${t.dueDate ? ` (期日: ${t.dueDate})` : ''}`).join(" / ") : ""
  ]);

  downloadCSV([headers, ...rows], filename);
  return true;
};

export const exportMeetingsToCSV = (meetings, startups, filename = "CVC_Meeting_Logs.csv") => {
  if (!meetings || meetings.length === 0) return false;

  const headers = [
    "企業名 (Startup)",
    "面談日 (Date)",
    "目的 (Purpose)",
    "同席者 (Attendees)",
    "面談メモ (Discussion Notes)",
    "ネクストステップ (Next Step)",
    "AI事業要約 (AI Summary)",
    "AIシナジー案 (AI Synergy)"
  ];

  const rows = meetings.map(m => {
    const startup = startups.find(s => s.id === m.startupId);
    return [
      startup?.name || "Unknown",
      m.date || "",
      m.purpose || "",
      m.attendees ? m.attendees.join("; ") : "",
      m.notes || "",
      m.nextStep || "",
      m.aiBrief?.summary ? m.aiBrief.summary.join(" / ") : "",
      m.aiBrief?.cvc_synergy || ""
    ];
  });

  downloadCSV([headers, ...rows], filename);
  return true;
};

const downloadCSV = (dataArray, filename) => {
  const csvContent = dataArray.map(row => 
    row.map(field => {
      const stringified = String(field || "").replace(/"/g, '""');
      return `"${stringified}"`;
    }).join(",")
  ).join("\r\n");

  // Add UTF-8 BOM (\uFEFF) so Excel opens Japanese characters cleanly without garbling
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
