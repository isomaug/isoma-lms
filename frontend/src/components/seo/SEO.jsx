import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * SEO component injects meta tags, Open Graph, Twitter Card, and JSON‑LD schema.
 * Props:
 *  - title: Page title (string)
 *  - description: Meta description (string)
 *  - url: Canonical URL (string)
 *  - image: URL of preview image (string)
 *  - type: "article" | "website" (string)
 *  - publishedTime: ISO date string (optional)
 *  - modifiedTime: ISO date string (optional)
 *  - author: Author name (optional)
 *  - faq: Array of FAQ objects for FAQ schema (optional)
 */
const SEO = ({
  title = "Peter Gordon Ekebu | Software Developer, Educator & Leader",
  description = "Official portfolio of Peter Gordon Ekebu, a Software Developer, Educator, and Leader exploring the intersection of Faith, Tech, and Leadership.",
  url,
  image = "https://petergordonekebu.com/ekebu-profile-pic.png",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  faq,
  keywords,
  preloadImages,
}) => {
  const jsonLd = [];

  if (type === "article") {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image,
      author: {
        "@type": "Person",
        name: author || "",
      },
      datePublished: publishedTime,
      dateModified: modifiedTime,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    };
    jsonLd.push(articleSchema);
  }

  if (faq && Array.isArray(faq) && faq.length) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
    jsonLd.push(faqSchema);
  }

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && (
        <meta
          name="keywords"
          content={Array.isArray(keywords) ? keywords.join(", ") : keywords}
        />
      )}
      {url && <link rel="canonical" href={url} />}

      {/* Image Preloads */}
      {preloadImages &&
        preloadImages.map((imgUrl, idx) => (
          <link
            key={idx}
            rel="preload"
            fetchPriority="high"
            as="image"
            href={imgUrl}
            type="image/png"
          />
        ))}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="Peter Gordon Ekebu" />
      <meta property="og:locale" content="en_US" />
      {type === "article" && (
        <>
          <meta
            property="article:author"
            content="https://www.facebook.com/EkebuPeterGordonOfficial"
          />
          <meta
            property="article:publisher"
            content="https://www.facebook.com/EkebuPeterGordonOfficial"
          />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:site" content="@EkebuG" />
      <meta name="twitter:creator" content="@EkebuG" />

      {/* JSON‑LD */}
      {jsonLd.map((obj, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
