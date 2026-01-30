import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Search } from 'lucide-react';

interface LoadingScreenProps {
  step: 'UPLOADING' | 'ANALYZING' | 'SEARCHING';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ step }) => {
  const [displayText, setDisplayText] = useState("Processing image...");

  useEffect(() => {
    if (step === 'UPLOADING') setDisplayText("Uploading image...");
    if (step === 'ANALYZING') setDisplayText("Analyzing style & materials...");
    if (step === 'SEARCHING') setDisplayText("Finding similar products across retailers...");
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center h-64 p-8 w-full animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-stone-200 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-white p-4 rounded-full shadow-lg border border-stone-100">
          {step === 'UPLOADING' && <Loader2 className="w-8 h-8 text-stone-800 animate-spin" />}
          {step === 'ANALYZING' && <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />}
          {step === 'SEARCHING' && <Search className="w-8 h-8 text-blue-500 animate-bounce" />}
        </div>
      </div>
      
      <h3 className="mt-6 text-xl font-medium text-stone-800">{displayText}</h3>
      <p className="mt-2 text-stone-400 text-sm text-center max-w-xs">
        AI is scanning visual features to match furniture styles.
      </p>
    </div>
  );
};

export default LoadingScreen;
