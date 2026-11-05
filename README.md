# 🩺 GitSurgeon

> **Autonomous Test-Reproducing & Codebase Patching Agent Harness**  
> *Official Submission for the **BharatCode Build League Hackathon 2026** (Coding & Developer Tools Track)*

[![BharatCode Build League](https://img.shields.io/badge/BharatCode-Build%20League%202026-00D26A?style=for-the-badge&logo=codeforces&logoColor=white)](https://bharatcode.ai)
[![Models](https://img.shields.io/badge/Models-Qwen%203.8%2027B%20%7C%20DeepSeek%20V4.1%20Flash-0070F3?style=for-the-badge)](https://bharatcode.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

```
  ██████╗ ██╗████████╗███████╗██╗   ██╗██████╗  ██████╗ ███████╗ ██████╗ ███╗   ██╗
 ██╔════╝ ██║╚══██╔══╝██╔════╝██║   ██║██╔══██╗██╔════╝ ██╔════╝██╔═══██╗████╗  ██║
 ██║  ███╗██║   ██║   ███████╗██║   ██║██████╔╝██║  ███╗█████╗  ██║   ██║██╔██╗ ██║
 ██║   ██║██║   ██║   ╚════██║██║   ██║██╔══██╗██║   ██║██╔══╝  ██║   ██║██║╚██╗██║
 ╚██████╔╝██║   ██║   ███████║╚██████╔╝██║  ██║╚██████╔╝███████╗╚██████╔╝██║ ╚████║
  ╚═════╝ ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
```

---

## 🎯 The Problem

Developers and open-source maintainers spend **over 70% of their debugging time** just trying to understand ambiguous bug reports, writing reproduction unit tests, and verifying that candidate patches don't introduce regressions.

Most AI coding assistants simply guess a fix from a prompt without testing it. They produce hallucinated diffs that break other parts of your app.

---

## ⚡ The Solution: A True AI Harness

**GitSurgeon** is built as an end-to-end **Agent Harness**: software combining **BharatCode's high-reasoning models**, structured prompts, sandbox testing tools, and a self-correcting workflow.

Instead of guessing, GitSurgeon follows the scientific debugging method:
1. **Scout & Triage**: Decomposes the bug report and analyzes target source code.
2. **Synthesize Repro Test**: Crafts a minimal, standalone reproduction test.
3. **Prove the Defect**: Executes the repro test against unpatched code. **The test MUST fail** — proving reproduction of the bug!
4. **Surgical Patching**: Synthesizes the minimal atomic diff needed to fix the defect.
5. **Verify the Fix**: Runs the test again in an isolated sandbox runner. **The test MUST pass!** If it fails, the agent self-corrects up to 3 times.
6. **Package PR**: Assembles a unified `.patch`, commit message, and ready-to-merge GitHub Pull Request markdown.

---

## 🏗️ Architecture

```
  ┌────────────────────────────────────────────────────────┐
  │                   INCOMING BUG REPORT                  │
  │     (GitHub Issue URL, Error Trace, or Code Sample)    │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                STAGE 1: SCOUT & TRIAGE                 │
  │  Decomposes semantic defect, inputs & expected delta   │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │            STAGE 2: SYNTHESIZE REPRO TEST              │
  │  Generates executable standalone reproduction suite    │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │        STAGE 3: VERIFY REPRO FAILS (PROOF)             │
  │  Executes on UNPATCHED code (Expects Exit Code 1)      │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │            STAGE 4: SURGICAL CODE REPAIR               │
  │  Generates minimal unified diff on target file         │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │       STAGE 5: VERIFY PATCH PASSES (SANDBOX)           │
  │  Executes on PATCHED code (Expects Exit Code 0)        │
  │  (Self-correction feedback loop if tests fail)         │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │          STAGE 6: REGRESSION GATE & PR PACKAGE         │
  │  • Unified .patch file                                 │
  │  • Repro test file                                     │
  │  • GitHub Pull Request markdown & audit logs           │
  └────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Interactive CLI (Zero-dependency, Instant Run)

Run the pre-loaded real-world bug surgery demos directly in your terminal:

```bash
# E-commerce coupon stacking calculation bug
node ./bin/gitsurgeon.js demo cart

# JWT token expiration clock-skew boundary bug
node ./bin/gitsurgeon.js demo jwt

# Monitoring telemetry zero-division SLA bug
node ./bin/gitsurgeon.js demo telemetry
```

### 2. Next.js Web Playground (Visual Experience)

Run the modern web dashboard to visually watch the agent's multi-stage workflow, view interactive unified diffs, and test custom code:

```bash
npm run dev
```

Open [http://localhost:3030](http://localhost:3030) in your browser.

---

## 🇮🇳 Powered by BharatCode

GitSurgeon natively integrates with **BharatCode's** official OpenAI-compatible API:

* **Endpoint:** `https://bharatcode.ai/api/model/v1`
* **Supported Models:**
  * `qwen-3.8-27b` (High-efficiency coding and reasoning)
  * `deepseek-v4.1-flash` (Advanced reasoning and long-context patching)

### Setting your API Key

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your BharatCode API key:

```env
BHARATCODE_API_KEY=your_key_here
BHARATCODE_API_BASE=https://bharatcode.ai/api/model/v1
BHARATCODE_MODEL=qwen-3.8-27b
```

> **Note:** GitSurgeon also features a built-in deterministic sandbox runner, allowing hackathon judges and community reviewers to test all scenarios instantly even without configuring an API key!

---

## 📦 Verification File

This repository contains the official hackathon verification file at [`BharatCode.txt`](./BharatCode.txt) in the root directory.

---

## 📄 License

MIT License. Built with ❤️ for the **BharatCode Build League 2026**.
