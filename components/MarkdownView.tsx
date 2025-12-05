import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartRenderer } from './ChartRenderer';
import { ChartData } from '../types';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            const language = match ? match[1] : '';

            if (isInline) {
              return (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-pink-300" {...props}>
                  {children}
                </code>
              );
            }

            if (language === 'json-chart') {
              try {
                const jsonContent = String(children).replace(/\n$/, '');
                const chartData: ChartData = JSON.parse(jsonContent);
                return <ChartRenderer data={chartData} />;
              } catch (e) {
                return (
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-200 text-sm">
                    Error rendering chart: Invalid JSON data.
                  </div>
                );
              }
            }

            return (
              <div className="relative group rounded-lg overflow-hidden my-4 border border-gray-700 bg-gray-950">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                  <span className="text-xs text-gray-400 uppercase font-mono">{language || 'text'}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(String(children))}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // Override other elements for Tailwind styling
          p: ({ children }) => <p className="mb-4 leading-7 text-gray-300 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 text-white mt-8">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold mb-3 text-white mt-6">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 border border-gray-700 rounded-lg">
              <table className="min-w-full divide-y divide-gray-700 text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-gray-700 bg-gray-900/50">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="px-4 py-3 whitespace-nowrap text-gray-300">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};