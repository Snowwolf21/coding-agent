import React, { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa6";

// Helper to format inline code (`) and bold (**) elements without danger/HTML injection
function formatInlineText(text: string): React.ReactNode[] {
  const codeParts = text.split(/`([\s\S]*?)`/g);
  return codeParts.map((part, index) => {
    const isInlineCode = index % 2 === 1;
    if (isInlineCode) {
      return (
        <code key={index} className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[13px] border border-slate-800/80 mx-0.5">
          {part}
        </code>
      );
    } else {
      const boldParts = part.split(/\*\*([\s\S]*?)\*\*/g);
      return boldParts.map((bPart, bIndex) => {
        const isBold = bIndex % 2 === 1;
        if (isBold) {
          return <strong key={`${index}-${bIndex}`} className="font-semibold text-slate-100">{bPart}</strong>;
        }
        return bPart;
      });
    }
  });
}

// Code Block renderer with Clipboard interaction capabilities
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code snippet:", err);
    }
  };

  return (
    <div className="my-3 rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden shadow-md font-mono text-[13px] text-left">
      <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2.5 text-slate-400 border-b border-slate-800">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] hover:text-white transition-colors duration-150 py-0.5 px-2 rounded hover:bg-slate-800 cursor-pointer"
        >
          {copied ? (
            <>
              <FaCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <FaCopy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed whitespace-pre font-mono">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// Primary Lightweight Custom Parser
export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split string into alternating non-code and code blocks
  const parts = content.split(/```/g);

  return (
    <div className="space-y-2 text-left leading-relaxed text-slate-300">
      {parts.map((part, index) => {
        const isCodeBlock = index % 2 === 1;

        if (isCodeBlock) {
          const firstNewLine = part.indexOf("\n");
          let language = "code";
          let code = part;
          if (firstNewLine !== -1) {
            language = part.substring(0, firstNewLine).trim() || "code";
            code = part.substring(firstNewLine + 1);
          }
          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Process standard markdown line syntax
        const lines = part.split("\n");
        const listItems: React.ReactNode[] = [];
        let inList = false;
        const elements: React.ReactNode[] = [];

        const flushList = (key: string) => {
          if (listItems.length > 0) {
            elements.push(
              <ul key={`list-${key}`} className="list-disc pl-5 my-2 space-y-1.5 text-slate-300">
                {[...listItems]}
              </ul>
            );
            listItems.length = 0;
            inList = false;
          }
        };

        lines.forEach((line, lineIndex) => {
          const trimmed = line.trim();

          // Headers
          if (trimmed.startsWith("### ")) {
            flushList(`${index}-${lineIndex}`);
            elements.push(
              <h4 key={lineIndex} className="text-sm font-bold text-slate-200 mt-4 mb-1">
                {formatInlineText(trimmed.slice(4))}
              </h4>
            );
          } else if (trimmed.startsWith("## ")) {
            flushList(`${index}-${lineIndex}`);
            elements.push(
              <h3 key={lineIndex} className="text-base font-bold text-slate-100 mt-5 mb-1.5">
                {formatInlineText(trimmed.slice(3))}
              </h3>
            );
          } else if (trimmed.startsWith("# ")) {
            flushList(`${index}-${lineIndex}`);
            elements.push(
              <h2 key={lineIndex} className="text-lg font-bold text-slate-100 mt-6 mb-2">
                {formatInlineText(trimmed.slice(2))}
              </h2>
            );
          }
          // Bullet list items
          else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            inList = true;
            listItems.push(
              <li key={lineIndex} className="text-slate-300">
                {formatInlineText(trimmed.slice(2))}
              </li>
            );
          }
          // Numbered list items
          else if (/^\d+\.\s/.test(trimmed)) {
            inList = true;
            const contentStart = trimmed.indexOf(" ") + 1;
            listItems.push(
              <li key={lineIndex} className="list-decimal text-slate-300 ml-4">
                {formatInlineText(trimmed.slice(contentStart))}
              </li>
            );
          }
          // Empty/blank lines
          else if (trimmed === "") {
            flushList(`${index}-${lineIndex}`);
          }
          // Normal paragraph text
          else {
            if (inList) {
              flushList(`${index}-${lineIndex}`);
            }
            elements.push(
              <p key={lineIndex} className="my-2 text-slate-300">
                {formatInlineText(line)}
              </p>
            );
          }
        });

        // Flush any remaining list items at block termination
        flushList(`${index}-final`);

        return <React.Fragment key={index}>{elements}</React.Fragment>;
      })}
    </div>
  );
}
