import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Team } from '../types';
import { TEAM_COLORS } from '../types';

interface TeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
  onSave: (team: Omit<Team, 'id'>) => void;
}

export function TeamDialog({ open, onOpenChange, team, onSave }: TeamDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(TEAM_COLORS[0]);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setColor(team.color);
    } else {
      setName('');
      setColor(TEAM_COLORS[0]);
    }
  }, [team, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      color,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {team ? 'Редактировать команду' : 'Добавить команду'}
          </DialogTitle>
          <DialogDescription>
            {team 
              ? 'Внесите изменения в команду и нажмите "Сохранить".'
              : 'Заполните информацию о новой команде и нажмите "Добавить".'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Название команды</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название команды"
            />
          </div>

          <div className="grid gap-2">
            <Label>Цвет команды</Label>
            <div className="flex gap-2 flex-wrap">
              {TEAM_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {team ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 