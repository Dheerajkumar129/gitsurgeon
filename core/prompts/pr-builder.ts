import { IssueReport, ReproTestSpec, SurgicalPatch, TestExecutionResult } from '../types';

export function buildPrPrompt(
  issue: IssueReport,
  repro: ReproTestSpec,
  failingRun: TestExecutionResult,
  patch: SurgicalPatch,
  passingRun: TestExecutionResult
): { system: string; user: string } {
  const system = `You are an elite Open Source Maintainer creating an exemplary Pull Request description.
Summarize the bug, root cause, the reproduction verification (failing test proof), and the patch verification (passing test proof).

Output MUST be strictly valid JSON matching this schema:
{
  "title": "fix: concise conventional commit title",
  "branchName": "fix/short-slug",
  "summary": "High-level summary of the bug and resolution",
  "rootCauseAnalysis": "Precise technical breakdown of why the bug occurred",
  "impactAssessment": "Risk and impact on consumers of this code",
  "prBodyMarkdown": "Ready-to-paste markdown content for a GitHub PR including headings, reproduction proof, and diff"
}`;

  const user = `Issue Title: ${issue.title}
Target File: ${issue.targetFile}
Reproduction Test: ${repro.testFileName}
Repro Failure Log: ${failingRun.assertionFailure || failingRun.stderr || failingRun.stdout}
Patch Explanation: ${patch.explanation}
Lines Modified: ${patch.linesModified}
Passing Run Status: Passed (${passingRun.durationMs}ms)

Generate the complete Pull Request specification in JSON.`;

  return { system, user };
}
