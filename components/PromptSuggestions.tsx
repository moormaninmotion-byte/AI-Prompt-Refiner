
import React from 'react';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface PromptSuggestionsProps {
    suggestions: string[];
    onSelectSuggestion: (suggestion: string) => void;
    isLoading: boolean;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ suggestions, onSelectSuggestion, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-brand-secondary p-4 rounded-md shadow-lg animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                    <LightbulbIcon className="w-6 h-6 text-brand-accent animate-pulse" />
                    <h2 className="text-2xl font-semibold text-brand-light">Generating Ideas...</h2>
                </div>
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-brand-primary/50 rounded-md animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }
    
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-brand-secondary p-4 rounded-md shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
                <LightbulbIcon className="w-6 h-6 text-brand-accent" />
                <h2 className="text-2xl font-semibold text-brand-light">Need Inspiration?</h2>
            </div>
            <p className="text-sm text-gray-400 mb-3">
                Here are a few alternative ideas. Click one to use it as your prompt.
            </p>
            <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectSuggestion(suggestion)}
                        className="w-full text-left p-3 bg-brand-primary/50 hover:bg-brand-accent/20 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent group"
                    >
                        <p className="text-sm font-medium text-brand-text group-hover:text-brand-light">
                            {suggestion}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};
