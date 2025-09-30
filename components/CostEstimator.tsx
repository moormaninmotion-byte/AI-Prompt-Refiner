import React, { useMemo } from 'react';
import { Box, Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import { MonetizationOn as TokenIcon } from '@mui/icons-material';
import { AI_SERVICES, TOKEN_CALC_FACTOR } from '../constants';

interface CostEstimatorProps {
  inputPrompt: string;
  outputPrompt: string;
}

/**
 * A component that estimates and displays the potential cost of a prompt interaction
 * across various Generative AI services based on token count.
 * @param {CostEstimatorProps} props The component props.
 * @returns {React.ReactElement | null} The rendered cost estimator or null if no prompts are provided.
 */
export const CostEstimator: React.FC<CostEstimatorProps> = ({ inputPrompt, outputPrompt }) => {
  /**
   * Calculates the estimated number of input and output tokens.
   * Note: This is a rough estimation where 1 token is approximately 4 characters.
   */
  const { inputTokens, outputTokens } = useMemo(() => {
    const calcTokens = (p: string) => p ? Math.ceil(p.length / TOKEN_CALC_FACTOR) : 0;
    return {
      inputTokens: calcTokens(inputPrompt),
      outputTokens: calcTokens(outputPrompt),
    };
  }, [inputPrompt, outputPrompt]);

  /**
   * Formats a number into a currency string, providing higher precision for very small costs.
   * @param {number} cost The cost to format.
   * @returns {string} The formatted cost string (e.g., "$0.000035").
   */
  const formatCost = (cost: number) => {
    if (cost < 0.0001 && cost > 0) {
      return `$${cost.toPrecision(2)}`;
    }
    return `$${cost.toFixed(6)}`;
  };
  
  // Do not render the component if there is no input or output prompt.
  if (!inputPrompt && !outputPrompt) return null;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <TokenIcon color="primary" />
          <Typography variant="h5" component="h2">Interaction Cost Analysis</Typography>
        </Box>
        
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
          <Grid container spacing={2} textAlign="center">
            <Grid item xs={6}>
              <Typography variant="body1" color="text.secondary">Input Tokens</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>{inputTokens}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" color="text.secondary">Output Tokens</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>{outputTokens}</Typography>
            </Grid>
          </Grid>
        </Box>
      
        <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mb: 1 }}>
          *Total cost is for one full interaction (Input + Output).
        </Typography>

        <List dense>
          {AI_SERVICES.map((service) => {
            const inputCost = (inputTokens / 1000) * service.inputCostPer1kTokens;
            const outputCost = (outputTokens / 1000) * service.outputCostPer1kTokens;
            const totalCost = inputCost + outputCost;

            return (
              <ListItem key={service.name} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, mb: 0.5 }}>
                <ListItemText primary={service.name} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#66bb6a' }}>
                  {formatCost(totalCost)}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};
