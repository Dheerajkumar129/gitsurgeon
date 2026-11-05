export function createUnifiedDiff(
  fileName: string,
  oldText: string,
  newText: string
): { diff: string; linesAdded: number; linesRemoved: number } {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  let linesAdded = 0;
  let linesRemoved = 0;

  // Simple unified diff generator (compatible with standard git diff)
  const header = `--- a/${fileName}\n+++ b/${fileName}\n@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;

  // Compute line-by-line differences
  const diffLines: string[] = [header];

  const maxLen = Math.max(oldLines.length, newLines.length);
  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldLine === newLine) {
      diffLines.push(` ${oldLine}`);
      oldIdx++;
      newIdx++;
    } else if (newIdx < newLines.length && !oldLines.includes(newLine)) {
      diffLines.push(`+${newLine}`);
      linesAdded++;
      newIdx++;
    } else if (oldIdx < oldLines.length && !newLines.includes(oldLine)) {
      diffLines.push(`-${oldLine}`);
      linesRemoved++;
      oldIdx++;
    } else {
      if (oldIdx < oldLines.length) {
        diffLines.push(`-${oldLine}`);
        linesRemoved++;
        oldIdx++;
      }
      if (newIdx < newLines.length) {
        diffLines.push(`+${newLine}`);
        linesAdded++;
        newIdx++;
      }
    }
  }

  return {
    diff: diffLines.join('\n'),
    linesAdded,
    linesRemoved,
  };
}
