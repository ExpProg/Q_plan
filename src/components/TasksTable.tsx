import { useState } from 'react';
import { Edit, Trash2, Calendar, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { Task, Team, Quarter } from '../types';

interface TasksTableProps {
  tasks: Task[];
  teams: Team[];
  quarters: Quarter[];
  onEdit: (task: Task) => void;
  onDelete: (taskIds: string[]) => void;
  getTeamById: (teamId: string) => Team | undefined;
  getQuarterById: (quarterId: string) => Quarter | undefined;
  getTaskDetailedEstimate: (taskId: string) => number;
}

export function TasksTable({ tasks, teams, quarters, onEdit, onDelete, getTeamById, getQuarterById, getTaskDetailedEstimate }: TasksTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const toggleAllTasks = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTasks.size > 0) {
      onDelete(Array.from(selectedTasks));
      setSelectedTasks(new Set());
    }
  };

  const handleSingleDelete = (taskId: string) => {
    onDelete([taskId]);
    setSelectedTasks(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(taskId);
      return newSelection;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {selectedTasks.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            Выбрано: {selectedTasks.size} задач(и)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить выбранные
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={tasks.length > 0 && selectedTasks.size === tasks.length}
                  onCheckedChange={toggleAllTasks}
                  aria-label="Выбрать все"
                />
              </TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Команда</TableHead>
              <TableHead>Квартал</TableHead>
              <TableHead>Экспресс-оценка</TableHead>
              <TableHead>Детальная оценка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Нет задач для отображения
                </TableCell>
              </TableRow>
            ) : (
              tasks.map(task => {
                const team = getTeamById(task.teamId);
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                        aria-label={`Выбрать задачу ${task.title}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {team && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-sm">{team.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.quarterId ? (
                        (() => {
                          const quarter = getQuarterById(task.quarterId);
                          return quarter ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Calendar className="h-3 w-3" />
                              {quarter.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Не найден</span>
                          );
                        })()
                      ) : (
                        <span className="text-muted-foreground text-sm">Не назначен</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.expressEstimate !== undefined ? (
                        <span className="text-sm font-medium">
                          {task.expressEstimate} чел/спр
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Не указано</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const detailedEstimate = getTaskDetailedEstimate(task.id);
                        return detailedEstimate > 0 ? (
                          <span className="text-sm font-medium">
                            {detailedEstimate.toFixed(1)} чел/спр
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Не указано</span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.isPlanned ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                        <Target className="h-3 w-3" />
                        {task.isPlanned ? 'Планируемая' : 'Бэклог'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSingleDelete(task.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 