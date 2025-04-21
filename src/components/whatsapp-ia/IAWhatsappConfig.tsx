import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../ui/use-toast';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

type ConfigProps = {
  id?: string;
  establishment_id: string;
  openai_key?: string;
  uazapi_instance?: string;
  uazapi_token?: string;
  active: boolean;
  welcome_message: string;
  establishment_info: string;
  created_at?: string;
  updated_at?: string;
}

export const IAWhatsappConfig: React.FC = () => {
  const { user } = useAppState();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConfigProps>({
    establishment_id: user.currentUser?.id || '',
    active: false,
    welcome_message: 'Olá! Sou o assistente virtual do salão. Como posso ajudar você hoje?',
    establishment_info: '',
    openai_key: '',
    uazapi_instance: '',
    uazapi_token: '',
  });

  useEffect(() => {
    if (user.currentUser?.id) {
      fetchConfig();
    }
  }, [user.currentUser]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('whatsapp_ia_config')
        .select('*')
        .eq('establishment_id', user.currentUser?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações da IA.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      
      // Verifica se já existe configuração
      const { data: existingConfig } = await supabase
        .from('whatsapp_ia_config')
        .select('id')
        .eq('establishment_id', user.currentUser?.id)
        .single();
      
      let result;
      
      if (existingConfig) {
        // Atualiza configuração existente
        result = await supabase
          .from('whatsapp_ia_config')
          .update({
            openai_key: config.openai_key,
            uazapi_instance: config.uazapi_instance,
            uazapi_token: config.uazapi_token,
            active: config.active,
            welcome_message: config.welcome_message,
            establishment_info: config.establishment_info,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConfig.id)
          .select()
          .single();
      } else {
        // Cria nova configuração
        result = await supabase
          .from('whatsapp_ia_config')
          .insert({
            establishment_id: user.currentUser?.id,
            openai_key: config.openai_key,
            uazapi_instance: config.uazapi_instance,
            uazapi_token: config.uazapi_token,
            active: config.active,
            welcome_message: config.welcome_message,
            establishment_info: config.establishment_info,
          })
          .select()
          .single();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Configurações da IA salvas com sucesso!',
      });
      
      // Atualiza estado com os dados do banco
      if (result.data) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações da IA.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setConfig(prev => ({ ...prev, active: checked }));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da IA WhatsApp</CardTitle>
          <CardDescription>
            Configure a integração da OpenAI com o WhatsApp para automatizar o atendimento ao cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch 
              id="active" 
              checked={config.active} 
              onCheckedChange={handleSwitchChange} 
            />
            <Label htmlFor="active">Ativar IA WhatsApp</Label>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuração da OpenAI</h3>
            <div className="space-y-2">
              <Label htmlFor="openai_key">Chave da API OpenAI</Label>
              <Input
                id="openai_key"
                name="openai_key"
                placeholder="sk-..."
                value={config.openai_key}
                onChange={handleChange}
                type="password"
              />
              <p className="text-sm text-gray-500">
                A API da OpenAI será usada para processar mensagens e transcrever áudios.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuração do Uazapi</h3>
            <div className="space-y-2">
              <Label htmlFor="uazapi_instance">Instância Uazapi</Label>
              <Input
                id="uazapi_instance"
                name="uazapi_instance"
                placeholder="Nome da instância"
                value={config.uazapi_instance}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uazapi_token">Token Uazapi</Label>
              <Input
                id="uazapi_token"
                name="uazapi_token"
                placeholder="Token de acesso"
                value={config.uazapi_token}
                onChange={handleChange}
                type="password"
              />
            </div>
            <p className="text-sm text-gray-500">
              Uazapi será usado para enviar e receber mensagens pelo WhatsApp.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuração de Mensagens</h3>
            <div className="space-y-2">
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome_message"
                name="welcome_message"
                placeholder="Mensagem enviada quando um cliente inicia a conversa"
                value={config.welcome_message}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="establishment_info">Informações do Estabelecimento</Label>
              <Textarea
                id="establishment_info"
                name="establishment_info"
                placeholder="Informações adicionais sobre o estabelecimento para a IA (horário de funcionamento, serviços, localização, etc.)"
                value={config.establishment_info}
                onChange={handleChange}
                rows={6}
              />
              <p className="text-sm text-gray-500">
                Essas informações serão usadas pela IA para responder perguntas sobre o estabelecimento.
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleSaveConfig} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
