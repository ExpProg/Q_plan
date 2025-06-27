import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { TeamMember, Role } from '../types';

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  teamId: string;
  roles: Role[];
  onSave: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function TeamMemberDialog({ open, onOpenChange, member, teamId, roles, onSave }: TeamMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email || '');
      setRoleId(member.roleId);
    } else {
      setName('');
      setEmail('');
      setRoleId(roles[0]?.id || '');
    }
  }, [member, open, roles]);

  const handleSave = () => {
    if (!name.trim() || !roleId) return;

    onSave({
      name: name.trim(),
      email: email.trim() || undefined,
      teamId,
      roleId,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Редактировать участника' : 'Добавить участника'}
          </DialogTitle>
          <DialogDescription>
            {member 
              ? 'Внесите изменения в данные участника и нажмите "Сохранить".'
              : 'Заполните информацию о новом участнике команды и нажмите "Добавить".'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Имя участника</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя участника"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email (необязательно)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email участника"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Роль</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !roleId}>
            {member ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 