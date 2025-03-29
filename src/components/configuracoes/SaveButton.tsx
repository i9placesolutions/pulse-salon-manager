
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  isLoading: boolean;
  onSave: () => void;
}

export function SaveButton({ isLoading, onSave }: SaveButtonProps) {
  return (
    <Button 
      onClick={onSave} 
      disabled={isLoading} 
      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
    >
      {isLoading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          Salvando...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </>
      )}
    </Button>
  );
}
