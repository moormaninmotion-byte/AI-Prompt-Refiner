import React, { useState, useCallback } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, Tooltip, Fade } from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon, CompareArrows as CompareIcon } from '@mui/icons-material';
import type { RefinedPromptResponse } from '../types';
import { diffWords, DiffPart } from '../utils/diff';

interface ComparisonViewProps {
  userInput: string;
  response: RefinedPromptResponse;
}

/**
 * Renders a differentiated text view, highlighting added and removed words.
 * @param {object} props - The component props.
 * @param {DiffPart[]} props.parts - The array of diff parts from the diffing utility.
 * @param {'original' | 'refined'} props.type - The type of view to render (either 'original' or 'refined').
 * @returns {React.ReactElement} The rendered diff view.
 */
const DiffRenderer: React.FC<{ parts: DiffPart[], type: 'original' | 'refined' }> = ({ parts, type }) => {
  // Filter parts based on whether we are rendering the original or refined text
  const renderableParts = type === 'original'
    ? parts.filter(p => !p.added)
    : parts.filter(p => !p.removed);

  return (
    <Typography component="div" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
      {renderableParts.map((part, index) => (
        <Box
          component="span"
          key={index}
          sx={{
            backgroundColor: part.removed ? 'rgba(255, 0, 0, 0.2)' : 
                             part.added ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
            borderRadius: 1,
            paddingX: '2px',
          }}
        >
          {part.value}
        </Box>
      ))}
    </Typography>
  );
};

/**
 * A component to display a side-by-side comparison of the user's original prompt
 * and the AI-refined prompt, along with the AI's rationale for the changes.
 * @param {ComparisonViewProps} props The component props.
 * @returns {React.ReactElement} The rendered comparison view.
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({ userInput, response }) => {
  const [copied, setCopied] = useState(false);

  /**
   * Handles copying the refined prompt text to the clipboard.
   */
  const handleCopy = useCallback(() => {
    if (response.refinedPrompt) {
      navigator.clipboard.writeText(response.refinedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [response.refinedPrompt]);

  const hasRefinedPrompt = response.refinedPrompt && response.refinedPrompt.trim() !== '';

  // If the AI needs clarification, show the rationale instead of the comparison.
  if (!hasRefinedPrompt) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Clarification Needed
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1">{response.rationale}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate the difference between the original and refined prompts.
  const diffResult = diffWords(userInput, response.refinedPrompt);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <CompareIcon color="primary" />
          <Typography variant="h5" component="h2">Prompt Comparison (Diff View)</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Changes are highlighted: <Box component="span" sx={{ bgcolor: 'rgba(255, 0, 0, 0.2)', px: 0.5, borderRadius: 1 }}>removed</Box> and <Box component="span" sx={{ bgcolor: 'rgba(0, 255, 0, 0.2)', px: 0.5, borderRadius: 1 }}>added</Box>.
        </Typography>

        <Grid container spacing={2}>
          {/* Original Prompt */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Your Original Prompt</Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
              <DiffRenderer parts={diffResult} type="original" />
            </Box>
          </Grid>

          {/* Refined Prompt */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">AI-Refined Prompt</Typography>
              <Tooltip title="Copy to clipboard" placement="top">
                <Button
                  onClick={handleCopy}
                  size="small"
                  variant="outlined"
                  startIcon={copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </Tooltip>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(88, 101, 242, 0.1)', borderRadius: 1, border: 1, borderColor: 'primary.main', height: '100%' }}>
              <DiffRenderer parts={diffResult} type="refined" />
            </Box>
          </Grid>
        </Grid>
      
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Rationale
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1">{response.rationale}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
