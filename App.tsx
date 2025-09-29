
import React, { useState, useCallback, useEffect } from 'react';
import { ComparisonView } from './components/ComparisonView';
import { CostEstimator } from './components/CostEstimator';
import { refinePrompt, getPromptSuggestions } from './services/geminiService';
import type { RefinedPromptResponse, ModelConfig, InteractionHistoryItem } from './types';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
// import { ApiKeyInput } from './components/ApiKeyInput';
import { InputPanel } from './components/InputPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { PromptSuggestions } from './components/PromptSuggestions';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  // FIX: Remove apiKey state. API key should be handled via environment variables.
  // const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
  const [apiResponse, setApiResponse] = useState<RefinedPromptResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  });
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [history, setHistory] = useState<InteractionHistoryItem[]>(() => {
    try {
        const savedHistory = localStorage.getItem('prompt-refiner-history');
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        return [];
    }
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);


  const generateCaptcha = useCallback(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
  }, []);

  // FIX: Remove useEffect for apiKey as it's no longer in state.
  // useEffect(() => {
  //   localStorage.setItem('gemini-api-key', apiKey);
  // }, [apiKey]);
  
  useEffect(() => {
    localStorage.setItem('prompt-refiner-history', JSON.stringify(history));
  }, [history]);
  
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleRefinePrompt = useCallback(async () => {
    // FIX: Remove API key check from UI.
    // if (!apiKey.trim()) {
    //     setError('Please provide your Gemini API key before refining a prompt.');
    //     return;
    // }
    if (!userInput.trim()) {
      setError('Please enter a prompt idea first.');
      return;
    }
    if (parseInt(captchaAnswer, 10) !== captchaNum1 + captchaNum2) {
      setError('Incorrect CAPTCHA answer. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      // FIX: Remove apiKey from refinePrompt call.
      const result = await refinePrompt(userInput, modelConfig);
      setApiResponse(result);

      // Add to history
      const newHistoryItem: InteractionHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          originalPrompt: userInput,
          refinedPrompt: result.refinedPrompt,
          rationale: result.rationale,
          modelConfig: modelConfig,
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);

      generateCaptcha();
    } catch (e) {
      console.error(e);
      setError('An error occurred while refining the prompt. Please check the console and try again.');
    } finally {
      setIsLoading(false);
    }
  // FIX: Remove apiKey from dependency array.
  }, [userInput, modelConfig, captchaAnswer, captchaNum1, captchaNum2, generateCaptcha]);
  
  const handleClear = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your input and the refined prompt? This action cannot be undone.")) {
        setUserInput('');
        setApiResponse(null);
        setError(null);
        setSuggestions([]);
    }
  }, []);

  const handleLoadHistoryItem = useCallback((item: InteractionHistoryItem) => {
    setUserInput(item.originalPrompt);
    setApiResponse({
        refinedPrompt: item.refinedPrompt,
        rationale: item.rationale,
    });
    setModelConfig(item.modelConfig);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    if(window.confirm("Are you sure you want to clear all of your saved interactions? This action cannot be undone.")){
        setHistory([]);
    }
  }, []);

  const handleGetSuggestions = useCallback(async () => {
    if (!userInput.trim()) {
        setError('Please enter a prompt idea first to get suggestions.');
        return;
    }

    setIsSuggestionsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
        const result = await getPromptSuggestions(userInput);
        setSuggestions(result);
    } catch (e) {
        console.error(e);
        setError('An error occurred while fetching suggestions. Please check the console and try again.');
    } finally {
        setIsSuggestionsLoading(false);
    }
  }, [userInput]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
      setUserInput(suggestion);
      setSuggestions([]);
  }, []);

  // FIX: Remove isApiKeyMissing variable.
  // const isApiKeyMissing = !apiKey.trim();

  return (
    <div className="min-h-screen bg-brand-primary flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-2">
            <MagicWandIcon className="w-10 h-10 text-brand-accent"/>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-light tracking-tight">
              AI Prompt Refiner
            </h1>
          </div>
          <p className="text-lg text-brand-text max-w-2xl mx-auto">
            Transform your ideas into powerful, optimized prompts. Describe your goal, and let our AI craft the perfect prompt for you.
          </p>
        </header>

        {/* FIX: Remove ApiKeyInput component and associated warning message. */}
        {/* <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
          {isApiKeyMissing && (
             <p className="text-center text-yellow-400 text-sm mt-2 animate-fade-in">
                Please enter your API key above to enable prompt refinement.
             </p>
          )}
        </div> */}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <InputPanel
                userInput={userInput}
                setUserInput={setUserInput}
                onRefine={handleRefinePrompt}
                onClear={handleClear}
                isLoading={isLoading}
                config={modelConfig}
                setConfig={setModelConfig}
                captchaNum1={captchaNum1}
                captchaNum2={captchaNum2}
                captchaAnswer={captchaAnswer}
                setCaptchaAnswer={setCaptchaAnswer}
                onGetSuggestions={handleGetSuggestions}
                isSuggestionsLoading={isSuggestionsLoading}
            />
            {(isSuggestionsLoading || suggestions.length > 0) && (
              <PromptSuggestions
                suggestions={suggestions}
                isLoading={isSuggestionsLoading}
                onSelectSuggestion={handleSelectSuggestion}
              />
            )}
          </div>
          <div className="flex flex-col gap-8 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <HistoryPanel 
                history={history}
                onLoadItem={handleLoadHistoryItem}
                onClearHistory={handleClearHistory}
            />

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            {apiResponse && <ComparisonView userInput={userInput} response={apiResponse} />}
            {(userInput || apiResponse) && (
              <div className="animate-fade-in">
                <CostEstimator 
                  inputPrompt={userInput} 
                  outputPrompt={apiResponse?.refinedPrompt || ''}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
