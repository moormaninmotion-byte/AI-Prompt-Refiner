
import React, { useState, useCallback } from 'react';
import type { RefinedPromptResponse } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CompareIcon } from './icons/CompareIcon';
import { diffWords, DiffPart } from '../utils/diff';

interface ComparisonViewProps {
  userInput: string;
  response: RefinedPromptResponse;
}

const DiffRenderer: React.FC<{ parts: DiffPart[], type: 'original' | 'refined' }> = ({ parts, type }) => {
  const renderableParts = type === 'original'
    ? parts.filter(p => !p.added)
    : parts.filter(p => !p.removed);

  return (
    <>
      {renderableParts.map((part, index) => (
        <span
          key={index}
          className={
            part.removed ? 'bg-red-500/20 rounded-sm' : 
            part.added ? 'bg-green-500/20 rounded-sm' : ''
          }
        >
          {part.value}
        </span>
      ))}
    </>
  );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ userInput, response }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (response.refinedPrompt) {
      navigator.clipboard.writeText(response.refinedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [response.refinedPrompt]);

  const hasRefinedPrompt = response.refinedPrompt && response.refinedPrompt.trim() !== '';

  if (!hasRefinedPrompt) {
    return (
      <div className="bg-brand-secondary p-4 rounded-md shadow-lg">
        <h2 className="text-2xl font-semibold text-brand-light mb-3">Clarification Needed</h2>
        <p className="text-brand-text bg-brand-primary p-3 rounded-md">{response.rationale}</p>
      </div>
    );
  }
  
  const diffResult = diffWords(userInput, response.refinedPrompt);

  return (
    <div className="bg-brand-secondary p-4 rounded-md shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <CompareIcon className="w-6 h-6 text-brand-accent" />
        <h2 className="text-2xl font-semibold text-brand-light">Prompt Comparison (Diff View)</h2>
      </div>
       <p className="text-sm text-gray-400 mb-3">
        Changes are highlighted: <span className="bg-red-500/20 px-1 rounded-sm mx-1">removed</span> and <span className="bg-green-500/20 px-1 rounded-sm mx-1">added</span>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Original Prompt */}
        <div>
          <h3 className="text-lg font-semibold text-brand-light mb-2">Your Original Prompt</h3>
          <div className="bg-brand-primary p-3 rounded-md text-brand-text whitespace-pre-wrap font-mono text-sm h-full">
            <DiffRenderer parts={diffResult} type="original" />
          </div>
        </div>

        {/* Refined Prompt */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-brand-light">AI-Refined Prompt</h3>
                 <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary hover:bg-gray-700 text-sm font-medium rounded-md text-brand-text transition-colors duration-200"
                    title="Copy to clipboard"
                    >
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="bg-brand-accent/10 p-3 rounded-md text-brand-text whitespace-pre-wrap font-mono text-sm border-2 border-brand-accent h-full shadow-lg shadow-brand-accent/10">
                <DiffRenderer parts={diffResult} type="refined" />
            </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-brand-light mb-2">Rationale</h3>
        <p className="text-brand-text bg-brand-primary p-3 rounded-md">{response.rationale}</p>
      </div>

    </div>
  );
};
