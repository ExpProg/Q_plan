import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, Calendar, Target, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { TableCell, TableRow } from './ui/table';
import type { Task, Team, Quarter } from '../types';

interface DraggableTableRowProps {
  task: Task;
  team: Team;
  quarter?: Quarter;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  getTaskDetailedEstimate: (taskId: string) => number;
  viewMode: 'express' | 'detailed';
}

export function DraggableTableRow({
  task,
  team,
  quarter,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  getTaskDetailedEstimate,
  viewMode,
}: DraggableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition || 'transform 200ms ease',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect();
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-background shadow-lg ring-2 ring-primary/20 scale-105" : "hover:bg-muted/50 transition-colors duration-150"}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-all duration-150 hover:scale-110"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            onClick={handleCheckboxChange}
            aria-label={`Выбрать задачу ${task.title}`}
          />
        </div>
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
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: team.color }}
          />
          <span className="text-sm">{team.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {quarter ? (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <Calendar className="h-3 w-3" />
            {quarter.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Не назначен</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={task.isPlanned ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
          <Target className="h-3 w-3" />
          {task.isPlanned ? 'Планируемая' : 'Бэклог'}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        {task.impact}
      </TableCell>
      <TableCell className="text-center">
        {task.confidence}
      </TableCell>
      <TableCell className="text-center">
        {task.ease}
      </TableCell>
      <TableCell className="text-center font-semibold">
        {task.impact * task.confidence * task.ease}
      </TableCell>
      <TableCell className="text-center">
        {viewMode === 'express' ? (
          task.expressEstimate !== undefined ? (
            <Badge variant="outline" className="font-mono">
              {task.expressEstimate.toFixed(1)}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )
        ) : (
          (() => {
            const detailedEstimate = getTaskDetailedEstimate(task.id);
            return detailedEstimate > 0 ? (
              <Badge variant="outline" className="font-mono">
                {detailedEstimate.toFixed(1)}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">—</span>
            );
          })()
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
} 