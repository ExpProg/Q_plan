import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { DraggableTableRow } from './DraggableTableRow';
import { cn } from '../lib/utils';
import type { Task, Team, Quarter } from '../types';

interface DraggableTasksTableProps {
  id: string;
  tasks: Task[];
  teams: Team[];
  quarters: Quarter[];
  onEdit: (task: Task) => void;
  onDelete: (taskIds: string[]) => void;
  getTeamById: (teamId: string) => Team | undefined;
  getQuarterById: (quarterId: string) => Quarter | undefined;
  getTaskDetailedEstimate: (taskId: string) => number;
  viewMode: 'express' | 'detailed';
  emptyMessage?: string;
}

export function DraggableTasksTable({
  id,
  tasks,
  teams,
  quarters,
  onEdit,
  onDelete,
  getTeamById,
  getQuarterById,
  getTaskDetailedEstimate,
  viewMode,
  emptyMessage = "Нет задач для отображения",
}: DraggableTasksTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const { isOver, setNodeRef } = useDroppable({ id });

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

  const taskIds = tasks.map(task => task.id);

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

      <div 
        ref={setNodeRef}
        className={cn(
          "border rounded-lg transition-all duration-300 ease-in-out",
          isOver && "border-primary border-2 bg-primary/5 shadow-lg ring-4 ring-primary/10 scale-[1.02]"
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">
                <div className="flex items-center gap-2">
                  <div className="w-6" /> {/* Space for grip handle */}
                  <Checkbox
                    checked={tasks.length > 0 && selectedTasks.size === tasks.length}
                    onCheckedChange={toggleAllTasks}
                    aria-label="Выбрать все"
                  />
                </div>
              </TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Команда</TableHead>
              <TableHead>Квартал</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[50px] text-center">I</TableHead>
              <TableHead className="w-[50px] text-center">C</TableHead>
              <TableHead className="w-[50px] text-center">E</TableHead>
              <TableHead className="w-[70px] text-center">Score</TableHead>
              {viewMode === 'express' ? (
                <TableHead className="w-[100px] text-center" title="Экспресс-оценка">ЭО</TableHead>
              ) : (
                <TableHead className="w-[100px] text-center" title="Детальная оценка (сумма по ролям)">ДО</TableHead>
              )}
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
                    </div>
                    <p className="text-sm">{emptyMessage}</p>
                    <p className="text-xs text-muted-foreground/60">Перетащите задачи сюда или создайте новую</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                {tasks.map(task => {
                  const team = getTeamById(task.teamId);
                  const quarter = task.quarterId ? getQuarterById(task.quarterId) : undefined;
                  
                  return team ? (
                    <DraggableTableRow
                      key={task.id}
                      task={task}
                      team={team}
                      quarter={quarter}
                      isSelected={selectedTasks.has(task.id)}
                      onToggleSelect={() => toggleTaskSelection(task.id)}
                      onEdit={onEdit}
                      onDelete={handleSingleDelete}
                      getTaskDetailedEstimate={getTaskDetailedEstimate}
                      viewMode={viewMode}
                    />
                  ) : null;
                })}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 