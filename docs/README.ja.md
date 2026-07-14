<p align="center">
  <img src="../public/Phoebe.svg" width="96" alt="logo" />
</p>

<h1 align="center">鳴潮 ローテーションプランナー</h1>

<p align="center">
  『鳴潮』プレイヤーのためのビジュアル・ローテーション作成ツール——ドラッグするだけ、学習コストゼロ、インストール・登録不要。
</p>

<p align="center">
  <a href="../README.md">繁體中文</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.en.md">English</a> |
  <b>日本語</b> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="#-オンラインで使う">🔗 オンラインで使う</a> ·
  <a href="#-スクリーンショット">📸 スクリーンショット</a> ·
  <a href="#-主な機能">✨ 主な機能</a> ·
  <a href="#️-キーボードショートカット">⌨️ ショートカット</a> ·
  <a href="#-技術スタックとアーキテクチャ">🛠 技術スタック</a> ·
  <a href="#-ローカル開発">🚀 開発</a>
</p>

---

## 🔗 オンラインで使う

**👉 [wuthering-waves-rotation-planner.vercel.app](https://wuthering-waves-rotation-planner.vercel.app/)**

ブラウザを開くだけで使えます。インストールもアカウント登録も不要。初回訪問時にはインタラクティブなチュートリアルが最初のローテーション作成を案内します。

## 📸 スクリーンショット

<img width="1920" alt="メイン画面" src="https://github.com/user-attachments/assets/6603d736-5f24-42e0-9c8f-84e1c59390e3" />

<!-- TODO: 操作 GIF(ドラッグ → 画像エクスポート)を追加 -->

## ✨ 主な機能

### ローテーション編集
- **ドラッグ&ドロップ操作**:サイドバーからスキルブロックをタイムラインへドラッグ。後続ブロックは自動でスライドし、隙間なく整列
- **フル編集機能**:追加、削除、コピー、ペースト、カット、インラインテキスト編集
- **複数選択**:Ctrl+クリック、矩形選択(レーン跨ぎ可)、レーン全体選択
- **元に戻す/やり直し**:すべての操作を Ctrl+Z で取り消し可能。履歴の深さも設定可能

### テンプレートとセーブ
- **テンプレートライブラリ**:汎用ブロックを内蔵。組んだコンボをサイドバーへドラッグして戻せばカスタムテンプレートとして保存
- **チームセーブ**:作業状態全体を名前を付けて保存。読み込み・改名・ピン留めに対応。未保存の変更は「*」で警告し、タブの誤クローズも防止
- **複数ローテーションタブ**:1つのドキュメントに複数のローテーションを持たせてサイクルを比較

### 出力と体験
- **高解像度画像エクスポート**:単一ローテーションを PNG、複数タブを ZIP で一括出力。コミュニティでの共有に最適
- **5つの UI 言語**:繁体字中国語、簡体字中国語、英語、日本語、韓国語
- **キャラクターデータ自動更新**:GitHub Actions のクローラーが毎週最新キャラクターを取得。手動メンテナンス不要

## ⌨️ キーボードショートカット

| キー | 機能 |
| --- | --- |
| `A` / `D` | ブロック単位で左/右へ選択移動(未選択時は最右/最左を選択) |
| `W` / `S` | キャラ設定済みレーン間でレーン全体選択を循環 |
| `Space` | 末尾(または選択の後ろ)にブロックを追加 |
| `Enter` | 選択中ブロックを編集 |
| `Delete` / `Backspace` | 選択中ブロックを削除 |
| `Ctrl+A` | 全ブロックを選択 |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | コピー / カット / ペースト |
| `Ctrl+D` | 選択を右へ複製 |
| `Ctrl+Z` | 元に戻す |
| `Ctrl+Shift+Z` / `Ctrl+Y` | やり直し |
| `Escape` | 選択をすべて解除 |
| `Tab` | サイドバーの開閉 |

## 🌐 対応言語

UI 文字列とキャラクター名を完全ローカライズ:繁體中文、简体中文、English、日本語、한국어。

## 🛠 技術スタックとアーキテクチャ

- **フレームワーク**:Vue 3 (Composition API) + TypeScript + Vite + Pinia + TailwindCSS
- **ドラッグ&ドロップ**:VueDraggablePlus(内部は SortableJS、forceFallback モード)
- **エクスポート**:html-to-image + JSZip
- **多言語**:vue-i18n
- **チュートリアル**:driver.js
- **永続化**:LocalStorage(テンプレート、チームセーブ、ユーザー設定)

コアデザイン:ローテーションの実体は**1本の一次元配列**(シングルスレッドモデル)。3キャラクターのブロックは配列順に3つのスイムレーンへ振り分けて描画されます。ブロックは発動順のみを表現し、正確な秒数には縛られないため、挿入/削除しても常に隙間なく整列し、重なりや空白は発生しません。

## 🚀 ローカル開発

```bash
npm install      # 依存関係をインストール
npm run dev      # 開発サーバーを起動
npm run build    # 型チェック + 本番ビルド
```

## 📄 License

<!-- TODO: ライセンスを選定(MIT 推奨)し、LICENSE ファイルを追加 -->
