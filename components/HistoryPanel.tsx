import React from 'react';
import { Box, Button, Card, CardContent, List, ListItemButton, ListItemText, Typography, Tooltip } from '@mui/material';
import { History as HistoryIcon, Delete as TrashIcon, ThumbUp as ThumbsUpIcon, ThumbDown as ThumbsDownIcon } from '@mui/icons-material';
import type { InteractionHistoryItem } from '../types';

interface HistoryPanelProps {
  history: InteractionHistoryItem[];
  onLoadItem: (item: InteractionHistoryItem) => void;
  onClearHistory: () => void;
  feedback: Record<string, 'up' | 'down' | null>;
}

/**
 * A component to display the list of past prompt refinement interactions.
 * It allows users to view, load, and clear their history.
 * @param {HistoryPanelProps} props The component props.
 * @returns {React.ReactElement | null} The rendered history panel or null if history is empty.
 */
export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoadItem, onClearHistory, feedback }) => {
    // Do not render the panel if there's no history to show.
    if (history.length === 0) {
        return null;
    }

    /**
     * Formats an ISO date string into a more readable local date and time format.
     * @param {string} isoString The ISO string to format.
     * @returns {string} The formatted date-time string.
     */
    const formatTimestamp = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h5" component="h2">History</Typography>
                    </Box>
                    <Tooltip title="Clear all history" placement="top">
                        <Button
                            onClick={onClearHistory}
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<TrashIcon />}
                        >
                            Clear
                        </Button>
                    </Tooltip>
                </Box>
                <Box sx={{ maxHeight: 240, overflowY: 'auto', pr: 1 }}>
                    <List disablePadding>
                        {history.map((item) => {
                            const itemFeedback = feedback[item.id];
                            return (
                                <ListItemButton
                                    key={item.id}
                                    onClick={() => onLoadItem(item)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 1,
                                        flexDirection: 'column',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <ListItemText
                                        primary={item.originalPrompt}
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            sx: { fontWeight: 'medium' }
                                        }}
                                        sx={{ width: '100%', mb: 0 }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTimestamp(item.timestamp)}
                                        </Typography>
                                        {/* Display feedback icon if feedback has been given for this item */}
                                        {itemFeedback === 'up' && (
                                            <Tooltip title="You rated this a good refinement">
                                                <ThumbsUpIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                                            </Tooltip>
                                        )}
                                        {itemFeedback === 'down' && (
                                            <Tooltip title="You rated this a bad refinement">
                                                <ThumbsDownIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
};
