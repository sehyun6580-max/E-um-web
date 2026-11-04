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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const result = await login(name, password);
    setPending(false);
    if (result.ok) onLogin(result.account);
    else setError(result.error);
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
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
