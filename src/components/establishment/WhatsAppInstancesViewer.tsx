import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Smartphone, Info, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listAllInstances, listUserInstances, WhatsAppInstance, deleteInstance } from "@/services/whatsapp/api";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const WhatsAppInstancesViewer = () => {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [instanceToDelete, setInstanceToDelete] = useState<WhatsAppInstance | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  // Obter o ID do usuário logado
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
      }
    };
    getUserId();
  }, []);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      if (!userId) {
        throw new Error("Usuário não identificado. Faça login novamente.");
      }
      
      // Carregar apenas as instâncias do usuário logado
      const userInstances = await listUserInstances(userId);
      setInstances(userInstances);
      
      // Mostrar toast apenas quando o botão é clicado explicitamente (não na carga inicial)
      if (isLoading) {
        toast({
          title: "Instâncias atualizadas",
          description: `${userInstances.length} instâncias encontradas para seu usuário.`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar instâncias:", error);
      toast({
        title: "Erro ao carregar instâncias",
        description: error instanceof Error ? error.message : "Não foi possível carregar as instâncias do WhatsApp.",
        variant: "destructive",
        className: "bg-red-50 border-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar instâncias ao montar o componente ou quando o userId for obtido
  useEffect(() => {
    if (userId) {
      loadInstances();
    }
  }, [userId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="mr-2 h-5 w-5 text-purple-600" />
          {instances.length > 1 ? "Minhas Instâncias do WhatsApp" : "Minha Instância do WhatsApp"}
        </CardTitle>
        <CardDescription>
          {instances.length > 1 
            ? "Lista das instâncias do WhatsApp conectadas à sua conta."
            : "Instância do WhatsApp conectada à sua conta."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button 
            onClick={loadInstances} 
            size="sm" 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </>
            )}
          </Button>
        </div>
        
        {instances.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sistema</TableHead>
                <TableHead>ID do Usuário</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.name}</TableCell>
                  <TableCell className="font-mono text-xs">{instance.id}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={instance.status === "connected" ? "default" : "secondary"}
                      className={instance.status === "connected" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {instance.status === "connected" ? "Conectado" : "Desconectado"}
                    </Badge>
                  </TableCell>
                  <TableCell>{instance.systemName}</TableCell>
                  <TableCell className="font-mono text-xs">{instance.adminField01 || "-"}</TableCell>
                  <TableCell>{new Date(instance.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {instance.status !== "connected" && (
                      <Button 
                        onClick={() => {
                          setInstanceToDelete(instance);
                          setShowDeleteConfirm(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 flex items-center gap-1"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-md">
            {!userId ? (
              <div className="flex flex-col items-center gap-2">
                <Info className="h-6 w-6 text-amber-500" />
                <p className="text-amber-700">
                  Aguardando identificação do usuário...
                </p>
              </div>
            ) : isLoading ? (
              <p className="text-gray-500">Carregando instâncias...</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-gray-500">Você ainda não possui instâncias do WhatsApp.</p>
                <p className="text-xs text-gray-400">Utilize o botão "Criar Nova Instância" para criar sua primeira instância.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Modal de confirmação para exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a instância "{instanceToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!instanceToDelete) return;
                
                try {
                  setIsLoading(true);
                  await deleteInstance(instanceToDelete.token);
                  toast({
                    title: "Instância excluída",
                    description: `A instância "${instanceToDelete.name}" foi excluída com sucesso.`,
                    variant: "default",
                    className: "bg-green-50 border-green-200 text-green-800",
                  });
                  // Recarregar a lista após excluir
                  loadInstances();
                } catch (error) {
                  console.error("Erro ao excluir instância:", error);
                  toast({
                    title: "Erro ao excluir instância",
                    description: error instanceof Error ? error.message : "Não foi possível excluir a instância",
                    variant: "destructive",
                    className: "bg-red-50 border-red-200",
                  });
                } finally {
                  setIsLoading(false);
                  setInstanceToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Instância
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
