---
"@stophy/mcp": patch
---

Follow the new API. Endpoints take a link or an id under the response's names, such as `videoUrl` or `videoId`, and exactly one is sent. Search, news, maps, Play, flights and trends are now `google` endpoints, and transcripts are `youtubeTranscript`, `instagramTranscript` and `tiktokTranscript`. Amazon endpoints are new. Page-numbered lists no longer return `hasMore`: ask for the next page until `results` is empty. Most calls cost 1 credit, some cost 2, and long lists cost 1 credit per 10 results.
