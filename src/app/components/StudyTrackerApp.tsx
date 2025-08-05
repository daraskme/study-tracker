'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Target, CheckCircle, Play, X, History, Calendar } from 'lucide-react';

type Goal = {
  id: number;
  goal: string;
  targetMinutes: number;
  actualTime: number;
  completedAt: string;
  achieved: boolean;
};

const StudyTrackerApp = () => {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'study' | 'history'>('setup');
  const [studyGoal, setStudyGoal] = useState<string>('');
  const [targetMinutes, setTargetMinutes] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // 履歴読み込み
  useEffect(() => {
    const saved = localStorage.getItem('studyHistory');
    if (saved) {
      setCompletedGoals(JSON.parse(saved) as Goal[]);
    }
  }, []);

  // タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}時間${minutes}分${secs}秒`;
    }
    return `${minutes}分${secs}秒`;
  };

  const getRemainingTime = () => {
    const targetSeconds = parseInt(targetMinutes) * 60;
    const remaining = targetSeconds - elapsedTime;
    return Math.max(0, remaining);
  };

  const getProgress = () => {
    const targetSeconds = parseInt(targetMinutes) * 60;
    return Math.min(100, (elapsedTime / targetSeconds) * 100);
  };

  const startStudy = () => {
    if (!studyGoal || !targetMinutes || parseInt(targetMinutes) <= 0) {
      alert('目標と時間を正しく入力してください');
      return;
    }
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsRunning(true);
    setCurrentScreen('study');
  };

  const handleGiveUp = () => {
    setShowConfirmDialog(true);
  };

  const confirmGiveUp = () => {
    setShowConfirmDialog(false);
    resetStudy();
  };

  const cancelGiveUp = () => {
    setShowConfirmDialog(false);
  };

  const completeStudy = () => {
    const newGoal: Goal = {
      id: Date.now(),
      goal: studyGoal,
      targetMinutes: parseInt(targetMinutes),
      actualTime: elapsedTime,
      completedAt: new Date().toLocaleString('ja-JP'),
      achieved: elapsedTime >= parseInt(targetMinutes) * 60,
    };

    const updatedGoals = [newGoal, ...completedGoals];
    setCompletedGoals(updatedGoals);
    localStorage.setItem('studyHistory', JSON.stringify(updatedGoals));

    setStudyGoal('');
    setTargetMinutes('');
    setStartTime(null);
    setElapsedTime(0);
    setIsRunning(false);
    setCurrentScreen('setup');
  };

  const resetStudy = () => {
    setStartTime(null);
    setElapsedTime(0);
    setIsRunning(false);
    setCurrentScreen('setup');
  };

  const CircularProgress: React.FC<{ progress: number; size?: number }> = ({ progress, size = 200 }) => {
    const radius = (size - 20) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className="w-16 h-16 text-white opacity-80" />
        </div>
      </div>
    );
  };

  // --- 以下画面レンダリング ---
  if (currentScreen === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">学習目標設定</h1>
            <button
              onClick={() => setCurrentScreen('history')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              <History className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                学習目標
              </label>
              <input
                type="text"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                placeholder="例: 数学の宿題を終わらせる"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                目標時間（分）
              </label>
              <input
                type="number"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(e.target.value)}
                placeholder="30"
                min="1"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={startStudy}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>学習を開始</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'study') {
    const progress = getProgress();
    const remaining = getRemainingTime();
    const isCompleted = remaining === 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/20">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white mb-2">{studyGoal}</h2>
            <div className="flex justify-center">
              <CircularProgress progress={progress} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/70 text-sm mb-1">経過時間</p>
                <p className="text-white text-lg font-semibold">{formatTime(elapsedTime)}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/70 text-sm mb-1">残り時間</p>
                <p className={`text-lg font-semibold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                  {isCompleted ? '完了！' : formatTime(remaining)}
                </p>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleGiveUp}
                className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-red-500/30"
              >
                <X className="w-5 h-5" />
                <span>あきらめる</span>
              </button>
            </div>
            <button
              onClick={completeStudy}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              <span>完了</span>
            </button>
          </div>

          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="mb-4">
                    <X className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">本当にあきらめますか？</h3>
                    <p className="text-gray-600 text-sm">進捗は保存されず、最初の画面に戻ります</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={cancelGiveUp}
                      className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={confirmGiveUp}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200"
                    >
                      あきらめる
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <History className="w-6 h-6" />
                <span>学習履歴</span>
              </h1>
              <button
                onClick={() => setCurrentScreen('setup')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
              >
                戻る
              </button>
            </div>
            {completedGoals.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">まだ完了した目標がありません</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{goal.goal}</h3>
                        <p className="text-white/70 text-sm mb-2">{goal.completedAt}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-white/60">目標: {goal.targetMinutes}分</span>
                          <span className="text-white/60">実際: {formatTime(goal.actualTime)}</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${goal.achieved ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                        <CheckCircle
                          className={`w-5 h-5 ${goal.achieved ? 'text-green-400' : 'text-yellow-400'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudyTrackerApp;
