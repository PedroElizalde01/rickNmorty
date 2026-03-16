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
  const ids = req.nextUrl.searchParams.get("ids");
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  const url = ids
    ? `${env.apiBaseUrl}/character/${ids}`
    : `${env.apiBaseUrl}/character?page=${page}`;

  const res = await fetchWithRetry(url);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream API error (${res.status})` },
      { status: res.status },
    );
  }

  const data = await res.json();

  if (ids) {
    return NextResponse.json(Array.isArray(data) ? data : [data]);
  }

  return NextResponse.json(data);
}
