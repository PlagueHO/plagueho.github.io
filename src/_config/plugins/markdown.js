import markdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItPrism from 'markdown-it-prism';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItClass from '@toycode/markdown-it-class';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import {full as markdownItEmoji} from 'markdown-it-emoji';
import markdownItFootnote from 'markdown-it-footnote';
import markdownitMark from 'markdown-it-mark';
import markdownitAbbr from 'markdown-it-abbr';
import {slugifyString} from '../filters/slugify.js';

/**
 * Markdown-it plugin: GitHub-style callout blocks for blockquotes.
 *
 * This plugin scans blockquotes for a first-line marker of the form:
 *   [!NOTE], [!WARNING], or [!IMPORTANT]
 * If found, it:
 *   - Adds a class (e.g. blockquote--note) and data-callout attribute to the blockquote.
 *   - Removes the marker from the rendered output (removes the whole paragraph if empty).
 * This enables custom styling and icons for callout blocks in Markdown content.
 *
 * Example Markdown:
 *   > [!WARNING]
 *   > This is a warning callout!
 *
 * Example HTML output:
 *   <blockquote class="blockquote--warning" data-callout="warning">
 *     <p>This is a warning callout!</p>
 *   </blockquote>
 */
function calloutPlugin(md) {
  md.core.ruler.after('block', 'callout', state => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'blockquote_open') continue;

      // Find the first paragraph inside the blockquote
      let j = i + 1;
      while (j < tokens.length && tokens[j].type !== 'blockquote_close') {
        if (
          tokens[j].type === 'paragraph_open' &&
          tokens[j + 1] &&
          tokens[j + 1].type === 'inline' &&
          tokens[j + 2] &&
          tokens[j + 2].type === 'paragraph_close'
        ) {
          const inline = tokens[j + 1];
          // Match marker at the start of the paragraph
          const match = inline.content.match(/^\s*\[!(NOTE|WARNING|IMPORTANT)\]\s*/i);
          if (match) {
            const type = match[1].toLowerCase();

            // Add class and data attribute for styling
            tokens[i].attrJoin('class', `blockquote--${type}`);
            tokens[i].attrSet('data-callout', type);

            // Remove just the marker from the inline content
            inline.content = inline.content.replace(/^\s*\[!(NOTE|WARNING|IMPORTANT)\]\s*/i, '');

            // If the paragraph is now empty, remove the whole paragraph
            if (inline.content.trim() === '') {
              tokens.splice(j, 3);
            }
            break;
          }
        }
        j++;
      }
    }
  });
}

export const markdownLib = markdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
})
  .disable('code')
  .use(markdownItAttrs)
  .use(markdownItPrism, {
    defaultLanguage: 'plaintext'
  })
  .use(markdownItAnchor, {
    slugify: slugifyString,
    tabIndex: false,
    permalink: markdownItAnchor.permalink.headerLink({
      class: 'heading-anchor'
    })
  })
  .use(markdownItClass, {})
  .use(markdownItLinkAttributes, [
    {
      // match external links
      matcher(href) {
        return href.match(/^https?:\/\//);
      },
      attrs: {
        rel: 'noopener'
      }
    }
  ])
  .use(markdownItEmoji)
  .use(markdownItFootnote)
  .use(markdownitMark)
  .use(markdownitAbbr)
  .use(md => {
    md.renderer.rules.image = (tokens, idx) => {
      const token = tokens[idx];
      const src = token.attrGet('src');
      const alt = token.content || '';
      const caption = token.attrGet('title');

      // Collect attributes
      const attributes = token.attrs || [];
      const hasEleventyWidths = attributes.some(([key]) => key === 'eleventy:widths');
      if (!hasEleventyWidths) {
        attributes.push(['eleventy:widths', '650,960,1400']);
      }

      const attributesString = attributes.map(([key, value]) => `${key}="${value}"`).join(' ');
      const imgTag = `<img src="${src}" alt="${alt}" ${attributesString}>`;
      return caption ? `<figure>${imgTag}<figcaption>${caption}</figcaption></figure>` : imgTag;
    };
  })
  .use(calloutPlugin);
