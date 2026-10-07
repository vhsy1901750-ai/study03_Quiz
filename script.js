// 생성: 2026-10-07 22:53 KST

// ===== 순수 함수 =====

function scoreFor(isCorrect, usedHint) {
  if (!isCorrect) return 0;
  return usedHint ? 0.5 : 1;
}

function formatScore(score) {
  return String(score);
}

function validateQuestions(categories, questions) {
  const errors = [];
  if (categories.length !== 4) {
    errors.push(`카테고리가 4개가 아닙니다(${categories.length}개).`);
  }
  for (const category of categories) {
    const items = questions[category.id];
    if (!Array.isArray(items)) {
      errors.push(`${category.id}: 문항 배열이 없습니다.`);
      continue;
    }
    if (items.length !== 10) {
      errors.push(`${category.id}: 문항이 10개가 아닙니다(${items.length}개).`);
    }
    items.forEach((item, i) => {
      const where = `${category.id} ${i + 1}번`;
      for (const field of ["question", "explanation", "source"]) {
        if (typeof item[field] !== "string" || item[field].trim() === "") {
          errors.push(`${where}: ${field} 값이 비어 있습니다.`);
        }
      }
      if (!Array.isArray(item.choices) || item.choices.length !== 4) {
        errors.push(`${where}: 보기가 4개가 아닙니다.`);
      } else {
        if (item.choices.some((choice) => typeof choice !== "string" || choice.trim() === "")) {
          errors.push(`${where}: 비어 있는 보기가 있습니다.`);
        }
        if (new Set(item.choices).size !== 4) {
          errors.push(`${where}: 중복된 보기가 있습니다.`);
        }
      }
      if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3) {
        errors.push(`${where}: answer가 0~3의 정수가 아닙니다.`);
      }
    });
  }
  return errors;
}
