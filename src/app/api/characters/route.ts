import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status !== 429) return res;
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  return fetch(url, { next: { revalidate: 60 } });
}

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  const res = await fetchWithRetry(`${env.apiBaseUrl}/character?page=${page}`);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream API error (${res.status})` },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
