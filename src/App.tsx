import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Plus, Target, Menu } from 'lucide-react';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Sidebar } from './components/Sidebar';
import { TasksPage } from './pages/TasksPage';
import { TeamsPage } from './pages/TeamsPage';
import type { Task, Team, Quarter, Role, TeamMember, TeamCapacity, MemberCapacity, TaskRoleCapacity, PlanVariant } from './types';
import { TEAM_COLORS } from './types';
import { 
  teamsService, 
  quartersService, 
  rolesService, 
  tasksService,
  teamMembersService,
  planVariantsService,
  memberCapacitiesService,
  teamCapacitiesService,
  taskRoleCapacitiesService
} from './services/supabaseService';

function App() {
  // State для всех данных - загружаем из Supabase
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberCapacities, setMemberCapacities] = useState<MemberCapacity[]>([]);
  const [teamCapacities, setTeamCapacities] = useState<TeamCapacity[]>([]);
  const [taskRoleCapacities, setTaskRoleCapacities] = useState<TaskRoleCapacity[]>([]);
  const [planVariants, setPlanVariants] = useState<PlanVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Состояние для фильтров (перенесено из TasksPage)
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'express' | 'detailed'>('express');

  // Загрузка данных из Supabase при загрузке компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Параллельная загрузка всех данных
        const [
          quartersData,
          teamsData,
          rolesData,
          tasksData,
          teamMembersData,
          planVariantsData,
          memberCapacitiesData,
          teamCapacitiesData,
          taskRoleCapacitiesData
        ] = await Promise.all([
          quartersService.getAll(),
          teamsService.getAll(),
          rolesService.getAll(),
          tasksService.getAll(),
          teamMembersService.getAll(),
          planVariantsService.getAll(),
          memberCapacitiesService.getAll(),
          teamCapacitiesService.getAll(),
          taskRoleCapacitiesService.getAll()
        ]);

        // Устанавливаем данные в состояние
        setQuarters(quartersData);
        setTeams(teamsData);
        setRoles(rolesData);
        setTasks(tasksData);
        setTeamMembers(teamMembersData);
        setPlanVariants(planVariantsData);
        setMemberCapacities(memberCapacitiesData);
        setTeamCapacities(teamCapacitiesData);
        setTaskRoleCapacities(taskRoleCapacitiesData);

        // Устанавливаем дефолтные значения фильтров после загрузки
        if (quartersData.length > 0) {
          setSelectedQuarterId(quartersData[0].id);
        }
        if (teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions
  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  };

  const getQuarterById = (quarterId: string) => {
    return quarters.find(quarter => quarter.id === quarterId);
  };

  const getRoleById = (roleId: string) => {
    return roles.find(role => role.id === roleId);
  };

  const getTeamCapacity = (teamId: string, quarterId: string) => {
    // Найти всех участников команды
    const teamMemberIds = teamMembers
      .filter(member => member.teamId === teamId)
      .map(member => member.id);
    
    // Суммировать capacity всех участников команды за квартал
    const totalCapacity = memberCapacities
      .filter(mc => teamMemberIds.includes(mc.memberId) && mc.quarterId === quarterId)
      .reduce((sum, mc) => sum + mc.capacity, 0);
    
    return totalCapacity;
  };

  const getMemberCapacity = (memberId: string, quarterId: string) => {
    const capacity = memberCapacities.find(mc => mc.memberId === memberId && mc.quarterId === quarterId);
    return capacity?.capacity || 0;
  };

  const getTaskRoleCapacity = (taskId: string, roleId: string) => {
    // Получаем реальный ID задачи (убираем суффикс варианта если есть)
    const realTaskId = taskId.split('-variant-')[0];
    const capacity = taskRoleCapacities.find(trc => trc.taskId === realTaskId && trc.roleId === roleId);
    return capacity?.capacity || 0;
  };

  // Task handlers
  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> => {
    try {
      const newTask = await tasksService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      return null;
    }
  };

  const handleTaskEdit = async (task: Task) => {
    try {
      const updatedTask = await tasksService.update(task);
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }
  };

  const handleTaskDelete = async (taskIds: string[]) => {
    try {
      // Получаем реальные ID задач (убираем суффикс варианта если есть)
      const realTaskIds = taskIds.map(id => id.split('-variant-')[0]);
      
      await tasksService.delete(realTaskIds);
      setTasks(prev => prev.filter(task => !realTaskIds.includes(task.id)));
      // Также удаляем capacity записи для удаленных задач
      setTaskRoleCapacities(prev => prev.filter(trc => !realTaskIds.includes(trc.taskId)));
    } catch (error) {
      console.error('Ошибка удаления задач:', error);
    }
  };

  // Task role capacity handlers
  const handleTaskRoleCapacitySave = async (taskId: string, roleId: string, capacity: number) => {
    try {
      const result = await taskRoleCapacitiesService.upsert(taskId, roleId, capacity);
      setTaskRoleCapacities(prev => {
        const existing = prev.find(trc => trc.taskId === taskId && trc.roleId === roleId);
        if (existing) {
          return prev.map(trc => 
            trc.taskId === taskId && trc.roleId === roleId ? result : trc
          );
        } else {
          return [...prev, result];
        }
      });
    } catch (error) {
      console.error('Ошибка сохранения capacity для роли задачи:', error);
    }
  };

  // Team handlers
  const handleTeamSave = async (teamData: Omit<Team, 'id'>) => {
    try {
      const newTeam = await teamsService.create(teamData);
      setTeams(prev => [...prev, newTeam]);
    } catch (error) {
      console.error('Ошибка создания команды:', error);
    }
  };

  const handleTeamEdit = async (team: Team) => {
    try {
      const updatedTeam = await teamsService.update(team);
      setTeams(prev => prev.map(t => t.id === team.id ? updatedTeam : t));
    } catch (error) {
      console.error('Ошибка обновления команды:', error);
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    // Check if team has members
    const hasMembers = teamMembers.some(member => member.teamId === teamId);
    if (hasMembers) {
      alert('Нельзя удалить команду, в которой есть участники');
      return;
    }
    try {
      await teamsService.delete(teamId);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (error) {
      console.error('Ошибка удаления команды:', error);
    }
  };

  // Quarter handlers
  const handleQuarterSave = async (quarterData: Omit<Quarter, 'id' | 'createdAt'>) => {
    try {
      const newQuarter = await quartersService.create(quarterData);
      setQuarters(prev => [...prev, newQuarter]);
    } catch (error) {
      console.error('Ошибка создания квартала:', error);
    }
  };

  const handleQuarterEdit = async (quarter: Quarter) => {
    try {
      const updatedQuarter = await quartersService.update(quarter);
      setQuarters(prev => prev.map(q => q.id === quarter.id ? updatedQuarter : q));
    } catch (error) {
      console.error('Ошибка обновления квартала:', error);
    }
  };

  // Role handlers
  const handleRoleSave = async (roleData: Omit<Role, 'id' | 'createdAt'>) => {
    try {
      const newRole = await rolesService.create(roleData);
      setRoles(prev => [...prev, newRole]);
    } catch (error) {
      console.error('Ошибка создания роли:', error);
    }
  };

  const handleRoleEdit = async (role: Role) => {
    try {
      const updatedRole = await rolesService.update(role);
      setRoles(prev => prev.map(r => r.id === role.id ? updatedRole : r));
    } catch (error) {
      console.error('Ошибка обновления роли:', error);
    }
  };

  const handleRoleDelete = async (roleId: string) => {
    // Check if role is used by team members
    const isRoleInUse = teamMembers.some(member => member.roleId === roleId);
    if (isRoleInUse) {
      alert('Нельзя удалить роль, которая используется участниками команды');
      return;
    }
    try {
      await rolesService.delete(roleId);
      setRoles(prev => prev.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Ошибка удаления роли:', error);
    }
  };

  // Team member handlers
  const handleMemberSave = async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMember = await teamMembersService.create(memberData);
      setTeamMembers(prev => [...prev, newMember]);
      
      // Создать capacity записи для нового участника
      await createMemberCapacitiesForNewMember(newMember.id);
    } catch (error) {
      console.error('Ошибка создания участника команды:', error);
    }
  };

  const handleMemberEdit = async (member: TeamMember) => {
    try {
      const updatedMember = await teamMembersService.update(member);
      setTeamMembers(prev => prev.map(m => m.id === member.id ? updatedMember : m));
    } catch (error) {
      console.error('Ошибка обновления участника команды:', error);
    }
  };

  const handleMemberDelete = async (memberId: string) => {
    try {
      await teamMembersService.delete(memberId);
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      // Также удаляем capacity записи для этого участника
      setMemberCapacities(prev => prev.filter(mc => mc.memberId !== memberId));
    } catch (error) {
      console.error('Ошибка удаления участника команды:', error);
    }
  };

  // Member capacity handlers
  const handleMemberCapacitySave = async (memberId: string, quarterId: string, capacity: number) => {
    try {
      const result = await memberCapacitiesService.upsert(memberId, quarterId, capacity);
      setMemberCapacities(prev => {
        const existing = prev.find(mc => mc.memberId === memberId && mc.quarterId === quarterId);
        if (existing) {
          return prev.map(mc => 
            mc.memberId === memberId && mc.quarterId === quarterId ? result : mc
          );
        } else {
          return [...prev, result];
        }
      });
    } catch (error) {
      console.error('Ошибка сохранения capacity участника:', error);
    }
  };

  // Создать capacity записи для нового участника
  const createMemberCapacitiesForNewMember = async (memberId: string) => {
    try {
      const newCapacities: MemberCapacity[] = [];
      for (const quarter of quarters) {
        const capacity = await memberCapacitiesService.upsert(memberId, quarter.id, 2);
        newCapacities.push(capacity);
      }
      setMemberCapacities(prev => [...prev, ...newCapacities]);
    } catch (error) {
      console.error('Ошибка создания capacity для нового участника:', error);
    }
  };

  // Team capacity handlers (deprecated, kept for backwards compatibility)
  const handleTeamCapacitySave = async (teamId: string, quarterId: string, capacity: number) => {
    try {
      const result = await teamCapacitiesService.upsert(teamId, quarterId, capacity);
      setTeamCapacities(prev => {
        const existing = prev.find(tc => tc.teamId === teamId && tc.quarterId === quarterId);
        if (existing) {
          return prev.map(tc => 
            tc.teamId === teamId && tc.quarterId === quarterId ? result : tc
          );
        } else {
          return [...prev, result];
        }
      });
    } catch (error) {
      console.error('Ошибка сохранения capacity команды:', error);
    }
  };

  // Plan variant handlers
  const handlePlanVariantSave = async (variantData: Omit<PlanVariant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVariant = await planVariantsService.create(variantData);
      setPlanVariants(prev => [...prev, newVariant]);
    } catch (error) {
      console.error('Ошибка создания варианта плана:', error);
    }
  };

  const handlePlanVariantEdit = async (variant: PlanVariant) => {
    try {
      const updatedVariant = await planVariantsService.update(variant);
      setPlanVariants(prev => prev.map(v => v.id === variant.id ? updatedVariant : v));
    } catch (error) {
      console.error('Ошибка обновления варианта плана:', error);
    }
  };

  const handlePlanVariantDelete = async (variantId: string) => {
    try {
      await planVariantsService.delete(variantId);
      setPlanVariants(prev => prev.filter(v => v.id !== variantId));
      
      // Также обновляем задачи, убирая привязку к удаленному варианту
      const tasksToUpdate = tasks.filter(task => task.planVariantId === variantId);
      for (const task of tasksToUpdate) {
        const updatedTask = { ...task, planVariantId: undefined };
        await tasksService.update(updatedTask);
      }
      
      setTasks(prev => prev.map(task => 
        task.planVariantId === variantId 
          ? { ...task, planVariantId: undefined, updatedAt: new Date() }
          : task
      ));
    } catch (error) {
      console.error('Ошибка удаления варианта плана:', error);
    }
  };

  const handleSetMainVariant = async (variantId: string) => {
    const variant = planVariants.find(v => v.id === variantId);
    if (!variant) return;

    try {
      // Обновляем все варианты в той же категории (команда-квартал-режим)
      const variantsToUpdate = planVariants.filter(v => 
        v.teamId === variant.teamId && 
        v.quarterId === variant.quarterId && 
        v.isExpress === variant.isExpress
      );

      for (const v of variantsToUpdate) {
        const updatedVariant = { ...v, isMain: v.id === variantId };
        await planVariantsService.update(updatedVariant);
      }

      setPlanVariants(prev => prev.map(v => {
        if (v.teamId === variant.teamId && v.quarterId === variant.quarterId && v.isExpress === variant.isExpress) {
          return { ...v, isMain: v.id === variantId, updatedAt: new Date() };
        }
        return v;
      }));
    } catch (error) {
      console.error('Ошибка установки основного варианта:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1">
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <Target className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">QPlan</h1>
                </div>
                
                {/* Фильтры и переключатель режимов */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Команда:</span>
                  <Select
                    value={selectedTeamId}
                    onValueChange={setSelectedTeamId}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Выберите команду" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            {team.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <span className="text-sm text-muted-foreground">Квартал:</span>
                  <Select
                    value={selectedQuarterId}
                    onValueChange={setSelectedQuarterId}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Выберите квартал" />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map(quarter => (
                        <SelectItem key={quarter.id} value={quarter.id}>
                          {quarter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Переключатель вкладок */}
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('express')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === 'express'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Экспресс
                    </button>
                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === 'detailed'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Детально
                    </button>
                  </div>
                  
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Задача
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main>
            <Routes>
              <Route 
                path="/" 
                element={
                  <TasksPage
                    tasks={tasks}
                    teams={teams}
                    quarters={quarters}
                    roles={roles}
                    teamCapacities={teamCapacities}
                    taskRoleCapacities={taskRoleCapacities}
                    teamMembers={teamMembers}
                    memberCapacities={memberCapacities}
                    planVariants={planVariants}
                    selectedQuarterId={selectedQuarterId}
                    selectedTeamId={selectedTeamId}
                    viewMode={viewMode}
                    onTaskSave={handleTaskSave}
                    onTaskEdit={handleTaskEdit}
                    onTaskDelete={handleTaskDelete}
                    onTaskRoleCapacitySave={handleTaskRoleCapacitySave}
                    onTeamCapacitySave={handleTeamCapacitySave}
                    onPlanVariantSave={handlePlanVariantSave}
                    onPlanVariantEdit={handlePlanVariantEdit}
                    onPlanVariantDelete={handlePlanVariantDelete}
                    onSetMainVariant={handleSetMainVariant}
                    getTeamById={getTeamById}
                    getQuarterById={getQuarterById}
                    getTeamCapacity={getTeamCapacity}
                    getTaskRoleCapacity={getTaskRoleCapacity}
                  />
                } 
              />
              
              <Route 
                path="/teams" 
                element={
                  <TeamsPage
                    teams={teams}
                    roles={roles}
                    teamMembers={teamMembers}
                    quarters={quarters}
                    teamCapacities={teamCapacities}
                    memberCapacities={memberCapacities}
                    onTeamSave={handleTeamSave}
                    onTeamEdit={handleTeamEdit}
                    onTeamDelete={handleTeamDelete}
                    onRoleSave={handleRoleSave}
                    onRoleEdit={handleRoleEdit}
                    onRoleDelete={handleRoleDelete}
                    onMemberSave={handleMemberSave}
                    onMemberEdit={handleMemberEdit}
                    onMemberDelete={handleMemberDelete}
                    onQuarterSave={handleQuarterSave}
                    onQuarterEdit={handleQuarterEdit}
                    onTeamCapacitySave={handleTeamCapacitySave}
                    onMemberCapacitySave={handleMemberCapacitySave}
                    getRoleById={getRoleById}
                    getTeamCapacity={getTeamCapacity}
                    getMemberCapacity={getMemberCapacity}
                  />
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
