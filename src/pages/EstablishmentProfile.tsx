import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Copy, QrCode, Eye, MessageCircle, Building, Building2, MapPinned, Clock, Plus, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { supabase } from "@/lib/supabaseClient";
import { ProfileForm } from "@/components/establishment/ProfileForm";
import { WorkingHoursSection } from "@/components/establishment/WorkingHoursSection";
import { SecuritySection } from "@/components/establishment/SecuritySection";
import { BookingSection } from "@/components/establishment/BookingSection";
import { WhatsAppSection } from "@/components/establishment/WhatsAppSection";
import { PaymentsSection } from "@/components/establishment/PaymentsSection";
import { validateEstablishmentProfile, formatPhone, isValidPhone, formatCEP } from "@/utils/validators";

interface EstablishmentProfile {
  name: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
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
  workingHours: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    hasBreak: boolean;
    breakStart: string;
    breakEnd: string;
  }[];
}

const defaultProfile: EstablishmentProfile = {
  name: "Meu Salão",
  address: {
    street: "Rua Exemplo",
    number: "123",
    complement: "Sala 101",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01001-000"
  },
  whatsapp: "(11) 99999-9999",
  email: "contato@meusalao.com.br",
  instagram: "meusalao",
  facebook: "meusalao",
  tiktok: "meusalao",
  logo: "",
  description: "Bem-vindo ao nosso salão! Oferecemos serviços de alta qualidade para cuidar da sua beleza.",
  customUrl: "meu-salao",
  primaryColor: "#1e40af",
  workingHours: [
    {
      dayOfWeek: "Segunda-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Terça-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Quarta-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Quinta-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Sexta-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Sábado",
      openTime: "09:00",
      closeTime: "13:00",
      hasBreak: false,
      breakStart: "",
      breakEnd: ""
    }
  ]
};

export default function EstablishmentProfile() {
  const [profile, setProfile] = useState<EstablishmentProfile>(defaultProfile);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Estados para a seção de segurança
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");

  // Função para processar os dados do perfil
  const processProfileData = (profileData: any) => {
    // Converter dados do banco para o formato da interface
    const formattedProfile: EstablishmentProfile = {
      name: profileData.establishment || profileData.name || defaultProfile.name,
      address: {
        street: profileData.address_street || defaultProfile.address.street,
        number: profileData.address_number || defaultProfile.address.number,
        complement: profileData.address_complement || defaultProfile.address.complement,
        neighborhood: profileData.address_neighborhood || defaultProfile.address.neighborhood,
        city: profileData.address_city || defaultProfile.address.city,
        state: profileData.address_state || defaultProfile.address.state,
        zipCode: profileData.address_cep || defaultProfile.address.zipCode
      },
      whatsapp: profileData.whatsapp || defaultProfile.whatsapp,
      email: profileData.email || defaultProfile.email,
      instagram: profileData.instagram || defaultProfile.instagram,
      facebook: profileData.facebook || defaultProfile.facebook,
      tiktok: profileData.tiktok || defaultProfile.tiktok,
      logo: profileData.logo_url || defaultProfile.logo,
      description: profileData.description || defaultProfile.description,
      customUrl: profileData.custom_url || defaultProfile.customUrl,
      primaryColor: profileData.primary_color || defaultProfile.primaryColor,
      workingHours: profileData.working_hours || defaultProfile.workingHours
    };
    
    setProfile(formattedProfile);
    
    // Definir o preview da logo se existir
    if (profileData.logo_url) {
      setLogoPreview(profileData.logo_url);
    }
  };

  // Função para configurar assinatura em tempo real
  const setupRealtimeSubscription = (uid: string) => {
    if (!uid || uid.trim() === "") {
      console.log("ID de usuário inválido para assinatura:", uid);
      return;
    }
    
    // Cancelar assinatura anterior se existir
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }
    
    // Configurar nova assinatura para a tabela profiles
    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${uid}` 
        }, 
        (payload) => {
          console.log('Alteração em tempo real detectada:', payload);
          if (payload.new) {
            // Processar os dados do perfil atualizados
            processProfileData(payload.new);
            toast({
              title: "Perfil atualizado",
              description: "As informações foram atualizadas em tempo real.",
            });
          }
        }
      )
      .subscribe();
      
    setRealtimeSubscription(subscription);
    console.log("Assinatura em tempo real configurada para o perfil");
  };
  
  // Limpar a assinatura quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (realtimeSubscription) {
        console.log("Cancelando assinatura em tempo real");
        realtimeSubscription.unsubscribe();
      }
    };
  }, [realtimeSubscription]);

  // Copiar o link de agendamento para a área de transferência
  const copyBookingLink = () => {
    const bookingUrl = `https://app.pulsesalon.com.br/p/${profile.customUrl || "meu-estabelecimento"}`;
    navigator.clipboard.writeText(bookingUrl);
    toast({
      title: "Link copiado!",
      description: "O link de agendamento foi copiado para a área de transferência.",
      variant: "success"
    });
  };

  // Abrir a página de agendamento no WhatsApp
  const openWhatsApp = () => {
    const bookingUrl = `https://app.pulsesalon.com.br/p/${profile.customUrl || "meu-estabelecimento"}`;
    const message = `Olá! Você pode agendar seu horário online através do link: ${bookingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  // Função para salvar custom URL no banco de dados
  const saveCustomUrl = async (newCustomUrl: string) => {
    try {
      setIsLoading(true);
      
      // Verificar se a URL já está em uso
      const { data: existingUrls, error: checkError } = await supabase
        .from('profiles')
        .select('id, custom_url')
        .eq('custom_url', newCustomUrl)
        .neq('id', userId); // Excluir o próprio usuário da busca
      
      if (checkError) {
        throw new Error(`Erro ao verificar disponibilidade da URL: ${checkError.message}`);
      }
      
      if (existingUrls && existingUrls.length > 0) {
        toast({
          title: "URL indisponível",
          description: "Esta URL personalizada já está sendo usada por outro estabelecimento.",
          variant: "destructive"
        });
        return false;
      }
      
      // Atualizar a URL personalizada no perfil local
      setProfile(prev => ({
        ...prev,
        customUrl: newCustomUrl
      }));
      
      // Salvar a URL no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ custom_url: newCustomUrl })
        .eq('id', userId);
      
      if (updateError) {
        throw new Error(`Erro ao salvar URL personalizada: ${updateError.message}`);
      }
      
      toast({
        title: "URL atualizada",
        description: "Sua URL personalizada foi atualizada com sucesso.",
        variant: "success"
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar URL personalizada:", error);
      toast({
        title: "Erro ao salvar URL",
        description: error.message || "Não foi possível salvar a URL personalizada.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar número de WhatsApp conforme o usuário digita
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');
    
    let formatted = '';
    if (numbers.length <= 2) {
      formatted = `(${numbers}`;
    } else if (numbers.length <= 6) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    
    setProfile(prev => ({
      ...prev,
      whatsapp: formatted
    }));
  };

  // Atualizar campos de endereço
  const handleAddressChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  // Atualizar campos gerais do perfil
  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Upload da logo do estabelecimento
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('image')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF).",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Mostrar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não está autenticado");
      }
      
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      // Upload para o storage do Supabase
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      // Obter URL pública da imagem
      const { data: urlData } = await supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
        
      // Atualizar o estado do perfil
      setProfile(prev => ({
        ...prev,
        logo: urlData.publicUrl
      }));
      
      toast({
        title: "Upload realizado",
        description: "Logo atualizada com sucesso.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Erro no upload da logo:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Salvar as alterações do perfil no banco de dados
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validar dados antes de salvar
      const validationErrors = validateEstablishmentProfile(profile);
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).join("\n");
        toast({
          title: "Dados inválidos",
          description: errorMessages,
          variant: "destructive"
        });
        return;
      }
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não está autenticado");
      }
      
      // Formatar os dados para o formato do banco
      const profileData = {
        name: profile.name,
        establishment: profile.name,
        address_street: profile.address.street,
        address_number: profile.address.number,
        address_complement: profile.address.complement || "",
        address_neighborhood: profile.address.neighborhood,
        address_city: profile.address.city,
        address_state: profile.address.state,
        address_cep: profile.address.zipCode,
        whatsapp: profile.whatsapp,
        email: profile.email,
        instagram: profile.instagram,
        facebook: profile.facebook,
        tiktok: profile.tiktok,
        logo_url: profile.logo,
        description: profile.description,
        // Removido custom_url para evitar erro já que a coluna não existe no banco
        updated_at: new Date().toISOString()
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) {
        throw new Error(`Erro ao salvar dados: ${error.message}`);
      }
      
      toast({
        title: "Salvo com sucesso",
        description: "As alterações foram salvas no banco de dados.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar os dados do perfil do usuário logado
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar o usuário logado
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Erro ao obter usuário autenticado:", authError);
          toast({
            title: "Erro de autenticação",
            description: authError.message || "Não foi possível verificar sua identidade.",
            variant: "destructive"
          });
          return;
        }
        
        if (!authData || !authData.user) {
          console.error("Usuário não encontrado ou não autenticado");
          toast({
            title: "Erro ao carregar perfil",
            description: "Você precisa estar logado para acessar esta página.",
            variant: "destructive"
          });
          return;
        }
        
        const uid = authData.user.id;
        setUserId(uid);
        
        // Configurar assinatura em tempo real para o perfil
        setupRealtimeSubscription(uid);
        
        // Buscar os dados do perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();
          
        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError);
          toast({
            title: "Erro ao carregar perfil",
            description: "Ocorreu um erro ao buscar seus dados. Tente novamente mais tarde.",
            variant: "destructive"
          });
          return;
        }
        
        if (profileData) {
          processProfileData(profileData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Ocorreu um erro ao buscar os dados do seu estabelecimento.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [toast]);

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Perfil do Estabelecimento" 
        subtitle="Gerencie as informações e a identidade visual do seu salão"
        variant="blue"
        badge="Identificação"
        action={
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Salvar Alterações
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-100 p-1 rounded-lg">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="booking" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Agenda Online
          </TabsTrigger>
          <TabsTrigger 
            value="hours" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Horário de Funcionamento
          </TabsTrigger>
          <TabsTrigger 
            value="whatsapp" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            WhatsApp
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Pagamentos
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-rose-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm 
            profile={profile}
            logoPreview={logoPreview}
            isLoading={isLoading}
            fileInputRef={fileInputRef}
            handleLogoUpload={handleLogoUpload}
            handleWhatsAppChange={handleWhatsAppChange}
            handleAddressChange={handleAddressChange}
            handleSave={handleSave}
            handleChange={handleChange}
          />
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <BookingSection
            profile={profile}
            copyBookingLink={copyBookingLink}
            openWhatsApp={openWhatsApp}
          />
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <WorkingHoursSection 
            workingHours={profile.workingHours} 
            addWorkingHour={() => {}} 
            removeWorkingHour={() => {}} 
            updateWorkingHour={() => {}} 
          />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppSection />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentsSection />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySection 
            newPassword={newPassword} 
            confirmPassword={confirmPassword} 
            setNewPassword={setNewPassword} 
            setConfirmPassword={setConfirmPassword} 
            isChangingPassword={isChangingPassword} 
            handleChangePassword={() => {}} 
            isLoadingDevices={isLoadingDevices} 
            devices={devices} 
            handleLogoutAllDevices={() => {}} 
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
