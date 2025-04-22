// Serviço de integração com ChatGPT 3.5
import axios from 'axios';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class ChatGPTService {
  private apiKey: string;
  private model: string = 'gpt-3.5-turbo';
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Enviar mensagem para o ChatGPT e obter resposta
  async sendMessage(
    messages: ChatMessage[],
    systemPrompt: string = '',
  ): Promise<string> {
    try {
      // Adicionar system prompt se fornecido
      const fullMessages: ChatMessage[] = systemPrompt 
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : [...messages];

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 800,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }
      
      throw new Error('Resposta vazia do ChatGPT');
    } catch (error: any) {
      console.error('Erro ao se comunicar com ChatGPT:', error);
      
      if (error.response && error.response.data) {
        console.error('Detalhes do erro:', error.response.data);
      }
      
      throw new Error(`Falha ao processar mensagem: ${error.message}`);
    }
  }

  // Função específica para transcrever áudio
  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      // Obter o arquivo de áudio da URL
      const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(audioResponse.data);

      // Criar formdata com o arquivo de áudio
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
      formData.append('file', audioBlob, 'audio.ogg');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      // Enviar para a API de transcrição
      const transcriptionResponse = await axios.post(
        `${this.baseUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (transcriptionResponse.data && transcriptionResponse.data.text) {
        return transcriptionResponse.data.text.trim();
      }

      throw new Error('Resposta de transcrição vazia');
    } catch (error: any) {
      console.error('Erro ao transcrever áudio:', error);
      
      if (error.response && error.response.data) {
        console.error('Detalhes do erro de transcrição:', error.response.data);
      }
      
      throw new Error(`Falha ao transcrever áudio: ${error.message}`);
    }
  }

  // Verificar se a chave da API é válida
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Teste de validação de API key' }],
          max_tokens: 5
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Erro ao validar API key do ChatGPT:', error);
      return false;
    }
  }
}

export default ChatGPTService;
