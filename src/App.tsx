import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Plus, Target, Menu } from 'lucide-react';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Sidebar } from './components/Sidebar';
import { TasksPage } from './pages/TasksPage';
import { TeamsPage } from './pages/TeamsPage';
import type { Task, Team, Quarter, Role, TeamMember, TeamCapacity, MemberCapacity, TaskRoleCapacity, PlanVariant } from './types';
import { TEAM_COLORS, DEFAULT_QUARTERS } from './types';

function App() {
  // Initialize quarters first
  const [quarters, setQuarters] = useState<Quarter[]>(() => {
    return DEFAULT_QUARTERS.map((quarter, index) => ({
      ...quarter,
      id: (index + 1).toString(),
      createdAt: new Date(),
    }));
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Внедрить систему аутентификации',
      description: 'Разработать и интегрировать OAuth 2.0',
      teamId: '1',
      quarterId: '1', // Q1'25
      planVariantId: '1', // Основной вариант
      isPlanned: true,
      impact: 9,
      confidence: 7,
      ease: 5,
      expressEstimate: 2.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Оптимизировать базу данных',
      description: 'Провести анализ и оптимизацию запросов',
      teamId: '2',
      isPlanned: false,
      impact: 8,
      confidence: 8,
      ease: 6,
      expressEstimate: 1.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Frontend', color: TEAM_COLORS[0] },
    { id: '2', name: 'Backend', color: TEAM_COLORS[1] },
    { id: '3', name: 'DevOps', color: TEAM_COLORS[2] },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Frontend Developer', description: 'Разработчик пользовательского интерфейса', createdAt: new Date() },
    { id: '2', name: 'Backend Developer', description: 'Разработчик серверной части', createdAt: new Date() },
    { id: '3', name: 'DevOps Engineer', description: 'Инженер по эксплуатации', createdAt: new Date() },
    { id: '4', name: 'Team Lead', description: 'Руководитель команды', createdAt: new Date() },
    { id: '5', name: 'QA Engineer', description: 'Инженер по тестированию', createdAt: new Date() },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Анна Иванова', email: 'anna@example.com', teamId: '1', roleId: '1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Сергей Петров', email: 'sergey@example.com', teamId: '1', roleId: '4', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Елена Сидорова', email: 'elena@example.com', teamId: '2', roleId: '2', createdAt: new Date(), updatedAt: new Date() },
    { id: '4', name: 'Михаил Козлов', email: 'mikhail@example.com', teamId: '3', roleId: '3', createdAt: new Date(), updatedAt: new Date() },
  ]);

  // Initialize member capacities for all members and quarters
  const [memberCapacities, setMemberCapacities] = useState<MemberCapacity[]>(() => {
    const capacities: MemberCapacity[] = [];
    const defaultMemberCapacity = 2; // Дефолтное capacity участника: 2 человеко-спринта за квартал
    
    // Create capacity entries for each member and quarter combination
    ['1', '2', '3', '4'].forEach(memberId => {
      ['1', '2', '3', '4'].forEach(quarterId => {
        capacities.push({
          id: `${memberId}-${quarterId}`,
          memberId,
          quarterId,
          capacity: defaultMemberCapacity,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });
    
    return capacities;
  });

  // Keep team capacities for backwards compatibility (will be deprecated)
  const [teamCapacities, setTeamCapacities] = useState<TeamCapacity[]>(() => {
    const capacities: TeamCapacity[] = [];
    const defaultCapacities = { '1': 8, '2': 10, '3': 6 }; // Frontend: 8, Backend: 10, DevOps: 6
    
    // Create capacity entries for each team and quarter combination
    ['1', '2', '3'].forEach(teamId => {
      ['1', '2', '3', '4'].forEach(quarterId => {
        capacities.push({
          id: `${teamId}-${quarterId}`,
          teamId,
          quarterId,
          capacity: defaultCapacities[teamId as keyof typeof defaultCapacities] || 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });
    
    return capacities;
  });

  const [taskRoleCapacities, setTaskRoleCapacities] = useState<TaskRoleCapacity[]>([
    // Для задачи "1" (OAuth интеграция) в команде Frontend
    { id: '1-1', taskId: '1', roleId: '1', capacity: 1.5, createdAt: new Date(), updatedAt: new Date() }, // Frontend Developer
    { id: '1-4', taskId: '1', roleId: '4', capacity: 0.5, createdAt: new Date(), updatedAt: new Date() }, // Team Lead
  ]);

  const [planVariants, setPlanVariants] = useState<PlanVariant[]>(() => {
    const variants: PlanVariant[] = [];
    let idCounter = 1;

    // Создаем основные варианты для всех сочетаний команда-квартал в обоих режимах
    ['1', '2', '3'].forEach(teamId => {
      ['1', '2', '3', '4'].forEach(quarterId => {
        // Экспресс-вариант
        variants.push({
          id: (idCounter++).toString(),
          name: 'Основной',
          quarterId,
          teamId,
          isExpress: true,
          isMain: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Детальный вариант
        variants.push({
          id: (idCounter++).toString(),
          name: 'Основной',
          quarterId,
          teamId,
          isExpress: false,
          isMain: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });

    return variants;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Состояние для фильтров (перенесено из TasksPage)
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>(quarters[0]?.id || '');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [viewMode, setViewMode] = useState<'express' | 'detailed'>('express');

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
    const capacity = taskRoleCapacities.find(trc => trc.taskId === taskId && trc.roleId === roleId);
    return capacity?.capacity || 0;
  };

  // Task handlers
  const handleTaskSave = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleTaskEdit = (task: Task) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id 
        ? { ...task, updatedAt: new Date() }
        : t
    ));
  };

  const handleTaskDelete = (taskIds: string[]) => {
    setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
    // Также удаляем capacity записи для удаленных задач
    setTaskRoleCapacities(prev => prev.filter(trc => !taskIds.includes(trc.taskId)));
  };

  // Task role capacity handlers
  const handleTaskRoleCapacitySave = (taskId: string, roleId: string, capacity: number) => {
    setTaskRoleCapacities(prev => {
      const existing = prev.find(trc => trc.taskId === taskId && trc.roleId === roleId);
      if (existing) {
        return prev.map(trc => 
          trc.taskId === taskId && trc.roleId === roleId
            ? { ...trc, capacity, updatedAt: new Date() }
            : trc
        );
      } else {
        return [...prev, {
          id: `${taskId}-${roleId}`,
          taskId,
          roleId,
          capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
      }
    });
  };

  // Team handlers
  const handleTeamSave = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: Date.now().toString(),
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const handleTeamEdit = (team: Team) => {
    setTeams(prev => prev.map(t => 
      t.id === team.id ? team : t
    ));
  };

  const handleTeamDelete = (teamId: string) => {
    // Check if team has members
    const hasMembers = teamMembers.some(member => member.teamId === teamId);
    if (hasMembers) {
      alert('Нельзя удалить команду, в которой есть участники');
      return;
    }
    setTeams(prev => prev.filter(team => team.id !== teamId));
  };

  // Quarter handlers
  const handleQuarterSave = (quarterData: Omit<Quarter, 'id' | 'createdAt'>) => {
    const newQuarter: Quarter = {
      ...quarterData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setQuarters(prev => [...prev, newQuarter]);
  };

  const handleQuarterEdit = (quarter: Quarter) => {
    setQuarters(prev => prev.map(q => 
      q.id === quarter.id ? quarter : q
    ));
  };

  // Role handlers
  const handleRoleSave = (roleData: Omit<Role, 'id' | 'createdAt'>) => {
    const newRole: Role = {
      ...roleData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setRoles(prev => [...prev, newRole]);
  };

  const handleRoleEdit = (role: Role) => {
    setRoles(prev => prev.map(r => 
      r.id === role.id ? role : r
    ));
  };

  const handleRoleDelete = (roleId: string) => {
    // Check if role is used by team members
    const isRoleInUse = teamMembers.some(member => member.roleId === roleId);
    if (isRoleInUse) {
      alert('Нельзя удалить роль, которая используется участниками команды');
      return;
    }
    setRoles(prev => prev.filter(role => role.id !== roleId));
  };

  // Team member handlers
  const handleMemberSave = (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTeamMembers(prev => [...prev, newMember]);
    
    // Создать capacity записи для нового участника
    createMemberCapacitiesForNewMember(newMember.id);
  };

  const handleMemberEdit = (member: TeamMember) => {
    setTeamMembers(prev => prev.map(m => 
      m.id === member.id 
        ? { ...member, updatedAt: new Date() }
        : m
    ));
  };

  const handleMemberDelete = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    // Также удаляем capacity записи для этого участника
    setMemberCapacities(prev => prev.filter(mc => mc.memberId !== memberId));
  };

  // Member capacity handlers
  const handleMemberCapacitySave = (memberId: string, quarterId: string, capacity: number) => {
    setMemberCapacities(prev => {
      const existing = prev.find(mc => mc.memberId === memberId && mc.quarterId === quarterId);
      if (existing) {
        return prev.map(mc => 
          mc.memberId === memberId && mc.quarterId === quarterId
            ? { ...mc, capacity, updatedAt: new Date() }
            : mc
        );
      } else {
        return [...prev, {
          id: `${memberId}-${quarterId}`,
          memberId,
          quarterId,
          capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
      }
    });
  };

  // Создать capacity записи для нового участника
  const createMemberCapacitiesForNewMember = (memberId: string) => {
    const newCapacities: MemberCapacity[] = [];
    quarters.forEach(quarter => {
      newCapacities.push({
        id: `${memberId}-${quarter.id}`,
        memberId,
        quarterId: quarter.id,
        capacity: 2, // Дефолтное значение
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    setMemberCapacities(prev => [...prev, ...newCapacities]);
  };

  // Team capacity handlers (deprecated, kept for backwards compatibility)
  const handleTeamCapacitySave = (teamId: string, quarterId: string, capacity: number) => {
    setTeamCapacities(prev => {
      const existing = prev.find(tc => tc.teamId === teamId && tc.quarterId === quarterId);
      if (existing) {
        return prev.map(tc => 
          tc.teamId === teamId && tc.quarterId === quarterId
            ? { ...tc, capacity, updatedAt: new Date() }
            : tc
        );
      } else {
        return [...prev, {
          id: `${teamId}-${quarterId}`,
          teamId,
          quarterId,
          capacity,
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
      }
    });
  };

  // Plan variant handlers
  const handlePlanVariantSave = (variantData: Omit<PlanVariant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVariant: PlanVariant = {
      ...variantData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPlanVariants(prev => [...prev, newVariant]);
  };

  const handlePlanVariantEdit = (variant: PlanVariant) => {
    setPlanVariants(prev => prev.map(v => 
      v.id === variant.id 
        ? { ...variant, updatedAt: new Date() }
        : v
    ));
  };

  const handlePlanVariantDelete = (variantId: string) => {
    setPlanVariants(prev => prev.filter(v => v.id !== variantId));
    // Также удаляем привязку задач к этому варианту
    setTasks(prev => prev.map(task => 
      task.planVariantId === variantId 
        ? { ...task, planVariantId: undefined, updatedAt: new Date() }
        : task
    ));
  };

  const handleSetMainVariant = (variantId: string) => {
    const variant = planVariants.find(v => v.id === variantId);
    if (!variant) return;

    setPlanVariants(prev => prev.map(v => {
      if (v.teamId === variant.teamId && v.quarterId === variant.quarterId && v.isExpress === variant.isExpress) {
        return { ...v, isMain: v.id === variantId, updatedAt: new Date() };
      }
      return v;
    }));
  };

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
