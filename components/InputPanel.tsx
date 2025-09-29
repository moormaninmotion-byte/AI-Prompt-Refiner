
import React, { useState, useEffect } from 'react';
import type { ModelConfig } from '../types';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { InfoIcon } from './icons/InfoIcon';
import { Tooltip } from './Tooltip';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface InputPanelProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onRefine: () => void;
  onClear: () => void;
  isLoading: boolean;
  config: ModelConfig;
  setConfig: (config: ModelConfig) => void;
  captchaNum1: number;
  captchaNum2: number;
  captchaAnswer: string;
  setCaptchaAnswer: (value: string) => void;
  onGetSuggestions: () => void;
  isSuggestionsLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  userInput,
  setUserInput,
  onRefine,
  onClear,
  isLoading,
  config,
  setConfig,
  captchaNum1,
  captchaNum2,
  captchaAnswer,
  setCaptchaAnswer,
  onGetSuggestions,
  isSuggestionsLoading,
}) => {
  const [topKValue, setTopKValue] = useState(config.topK.toString());
  const [topKError, setTopKError] = useState<string | null>(null);

  useEffect(() => {
    setTopKValue(config.topK.toString());
    setTopKError(null);
  }, [config.topK]);

  const handleConfigChange = (param: keyof ModelConfig, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      let validatedValue = numValue;
      if (param === 'temperature' || param === 'topP') {
        validatedValue = Math.max(0, Math.min(1, numValue));
      }
      setConfig({ ...config, [param]: validatedValue });
    }
  };
  
  const handleTopKChange = (value: string) => {
    setTopKValue(value);

    if (value.trim() === '') {
        setConfig({ ...config, topK: 0 });
        setTopKError(null);
        return;
    }

    if (!/^-?\d+$/.test(value)) {
        setTopKError("Must be an integer.");
        return;
    }

    const intValue = parseInt(value, 10);

    if (intValue < 0) {
        setTopKError("Must be non-negative.");
        return;
    }
    
    setTopKError(null);
    setConfig({ ...config, topK: intValue });
  }

  const isCaptchaCorrect = parseInt(captchaAnswer, 10) === captchaNum1 + captchaNum2;
  const isRefineDisabled = isLoading || !userInput.trim() || !isCaptchaCorrect || !!topKError;
  const isGetSuggestionsDisabled = isLoading || isSuggestionsLoading || !userInput.trim();

  return (
    <div className="bg-brand-secondary p-4 rounded-md shadow-lg flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left side: Text Input */}
        <div className="flex-grow flex flex-col">
           <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-semibold text-brand-accent">1.</span>
            <h2 className="text-xl font-semibold text-brand-light">Your Idea</h2>
          </div>
          <p className="text-sm text-brand-text mb-3">
            Enter a concept, a question, or a challenge.
          </p>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., 'An image of a wise old owl reading a book in a library' or 'Explain quantum computing to a 5-year-old'"
            className="w-full bg-brand-primary border border-gray-600 rounded-md p-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200 resize-y disabled:opacity-50 disabled:cursor-not-allowed flex-grow min-h-[250px] md:min-h-0"
            disabled={isLoading || isSuggestionsLoading}
          />
        </div>

        {/* Right side: Parameters & Captcha */}
        <div className="md:w-72 flex-shrink-0 flex flex-col">
          {/* Heading - aligned with left side */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-semibold text-brand-accent">2.</span>
            <h2 className="text-xl font-semibold text-brand-light">Adjust Parameters</h2>
          </div>
          
          {/* Spacer to push content to the bottom */}
          <div className="flex-grow" />
          
          {/* Bottom-aligned content group */}
          <div className="flex flex-col gap-4">
              {/* Parameters Section */}
              <div className="space-y-3 bg-brand-primary/50 p-3 rounded-md">
                {/* Temperature */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor="temperature" className="block text-sm font-medium text-brand-text">Temperature</label>
                      <Tooltip text="Controls randomness. Higher values (e.g., 0.8) make the output more creative, while lower values (e.g., 0.2) make it more deterministic.">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </div>
                    <span className="text-sm font-mono text-brand-accent bg-brand-primary px-2 py-0.5 rounded">{config.temperature.toFixed(2)}</span>
                  </div>
                  <input id="temperature" type="range" min="0" max="1" step="0.01" value={config.temperature} onChange={(e) => handleConfigChange('temperature', e.target.value)} disabled={isLoading} className="w-full h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer accent-brand-accent disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                {/* Top-P */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor="topP" className="block text-sm font-medium text-brand-text">Top-P</label>
                      <Tooltip text="Considers tokens based on their cumulative probability mass. A higher value (e.g., 0.95) allows for more diversity in the output.">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </div>
                    <span className="text-sm font-mono text-brand-accent bg-brand-primary px-2 py-0.5 rounded">{config.topP.toFixed(2)}</span>
                  </div>
                  <input id="topP" type="range" min="0" max="1" step="0.01" value={config.topP} onChange={(e) => handleConfigChange('topP', e.target.value)} disabled={isLoading} className="w-full h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer accent-brand-accent disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                {/* Top-K */}
                <div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label htmlFor="topK" className="block text-sm font-medium text-brand-text">Top-K</label>
                      <Tooltip text="Considers only the top K most likely tokens at each step. A lower value restricts the model's choices, making it less random.">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </div>
                    <input
                      id="topK"
                      type="number"
                      value={topKValue}
                      onChange={(e) => handleTopKChange(e.target.value)}
                      disabled={isLoading}
                      className={`w-24 text-center bg-brand-primary border rounded-md p-1 text-brand-text focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                        topKError
                          ? 'border-red-500 ring-1 ring-red-500'
                          : 'border-gray-600 focus:ring-2 focus:ring-brand-accent'
                      }`}
                    />
                  </div>
                  {topKError && <p className="text-xs text-red-400 mt-1 text-right">{topKError}</p>}
                </div>
              </div>
            {/* Security Check Section */}
            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-brand-text mb-2">
                  Security Check: What is {captchaNum1} + {captchaNum2}?
              </label>
              <input
                  id="captcha"
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Your answer"
                  className="w-full bg-brand-primary border border-gray-600 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Part: Action buttons */}
      <div className="pt-3 border-t border-gray-700">
        <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-semibold text-brand-accent">3.</span>
            <h2 className="text-xl font-semibold text-brand-light">Act</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button onClick={onRefine} disabled={isRefineDisabled} className="lg:col-span-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-accent hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-200">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Refining...
              </>
            ) : (
              <>
                <MagicWandIcon className="w-5 h-5 mr-2"/>
                Refine Prompt
              </>
            )}
          </button>
           <button onClick={onGetSuggestions} disabled={isGetSuggestionsDisabled} className="lg:col-span-1 inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-brand-text hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-brand-secondary transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSuggestionsLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Getting Ideas...
              </>
            ) : (
              <>
                <LightbulbIcon className="w-5 h-5 mr-2"/>
                Suggest Ideas
              </>
            )}
          </button>
          <button onClick={onClear} disabled={isLoading || isSuggestionsLoading} className="sm:col-span-2 lg:col-span-1 px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-brand-text hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-brand-secondary transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
