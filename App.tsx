import React, { useState, useCallback, useEffect } from 'react';
import { Container, Grid, Typography, Box, Alert, Grow, Stack, Fade } from '@mui/material';
import { AutoAwesome as MagicWandIcon } from '@mui/icons-material';

import { ComparisonView } from './components/ComparisonView';
import { CostEstimator } from './components/CostEstimator';
import { InputPanel } from './components/InputPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { PromptSuggestions } from './components/PromptSuggestions';
import { PromptDemonstration } from './components/PromptDemonstration';

import { refinePrompt, getPromptSuggestions, generateDemonstration } from './services/geminiService';
import type { RefinedPromptResponse, ModelConfig, InteractionHistoryItem } from './types';

/**
 * The main component for the AI Prompt Refiner application.
 * It manages the application's state, handles user interactions, and orchestrates
 * the communication between various child components and the Gemini API service.
 */
const App: React.FC = () => {
  // State for the user's initial prompt idea.
  const [userInput, setUserInput] = useState<string>('');
  // State for the response from the Gemini API (refined prompt and rationale).
  const [apiResponse, setApiResponse] = useState<RefinedPromptResponse | null>(null);
  // State to track when the main 'refine' API call is in progress.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State for storing and displaying any errors that occur.
  const [error, setError] = useState<string | null>(null);
  // State for the configuration of the generative model (e.g., temperature).
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  });
  // State for the simple CAPTCHA numbers and user's answer.
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  // State for the history of user interactions, loaded from and persisted to localStorage.
  const [history, setHistory] = useState<InteractionHistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('prompt-refiner-history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      return [];
    }
  });
  // State for the list of prompt suggestions from the API.
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // State to track when the suggestions API call is in progress.
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  // State for the demonstration outputs of both original and refined prompts.
  const [demonstration, setDemonstration] = useState<{ original: string | null; refined: string | null; originalError?: string; refinedError?: string; } | null>(null);
  // State to track when the demonstration generation is in progress.
  const [isDemonstrationLoading, setIsDemonstrationLoading] = useState<boolean>(false);
  // State to hold the ID of the current interaction, used for associating feedback.
  const [currentInteractionId, setCurrentInteractionId] = useState<string | null>(null);
  // State for user feedback (up/down votes) on refinements, persisted to localStorage.
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>(() => {
    try {
      const savedFeedback = localStorage.getItem('prompt-refiner-feedback');
      return savedFeedback ? JSON.parse(savedFeedback) : {};
    } catch (e) {
      console.error("Failed to parse feedback from localStorage", e);
      return {};
    }
  });

  /**
   * Generates new random numbers for the CAPTCHA check.
   */
  const generateCaptcha = useCallback(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
  }, []);

  // Effect to persist history to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem('prompt-refiner-history', JSON.stringify(history));
  }, [history]);

  // Effect to persist feedback to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem('prompt-refiner-feedback', JSON.stringify(feedback));
  }, [feedback]);
  
  // Effect to generate a new CAPTCHA on initial component mount.
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  /**
   * Handles the primary action of refining a user's prompt.
   * It validates input, calls the Gemini service, and updates the state with the response.
   */
  const handleRefinePrompt = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter a prompt idea first.');
      return;
    }
    if (parseInt(captchaAnswer, 10) !== captchaNum1 + captchaNum2) {
      setError('Incorrect CAPTCHA answer. Please try again.');
      generateCaptcha();
      return;
    }

    // Reset states for the new request
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setDemonstration(null);
    setIsDemonstrationLoading(false);

    try {
      const result = await refinePrompt(userInput, modelConfig);
      setApiResponse(result);

      const interactionId = Date.now().toString();
      setCurrentInteractionId(interactionId);
      generateCaptcha(); // Generate a new captcha for the next interaction
      
      // If the API returned a refined prompt, generate demonstrations for comparison.
      if (result.refinedPrompt) {
          setIsDemonstrationLoading(true);
          // Run demonstration generations in parallel for efficiency.
          const [originalDemo, refinedDemo] = await Promise.allSettled([
              generateDemonstration(userInput),
              generateDemonstration(result.refinedPrompt)
          ]);

          const demonstrationResult = {
              original: originalDemo.status === 'fulfilled' ? originalDemo.value : null,
              originalError: originalDemo.status === 'rejected' ? 'Failed to generate response.' : undefined,
              refined: refinedDemo.status === 'fulfilled' ? refinedDemo.value : null,
              refinedError: refinedDemo.status === 'rejected' ? 'Failed to generate response.' : undefined,
          };
          setDemonstration(demonstrationResult);

          // Create the history item now that we have all data.
          const newHistoryItem: InteractionHistoryItem = {
              id: interactionId,
              timestamp: new Date().toISOString(),
              originalPrompt: userInput,
              refinedPrompt: result.refinedPrompt,
              rationale: result.rationale,
              modelConfig: modelConfig,
              demonstrationOutputs: demonstrationResult,
          };
          setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      } else {
          // If no refined prompt was returned (e.g., a clarification question), save to history without demonstration.
          const newHistoryItem: InteractionHistoryItem = {
              id: interactionId,
              timestamp: new Date().toISOString(),
              originalPrompt: userInput,
              refinedPrompt: result.refinedPrompt,
              rationale: result.rationale,
              modelConfig: modelConfig,
          };
          setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      }
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`An error occurred while refining the prompt: ${message}`);
    } finally {
      setIsLoading(false);
      setIsDemonstrationLoading(false);
    }
  }, [userInput, modelConfig, captchaAnswer, captchaNum1, captchaNum2, generateCaptcha]);
  
  /**
   * Clears the user input and all response-related state.
   */
  const handleClear = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your input and the refined prompt? This action cannot be undone.")) {
        setUserInput('');
        setApiResponse(null);
        setError(null);
        setSuggestions([]);
        setDemonstration(null);
        setCurrentInteractionId(null);
    }
  }, []);

  /**
   * Loads a previous interaction from the history into the main view.
   */
  const handleLoadHistoryItem = useCallback((item: InteractionHistoryItem) => {
    setUserInput(item.originalPrompt);
    setApiResponse({
        refinedPrompt: item.refinedPrompt,
        rationale: item.rationale,
    });
    setModelConfig(item.modelConfig);
    setDemonstration(item.demonstrationOutputs || null);
    setCurrentInteractionId(item.id);
    setError(null);
  }, []);

  /**
   * Clears the entire interaction history and associated feedback.
   */
  const handleClearHistory = useCallback(() => {
    if(window.confirm("Are you sure you want to clear all of your saved interactions? This action cannot be undone.")){
        setHistory([]);
        setFeedback({}); // Also clear feedback
    }
  }, []);

  /**
   * Fetches prompt suggestions from the AI based on the current user input.
   */
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
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`An error occurred while fetching suggestions: ${message}`);
    } finally {
        setIsSuggestionsLoading(false);
    }
  }, [userInput]);

  /**
   * Sets the user input to a selected suggestion and clears the suggestions list.
   */
  const handleSelectSuggestion = useCallback((suggestion: string) => {
      setUserInput(suggestion);
      setSuggestions([]);
  }, []);
  
  /**
   * Handles user feedback for a specific interaction, allowing toggling.
   */
  const handleFeedback = useCallback((interactionId: string, rating: 'up' | 'down') => {
      setFeedback(prev => ({
          ...prev,
          [interactionId]: prev[interactionId] === rating ? null : rating, // Toggle on/off
      }));
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4, md: 6 } }}>
      <Stack spacing={4}>
        <header>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
            <MagicWandIcon color="primary" sx={{ fontSize: { xs: '2.5rem', sm: '3rem' } }}/>
            <Typography variant="h2" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem' } }}>
              AI Prompt Refiner
            </Typography>
          </Box>
          <Typography variant="h6" component="p" color="text.secondary" textAlign="center" sx={{ maxWidth: 'md', mx: 'auto' }}>
            Transform your ideas into powerful, optimized prompts. Describe your goal, and let our AI craft the perfect prompt for you.
          </Typography>
        </header>

        <main>
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} lg={6}>
              <Stack spacing={4}>
                <InputPanel
                    userInput={userInput}
                    setUserInput={setUserInput}
                    onRefine={handleRefinePrompt}
                    onClear={handleClear}
                    isLoading={isLoading || isDemonstrationLoading}
                    config={modelConfig}
                    setConfig={setModelConfig}
                    captchaNum1={captchaNum1}
                    captchaNum2={captchaNum2}
                    captchaAnswer={captchaAnswer}
                    setCaptchaAnswer={setCaptchaAnswer}
                    onGetSuggestions={handleGetSuggestions}
                    isSuggestionsLoading={isSuggestionsLoading}
                />
                 <Fade in={isSuggestionsLoading || suggestions.length > 0}>
                   <div>
                      <PromptSuggestions
                        suggestions={suggestions}
                        isLoading={isSuggestionsLoading}
                        onSelectSuggestion={handleSelectSuggestion}
                      />
                   </div>
                 </Fade>
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} lg={6}>
              <Stack spacing={4}>
                <HistoryPanel 
                    history={history}
                    onLoadItem={handleLoadHistoryItem}
                    onClearHistory={handleClearHistory}
                    feedback={feedback}
                />

                {error && (
                  <Grow in={!!error}>
                    <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
                  </Grow>
                )}
                
                {apiResponse && (
                  <Grow in={!!apiResponse}>
                     <div><ComparisonView userInput={userInput} response={apiResponse} /></div>
                  </Grow>
                )}
                
                {(isDemonstrationLoading || demonstration) && apiResponse && currentInteractionId && (
                  <Grow in={isDemonstrationLoading || !!demonstration}>
                    <div>
                      <PromptDemonstration
                          isLoading={isDemonstrationLoading}
                          originalPrompt={userInput}
                          refinedPrompt={apiResponse.refinedPrompt}
                          demonstration={demonstration}
                          interactionId={currentInteractionId}
                          feedback={feedback[currentInteractionId]}
                          onFeedback={handleFeedback}
                      />
                    </div>
                  </Grow>
                )}

                {(userInput || apiResponse) && (
                  <Grow in={!!(userInput || apiResponse)}>
                    <div>
                      <CostEstimator 
                        inputPrompt={userInput} 
                        outputPrompt={apiResponse?.refinedPrompt || ''}
                      />
                    </div>
                  </Grow>
                )}
              </Stack>
            </Grid>
          </Grid>
        </main>
      </Stack>
    </Container>
  );
};

export default App;
