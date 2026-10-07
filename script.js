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
      if (typeof item.url !== "string" || !item.url.startsWith("https://")) {
        errors.push(`${where}: url이 https://로 시작하지 않습니다.`);
      }
    });
  }
  return errors;
}

// ===== 상태 =====

const MODE_NAMES = { practice: "연습", speed: "스피드", hint: "힌트" };
const NOT_RECORDED = "순위표에 기록되지 않음";

const state = {
  mode: "practice",
  categoryId: null,
  queue: [],
  position: 0,
  score: 0,
  wrongIndices: [],
  answers: [],
  hintUsed: false,
  isRetry: false,
  retryCorrect: 0,
  remaining: 0,
  timerId: null,
};

// ===== 화면 =====

const app = document.getElementById("app");

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, onClick, className) {
  const node = el("button", text, className);
  node.type = "button";
  node.addEventListener("click", onClick);
  return node;
}

function render(...nodes) {
  app.replaceChildren(...nodes);
}

function categoryName(id) {
  return CATEGORIES.find((category) => category.id === id).name;
}

function currentQuestion() {
  return QUESTIONS[state.categoryId][state.queue[state.position]];
}

function sourceLine(item) {
  const line = el("p", "출처: ", "source");
  const link = el("a", item.source);
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  line.append(link);
  return line;
}

function showStart() {
  const categoryButtons = el("div", undefined, "categories");
  for (const category of CATEGORIES) {
    categoryButtons.append(button(category.name, () => startGame("practice", category.id)));
  }
  render(
    el("h1", "상식 퀴즈"),
    el("p", "연습 모드: 시간 제한과 힌트 없이 풉니다. 맞히면 1점입니다."),
    el("p", NOT_RECORDED, "notice"),
    el("h2", "카테고리를 고르세요"),
    categoryButtons,
  );
}

function startGame(mode, categoryId) {
  state.mode = mode;
  state.categoryId = categoryId;
  state.queue = QUESTIONS[categoryId].map((_, i) => i);
  state.position = 0;
  state.score = 0;
  state.wrongIndices = [];
  state.answers = [];
  state.isRetry = false;
  state.retryCorrect = 0;
  showQuestion();
}

function showQuestion() {
  state.hintUsed = false;
  const item = currentQuestion();

  const status = el("div", undefined, "status");
  const scoreNode = el("span", `점수 ${formatScore(state.score)}`);
  scoreNode.id = "score";
  status.append(
    el("span", categoryName(state.categoryId)),
    el("span", MODE_NAMES[state.mode]),
    el("span", `${state.position + 1} / ${state.queue.length}`),
    scoreNode,
  );

  const choices = el("div", undefined, "choices");
  item.choices.forEach((choice, i) => {
    const node = button(choice, () => handleAnswer(i), "choice");
    node.dataset.index = i;
    choices.append(node);
  });

  const feedback = el("div", undefined, "feedback");
  feedback.id = "feedback";

  render(status, el("h2", item.question, "question"), choices, feedback);
}

function handleAnswer(choiceIndex) {
  const item = currentQuestion();
  const isCorrect = choiceIndex === item.answer;
  state.score += scoreFor(isCorrect, state.hintUsed);
  document.getElementById("score").textContent = `점수 ${formatScore(state.score)}`;
  if (!isCorrect) state.wrongIndices.push(state.queue[state.position]);
  state.answers.push({ index: state.queue[state.position], choiceIndex, usedHint: state.hintUsed });

  for (const node of app.querySelectorAll(".choice")) {
    node.disabled = true;
    const index = Number(node.dataset.index);
    if (index === item.answer) node.classList.add("correct");
    else if (index === choiceIndex) node.classList.add("wrong");
  }

  const message = isCorrect ? "정답입니다." : "오답입니다.";
  const isLast = state.position === state.queue.length - 1;
  document.getElementById("feedback").append(
    el("p", message, isCorrect ? "result-correct" : "result-wrong"),
    el("p", item.explanation),
    sourceLine(item),
    button(isLast ? "결과 보기" : "다음", nextQuestion),
  );
}

function nextQuestion() {
  if (state.position === state.queue.length - 1) {
    showResult();
    return;
  }
  state.position++;
  showQuestion();
}

function reviewList() {
  const list = el("ul", undefined, "review");
  for (const answer of state.answers) {
    const item = QUESTIONS[state.categoryId][answer.index];
    const isCorrect = answer.choiceIndex === item.answer;
    const row = el("li", undefined, isCorrect ? "review-correct" : "review-wrong");
    const question = el("p", undefined, "review-question");
    question.append(el("span", isCorrect ? "✔" : "✘", "review-mark"), ` ${answer.index + 1}. ${item.question}`);
    const myAnswer = item.choices[answer.choiceIndex];
    let detail = `내 답: ${myAnswer}`;
    if (!isCorrect) detail += `, 정답: ${item.choices[item.answer]}`;
    row.append(question, el("p", detail, "review-detail"));
    list.append(row);
  }
  return list;
}

function showResult() {
  const total = state.queue.length;
  render(
    el("h1", "결과"),
    el("p", `${categoryName(state.categoryId)}, ${MODE_NAMES[state.mode]} 모드`),
    el("p", `${formatScore(state.score)} / ${total}`, "final-score"),
    el("p", `맞힌 문항 ${total - state.wrongIndices.length}개`),
    el("p", NOT_RECORDED, "notice"),
    el("h2", "문항별 결과"),
    reviewList(),
    button("처음으로", showStart),
  );
}

if (app) showStart();
