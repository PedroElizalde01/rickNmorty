export async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status !== 429) return res;
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  return fetch(url, { next: { revalidate: 60 } });
}
