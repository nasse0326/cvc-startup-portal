export const downloadImportTemplate = () => {
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
    "協業 到達ステージ (Collab Reached Stage)",
    "協業 クローズ理由 (Collab Close Reason)",
    "投資ステータス (Investment Status)",
    "投資 到達ステージ (Investment Reached Stage)",
    "投資 見送り理由 (Investment Close Reason)",
    "復活可能性 (Revival Feasibility)",
    "復活シナリオ / 次回検討トリガー (Revival Scenario)",
    "設立年 (Founded Year)",
    "拠点 (Location)",
    "Webサイト (Website)",
    "事業概要 (Tagline)",
    "資金調達履歴 (Funding History)",
    "案件流入元 (Deal Source)",
    "案件流入元・詳細 (Deal Source Detail)",
    "投資検討メモ (Investment Memo)",
    "事業開発・PoC協業メモ (BizDev Notes)",
    "タスク (Tasks)"
  ];

  const sampleRow1 = [
    "",
    "サンプルAI株式会社",
    "両方",
    "スタートアップ",
    "AI / ML",
    "Series A",
    "2026/08/01",
    "5",
    "山田 太郎 (CEO / yamada@sample-ai.example.com)",
    "DX推進部・法務部",
    "6 PoC",
    "6 PoC",
    "",
    "4 DD中",
    "4 DD",
    "",
    "A 高い",
    "シリーズB調達時、ARR 1億円達成時に再確認",
    "2024年",
    "東京",
    "https://example.com",
    "エンタープライズ向け生成AIソリューションの開発",
    "Series A 5億円 (2024/01) リード: 〇〇キャピタル",
    "VC / アクセラレーター紹介",
    "〇〇キャピタルの田中様からの紹介",
    "技術力・チームともに優秀。知財周りの確認が必要。",
    "社内ナレッジ検索の実証実験に向け提案中。",
    "[未完] 知財レビューの実施 (期日: 2026-08-30)"
  ];

  const sampleRow2 = [
    "",
    "大和ITソリューションズ",
    "事業連携",
    "一般企業",
    "SaaS",
    "N/A (一般企業)",
    "2026/08/05",
    "4",
    "佐藤 健 (アライアンス部長 / sato@example-enterprise.com)",
    "生産技術部第2課",
    "8 事業化済",
    "7 事業化",
    "",
    "6 投資実行済",
    "6 投資実行",
    "",
    "A 高い",
    "",
    "1998年",
    "東京",
    "https://example-enterprise.com",
    "大手製造業向け基幹システムの導入支援および協業パートナー",
    "資本金 10億円",
    "直接コンタクト・Web応募",
    "",
    "投資対象外だが、アセット連携・PoCパートナーとして非常に有力。",
    "製造ラインデータ連携のPoCを共同推進中。",
    "[未完] 次回PoC定例会の設定 (期日: 2026-08-25)"
  ];

  const csvContent = [headers, sampleRow1, sampleRow2]
    .map(row => row.map(field => `"${String(field || "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "CVC_Startups_Import_Template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseStartupsCSV = (csvText) => {
  if (!csvText || !csvText.trim()) return [];

  const lines = parseCSVToRows(csvText);
  if (lines.length <= 1) return [];

  const headers = lines[0].map(h => h.trim().toLowerCase());
  
  // Dynamic header resolution
  const getIdx = (keywords) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k.toLowerCase())));
  };

  const nameIdx = getIdx(["企業名", "name", "会社名", "スタートアップ名"]);
  const typeIdx = getIdx(["企業種別", "企業区分", "type"]);
  const engagementTypeIdx = getIdx(["検討type", "engagement type", "検討タイプ", "区分"]);
  const scoreIdx = getIdx(["優先度", "score", "rank", "重要度"]);
  const sectorIdx = getIdx(["セクター", "sector", "業種", "業界"]);
  const stageIdx = getIdx(["調達ステージ", "stage", "フェーズ"]);
  const noIdx = getIdx(["no.", "no", "番号", "id"]);
  const createdAtDateIdx = getIdx(["登録日", "登録年月日", "createdatdate", "date"]);
  const contactPersonIdx = getIdx(["担当者", "窓口", "contact"]);
  const partnerDeptIdx = getIdx(["協業部署", "連携部署", "partner dept", "partnerdept", "社内連携"]);
  const collabStatusIdx = getIdx(["協業ステータス", "collab status", "collabstatus", "協業進捗"]);
  const reachedStageIdx = getIdx(["協業 到達ステージ", "到達ステージ", "reached stage", "最高到達"]);
  const closeReasonIdx = getIdx(["協業 クローズ理由", "クローズ理由", "close reason", "ロスト理由"]);
  const investmentStatusIdx = getIdx(["投資ステータス", "investment status", "investmentstatus"]);
  const investmentReachedStageIdx = getIdx(["投資 到達ステージ", "投資到達ステージ", "investment reached stage"]);
  const investmentCloseReasonIdx = getIdx(["投資 見送り理由", "投資見送り理由", "投資クローズ理由", "investment close reason"]);
  const revivalFeasibilityIdx = getIdx(["復活可能性", "revival feasibility", "復活見込み"]);
  const revivalScenarioIdx = getIdx(["復活シナリオ", "次回検討トリガー", "revival scenario", "再打診"]);
  const foundedYearIdx = getIdx(["設立年", "founded", "設立"]);
  const locationIdx = getIdx(["拠点", "location", "所在地", "住所"]);
  const websiteIdx = getIdx(["web", "サイト", "url", "hp"]);
  const taglineIdx = getIdx(["事業概要", "tagline", "概要", "詳細"]);
  const fundingIdx = getIdx(["資金調達", "funding", "調達額"]);
  const dealSourceIdx = getIdx(["流入元", "deal source", "経由"]);
  const dealSourceDetailIdx = getIdx(["流入元・詳細", "流入詳細", "紹介者"]);
  const statusIdx = getIdx(["投資ステータス", "status", "パイプライン"]);
  const investmentMemoIdx = getIdx(["投資検討メモ", "investment memo", "投資メモ"]);
  const bizDevStatusIdx = getIdx(["事業・pocステータス", "bizdev status"]);
  const bizDevNotesIdx = getIdx(["事業開発・poc協業メモ", "bizdev notes", "協業メモ", "事業検討メモ", "事業メモ"]);
  const tasksIdx = getIdx(["タスク", "tasks", "todo"]);

  const parsedStartups = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || row.length === 0 || row.every(cell => !cell.trim())) continue;

    const name = nameIdx !== -1 ? row[nameIdx]?.trim() : row[0]?.trim();
    if (!name) continue;

    const scoreVal = scoreIdx !== -1 ? parseInt(row[scoreIdx], 10) : 3;
    const typeStr = typeIdx !== -1 && row[typeIdx] ? row[typeIdx].trim().toLowerCase() : "";
    const companyTypeVal = (typeStr.includes("一般") || typeStr.includes("大企業") || typeStr.includes("enterprise")) 
      ? "enterprise" 
      : "startup";

    const engagementTypeStr = engagementTypeIdx !== -1 && row[engagementTypeIdx] ? row[engagementTypeIdx].trim() : "";
    let engagementTypeVal = "投資検討";
    if (engagementTypeStr.includes("事業") || engagementTypeStr.includes("連携")) engagementTypeVal = "事業連携";
    else if (engagementTypeStr.includes("両方") || engagementTypeStr.includes("両")) engagementTypeVal = "両方";
    else if (engagementTypeStr.includes("情報") || engagementTypeStr.includes("収集")) engagementTypeVal = "情報収集";

    const parsedNo = noIdx !== -1 && row[noIdx] ? parseInt(row[noIdx], 10) : null;
    const createdAtDateStr = createdAtDateIdx !== -1 && row[createdAtDateIdx] ? row[createdAtDateIdx].trim() : "";
    const rawTasksStr = tasksIdx !== -1 && row[tasksIdx] ? row[tasksIdx].trim() : "";
    
    const parsedTasks = [];
    if (rawTasksStr) {
      const taskItems = rawTasksStr.split(/[/\n\r]+/).map(t => t.trim()).filter(Boolean);
      taskItems.forEach((item, idx) => {
        const isCompleted = item.includes('[完了]') || item.includes('完了:');
        let cleanTitle = item.replace(/\[(完了|未完)\]/g, '').replace(/^(完了|未完):/g, '').trim();
        let dueDate = '';
        const dueMatch = cleanTitle.match(/\(期日:\s*([^)]+)\)/);
        if (dueMatch) {
          dueDate = dueMatch[1].trim();
          cleanTitle = cleanTitle.replace(/\(期日:\s*[^)]+\)/, '').trim();
        }
        parsedTasks.push({
          id: `task_import_${Date.now()}_${idx}`,
          title: cleanTitle,
          dueDate: dueDate,
          completed: isCompleted,
          createdAt: new Date().toISOString().split('T')[0]
        });
      });
    }

    const partnerDeptVal = partnerDeptIdx !== -1 && row[partnerDeptIdx] ? row[partnerDeptIdx].trim() : "";
    const collabStatusVal = collabStatusIdx !== -1 && row[collabStatusIdx] ? row[collabStatusIdx].trim() : "1 発掘";
    const reachedStageVal = reachedStageIdx !== -1 && row[reachedStageIdx] ? row[reachedStageIdx].trim() : "";
    const closeReasonVal = closeReasonIdx !== -1 && row[closeReasonIdx] ? row[closeReasonIdx].trim() : "";
    
    const investmentStatusVal = investmentStatusIdx !== -1 && row[investmentStatusIdx] ? row[investmentStatusIdx].trim() : (statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : "1 ソーシング");
    const investmentReachedStageVal = investmentReachedStageIdx !== -1 && row[investmentReachedStageIdx] ? row[investmentReachedStageIdx].trim() : "";
    const investmentCloseReasonVal = investmentCloseReasonIdx !== -1 && row[investmentCloseReasonIdx] ? row[investmentCloseReasonIdx].trim() : "";

    const revivalFeasibilityVal = revivalFeasibilityIdx !== -1 && row[revivalFeasibilityIdx] ? row[revivalFeasibilityIdx].trim() : "";
    const revivalScenarioVal = revivalScenarioIdx !== -1 && row[revivalScenarioIdx] ? row[revivalScenarioIdx].trim() : "";

    parsedStartups.push({
      no: !isNaN(parsedNo) && parsedNo ? parsedNo : null,
      name: name,
      engagementType: engagementTypeVal,
      companyType: companyTypeVal,
      sector: sectorIdx !== -1 && row[sectorIdx] ? row[sectorIdx].trim() : "SaaS",
      stage: stageIdx !== -1 && row[stageIdx] ? row[stageIdx].trim() : (companyTypeVal === "enterprise" ? "N/A (一般企業)" : "Seed"),
      createdAtDate: createdAtDateStr || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      score: !isNaN(scoreVal) && scoreVal >= 1 && scoreVal <= 5 ? scoreVal : 3,
      contactPerson: contactPersonIdx !== -1 && row[contactPersonIdx] ? row[contactPersonIdx].trim() : "",
      partnerDept: partnerDeptVal,
      internalPartnerDept: partnerDeptVal,
      collabStatus: collabStatusVal,
      reachedStage: reachedStageVal,
      closeReason: closeReasonVal,
      status: investmentStatusVal,
      investmentStatus: investmentStatusVal,
      investmentReachedStage: investmentReachedStageVal,
      investmentCloseReason: investmentCloseReasonVal,
      revivalFeasibility: revivalFeasibilityVal,
      revivalScenario: revivalScenarioVal,
      investmentRevivalFeasibility: revivalFeasibilityVal,
      investmentRevivalScenario: revivalScenarioVal,
      foundedYear: foundedYearIdx !== -1 && row[foundedYearIdx] ? row[foundedYearIdx].trim() : "",
      location: locationIdx !== -1 && row[locationIdx] ? row[locationIdx].trim() : "Unknown",
      website: websiteIdx !== -1 && row[websiteIdx] ? row[websiteIdx].trim() : "",
      tagline: taglineIdx !== -1 && row[taglineIdx] ? row[taglineIdx].trim() : "",
      funding: fundingIdx !== -1 && row[fundingIdx] ? row[fundingIdx].trim() : "",
      dealSource: dealSourceIdx !== -1 && row[dealSourceIdx] ? row[dealSourceIdx].trim() : "VC / アクセラレーター紹介",
      dealSourceDetail: dealSourceDetailIdx !== -1 && row[dealSourceDetailIdx] ? row[dealSourceDetailIdx].trim() : "",
      investmentMemo: investmentMemoIdx !== -1 && row[investmentMemoIdx] ? row[investmentMemoIdx].trim() : "",
      bizDevStatus: bizDevStatusIdx !== -1 && row[bizDevStatusIdx] ? row[bizDevStatusIdx].trim() : "Not Started / N/A (未着手 / 対象外)",
      bizDevNotes: bizDevNotesIdx !== -1 && row[bizDevNotesIdx] ? row[bizDevNotesIdx].trim() : "",
      tasks: parsedTasks
    });
  }

  return parsedStartups;
};

function parseCSVToRows(text) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(cell);
      result.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  return result;
}
