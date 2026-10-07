// 생성: 2026-10-07 22:53 KST

// ===== 순수 함수 =====

function scoreFor(isCorrect, usedHint) {
  if (!isCorrect) return 0;
  return usedHint ? 0.5 : 1;
}

function formatScore(score) {
  return String(score);
}
