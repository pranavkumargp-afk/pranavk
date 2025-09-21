import React, { useState, useCallback } from 'react';
import { analyzeText } from './services/geminiService';
import type { AnalysisResult, TrendDataPoint } from './types';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import AnalysisDashboard from './components/AnalysisDashboard';
import { MicrophoneIcon, StopCircleIcon, BrainCircuitIcon } from './components/icons';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isListening, error: voiceError, startListening, stopListening } = useVoiceRecognition(
    (transcript) => setText(prev => `${prev}${transcript}`)
  );

  const handleAnalysis = useCallback(async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeText(text);
      setAnalysisResult(result);
      setTrendData(prev => [
        ...prev,
        { name: `Entry ${prev.length + 1}`, intensity: result.emotionIntensity }
      ]);
      setText(''); // Clear input after successful analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="bg-gradient-to-br from-slate-900 to-sky-900/50">
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <BrainCircuitIcon className="w-10 h-10 text-sky-400"/>
            <h1 className="text-4xl font-bold tracking-tight text-white">MindScribe AI</h1>
          </div>
          <p className="mt-2 text-lg text-slate-400">Your personal AI-powered mental wellness companion</p>
        </header>
      </div>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-lg sticky top-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Enter Your Thoughts</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or use the microphone to share what's on your mind..."
                className="w-full h-48 bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 ${
                    isListening ? 'bg-red-600 hover:bg-red-500' : 'bg-sky-600 hover:bg-sky-500'
                  }`}
                  disabled={isLoading}
                >
                  {isListening ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
                  <span>{isListening ? 'Stop' : 'Voice Input'}</span>
                </button>
                <button
                  onClick={handleAnalysis}
                  disabled={isLoading || !text.trim()}
                  className="bg-green-600 text-white font-bold px-6 py-2 rounded-md hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              {voiceError && <p className="text-red-400 text-sm mt-2">{voiceError}</p>}
            </div>

            <div className="text-center text-sm text-slate-500 p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold">Disclaimer:</p>
                <p>MindScribe AI is an informational tool and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnalysisDashboard 
              analysisResult={analysisResult}
              trendData={trendData}
              isLoading={isLoading}
              error={error}
            />
          </div>

        </div>
      </main>
       <footer className="text-center py-6 mt-8 border-t border-slate-800">
        <p className="text-slate-500 text-sm">Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
