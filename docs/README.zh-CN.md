<p align="center">
  <img src="../public/Phoebe.svg" width="96" alt="logo" />
</p>

<h1 align="center">鸣潮排轴编辑器</h1>

<p align="center">
  为《鸣潮》玩家打造的可视化排轴工具——拖拽即排轴,零上手成本,免安装免登录。
</p>

<p align="center">
  <a href="../README.md">繁體中文</a> |
  <b>简体中文</b> |
  <a href="README.en.md">English</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="#-在线使用">🔗 在线使用</a> ·
  <a href="#-成品展示">📸 成品展示</a> ·
  <a href="#-功能特色">✨ 功能特色</a> ·
  <a href="#️-快捷键一览">⌨️ 快捷键</a> ·
  <a href="#-技术栈与架构">🛠 技术栈</a> ·
  <a href="#-本地开发">🚀 本地开发</a>
</p>

---

## 🔗 在线使用

**👉 [wuthering-waves-rotation-planner.vercel.app](https://wuthering-waves-rotation-planner.vercel.app/)**

打开网页即可使用,无需安装、无需注册。首次进入会有交互式引导,带你完成第一次排轴。

## 📸 成品展示

<img width="1920" alt="主界面截图" src="https://github.com/user-attachments/assets/6603d736-5f24-42e0-9c8f-84e1c59390e3" />

<!-- TODO: 建议补一段操作 GIF(拖拽排轴 → 导出图片) -->

## ✨ 功能特色

### 排轴编辑
- **拖拽式操作**:从侧边栏把招式区块拖进时间轴,后方区块自动顺延、紧密吸附
- **完整编辑能力**:新增、删除、复制、粘贴、剪切、行内编辑文字
- **多重选取**:Ctrl+点选、鼠标框选(可跨泳道)、整条泳道选取
- **撤销/重做**:所有操作皆可 Ctrl+Z 反悔,步数可自定义

### 模板与存档
- **模板库**:内置通用区块,也能把排好的组合拖回侧边栏存为自定义模板
- **队伍存档**:整份工作状态可具名存档,支持载入、改名、置顶;有未存更改时会以「*」提醒并防止误关网页
- **多输出轴**:一份文档可开多条输出轴标签页,比较不同循环

### 输出与体验
- **高清图片导出**:单轴 PNG 或多轴打包 ZIP,方便分享到社区
- **五种界面语言**:繁中、简中、英文、日文、韩文
- **角色数据自动更新**:GitHub Actions 每周自动爬取最新角色并提交,新角色上线免手动维护

## ⌨️ 快捷键一览

| 按键 | 功能 |
| --- | --- |
| `A` / `D` | 逐块向左/右巡览选取(无选取时选最右/最左块) |
| `W` / `S` | 在已选角泳道间循环选取整条泳道 |
| `Space` | 在末尾(或选取后方)新增区块 |
| `Enter` | 编辑选取的区块 |
| `Delete` / `Backspace` | 删除选取的区块 |
| `Ctrl+A` | 选取全部区块 |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | 复制 / 剪切 / 粘贴 |
| `Ctrl+D` | 向右复制选取的区块 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` / `Ctrl+Y` | 重做 |
| `Escape` | 清除所有选取 |
| `Tab` | 展开/收起侧边栏 |

## 🌐 支持语言

界面与角色名称均完整支持:繁體中文、简体中文、English、日本語、한국어。

## 🛠 技术栈与架构

- **框架**:Vue 3 (Composition API) + TypeScript + Vite + Pinia + TailwindCSS
- **拖拽**:VueDraggablePlus(底层 SortableJS,forceFallback 模式)
- **导出**:html-to-image + JSZip
- **多语言**:vue-i18n
- **引导**:driver.js
- **数据持久化**:LocalStorage(模板库、队伍存档、用户设置)

核心设计:排轴底层是**一条一维数组**(单线程模型),三名角色的区块按数组顺序分流绘制到三条泳道——区块只表达施放先后,不绑定精确秒数,因此插入/删除永远保持紧密吸附,不会出现重叠或空洞。

## 🚀 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 类型检查 + 产出正式版
```

## 📄 License

<!-- TODO: 选定开源许可证(建议 MIT)并补上 LICENSE 文件 -->
