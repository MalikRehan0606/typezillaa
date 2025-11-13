
import type { LucideIcon } from "lucide-react";

export type TestStatus = "pending" | "active" | "completed";

export type DifficultyLevel = "simple" | "intermediate" | "expert" | "mixed" | "time";

export type MistakeMode = "default" | "pro" | "god";

export type SoundPack = "none" | "default" | "pop" | "click";

export type Language = "en" | "es" | "de" | "fr";

export type MatchStatus = 'pending' | 'active' | 'completed' | 'declined' | 'starting';

export type MatchResult = {
  wpm: number;
  accuracy: number;
  time: number;
};

export type Match = {
    id: string;
    player1Id: string;
    player1Name: string;
    player2Id: string;
    player2Name: string;
    status: MatchStatus;
    wordCount: number;
    createdAt: any; // Firestore Timestamp
    textToType?: string; // Generated on the fly if needed
    player1Result: MatchResult | null;
    player2Result: MatchResult | null;
    winnerId?: string;
    player1Ready?: boolean;
    player2Ready?: boolean;
};

export type FriendRequest = {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any; // Firestore Timestamp
};


export type LeaderboardEntry = {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  level: DifficultyLevel;
  timestamp: number;
  userId?: string;
  language?: Language;
  rank?: number;
  time?: number;
};

export type WpmDataPoint = {
  time: number;
  wpm: number;
  rawWpm: number;
  errors: number;
};

export type Keystroke = {
  key: string;
  time: number; // Milliseconds from the start of the test
  code: string;
};

export type TestResult = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  time: number;
  level: DifficultyLevel;
  language: Language;
  wordCount: number | null;
  testTitle: string;
  testStatus: 'passed' | 'failed';
  characterStats: {
    correct: number;
    incorrect: number;
    total: number;
  };
  wpmHistory: WpmDataPoint[];
  errorTimestamps: number[];
  textToType: string;
  userInput: string;
  keystrokeHistory: Keystroke[];
  wordsWithErrors?: number[];
};

export type GlobalStats = {
  totalTestStarted: number;
  totalTestsCompleted: number;
  totalTypingTimeInSeconds: number;
};

export type TestHistoryEntry = {
    id: string;
    wpm: number;
    accuracy: number;
    level: DifficultyLevel;
    timestamp: number;
    wordCount?: number | null;
    time?: number | null;
    language: Language;
}

export type PersonalBest = {
  wpm: number;
  accuracy: number;
};

export type UserPresence = {
    state: 'online' | 'offline';
    lastSeen: any; // Firestore timestamp
};

export type ChallengeStats = {
    dailyChallengeCount: number;
    dailyChallengeCountResetAt: any; // Firestore Timestamp
    lastChallengeSentAt: any; // Firestore Timestamp
}

export type UserProfileData = {
    uid: string;
    name: string;
    email?: string;
    photoURL?: string;
    createdAt: any; // Firestore timestamp
    testsStarted?: number;
    testsCompleted?: number;
    totalTimeTyping?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastTestTimestamp?: any; // Firestore timestamp
    friends?: string[];
    presence?: UserPresence;
    challengeStats?: ChallengeStats;
    isBanned?: boolean;
    unlockedAchievements?: string[];
    personalBests?: {
        words?: {
            '15'?: PersonalBest;
            '30'?: PersonalBest;
            '45'?: PersonalBest;
            '60'?: PersonalBest;
        },
        time?: {
            '15'?: PersonalBest;
            '30'?: PersonalBest;
            '60'?: PersonalBest;
        }
    }
};

export type Achievement = {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    unlocked: boolean;
    check: (history: TestHistoryEntry[], profileData: UserProfileData | null) => boolean;
}
