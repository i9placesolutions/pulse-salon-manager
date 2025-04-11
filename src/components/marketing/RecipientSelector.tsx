import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Users, Smartphone, Check, Loader2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchWhatsAppContacts, WhatsAppContact } from "@/lib/uazapiService";
import { toast } from "@/components/ui/use-toast";

type RecipientType = 'all' | 'vip' | 'inactive' | 'custom' | 'phone';

interface RecipientSelectorProps {
  value: RecipientType;
  onChange: (value: RecipientType) => void;
  selectedContactIds?: string[];
  onSelectedContactsChange?: (contactIds: string[]) => void;
}

export function RecipientSelector({ 
  value, 
  onChange, 
  selectedContactIds = [], 
  onSelectedContactsChange 
}: RecipientSelectorProps) {
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(selectedContactIds);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Buscar contatos da instância do WhatsApp
  useEffect(() => {
    if (value === 'phone' && !whatsappContacts.length && !isLoadingContacts) {
      loadWhatsAppContacts();
    }
  }, [value]);

  // Sincroniza os contatos selecionados com o prop selectedContactIds
  useEffect(() => {
    setSelectedContacts(selectedContactIds);
  }, [selectedContactIds]);

  // Quando os contatos selecionados mudam, notifica o componente pai
  useEffect(() => {
    if (onSelectedContactsChange && value === 'phone') {
      onSelectedContactsChange(selectedContacts);
    }
  }, [selectedContacts, onSelectedContactsChange, value]);

  // Função para carregar os contatos da instância
  const loadWhatsAppContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const response = await fetchWhatsAppContacts(100);
      setWhatsappContacts(response.contacts);
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar os contatos do WhatsApp. Verifique a conexão com a API.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Filtrar contatos com base na busca
  const filteredContacts = whatsappContacts.filter(contact => {
    const nameMatch = contact.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const numberMatch = contact.number?.includes(searchQuery);
    return nameMatch || numberMatch;
  });

  // Alternar seleção de um contato
  const toggleContactSelection = (contactId: string) => {
    const newSelectedContacts = selectedContacts.includes(contactId) 
      ? selectedContacts.filter(id => id !== contactId)
      : [...selectedContacts, contactId];
    
    setSelectedContacts(newSelectedContacts);
  };

  // Selecionar ou desselecionar todos os contatos
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  return (
    <div className="space-y-4">
      <Label>Destinatários</Label>
      <RadioGroup
        value={value}
        onValueChange={(newValue) => {
          onChange(newValue as RecipientType);
          if (newValue === 'phone') {
            setShowContactSelector(true);
          } else {
            setShowContactSelector(false);
          }
        }}
      >
        <div className="grid gap-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="recipients-all" />
            <Label htmlFor="recipients-all">Todos os clientes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vip" id="recipients-vip" />
            <Label htmlFor="recipients-vip">Clientes VIP</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="recipients-inactive" />
            <Label htmlFor="recipients-inactive">Clientes Inativos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="recipients-phone" />
            <Label htmlFor="recipients-phone" className="flex items-center">
              Contatos do Celular
              {whatsappContacts.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {whatsappContacts.length}
                </span>
              )}
              {isLoadingContacts && (
                <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />
              )}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="recipients-custom" />
            <Label htmlFor="recipients-custom">Seleção Personalizada</Label>
          </div>
        </div>
      </RadioGroup>

      {value === 'custom' && (
        <Button variant="outline" className="w-full mt-2">
          <Users className="mr-2 h-4 w-4" />
          Selecionar Contatos
        </Button>
      )}

      {value === 'phone' && showContactSelector && (
        <div className="mt-4 border rounded-md shadow-sm p-3 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-700">Contatos do WhatsApp</h3>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {isLoadingContacts ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-gray-500">
                  {selectedContacts.length} contatos selecionados
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleSelectAll} 
                  className="h-7 text-xs"
                >
                  {selectedContacts.length === filteredContacts.length
                    ? "Desmarcar todos"
                    : "Selecionar todos"}
                </Button>
              </div>
              
              <ScrollArea className="h-[200px]">
                {filteredContacts.length > 0 ? (
                  <div className="space-y-1">
                    {filteredContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex items-center p-2 hover:bg-blue-50 rounded-sm cursor-pointer"
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        <Checkbox 
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleContactSelection(contact.id)}
                          className="mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Avatar className="h-8 w-8 mr-2 bg-blue-100 text-blue-600">
                          <span className="text-xs font-medium">
                            {contact.name?.charAt(0).toUpperCase() || contact.pushname?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {contact.name || contact.pushname || "Contato"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{contact.formattedNumber || contact.number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <Search className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchQuery ? "Nenhum contato encontrado" : "Nenhum contato disponível"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
}
