import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Team, Quarter } from '../types';

interface TeamCapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | undefined;
  quarters: Quarter[];
  getTeamCapacity: (teamId: string, quarterId: string) => number;
  onSave: (teamId: string, quarterId: string, capacity: number) => void;
}

export function TeamCapacityDialog({
  open,
  onOpenChange,
  team,
  quarters,
  getTeamCapacity,
  onSave,
}: TeamCapacityDialogProps) {
  const [capacities, setCapacities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (team && open) {
      const initialCapacities: Record<string, number> = {};
      quarters.forEach(quarter => {
        initialCapacities[quarter.id] = getTeamCapacity(team.id, quarter.id);
      });
      setCapacities(initialCapacities);
    }
  }, [team, quarters, getTeamCapacity, open]);

  const handleCapacityChange = (quarterId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCapacities(prev => ({
      ...prev,
      [quarterId]: Math.max(0, numValue)
    }));
  };

  const handleSave = () => {
    if (!team) return;

    // Сохраняем capacity для каждого квартала
    quarters.forEach(quarter => {
      const capacity = capacities[quarter.id] || 0;
      onSave(team.id, quarter.id, capacity);
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление capacity команды</DialogTitle>
          <DialogDescription>
            Настройте capacity команды "{team.name}" для каждого квартала
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            <span className="font-medium">{team.name}</span>
          </div>

          {quarters.map(quarter => (
            <div key={quarter.id} className="space-y-2">
              <Label htmlFor={`capacity-${quarter.id}`}>
                {quarter.name} ({quarter.year} год)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`capacity-${quarter.id}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={capacities[quarter.id] || 0}
                  onChange={(e) => handleCapacityChange(quarter.id, e.target.value)}
                  placeholder="0"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  чел/спр
                </span>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 