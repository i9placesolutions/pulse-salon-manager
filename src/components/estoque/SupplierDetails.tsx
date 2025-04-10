import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Supplier } from "@/types/stock";
import { Building2, Phone, Mail, MapPin, FileText, Image, Upload, Calendar, Download, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Order {
  id: number;
  supplierId: number;
  date: string;
  total: number;
  status: string;
  notes?: string;
  attachments?: {
    id: number;
    name: string;
    type: "image" | "pdf" | "txt" | "other";
    url: string;
  }[];
}

interface SupplierDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function SupplierDetails({ 
  open, 
  onOpenChange, 
  supplier 
}: SupplierDetailsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const [viewingAttachment, setViewingAttachment] = useState<{id: number, url: string, name: string} | null>(null);
  
  // Mock de dados para histórico de pedidos
  const [orderHistory] = useState<Order[]>([
    {
      id: 1,
      supplierId: 1,
      date: "2024-03-10",
      total: 1250.90,
      status: "Entregue",
      notes: "Pedido de shampoos e condicionadores para estoque.",
      attachments: [
        {
          id: 1,
          name: "nota-fiscal-123.pdf",
          type: "pdf",
          url: "#"
        }
      ]
    },
    {
      id: 2,
      supplierId: 1,
      date: "2024-02-15",
      total: 875.50,
      status: "Entregue",
      notes: "Produtos para tratamento capilar.",
      attachments: [
        {
          id: 2,
          name: "pedido-fev-2024.pdf",
          type: "pdf",
          url: "#"
        },
        {
          id: 3,
          name: "foto-recebimento.jpg",
          type: "image",
          url: "#"
        }
      ]
    }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Pedido registrado",
      description: "O pedido foi registrado com sucesso no histórico do fornecedor.",
    });
    
    setIsNewOrderOpen(false);
    setSelectedFile(null);
    setOrderNote("");
    setOrderTotal("");
  };

  const getFileIcon = (type: string) => {
    if (type === "pdf" || type === "txt") return <FileText className="h-4 w-4" />;
    if (type === "image") return <Image className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  const getFileTypeFromName = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === "pdf") return "pdf";
    if (extension === "txt") return "txt";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) return "image";
    return "other";
  };

  if (!supplier) return null;

  const filteredOrders = orderHistory.filter(order => order.supplierId === supplier.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{supplier.name}</DialogTitle>
          <DialogDescription>
            {supplier.document}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="orders">Histórico de Pedidos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.document}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p>{supplier.phone}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <p>{supplier.email}</p>
                  </div>
                  
                  {supplier.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <p>{supplier.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Histórico de Pedidos</h3>
              <Button onClick={() => setIsNewOrderOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </div>
            
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Nenhum pedido registrado para este fornecedor.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsNewOrderOpen(true)}
                  >
                    Registrar Primeiro Pedido
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base">
                            Pedido #{order.id}
                          </CardTitle>
                          <div className="flex gap-2 items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Total</div>
                          <div className="text-lg">R$ {order.total.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {order.notes && (
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1">Observações</div>
                          <p className="text-sm text-muted-foreground">{order.notes}</p>
                        </div>
                      )}
                      
                      {order.attachments && order.attachments.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Anexos</div>
                          <div className="flex flex-wrap gap-2">
                            {order.attachments.map((attachment) => (
                              <Button 
                                key={attachment.id}
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-1 text-xs"
                                onClick={() => setViewingAttachment({
                                  id: attachment.id,
                                  url: attachment.url,
                                  name: attachment.name
                                })}
                              >
                                {getFileIcon(attachment.type)}
                                {attachment.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Modal para adicionar novo pedido */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Pedido</DialogTitle>
            <DialogDescription>
              Registre um novo pedido para {supplier.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderDate">Data do Pedido</Label>
                <Input
                  id="orderDate"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orderTotal">Valor Total</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                  <Input
                    id="orderTotal"
                    type="text"
                    className="pl-9"
                    value={orderTotal}
                    onChange={(e) => {
                      // Permitir apenas números e vírgula/ponto
                      const value = e.target.value.replace(/[^\d.,]/g, '');
                      setOrderTotal(value);
                    }}
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="orderNotes">Observações</Label>
                <Textarea
                  id="orderNotes"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Adicione detalhes sobre o pedido"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Anexar Arquivos</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.txt"
                  />
                  <Label
                    htmlFor="fileUpload"
                    className="cursor-pointer flex items-center justify-center gap-2 border h-10 px-4 py-2 rounded-md hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo
                  </Label>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center justify-between p-2 mt-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      {getFileIcon(getFileTypeFromName(selectedFile.name))}
                      <span className="text-sm truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOrderOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Pedido</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal para visualizar anexo */}
      <Dialog open={!!viewingAttachment} onOpenChange={() => setViewingAttachment(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{viewingAttachment?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="border rounded p-4 text-center">
              <p className="text-muted-foreground mb-4">
                Visualização não disponível na versão demonstrativa
              </p>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar Arquivo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
