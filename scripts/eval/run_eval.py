"""이음 컨트롤러 시나리오 테스트.

실제 사이트(또는 로컬)의 /api/chat에 미리 정한 사용자 발화를 차례로 넣고, 답을 JSON으로 모은다.
여러 턴 대화는 앞 턴의 답(제목+본문)을 다시 넣어 화면에서 쓰는 것처럼 이어 간다.
판정은 이 스크립트가 하지 않는다. 모은 답을 사람이(또는 Claude가) docs/HANDOFF.md 7장의 기준으로 판정한다.

주의: 실제 사이트에 돌리면 Vercel에 넣어 둔 API 키로 비용이 나간다. 호출 수 = 시나리오 턴 수 합 × 모드 수 × 반복 횟수.

예)
  python3 scripts/eval/run_eval.py --set criteria --out docs/eval/2026-11-10_criteria_after-pr7.json
  python3 scripts/eval/run_eval.py --set stress4d --modes T --runs 3 --out /tmp/t.json
  python3 scripts/eval/run_eval.py --set criteria --url http://localhost:3000/api/chat --out /tmp/local.json

Python의 SSL 인증서 문제를 피하려고 요청은 curl로 보낸다.
"""
import argparse, json, os, re, subprocess, time

# 시나리오는 scripts/eval/scenarios.json에 있어요 (run_baseline.mjs와 같이 써요).
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "scenarios.json"), encoding="utf-8") as f:
    SETS = json.load(f)


def tag(raw, name):
    m = re.search(rf"<{name}>(.*?)(</{name}>|$)", raw, re.S)
    return m.group(1).strip() if m else ""


def call(url, mode, topic, messages):
    body = json.dumps({"mode": mode, "messages": messages, "topic": topic})
    for attempt in range(3):
        p = subprocess.run(
            ["curl", "-sS", "-m", "180", "-D", "-", "-H", "Content-Type: application/json", "--data-binary", "@-", url],
            input=body.encode(), capture_output=True,
        )
        if p.returncode == 0:
            break
        print("retry", attempt + 1, "curl exit", p.returncode, flush=True)
        time.sleep(5)
    else:
        raise RuntimeError("curl failed 3 times")
    head, _, raw = p.stdout.decode("utf-8", "replace").partition("\r\n\r\n")
    headers = {k.lower(): v for k, v in (l.split(": ", 1) for l in head.split("\r\n")[1:] if ": " in l)}
    return raw, headers


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--set", choices=SETS, required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--url", default="https://e-um-pearl.vercel.app/api/chat")
    ap.add_argument("--modes", default="FT", help="F, T, 또는 FT")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--topic", default="dating", choices=["dating", "some", "married"])
    args = ap.parse_args()

    results = []
    for name, turns_by in SETS[args.set].items():
        for mode in args.modes:
            turns = turns_by[mode] if isinstance(turns_by, dict) else turns_by
            for run in range(1, args.runs + 1):
                messages, log, headers = [], [], {}
                for i, user in enumerate(turns, 1):
                    messages.append({"role": "user", "content": user})
                    raw, headers = call(args.url, mode, args.topic, messages)
                    reply = {"title": tag(raw, "제목"), "body": tag(raw, "본문"), "other": tag(raw, "다른시선")}
                    if "[[EUM_" in raw:
                        reply["error"] = raw[-300:]
                    log.append({"turn": i, "user": user, **reply})
                    messages.append({"role": "assistant", "content": f"{reply['title']}\n{reply['body']}".strip()})
                    time.sleep(1)
                results.append({"scenario": name, "mode": mode, "run": run,
                                "provider": headers.get("x-eum-provider", ""), "turns": log})
                print(name, mode, run, "done", flush=True)
                with open(args.out, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=1)
    print("ALL DONE", args.out)


if __name__ == "__main__":
    main()
