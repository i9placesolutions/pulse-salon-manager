// Serviço de integração com a OpenAI
import axios from 'axios';

// Interface para as respostas da API da OpenAI
interface OpenAITextResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface OpenAIAudioResponse {
  text: string;
}

interface OpenAIError {
  response?: {
    data?: {
      error?: {
        message: string;
      };
    };
  };
  message: string;
}

class OpenAIService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Método para testar a conexão com a API
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Você é um assistente útil.' },
            { role: 'user', content: 'Teste de conexão. Responda apenas com "OK".' }
          ],
          temperature: 0.7,
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão com OpenAI:', error);
      const err = error as OpenAIError;
      const errorMessage = err.response?.data?.error?.message || err.message;
      throw new Error(`Falha na conexão: ${errorMessage}`);
    }
  }
  
  // Método para processar mensagens de texto usando o ChatGPT
  async processMessage(
    message: string, 
    establishmentInfo: string,
    conversationHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = []
  ): Promise<string> {
    try {
      const systemMessage = `Você é um assistente virtual de um salão de beleza. 
        Seja sempre cordial e profissional. 
        Informações sobre o estabelecimento: ${establishmentInfo}
        
        Suas funções principais são:
        1. Agendar horários para clientes
        2. Confirmar agendamentos existentes
        3. Reagendar horários
        4. Responder perguntas sobre serviços, preços e disponibilidade
        5. Fornecer informações gerais sobre o salão
        
        Seja direto e objetivo em suas respostas.`;
      
      // Preparar o histórico da conversa
      const messages = [
        { role: 'system', content: systemMessage },
        ...conversationHistory,
        { role: 'user', content: message }
      ];
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = response.data as OpenAITextResponse;
      return data.choices[0].message.content.trim();
    } catch (error) {
      const err = error as OpenAIError;
      console.error('Erro ao processar mensagem com OpenAI:', err);
      const errorMessage = err.response?.data?.error?.message || err.message;
      throw new Error(`Falha ao processar mensagem: ${errorMessage}`);
    }
  }
  
  // Método para transcrever áudios usando o Whisper
  async transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
    try {
      // Criar um FormData para enviar o arquivo de áudio
      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
      formData.append('file', blob, fileName);
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');
      
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const data = response.data as OpenAIAudioResponse;
      return data.text.trim();
    } catch (error) {
      const err = error as OpenAIError;
      console.error('Erro ao transcrever áudio com OpenAI:', err);
      const errorMessage = err.response?.data?.error?.message || err.message;
      throw new Error(`Falha ao transcrever áudio: ${errorMessage}`);
    }
  }
}

export default OpenAIService;
