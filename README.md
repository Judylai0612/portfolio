# Portfolio

Judy Lai 的個人作品集網站。純 HTML / CSS / JavaScript（無框架），部署於 GitHub Pages。

## 結構

- `index.html` — 單頁式版面（About Me / Portfolio / Contact）
- `css/style.css` — 莫蘭迪灰藍色系樣式、響應式排版、動畫效果
- `js/main.js` — 導覽列平滑捲動 / 手機選單 / 捲動淡入動畫
- `.github/workflows/deploy.yml` — 推送到 `main` 分支後自動部署到 GitHub Pages

## 本機預覽

直接用瀏覽器開啟 `index.html`，或使用任一靜態伺服器，例如：

```bash
python3 -m http.server 8000
```

再開啟 http://localhost:8000

## 部署

專案已設定 GitHub Actions，推送到 `main` 分支會自動建置並部署到 GitHub Pages。
首次使用前，請至 repository 的 **Settings > Pages**，將 Source 設定為 **GitHub Actions**。

## 後續規劃

`admin.html` 後台管理頁面（Firebase Firestore + Storage）將於前台版型確認後再開發。
