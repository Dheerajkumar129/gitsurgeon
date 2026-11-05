import { IssueReport, ReproTestSpec, TestExecutionResult } from '../types';

export function buildSurgicalPatchPrompt(
  issue: IssueReport,
  reproTest: ReproTestSpec,
  failureTrace: TestExecutionResult,
  previousAttemptError?: string
): { system: string; user: string } {
  const system = `You are a Principal Systems Architect performing surgical code repair.
Your goal is to apply the MINIMAL, CLEANEST patch to the target source file so that:
1. The failing reproduction test PASSES completely.
2. No unnecessary refactorings or stylistic reformatting are introduced.
3. Edge cases and unaffected existing logic remain intact.

Output MUST be strictly valid JSON matching this schema:
{
  "explanation": "concise explanation of why this patch fixes the defect",
  "patchedCode": "the complete updated source code of the target file"
}`;

  const user = `--- TARGET FILE: ${issue.targetFile} ---
Language: ${issue.language}
Original Source Code:
\`\`\`${issue.language}
${issue.sourceCode}
\`\`\`

--- REPRODUCTION TEST ---
\`\`\`${issue.language}
${reproTest.code}
\`\`\`

--- OBSERVED FAILURE TRACE IN HARNESS RUNNER ---
Passed: ${failureTrace.passed}
Exit Code: ${failureTrace.exitCode}
Stdout: ${failureTrace.stdout}
Stderr: ${failureTrace.stderr}
Assertion Failure: ${failureTrace.assertionFailure || 'Assertion Failed'}

${
  previousAttemptError
    ? `⚠️ PREVIOUS ATTEMPT FAILED WITH: ${previousAttemptError}\nPlease adjust your fix to resolve this.`
    : ''
}

Generate the surgical fix. Return ONLY valid JSON with 'explanation' and 'patchedCode'.`;

  return { system, user };
}
