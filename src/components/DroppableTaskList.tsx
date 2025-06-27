import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../lib/utils';
import { DraggableTaskCard } from './DraggableTaskCard';
import type { Task, Team, Quarter } from '../types';

interface DroppableTaskListProps {
  id: string;
  tasks: Task[];
  teams: Team[];
  quarters: Quarter[];
  getTeamById: (teamId: string) => Team | undefined;
  getQuarterById: (quarterId: string) => Quarter | undefined;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  emptyMessage: string;
}

export function DroppableTaskList({
  id,
  tasks,
  teams,
  quarters,
  getTeamById,
  getQuarterById,
  onEdit,
  onDelete,
  emptyMessage,
}: DroppableTaskListProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        tasks.length === 0 && "flex items-center justify-center"
      )}
    >
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-center">
          {emptyMessage}
        </p>
      ) : (
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {tasks.map(task => {
              const team = getTeamById(task.teamId);
              const quarter = task.quarterId ? getQuarterById(task.quarterId) : undefined;
              return team ? (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  team={team}
                  quarter={quarter}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ) : null;
            })}
          </div>
        </SortableContext>
      )}
    </div>
  );
} 