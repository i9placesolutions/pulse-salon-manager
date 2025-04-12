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
      
      // Atualizar o perfil
      const { error } = await supabase
        .from("profiles")
        .update({ booking_config: config })
        .eq("id", userData.user.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar o estado local
      setBookingConfig(config);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da agenda online foram salvas com sucesso."
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error.message);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações da agenda online.",
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
      
      // Atualizar o perfil
      const { error } = await supabase
        .from("profiles")
        .update({ whatsapp_config: config })
        .eq("id", userData.user.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar o estado local
      setWhatsAppConfig(config);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram salvas com sucesso."
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error.message);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações do WhatsApp.",
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
      
      // Atualizar o perfil
      const { error } = await supabase
        .from("profiles")
        .update({ payment_config: config })
        .eq("id", userData.user.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar o estado local
      setPaymentConfig(config);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram salvas com sucesso."
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error.message);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações de pagamento.",
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
