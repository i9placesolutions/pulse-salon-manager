import { useState } from "react";
import { ProfessionalSpecialty } from "@/types/professional";
import { Check, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SpecialtySelectorProps {
  availableSpecialties: ProfessionalSpecialty[];
  selectedSpecialties: ProfessionalSpecialty[];
  onSpecialtiesChange: (specialties: ProfessionalSpecialty[]) => void;
  onAddNewClick: () => void;
  isRequired?: boolean;
  error?: string;
}

export function SpecialtySelector({
  availableSpecialties,
  selectedSpecialties,
  onSpecialtiesChange,
  onAddNewClick,
  isRequired = false,
  error,
}: SpecialtySelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (specialty: ProfessionalSpecialty) => {
    const isSelected = selectedSpecialties.some(s => s.id === specialty.id);
    
    if (isSelected) {
      // Remove da seleção
      onSpecialtiesChange(selectedSpecialties.filter(s => s.id !== specialty.id));
    } else {
      // Adiciona à seleção
      onSpecialtiesChange([...selectedSpecialties, specialty]);
    }
  };

  const handleRemove = (specialty: ProfessionalSpecialty) => {
    onSpecialtiesChange(selectedSpecialties.filter(s => s.id !== specialty.id));
  };

  // Filtrar apenas especialidades ativas
  const activeSpecialties = availableSpecialties.filter(s => s.isActive);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="specialty-selector">
          Especialidades {isRequired && <span className="text-destructive">*</span>}
        </Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={onAddNewClick}
        >
          <Plus className="h-3 w-3 mr-1" />
          Nova
        </Button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <div className="flex flex-wrap gap-1 max-w-full">
              {selectedSpecialties.length > 0 ? (
                selectedSpecialties.map(specialty => (
                  <Badge
                    key={specialty.id}
                    variant="secondary"
                    className="mr-1 mb-1"
                    style={{ backgroundColor: `${specialty.color}30`, borderColor: specialty.color }}
                  >
                    {specialty.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Selecione especialidades...</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
          <Command>
            <CommandInput placeholder="Buscar especialidade..." />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground">Nenhuma especialidade encontrada.</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={onAddNewClick}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar nova especialidade
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {activeSpecialties.map(specialty => {
                  const isSelected = selectedSpecialties.some(s => s.id === specialty.id);
                  return (
                    <CommandItem
                      key={specialty.id}
                      value={specialty.name}
                      onSelect={() => handleSelect(specialty)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                        )}
                        style={{ backgroundColor: isSelected ? specialty.color : undefined }}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: specialty.color }}
                        />
                        <span>{specialty.name}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedSpecialties.map(specialty => (
            <Badge
              key={specialty.id}
              variant="secondary"
              className="cursor-pointer"
              style={{ backgroundColor: `${specialty.color}30`, borderColor: specialty.color }}
              onClick={() => handleRemove(specialty)}
            >
              {specialty.name}
              <span className="ml-1 text-xs opacity-70">×</span>
            </Badge>
          ))}
        </div>
      )}

      {error && (
        <div className="flex gap-1 items-center text-xs text-destructive mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 