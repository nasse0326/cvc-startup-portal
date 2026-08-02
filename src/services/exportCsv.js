export const exportStartupsToCSV = (startups, filename = "CVC_Startups_List.csv") => {
  if (!startups || startups.length === 0) return false;

  const headers = [
    "企業名 (Name)",
    "セクター (Sector)",
    "調達ステージ (Stage)",
    "投資ステータス (Investment Status)",
    "事業・PoCステータス (BizDev Status)",
    "優先度評価 (Score)",
    "事業概要 (Tagline)",
    "Webサイト (Website)",
    "設立・拠点 (Location)",
    "資金調達・メモ (Funding)"
  ];

  const rows = startups.map(s => [
    s.name || "",
    s.sector || "",
    s.stage || "",
    s.status || "",
    s.bizDevStatus || "",
    s.score || "",
    s.tagline || "",
    s.website || "",
    s.location || "",
    s.funding || ""
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
