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
    "A 高い",
    "",
    "2024年",
    "東京",
    "https://example.com",
    "エンタープライズ向け生成AIソリューションの開発",
    "Series A 5億円 (2024/01)",
    "VC / アクセラレーター紹介",
    "〇〇キャピタルの田中様からの紹介",
    "Due Diligence (デューデリジェンス)",
    "技術力・チームともに優秀。知財周りの確認が必要。",
    "POC Executing (POC実施・実証実験中)",
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
    "A 高い",
    "",
    "1998年",
    "東京",
    "https://example-enterprise.com",
    "大手製造業向け基幹システムの導入支援および協業パートナー",
    "資本金 10億円",
    "直接コンタクト・Web応募",
    "",
    "Invested / Portfolio (投資済・LP出資)",
    "投資対象外だが、アセット連携・PoCパートナーとして非常に有力。",
    "Commercialized / Partnered (事業化・本導入・業務提携)",
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
  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.trim().toLowerCase());

  const getIndex = (possibleNames) => {
    return headers.findIndex(h => possibleNames.some(name => h.includes(name.toLowerCase())));
  };

  const noIdx = getIndex(["no.", "no", "番号"]);
  const nameIdx = getIndex(["企業名", "name"]);
  const engagementTypeIdx = getIndex(["検討type", "type", "検討種別", "engagement"]);
  const typeIdx = getIndex(["企業種別", "種別", "companytype"]);
  const sectorIdx = getIndex(["セクター", "sector"]);
  const stageIdx = getIndex(["調達ステージ", "ステージ", "stage"]);
  const createdAtDateIdx = getIndex(["登録日", "registered date", "createdat"]);
  const scoreIdx = getIndex(["優先度評価", "優先度", "評価", "score", "priority"]);
  const contactPersonIdx = getIndex(["窓口担当者", "担当者", "窓口", "contact", "contactperson", "pic"]);
  const partnerDeptIdx = getIndex(["協業部署", "社内連携先", "連携先", "partnerdept", "department"]);
  const collabStatusIdx = getIndex(["協業ステータス", "ステータス", "collabstatus", "collab_status"]);
  const reachedStageIdx = getIndex(["到達ステージ", "reached stage", "reachedstage"]);
  const closeReasonIdx = getIndex(["クローズ理由", "close reason", "closereason", "見送り理由"]);
  const revivalFeasibilityIdx = getIndex(["復活可能性", "revival feasibility", "revivalfeasibility"]);
  const revivalScenarioIdx = getIndex(["復活シナリオ", "revival scenario", "revivalscenario"]);
  const foundedYearIdx = getIndex(["設立年", "founded year"]);
  const locationIdx = getIndex(["拠点", "location", "設立・拠点"]);
  const websiteIdx = getIndex(["webサイト", "ウェブサイト", "website", "url"]);
  const taglineIdx = getIndex(["事業概要", "概要", "tagline", "description"]);
  const fundingIdx = getIndex(["資金調達履歴", "調達履歴", "funding"]);
  const dealSourceIdx = getIndex(["案件流入元", "流入元", "dealsource", "source"]);
  const dealSourceDetailIdx = getIndex(["案件流入元・詳細", "流入元詳細", "dealsourcedetail"]);
  const statusIdx = getIndex(["投資ステータス", "investment status"]);
  const investmentMemoIdx = getIndex(["投資検討メモ", "投資メモ", "investment memo"]);
  const bizDevStatusIdx = getIndex(["事業・pocステータス", "pocステータス", "bizdev status"]);
  const bizDevNotesIdx = getIndex(["事業開発・poc協業メモ", "協業メモ", "bizdev notes"]);
  const tasksIdx = getIndex(["タスク", "tasks", "task", "アクション", "todo"]);

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
    
    // Parse tasks if present
    const parsedTasks = [];
    if (rawTasksStr) {
      const taskItems = rawTasksStr.split(/[\/\n\r]+/).map(t => t.trim()).filter(Boolean);
      taskItems.forEach((item, idx) => {
        const isCompleted = item.includes('[完了]') || item.includes('完了:');
        let cleanTitle = item.replace(/\[(完了|未完)\]/g, '').replace(/^(完了|未完):/g, '').trim();
        let dueDate = '';
        const dueMatch = cleanTitle.match(/\(期日:\s*([^\)]+)\)/);
        if (dueMatch) {
          dueDate = dueMatch[1].trim();
          cleanTitle = cleanTitle.replace(/\(期日:\s*[^\)]+\)/, '').trim();
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
      revivalFeasibility: revivalFeasibilityVal,
      revivalScenario: revivalScenarioVal,
      foundedYear: foundedYearIdx !== -1 && row[foundedYearIdx] ? row[foundedYearIdx].trim() : "",
      location: locationIdx !== -1 && row[locationIdx] ? row[locationIdx].trim() : "Unknown",
      website: websiteIdx !== -1 && row[websiteIdx] ? row[websiteIdx].trim() : "",
      tagline: taglineIdx !== -1 && row[taglineIdx] ? row[taglineIdx].trim() : "",
      funding: fundingIdx !== -1 && row[fundingIdx] ? row[fundingIdx].trim() : "",
      dealSource: dealSourceIdx !== -1 && row[dealSourceIdx] ? row[dealSourceIdx].trim() : "VC / アクセラレーター紹介",
      dealSourceDetail: dealSourceDetailIdx !== -1 && row[dealSourceDetailIdx] ? row[dealSourceDetailIdx].trim() : "",
      status: statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : "Sourcing (ソーシング)",
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
