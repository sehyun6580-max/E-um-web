"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { login, type Account } from "@/lib/storage";
import Orb from "./Orb";

export default function Login({ onLogin }: { onLogin: (account: Account) => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  // 같은 이름이 이미 있고 비밀번호가 다를 때, 새 공간을 만들지 물어본다.
  const [nameTaken, setNameTaken] = useState(false);

  async function submit(createNew: boolean) {
    if (pending) return;
    setPending(true);
    setError("");
    const result = await login(name, password, { createNew });
    setPending(false);
    if (result.ok) {
      onLogin(result.account);
      return;
    }
    setError(result.error);
    setNameTaken(Boolean(result.nameTaken));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(false);
  }

  return (
    <main className="login">
      <section className="login-card" aria-labelledby="login-title">
        <Orb mode="F" size={88} />
        <h1 id="login-title" className="login-title">
          이음 <span>E-um</span>
        </h1>
        <p className="login-lede">정답 대신, 당신의 연애 기준을 함께 찾는 곳</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">이름</span>
            <input
              className="input"
              autoComplete="username"
              placeholder="나를 부를 이름"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTaken(false);
              }}
              maxLength={20}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">비밀번호</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="네 글자 이상"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setNameTaken(false);
              }}
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {nameTaken && (
            <div className="login-taken">
              <p>
                다른 사람이 먼저 이 이름을 썼다면, 같은 이름으로 내 공간을 따로 만들 수 있어요. 다음부터는
                이름과 지금 적은 비밀번호로 들어오면 돼요.
              </p>
              <button className="btn btn-outline btn-block" type="button" onClick={() => submit(true)} disabled={pending}>
                같은 이름으로 새 공간 만들기
              </button>
            </div>
          )}

          <button className="btn btn-dark btn-block" type="submit" disabled={pending}>
            {pending ? "확인하는 중…" : "입장하기"}
          </button>
        </form>

        <p className="login-note">
          처음이라면 적은 이름과 비밀번호로 내 공간이 바로 만들어져요.
          <br />
          데모 버전이라 계정과 기록은 이 브라우저에만 저장돼요.
        </p>
        <Link href="/" className="login-back">
          이음이 어떤 챗봇인지 먼저 볼래요
        </Link>
      </section>
    </main>
  );
}
