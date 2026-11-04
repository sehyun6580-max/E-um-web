import { connection } from "next/server";
import { availableProviders } from "@/lib/server/llm";

export async function GET() {
  // 환경변수는 배포 후에 바뀔 수 있으니 빌드 때 굳히지 않고 요청마다 읽는다.
  await connection();
  return Response.json(availableProviders());
}
