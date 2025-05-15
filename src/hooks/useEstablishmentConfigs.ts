import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

// Tipos para as configurações
type BookingConfig = {
  customUrl: string;
  enabled: boolean;
  allowClientCancellation: boolean;
  requireConfirmation: boolean;
  advanceBookingDays: number;
  minAdvanceHours: number;
};

type WhatsAppConfig = {
  instanceToken: string;
  instanceName: string;
  profileName: string;
  profilePicUrl: string;
  status: string;
  notifications: {
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    birthday: boolean;
  };
};

type PaymentMethod = {
  id: string;
  metodo: string;
  taxa: number;
  ativo: boolean;
  bandeiras?: {
    nome: string;
    taxa: number;
  }[];
};

type ParcelamentoConfig = {
  numeroMaximoParcelas: number;
  valorMinimo: number;
  cobrarJuros: boolean;
  taxaJuros: number;
};

type PaymentConfig = {
  methods: PaymentMethod[];
  parcelamento: ParcelamentoConfig;
};

export const useEstablishmentConfigs = () => {
  // Função que realmente salva os dados no banco
  const saveToDatabase = async (userId: string, data: any) => {
    try {
      // Verificar quais campos existem na tabela profiles
      const { data: tableInfo, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('Erro ao verificar tabela:', tableError);
      }
      
      // Construir objeto com os campos que existem
      const updateFields: any = { updated_at: new Date().toISOString() };
      
      // Adiciona booking_config de forma segura como JSONB
      if (data.booking_config) {
        updateFields.booking_config = data.booking_config;
      }
      
      // Tenta atualizar o perfil com os dados essenciais
      console.log('Tentando atualizar perfil com:', updateFields);
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateFields)
        .eq('id', userId);
      
      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        
        // Usar upsert como alternativa, apenas com os dados essenciais
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            updated_at: new Date().toISOString(),
            booking_config: data.booking_config
          }, { onConflict: 'id' });
          
        if (upsertError) {
          console.error('Erro ao fazer upsert:', upsertError);
          return { success: false, error: upsertError };
        }
      }
      
      // Salvar a URL personalizada separadamente usando RLS de modo seguro
      try {
        // Inserir um registro na tabela booking_urls se ele não existir
        const { error: urlError } = await supabase
          .from('booking_urls')
          .upsert({
            user_id: userId,
            custom_url: data.booking_config.customUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
          
        if (urlError) {
          console.log('Nota: tabela booking_urls pode não existir, ignorando:', urlError);
          // Não falhar se esta tabela não existir
        }
      } catch (urlErr) {
        console.log('Erro ao tentar salvar URL separadamente:', urlErr);
        // Não falhar por causa deste erro secundário
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao salvar no banco:', err);
      return { success: false, error: err };
    }
  };
  const [bookingConfig, setBookingConfig] = useState<BookingConfig>({
    customUrl: "",
    enabled: true,
    allowClientCancellation: true,
    requireConfirmation: true,
    advanceBookingDays: 30,
    minAdvanceHours: 1
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    instanceToken: "",
    instanceName: "",
    profileName: "",
    profilePicUrl: "",
    status: "",
    notifications: {
      bookingConfirmation: true,
      bookingReminder: true,
      birthday: true
    }
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    methods: [
      { id: "dinheiro", metodo: "Dinheiro", taxa: 0, ativo: true },
      { 
        id: "debito", 
        metodo: "Cartão de Débito", 
        taxa: 2, 
        ativo: true,
        bandeiras: [
          { nome: "Visa", taxa: 1.5 },
          { nome: "Mastercard", taxa: 1.8 },
          { nome: "Elo", taxa: 2.0 }
        ] 
      },
      { 
        id: "credito", 
        metodo: "Cartão de Crédito", 
        taxa: 3, 
        ativo: true,
        bandeiras: [
          { nome: "Visa", taxa: 2.5 },
          { nome: "Mastercard", taxa: 2.9 },
          { nome: "Elo", taxa: 3.2 },
          { nome: "American Express", taxa: 3.5 }
        ] 
      },
      { id: "pix", metodo: "PIX", taxa: 1, ativo: true },
    ],
    parcelamento: {
      numeroMaximoParcelas: 6,
      valorMinimo: 50,
      cobrarJuros: true,
      taxaJuros: 2.99
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Buscar configurações do usuário
  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      
      // Buscar o usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Buscar o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("booking_config, whatsapp_config, payment_config")
        .eq("id", userData.user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      // Atualizar os estados com os dados do perfil
      if (profileData) {
        if (profileData.booking_config) {
          setBookingConfig(profileData.booking_config as BookingConfig);
        }
        
        if (profileData.whatsapp_config) {
          setWhatsAppConfig(profileData.whatsapp_config as WhatsAppConfig);
        }
        
        if (profileData.payment_config) {
          setPaymentConfig(profileData.payment_config as PaymentConfig);
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar configurações:", error.message);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do perfil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar configurações de agenda
  const saveBookingConfig = async (config: BookingConfig) => {
    try {
      setIsLoading(true);
      
      // Buscar o usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("Usuário não autenticado");
      }

      const userId = userData.user.id;
      
      // Salvar no localStorage como backup imediato
      localStorage.setItem("booking_config", JSON.stringify(config));
      localStorage.setItem("booking_customUrl", config.customUrl);
      
      // Atualizar o estado local imediatamente para feedback ao usuário
      setBookingConfig(config);
      
      console.log('Salvando configurações da agenda online:', config);

      // 1. Primeiro, vamos salvar a URL personalizada usando a função RPC
      if (config.customUrl && config.customUrl.trim() !== '') {
        // Verificar se a URL contém apenas caracteres válidos (letras, números e hífen)
        if (!/^[a-zA-Z0-9-]+$/.test(config.customUrl)) {
          throw new Error('A URL personalizada pode conter apenas letras, números e hífen.');
        }

        console.log('Salvando URL personalizada:', config.customUrl);
        const { data: urlResult, error: urlError } = await supabase.rpc('atualizar_url_personalizada', {
          user_id: userId,
          url_personalizada: config.customUrl
        });

        if (urlError) {
          console.error('Erro ao salvar URL personalizada:', urlError);
          // Não interrompemos a execução, seguimos para salvar as outras configurações
        } else {
          console.log('URL personalizada salva com sucesso:', urlResult);
        }
      }

      // 2. Agora vamos salvar as configurações da agenda (booking_config)
      const { error: configError } = await supabase
        .from('profiles')
        .update({
          booking_config: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (configError) {
        console.error('Erro ao atualizar booking_config:', configError);
        
        // Tentar fazer upsert como método alternativo
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            booking_config: config,
            updated_at: new Date().toISOString()
          });

        if (upsertError) {
          console.error('Erro no upsert de booking_config:', upsertError);
          throw new Error('Não foi possível salvar as configurações da agenda.');
        }
      }
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da agenda online foram salvas com sucesso.",
        variant: "success"
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error.message);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Não foi possível salvar as configurações da agenda online.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }  
  };

  // Salvar configurações de WhatsApp
  const saveWhatsAppConfig = async (config: WhatsAppConfig) => {
    try {
      setIsLoading(true);
      
      // Buscar o usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Verificar se o perfil existe
      const { data: profileData, error: profileCheckError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
        
      if (profileCheckError) {
        console.error("Erro ao verificar perfil:", profileCheckError);
        // Se houver erro na verificação, usamos localStorage como backup
        try {
          // Salvar as configurações em localStorage
          localStorage.setItem("whatsapp_config", JSON.stringify(config));
          
          // Notificar o usuário
          toast({
            title: "Configurações armazenadas localmente",
            description: "Não foi possível salvar no banco de dados, mas suas configurações foram salvas localmente.",
            variant: "warning"
          });
          
          // Atualizar o estado local
          setWhatsAppConfig(config);
          return true;
        } catch (localStorageError) {
          console.error("Erro ao salvar em localStorage:", localStorageError);
          throw new Error("Não foi possível salvar as configurações.");
        }
      }
      
      // Tentar salvar no banco de dados
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            whatsapp_config: config,
            updated_at: new Date().toISOString()
          })
          .eq("id", userData.user.id);
          
        if (error) {
          console.error("Erro no update:", error);
          throw error;
        }
      } catch (updateError) {
        console.error("Erro ao atualizar perfil:", updateError);
        
        // Salvar em localStorage como fallback
        localStorage.setItem("whatsapp_config", JSON.stringify(config));
        
        toast({
          title: "Modo de backup ativado",
          description: "Configurações salvas localmente devido a um erro no banco de dados.",
          variant: "warning"
        });
      }
      
      // Atualizar o estado local de qualquer forma
      setWhatsAppConfig(config);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram salvas com sucesso.",
        variant: "success"
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error.message);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Não foi possível salvar as configurações do WhatsApp.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar configurações de pagamento
  const savePaymentConfig = async (config: PaymentConfig) => {
    try {
      setIsLoading(true);
      
      // Buscar o usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Verificar se o perfil existe
      const { data: profileData, error: profileCheckError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
        
      if (profileCheckError) {
        console.error("Erro ao verificar perfil:", profileCheckError);
        // Se houver erro na verificação, usamos localStorage como backup
        try {
          // Salvar as configurações em localStorage
          localStorage.setItem("payment_config", JSON.stringify(config));
          
          // Notificar o usuário
          toast({
            title: "Configurações armazenadas localmente",
            description: "Não foi possível salvar no banco de dados, mas suas configurações foram salvas localmente.",
            variant: "warning"
          });
          
          // Atualizar o estado local
          setPaymentConfig(config);
          return true;
        } catch (localStorageError) {
          console.error("Erro ao salvar em localStorage:", localStorageError);
          throw new Error("Não foi possível salvar as configurações.");
        }
      }
      
      // Tentar salvar no banco de dados
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            payment_config: config,
            updated_at: new Date().toISOString()
          })
          .eq("id", userData.user.id);
          
        if (error) {
          console.error("Erro no update:", error);
          throw error;
        }
      } catch (updateError) {
        console.error("Erro ao atualizar perfil:", updateError);
        
        // Salvar em localStorage como fallback
        localStorage.setItem("payment_config", JSON.stringify(config));
        
        toast({
          title: "Modo de backup ativado",
          description: "Configurações salvas localmente devido a um erro no banco de dados.",
          variant: "warning"
        });
      }
      
      // Atualizar o estado local de qualquer forma
      setPaymentConfig(config);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram salvas com sucesso.",
        variant: "success"
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error.message);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Não foi possível salvar as configurações de pagamento.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar configurações quando o componente for montado
  useEffect(() => {
    fetchConfigs();
  }, []);

  return {
    bookingConfig,
    whatsAppConfig,
    paymentConfig,
    isLoading,
    saveBookingConfig,
    saveWhatsAppConfig,
    savePaymentConfig,
    fetchConfigs
  };
};
