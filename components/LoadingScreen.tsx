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
    <div className="flex flex-col items-center justify-center h-64 p-8 w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-terracotta/20 rounded-full animate-ping opacity-30"></div>
        <div className="relative bg-white/80 backdrop-blur-sm p-5 rounded-full shadow-lg border border-brand-dark/10">
          {step === 'UPLOADING' && <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />}
          {step === 'ANALYZING' && <Sparkles className="w-8 h-8 text-brand-terracotta animate-pulse" />}
          {step === 'SEARCHING' && <Search className="w-8 h-8 text-brand-sage animate-bounce" />}
        </div>
      </div>

      <h3 className="mt-6 text-xl font-medium text-brand-dark">{displayText}</h3>
      <p className="mt-2 text-brand-dark/40 text-sm text-center max-w-xs">
        AI is scanning visual features to match furniture styles.
      </p>
    </div>
  );
};

export default LoadingScreen;
