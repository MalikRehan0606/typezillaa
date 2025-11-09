
import type { Achievement, TestHistoryEntry, UserProfileData } from "@/types";
import { Zap, Target, History, Gauge, Star, Globe, Feather, Trophy } from "lucide-react";

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
    {
        id: 'speed_demon_1',
        name: 'Speed Demon I',
        description: 'Reach 60 WPM in any test.',
        icon: Zap,
        check: (history) => history.some(t => t.wpm >= 60),
    },
    {
        id: 'speed_demon_2',
        name: 'Speed Demon II',
        description: 'Reach 80 WPM in any test.',
        icon: Zap,
        check: (history) => history.some(t => t.wpm >= 80),
    },
    {
        id: 'speed_demon_3',
        name: 'Speed Demon III',
        description: 'Reach 100 WPM in any test.',
        icon: Zap,
        check: (history) => history.some(t => t.wpm >= 100),
    },
    {
        id: 'accuracy_1',
        name: 'The Wall',
        description: 'Achieve 99% accuracy on any test.',
        icon: Target,
        check: (history) => history.some(t => t.accuracy >= 99),
    },
    {
        id: 'accuracy_2',
        name: 'Perfectionist',
        description: 'Achieve 100% accuracy on any test with at least 15 words.',
        icon: Target,
        check: (history) => history.some(t => t.accuracy === 100 && (t.wordCount ?? 0) >= 15),
    },
    {
        id: 'consistency_1',
        name: 'Getting Started',
        description: 'Complete 10 tests.',
        icon: History,
        check: (history) => history.length >= 10,
    },
    {
        id: 'consistency_2',
        name: 'Dedicated',
        description: 'Complete 50 tests.',
        icon: History,
        check: (history) => history.length >= 50,
    },
    {
        id: 'consistency_3',
        name: 'Veteran',
        description: 'Complete 100 tests.',
        icon: History,
        check: (history) => history.length >= 100,
    },
    {
        id: 'expert_1',
        name: 'Expert Typist',
        description: 'Complete an expert level test with over 60 WPM.',
        icon: Gauge,
        check: (history) => history.some(t => t.level === 'expert' && t.wpm >= 60),
    },
    {
        id: 'language_1',
        name: 'Polyglot',
        description: 'Complete a test in at least 3 different languages.',
        icon: Globe,
        check: (history) => {
            const languages = new Set(history.map(t => t.language));
            return languages.size >= 3;
        },
    },
     {
        id: 'flawless_simple',
        name: 'Simple & Flawless',
        description: 'Achieve 100% accuracy on a simple test.',
        icon: Star,
        check: (history) => history.some(t => t.level === 'simple' && t.accuracy === 100),
    },
    {
        id: 'light_touch',
        name: 'Light Touch',
        description: 'Complete an intermediate test with over 70 WPM and 98% accuracy.',
        icon: Feather,
        check: (history) => history.some(t => t.level === 'intermediate' && t.wpm >= 70 && t.accuracy >= 98),
    },
    {
        id: 'streak_365',
        name: 'Unbroken',
        description: '365 days milestone. Maintain a daily streak for 365 consecutive days.',
        icon: Trophy,
        check: (history, profile) => (profile?.currentStreak ?? 0) >= 365,
    },
];

export const checkAchievements = (history: TestHistoryEntry[], profileData: UserProfileData | null): Achievement[] => {
    return ALL_ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: ach.check(history, profileData),
    }));
};
