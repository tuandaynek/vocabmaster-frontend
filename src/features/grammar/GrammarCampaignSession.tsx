import { useState } from 'react';
import './components/shared/game-animation.css';
import SentencePuzzleGame from './components/screens/SentencePuzzleGame';
import ErrorSpotterGame from './components/screens/ErrorSpotterGame';
import SpeedGrammarQuiz from './components/screens/SpeedGrammarQuiz';
import SentenceTransformerGame from './components/screens/SentenceTransformerGame';
import ContextMatchGame from './components/screens/ContextMatchGame';

export type GameType = 'puzzle' | 'error' | 'speed' | 'transformer' | 'context';

interface GrammarCampaignSessionProps {
  onExitSession?: () => void;
  // Cho phép chỉ định danh sách chặng chơi (mặc định chọn 3 game làm 1 campaign)
  stages?: GameType[];
}

export default function GrammarCampaignSession({
  onExitSession,
  stages = ['puzzle', 'error', 'speed']
}: GrammarCampaignSessionProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const currentStage = stages[currentStageIndex];

  const handleStageComplete = () => {
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    } else {
      if (onExitSession) onExitSession();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/70 via-white to-sky-50/70 animate-pop-in" aria-live="polite">
      {currentStage === 'puzzle' && (
        <SentencePuzzleGame 
          key={currentStageIndex}
          onBack={onExitSession} 
          onComplete={handleStageComplete} 
        />
      )}

      {currentStage === 'error' && (
        <ErrorSpotterGame 
          key={currentStageIndex}
          onBack={onExitSession} 
          onComplete={handleStageComplete} 
        />
      )}

      {currentStage === 'speed' && (
        <SpeedGrammarQuiz 
          key={currentStageIndex}
          onBack={onExitSession} 
          onComplete={handleStageComplete} 
        />
      )}

      {currentStage === 'transformer' && (
        <SentenceTransformerGame 
          key={currentStageIndex}
          onBack={onExitSession} 
          onComplete={handleStageComplete} 
        />
      )}

      {currentStage === 'context' && (
        <ContextMatchGame 
          key={currentStageIndex}
          onBack={onExitSession} 
          onComplete={handleStageComplete} 
        />
      )}
    </div>
  );
}