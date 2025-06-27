import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Crown } from 'lucide-react';
import type { PlanVariant } from '../types';

interface PlanVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variants: PlanVariant[];
  quarterId: string;
  teamId: string;
  isExpress: boolean;
  onVariantSave: (variant: Omit<PlanVariant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onVariantEdit: (variant: PlanVariant) => void;
  onVariantDelete: (variantId: string) => void;
  onSetMainVariant: (variantId: string) => void;
}

export function PlanVariantDialog({
  open,
  onOpenChange,
  variants,
  quarterId,
  teamId,
  isExpress,
  onVariantSave,
  onVariantEdit,
  onVariantDelete,
  onSetMainVariant,
}: PlanVariantDialogProps) {
  const [newVariantName, setNewVariantName] = useState('');
  const [editingVariant, setEditingVariant] = useState<PlanVariant | null>(null);
  const [editName, setEditName] = useState('');

  // Фильтрация вариантов по команде, кварталу и типу планирования
  const currentVariants = variants.filter(
    v => v.teamId === teamId && v.quarterId === quarterId && v.isExpress === isExpress
  );

  const mainVariant = currentVariants.find(v => v.isMain);

  const handleCreateVariant = () => {
    if (newVariantName.trim()) {
      onVariantSave({
        name: newVariantName.trim(),
        quarterId,
        teamId,
        isExpress,
        isMain: currentVariants.length === 0, // Первый вариант становится основным
      });
      setNewVariantName('');
    }
  };

  const handleEditVariant = (variant: PlanVariant) => {
    setEditingVariant(variant);
    setEditName(variant.name);
  };

  const handleSaveEdit = () => {
    if (editingVariant && editName.trim()) {
      onVariantEdit({
        ...editingVariant,
        name: editName.trim(),
        updatedAt: new Date(),
      });
      setEditingVariant(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
    setEditName('');
  };

  const handleDeleteVariant = (variantId: string) => {
    const variant = currentVariants.find(v => v.id === variantId);
    if (variant) {
      onVariantDelete(variantId);
      
      // Если удаляем основной вариант и есть другие варианты
      if (variant.isMain && currentVariants.length > 1) {
        const otherVariant = currentVariants.find(v => v.id !== variantId);
        if (otherVariant) {
          onSetMainVariant(otherVariant.id);
        }
      }
    }
  };

  const handleSetMain = (variantId: string) => {
    onSetMainVariant(variantId);
  };

  useEffect(() => {
    if (!open) {
      setEditingVariant(null);
      setEditName('');
      setNewVariantName('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Варианты планирования
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Список существующих вариантов */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Существующие варианты ({isExpress ? 'экспресс' : 'детальное'} планирование)
            </Label>
            {currentVariants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет вариантов планирования</p>
            ) : (
              <div className="space-y-2">
                {currentVariants.map(variant => (
                  <div key={variant.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    {editingVariant?.id === variant.id ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          placeholder="Название варианта"
                        />
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          variant="outline"
                        >
                          Сохранить
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="ghost"
                        >
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium">{variant.name}</span>
                          {variant.isMain && (
                            <Crown className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        {!variant.isMain && (
                          <Button
                            onClick={() => handleSetMain(variant.id)}
                            size="sm"
                            variant="ghost"
                            title="Сделать основным"
                          >
                            <Crown className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleEditVariant(variant)}
                          size="sm"
                          variant="ghost"
                        >
                          Изменить
                        </Button>
                        <Button
                          onClick={() => handleDeleteVariant(variant.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={currentVariants.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Создание нового варианта */}
          <div className="space-y-2">
            <Label htmlFor="new-variant-name">Создать новый вариант</Label>
            <div className="flex gap-2">
              <Input
                id="new-variant-name"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                placeholder="Название варианта"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateVariant();
                  }
                }}
              />
              <Button
                onClick={handleCreateVariant}
                disabled={!newVariantName.trim()}
              >
                Создать
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 