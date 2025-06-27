export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface TeamCapacity {
  id: string;
  teamId: string;
  quarterId: string;
  capacity: number; // Пропускная способность в человеко-спринтах за квартал
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  teamId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberCapacity {
  id: string;
  memberId: string;
  quarterId: string;
  capacity: number; // Capacity участника в человеко-спринтах за квартал
  createdAt: Date;
  updatedAt: Date;
}

export interface Quarter {
  id: string;
  name: string; // e.g., "Q1'25"
  year: number;
  quarter: 1 | 2 | 3 | 4;
  createdAt: Date;
}

export interface TaskRoleCapacity {
  id: string;
  taskId: string;
  roleId: string;
  capacity: number; // Capacity задачи для данной роли в человеко-спринтах
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  teamId: string;
  quarterId?: string;
  isPlanned: boolean;
  impact: number; // I (1-10)
  confidence: number; // C (1-10)
  ease: number; // E (1-10)
  expressEstimate?: number; // Экспресс-оценка в человеко-спринтах (заполняется пользователем)
  planVariantId?: string; // ID варианта планирования
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanVariant {
  id: string;
  name: string;
  quarterId: string;
  teamId: string;
  isExpress: boolean; // true для экспресс-планирования, false для детального
  isMain: boolean; // основной вариант
  createdAt: Date;
  updatedAt: Date;
}

// Default quarters for 2025
export const DEFAULT_QUARTERS: Omit<Quarter, 'id' | 'createdAt'>[] = [
  { name: "Q1'25", year: 2025, quarter: 1 },
  { name: "Q2'25", year: 2025, quarter: 2 },
  { name: "Q3'25", year: 2025, quarter: 3 },
  { name: "Q4'25", year: 2025, quarter: 4 },
];

export const TEAM_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
]; 