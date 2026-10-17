/**
 * Structured data as a native `<script type="application/ld+json">` (Next.js JSON-LD guide).
 * `<` is escaped so text from the feed can't close the script tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
