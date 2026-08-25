# CVC Portal 開発・デプロイ標準ルール

## CRITICAL WORKFLOW RULES (最重要絶対ルール)
コードの修正、バグ修正、または機能追加を行う際、**直接 Vercel に手動デプロイしてはならない**。
必ず以下の順序を厳守すること：

1. **コードの変更・検証**: ローカルファイルを修正し、ビルドエラーがないか確認する (`npm run build`)。
2. **GitHubへの自動Push**: 標準 `git` コマンドを使用して、必ず変更内容を GitHub (`origin main`) へコミット＆Pushする。
3. **Vercelの自動デプロイ**: GitHubのPushをトリガーとして、Vercelに全自動デプロイさせる。

---

## 📌 プロジェクト基本情報
- **GitHub Repository**: `https://github.com/nasse0326/cvc-startup-portal.git`
- **Vercel Web URL**: `https://cvc-startup-portal.vercel.app`

---

## 🛠️ コミット＆デプロイ標準コマンド例
```bash
git add .
git commit -m "Commit message"
git push origin main
```

