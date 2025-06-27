import { DragOverlay } from '@dnd-kit/core';
import { Edit, Trash2, Calendar, Target, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { TableCell, TableRow } from './ui/table';
import type { Task, Team, Quarter } from '../types';

interface CustomDragOverlayProps {
  activeTask: Task | null;
  team?: Team;
  quarter?: Quarter;
}

export function CustomDragOverlay({ activeTask, team, quarter }: CustomDragOverlayProps) {
  if (!activeTask || !team) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <DragOverlay>
      <div className="bg-background shadow-2xl ring-2 ring-primary/30 rounded-lg overflow-hidden border-2 border-primary/20 rotate-2 scale-105">
        <table className="w-full">
          <tbody>
            <TableRow className="bg-background">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="p-1 text-primary">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Checkbox
                    checked={false}
                    disabled
                    aria-label="Disabled checkbox"
                  />
                </div>
              </TableCell>
              <TableCell className="min-w-[200px] max-w-[300px]">
                <div>
                  <div className="font-medium">{activeTask.title}</div>
                  {activeTask.description && (
                    <div className="text-sm text-muted-foreground truncate mt-1">
                      {activeTask.description}
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
                <Badge variant={activeTask.isPlanned ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                  <Target className="h-3 w-3" />
                  {activeTask.isPlanned ? 'Планируемая' : 'Бэклог'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {activeTask.impact}
              </TableCell>
              <TableCell className="text-center">
                {activeTask.confidence}
              </TableCell>
              <TableCell className="text-center">
                {activeTask.ease}
              </TableCell>
              <TableCell className="text-center font-semibold">
                {activeTask.impact * activeTask.confidence * activeTask.ease}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-mono">
                  {activeTask.expressEstimate || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      </div>
    </DragOverlay>
  );
} 