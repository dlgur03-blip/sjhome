import { Database } from "./database";

// DB 테이블 타입 추출
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];

export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];
export type LessonUpdate = Database["public"]["Tables"]["lessons"]["Update"];

export type LicenseKey = Database["public"]["Tables"]["license_keys"]["Row"];
export type LicenseKeyInsert = Database["public"]["Tables"]["license_keys"]["Insert"];
export type LicenseKeyUpdate = Database["public"]["Tables"]["license_keys"]["Update"];

export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type UserProgressInsert = Database["public"]["Tables"]["user_progress"]["Insert"];
export type UserProgressUpdate = Database["public"]["Tables"]["user_progress"]["Update"];

// 확장 타입 (관계 포함)
export type CourseWithLessons = Course & {
  lessons: Lesson[];
};

export type LessonWithProgress = Lesson & {
  progress?: UserProgress;
};

// 라이선스 검증 결과
export type LicenseValidationResult = {
  success: boolean;
  message: string;
  expiresAt?: string;
  licenseKeyId?: string;
};

// 관리자 대시보드 통계
export type DashboardStats = {
  totalCourses: number;
  totalLessons: number;
  totalLicenses: number;
  activeLicenses: number;
};

// 메모 타입
export type UserNote = {
  id: string;
  license_key_id: string;
  lesson_id: string;
  timestamp_seconds: number;
  content: string;
  created_at: string;
};

// 북마크 타입
export type UserBookmark = {
  id: string;
  license_key_id: string;
  lesson_id: string;
  timestamp_seconds: number;
  label: string | null;
  created_at: string;
};

// 뱃지/업적 타입
export type AchievementType = 
  | 'first_lesson'      // 첫 강의 완료
  | 'streak_3'          // 3일 연속 학습
  | 'streak_7'          // 7일 연속 학습
  | 'streak_30'         // 30일 연속 학습
  | 'course_complete'   // 코스 완료
  | 'speed_learner'     // 하루 5강 이상
  | 'night_owl'         // 밤 12시 이후 학습
  | 'early_bird'        // 오전 6시 이전 학습
  | 'note_taker'        // 메모 10개 이상
  | 'bookworm';         // 북마크 20개 이상

export type UserAchievement = {
  id: string;
  license_key_id: string;
  achievement_type: AchievementType;
  achievement_data: Record<string, any>;
  unlocked_at: string;
};

// 스트릭 타입
export type UserStreak = {
  id: string;
  license_key_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  updated_at: string;
};

// 후기 타입
export type Review = {
  id: string;
  license_key_id: string;
  rating: number;
  content: string;
  author_name: string | null;
  is_visible: boolean;
  created_at: string;
};

// 뱃지 정보
export const BADGE_INFO: Record<AchievementType, { 
  name: string; 
  description: string; 
  icon: string;
  color: string;
}> = {
  first_lesson: {
    name: '첫 발자국',
    description: '첫 번째 강의를 완료했습니다!',
    icon: '🎯',
    color: '#CCFF00',
  },
  streak_3: {
    name: '워밍업',
    description: '3일 연속 학습 달성!',
    icon: '🔥',
    color: '#FF6B35',
  },
  streak_7: {
    name: '주간 챔피언',
    description: '7일 연속 학습 달성!',
    icon: '⚡',
    color: '#FFD700',
  },
  streak_30: {
    name: '전설의 학습자',
    description: '30일 연속 학습 달성!',
    icon: '👑',
    color: '#E040FB',
  },
  course_complete: {
    name: '코스 마스터',
    description: '전체 코스를 완료했습니다!',
    icon: '🏆',
    color: '#00E676',
  },
  speed_learner: {
    name: '스피드 러너',
    description: '하루에 5개 이상 강의 완료!',
    icon: '🚀',
    color: '#00BCD4',
  },
  night_owl: {
    name: '올빼미',
    description: '밤 12시 이후에 학습했습니다',
    icon: '🦉',
    color: '#7C4DFF',
  },
  early_bird: {
    name: '얼리버드',
    description: '오전 6시 이전에 학습했습니다',
    icon: '🐦',
    color: '#FF9800',
  },
  note_taker: {
    name: '필기왕',
    description: '메모 10개 이상 작성!',
    icon: '📝',
    color: '#4CAF50',
  },
  bookworm: {
    name: '책벌레',
    description: '북마크 20개 이상 저장!',
    icon: '📚',
    color: '#2196F3',
  },
};

// 레벨 시스템
export const LEVEL_THRESHOLDS = [
  { level: 1, exp: 0, name: '뉴비' },
  { level: 2, exp: 100, name: '입문자' },
  { level: 3, exp: 300, name: '학습자' },
  { level: 4, exp: 600, name: '숙련자' },
  { level: 5, exp: 1000, name: '전문가' },
  { level: 6, exp: 1500, name: '마스터' },
  { level: 7, exp: 2500, name: '그랜드마스터' },
  { level: 8, exp: 4000, name: '레전드' },
  { level: 9, exp: 6000, name: '신화' },
  { level: 10, exp: 10000, name: '릴스의 신' },
];

export function calculateLevel(exp: number): { level: number; name: string; currentExp: number; nextExp: number; progress: number } {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];
  
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (exp >= LEVEL_THRESHOLDS[i].exp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
    }
  }
  
  const currentExp = exp - currentLevel.exp;
  const nextExp = nextLevel.exp - currentLevel.exp;
  const progress = nextExp > 0 ? (currentExp / nextExp) * 100 : 100;
  
  return {
    level: currentLevel.level,
    name: currentLevel.name,
    currentExp,
    nextExp,
    progress: Math.min(progress, 100),
  };
}
