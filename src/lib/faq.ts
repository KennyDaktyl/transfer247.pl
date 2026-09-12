export type FaqPair = { question: string; answer: string };

/** FAQPage's Answer.text must be the plain text a user would read out
 * loud — not Markdown source. CMS answers occasionally link elsewhere
 * (e.g. "sprawdź [transfer na lotnisko Balice](/transfery-lotniskowe/...)")
 * for the on-page render (MarkdownContent turns that into a real <a>), but
 * the same raw string was leaking `[label](url)` brackets straight into
 * the JSON-LD until this stripped it down to just the link text. Also
 * drops stray bold/italic markers in case an answer uses them mid-sentence. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pulls Q&A pairs out of CMS Markdown body text for FAQPage JSON-LD,
 * instead of adding a separate structured FAQ field to every content
 * model. Every FAQ section across FixedRoute/Tour/BlogPost bodies is
 * already written as "**Question?**\nAnswer." blocks (that's the one
 * consistent format editors use) — scoped to whatever comes after the
 * "## FAQ" / "## Najczęściej zadawane pytania" heading so a bolded first
 * line elsewhere in the article is never mistaken for a question. */
export function extractFaqPairs(markdown: string): FaqPair[] {
  if (!markdown) return [];
  const headingMatch = markdown.match(
    /^##\s*(FAQ|Najczęściej zadawane pytania|Frequently Asked Questions|Häufig gestellte Fragen)\s*$/im,
  );
  const section = headingMatch ? markdown.slice(headingMatch.index! + headingMatch[0].length) : markdown;

  const pairs: FaqPair[] = [];
  for (const block of section.split(/\n\s*\n+/)) {
    const match = block.trim().match(/^\*\*(.+?)\*\*\n([\s\S]+)$/);
    if (match) {
      pairs.push({ question: toPlainText(match[1]), answer: toPlainText(match[2]) });
    }
  }
  return pairs;
}
