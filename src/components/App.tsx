"use client";

import { useEffect, useState } from "react";
import { currentAccount, logout, type Account } from "@/lib/storage";
import Login from "./Login";
import Workspace from "./Workspace";

export default function App() {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에서만 읽을 수 있어서 마운트 후에 확인한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(currentAccount());
    setReady(true);
  }, []);

  if (!ready) return <div className="boot" aria-hidden />;

  if (!account) return <Login onLogin={setAccount} />;

  return (
    <Workspace
      key={account.id}
      account={account}
      onLogout={() => {
        logout();
        setAccount(null);
      }}
    />
  );
}
