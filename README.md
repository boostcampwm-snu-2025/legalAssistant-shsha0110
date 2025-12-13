# 🛡️ Standard Labor Contract AI Assistant
### (표준근로계약서 AI 작성 도우미)

> **복잡한 법률 용어 없이, 누구나 쉽고 안전하게.**
> 최저임금법 및 근로기준법을 준수하는 근로계약서를 AI와 함께 작성하고 검토받을 수 있는 웹 서비스입니다.

---

## 📺 Demo Preview

**프로젝트 시연 영상을 확인해보세요.**

*[데모 영상]*

---

## 📝 Project Overview (프로젝트 소개)

아르바이트나 단기 근로 계약을 맺을 때, 법적 지식이 부족하여 불리한 계약을 맺거나 법을 위반하는 사례가 많습니다. 특히 **연소자(청소년)** 나 **단순노무종사자** 의 경우 보호가 더욱 절실합니다.

이 프로젝트는 사용자가 **단계별 질문(Wizard UI)** 에 답하는 것만으로 완성도 높은 계약서를 작성할 수 있게 돕습니다. 특히 **Google Gemini AI** 를 활용하여 다음을 수행합니다:

1.  사용자의 업무 내용을 분석하여 **'단순노무직(수습 감액 불가 직종)'** 여부를 자동 판단.
2.  작성된 계약서의 **법적 리스크(Risk Level)** 를 분석하고 점수화.
3.  법률적인 궁금증을 해결해주는 **AI 챗봇** 제공.

---

## ✨ Key Features (핵심 기능)

### 1. 🚀 Step-by-Step Contract Wizard
- **직관적인 UI:** 복잡한 서식을 한 번에 보여주지 않고, `유형 선택` > `기본 정보` > `근로 시간` > `임금` 순으로 단계별 입력을 유도합니다.
- **실시간 미리보기:** 입력한 내용이 실제 계약서 양식에 어떻게 반영되는지 실시간으로 확인할 수 있습니다.

### 2. 🤖 AI Job Classification (단순노무직 판별)
- **최저임금법 제5조 적용:** 사용자가 "편의점 알바", "배달" 등 업무 내용을 입력하면, AI가 **한국표준직업분류(KSCO)** 를 기준으로 단순노무직 여부를 판단합니다.
- **수습 기간 감액 방지:** 단순노무직으로 분류될 경우, 수습 기간 중 임금 감액(90% 지급) 옵션을 **자동으로 차단** 하여 법 위반을 예방합니다.

### 3. ⚖️ Auto Legal Validation (자동 법률 검증)
- **최저임금 체크:** 2025년 최저임금(10,030원) 미달 시 경고 메시지를 표시합니다.
- **수습 기간 제한:** 근로 계약이 1년 미만인 경우 수습 감액 설정을 막습니다.
- **연소자 보호 모드:** 18세 미만 선택 시, 필수적인 가족관계증명서/동의서 제출 필요성을 안내하는 배지가 활성화됩니다.

### 4. 🔍 AI Legal Review & Chat (최종 검토)
- **리스크 스코어링:** 작성 완료된 계약 데이터를 AI가 분석하여 안전 점수(0~100점)와 리스크 레벨(Safe/Warning/Danger)을 제공합니다.
- **쉬운 요약:** 임금, 근로시간, 주요 권리 사항을 3줄 요약으로 제공합니다.
- **AI 변호사 챗봇:** 검토 결과에 대해 궁금한 점을 AI에게 채팅으로 바로 물어볼 수 있습니다.

---

## 🛠 Tech Stack (기술 스택)

### Frontend
- **React (Vite):** 컴포넌트 기반 UI 개발 및 빠른 빌드 속도
- **Material UI (MUI):** 깔끔하고 반응형인 디자인 시스템 적용
- **Context API:** 전역 계약 데이터 상태 관리

### Backend
- **Node.js & Express:** RESTful API 서버 구축
- **Google Gemini API (2.5 Flash):** 고성능 AI 모델을 활용한 직무 분류 및 계약서 검토 로직 구현

---

## 💻 How to Run (실행 방법)

이 프로젝트는 Frontend와 Backend 서버를 각각 실행해야 합니다.

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- **Google Gemini API Key** (필수)

### 2. Backend Setup
```bash
cd backend
npm install
# .env 파일 생성 후 GEMINI_API_KEY=your_key_here 입력
npm run dev
# Server runs on http://localhost:3000
````

### 3\. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Client runs on http://localhost:5173
```

-----

## 📂 Project Structure

```bash
📦 legal-assistant
├── 📂 backend
│   ├── 📂 data           # 단순노무직 분류 기준 데이터
│   ├── server.js        # Express 서버 및 Gemini API 연동
│   └── ...
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 api        # 백엔드 통신 로직
│   │   ├── 📂 components # Step별 UI 컴포넌트
│   │   ├── 📂 contexts   # 상태 관리
│   │   ├── 📂 constants  # 데이터구조 관리
│   │   ├── App.jsx       # 메인 레이아웃
│   │   └── ...
└── ...
```

-----

## ⚠️ Disclaimer

본 서비스는 법률적 편의를 돕기 위한 보조 도구이며, 제공되는 결과물은 법적 효력을 보장하지 않습니다. 중요한 계약의 경우 반드시 법률 전문가의 검토를 받으시기 바랍니다.
