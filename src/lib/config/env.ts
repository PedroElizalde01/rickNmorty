export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_RICK_AND_MORTY_API_URL ??
    "https://rickandmortyapi.com/api",
} as const;
