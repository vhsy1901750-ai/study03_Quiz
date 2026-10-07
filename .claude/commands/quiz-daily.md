---
description: /quiz-add 1로 카테고리마다 문항을 1개씩 더하고, 성공하면 /quiz-validate로 전체 문항을 점검한다.
allowed-tools: Skill, Read, Grep, Glob, WebSearch, WebFetch
---
<!-- 생성: 2026-10-08 01:15 KST -->

두 명령어를 차례로 실행한다. 절차는 각 명령어 파일을 따르고, 이 파일에는 다시 적지 않는다.

1. `/quiz-add`를 인수 `1`로 실행한다. 절차: [quiz-add.md](quiz-add.md)
2. 1이 성공적으로 끝났을 때만 `/quiz-validate`를 인수 없이 실행한다. 절차: [quiz-validate.md](quiz-validate.md)

## 성공 기준

1은 다음을 모두 만족해야 성공이다.

- 사용자가 새 문항을 승인했다.
- 새 문항이 `questions.js`에 들어갔다.
- quiz-add.md의 마지막 확인(`tests.html`, `index.html?test`)에서 실패가 없다.

하나라도 아니면(승인하지 않음, 중간에 멈춤, 확인 실패) 2를 실행하지 않는다. 어디서 멈췄는지 알리고 끝낸다.
