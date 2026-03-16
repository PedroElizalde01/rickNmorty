import { NextRequest, NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const API_BASE = process.env.NEXT_PUBLIC_RICK_AND_MORTY_API_URL ?? "https://rickandmortyapi.com/api";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "Missing ids param" }, { status: 400 });
  }

  const res = await fetchWithRetry(`${API_BASE}/episode/${ids}`);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream API error (${res.status})` },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : [data]);
}
