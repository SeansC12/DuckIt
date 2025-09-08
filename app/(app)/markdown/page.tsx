"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../../../components/transcript/markdown-renderer";

const InteractiveMarkdownRenderer = () => {
  const [markdownText, setMarkdownText] =
    useState(`# Markdown with Custom Highlights

This is a **bold** text and this is *italic* text.

## Code Example
Here's some \`inline code\` in the text.

## Lists Support

### Unordered Lists (using - or *)
- First item with ==red==red highlight==/red==
- Second item
* Third item using asterisk
* Fourth item with ==green==green highlight==/green==

### Ordered Lists
1. First numbered item
3. Second item (numbers don't need to be in order)
2. Third item with ==yellow==yellow highlight==/yellow==
5. Fourth item

## Mixed Content
You can combine lists with other formatting:

- **Bold list item**
- *Italic list item*  
- List item with \`code\`
- ==red==Highlighted list item==/red==

1. **First** numbered item
2. Item with ==green==success highlight==/green==
3. Final item

### Custom Highlighting
You can highlight text in different colors:
- ==red==Important warning text==/red==
- ==green==Success messages==/green==  
- ==yellow==Notes and tips==/yellow==

You can also combine **bold** with ==red==highlighted red text==/red== for emphasis.`);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Markdown Editor with Custom Highlighting
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Input Section */}
          <div className="border-r border-gray-200">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
              Markdown Input
            </div>
            <textarea
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border-none resize-none focus:outline-none"
              placeholder="Enter your markdown here..."
            />
          </div>
          {/* Output Section */}
          <div>
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
              Rendered Output
            </div>
            <div className="h-96 p-4 overflow-auto markdown-content">
              <MarkdownRenderer markdownText={markdownText} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          Highlighting Syntax:
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>
            <code className="bg-white px-2 py-1 rounded">
              ==red==text==//red==
            </code>{" "}
            → Red highlight
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded">
              ==green==text==//green==
            </code>{" "}
            → Green highlight
          </div>
          <div>
            <code className="bg-white px-2 py-1 rounded">
              ==yellow==text==//yellow==
            </code>{" "}
            → Yellow highlight
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMarkdownRenderer;
