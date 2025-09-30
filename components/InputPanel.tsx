import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  AutoAwesome as MagicWandIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import type { ModelConfig } from '../types';

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

/**
 * The main input panel for the application, allowing users to enter their prompt idea,
 * adjust model parameters, and initiate actions like refining or getting suggestions.
 * @param {InputPanelProps} props The component props.
 * @returns {React.ReactElement} The rendered input panel.
 */
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

  // Effect to sync the local topKValue with the global config.
  useEffect(() => {
    setTopKValue(config.topK.toString());
    setTopKError(null);
  }, [config.topK]);

  /**
   * Handles changes to slider-based model parameters (temperature, topP).
   * @param {keyof ModelConfig} param The parameter to change.
   * @param {number} value The new value from the slider.
   */
  const handleSliderChange = (param: 'temperature' | 'topP', value: number) => {
    setConfig({ ...config, [param]: value });
  };
  
  /**
   * Handles changes to the Top-K input field, including validation.
   * @param {string} value The new string value from the input field.
   */
  const handleTopKChange = (value: string) => {
    setTopKValue(value);

    if (value.trim() === '') {
        setConfig({ ...config, topK: 0 }); // Allow empty to be treated as 0 or default
        setTopKError(null);
        return;
    }

    // Validate that input is an integer
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

  // Determine if the refine button should be disabled based on multiple conditions.
  const isCaptchaCorrect = parseInt(captchaAnswer, 10) === captchaNum1 + captchaNum2;
  const isRefineDisabled = isLoading || !userInput.trim() || !isCaptchaCorrect || !!topKError;
  const isGetSuggestionsDisabled = isLoading || isSuggestionsLoading || !userInput.trim();

  return (
    <Card>
      <CardContent>
        <Grid container spacing={4}>
          {/* Left side: Text Input */}
          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={1} height="100%">
              <Typography variant="h5" component="h2" gutterBottom>
                <Box component="span" color="primary.main" fontWeight="bold">1.</Box> Your Idea
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter a concept, a question, or a challenge for the AI to refine.
              </Typography>
              <TextField
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., 'An image of a wise old owl reading a book in a library' or 'Explain quantum computing to a 5-year-old'"
                multiline
                rows={15}
                fullWidth
                disabled={isLoading || isSuggestionsLoading}
                sx={{ flexGrow: 1 }}
              />
            </Stack>
          </Grid>

          {/* Right side: Parameters & Captcha */}
          <Grid item xs={12} md={5} lg={4}>
            <Stack spacing={3}>
              <Typography variant="h5" component="h2">
                <Box component="span" color="primary.main" fontWeight="bold">2.</Box> Adjust & Verify
              </Typography>

              {/* Parameters Section */}
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Stack spacing={2}>
                  <ParameterSlider
                    label="Temperature"
                    tooltip="Controls randomness. Higher is more creative, lower is more focused."
                    value={config.temperature}
                    onChange={(v) => handleSliderChange('temperature', v)}
                    min={0} max={1} step={0.01}
                    disabled={isLoading}
                  />
                  <ParameterSlider
                    label="Top-P"
                    tooltip="Nucleus sampling. Considers the most probable tokens. 0.95 is a common value."
                    value={config.topP}
                    onChange={(v) => handleSliderChange('topP', v)}
                    min={0} max={1} step={0.01}
                    disabled={isLoading}
                  />
                  <div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <LabelWithTooltip label="Top-K" tooltip="Limits the model to the K most likely next tokens. 40 is common." />
                      <TextField
                        type="number"
                        value={topKValue}
                        onChange={(e) => handleTopKChange(e.target.value)}
                        disabled={isLoading}
                        error={!!topKError}
                        helperText={topKError}
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                      />
                    </Box>
                  </div>
                </Stack>
              </Box>
              
              {/* Security Check Section */}
              <TextField
                label={`Security Check: What is ${captchaNum1} + ${captchaNum2}?`}
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Your answer"
                fullWidth
                disabled={isLoading}
              />
            </Stack>
          </Grid>
        </Grid>
      
        {/* Bottom Part: Action buttons */}
        <Box sx={{ pt: 3, mt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h2" gutterBottom>
             <Box component="span" color="primary.main" fontWeight="bold">3.</Box> Act
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                onClick={onRefine}
                disabled={isRefineDisabled}
                variant="contained"
                size="large"
                fullWidth
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <MagicWandIcon />}
              >
                {isLoading ? 'Refining...' : 'Refine Prompt'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                onClick={onGetSuggestions}
                disabled={isGetSuggestionsDisabled}
                variant="outlined"
                size="large"
                fullWidth
                startIcon={isSuggestionsLoading ? <CircularProgress size={20} color="inherit" /> : <LightbulbIcon />}
              >
                {isSuggestionsLoading ? 'Getting Ideas...' : 'Suggest Ideas'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
               <Button
                onClick={onClear}
                disabled={isLoading || isSuggestionsLoading}
                variant="outlined"
                color="secondary"
                size="large"
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};


/**
 * A helper component to render a label with an info tooltip.
 */
const LabelWithTooltip: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography variant="body2">{label}</Typography>
    <Tooltip title={tooltip} placement="top" arrow>
      <InfoIcon sx={{ fontSize: '1rem', color: 'text.secondary', cursor: 'pointer' }} />
    </Tooltip>
  </Box>
);

/**
 * A helper component for a parameter slider with a label, tooltip, and value display.
 */
const ParameterSlider: React.FC<{
  label: string;
  tooltip: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
}> = ({ label, tooltip, value, onChange, min, max, step, disabled }) => (
  <div>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <LabelWithTooltip label={label} tooltip={tooltip} />
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{value.toFixed(2)}</Typography>
    </Box>
    <Slider
      value={value}
      onChange={(_, newValue) => onChange(newValue as number)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      size="small"
    />
  </div>
);
