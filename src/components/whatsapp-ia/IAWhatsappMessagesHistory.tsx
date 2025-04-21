import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { MessageSquare, UserIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';

type Message = {
  id: string;
  client_phone: string;
  client_name: string;
  message_type: 'text' | 'audio' | 'image' | 'video' | 'document';
  message_content: string;
  is_from_client: boolean;
  audio_transcription?: string;
  created_at: string;
  processed: boolean;
  processing_error?: string;
}

export const IAWhatsappMessagesHistory: React.FC = () => {
  const { user } = useAppState();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (user.currentUser?.id) {
      fetchMessages();
    }
  }, [user.currentUser, currentPage, phoneFilter, messageTypeFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Construir a query base
      let query = supabase
        .from('whatsapp_ia_messages')
        .select('*', { count: 'exact' })
        .eq('establishment_id', user.currentUser?.id)
        .order('created_at', { ascending: false });
      
      // Aplicar filtros se existirem
      if (phoneFilter) {
        query = query.ilike('client_phone', `%${phoneFilter}%`);
      }
      
      if (messageTypeFilter) {
        query = query.eq('message_type', messageTypeFilter);
      }
      
      // Aplicar paginação
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query.range(from, to);
      
      if (error) {
        throw error;
      }
      
      setMessages(data || []);
      
      // Calcular total de páginas
      if (count !== null) {
        setTotalPages(Math.ceil(count / pageSize));
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de mensagens.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneFilter(e.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao aplicar filtro
  };

  const handleMessageTypeFilterChange = (value: string) => {
    setMessageTypeFilter(value);
    setCurrentPage(1); // Resetar para a primeira página ao aplicar filtro
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPhone = (phone: string) => {
    // Remove prefixo internacional se existir, deixando apenas o número local
    const cleanPhone = phone.replace(/^\+\d+/, '');
    return cleanPhone;
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Texto';
      case 'audio': return 'Áudio';
      case 'image': return 'Imagem';
      case 'video': return 'Vídeo';
      case 'document': return 'Documento';
      default: return type;
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'audio' && message.audio_transcription) {
      return (
        <div>
          <Badge variant="outline" className="mb-1">Áudio</Badge>
          <div className="text-sm">
            <span className="font-semibold">Transcrição:</span> {message.audio_transcription}
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-md truncate">
        {message.message_content}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Filtrar por telefone"
                value={phoneFilter}
                onChange={handlePhoneFilterChange}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={messageTypeFilter} onValueChange={handleMessageTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="audio">Áudio</SelectItem>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setPhoneFilter('');
                setMessageTypeFilter('');
                setCurrentPage(1);
              }}
            >
              Limpar Filtros
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando mensagens...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma mensagem encontrada.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="hidden md:table-cell">Conteúdo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(message.created_at)}
                        </TableCell>
                        <TableCell>
                          {message.client_name ? (
                            <div>
                              <div>{message.client_name}</div>
                              <div className="text-xs text-muted-foreground">{formatPhone(message.client_phone)}</div>
                            </div>
                          ) : (
                            formatPhone(message.client_phone)
                          )}
                        </TableCell>
                        <TableCell>
                          {message.is_from_client ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              Cliente
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                              <MessageSquare className="h-3 w-3" />
                              IA
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getMessageTypeLabel(message.message_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-sm hidden md:table-cell">
                          {renderMessageContent(message)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              isActive={pageNum === currentPage}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
