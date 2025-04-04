import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DangerZone() {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleDeleteRequest = () => {
    setDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    setIsDeleting(true);
    
    // Simulação de operação de exclusão
    setTimeout(() => {
      setIsDeleting(false);
      setDialogOpen(false);
      
      // Mostrar mensagem de confirmação
      toast({
        variant: "destructive",
        title: "Conta excluída!",
        description: "Sua conta foi excluída com sucesso.",
        className: "shadow-xl",
      });
    }, 1500);
  };

  const title = (
    <div className="flex items-center gap-2 text-destructive">
      <AlertTriangle className="h-4 w-4" />
      Zona de Perigo
    </div>
  );

  return (
    <>
      <FormCard 
        title={title}
        className="border-destructive w-full mt-6"
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Ações irreversíveis que afetam sua conta. Tenha cuidado.
          </p>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleDeleteRequest}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Excluindo...
              </>
            ) : (
              "Excluir Minha Conta"
            )}
          </Button>
        </div>
      </FormCard>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              Esta ação é irreversível. Todos os seus dados pessoais, histórico e informações serão 
              permanentemente removidos dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
