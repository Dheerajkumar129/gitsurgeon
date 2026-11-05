export type Language = 'typescript' | 'javascript' | 'python';

export type TestFramework = 'vitest' | 'jest' | 'pytest' | 'built-in';

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  url?: string;
  language: Language;
  targetFile: string;
  sourceCode: string;
  stackTrace?: string;
  expectedBehavior: string;
  actualBehavior: string;
}

export interface ReproTestSpec {
  testFileName: string;
  testFramework: TestFramework;
  code: string;
  rationale: string;
  expectedErrorKeyword: string;
}

export interface TestExecutionResult {
  passed: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  assertionFailure?: string;
}

export interface SurgicalPatch {
  targetFile: string;
  explanation: string;
  diffUnified: string;
  patchedCode: string;
  linesModified: number;
}

export type HarnessStage =
  | 'IDLE'
  | 'SCOUT'
  | 'SYNTHESIZE_REPRO'
  | 'VERIFY_REPRO_FAILS'
  | 'SURGICAL_PATCH'
  | 'VERIFY_PATCH_PASSES'
  | 'REGRESSION_CHECK'
  | 'PACKAGE_PR'
  | 'COMPLETED'
  | 'FAILED';

export interface StageLog {
  stage: HarnessStage;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'success' | 'error' | 'agent';
  details?: Record<string, any>;
}

export interface PullRequestBundle {
  title: string;
  branchName: string;
  summary: string;
  rootCauseAnalysis: string;
  reproductionProof: {
    testCode: string;
    failingOutput: string;
  };
  solutionVerification: {
    diff: string;
    passingOutput: string;
  };
  impactAssessment: string;
}

export interface HarnessExecutionResult {
  success: boolean;
  issue: IssueReport;
  reproTest?: ReproTestSpec;
  failingExecution?: TestExecutionResult;
  patch?: SurgicalPatch;
  passingExecution?: TestExecutionResult;
  prBundle?: PullRequestBundle;
  logs: StageLog[];
  metrics: {
    totalDurationMs: number;
    attempts: number;
    model: string;
  };
}
