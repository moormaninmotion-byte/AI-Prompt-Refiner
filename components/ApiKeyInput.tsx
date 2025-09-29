
import React from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  return (
    <div className="bg-brand-secondary p-4 rounded-md shadow-lg">
      <label htmlFor="api-key" className="flex items-center gap-3 text-lg font-semibold text-brand-light mb-2">
        <KeyIcon className="w-6 h-6 text-brand-accent" />
        Gemini API Key
      </label>
      <p className="text-sm text-brand-text mb-3">
        Your API key is stored securely in your browser's local storage and is never sent to our servers.
      </p>
      <input
        id="api-key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter your API key here"
        className="w-full bg-brand-primary border border-gray-600 rounded-md p-2 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200"
      />
    </div>
  );
};
