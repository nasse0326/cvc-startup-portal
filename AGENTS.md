# CVC Portal 開発・デプロイ標準ルール

## CRITICAL WORKFLOW RULES (最重要絶対ルール)
コードの修正、バグ修正、または機能追加を行う際、**直接 Vercel に手動デプロイしてはならない**。
必ず以下の順序を厳守すること：

1. **コードの変更・検証**: ローカルファイルを修正し、ビルドエラーがないか確認する。
2. **GitHubへの自動Push**: `.git_tool/cmd/git.exe` を使用して、必ず変更内容を GitHub (`origin main`) へコミット＆Pushする。
3. **Vercelの自動デプロイ**: GitHubのPushをトリガーとして、Vercelに全自動デプロイさせる。

---

## 📌 プロジェクト基本情報
- **GitHub Repository**: `https://github.com/nasse0326/cvc-startup-portal.git`
- **Vercel Web URL**: `https://cvc-startup-portal.vercel.app`
- **Git Binary Location**: `.git_tool/cmd/git.exe`

---

## 🛠️ コミット＆デプロイ標準コマンド例
```powershell
powershell -Command "& '.git_tool/cmd/git.exe' add .; & '.git_tool/cmd/git.exe' commit -m 'Commit message'; & '.git_tool/cmd/git.exe' push origin main"
```
