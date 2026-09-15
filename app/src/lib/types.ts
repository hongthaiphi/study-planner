export type UserRole = "student" | "mentor";
export type FamilyRole = "mentor" | "member";
export type ProjectType = "exam" | "learning" | "fitness" | "skill" | "habit" | "custom";
export type ActivityType = "theory" | "exercise" | "mock_exam" | "practice" | "session";
export type Mood = "great" | "good" | "okay" | "tired" | "frustrated";
export type TopicStatus = "not_started" | "in_progress" | "completed" | "mastered";
export type QuestTier = "normal" | "challenge" | "epic" | "royal";
export type QuestSource = "ai" | "mentor" | "system";
export type BuildingType = "library" | "training" | "tower" | "forge";
export type MilestoneStatus = "pending" | "completed" | "skipped";
export type MentorRoleType = "parent" | "tutor" | "teacher";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role_in_group: FamilyRole;
  created_at: string;
  user?: User;
}

/** @deprecated Use Group */
export type Family = Group;
/** @deprecated Use GroupMember */
export type FamilyMember = GroupMember;

export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: ProjectType;
  description: string | null;
  deadline: string | null;
  unit: string;
  template_id: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  date: string | null;
  status: MilestoneStatus;
  notes: string | null;
  order: number;
}

export interface Topic {
  id: string;
  template_id: string | null;
  project_id: string | null;
  name: string;
  group: string;
  level: string;
  weight: number;
  order: number;
}

export interface UserTopic {
  id: string;
  user_id: string;
  topic_id: string;
  status: TopicStatus;
  avg_score: number;
  last_studied_at: string | null;
  topic?: Topic;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  project_id: string;
  topic_id: string | null;
  date: string;
  type: ActivityType;
  duration_minutes: number | null;
  value: number | null;
  max_value: number | null;
  notes: string | null;
  mood: Mood | null;
  created_at: string;
  topic?: Topic;
}

export interface WeeklyGoal {
  id: string;
  student_id: string;
  set_by_user_id: string;
  week_start: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface UserGameStats {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  gold: number;
  rare_materials: number;
  current_streak: number;
  best_streak: number;
  perfect_weeks: number;
  updated_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  project_id: string | null;
  week_start: string;
  title: string;
  description: string | null;
  tier: QuestTier;
  reward_gold: number;
  reward_xp: number;
  reward_materials: number;
  is_completed: boolean;
  completed_at: string | null;
  source: QuestSource;
  created_at: string;
}

export interface Building {
  id: string;
  user_id: string;
  topic_id: string;
  type: BuildingType;
  unlocked_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  earned_at: string;
}

export interface MentorProfile {
  id: string;
  bio: string | null;
  subjects: string[];
  experience: string | null;
  role_type: MentorRoleType;
  is_public: boolean;
  max_students: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface ConnectionRequest {
  id: string;
  student_id: string;
  mentor_id: string;
  message: string | null;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  student?: User;
  mentor?: User;
}

export interface AiReport {
  id: string;
  user_id: string;
  project_id: string | null;
  type: "daily_suggestion" | "weekly_review" | "alert" | "mentor_weekly";
  content: string;
  created_at: string;
}

export interface FortressState {
  level: "wasteland" | "exploring" | "basic" | "strong" | "legendary";
  percentage: number;
}

export function getFortressState(avgScore: number): FortressState {
  if (avgScore === 0) return { level: "wasteland", percentage: avgScore };
  if (avgScore <= 30) return { level: "exploring", percentage: avgScore };
  if (avgScore <= 60) return { level: "basic", percentage: avgScore };
  if (avgScore <= 80) return { level: "strong", percentage: avgScore };
  return { level: "legendary", percentage: avgScore };
}

export function getWeatherFromStreak(streak: number) {
  if (streak === 0) return { name: "Bão tố", emoji: "⛈️" };
  if (streak <= 2) return { name: "Nhiều mây", emoji: "☁️" };
  if (streak <= 6) return { name: "Nắng đẹp", emoji: "☀️" };
  if (streak <= 13) return { name: "Cầu vồng", emoji: "🌈" };
  return { name: "Thời đại hoàng kim", emoji: "✨" };
}

export function getLevelTitle(level: number) {
  if (level <= 5) return "Người khai hoang";
  if (level <= 10) return "Lãnh chúa trẻ";
  if (level <= 15) return "Tướng quân tri thức";
  if (level <= 20) return "Hiền giả";
  if (level <= 25) return "Hoàng đế học thuật";
  return "Huyền thoại Olympiad";
}

export function calculateLevel(xp: number): number {
  if (xp < 500) return Math.max(1, Math.floor(xp / 100) + 1);
  if (xp < 1500) return Math.floor((xp - 500) / 200) + 6;
  if (xp < 3500) return Math.floor((xp - 1500) / 400) + 11;
  if (xp < 7000) return Math.floor((xp - 3500) / 700) + 16;
  if (xp < 12000) return Math.floor((xp - 7000) / 1000) + 21;
  return Math.min(30, Math.floor((xp - 12000) / 1500) + 26);
}
