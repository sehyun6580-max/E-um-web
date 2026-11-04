# 이음 (E-um)

정답 대신, 사용자가 자기 연애 기준을 스스로 찾도록 돕는 연애 상담 챗봇입니다.
왼쪽 '이음'에서 대화하고, 오른쪽 'Mind Prism · 기억과 기준의 방'에 찾은 기준을 포스트잇으로 남깁니다.
이야기할 캐릭터(미리 만든 7명 또는 직접 만들기)와 고민 종류(연애·썸·부부)를 고를 수 있고, 정리한 마음은 💌 화해 편지 링크로 상대에게 보낼 수 있습니다.

- 실제 사이트: https://e-um-pearl.vercel.app (소개 `/`, 챗봇 `/chat`)
- 인수인계 문서: [docs/HANDOFF.md](docs/HANDOFF.md)
- Claude 작업 지침: [CLAUDE.md](CLAUDE.md)

## 로컬에서 실행

```bash
npm install
cp .env.example .env.local   # 키를 채우면 실제 모델로, 비워 두면 예시 답변으로 동작
npm run dev
```

## 환경변수

| 이름 | 용도 |
| --- | --- |
| `ANTHROPIC_API_KEY` | 감성 공감 모드 (F봇, Claude Sonnet 5.5) |
| `OPENAI_API_KEY` | 팩트 폭격 모드 (T봇, GPT-5.6 Sol) |
| `ANTHROPIC_MODEL`, `OPENAI_MODEL` | 모델 이름을 바꿀 때만 |

키가 하나만 있으면 그 모델로 두 모드를 모두 답합니다.

## 구조

- `src/lib/server/prompts.ts` — 다섯 원칙, 6가지 컨트롤러, 단계별 전략, 모드별 규칙
- `src/lib/server/llm.ts` — 모델 호출(스트리밍), 키에 따른 모델 선택
- `src/lib/server/mock.ts` — 키가 없을 때의 예시 답변
- `src/lib/personas.ts` — 상담 캐릭터와 고민 종류
- `src/lib/letter.ts` — 화해 편지를 링크에 담고 꺼내기 (서버에 저장하지 않음)
- `src/app/api/*` — 대화(`chat`), 뒤집어보기(`flip`), 초안 채우기(`draft`), 화해 편지 초안(`letter`), 키 상태(`status`)
- `src/app/letter` — 편지 링크를 연 사람이 보는 화면
- `src/components/*` — 로그인, 이음 채팅, Mind Prism, 캐릭터 고르기, 화해 편지, 러브레터 연출
- `src/lib/storage.ts` — 데모용 로그인과 사용자별 저장 (이 브라우저의 localStorage)

## 배포 (Vercel)

GitHub 저장소를 Vercel에 연결하고, Project Settings → Environment Variables에 위 키를 넣으면 됩니다.
