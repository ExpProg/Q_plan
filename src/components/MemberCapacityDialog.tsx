import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { TeamMember, Quarter } from '../types';

interface MemberCapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  quarters: Quarter[];
  getMemberCapacity: (memberId: string, quarterId: string) => number;
  onSave: (memberId: string, quarterId: string, capacity: number) => void;
}

export function MemberCapacityDialog({
  open,
  onOpenChange,
  member,
  quarters,
  getMemberCapacity,
  onSave,
}: MemberCapacityDialogProps) {
  const [capacities, setCapacities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (member && open) {
      const initialCapacities: Record<string, number> = {};
      quarters.forEach(quarter => {
        initialCapacities[quarter.id] = getMemberCapacity(member.id, quarter.id);
      });
      setCapacities(initialCapacities);
    }
  }, [member, quarters, getMemberCapacity, open]);

  const handleCapacityChange = (quarterId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCapacities(prev => ({
      ...prev,
      [quarterId]: Math.max(0, numValue)
    }));
  };

  const handleSave = () => {
    if (!member) return;

    // Сохраняем capacity для каждого квартала
    quarters.forEach(quarter => {
      const capacity = capacities[quarter.id] || 0;
      onSave(member.id, quarter.id, capacity);
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!member) return null;

  const totalCapacity = quarters.reduce((sum, quarter) => (capacities[quarter.id] || 0) + sum, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление capacity участника</DialogTitle>
          <DialogDescription>
            Настройте capacity участника "{member.name}" для каждого квартала
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">{member.name}</div>
              {member.email && (
                <div className="text-sm text-muted-foreground">{member.email}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">{totalCapacity}</div>
              <div className="text-xs text-muted-foreground">Общий capacity</div>
            </div>
          </div>

          <div className="grid gap-3">
            {quarters.map(quarter => (
              <div key={quarter.id} className="flex items-center gap-3">
                <Label htmlFor={`capacity-${quarter.id}`} className="w-16 text-sm">
                  {quarter.name}
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
                    className="text-center w-16 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">чел/спр</span>
                </div>
              </div>
            ))}
          </div>
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