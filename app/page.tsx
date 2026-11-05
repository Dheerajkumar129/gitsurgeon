'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  GitPullRequest,
  Terminal,
  Cpu,
  Layers,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Bug,
} from 'lucide-react';
import { DEMO_SCENARIOS } from '@/core/tools/demo-scenarios';
import { HarnessExecutionResult, IssueReport } from '@/core/types';

export default function GitSurgeonDashboard() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(DEMO_SCENARIOS[0].id);
  const [model, setModel] = useState('qwen-3.8-27b');
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'repro' | 'pr' | 'proof'>('diff');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Custom code input mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('Bug: Zero division error in metrics calculation');
  const [customFile, setCustomFile] = useState('src/metrics.ts');
  const [customCode, setCustomCode] = useState(
    `export function calculateRatio(a: number, b: number): number {\n  // Bug: No zero check\n  return a / b;\n}`
  );

  const [result, setResult] = useState<HarnessExecutionResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);

  const currentScenario = isCustomMode
    ? {
        id: 'custom-scenario',
        title: customTitle,
        targetFile: customFile,
        language: 'typescript' as const,
        sourceCode: customCode,
        description: 'Custom user defined scenario',
        expectedBehavior: 'Safe execution without crashing',
        actualBehavior: 'Division by zero',
      }
    : DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];

  const handleRunSurgery = async () => {
    setIsRunning(true);
    setResult(null);
    setLiveLogs([
      {
        stage: 'SCOUT',
        timestamp: new Date().toLocaleTimeString(),
        message: `Scouting codebase for ${currentScenario.targetFile}...`,
        type: 'agent',
      },
    ]);

    try {
      const payload: any = {
        model,
        apiKey: apiKey.trim() || undefined,
      };

      if (isCustomMode) {
        payload.customIssue = currentScenario;
      } else {
        payload.scenarioId = selectedScenarioId;
      }

      const res = await fetch('/api/surgery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: HarnessExecutionResult = await res.json();
      setResult(data);
      if (data.logs) {
        setLiveLogs(data.logs);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadPatchFile = () => {
    if (!result?.patch?.diffUnified) return;
    const blob = new Blob([result.patch.diffUnified], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.issue.id}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090e1c]/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                GitSurgeon
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                BharatCode Harness
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Test-Reproducing & Codebase Patching Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="qwen-3.8-27b" className="bg-slate-900 text-slate-200">
                BharatCode Qwen 3.8 27B
              </option>
              <option value="deepseek-v4.1-flash" className="bg-slate-900 text-slate-200">
                BharatCode DeepSeek V4.1 Flash
              </option>
            </select>
          </div>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {apiKey ? 'API Key Active' : 'API Key (Optional)'}
          </button>

          <a
            href="https://github.com/Dheerajkumar129/gitsurgeon"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/20 text-xs font-semibold transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub Repo
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0c1326] to-slate-900 p-6 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Built for BharatCode Build League Hackathon 2026
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                From Ambiguous Bug to Verified Pull Request.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Traditional coding assistants guess fixes. GitSurgeon acts as a complete{' '}
                <strong className="text-slate-200">AI Harness</strong>: it synthesizes a failing
                reproduction test to confirm the defect, generates a surgical diff, verifies the test
                passes in a sandbox, and packages a ready-to-merge GitHub PR.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleRunSurgery}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Executing Harness...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Run Autonomous Surgery
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-xs uppercase font-bold text-slate-400 mr-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Preset Benchmarks:
          </span>
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setIsCustomMode(false);
                setSelectedScenarioId(scenario.id);
                setResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                !isCustomMode && selectedScenarioId === scenario.id
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              {scenario.title.replace(/^Bug:\s*/i, '').slice(0, 38)}...
            </button>
          ))}
          <button
            onClick={() => {
              setIsCustomMode(true);
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
              isCustomMode
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            + Custom Code Sandbox
          </button>
        </div>

        {/* Active Stage Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {[
            { id: 'SCOUT', label: '1. Scout & Triage', icon: Bug },
            { id: 'SYNTHESIZE_REPRO', label: '2. Repro Synth', icon: FileCode },
            { id: 'VERIFY_REPRO_FAILS', label: '3. Prove Defect', icon: AlertTriangle },
            { id: 'SURGICAL_PATCH', label: '4. Surgical Fix', icon: Wrench },
            { id: 'VERIFY_PATCH_PASSES', label: '5. Sandbox Pass', icon: CheckCircle2 },
            { id: 'PACKAGE_PR', label: '6. PR Assembly', icon: GitPullRequest },
          ].map((stage, idx) => {
            const isCompleted = result?.success;
            const isCurrent = isRunning;
            return (
              <div
                key={stage.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                    : isCurrent
                    ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300 animate-pulse'
                    : 'border-slate-800/80 bg-slate-900/40 text-slate-400'
                }`}
              >
                <stage.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dual Panel Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Bug Details & Code Input */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Target Bug Specification
                </span>
                <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  {currentScenario.targetFile}
                </span>
              </div>

              {isCustomMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Issue Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Target File</label>
                    <input
                      type="text"
                      value={customFile}
                      onChange={(e) => setCustomFile(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Target Code (Buggy)</label>
                    <textarea
                      rows={10}
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      className="w-full mt-1 font-mono text-xs bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">{currentScenario.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentScenario.description}
                  </p>
                  {currentScenario.stackTrace && (
                    <div className="p-2 rounded bg-red-950/20 border border-red-500/20 text-[11px] font-mono text-red-300">
                      {currentScenario.stackTrace}
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Unpatched Source Code:
                    </span>
                    <pre className="mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64">
                      {currentScenario.sourceCode}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Live Harness Agent Logs */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Harness Execution Trace
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {liveLogs.length} events
                </span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-[11px]">
                {liveLogs.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">
                    Ready. Click &apos;Run Autonomous Surgery&apos; to execute the harness pipeline.
                  </p>
                ) : (
                  liveLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-slate-400">[{log.timestamp}]</span>
                      <span
                        className={`font-semibold ${
                          log.type === 'success'
                            ? 'text-emerald-400'
                            : log.type === 'warn'
                            ? 'text-yellow-400'
                            : log.type === 'error'
                            ? 'text-red-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        [{log.stage}]
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Output Workspace (Diff, Repro, PR, Proof) */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
              <div className="flex items-center gap-1">
                {[
                  { id: 'diff', label: 'Surgical Diff', icon: Wrench },
                  { id: 'repro', label: 'Repro Test', icon: FileCode },
                  { id: 'pr', label: 'Pull Request', icon: GitPullRequest },
                  { id: 'proof', label: 'Sandbox Proof', icon: CheckCircle2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {result?.patch && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadPatchFile}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    .patch
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.patch?.diffUnified || '', 'diff')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/30 text-[11px] text-cyan-300 transition cursor-pointer"
                  >
                    {copiedField === 'diff' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy Diff
                  </button>
                </div>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-4 min-h-[480px]">
              {!result && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
                  <Wrench className="w-12 h-12 text-slate-700 animate-pulse" />
                  <h4 className="text-base font-semibold text-slate-300">
                    Harness Idle
                  </h4>
                  <p className="text-xs max-w-sm">
                    Select a benchmark scenario above and click &quot;Run Autonomous Surgery&quot; to
                    watch GitSurgeon synthesize a reproduction test, verify the failure, and produce
                    a surgical patch.
                  </p>
                </div>
              )}

              {isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-cyan-400 space-y-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                  <p className="text-xs font-mono tracking-wider">
                    EXECUTING HARNESS AGENT PIPELINE...
                  </p>
                </div>
              )}

              {result && (
                <>
                  {/* TAB 1: SURGICAL DIFF */}
                  {activeTab === 'diff' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                        <span>
                          File: <strong className="text-slate-200">{result.patch?.targetFile}</strong>
                        </span>
                        <span className="text-emerald-400 font-mono">
                          {result.patch?.linesModified} lines modified
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                        <strong>Surgery Logic:</strong> {result.patch?.explanation}
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono leading-relaxed overflow-x-auto max-h-[400px]">
                        {result.patch?.diffUnified.split('\n').map((line, idx) => {
                          let lineClass = 'text-slate-300';
                          if (line.startsWith('+')) lineClass = 'text-emerald-400 bg-emerald-950/30 block';
                          if (line.startsWith('-')) lineClass = 'text-rose-400 bg-rose-950/30 block';
                          if (line.startsWith('@@')) lineClass = 'text-cyan-400 font-bold block';
                          return (
                            <span key={idx} className={lineClass}>
                              {line}
                              {'\n'}
                            </span>
                          );
                        })}
                      </pre>
                    </div>
                  )}

                  {/* TAB 2: REPRO TEST */}
                  {activeTab === 'repro' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>
                          Test File: <strong className="text-slate-200">{result.reproTest?.testFileName}</strong>
                        </span>
                        <button
                          onClick={() => copyToClipboard(result.reproTest?.code || '', 'test')}
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                        >
                          {copiedField === 'test' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy Test Code
                        </button>
                      </div>
                      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
                        <strong>Reproduction Strategy:</strong> {result.reproTest?.rationale}
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[400px]">
                        {result.reproTest?.code}
                      </pre>
                    </div>
                  )}

                  {/* TAB 3: PULL REQUEST */}
                  {activeTab === 'pr' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs pb-1">
                        <span className="font-mono text-cyan-300">
                          Branch: {result.prBundle?.branchName}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `## ${result.prBundle?.title}\n\n${result.prBundle?.summary}\n\n### Root Cause Analysis\n${result.prBundle?.rootCauseAnalysis}\n\n### Impact\n${result.prBundle?.impactAssessment}`,
                              'pr'
                            )
                          }
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                        >
                          {copiedField === 'pr' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy PR Markdown
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed max-h-[400px] overflow-y-auto">
                        <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                          {result.prBundle?.title}
                        </h4>
                        <div>
                          <h5 className="font-semibold text-slate-300">Summary</h5>
                          <p className="text-slate-400">{result.prBundle?.summary}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-300">Root Cause Analysis</h5>
                          <p className="text-slate-400">{result.prBundle?.rootCauseAnalysis}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-300">Impact Assessment</h5>
                          <p className="text-slate-400">{result.prBundle?.impactAssessment}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SANDBOX PROOF */}
                  {activeTab === 'proof' && (
                    <div className="space-y-4">
                      {/* Before: Unpatched Run */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Stage 3: Unpatched Code Execution (Confirmed Defect)
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            Exit Code: {result.failingExecution?.exitCode}
                          </span>
                        </div>
                        <pre className="p-3 rounded-lg bg-rose-950/15 border border-rose-500/20 text-xs font-mono text-rose-300 overflow-x-auto">
                          {result.failingExecution?.assertionFailure ||
                            result.failingExecution?.stderr ||
                            'Defect captured'}
                        </pre>
                      </div>

                      {/* After: Patched Run */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Stage 5: Patched Code Execution (Confirmed Fix)
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            Duration: {result.passingExecution?.durationMs}ms
                          </span>
                        </div>
                        <pre className="p-3 rounded-lg bg-emerald-950/15 border border-emerald-500/20 text-xs font-mono text-emerald-300 overflow-x-auto">
                          {result.passingExecution?.stdout || 'All assertions passed.'}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Configure BharatCode API Key
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              GitSurgeon runs with built-in instant benchmark heuristics if no key is supplied.
              To call the live <strong>BharatCode {model}</strong> models directly, paste your API
              key below.
            </p>
            <div>
              <label className="text-xs text-slate-300 font-medium">BharatCode API Key</label>
              <input
                type="password"
                placeholder="bc_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
