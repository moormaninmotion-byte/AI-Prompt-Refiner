import React from 'react';
// Fix: Import Stack component from @mui/material
import { Box, Card, CardContent, Grid, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { AutoAwesome as SparklesIcon, ThumbUp as ThumbsUpIcon, ThumbDown as ThumbsDownIcon } from '@mui/icons-material';

interface PromptDemonstrationProps {
  isLoading: boolean;
  originalPrompt: string;
  refinedPrompt: string;
  demonstration: {
    original: string | null;
    refined: string | null;
    originalError?: string;
    refinedError?: string;
  } | null;
  interactionId: string;
  feedback: 'up' | 'down' | null;
  onFeedback: (interactionId: string, rating: 'up' | 'down') => void;
}

/**
 * A reusable component to display a prompt and its corresponding generated output.
 * It handles loading states, errors, and displays the content in a structured format.
 * @param {object} props - The component props.
 * @returns {React.ReactElement} The rendered output display.
 */
const OutputDisplay: React.FC<{
  prompt: string;
  output: string | null;
  error?: string;
  isLoading: boolean;
  title: string;
  isRefined?: boolean;
}> = ({ prompt, output, error, isLoading, title, isRefined = false }) => {
  return (
    <Stack spacing={1} height="100%">
      <Typography variant="h6">{title}</Typography>
      <Box 
        sx={{ 
          p: 1.5, 
          bgcolor: isRefined ? 'primary.main' : 'background.default',
          color: isRefined ? 'primary.contrastText' : 'text.secondary',
          borderRadius: 1, 
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        {prompt}
      </Box>
      <Card
        variant="outlined"
        sx={{ 
            p: 2, 
            flexGrow: 1, 
            minHeight: 150, 
            bgcolor: isRefined ? 'rgba(88, 101, 242, 0.05)' : 'background.default',
            borderColor: isRefined ? 'primary.main' : 'divider'
        }}
      >
        {isLoading ? (
          <Stack spacing={1}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="75%" />
          </Stack>
        ) : error ? (
            <Typography color="error">{error}</Typography>
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {output || 'No response generated.'}
          </Typography>
        )}
      </Card>
    </Stack>
  );
};

/**
 * A component that demonstrates the difference in output between the original and refined prompts.
 * It also provides controls for users to give feedback on the quality of the refinement.
 * @param {PromptDemonstrationProps} props The component props.
 * @returns {React.ReactElement} The rendered demonstration view.
 */
export const PromptDemonstration: React.FC<PromptDemonstrationProps> = ({
  isLoading,
  originalPrompt,
  refinedPrompt,
  demonstration,
  interactionId,
  feedback,
  onFeedback
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <SparklesIcon color="primary" />
          <Typography variant="h5" component="h2">Prompt Demonstration</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Original Prompt Output */}
          <Grid item xs={12} md={6}>
            <OutputDisplay
              title="Original Prompt Output"
              prompt={originalPrompt}
              output={demonstration?.original || null}
              error={demonstration?.originalError}
              isLoading={isLoading}
            />
          </Grid>

          {/* Refined Prompt Output with Feedback */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Typography variant="h6">Refined Prompt Output</Typography>
                 <Box>
                    <Tooltip title="Good refinement">
                      <IconButton onClick={() => onFeedback(interactionId, 'up')} color={feedback === 'up' ? 'success' : 'default'}>
                        <ThumbsUpIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bad refinement">
                       <IconButton onClick={() => onFeedback(interactionId, 'down')} color={feedback === 'down' ? 'error' : 'default'}>
                        <ThumbsDownIcon />
                      </IconButton>
                    </Tooltip>
                 </Box>
              </Box>
              <Box 
                sx={{ 
                  p: 1.5, 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 1, 
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontStyle: 'italic',
                }}
              >
                  {refinedPrompt}
              </Box>
              <Card
                variant="outlined"
                sx={{ 
                    p: 2, 
                    flexGrow: 1, 
                    minHeight: 150, 
                    bgcolor: 'rgba(88, 101, 242, 0.05)',
                    borderColor: 'primary.main'
                }}
              >
                {isLoading ? (
                  <Stack spacing={1}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="75%" />
                  </Stack>
                ) : demonstration?.refinedError ? (
                  <Typography color="error">{demonstration.refinedError}</Typography>
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {demonstration?.refined || 'No response generated.'}
                  </Typography>
                )}
              </Card>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};