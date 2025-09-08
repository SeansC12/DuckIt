import React from "react";

// Simple markdown parser for basic features
const parseMarkdown = (text: string) => {
  if (!text) return "";
  // ...existing code...
  // Split into lines for processing
  const lines = text.split("\n");
  const result: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check for list items
    const unorderedMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (unorderedMatch) {
      if (!inUnorderedList) {
        result.push("<ul>");
        inUnorderedList = true;
      }
      if (inOrderedList) {
        result.push("</ol>");
        inOrderedList = false;
      }
      result.push(`<li>${unorderedMatch[2]}</li>`);
    } else if (orderedMatch) {
      if (!inOrderedList) {
        result.push("<ol>");
        inOrderedList = true;
      }
      if (inUnorderedList) {
        result.push("</ul>");
        inUnorderedList = false;
      }
      result.push(`<li>${orderedMatch[2]}</li>`);
    } else {
      // Close any open lists
      if (inUnorderedList) {
        result.push("</ul>");
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push("</ol>");
        inOrderedList = false;
      }
      // Process regular line
      if (line.trim() === "") {
        result.push("<br />");
      } else {
        result.push(line);
      }
    }
  }
  // Close any remaining open lists
  if (inUnorderedList) result.push("</ul>");
  if (inOrderedList) result.push("</ol>");
  // Join and apply other markdown formatting
  const html = result
    .join("\n")
    // Headers
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Custom highlights
    .replace(/==red==(.*?)==\/red==/g, '<span class="highlight-red">$1</span>')
    .replace(
      /==green==(.*?)==\/green==/g,
      '<span class="highlight-green">$1</span>',
    )
    .replace(
      /==yellow==(.*?)==\/yellow==/g,
      '<span class="highlight-yellow">$1</span>',
    );
  return html;
};

interface MarkdownRendererProps {
  markdownText: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdownText,
}) => {
  return (
    <>
      <style>{`
        .highlight-red {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .highlight-green {
          background-color: #dcfce7;
          color: #16a34a;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .highlight-yellow {
          background-color: #fef3c7;
          color: #d97706;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .markdown-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #1f2937;
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
          color: #374151;
        }
        .markdown-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
          color: #4b5563;
        }
        .markdown-content {
          color: #fff;
        }
        .markdown-content code {
          background-color: #f3f4f6;
          color: #374151;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
        }
        .markdown-content ul {
          list-style-type: disc;
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .markdown-content ol {
          list-style-type: decimal;
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .markdown-content li {
          margin: 0.25rem 0;
          line-height: 1.5;
        }
        .markdown-content strong {
          font-weight: bold;
        }
        .markdown-content em {
          font-style: italic;
        }
      `}</style>
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(markdownText) }}
      />
    </>
  );
};

export default MarkdownRenderer;
