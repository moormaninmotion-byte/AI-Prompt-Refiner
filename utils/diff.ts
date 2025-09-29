export type DiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

function tokenize(text: string): string[] {
    return text.split(/(\s+)/);
}

export function diffWords(oldText: string, newText: string): DiffPart[] {
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  
  const m = oldTokens.length;
  const n = newTokens.length;

  // DP matrix to find Levenshtein distance
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],       // Deletion
          dp[i][j - 1],       // Insertion
          dp[i - 1][j - 1]    // Substitution
        );
      }
    }
  }

  // Backtrack from the end to generate diff parts
  const result: DiffPart[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    // Check for substitution
    if (i > 0 && j > 0 && dp[i][j] === dp[i-1][j-1] + 1 && oldTokens[i-1] !== newTokens[j-1]) {
        result.unshift({ value: newTokens[j-1], added: true });
        result.unshift({ value: oldTokens[i-1], removed: true });
        i--; j--;
    } 
    // Check for common part
    else if (i > 0 && j > 0 && oldTokens[i-1] === newTokens[j-1]) {
      result.unshift({ value: oldTokens[i-1] });
      i--; j--;
    } 
    // Check for insertion
    else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j-1] + 1)) {
      result.unshift({ value: newTokens[j-1], added: true });
      j--;
    } 
    // Check for deletion
    else if (i > 0 && (j === 0 || dp[i][j] === dp[i-1][j] + 1)) {
      result.unshift({ value: oldTokens[i-1], removed: true });
      i--;
    } else {
        // Should not be reached, but as a fallback
        if (j > 0) {
            result.unshift({ value: newTokens[j-1], added: true });
            j--;
        }
        if (i > 0) {
            result.unshift({ value: oldTokens[i-1], removed: true });
            i--;
        }
    }
  }

  // Merge consecutive parts of the same type for cleaner rendering
  if (result.length === 0) return [];
  const mergedResult: DiffPart[] = [result[0]];
  for (let k = 1; k < result.length; k++) {
    const last = mergedResult[mergedResult.length - 1];
    const current = result[k];
    if (last.added === current.added && last.removed === current.removed) {
      last.value += current.value;
    } else {
      mergedResult.push(current);
    }
  }

  return mergedResult;
}
