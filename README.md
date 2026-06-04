# しょーま｜SHOMA — Model / Actor Portfolio

関東を拠点に活動するモデル / 俳優 **しょーま（SHOMA）** のプロフィールサイト。
CM・MV・スチール・ランウェイの出演実績と、出演・撮影のご相談窓口をまとめています。

> 画面に残る、人になる。

## 構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | ページ本体（Hero / Works / What I do / Profile / Booking / Contact） |
| `styles.css` | デザイン（エディトリアル / 和欧混植・スクロール演出） |
| `script.js` | スクロール進捗・出現アニメ・モバイルメニュー・パララックス・ライトボックス・メール難読化 |
| `assets/img/` | ポートレート・作品カット（WebP + JPEG フォールバック / レスポンシブ） |
| `manifest.webmanifest` | PWA（ホーム画面追加）対応 |
| `robots.txt` / `sitemap.xml` | クローラ向け |
| `.github/workflows/pages.yml` | GitHub Pages 自動デプロイ |

## 主な工夫

- **パフォーマンス**: WebP 配信 + `srcset` レスポンシブ画像 + 画像サイズ指定で CLS 抑制、ヒーロー画像の preload
- **SEO**: 構造化データ（JSON-LD / Person）、canonical、OGP / Twitter Card、sitemap・robots
- **アクセシビリティ**: スキップリンク、フォーカス可視化、`prefers-reduced-motion` 対応
- **プライバシー**: メールアドレスは base64 で埋め込み、クリック時のみ復号（スクレイピング対策）

## ローカルで見る

静的サイトなので、ブラウザで `index.html` を開くだけで表示できます。
ローカルサーバーで確認する場合:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## 連絡先

- Email: サイトの **Contact** セクションの「メールでご連絡」ボタンから（スパム対策のためアドレスはページ内に直接表示していません）
- Instagram: [@showstagram.keio](https://www.instagram.com/showstagram.keio)
- Agency: [AdvoVisions](https://advovisions.com/bcd31-home/)

---

© Shoma. All rights reserved.
