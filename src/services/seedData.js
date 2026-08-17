export const initialStartups = [
  {
    id: "startup_1",
    no: 1,
    name: "Aegis AI",
    sector: "AI",
    stage: "Series-A",
    status: "Due Diligence (DD実施中)",
    bizDevStatus: "POC Executed (POC実施済)",
    score: 5,
    tagline: "金融コンプライアンス監査ワークフロー向けの次世代生成AIセーフティガードレール。",
    website: "https://aegis-ai.example.com",
    foundedYear: "2024年",
    location: "米国・サンフランシスコ",
    contactPerson: "サラ・チェン (Co-Founder & CEO / sarah@aegis-ai.example.com)",
    funding: "Vertex Venturesが主導するシリーズAで450万ドルを調達。",
    investmentMemo: "リアルタイムのコンプライアンス監査にフォーカス。DD結果良好につき投資委員会へ提出予定。",
    bizDevNotes: "当社法務部との実証実験（PoC）を完了。契約書の自動チェック制度98%を達成し、2026年Q4の全社導入に向けて協議中。",
    tasks: [
      { id: "task_1_1", title: "コードおよびセキュリティ脆弱性レビューの実施", dueDate: "2026-08-25", completed: false, assignedTo: "技術アナリスト", createdAt: "2026-08-10" },
      { id: "task_1_2", title: "投資委員会向けDDレポートの起草", dueDate: "2026-08-30", completed: false, assignedTo: "田中 健二", createdAt: "2026-08-12" },
      { id: "task_1_3", title: "秘密保持契約（NDA）の締結", dueDate: "2026-07-01", completed: true, assignedTo: "法務部", createdAt: "2026-06-20" }
    ]
  },
  {
    id: "startup_2",
    no: 2,
    name: "SaaSify Logistics",
    sector: "SaaS",
    stage: "Series-B",
    status: "Invested (Portfolio) (投資実行済 / ポートフォリオ)",
    bizDevStatus: "Commercialized (事業化・提携済)",
    score: 4,
    tagline: "自律型倉庫車両トラッキングのためのエンタープライズクラウドオーケストレーションプラットフォーム。",
    website: "https://saasify-logistics.example.com",
    foundedYear: "2022年",
    location: "東京",
    contactPerson: "佐々木 健太郎 (代表取締役 / contact@saasify-logistics.example.com)",
    funding: "シリーズBで1,200万ドルを調達。共同投資家：グローバル・ブレイン、三井住友海上キャピタル等。",
    investmentMemo: "本業シナジーが高く、ポートフォリオ企業として投資実行済み。",
    bizDevNotes: "当社物流子会社の第3倉庫にて本番導入済み。年間配車コストの12%削減を達成。",
    tasks: [
      { id: "task_2_1", title: "当社物流部門VPとの提携拡大アポイント設定", dueDate: "2026-08-28", completed: false, assignedTo: "佐藤 寛", createdAt: "2026-08-15" }
    ]
  },
  {
    id: "startup_3",
    no: 3,
    name: "CarbonTrace",
    sector: "ClimateTech",
    stage: "Seed",
    status: "Deep Review (詳細検討中)",
    bizDevStatus: "POC Consideration (POC検討中)",
    score: 3,
    tagline: "人工衛星テレメトリを統合した、分散型炭素クレジット検証用APIサービス。",
    website: "https://carbontrace.example.com",
    foundedYear: "2025年",
    location: "ドイツ・ベルリン",
    contactPerson: "ルーカス・ミュラー (Head of Partnerships / lucas@carbontrace.example.com)",
    funding: "シードで120万ドル調達。Speedinvestが主導。",
    investmentMemo: "当社の製造部門との強力なシナジーが見込まれるため詳細検討中。",
    bizDevNotes: "サステナビリティ推進部と Scope 3 算定自動化に関するPoC仕様を策定中。",
    tasks: [
      { id: "task_3_1", title: "競合他社比較および料金体系の分析", dueDate: "2026-08-22", completed: false, assignedTo: "佐藤 有希", createdAt: "2026-08-08" },
      { id: "task_3_2", title: "サステナビリティ推進部とのPoC仕様ミーティング", dueDate: "2026-09-05", completed: false, assignedTo: "田中 健二", createdAt: "2026-08-10" }
    ]
  },
  {
    id: "startup_4",
    no: 4,
    name: "PayFlow Technologies",
    sector: "Fintech",
    stage: "Pre-A",
    status: "Initial Meeting (初回面談済)",
    bizDevStatus: "Collaboration Review (協業検討中)",
    score: 4,
    tagline: "ステーブルコインの流動性プールを活用した、クロスボーダーかつ即時のB2B決済インフラ。",
    website: "https://payflow.example.com",
    foundedYear: "2023年",
    location: "シンガポール",
    contactPerson: "デビッド・タン (Managing Director / david@payflow.example.com)",
    funding: "プレシリーズAで200万ドル調達。",
    investmentMemo: "銀行・金融分野における事業会社パートナーを探索中。規制面の検証が必要。",
    bizDevNotes: "海外事業部における東南アジア向け仕入送金の手数料削減の可能性について初回検討中。",
    tasks: [
      { id: "task_4_1", title: "国内におけるステーブルコイン取引の法的コンプライアンス検証", dueDate: "2026-08-26", completed: false, assignedTo: "法務コンプライアンス室", createdAt: "2026-08-14" }
    ]
  }
];

export const initialMeetings = [
  {
    id: "meeting_1",
    startupId: "startup_1",
    date: "2026-07-10",
    purpose: "DD Interview",
    attendees: ["田中 健二 (CVCディレクター)", "サラ・ジェンキンス (技術アナリスト)"],
    notes: "Aegis AIの監査分析中の処理遅延（レイテンシー）についてディスカッション。大量のデータセットに対して100ミリ秒未満の応答速度を示すデモを確認した。彼らの安全ガードレール機能は、ハルシネーション（AIの嘘）を含むエントリーを効果的にブロックしている。当行の与信審査部門との統合方法について議論。主なリスクはOpenAI's GPTモデルへの依存だが、来月には独自のファインチューニング済みオープンウェイトモデルへ移行する予定とのこと。",
    nextStep: "7月25日までにコードの確認とセキュリティ脆弱性レビューを実施する。",
    aiBrief: {
      summary: [
        "処理遅延100ms未満を達成した生成AI監査コンプライアンスガードレール。",
        "銀行の与信審査および融資監査セグメントをターゲットに展開。",
        "OpenAI APIから自社ホストモデルへの移行を推進中。"
      ],
      strengths_and_bottlenecks: "強み：100ms未満で処理可能な高度に特化したワークフロー。ボトルネック：現状はAPIコストが高いため、自社ホスト移行にあたってモデル精度を担保できるかが鍵。",
      cvc_synergy: "事業会社シナジー案：Aegisのコンプライアンス管理機能を、当行の商用与信審査部門へ直接組み込み、事前スクリーニング監査を自動化。審査業務の工数を40%削減することを目指す。"
    }
  },
  {
    id: "meeting_2",
    startupId: "startup_2",
    date: "2026-06-15",
    purpose: "Portfolio Follow-up",
    attendees: ["佐藤 寛 (投資マネージャー)"],
    notes: "投資後の定例マンスリー会議。SaaSify Logisticsは日本国内の新規大手製造業顧客を2社開拓することに成功。月間経常収益（MRR）は前月比で15%成長した。当社グループのサプライチェーンネットワークを活用した、さらなる販売チャネルの拡大について議論を行った。",
    nextStep: "SaaSifyのCEOを当社の物流部門のVPに紹介するアポイントを調整する。",
    aiBrief: null
  },
  {
    id: "meeting_3",
    startupId: "startup_3",
    date: "2026-07-05",
    purpose: "Demo",
    attendees: ["田中 健二 (CVCディレクター)", "佐藤 有希 (ESG推進リード)"],
    notes: "CarbonTraceのテレメトリダッシュボード製品デモを確認。UIは美しく、ほぼリアルタイムで森林炭素蓄積量をクエリ可能。第三者認証機関による監査済み。ただし、複数のプロバイダーにわたる衛星フィードAPIの標準化はまだ進行中である。ビジネスモデルはAPIコールごとの従量課金制を採用。",
    nextStep: "料金体系を分析し、既存の市場競合他社と比較・検討を行う。",
    aiBrief: null
  },
  {
    id: "meeting_4",
    startupId: "startup_4",
    date: "2026-07-18",
    purpose: "Initial pitch",
    attendees: ["佐藤 寛 (投資マネージャー)", "サラ・ジェンキンス (技術アナリスト)"],
    notes: "PayFlowによる海外送金プラットフォームについてのピッチ。彼らのソリューションは、ステーブルコイン流動性を活用することで、SWIFT送金の3〜5%の手数料オーバーヘッドを0.2%未満に削減できるとのこと。東南アジアにおける高い規制障壁があるが、シンガポールでのライセンスはすでに取得済み。国内サプライヤーとの試験運用（パイロットテスト）を共同で行うCVCパートナーを求めている。",
    nextStep: "日本国内におけるステーブルコイン取引の法的コンプライアンスについて評価・検証する。",
    aiBrief: null
  }
];
