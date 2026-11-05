import { IssueReport } from '../types';

export function buildTriagePrompt(issue: IssueReport): { system: string; user: string } {
  const system = `You are an elite Principal Software Engineer triaging a production codebase bug.
Your objective is to dissect an incoming bug report, analyze the affected source code, and determine:
1. The exact conceptual defect in logic, state, concurrency, or data flow.
2. What input or sequence triggers the anomaly.
3. The exact difference between ACTUAL buggy behavior and EXPECTED correct behavior.
4. The key failure keyword/exception that a reproduction test must trigger.

Output MUST be strictly valid JSON matching this schema:
{
  "defectSummary": "one sentence high-level summary",
  "rootCauseHypothesis": "detailed explanation of why the source code fails",
  "triggerConditions": "specific arguments, state, or concurrency sequence that exposes the bug",
  "expectedBehavior": "exact expected output or behavior",
  "actualBehavior": "exact incorrect output or exception",
  "testAssertionKeyword": "the specific keyword or error to assert in the repro test"
}`;

  const user = `--- BUG REPORT ---
Title: ${issue.title}
Description:
${issue.description}
${issue.stackTrace ? `Stack Trace:\n${issue.stackTrace}\n` : ''}

--- TARGET FILE: ${issue.targetFile} ---
Language: ${issue.language}
\`\`\`${issue.language}
${issue.sourceCode}
\`\`\`

Analyze this defect and output the JSON triage assessment.`;

  return { system, user };
}
