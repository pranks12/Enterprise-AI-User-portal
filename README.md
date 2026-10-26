# Enterprise AI User Portal 🏢✨
> A centralized, scalable platform for discovering, onboarding, testing, and enhancing enterprise-grade AI agents powered by Google Gemini.

The **Enterprise AI User Portal** provides organizations with a unified interface to manage generative AI capabilities across teams. It bridges the gap between raw LLM capabilities and practical business workflows, allowing users to browse approved AI tools, safely test prompts in a sandboxed environment, and formally onboard new AI use cases into the corporate ecosystem.

---

## 🌟 Core Features

- **Agent Catalog:** A searchable, governed directory of pre-approved, production-ready AI agents tailored for various internal workflows and departments.
- **Interactive Playground:** A secure, sandboxed environment for employees to test agent responses, refine prompts, and validate Gemini model outputs before deploying them into active workflows.
- **Agent Intake & Governance:** A structured onboarding pipeline for proposing, configuring, and approving new AI agents, ensuring all tools meet enterprise compliance and data security standards.
- **Agent Enhancement:** Tooling to iteratively improve existing agents by adjusting system instructions, tuning model parameters, and integrating new context data.
- **Unified Dashboard:** A high-level overview of agent utilization, user activity, and system health.

---

## 🏗️ Technical Architecture

This application is built as a modern Single Page Application (SPA) prioritizing performance, type safety, and seamless API integration.

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 
- **AI Integration:** Google Gemini API 

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Enterprise Google AI Studio / Gemini API Key

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)<your-organization>/Enterprise-AI-User-portal.git
   cd Enterprise-AI-User-portal-main


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sWoaX-8LdEAWWm0WgE6bC6zj6un844aU

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
