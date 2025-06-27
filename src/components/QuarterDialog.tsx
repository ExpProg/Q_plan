import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Quarter } from '../types';

interface QuarterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quarter?: Quarter;
  onSave: (quarter: Omit<Quarter, 'id' | 'createdAt'>) => void;
}

export function QuarterDialog({ open, onOpenChange, quarter, onSave }: QuarterDialogProps) {
  const [name, setName] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear() + 1);
  const [quarterNum, setQuarterNum] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (quarter) {
      setName(quarter.name);
      setYear(quarter.year);
      setQuarterNum(quarter.quarter);
    } else {
      const currentYear = new Date().getFullYear();
      setName('');
      setYear(currentYear + 1);
      setQuarterNum(1);
    }
  }, [quarter, open]);

  useEffect(() => {
    // Auto-generate name when year or quarter changes
    if (!quarter) {
      const yearSuffix = year.toString().slice(-2);
      setName(`Q${quarterNum}'${yearSuffix}`);
    }
  }, [year, quarterNum, quarter]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      year,
      quarter: quarterNum,
    });

    onOpenChange(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {quarter ? 'Редактировать квартал' : 'Добавить квартал'}
          </DialogTitle>
          <DialogDescription>
            {quarter 
              ? 'Внесите изменения в квартал и нажмите "Сохранить".'
              : 'Создайте новый квартал для планирования задач.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quarter-num">Квартал</Label>
            <Select value={quarterNum.toString()} onValueChange={(value) => setQuarterNum(parseInt(value) as 1 | 2 | 3 | 4)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите квартал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1 (январь - март)</SelectItem>
                <SelectItem value="2">Q2 (апрель - июнь)</SelectItem>
                <SelectItem value="3">Q3 (июль - сентябрь)</SelectItem>
                <SelectItem value="4">Q4 (октябрь - декабрь)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Год</Label>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите год" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Название (автоматически)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q1'25"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {quarter ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 