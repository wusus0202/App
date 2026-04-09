import React, { createContext, useContext, useState, useEffect } from 'react';

export const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' }
];

export const AI_LANGUAGES = [
  { code: 'en', label: 'English', prompt: 'Respond in English.' },
  { code: 'zh', label: '繁體中文', prompt: '請用繁體中文回答。' },
  { code: 'ja', label: '日本語', prompt: '日本語で回答してください。' },
  { code: 'ko', label: '한국어', prompt: '한국어로 답변해 주세요.' }
];

type Language = 'en' | 'zh' | 'ja' | 'ko';

interface I18nContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'Focus',
    'app.subtitle': 'AI-Native Study Ecosystem',
    'nav.tasks': 'Tasks',
    'nav.calendar': 'Calendar',
    'nav.forum': 'Forum',
    'nav.game': 'Game',
    'nav.profile': 'Profile',
    'tasks.today': "Today's Focus",
    'tasks.todo': 'To Do',
    'tasks.done': 'Done',
    'tasks.empty': 'All caught up! Time to relax?',
    'ai.placeholder': 'Ask Focus AI anything...',
    'ai.assistant': 'Focus AI Assistant',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'profile.title': 'Profile',
    'profile.points': 'Total Points',
    'profile.streak': 'Day Streak',
    'profile.language': 'UI Language',
    'profile.ai_language': 'AI Response Language',
    'forum.posts': 'Posts',
    'forum.reddit': 'r/ Reddit',
    'game.title': 'Study Rewards',
    'game.gacha': 'Pull Gacha',
    'game.points': 'Points',
  },
  zh: {
    'app.name': 'Focus',
    'app.subtitle': 'AI 原生學習生態系統',
    'nav.tasks': '任務',
    'nav.calendar': '日曆',
    'nav.forum': '論壇',
    'nav.game': '遊戲',
    'nav.profile': '個人資料',
    'tasks.today': '今日重點',
    'tasks.todo': '待辦',
    'tasks.done': '已完成',
    'tasks.empty': '全部完成了！休息一下？',
    'ai.placeholder': '問問 Focus AI 任何事...',
    'ai.assistant': 'Focus AI 助手',
    'common.save': '儲存',
    'common.cancel': '取消',
    'common.add': '新增',
    'profile.title': '個人資料',
    'profile.points': '總積分',
    'profile.streak': '連續天數',
    'profile.language': '介面語言',
    'profile.ai_language': 'AI 回應語言',
    'forum.posts': '貼文',
    'forum.reddit': 'r/ Reddit',
    'game.title': '學習獎勵',
    'game.gacha': '抽取扭蛋',
    'game.points': '積分',
  },
  ja: {
    'app.name': 'Focus',
    'app.subtitle': 'AIネイティブ学習エコシステム',
    'nav.tasks': 'タスク',
    'nav.calendar': 'カレンダー',
    'nav.forum': 'フォーラム',
    'nav.game': 'ゲーム',
    'nav.profile': 'プロフィール',
    'tasks.today': '今日のフォーカス',
    'tasks.todo': '未完了',
    'tasks.done': '完了済み',
    'tasks.empty': 'すべて完了しました！リラックスしますか？',
    'ai.placeholder': 'Focus AIに何でも聞いてください...',
    'ai.assistant': 'Focus AI アシスタント',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.add': '追加',
    'profile.title': 'プロフィール',
    'profile.points': '合計ポイント',
    'profile.streak': '継続日数',
    'profile.language': 'UI言語',
    'profile.ai_language': 'AI応答言語',
    'forum.posts': '投稿',
    'forum.reddit': 'r/ Reddit',
    'game.title': '学習報酬',
    'game.gacha': 'ガチャを引く',
    'game.points': 'ポイント',
  },
  ko: {
    'app.name': 'Focus',
    'app.subtitle': 'AI 네이티브 학습 생태계',
    'nav.tasks': '할 일',
    'nav.calendar': '캘린더',
    'nav.forum': '포럼',
    'nav.game': '게임',
    'nav.profile': '프로필',
    'tasks.today': '오늘의 포커스',
    'tasks.todo': '할 일',
    'tasks.done': '완료',
    'tasks.empty': '모두 완료했습니다! 휴식 시간인가요?',
    'ai.placeholder': 'Focus AI에게 무엇이든 물어보세요...',
    'ai.assistant': 'Focus AI 어시스턴트',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.add': '추가',
    'profile.title': '프로필',
    'profile.points': '총 포인트',
    'profile.streak': '연속 일수',
    'profile.language': 'UI 언어',
    'profile.ai_language': 'AI 응답 언어',
    'forum.posts': '게시물',
    'forum.reddit': 'r/ Reddit',
    'game.title': '학습 보상',
    'game.gacha': '가차 뽑기',
    'game.points': '포인트',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('focus_ui_lang') as Language) || 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('focus_ui_lang', newLang);
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useLanguage must be used within I18nProvider');
  return context;
}
