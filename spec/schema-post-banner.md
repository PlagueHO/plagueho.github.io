---
title: Post Banner Image Behavior and Styling
version: 1.0  
last-updated: 2024-06-08  
owner: PlagueHO Blog Maintainers
---

# Introduction

This specification outlines the behavior and styling of the post banner image component used in blog posts on the Eleventy-powered site. It ensures that the banner image is displayed correctly, left-aligned, and not visually trimmed or cropped, adhering to best practices for responsive design and accessibility.

## 1. Purpose & Scope

This specification defines the requirements, constraints, and integration details for the "post-banner" image component used in blog posts on the Eleventy-powered site. It covers how the banner image is defined, rendered, and styled to ensure consistent, non-trimmed, left-aligned display within the main content column.  
Intended audience: site maintainers, theme developers, and generative AIs producing or modifying post layouts.

## 2. Definitions

- **Post Banner**: The main visual image at the top of a blog post, defined in the post's front matter.
- **Front Matter**: The YAML block at the top of a Markdown file specifying metadata (e.g., `image` property).
- **Eleventy (11ty)**: The static site generator used for this blog.
- **Shortcode**: A reusable template function in Eleventy, e.g., `{% image ... %}`.
- **object-fit**: CSS property controlling how an image fills its container.
- **Content Column**: The main readable area of a post, typically 64rem wide.

## 3. Requirements, Constraints & Guidelines

- **Requirement 1:** The banner image must be defined in the post's front matter using the `image` property.
- **Requirement 2:** The banner image is rendered via the Eleventy `{% image %}` shortcode in the post layout.
- **Requirement 3:** The `<picture>` element for the banner must have the class `post-banner`.
- **Requirement 4:** The banner image must be left-aligned with the main content column and not extend into the "feature" or "popout" grid columns.
- **Requirement 5:** The image must not be visually trimmed or cropped on any edge.
- **Constraint 1:** The image must use `object-fit: contain` and `object-position: left center` to ensure the full image is visible and left-aligned.
- **Constraint 2:** The image container must have no unintended left margin or padding.
- **Guideline 1:** Source images should be at least 1024px wide (matching the typical content column) for optimal clarity.
- **Guideline 2:** Diagnostic background colors may be used during development to verify alignment.
- **Pattern to follow:** Use a more specific CSS selector for `.post-banner img` to override any global or generic image styles.

## 4. Interfaces & Data Contracts

- **Front Matter Example:**

  ```yaml
  ---
  title: "Sample Post"
  image: "/assets/banners/sample-banner.png"
  ---
  ```

- **Nunjucks Layout Snippet:**

  ```nunjucks
  {% if image %}
    {% image image, alt or "", credit, "eager", "post-banner" %}
  {% endif %}
  ```

- **CSS Contract:**

  ```css
  .post-banner {
    display: block;
    margin-block-end: var(--space-l, 2rem);
    margin-left: 0;
    padding-left: 0;
  }
  .post h1 + picture.post-banner img,
  picture.post-banner img {
    width: 100%;
    height: auto;
    aspect-ratio: auto;
    object-fit: contain;
    object-position: left center;
    display: block;
    margin-left: 0;
    padding-left: 0;
  }
  ```

## 5. Rationale & Context

- Ensures the banner image is visually aligned with the post content, not cropped, and maintains its aspect ratio.
- Overrides generic image rules (such as `object-fit: cover`) that may otherwise crop the image.
- Supports responsive design and accessibility by using semantic markup and CSS best practices.

## 6. Examples & Edge Cases

```yaml
# Example: Banner image defined in front matter
---
title: "Deploying Foundry VTT to Azure in 5 minutes"
image: "/assets/banners/banner-2025-05-26-deploying-foundryvtt-to-azure-in-5-minutes.png"
---
```

```nunjucks
{# Example: Rendering the banner in the post layout #}
{% if image %}
  {% image image, alt or "", credit, "eager", "post-banner" %}
{% endif %}
```

```css
/* Example: Ensuring the banner is not trimmed */
.post h1 + picture.post-banner img {
  object-fit: contain;
  object-position: left center;
}
```

**Edge Case:**  
If a global style applies `object-fit: cover` to all images, the `.post-banner img` selector must be more specific and/or use `!important` to override.

## 7. Validation Criteria

- The banner image is fully visible, left-aligned, and not cropped on any edge.
- The `<picture>` element has the `post-banner` class.
- The image is rendered within the main content column, not extending into side columns.
- No unintended margin or padding is present on the left of the image or its container.
- The rendered image matches the source file (no trimming in the browser).

## 8. Related Specifications / Further Reading

- [Eleventy Image Plugin Documentation](https://www.11ty.dev/docs/plugins/image/)
- [CSS object-fit property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
- [Blog Post Layout Source](../src/_layouts/post.njk)
