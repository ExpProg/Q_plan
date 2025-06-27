import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Task, Team, Quarter, Role, TaskRoleCapacity } from '../types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  teams: Team[];
  quarters: Quarter[];
  roles: Role[];
  taskRoleCapacities: TaskRoleCapacity[];
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, roleCapacities: Record<string, number>) => void;
  onRoleCapacitySave: (taskId: string, roleId: string, capacity: number) => void;
  getTaskRoleCapacity: (taskId: string, roleId: string) => number;
}

export function TaskDialog({ open, onOpenChange, task, teams, quarters, roles, taskRoleCapacities, onSave, onRoleCapacitySave, getTaskRoleCapacity }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [quarterId, setQuarterId] = useState<string>('');
  const [isPlanned, setIsPlanned] = useState(false);
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [ease, setEase] = useState(5);
  const [expressEstimate, setExpressEstimate] = useState<number | undefined>(undefined);
  const [roleCapacities, setRoleCapacities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setTeamId(task.teamId);
      setQuarterId(task.quarterId || 'none');
      setIsPlanned(task.isPlanned);
      setImpact(task.impact);
      setConfidence(task.confidence);
      setEase(task.ease);
      setExpressEstimate(task.expressEstimate);
      
      // Загружаем capacity по ролям для существующей задачи
      const capacities: Record<string, number> = {};
      roles.forEach(role => {
        capacities[role.id] = getTaskRoleCapacity(task.id, role.id);
      });
      setRoleCapacities(capacities);
    } else {
      setTitle('');
      setDescription('');
      setTeamId('');
      setQuarterId('none');
      setIsPlanned(false);
      setImpact(5);
      setConfidence(5);
      setEase(5);
      setExpressEstimate(undefined);
      
      // Инициализируем пустые capacity для новой задачи
      const capacities: Record<string, number> = {};
      roles.forEach(role => {
        capacities[role.id] = 0;
      });
      setRoleCapacities(capacities);
    }
  }, [task, open, roles, getTaskRoleCapacity]);

  const handleSave = () => {
    if (!title.trim() || !teamId) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      teamId,
      quarterId: quarterId === 'none' ? undefined : quarterId,
      isPlanned: isPlanned || quarterId !== 'none',
      impact,
      confidence,
      ease,
      expressEstimate,
    };

    onSave(taskData, roleCapacities);

    // Сохраняем оценки по ролям для существующей задачи
    if (task?.id) {
      Object.entries(roleCapacities).forEach(([roleId, capacity]) => {
        onRoleCapacitySave(task.id, roleId, capacity);
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {task ? 'Редактировать задачу' : 'Добавить задачу'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? 'Внесите изменения в задачу и нажмите "Сохранить".'
              : 'Заполните информацию о новой задаче и нажмите "Добавить".'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-3 py-4">
            {/* Основная информация */}
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="title">Название задачи</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название задачи"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание задачи (необязательно)"
                />
              </div>
            </div>

            {/* Команда и квартал в две колонки */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="team">Команда</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите команду" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quarter">Квартал</Label>
                <Select value={quarterId} onValueChange={(value) => {
                  setQuarterId(value);
                  setIsPlanned(value !== 'none');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите квартал" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не планируется</SelectItem>
                    {quarters.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Экспресс-оценка */}
            <div className="grid gap-2">
              <Label htmlFor="expressEstimate">Экспресс-оценка (чел/спр)</Label>
              <Input
                id="expressEstimate"
                type="number"
                min="0"
                step="0.1"
                value={expressEstimate || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value) || 0;
                  setExpressEstimate(value);
                }}
                placeholder="Не указано"
                className="w-32"
              />
            </div>
            
            {/* Оценка по ролям */}
            <div className="grid gap-2">
              <Label>Оценка по ролям (чел/спр)</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-muted/30">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center gap-2">
                    <Label htmlFor={`role-${role.id}`} className="text-xs min-w-0 flex-1 truncate">
                      {role.name}
                    </Label>
                    <Input
                      id={`role-${role.id}`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={roleCapacities[role.id] || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setRoleCapacities(prev => ({
                          ...prev,
                          [role.id]: Math.max(0, value)
                        }));
                      }}
                      className="w-16 h-7 text-center text-xs"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-right">
                Детальная оценка: <span className="font-medium">{Object.values(roleCapacities).reduce((sum, val) => sum + val, 0).toFixed(1)}</span> чел/спр
              </div>
            </div>

            {/* ICE Score */}
            <div className="grid gap-2">
              <Label>ICE Score</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="impact" className="text-xs">Impact (I)</Label>
                  <Input
                    id="impact"
                    type="number"
                    min="1"
                    max="10"
                    value={impact}
                    onChange={(e) => setImpact(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="h-8 text-center"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="confidence" className="text-xs">Confidence (C)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="1"
                    max="10"
                    value={confidence}
                    onChange={(e) => setConfidence(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="h-8 text-center"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="ease" className="text-xs">Ease (E)</Label>
                  <Input
                    id="ease"
                    type="number"
                    min="1"
                    max="10"
                    value={ease}
                    onChange={(e) => setEase(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="h-8 text-center"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Score: {impact} × {confidence} × {ease} = <span className="font-semibold">{impact * confidence * ease}</span>
              </div>
            </div>
        </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !teamId}>
            {task ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 