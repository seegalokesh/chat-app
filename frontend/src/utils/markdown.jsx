/**
 * Markdown utilities for the chat app.
 *
 * react-markdown handles full rendering — this module provides:
 *   1. Pre-processing helpers (sanitise @mentions, detect links)
 *   2. A shared `remarkPlugins` / `rehypePlugins` config array
 *   3. Custom component overrides passed to <ReactMarkdown components={...}>
 *   4. A plain-text preview extractor (used in DM sidebar snippets)
 */

import remarkGfm from 'remark-gfm';

// ─── 1. Plugin config ────────────────────────────────────────────────────────

export const remarkPlugins = [remarkGfm];

// No rehype-sanitize here — we trust our own users.
// If you later allow external HTML, add rehype-sanitize.
export const rehypePlugins = [];


// ─── 2. Pre-processing ───────────────────────────────────────────────────────

/**
 * Wraps @mentions in a custom markdown link so the renderer can
 * style them specially.  e.g. "@alice" → "[@alice](#mention-alice)"
 */
export function processMentions(content) {
  return content.replace(/@(\w+)/g, '[@$1](#mention-$1)');
}

/**
 * Returns an array of mentioned usernames (without @) from a message.
 */
export function extractMentions(content) {
  const matches = content.matchAll(/@(\w+)/g);
  return [...new Set([...matches].map(m => m[1]))];
}

/**
 * Very light check: does the message contain only a single emoji?
 * If so the chat UI can render it larger.
 */
export function isSingleEmoji(content) {
  const trimmed = content.trim();
  // Basic emoji regex — covers most common ranges
  const emojiRe = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}){1,3}$/u;
  return emojiRe.test(trimmed);
}


// ─── 3. Component overrides for <ReactMarkdown> ──────────────────────────────

/**
 * Pass this as the `components` prop to <ReactMarkdown>.
 *
 * Overrides:
 *   - Links: open in new tab, mark @mention links with a CSS class
 *   - Code blocks: add a language label + copy button
 *   - Blockquotes: add a left-border style class
 */
export const markdownComponents = {
  // Links
  a({ href, children, ...props }) {
    const isMention = href?.startsWith('#mention-');
    if (isMention) {
      const username = href.replace('#mention-', '');
      return (
        <span className="mention" data-username={username} {...props}>
          {children}
        </span>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  // Inline code
  code({ node, inline, className, children, ...props }) {
    const language = /language-(\w+)/.exec(className || '')?.[1];

    if (inline) {
      return <code className="inline-code" {...props}>{children}</code>;
    }

    // Block code
    const handleCopy = () => {
      navigator.clipboard.writeText(String(children).trimEnd());
    };

    return (
      <div className="code-block">
        <div className="code-block-header">
          <span className="code-lang">{language || 'code'}</span>
          <button className="code-copy-btn" onClick={handleCopy}>Copy</button>
        </div>
        <pre>
          <code className={className} {...props}>{children}</code>
        </pre>
      </div>
    );
  },

  // Blockquote
  blockquote({ children }) {
    return <blockquote className="md-blockquote">{children}</blockquote>;
  },

  // Images — cap width and add alt text fallback
  img({ src, alt }) {
    return (
      <img
        src={src}
        alt={alt || 'image'}
        className="md-image"
        loading="lazy"
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
};


// ─── 4. Plain-text preview ───────────────────────────────────────────────────

/**
 * Strips markdown syntax and returns plain text.
 * Used for the DM sidebar "last message" preview snippet.
 *
 * Not a full parser — good enough for one-line previews.
 */
export function toPlainText(markdown = '', maxLength = 80) {
  const plain = markdown
    .replace(/!\[.*?\]\(.*?\)/g, '[image]')   // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')    // links
    .replace(/`{1,3}[^`]*`{1,3}/g, '[code]') // code
    .replace(/[#*_~>|\\]/g, '')               // syntax chars
    .replace(/\n+/g, ' ')
    .trim();

  return plain.length > maxLength
    ? plain.slice(0, maxLength) + '…'
    : plain;
}