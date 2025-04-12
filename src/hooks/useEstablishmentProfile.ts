import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

// Interface para o perfil do estabelecimento
export interface EstablishmentProfile {
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

// Perfil padrão
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

export const useEstablishmentProfile = () => {
  // Estados
  const [profile, setProfile] = useState<EstablishmentProfile>(defaultProfile);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        zipCode: profileData.address_zipcode || defaultProfile.address.zipCode
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

    return formattedProfile;
  };

  // Buscar dados do perfil
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Obter usuário logado
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Erro ao buscar usuário:", authError.message);
        toast({
          title: "Erro ao buscar perfil",
          description: "Não foi possível obter os dados do usuário.",
          variant: "destructive"
        });
        return;
      }
      
      if (!authData?.user) {
        console.error("Usuário não encontrado");
        return;
      }
      
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();
      
      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError.message);
        toast({
          title: "Erro ao buscar perfil",
          description: "Não foi possível obter os dados do perfil.",
          variant: "destructive"
        });
        return;
      }
      
      if (profileData) {
        const formattedProfile = processProfileData(profileData);
        setProfile(formattedProfile);
        
        if (profileData.logo_url) {
          setLogoPreview(profileData.logo_url);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      toast({
        title: "Erro ao buscar perfil",
        description: "Ocorreu um erro inesperado ao buscar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Formatação de WhatsApp
  const formatWhatsApp = (value: string) => {
    // Remover tudo exceto números
    let cleaned = value.replace(/\D/g, '');
    
    // Aplicar máscara
    if (cleaned.length <= 11) {
      // Formatar (XX) XXXXX-XXXX
      if (cleaned.length > 2) {
        cleaned = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      }
      if (cleaned.length > 10) {
        cleaned = `${cleaned.substring(0, 10)}-${cleaned.substring(10)}`;
      }
    }
    
    return cleaned;
  };

  // Tratar mudança no campo WhatsApp
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWhatsApp(e.target.value);
    handleChange('whatsapp', formattedValue);
  };

  // Tratar upload de logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Validar tamanho e tipo
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, envie apenas imagens.",
          variant: "destructive"
        });
        return;
      }
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Obter usuário atual
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Upload para o storage
      const filename = `logo_${authData.user.id}_${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("profile_images")
        .upload(filename, file, { upsert: true });
      
      if (error) {
        throw error;
      }
      
      // Obter URL pública
      const { data: urlData } = await supabase.storage
        .from("profile_images")
        .getPublicUrl(data.path);
      
      // Atualizar perfil
      setProfile(prev => ({
        ...prev,
        logo: urlData.publicUrl
      }));
      
      // Atualizar no banco
      await supabase
        .from("profiles")
        .update({ logo_url: urlData.publicUrl })
        .eq("id", authData.user.id);
      
      toast({
        title: "Logo atualizado",
        description: "A imagem foi enviada com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: error.message || "Não foi possível enviar a imagem.",
        variant: "destructive"
      });
    }
  };

  // Salvar dados
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        throw new Error("Erro ao verificar usuário");
      }
      
      // Preparar dados para salvar
      const updateData = {
        establishment: profile.name,
        description: profile.description,
        custom_url: profile.customUrl,
        address_street: profile.address.street,
        address_number: profile.address.number,
        address_complement: profile.address.complement,
        address_neighborhood: profile.address.neighborhood,
        address_city: profile.address.city,
        address_state: profile.address.state,
        address_zipcode: profile.address.zipCode,
        whatsapp: profile.whatsapp,
        email: profile.email,
        instagram: profile.instagram,
        facebook: profile.facebook,
        tiktok: profile.tiktok,
        primary_color: profile.primaryColor,
        working_hours: profile.workingHours
      };
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", authData.user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "As alterações foram salvas com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Adicionar horário
  const addWorkingHour = () => {
    setProfile(prev => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        {
          dayOfWeek: "Domingo",
          openTime: "09:00",
          closeTime: "18:00",
          hasBreak: false,
          breakStart: "",
          breakEnd: ""
        }
      ]
    }));
  };

  // Remover horário
  const removeWorkingHour = (index: number) => {
    setProfile(prev => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index)
    }));
  };

  // Atualizar horário
  const updateWorkingHour = (index: number, field: string, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((hour, i) => 
        i === index ? { ...hour, [field]: value } : hour
      )
    }));
  };

  // Alterar campo do endereço
  const handleAddressChange = (field: keyof EstablishmentProfile['address'], value: string) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  // Alterar campo genérico
  const handleChange = (field: keyof EstablishmentProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Copiar link de agendamento
  const copyBookingLink = () => {
    const bookingLink = `https://app.pulsesalon.com.br/p/${profile.customUrl}`;
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: "Link copiado",
      description: "O link de agendamento foi copiado para a área de transferência."
    });
  };

  // Abrir WhatsApp
  const openWhatsApp = () => {
    const number = profile.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${number}`, '_blank');
  };

  // Obter endereço completo
  const getFullAddress = () => {
    return `${profile.address.street}, ${profile.address.number}${profile.address.complement ? `, ${profile.address.complement}` : ''} - ${profile.address.neighborhood}, ${profile.address.city} - ${profile.address.state}, ${profile.address.zipCode}`;
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    profile,
    logoPreview,
    isLoading,
    isSaving,
    fileInputRef,
    handleChange,
    handleAddressChange,
    handleWhatsAppChange,
    handleLogoUpload,
    handleSave,
    addWorkingHour,
    removeWorkingHour,
    updateWorkingHour,
    copyBookingLink,
    openWhatsApp,
    getFullAddress,
    fetchProfileData,
  };
};
