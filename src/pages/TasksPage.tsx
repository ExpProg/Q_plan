import { useState, useMemo, useEffect } from 'react';
import { Plus, Target, Calendar, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

import { TaskDialog } from '../components/TaskDialog';
import { PlanVariantDialog } from '../components/PlanVariantDialog';
import { TeamCapacityDialog } from '../components/TeamCapacityDialog';
import { DraggableTasksTable } from '../components/DraggableTasksTable';
import { CustomDragOverlay } from '../components/DragOverlay';
import type { Task, Team, Quarter, TeamCapacity, Role, TaskRoleCapacity, TeamMember, MemberCapacity, PlanVariant } from '../types';

interface TasksPageProps {
  tasks: Task[];
  teams: Team[];
  quarters: Quarter[];
  roles: Role[];
  teamCapacities: TeamCapacity[];
  taskRoleCapacities: TaskRoleCapacity[];
  teamMembers: TeamMember[];
  memberCapacities: MemberCapacity[];
  planVariants: PlanVariant[];
  selectedQuarterId: string;
  selectedTeamId: string;
  viewMode: 'express' | 'detailed';
  onTaskSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskIds: string[]) => void;
  onTaskRoleCapacitySave: (taskId: string, roleId: string, capacity: number) => void;
  onTeamCapacitySave: (teamId: string, quarterId: string, capacity: number) => void;
  onPlanVariantSave: (variant: Omit<PlanVariant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onPlanVariantEdit: (variant: PlanVariant) => void;
  onPlanVariantDelete: (variantId: string) => void;
  onSetMainVariant: (variantId: string) => void;
  getTeamById: (teamId: string) => Team | undefined;
  getQuarterById: (quarterId: string) => Quarter | undefined;
  getTeamCapacity: (teamId: string, quarterId: string) => number;
  getTaskRoleCapacity: (taskId: string, roleId: string) => number;
}

export function TasksPage({
  tasks,
  teams,
  quarters,
  roles,
  teamCapacities,
  taskRoleCapacities,
  teamMembers,
  memberCapacities,
  planVariants,
  selectedQuarterId,
  selectedTeamId,
  viewMode,
  onTaskSave,
  onTaskEdit,
  onTaskDelete,
  onTaskRoleCapacitySave,
  onTeamCapacitySave,
  onPlanVariantSave,
  onPlanVariantEdit,
  onPlanVariantDelete,
  onSetMainVariant,
  getTeamById,
  getQuarterById,
  getTeamCapacity,
  getTaskRoleCapacity,
}: TasksPageProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [planVariantDialogOpen, setPlanVariantDialogOpen] = useState(false);
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const [editingTeamCapacity, setEditingTeamCapacity] = useState<Team | undefined>();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [isRoleAnalysisExpanded, setIsRoleAnalysisExpanded] = useState(true);

  // Сбрасываем selectedVariantId при изменении режима планирования, команды или квартала
  useEffect(() => {
    setSelectedVariantId('');
  }, [viewMode, selectedTeamId, selectedQuarterId]);

  // Функция для получения детальной оценки задачи (сумма по всем ролям)
  const getTaskDetailedEstimate = (taskId: string): number => {
    return roles.reduce((sum, role) => sum + getTaskRoleCapacity(taskId, role.id), 0);
  };

  // Функция для получения capacity команды по роли на квартал
  const getTeamRoleCapacity = (teamId: string, roleId: string, quarterId: string): number => {
    // Найти всех участников команды с данной ролью
    const teamMembersWithRole = teamMembers.filter(
      member => member.teamId === teamId && member.roleId === roleId
    );
    
    // Суммировать capacity всех участников с данной ролью за квартал
    return teamMembersWithRole.reduce((sum, member) => {
      const memberCapacity = memberCapacities.find(
        mc => mc.memberId === member.id && mc.quarterId === quarterId
      );
      return sum + (memberCapacity?.capacity || 0);
    }, 0);
  };

  // Получение выбранной команды
  const selectedTeam = useMemo(() => {
    return teams.find(team => team.id === selectedTeamId);
  }, [teams, selectedTeamId]);

  // Получение выбранного квартала
  const selectedQuarter = useMemo(() => {
    return quarters.find(quarter => quarter.id === selectedQuarterId);
  }, [quarters, selectedQuarterId]);

  // Получение вариантов для текущей команды, квартала и режима
  const currentVariants = useMemo(() => {
    return planVariants.filter(
      v => v.teamId === selectedTeamId && v.quarterId === selectedQuarterId && v.isExpress === (viewMode === 'express')
    );
  }, [planVariants, selectedTeamId, selectedQuarterId, viewMode]);

  // Получение основного варианта
  const mainVariant = useMemo(() => {
    return currentVariants.find(v => v.isMain);
  }, [currentVariants]);

  // Получение выбранного варианта
  const selectedVariant = useMemo(() => {
    const result = (() => {
      if (selectedVariantId && currentVariants.find(v => v.id === selectedVariantId)) {
        return currentVariants.find(v => v.id === selectedVariantId);
      }
      return mainVariant || currentVariants[0];
    })();
    

    
    return result;
  }, [currentVariants, selectedVariantId, mainVariant, viewMode, selectedTeamId, selectedQuarterId]);

  const { plannedTasks, backlogTasks } = useMemo(() => {
    if (!selectedVariant) {
      return { plannedTasks: [], backlogTasks: [] };
    }

    // Получаем все базовые задачи для команды (без привязки к варианту или с привязкой к любому варианту)
    const baseTasksForTeam = tasks.filter(task => task.teamId === selectedTeamId);
    
    // Группируем задачи по их базовому ID (без учета варианта)
    const taskGroups = new Map<string, Task[]>();
    
    baseTasksForTeam.forEach(task => {
      // Используем оригинальный ID задачи как ключ группы
      const baseId = task.id.split('-variant-')[0]; // Убираем суффикс варианта если есть
      if (!taskGroups.has(baseId)) {
        taskGroups.set(baseId, []);
      }
      taskGroups.get(baseId)!.push(task);
    });

    const planned: Task[] = [];
    const backlog: Task[] = [];

    // Для каждой группы задач определяем состояние в текущем варианте
    taskGroups.forEach((taskVersions, baseId) => {
      // Ищем версию задачи для текущего варианта
      let taskForVariant = taskVersions.find(t => t.planVariantId === selectedVariant.id);
      
      if (!taskForVariant) {
        // Если нет версии для этого варианта, создаем на основе базовой задачи
        const baseTask = taskVersions.find(t => !t.planVariantId) || taskVersions[0];
        if (baseTask) {
          taskForVariant = {
            ...baseTask,
            id: `${baseTask.id}-variant-${selectedVariant.id}`,
            planVariantId: selectedVariant.id,
            isPlanned: false, // По умолчанию в бэклоге
            quarterId: undefined,
          };
        }
      }

      if (taskForVariant) {
        // Проверяем состояние задачи в этом варианте
        if (taskForVariant.isPlanned && 
            taskForVariant.quarterId === selectedQuarterId) {
          planned.push(taskForVariant);
        } else {
          backlog.push(taskForVariant);
        }
      }
    });
    
    return { plannedTasks: planned, backlogTasks: backlog };
  }, [tasks, selectedQuarterId, selectedTeamId, selectedVariant]);

  // Расчет суммы экспресс-оценок для планируемых задач
  const totalExpressEstimate = useMemo(() => {
    return plannedTasks.reduce((sum, task) => sum + (task.expressEstimate || 0), 0);
  }, [plannedTasks]);

  // Расчет суммы детальных оценок для планируемых задач
  const totalDetailedEstimate = useMemo(() => {
    return plannedTasks.reduce((sum, task) => sum + getTaskDetailedEstimate(task.id), 0);
  }, [plannedTasks, getTaskDetailedEstimate]);

  // Получение capacity для выбранной команды и квартала
  const selectedTeamCapacity = useMemo(() => {
    return getTeamCapacity(selectedTeamId, selectedQuarterId);
  }, [getTeamCapacity, selectedTeamId, selectedQuarterId]);

  // Расчет загруженности по ролям для детального режима
  const roleCapacityAnalysis = useMemo(() => {
    const analysis: Record<string, { used: number; total: number; percentage: number }> = {};
    
    roles.forEach(role => {
      const usedCapacity = plannedTasks.reduce((sum, task) => 
        sum + getTaskRoleCapacity(task.id, role.id), 0
      );
      const totalCapacity = getTeamRoleCapacity(selectedTeamId, role.id, selectedQuarterId);
      analysis[role.id] = {
        used: usedCapacity,
        total: totalCapacity,
        percentage: totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0
      };
    });
    
    return analysis;
  }, [plannedTasks, roles, getTaskRoleCapacity, selectedTeamId, selectedQuarterId, getTeamRoleCapacity]);

  const handleTaskSave = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, roleCapacities: Record<string, number>) => {
    if (editingTask?.id) {
      // Editing existing task
      const updatedTask: Task = {
        ...editingTask,
        ...taskData,
        updatedAt: new Date(),
      };
      onTaskEdit(updatedTask);
      
      // Сохраняем оценки по ролям для существующей задачи
      Object.entries(roleCapacities).forEach(([roleId, capacity]) => {
        onTaskRoleCapacitySave(editingTask.id, roleId, capacity);
      });
    } else {
      // Creating new task
      onTaskSave(taskData);
      
      // Для новой задачи сохраняем оценки по ролям после создания
      // Используем setTimeout, чтобы дать время задаче сохраниться
      setTimeout(() => {
        const newTaskId = tasks.find(t => 
          t.title === taskData.title && 
          t.teamId === taskData.teamId &&
          t.description === taskData.description
        )?.id;
        
        if (newTaskId) {
          Object.entries(roleCapacities).forEach(([roleId, capacity]) => {
            if (capacity > 0) {
              onTaskRoleCapacitySave(newTaskId, roleId, capacity);
            }
          });
        }
      }, 100);
    }
    setEditingTask(undefined);
    setTaskDialogOpen(false);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    onTaskEdit(task);
    setTaskDialogOpen(true);
  };

  const openNewTaskDialog = () => {
    // Создать основной вариант если его нет
    if (currentVariants.length === 0) {
      onPlanVariantSave({
        name: 'Основной',
        quarterId: selectedQuarterId,
        teamId: selectedTeamId,
        isExpress: viewMode === 'express',
        isMain: true,
      });
    }

    setEditingTask({
      id: '',
      title: '',
      description: '',
      teamId: selectedTeamId,
      planVariantId: selectedVariant?.id,
      isPlanned: false,
      impact: 5,
      confidence: 5,
      ease: 5,
      expressEstimate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task);
    setTaskDialogOpen(true);
  };

  const openNewPlannedTaskDialog = () => {
    // Создать основной вариант если его нет
    if (currentVariants.length === 0) {
      onPlanVariantSave({
        name: 'Основной',
        quarterId: selectedQuarterId,
        teamId: selectedTeamId,
        isExpress: viewMode === 'express',
        isMain: true,
      });
    }

    setEditingTask({
      id: '',
      title: '',
      description: '',
      teamId: selectedTeamId,
      quarterId: selectedQuarterId,
      planVariantId: selectedVariant?.id,
      isPlanned: true,
      impact: 5,
      confidence: 5,
      ease: 5,
      expressEstimate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task);
    setTaskDialogOpen(true);
  };

  const openTeamCapacityDialog = () => {
    if (selectedTeam) {
      setEditingTeamCapacity(selectedTeam);
      setCapacityDialogOpen(true);
    }
  };

  const handleDragStart = (event: any) => {
    const activeId = event.active.id as string;
    let task = tasks.find(t => t.id === activeId);
    
    // Если не нашли в оригинальном массиве, ищем среди виртуальных задач
    if (!task) {
      const allVirtualTasks = [...plannedTasks, ...backlogTasks];
      task = allVirtualTasks.find(t => t.id === activeId);
    }
    
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Мы не будем изменять состояние в handleDragOver
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    

    
    if (!over || !selectedVariant) {
      
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Ищем задачу в оригинальном массиве или среди виртуальных задач
    let activeTask = tasks.find(t => t.id === activeId);
    
    // Если не нашли в оригинальном массиве, ищем среди виртуальных задач
    if (!activeTask) {
      const allVirtualTasks = [...plannedTasks, ...backlogTasks];
      activeTask = allVirtualTasks.find(t => t.id === activeId);
    }
    

    
    if (!activeTask) {
      
      setActiveTask(null);
      return;
    }

    // Получаем базовый ID задачи (убираем суффикс варианта)
    const baseTaskId = activeTask.id.split('-variant-')[0];
    const isVirtualTask = activeTask.id.includes('-variant-');

    // Check if we're dropping on a container
    if (overId === 'planned-tasks' || overId === 'backlog-tasks') {
      const isMovingToPlanned = overId === 'planned-tasks';
      

      
      // Создать основной вариант если его нет
      if (currentVariants.length === 0) {
        onPlanVariantSave({
          name: 'Основной',
          quarterId: selectedQuarterId,
          teamId: selectedTeamId,
          isExpress: viewMode === 'express',
          isMain: true,
        });
      }

            // Если это виртуальная задача, обновляем оригинальную задачу
      if (isVirtualTask) {
        // Это виртуальная задача, не создаем новую, а ищем оригинальную
        const originalTask = tasks.find(t => t.id === baseTaskId);
        if (originalTask) {
          // Обновляем оригинальную задачу с новым состоянием для текущего варианта
          const updatedTask = {
            ...originalTask,
            planVariantId: selectedVariant.id,
            isPlanned: isMovingToPlanned,
            quarterId: isMovingToPlanned ? selectedQuarterId : undefined,
            teamId: selectedTeamId,
            updatedAt: new Date()
          };
          onTaskEdit(updatedTask);
        }
      } else {
        // Это реальная задача, обновляем её напрямую
        const updatedTask = {
          ...activeTask,
          planVariantId: selectedVariant.id,
          isPlanned: isMovingToPlanned,
          quarterId: isMovingToPlanned ? selectedQuarterId : undefined,
          teamId: selectedTeamId,
          updatedAt: new Date()
        };
        onTaskEdit(updatedTask);
      }
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      {/* Основное содержимое */}
      <div className="container mx-auto px-4 py-8">

        <div className="space-y-8">
          {/* Планируемые задачи */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-5 w-5 text-primary" />
                    Планируемые задачи
                  </CardTitle>
                  <CardDescription>
                    Задачи, запланированные на определенные кварталы для команды {selectedTeam?.name} в квартале {selectedQuarter?.name}
                  </CardDescription>
                </div>
                <Button 
                  onClick={openNewPlannedTaskDialog} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить задачу
                </Button>
              </div>
            </CardHeader>

            {/* Вкладки вариантов планирования */}
            {selectedTeam && selectedQuarter && (
              <div className="px-6 pt-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Вкладки вариантов */}
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                      {currentVariants.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                            selectedVariant?.id === variant.id
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {variant.name}
                          {variant.isMain && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                          )}
                        </button>
                      ))}
                      
                      {/* Кнопка создания варианта */}
                      <Button
                        onClick={() => setPlanVariantDialogOpen(true)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Кнопка настроек */}
                    <Button
                      onClick={() => setPlanVariantDialogOpen(true)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Информация о выбранном варианте */}
                  {selectedVariant && (
                    <div className="text-sm text-muted-foreground">
                      Вариант: {selectedVariant.name}
                      {selectedVariant.isMain && " (основной)"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о capacity команды */}
            {selectedTeam && selectedQuarter && (
              <div className="px-6 pb-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedTeam.color }}
                        />
                        <span className="font-medium">{selectedTeam.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedQuarter.name}
                      </div>
                    </div>
                    {viewMode === 'express' ? (
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{totalExpressEstimate.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Запланировано (ЭО)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{selectedTeamCapacity}</div>
                          <div className="text-xs text-muted-foreground">Capacity</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${totalExpressEstimate > selectedTeamCapacity ? 'text-destructive' : totalExpressEstimate === selectedTeamCapacity ? 'text-primary' : 'text-muted-foreground'}`}>
                            {((totalExpressEstimate / selectedTeamCapacity) * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Загруженность</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{totalDetailedEstimate.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Запланировано (ДО)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{selectedTeamCapacity}</div>
                          <div className="text-xs text-muted-foreground">Общий Capacity</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${totalDetailedEstimate > selectedTeamCapacity ? 'text-destructive' : totalDetailedEstimate === selectedTeamCapacity ? 'text-primary' : 'text-muted-foreground'}`}>
                            {((totalDetailedEstimate / selectedTeamCapacity) * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Общая загруженность</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Прогресс бар */}
                  <div className="mt-3">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (viewMode === 'express' ? totalExpressEstimate : totalDetailedEstimate) > selectedTeamCapacity 
                            ? 'bg-destructive' 
                            : (viewMode === 'express' ? totalExpressEstimate : totalDetailedEstimate) === selectedTeamCapacity 
                              ? 'bg-primary' 
                              : 'bg-primary/70'
                        }`}
                        style={{ width: `${Math.min(((viewMode === 'express' ? totalExpressEstimate : totalDetailedEstimate) / selectedTeamCapacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Детализация по ролям - отдельный блок только для режима "Детально" */}
            {selectedTeam && selectedQuarter && viewMode === 'detailed' && (
              <div className="px-6 pb-4">
                <button
                  onClick={() => setIsRoleAnalysisExpanded(!isRoleAnalysisExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 hover:text-primary transition-colors"
                >
                  {isRoleAnalysisExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Загруженность по ролям
                </button>
                
                {isRoleAnalysisExpanded && (
                  <div className="flex flex-wrap gap-3 transition-all duration-300 ease-in-out">
                    {roles.map(role => {
                      const analysis = roleCapacityAnalysis[role.id];
                      if (!analysis) return null;
                      
                      return (
                        <div key={role.id} className="bg-muted/40 rounded-lg p-3 min-w-0 flex-1 min-w-[160px]">
                          <div className="text-center">
                            <div className="text-sm font-medium text-foreground mb-2">{role.name}</div>
                            <div className="space-y-1 mb-2">
                              <div className="text-sm text-muted-foreground">
                                Использовано: <span className="font-medium text-foreground">{analysis.used.toFixed(1)}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Доступно: <span className="font-medium text-foreground">{analysis.total.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className={`text-lg font-semibold mb-2 ${
                              analysis.percentage > 100 ? 'text-destructive' : 
                              analysis.percentage > 80 ? 'text-orange-600' : 'text-primary'
                            }`}>
                              {analysis.percentage.toFixed(0)}%
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  analysis.percentage > 100 ? 'bg-destructive' : 
                                  analysis.percentage > 80 ? 'bg-orange-500' : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(analysis.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <CardContent>
              <DraggableTasksTable
                id="planned-tasks"
                tasks={plannedTasks}
                teams={teams}
                quarters={quarters}
                onEdit={handleTaskEdit}
                onDelete={onTaskDelete}
                getTeamById={getTeamById}
                getQuarterById={getQuarterById}
                getTaskDetailedEstimate={getTaskDetailedEstimate}
                viewMode={viewMode}
                emptyMessage={`Нет задач для команды ${teams.find(t => t.id === selectedTeamId)?.name || ''} в квартале ${quarters.find(q => q.id === selectedQuarterId)?.name || ''}`}
              />
            </CardContent>
          </Card>

          {/* Бэклог */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    Бэклог
                  </CardTitle>
                  <CardDescription>
                    Задачи, которые еще не запланированы {selectedVariant ? `в варианте "${selectedVariant.name}"` : ''}
                  </CardDescription>
                </div>
                <Button onClick={openNewTaskDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить задачу
                </Button>
              </div>
            </CardHeader>
            
            {/* Вкладки вариантов планирования для бэклога */}
            {selectedTeam && selectedQuarter && (
              <div className="px-6 pt-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Вкладки вариантов */}
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                      {currentVariants.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                            selectedVariant?.id === variant.id
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {variant.name}
                          {variant.isMain && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                          )}
                        </button>
                      ))}
                      
                      {/* Кнопка создания варианта */}
                      <Button
                        onClick={() => setPlanVariantDialogOpen(true)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Кнопка настроек */}
                    <Button
                      onClick={() => setPlanVariantDialogOpen(true)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Информация о выбранном варианте */}
                  {selectedVariant && (
                    <div className="text-sm text-muted-foreground">
                      Вариант: {selectedVariant.name}
                      {selectedVariant.isMain && " (основной)"}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <CardContent>
              <DraggableTasksTable
                id="backlog-tasks"
                tasks={backlogTasks}
                teams={teams}
                quarters={quarters}
                onEdit={handleTaskEdit}
                onDelete={onTaskDelete}
                getTeamById={getTeamById}
                getQuarterById={getQuarterById}
                getTaskDetailedEstimate={getTaskDetailedEstimate}
                viewMode={viewMode}
                emptyMessage={`Нет задач в бэклоге${selectedVariant ? ` для варианта "${selectedVariant.name}"` : ''}`}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Диалоги */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        teams={teams}
        quarters={quarters}
        roles={roles}
        taskRoleCapacities={taskRoleCapacities}
        onSave={handleTaskSave}
        onRoleCapacitySave={onTaskRoleCapacitySave}
        getTaskRoleCapacity={getTaskRoleCapacity}
      />

      <PlanVariantDialog
        open={planVariantDialogOpen}
        onOpenChange={setPlanVariantDialogOpen}
        variants={planVariants}
        quarterId={selectedQuarterId}
        teamId={selectedTeamId}
        isExpress={viewMode === 'express'}
        onVariantSave={onPlanVariantSave}
        onVariantEdit={onPlanVariantEdit}
        onVariantDelete={onPlanVariantDelete}
        onSetMainVariant={onSetMainVariant}
      />

      <TeamCapacityDialog
        open={capacityDialogOpen}
        onOpenChange={setCapacityDialogOpen}
        team={editingTeamCapacity}
        quarters={quarters}
        getTeamCapacity={getTeamCapacity}
        onSave={onTeamCapacitySave}
      />
      
      <CustomDragOverlay 
        activeTask={activeTask}
        team={activeTask ? getTeamById(activeTask.teamId) : undefined}
        quarter={activeTask?.quarterId ? getQuarterById(activeTask.quarterId) : undefined}
      />
    </DndContext>
  );
} 