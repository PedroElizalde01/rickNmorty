import { NextRequest, NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const API_BASE = process.env.NEXT_PUBLIC_RICK_AND_MORTY_API_URL ?? "https://rickandmortyapi.com/api";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  const url = ids
    ? `${API_BASE}/character/${ids}`
    : `${API_BASE}/character?page=${page}`;

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
