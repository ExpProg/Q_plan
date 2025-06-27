import { supabase } from '../lib/supabase'
import type { 
  Task, 
  Team, 
  Quarter, 
  Role, 
  TeamMember, 
  TeamCapacity, 
  MemberCapacity, 
  TaskRoleCapacity, 
  PlanVariant 
} from '../types'

// Utility функция для преобразования даты из ISO строки в объект Date
const parseDate = (dateString: string): Date => new Date(dateString)

// Utility функция для преобразования объекта Date в ISO строку
const formatDate = (date: Date): string => date.toISOString()

// Teams Service
export const teamsService = {
  async getAll(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(team => ({
      id: team.id,
      name: team.name,
      color: team.color
    })) || []
  },

  async create(team: Omit<Team, 'id'>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: team.name,
        color: team.color
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      color: data.color
    }
  },

  async update(team: Team): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({
        name: team.name,
        color: team.color
      })
      .eq('id', team.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      color: data.color
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Quarters Service
export const quartersService = {
  async getAll(): Promise<Quarter[]> {
    const { data, error } = await supabase
      .from('quarters')
      .select('*')
      .order('start_date', { ascending: true })
    
    if (error) throw error
    
    return data?.map(quarter => {
      // Извлекаем год и квартал из start_date
      const startDate = new Date(quarter.start_date)
      const year = startDate.getFullYear()
      const month = startDate.getMonth() + 1
      const quarterNum = Math.ceil(month / 3) as 1 | 2 | 3 | 4
      
      return {
        id: quarter.id,
        name: quarter.name,
        year: year,
        quarter: quarterNum,
        createdAt: parseDate(quarter.created_at)
      }
    }) || []
  },

  async create(quarter: Omit<Quarter, 'id' | 'createdAt'>): Promise<Quarter> {
    // Вычисляем start_date и end_date на основе year и quarter
    const startMonth = (quarter.quarter - 1) * 3 + 1
    const endMonth = quarter.quarter * 3
    const startDate = new Date(quarter.year, startMonth - 1, 1)
    const endDate = new Date(quarter.year, endMonth, 0) // Последний день месяца
    
    const { data, error } = await supabase
      .from('quarters')
      .insert({
        name: quarter.name,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      year: quarter.year,
      quarter: quarter.quarter,
      createdAt: parseDate(data.created_at)
    }
  },

  async update(quarter: Quarter): Promise<Quarter> {
    // Вычисляем start_date и end_date на основе year и quarter
    const startMonth = (quarter.quarter - 1) * 3 + 1
    const endMonth = quarter.quarter * 3
    const startDate = new Date(quarter.year, startMonth - 1, 1)
    const endDate = new Date(quarter.year, endMonth, 0) // Последний день месяца
    
    const { data, error } = await supabase
      .from('quarters')
      .update({
        name: quarter.name,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })
      .eq('id', quarter.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      year: quarter.year,
      quarter: quarter.quarter,
      createdAt: parseDate(data.created_at)
    }
  }
}

// Roles Service
export const rolesService = {
  async getAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: parseDate(role.created_at)
    })) || []
  },

  async create(role: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        name: role.name,
        description: role.description
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: parseDate(data.created_at)
    }
  },

  async update(role: Role): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update({
        name: role.name,
        description: role.description
      })
      .eq('id', role.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: parseDate(data.created_at)
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Tasks Service
export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      teamId: task.team_id,
      quarterId: task.quarter_id,
      planVariantId: task.plan_variant_id,
      isPlanned: task.is_planned,
      impact: task.impact,
      confidence: task.confidence,
      ease: task.ease,
      expressEstimate: task.express_estimate,
      createdAt: parseDate(task.created_at),
      updatedAt: parseDate(task.updated_at)
    })) || []
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        team_id: task.teamId,
        quarter_id: task.quarterId,
        plan_variant_id: task.planVariantId,
        is_planned: task.isPlanned,
        impact: task.impact,
        confidence: task.confidence,
        ease: task.ease,
        express_estimate: task.expressEstimate
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      teamId: data.team_id,
      quarterId: data.quarter_id,
      planVariantId: data.plan_variant_id,
      isPlanned: data.is_planned,
      impact: data.impact,
      confidence: data.confidence,
      ease: data.ease,
      expressEstimate: data.express_estimate,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  },

  async update(task: Task): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        team_id: task.teamId,
        quarter_id: task.quarterId,
        plan_variant_id: task.planVariantId,
        is_planned: task.isPlanned,
        impact: task.impact,
        confidence: task.confidence,
        ease: task.ease,
        express_estimate: task.expressEstimate
      })
      .eq('id', task.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      teamId: data.team_id,
      quarterId: data.quarter_id,
      planVariantId: data.plan_variant_id,
      isPlanned: data.is_planned,
      impact: data.impact,
      confidence: data.confidence,
      ease: data.ease,
      expressEstimate: data.express_estimate,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  },

  async delete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids)
    
    if (error) throw error
  }
}

// Team Members Service
export const teamMembersService = {
  async getAll(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      teamId: member.team_id,
      roleId: member.role_id,
      createdAt: parseDate(member.created_at),
      updatedAt: parseDate(member.updated_at)
    })) || []
  },

  async create(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        email: member.email,
        team_id: member.teamId,
        role_id: member.roleId
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      teamId: data.team_id,
      roleId: data.role_id,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  },

  async update(member: TeamMember): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: member.name,
        email: member.email,
        team_id: member.teamId,
        role_id: member.roleId
      })
      .eq('id', member.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      teamId: data.team_id,
      roleId: data.role_id,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Plan Variants Service
export const planVariantsService = {
  async getAll(): Promise<PlanVariant[]> {
    const { data, error } = await supabase
      .from('plan_variants')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(variant => ({
      id: variant.id,
      name: variant.name,
      teamId: variant.team_id,
      quarterId: variant.quarter_id,
      isExpress: variant.is_express,
      isMain: variant.is_main,
      createdAt: parseDate(variant.created_at),
      updatedAt: parseDate(variant.updated_at)
    })) || []
  },

  async create(variant: Omit<PlanVariant, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanVariant> {
    const { data, error } = await supabase
      .from('plan_variants')
      .insert({
        name: variant.name,
        team_id: variant.teamId,
        quarter_id: variant.quarterId,
        is_express: variant.isExpress,
        is_main: variant.isMain
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      teamId: data.team_id,
      quarterId: data.quarter_id,
      isExpress: data.is_express,
      isMain: data.is_main,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  },

  async update(variant: PlanVariant): Promise<PlanVariant> {
    const { data, error } = await supabase
      .from('plan_variants')
      .update({
        name: variant.name,
        team_id: variant.teamId,
        quarter_id: variant.quarterId,
        is_express: variant.isExpress,
        is_main: variant.isMain
      })
      .eq('id', variant.id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      teamId: data.team_id,
      quarterId: data.quarter_id,
      isExpress: data.is_express,
      isMain: data.is_main,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('plan_variants')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Member Capacities Service
export const memberCapacitiesService = {
  async getAll(): Promise<MemberCapacity[]> {
    const { data, error } = await supabase
      .from('member_capacities')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(capacity => ({
      id: capacity.id,
      memberId: capacity.member_id,
      quarterId: capacity.quarter_id,
      capacity: capacity.capacity,
      createdAt: parseDate(capacity.created_at),
      updatedAt: parseDate(capacity.updated_at)
    })) || []
  },

  async upsert(memberId: string, quarterId: string, capacity: number): Promise<MemberCapacity> {
    const { data, error } = await supabase
      .from('member_capacities')
      .upsert({
        member_id: memberId,
        quarter_id: quarterId,
        capacity: capacity
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      memberId: data.member_id,
      quarterId: data.quarter_id,
      capacity: data.capacity,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  }
}

// Team Capacities Service (legacy)
export const teamCapacitiesService = {
  async getAll(): Promise<TeamCapacity[]> {
    const { data, error } = await supabase
      .from('team_capacities')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(capacity => ({
      id: capacity.id,
      teamId: capacity.team_id,
      quarterId: capacity.quarter_id,
      capacity: capacity.capacity,
      createdAt: parseDate(capacity.created_at),
      updatedAt: parseDate(capacity.updated_at)
    })) || []
  },

  async upsert(teamId: string, quarterId: string, capacity: number): Promise<TeamCapacity> {
    const { data, error } = await supabase
      .from('team_capacities')
      .upsert({
        team_id: teamId,
        quarter_id: quarterId,
        capacity: capacity
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      teamId: data.team_id,
      quarterId: data.quarter_id,
      capacity: data.capacity,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  }
}

// Task Role Capacities Service
export const taskRoleCapacitiesService = {
  async getAll(): Promise<TaskRoleCapacity[]> {
    const { data, error } = await supabase
      .from('task_role_capacities')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    return data?.map(capacity => ({
      id: capacity.id,
      taskId: capacity.task_id,
      roleId: capacity.role_id,
      capacity: capacity.capacity,
      createdAt: parseDate(capacity.created_at),
      updatedAt: parseDate(capacity.updated_at)
    })) || []
  },

  async upsert(taskId: string, roleId: string, capacity: number): Promise<TaskRoleCapacity> {
    const { data, error } = await supabase
      .from('task_role_capacities')
      .upsert({
        task_id: taskId,
        role_id: roleId,
        capacity: capacity
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      taskId: data.task_id,
      roleId: data.role_id,
      capacity: data.capacity,
      createdAt: parseDate(data.created_at),
      updatedAt: parseDate(data.updated_at)
    }
  }
} 