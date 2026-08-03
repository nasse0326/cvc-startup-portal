export const initialStartups = [
  {
    id: "startup_1",
    name: "Aegis AI",
    sector: "AI",
    stage: "Series-A",
    status: "Due Diligence (DD実施中)",
    bizDevStatus: "POC Executed (POC実施済)",
    score: 5,
    tagline: "金融コンプライアンス監査ワークフロー向けの次世代生成AIセーフティガードレール。",
    website: "https://aegis-ai.example.com",
    location: "2024年設立 / 米国・サンフランシスコ",
    funding: "Vertex Venturesが主導するシリーズAで450万ドルを調達。",
    investmentMemo: "リアルタイムのコンプライアンス監査にフォーカス。DD結果良好につき投資委員会へ提出予定。",
    bizDevNotes: "当社法務部との実証実験（PoC）を完了。契約書の自動チェック制度98%を達成し、2026年Q4の全社導入に向けて協議中。"
  },
  {
    id: "startup_2",
    name: "SaaSify Logistics",
    sector: "SaaS",
    stage: "Series-B",
    status: "Invested (Portfolio) (投資実行済 / ポートフォリオ)",
    bizDevStatus: "Commercialized (事業化・提携済)",
    score: 4,
    tagline: "自律型倉庫車両トラッキングのためのエンタープライズクラウドオーケストレーションプラットフォーム。",
    website: "https://saasify-logistics.example.com",
    location: "2022年設立 / 東京",
    funding: "シリーズBで1,200万ドルを調達。共同投資家：グローバル・ブレイン、三井住友海上キャピタル等。",
    investmentMemo: "本業シナジーが高く、ポートフォリオ企業として投資実行済み。",
    bizDevNotes: "当社物流子会社の第3倉庫にて本番導入済み。年間配車コストの12%削減を達成。"
  },
  {
    id: "startup_3",
    name: "CarbonTrace",
    sector: "ClimateTech",
    stage: "Seed",
    status: "Deep Review (詳細検討中)",
    bizDevStatus: "POC Consideration (POC検討中)",
    score: 3,
    tagline: "人工衛星テレメトリを統合した、分散型炭素クレジット検証用APIサービス。",
    website: "https://carbontrace.example.com",
    location: "2025年設立 / ドイツ・ベルリン",
    funding: "シードで120万ドル調達。Speedinvestが主導。",
    investmentMemo: "当社の製造部門との強力なシナジーが見込まれるため詳細検討中。",
    bizDevNotes: "サステナビリティ推進部と Scope 3 算定自動化に関するPoC仕様を策定中。"
  },
  {
    id: "startup_4",
    name: "PayFlow Technologies",
    sector: "Fintech",
    stage: "Pre-A",
    status: "Initial Meeting (初回面談済)",
    bizDevStatus: "Collaboration Review (協業検討中)",
    score: 4,
    tagline: "ステーブルコインの流動性プールを活用した、クロスボーダーかつ即時のB2B決済インフラ。",
    website: "https://payflow.example.com",
    location: "2023年設立 / シンガポール",
    funding: "プレシリーズAで200万ドル調達。",
    investmentMemo: "銀行・金融分野における事業会社パートナーを探索中。規制面の検証が必要。",
    bizDevNotes: "海外事業部における東南アジア向け仕入送金の手数料削減の可能性について初回検討中。"
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
