import ogImage from "@/app/opengraph-image.jpg";

/**
 * The site-wide share image (`src/app/opengraph-image.jpg`, built by `npm run assets:brand`). Pages
 * that set their own Open Graph data stop inheriting the file automatically, so `pageMetadata`
 * falls back to this. Keep the alt text in step with `src/app/opengraph-image.alt.txt`.
 */
export const defaultSocialImage = {
  url: ogImage.src,
  width: ogImage.width,
  height: ogImage.height,
  alt: "The Bottom Left Pane podcast artwork: a four-pane window onto blue mountains, with a figure standing at an open, glowing door.",
};
