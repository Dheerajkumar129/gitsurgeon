import { NextRequest, NextResponse } from 'next/server';
import { HarnessOrchestrator } from '@/core/workflow/orchestrator';
import { BharatCodeClient } from '@/core/bharatcode-client';
import { DEMO_SCENARIOS } from '@/core/tools/demo-scenarios';
import { IssueReport } from '@/core/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, customIssue, apiKey, model } = body;

    let targetIssue: IssueReport | undefined;

    if (customIssue && customIssue.title && customIssue.sourceCode) {
      targetIssue = {
        id: customIssue.id || 'custom-issue',
        title: customIssue.title,
        description: customIssue.description || 'Custom user submitted bug report',
        targetFile: customIssue.targetFile || 'src/module.ts',
        language: customIssue.language || 'typescript',
        sourceCode: customIssue.sourceCode,
        expectedBehavior: customIssue.expectedBehavior || 'Expected code to work without error',
        actualBehavior: customIssue.actualBehavior || 'Encountered unexpected behavior or exception',
        stackTrace: customIssue.stackTrace,
      };
    } else {
      targetIssue = DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0];
    }

    const client = new BharatCodeClient({
      apiKey: apiKey || process.env.BHARATCODE_API_KEY,
      model: model || process.env.BHARATCODE_MODEL || 'qwen-3.8-27b',
    });

    const orchestrator = new HarnessOrchestrator(client);
    const result = await orchestrator.run(targetIssue);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Harness execution failed' },
      { status: 500 }
    );
  }
}
