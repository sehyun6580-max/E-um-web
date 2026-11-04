import type { Metadata } from "next";
import App from "@/components/App";

export const metadata: Metadata = {
  title: "대화하기 | 이음 E-um",
};

export default function ChatPage() {
  return <App />;
}
