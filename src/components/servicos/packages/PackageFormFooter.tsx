
import { Button } from "@/components/ui/button";

interface PackageFormFooterProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitDisabled: boolean;
  isEditing: boolean;
}

export function PackageFormFooter({
  onCancel,
  onSubmit,
  isSubmitDisabled,
  isEditing
}: PackageFormFooterProps) {
  return (
    <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
      <div className="flex flex-row gap-3 w-full justify-end">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          onClick={onSubmit}
          disabled={isSubmitDisabled}
        >
          {isEditing ? "Atualizar" : "Criar"} Pacote
        </Button>
      </div>
    </div>
  );
}
