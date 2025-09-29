
import React from 'react';
import type { InteractionHistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  history: InteractionHistoryItem[];
  onLoadItem: (item: InteractionHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoadItem, onClearHistory }) => {
    if (history.length === 0) {
        return null; // Don't render the panel if there's no history
    }

    const formatTimestamp = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="bg-brand-secondary p-4 rounded-md shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <HistoryIcon className="w-6 h-6 text-brand-accent" />
                    <h2 className="text-2xl font-semibold text-brand-light">History</h2>
                </div>
                <button
                    onClick={onClearHistory}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary hover:bg-red-500/20 text-sm font-medium rounded-md text-red-400 hover:text-red-300 transition-colors duration-200"
                    title="Clear all history"
                >
                    <TrashIcon className="w-4 h-4" />
                    Clear History
                </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onLoadItem(item)}
                        className="w-full text-left p-2 bg-brand-primary/50 hover:bg-brand-primary rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                        <p className="text-sm font-medium text-brand-text truncate">
                            {item.originalPrompt}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatTimestamp(item.timestamp)}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};
