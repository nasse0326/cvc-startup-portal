export const downloadImportTemplate = () => {
  const headers = [
    "No.",
    "企業名 (Name)",
    "企業種別 (Type)",
    "セクター (Sector)",
    "調達ステージ (Stage)",
    "登録日 (Registered Date)",
    "優先度評価 (Score)",
    "設立・拠点 (Location)",
    "Webサイト (Website)",
    "事業概要 (Tagline)",
    "資金調達履歴 (Funding History)",
    "案件流入元 (Deal Source)",
    "案件流入元・詳細 (Deal Source Detail)",
    "社内連携先 (Internal Partner Dept)",
    "投資ステータス (Investment Status)",
    "投資検討メモ (Investment Memo)",
    "事業・PoCステータス (BizDev Status)",
    "事業開発・PoC協業メモ (BizDev Notes)"
  ];

  const sampleRow1 = [
    "",
    "サンプルAI株式会社",
    "スタートアップ",
    "AI",
    "Series-A",
    "2026/08/01",
    "4",
    "2022 / 東京",
    "https://example.com",
    "エンタープライズ向け生成AIソリューションの開発",
    "Series-A 5億円 (2024/01)",
    "VC / アクセラレーター紹介",
    "〇〇キャピタルの田中様からの紹介",
    "DX推進部",
    "Deep Review (詳細検討中)",
    "技術力・チームともに優秀。知財周りの確認が必要。",
    "POC Consideration (POC検討中)",
    "社内ナレッジ検索の実証実験に向け提案中。"
  ];

  const sampleRow2 = [
    "",
    "大和ITソリューションズ",
    "一般企業",
    "SaaS / Enterprise",
    "N/A (一般企業)",
    "2026/08/05",
    "5",
    "1998 / 東京",
    "https://example-enterprise.com",
    "大手製造業向け基幹システムの導入支援および協業パートナー",
    "資本金 10億円",
    "直アプローチ (Outbound)",
    "",
    "生産技術部第2課",
    "Passed / On Hold (見送り / 保留)",
    "投資対象外だが、アセット連携・PoCパートナーとして非常に有力。",
    "POC Executing (POC実施中)",
    "製造ラインデータ連携のPoCを共同推進中。"
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
  const typeIdx = getIndex(["企業種別", "種別", "type", "companytype"]);
  const sectorIdx = getIndex(["セクター", "sector"]);
  const stageIdx = getIndex(["調達ステージ", "ステージ", "stage"]);
  const createdAtDateIdx = getIndex(["登録日", "registered date", "createdat"]);
  const scoreIdx = getIndex(["優先度評価", "評価", "score"]);
  const locationIdx = getIndex(["設立・拠点", "拠点", "location"]);
  const websiteIdx = getIndex(["webサイト", "ウェブサイト", "website", "url"]);
  const taglineIdx = getIndex(["事業概要", "概要", "tagline", "description"]);
  const fundingIdx = getIndex(["資金調達履歴", "調達履歴", "funding"]);
  const dealSourceIdx = getIndex(["案件流入元", "流入元", "dealsource", "source"]);
  const dealSourceDetailIdx = getIndex(["案件流入元・詳細", "流入元詳細", "dealsourcedetail"]);
  const internalPartnerDeptIdx = getIndex(["社内連携先", "連携先", "internalpartnerdept", "department"]);
  const statusIdx = getIndex(["投資ステータス", "ステータス", "investment status"]);
  const investmentMemoIdx = getIndex(["投資検討メモ", "投資メモ", "investment memo"]);
  const bizDevStatusIdx = getIndex(["事業・pocステータス", "pocステータス", "bizdev status"]);
  const bizDevNotesIdx = getIndex(["事業開発・poc協業メモ", "協業メモ", "bizdev notes"]);

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

    const parsedNo = noIdx !== -1 && row[noIdx] ? parseInt(row[noIdx], 10) : null;
    const createdAtDateStr = createdAtDateIdx !== -1 && row[createdAtDateIdx] ? row[createdAtDateIdx].trim() : "";

    parsedStartups.push({
      no: !isNaN(parsedNo) && parsedNo ? parsedNo : null,
      name: name,
      companyType: companyTypeVal,
      sector: sectorIdx !== -1 && row[sectorIdx] ? row[sectorIdx].trim() : "SaaS",
      stage: stageIdx !== -1 && row[stageIdx] ? row[stageIdx].trim() : (companyTypeVal === "enterprise" ? "N/A (一般企業)" : "Seed"),
      createdAtDate: createdAtDateStr || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      score: !isNaN(scoreVal) && scoreVal >= 1 && scoreVal <= 5 ? scoreVal : 3,
      location: locationIdx !== -1 && row[locationIdx] ? row[locationIdx].trim() : "Unknown",
      website: websiteIdx !== -1 && row[websiteIdx] ? row[websiteIdx].trim() : "",
      tagline: taglineIdx !== -1 && row[taglineIdx] ? row[taglineIdx].trim() : "",
      funding: fundingIdx !== -1 && row[fundingIdx] ? row[fundingIdx].trim() : "",
      dealSource: dealSourceIdx !== -1 && row[dealSourceIdx] ? row[dealSourceIdx].trim() : "VC / アクセラレーター紹介",
      dealSourceDetail: dealSourceDetailIdx !== -1 && row[dealSourceDetailIdx] ? row[dealSourceDetailIdx].trim() : "",
      internalPartnerDept: internalPartnerDeptIdx !== -1 && row[internalPartnerDeptIdx] ? row[internalPartnerDeptIdx].trim() : "",
      status: statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : "Sourcing (ソーシング)",
      investmentMemo: investmentMemoIdx !== -1 && row[investmentMemoIdx] ? row[investmentMemoIdx].trim() : "",
      bizDevStatus: bizDevStatusIdx !== -1 && row[bizDevStatusIdx] ? row[bizDevStatusIdx].trim() : "Not Started / N/A (未着手 / 対象外)",
      bizDevNotes: bizDevNotesIdx !== -1 && row[bizDevNotesIdx] ? row[bizDevNotesIdx].trim() : ""
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
