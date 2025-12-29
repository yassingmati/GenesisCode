
export interface Course {
  id: string;
  title: string;
  category: string;
  progress: number;
  completedExercises: number;
  totalExercises: number;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  label: string;
  completed: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  initial: string;
}
