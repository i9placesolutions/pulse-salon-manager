import { useState } from "react";
import { Check, Shield } from "lucide-react";
import { 
  Calendar,
  Users,
  DollarSign,
  Package,
  BarChart,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserRole, PermissionModule } from "@/hooks/useUserManagement";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface PermissionsManagerProps {
  role: UserRole;
  permissions: PermissionModule[];
  onSave: (permissions: Record<string, any>) => Promise<boolean>;
  isLoading?: boolean;
}

export function PermissionsManager({ 
  role, 
  permissions,
  onSave,
  isLoading = false
}: PermissionsManagerProps) {
  // Estado para acompanhar as permissões atuais
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, any>>(
    role.permissions || {}
  );
  
  // Estado para aba ativa
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mapear nome do ícone para componente
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Calendar": return <Calendar className="h-5 w-5" />;
      case "Users": return <Users className="h-5 w-5" />;
      case "DollarSign": return <DollarSign className="h-5 w-5" />;
      case "Package": return <Package className="h-5 w-5" />;
      case "BarChart": return <BarChart className="h-5 w-5" />;
      case "Settings": return <Settings className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };
  
  // Verificar se o módulo tem acesso total
  const hasFullAccess = (moduleName: string): boolean => {
    return typeof currentPermissions[moduleName] === "boolean" && 
           currentPermissions[moduleName] === true;
  };
  
  // Verificar se tem uma permissão específica
  const hasActionPermission = (moduleName: string, actionId: string): boolean => {
    if (hasFullAccess(moduleName)) return true;
    
    if (typeof currentPermissions[moduleName] === "object") {
      return !!currentPermissions[moduleName][actionId];
    }
    
    return false;
  };
  
  // Alternar acesso total a um módulo
  const toggleModuleAccess = (moduleName: string, value: boolean) => {
    setCurrentPermissions(prev => ({
      ...prev,
      [moduleName]: value
    }));
  };
  
  // Alternar uma permissão específica
  const toggleActionPermission = (moduleName: string, actionId: string, value: boolean) => {
    // Se não existir objeto para este módulo, criar
    if (typeof currentPermissions[moduleName] !== "object") {
      setCurrentPermissions(prev => ({
        ...prev,
        [moduleName]: { [actionId]: value }
      }));
      return;
    }
    
    // Atualizar permissão existente
    setCurrentPermissions(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [actionId]: value
      }
    }));
  };
  
  // Salvar todas as permissões
  const handleSave = async () => {
    await onSave(currentPermissions);
  };
  
  // Verificar se o usuário é administrador com acesso completo
  const isAdmin = role.name === "Administrador" || currentPermissions.all === true;
  
  // Gerar classe de cor para o módulo
  const getModuleColorClass = (color: string) => {
    switch (color) {
      case "violet": return "bg-violet-100 text-violet-700 border-violet-200";
      case "blue": return "bg-blue-100 text-blue-700 border-blue-200";
      case "green": return "bg-green-100 text-green-700 border-green-200";
      case "amber": return "bg-amber-100 text-amber-700 border-amber-200";
      case "gray": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="py-3 px-4 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg text-indigo-700">Permissões: {role.name}</CardTitle>
          </div>
          <CardDescription className="text-sm mt-1">
            Configure quais telas e ações o usuário com perfil <span className="font-medium">{role.name}</span> pode acessar
          </CardDescription>
        </CardHeader>
        
        <Tabs 
          defaultValue="overview" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="px-2 pt-1 border-b bg-slate-50">
            <TabsList className="grid grid-cols-7 w-full bg-slate-100/70">
              <TabsTrigger value="overview" className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
                Visão Geral
              </TabsTrigger>
              {permissions.map(module => (
                <TabsTrigger 
                  key={module.name} 
                  value={module.name}
                  className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                >
                  {module.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <CardContent className="p-0">
            <TabsContent value="overview" className="mt-0 p-4">
              <div className="space-y-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-md border">
                  {isAdmin ? (
                    <div className="text-sm text-green-600 bg-green-50 py-1 px-3 rounded-full font-medium flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Acesso Total
                    </div>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 py-1 px-3 rounded-full font-medium flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Acesso Personalizado
                    </div>
                  )}
                  <span className="text-sm text-slate-600">
                    {isAdmin ? 
                      "Este perfil tem acesso completo a todas as funcionalidades do sistema." : 
                      "Este perfil tem permissões personalizadas para cada área do sistema."}
                  </span>
                </div>
                
                {role.name === "Administrador" ? (
                  <div className="py-3 px-4 bg-indigo-50 rounded-md text-indigo-700 text-sm border border-indigo-100">
                    Administradores têm acesso completo a todas as funcionalidades do sistema e não podem ter suas permissões alteradas.
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border p-4 bg-white">
                      <div className="flex items-center gap-3">
                        <Switch 
                          id="all-permissions"
                          checked={!!currentPermissions.all}
                          onCheckedChange={(checked) => {
                            setCurrentPermissions(prev => ({
                              ...prev,
                              all: checked
                            }));
                          }}
                          disabled={isLoading}
                        />
                        <Label 
                          htmlFor="all-permissions"
                          className="font-medium"
                        >
                          Conceder acesso total a todas as funcionalidades
                        </Label>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 ml-10">
                        Equivalente a um administrador, terá acesso a todas as áreas e ações do sistema.
                      </p>
                    </div>
                    
                    <h3 className="text-sm font-medium text-slate-500 mt-6 mb-3 pl-1">MÓDULOS DO SISTEMA</h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {permissions.map(module => {
                        const colorClass = getModuleColorClass(module.color);
                        
                        return (
                          <Card key={module.name} className="overflow-hidden border shadow-sm">
                            <div className={`px-4 py-3 flex items-center justify-between border-b ${colorClass}`}>
                              <div className="flex items-center gap-2">
                                <div>
                                  {getIconComponent(module.icon)}
                                </div>
                                <h3 className="font-medium">{module.title}</h3>
                              </div>
                              <Switch 
                                id={`module-${module.name}`}
                                checked={hasFullAccess(module.name)}
                                onCheckedChange={(checked) => toggleModuleAccess(module.name, checked)}
                                disabled={!!currentPermissions.all || isLoading}
                              />
                            </div>
                            
                            <div className="p-3 space-y-2 bg-white">
                              {module.actions.map(action => (
                                <div key={action.id} className="flex items-center gap-2 pl-1">
                                  <Checkbox 
                                    id={`${module.name}-${action.id}`}
                                    checked={hasActionPermission(module.name, action.id)}
                                    onCheckedChange={(checked) => 
                                      toggleActionPermission(module.name, action.id, !!checked)
                                    }
                                    disabled={hasFullAccess(module.name) || !!currentPermissions.all || isLoading}
                                    className="h-4 w-4"
                                  />
                                  <Label 
                                    htmlFor={`${module.name}-${action.id}`}
                                    className="text-sm font-normal"
                                  >
                                    {action.title}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            {permissions.map(module => {
              const colorClass = getModuleColorClass(module.color);
              
              return (
                <TabsContent key={module.name} value={module.name} className="mt-0 p-4">
                  <div className="space-y-6">
                    <div className={`flex items-center justify-between p-4 rounded-md ${colorClass} border`}>
                      <div className="flex items-center gap-3">
                        <div>
                          {getIconComponent(module.icon)}
                        </div>
                        <div>
                          <h2 className="text-lg font-medium">{module.title}</h2>
                          <p className="text-sm opacity-80">Configure as permissões específicas deste módulo</p>
                        </div>
                      </div>
                      
                      {role.name !== "Administrador" && (
                        <div className="flex items-center gap-3">
                          <Label htmlFor={`full-access-${module.name}`} className="text-sm">Acesso Total</Label>
                          <Switch 
                            id={`full-access-${module.name}`}
                            checked={hasFullAccess(module.name)}
                            onCheckedChange={(checked) => toggleModuleAccess(module.name, checked)}
                            disabled={!!currentPermissions.all || isLoading}
                          />
                        </div>
                      )}
                    </div>
                    
                    {role.name === "Administrador" ? (
                      <div className="py-3 px-4 bg-indigo-50 rounded-md text-indigo-700 text-sm border border-indigo-100">
                        Administradores têm acesso completo a todas as funcionalidades do módulo {module.title}.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {module.actions.map(action => (
                            <div key={action.id} className="flex flex-col p-4 rounded-md border bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <Label 
                                  htmlFor={`detail-${module.name}-${action.id}`}
                                  className="font-medium"
                                >
                                  {action.title}
                                </Label>
                                
                                <Checkbox 
                                  id={`detail-${module.name}-${action.id}`}
                                  checked={hasActionPermission(module.name, action.id)}
                                  onCheckedChange={(checked) => 
                                    toggleActionPermission(module.name, action.id, !!checked)
                                  }
                                  disabled={hasFullAccess(module.name) || !!currentPermissions.all || isLoading}
                                />
                              </div>
                              
                              <p className="text-sm text-slate-500">
                                {action.id === "view" && `Permite visualizar os dados do módulo ${module.title}`}
                                {action.id === "edit" && `Permite editar e criar dados no módulo ${module.title}`}
                                {action.id === "delete" && `Permite excluir dados no módulo ${module.title}`}
                                {action.id === "export" && `Permite exportar dados do módulo ${module.title}`}
                                {action.id === "configure" && `Permite configurar o módulo ${module.title}`}
                                {action.id === "system" && `Permite acesso a configurações avançadas do sistema`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </CardContent>
        </Tabs>
      </Card>
      
      {role.name !== "Administrador" && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? "Salvando..." : "Salvar Permissões"}
          </Button>
        </div>
      )}
    </div>
  );
}
