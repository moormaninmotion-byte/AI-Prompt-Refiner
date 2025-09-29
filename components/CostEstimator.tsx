
import React, { useMemo } from 'react';
import { AI_SERVICES, TOKEN_CALC_FACTOR } from '../constants';
import { TokenIcon } from './icons/TokenIcon';

interface CostEstimatorProps {
  inputPrompt: string;
  outputPrompt: string;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ inputPrompt, outputPrompt }) => {
  const { inputTokens, outputTokens } = useMemo(() => {
    const calcTokens = (p: string) => p ? Math.ceil(p.length / TOKEN_CALC_FACTOR) : 0;
    return {
      inputTokens: calcTokens(inputPrompt),
      outputTokens: calcTokens(outputPrompt),
    };
  }, [inputPrompt, outputPrompt]);

  const formatCost = (cost: number) => {
    if (cost < 0.0001 && cost > 0) {
        return `$${cost.toPrecision(2)}`;
    }
    return `$${cost.toFixed(6)}`;
  };
  
  if (!inputPrompt && !outputPrompt) return null;

  return (
    <div className="bg-brand-secondary p-4 rounded-md shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <TokenIcon className="w-6 h-6 text-brand-accent" />
        <h2 className="text-2xl font-semibold text-brand-light">Interaction Cost Analysis</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 bg-brand-primary p-3 rounded-md mb-3">
        <div className="text-center">
            <span className="font-medium text-brand-text">Input Tokens</span>
            <p className="text-2xl font-bold text-brand-accent">{inputTokens}</p>
        </div>
        <div className="text-center">
            <span className="font-medium text-brand-text">Output Tokens</span>
            <p className="text-2xl font-bold text-brand-accent">{outputTokens}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-3 text-center">
        *Total cost is for one full interaction (Input + Output).
      </p>
      <div className="space-y-2">
        {AI_SERVICES.map((service) => {
          const inputCost = (inputTokens / 1000) * service.inputCostPer1kTokens;
          const outputCost = (outputTokens / 1000) * service.outputCostPer1kTokens;
          const totalCost = inputCost + outputCost;

          return (
            <div key={service.name} className="flex justify-between items-center p-2 bg-brand-primary/50 rounded-md">
              <span className="text-sm text-brand-text">{service.name}</span>
              <span className="text-sm font-mono text-green-400">{formatCost(totalCost)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
