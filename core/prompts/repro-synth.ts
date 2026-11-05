import { IssueReport } from '../types';

export function buildReproSynthPrompt(
  issue: IssueReport,
  triageData: Record<string, any>
): { system: string; user: string } {
  const system = `You are a Senior Test Automation Engineer specializing in minimal bug reproductions.
Your task is to write a standalone, automated reproduction test for the reported issue.

CRITICAL RULES:
1. The test MUST test the buggy behavior such that running it against the CURRENT buggy source code FAILS with an assertion error.
2. The test must be completely self-contained. It can import or reference the target functions/classes.
3. Test code must be syntactically valid and runnable in modern test harnesses.
4. For TypeScript/JavaScript: use standard test assertions (e.g. \`expect(actual).toBe(expected)\` or Node \`assert.strictEqual\`).
5. For Python: use standard pytest / unittest assertions (e.g. \`assert actual == expected\`).
6. Do NOT write an already-passing test! The goal of this phase in the agent harness is to PROVE the bug exists by triggering a failing test.

Output MUST be strictly valid JSON matching this schema:
{
  "testFileName": "repro.test.${issue.language === 'python' ? 'py' : 'ts'}",
  "testFramework": "${issue.language === 'python' ? 'pytest' : 'vitest'}",
  "rationale": "Why this specific test confirms the reproduction of the defect",
  "expectedErrorKeyword": "The keyword or assertion error expected when test fails",
  "code": "Full executable reproduction test code string"
}`;

  const user = `--- BUG REPORT ---
Title: ${issue.title}
Target File: ${issue.targetFile}
Language: ${issue.language}

--- TRIAGE FINDINGS ---
Defect Summary: ${triageData.defectSummary}
Trigger Conditions: ${triageData.triggerConditions}
Expected Behavior: ${triageData.expectedBehavior}
Actual Behavior: ${triageData.actualBehavior}

--- SOURCE CODE ---
\`\`\`${issue.language}
${issue.sourceCode}
\`\`\`

Generate the standalone reproduction test in valid JSON format.`;

  return { system, user };
}
