import axios from 'axios';

/**
 * Interface para resposta de texto da OpenAI
 */
interface OpenAITextResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Interface para resposta de transcrição de áudio da OpenAI
 */
interface OpenAIAudioResponse {
  text: string;
}

/**
 * Classe de serviço para integração com a OpenAI
 */
export class OpenAIService {
  private apiKey: string;
  
  /**
   * Construtor do serviço OpenAI
   * 
   * @param apiKey Chave de API da OpenAI
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Testa a conexão com a API da OpenAI
   * 
   * @returns Verdadeiro se a conexão estiver funcionando
   */
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
          max_tokens: 5
        },
        {
          headers: this.getHeaders()
        }
      );
      
      return true;
    } catch (error) {
      console.error('Erro no teste de conexão com OpenAI:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
  
  /**
   * Processa uma mensagem com o ChatGPT
   * 
   * @param prompt Template do prompt com instruções para o AI
   * @param message Mensagem do usuário
   * @param context Contexto adicional (dados do estabelecimento, etc)
   * @param conversationHistory Histórico de conversa anterior
   * @returns Resposta gerada pelo ChatGPT
   */
  async processMessage(
    prompt: string,
    message: string,
    context: Record<string, string>,
    conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    try {
      // Substituir variáveis no prompt
      let systemPrompt = prompt;
      Object.entries(context).forEach(([key, value]) => {
        systemPrompt = systemPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      
      // Montar a sequência de mensagens
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory,
        { role: 'user' as const, content: message }
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
          headers: this.getHeaders()
        }
      );
      
      const data = response.data as OpenAITextResponse;
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao processar mensagem com OpenAI:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
  
  /**
   * Transcreve um áudio para texto usando o modelo Whisper
   * 
   * @param audioBuffer Buffer do arquivo de áudio
   * @param fileName Nome do arquivo
   * @returns Texto transcrito
   */
  async transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
    try {
      // Criar FormData para envio do arquivo
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
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const data = response.data as OpenAIAudioResponse;
      return data.text.trim();
    } catch (error) {
      console.error('Erro ao transcrever áudio com OpenAI:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
  
  /**
   * Retorna os cabeçalhos padrão para as requisições
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Extrai mensagem de erro mais útil de um erro
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData?.error?.message) {
        return errorData.error.message;
      }
      return error.message;
    }
    return 'Erro desconhecido na comunicação com OpenAI';
  }
}
