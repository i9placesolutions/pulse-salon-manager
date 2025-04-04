import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Building, Building2, MapPinned, User, AlertCircle, MessageCircle, Lock } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppState } from "@/contexts/AppStateContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EstablishmentProfile {
  name: string;
  documentType: 'cnpj' | 'cpf';
  documentNumber: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: string;
    longitude?: string;
  };
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  logo: string;
  description: string;
  customUrl: string;
  primaryColor: string;
  responsible?: {
    name: string;
    phone: string;
    email: string;
  };
}

const defaultProfile: EstablishmentProfile = {
  name: "",
  documentType: 'cnpj',
  documentNumber: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: ""
  },
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  logo: "",
  description: "",
  customUrl: "",
  primaryColor: "#1e40af",
  responsible: {
    name: "",
    phone: "",
    email: ""
  }
};

export default function EstablishmentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EstablishmentProfile>(defaultProfile);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { establishmentName, setEstablishmentName, profileState, updateProfileCompletion } = useAppState();
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para alteração de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Verificar usuário autenticado e buscar dados do perfil
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        
        try {
          // Buscar dados do perfil básico
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Erro ao buscar perfil:", profileError);
            toast({
              variant: "destructive",
              title: "Erro ao carregar perfil",
              description: "Não foi possível carregar os dados do seu perfil.",
            });
          } else if (profileData) {
            // Atualizar informações básicas do perfil
            setProfile(prev => ({ 
              ...prev, 
              name: profileData.establishment_name 
            }));
            
            // Buscar detalhes do estabelecimento para obter a logo
            const { data: detailsData, error: detailsError } = await supabase
              .from('establishment_details')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (detailsError && detailsError.code !== 'PGRST116') {
              console.error("Erro ao buscar detalhes:", detailsError);
            } else if (detailsData) {
              // Se tiver logo, mostrar a preview
              if (detailsData.logo_url) {
                setLogoPreview(detailsData.logo_url);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao processar perfil:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Usuário não está autenticado, redirecionar para login
        navigate("/");
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login para acessar esta página.",
        });
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Atualizar o nome do estabelecimento a partir do contexto
  useEffect(() => {
    if (establishmentName && establishmentName !== profile.name) {
      setProfile(prev => ({ ...prev, name: establishmentName }));
    }
  }, [establishmentName]);

  // Verificar se o usuário está em primeiro login e não deve poder sair desta página
  useEffect(() => {
    if (profileState.isFirstLogin && !profileState.isProfileComplete) {
      // Impedir que o usuário saia da página
      window.onbeforeunload = (e) => {
        // Esta mensagem é ignorada por muitos navegadores
        const message = "Você precisa completar seu perfil antes de continuar.";
        e.returnValue = message;
        return message;
      };

      // Detectar tentativas de navegação
      const handleBeforeNavigate = (e: BeforeUnloadEvent) => {
        if (!profileState.isProfileComplete) {
          const message = "Você precisa completar seu perfil antes de continuar.";
          e.returnValue = message;
          return message;
        }
      };

      window.addEventListener('beforeunload', handleBeforeNavigate);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeNavigate);
        window.onbeforeunload = null;
      };
    }
  }, [profileState.isFirstLogin, profileState.isProfileComplete]);

  // Checar se o perfil está completo
  const checkProfileCompletion = (): boolean => {
    const requiredFields: string[] = [];

    // Verificar campos obrigatórios
    if (!profile.name || profile.name.trim().length < 3) requiredFields.push("Nome do estabelecimento");
    if (!profile.documentNumber) requiredFields.push("Número do documento (CPF/CNPJ)");
    if (!profile.address.street) requiredFields.push("Rua/Avenida");
    if (!profile.address.number) requiredFields.push("Número");
    if (!profile.address.neighborhood) requiredFields.push("Bairro");
    if (!profile.address.city) requiredFields.push("Cidade");
    if (!profile.address.state) requiredFields.push("Estado");
    if (!profile.address.zipCode) requiredFields.push("CEP");
    if (!profile.whatsapp) requiredFields.push("WhatsApp");
    if (!profile.email) requiredFields.push("E-mail");
    if (!profile.responsible?.name) requiredFields.push("Nome do responsável");
    if (!profile.responsible?.phone) requiredFields.push("Telefone do responsável");
    if (!profile.responsible?.email) requiredFields.push("E-mail do responsável");

    setMissingFields(requiredFields);
    return requiredFields.length === 0;
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    }
    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatDocument = (value: string, type: 'cnpj' | 'cpf') => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // Formatar CPF: 000.000.000-00
      if (numbers.length <= 3) {
        return numbers;
      }
      if (numbers.length <= 6) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      }
      if (numbers.length <= 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      }
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      if (numbers.length <= 2) {
        return numbers;
      }
      if (numbers.length <= 5) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      }
      if (numbers.length <= 8) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      }
      if (numbers.length <= 12) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      }
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value, profile.documentType);
    setProfile({ ...profile, documentNumber: formatted });
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setProfile({ ...profile, whatsapp: formatted });
  };

  const handleResponsibleChange = (field: string, value: string) => {
    if (!profile.responsible) {
      setProfile({
        ...profile,
        responsible: {
          name: field === 'name' ? value : '',
          phone: field === 'phone' ? value : '',
          email: field === 'email' ? value : ''
        }
      });
      return;
    }

    setProfile({
      ...profile,
      responsible: {
        ...profile.responsible,
        [field]: value
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFullAddress = () => {
    const a = profile.address;
    const complement = a.complement ? `, ${a.complement}` : '';
    return `${a.street}, ${a.number}${complement} - ${a.neighborhood}, ${a.city}/${a.state} - CEP ${a.zipCode}`;
  };

  const openWhatsApp = () => {
    const number = profile.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${number}`, '_blank');
  };

  // Função para fazer upload da logo
  const uploadLogo = async (userId: string): Promise<string | null> => {
    if (!logoFile) {
      // Se não tem novo arquivo, retorna a URL atual (pode ser vazia)
      return profile.logo;
    }
    
    try {
      // Criar nome único para o arquivo
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Fazer upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('establishment_logos')
        .upload(filePath, logoFile);
        
      if (uploadError) throw uploadError;
      
      // Obter URL pública do arquivo
      const { data } = supabase.storage
        .from('establishment_logos')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar seu perfil.",
      });
      return;
    }
    
    const isComplete = checkProfileCompletion();
    
    if (!isComplete) {
      toast({
        variant: "destructive",
        title: "Perfil incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Verificar se é uma criação inicial ou uma edição
      const isEditing = profileState.isProfileComplete;
      
      // Fazer upload da logo se houver
      const logoUrl = await uploadLogo(userId);
      
      // Atualizar os dados básicos do perfil
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          establishment_name: profile.name,
          is_profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateProfileError) throw updateProfileError;

      // Atualizar os detalhes do estabelecimento
      const { error: updateDetailsError } = await supabase
        .from('establishment_details')
        .update({
          document_type: profile.documentType,
          document_number: profile.documentNumber,
          address_street: profile.address.street,
          address_number: profile.address.number,
          address_complement: profile.address.complement,
          address_neighborhood: profile.address.neighborhood,
          address_city: profile.address.city,
          address_state: profile.address.state,
          address_zipcode: profile.address.zipCode,
          address_latitude: profile.address.latitude,
          address_longitude: profile.address.longitude,
          whatsapp: profile.whatsapp,
          email: profile.email,
          instagram: profile.instagram,
          facebook: profile.facebook,
          tiktok: profile.tiktok,
          logo_url: logoUrl,
          description: profile.description,
          custom_url: profile.customUrl,
          primary_color: profile.primaryColor,
          responsible_name: profile.responsible?.name,
          responsible_phone: profile.responsible?.phone,
          responsible_email: profile.responsible?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateDetailsError) throw updateDetailsError;
      
      // Atualizar o nome do estabelecimento no contexto global
      setEstablishmentName(profile.name);
      
      // Marcar o perfil como completo
      updateProfileCompletion(true);
      
      // Comportamento diferente baseado em criação vs edição
      if (isEditing) {
        // Mostrar mensagem de sucesso para edição
        toast({
          variant: "success",
          title: "Perfil editado com sucesso!",
          description: "As alterações foram salvas.",
          className: "shadow-xl",
        });
      } else {
        // Mostrar mensagem de sucesso para criação inicial
        toast({
          variant: "success",
          title: "Perfil salvo com sucesso!",
          description: `Bem-vindo ao ${profile.name}! Você será redirecionado para o dashboard.`,
          className: "shadow-xl",
        });
        
        // Redirecionar para o dashboard apenas na criação inicial
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar perfil",
        description: error.message || "Ocorreu um erro ao salvar seu perfil. Tente novamente.",
        className: "shadow-xl",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar campos de endereço
  const handleAddressChange = (field: keyof EstablishmentProfile['address'], value: string) => {
    setProfile({
      ...profile,
      address: {
        ...profile.address,
        [field]: value
      }
    });
  };

  // Função para alterar senha
  const handlePasswordChange = async () => {
    // Validações
    if (!currentPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe sua senha atual.",
      });
      return;
    }

    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe a nova senha.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Verificar a senha atual com login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          variant: "destructive",
          title: "Senha incorreta",
          description: "A senha atual está incorreta.",
        });
        setIsChangingPassword(false);
        return;
      }

      // Alterar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Sucesso
      toast({
        variant: "success",
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Limpar campos e fechar diálogo
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout variant="blue">
        <div className="flex items-center justify-center h-96">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Perfil do Estabelecimento" 
        subtitle="Gerencie suas informações de acesso"
        variant="blue"
        badge="Identificação"
      />
      
      <Card className="border-blue-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
          <CardTitle className="text-blue-700">Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo e informações básicas */}
            <div className="flex flex-col items-center md:items-start space-y-4 md:w-1/3">
              <div className="h-40 w-40 rounded-lg border-2 border-blue-200 flex items-center justify-center overflow-hidden bg-white">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo do estabelecimento"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building className="h-16 w-16 text-blue-300" />
                )}
              </div>
              {!logoPreview && (
                <p className="text-sm text-blue-600 text-center md:text-left">
                  Sua logo será exibida aqui quando inserida na tela de Configurações.
                </p>
              )}
            </div>

            {/* Informações da conta */}
            <div className="md:w-2/3 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-blue-600">Nome do Estabelecimento</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200 text-blue-700 font-medium">
                    {profile.name || establishmentName || "Nome não definido"}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-blue-600">E-mail de Acesso</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200 text-blue-700 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    {userEmail}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-3">Segurança da Conta</h3>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Alterar Senha
                </Button>
                
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                  <p className="text-sm text-blue-600 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>
                      Para alterar outras informações do seu estabelecimento como endereço, 
                      contatos ou redes sociais, acesse o menu "Configurações".
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para alteração de senha */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Crie uma nova senha segura com pelo menos 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword && newPassword.length < 6 && (
                <p className="text-xs text-red-500 mt-1">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  As senhas não coincidem
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setIsPasswordDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handlePasswordChange} 
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
