<p align="center">
  <img src="../public/Phoebe.svg" width="96" alt="logo" />
</p>

<h1 align="center">명조 로테이션 플래너</h1>

<p align="center">
  《명조: 워더링 웨이브》 플레이어를 위한 비주얼 로테이션 도구 — 드래그만으로 완성, 학습 비용 제로, 설치·가입 불필요.
</p>

<p align="center">
  <a href="../README.md">繁體中文</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.en.md">English</a> |
  <a href="README.ja.md">日本語</a> |
  <b>한국어</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="#-온라인-사용">🔗 온라인 사용</a> ·
  <a href="#-스크린샷">📸 스크린샷</a> ·
  <a href="#-주요-기능">✨ 주요 기능</a> ·
  <a href="#️-키보드-단축키">⌨️ 단축키</a> ·
  <a href="#-기술-스택과-아키텍처">🛠 기술 스택</a> ·
  <a href="#-로컬-개발">🚀 개발</a>
</p>

---

## 🔗 온라인 사용

**👉 [wuthering-waves-rotation-planner.vercel.app](https://wuthering-waves-rotation-planner.vercel.app/)**

브라우저에서 바로 사용할 수 있습니다. 설치도 회원가입도 필요 없습니다. 처음 방문하면 인터랙티브 튜토리얼이 첫 로테이션 작성을 안내합니다.

## 📸 스크린샷

<img width="1920" alt="메인 화면" src="https://github.com/user-attachments/assets/6603d736-5f24-42e0-9c8f-84e1c59390e3" />

<!-- TODO: 조작 GIF(드래그 → 이미지 내보내기) 추가 -->

## ✨ 주요 기능

### 로테이션 편집
- **드래그 앤 드롭**: 사이드바에서 스킬 블록을 타임라인으로 드래그하면 뒤쪽 블록이 자동으로 밀리며 빈틈없이 정렬
- **완전한 편집 기능**: 추가, 삭제, 복사, 붙여넣기, 잘라내기, 인라인 텍스트 편집
- **다중 선택**: Ctrl+클릭, 마우스 드래그 선택(레인 간 가능), 레인 전체 선택
- **실행 취소/다시 실행**: 모든 작업을 Ctrl+Z로 되돌릴 수 있으며 히스토리 깊이 설정 가능

### 템플릿과 저장
- **템플릿 라이브러리**: 범용 블록 내장, 완성한 콤보를 사이드바로 드래그하면 커스텀 템플릿으로 저장
- **팀 저장**: 전체 작업 상태를 이름을 붙여 저장. 불러오기·이름 변경·고정 지원. 저장하지 않은 변경은 「*」로 표시되며 탭을 실수로 닫는 것도 방지
- **다중 로테이션 탭**: 하나의 문서에 여러 로테이션을 만들어 사이클 비교 가능

### 출력과 경험
- **고해상도 이미지 내보내기**: 단일 로테이션은 PNG, 여러 탭은 ZIP으로 일괄 출력 — 커뮤니티 공유에 최적
- **5개 UI 언어**: 번체 중국어, 간체 중국어, 영어, 일본어, 한국어
- **캐릭터 데이터 자동 업데이트**: GitHub Actions 크롤러가 매주 최신 캐릭터를 수집 — 수동 관리 불필요

## ⌨️ 키보드 단축키

| 키 | 기능 |
| --- | --- |
| `A` / `D` | 블록 단위로 왼쪽/오른쪽 선택 이동(미선택 시 맨 오른쪽/왼쪽 선택) |
| `W` / `S` | 캐릭터가 배정된 레인 간 레인 전체 선택 순환 |
| `Space` | 끝(또는 선택 뒤)에 블록 추가 |
| `Enter` | 선택한 블록 편집 |
| `Delete` / `Backspace` | 선택한 블록 삭제 |
| `Ctrl+A` | 모든 블록 선택 |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | 복사 / 잘라내기 / 붙여넣기 |
| `Ctrl+D` | 선택을 오른쪽으로 복제 |
| `Ctrl+Z` | 실행 취소 |
| `Ctrl+Shift+Z` / `Ctrl+Y` | 다시 실행 |
| `Escape` | 모든 선택 해제 |
| `Tab` | 사이드바 열기/닫기 |

## 🌐 지원 언어

UI 문자열과 캐릭터 이름 모두 완전 현지화: 繁體中文, 简体中文, English, 日本語, 한국어.

## 🛠 기술 스택과 아키텍처

- **프레임워크**: Vue 3 (Composition API) + TypeScript + Vite + Pinia + TailwindCSS
- **드래그 앤 드롭**: VueDraggablePlus(내부는 SortableJS, forceFallback 모드)
- **내보내기**: html-to-image + JSZip
- **다국어**: vue-i18n
- **튜토리얼**: driver.js
- **영속화**: LocalStorage(템플릿, 팀 저장, 사용자 설정)

핵심 설계: 로테이션의 실체는 **하나의 1차원 배열**(싱글 스레드 모델)입니다. 세 캐릭터의 블록은 배열 순서에 따라 세 개의 스윔레인에 분배되어 그려집니다. 블록은 시전 순서만 표현하고 정확한 초 단위에 묶이지 않으므로, 삽입/삭제 시에도 항상 빈틈없이 정렬되며 겹침이나 공백이 생기지 않습니다.

## 🚀 로컬 개발

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 시작
npm run build    # 타입 체크 + 프로덕션 빌드
```

## 📄 License

<!-- TODO: 라이선스 선정(MIT 권장) 후 LICENSE 파일 추가 -->
