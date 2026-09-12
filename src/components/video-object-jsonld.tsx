/** VideoObject for a blog post's embedded YouTube video. `uploadDate` is a
 * required property for Google's video rich result, but the CMS only
 * tracks when the *article* was published, not when the video itself went
 * up on YouTube — using the article's publish date as the closest real
 * date on hand rather than guessing something more precise. `name`/
 * `description` fall back to the post's own title/excerpt when the
 * YouTube oEmbed lookup fails or is skipped. */
export function VideoObjectJsonLd({
  name,
  description,
  videoId,
  uploadDate,
}: {
  name: string;
  description: string;
  videoId: string;
  uploadDate: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: [`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`],
    uploadDate,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Best-effort real video title via YouTube's public oEmbed endpoint — no
 * API key needed. Falls back to null (caller uses the post's own title)
 * if YouTube is unreachable or the video is private/deleted, so a blog
 * page never fails to render over this. */
export async function fetchYoutubeTitle(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: unknown };
    return typeof data.title === "string" ? data.title : null;
  } catch {
    return null;
  }
}
