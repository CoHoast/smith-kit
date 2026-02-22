'use client';

import React from 'react';

interface ChangelogContentProps {
  content: string;
}

export function ChangelogContent({ content }: ChangelogContentProps) {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="space-y-2 mb-6 ml-1">
          {currentList.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#c4c4d4]">
              <span className="text-[#6366f1] mt-1.5 text-xs">●</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    
    // Section headers (## 🐛 Bug Fixes)
    if (trimmed.startsWith('## ')) {
      flushList();
      const headerText = trimmed.replace('## ', '');
      elements.push(
        <div key={`section-${i}`} className="mt-8 first:mt-0">
          <h3 className="text-base font-semibold text-white mb-4 pb-2 border-b border-[#27272a] flex items-center gap-2">
            {headerText}
          </h3>
        </div>
      );
    }
    // H1 headers (# Title)
    else if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flushList();
      // Skip H1 as we already show the title
    }
    // List items (- Fixed something)
    else if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.replace('- ', ''));
    }
    // Horizontal rule
    else if (trimmed === '---') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="border-[#27272a] my-8" />);
    }
    // Bold text line (**Contributors:** @someone)
    else if (trimmed.startsWith('**') && trimmed.includes(':**')) {
      flushList();
      const match = trimmed.match(/\*\*(.+?):\*\*\s*(.*)/);
      if (match) {
        elements.push(
          <div key={`meta-${i}`} className="flex items-center gap-2 text-sm text-[#6b6b80] mt-4 pt-4 border-t border-[#27272a]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="font-medium text-[#a1a1b5]">{match[1]}:</span>
            <span>{match[2]}</span>
          </div>
        );
      }
    }
    // Regular paragraph (non-empty, not a header)
    else if (trimmed && !trimmed.startsWith('#')) {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-[#a1a1b5] mb-4 leading-relaxed">{trimmed}</p>
      );
    }
  });

  flushList();
  
  return <div className="changelog-rendered">{elements}</div>;
}
