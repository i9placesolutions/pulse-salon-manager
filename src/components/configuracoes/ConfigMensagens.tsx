
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ConfigMensagens() {
  const templatesIniciais = [
    {
      titulo: 'Confirmação de Agendamento',
      descricao: 'Mensagem enviada após confirmar um horário',
      variaveis: ['nome_cliente', 'data_horario', 'servico'],
      conteudo: 'Olá {nome_cliente}, seu agendamento para {servico} foi confirmado para {data_horario}. Aguardamos você!',
      ativo: true
    },
    {
      titulo: 'Lembrete de Consulta',
      descricao: 'Mensagem enviada 24h antes do horário',
      variaveis: ['nome_cliente', 'data_horario', 'profissional'],
      conteudo: 'Olá {nome_cliente}, lembrete do seu horário amanhã às {data_horario} com {profissional}. Contamos com sua presença!',
      ativo: true
    },
    {
      titulo: 'Aniversário',
      descricao: 'Mensagem de felicitação de aniversário',
      variaveis: ['nome_cliente', 'cupom_desconto'],
      conteudo: 'Feliz aniversário, {nome_cliente}! Para comemorar, preparamos um presente especial para você: {cupom_desconto} de desconto na sua próxima visita.',
      ativo: false
    }
  ];

  const [templates, setTemplates] = useState(templatesIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [conteudoEditado, setConteudoEditado] = useState('');
  const [mostrarEmoticons, setMostrarEmoticons] = useState(false);

  type Template = typeof templatesIniciais[0];
  type TemplateComIndex = Template & { index: number };

  const [templateAtual, setTemplateAtual] = useState<TemplateComIndex | null>(null);

  const abrirModalEditar = (template: Template, index: number) => {
    setTemplateAtual({...template, index});
    setConteudoEditado(template.conteudo);
    setModalAberto(true);
    setMostrarEmoticons(false); // Reset para o padrão fechado ao abrir o modal
  };

  const salvarTemplate = () => {
    if (templateAtual) {
      const novosTemplates = [...templates];
      novosTemplates[templateAtual.index] = {
        ...novosTemplates[templateAtual.index],
        conteudo: conteudoEditado
      };
      setTemplates(novosTemplates);
      setModalAberto(false);
    }
  };
  
  const alternarAtivacao = (index: number, ativo: boolean) => {
    const novosTemplates = [...templates];
    novosTemplates[index].ativo = ativo;
    setTemplates(novosTemplates);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Templates de Mensagens</CardTitle>
          <CardDescription>
            Configure os modelos de mensagens automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" style={{marginTop: 0}}>
          <div className="grid gap-4">
            {templates.map((template, index) => (
              <div key={index} className="space-y-0 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{template.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{template.descricao}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id={`ativar-${index}`} 
                        checked={template.ativo} 
                        onCheckedChange={(checked) => {
                          const novosTemplates = [...templates];
                          novosTemplates[index].ativo = checked;
                          setTemplates(novosTemplates);
                        }}
                      />
                      <Label htmlFor={`ativar-${index}`} className="text-xs">
                        {template.ativo ? "Ativado" : "Desativado"}
                      </Label>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => abrirModalEditar(template, index)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Variáveis disponíveis</Label>
                  <div className="flex gap-2 mt-2">
                    {template.variaveis.map((variavel, idx) => (
                      <Badge key={idx} variant="secondary">
                        {variavel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="w-[95%] max-h-[90vh] overflow-y-auto max-w-[90%] sm:max-w-[550px] md:max-w-[650px] p-4 sm:p-6">
          <DialogHeader className="px-0 sm:px-2">
            <DialogTitle className="text-lg sm:text-xl">{templateAtual?.titulo}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {templateAtual?.descricao}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[calc(90vh-150px)] overflow-y-auto">
            <div>
              <Label htmlFor="template-message">Mensagem</Label>
              <Textarea
                id="template-message"
                value={conteudoEditado}
                onChange={(e) => setConteudoEditado(e.target.value)}
                className="h-32 mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Variáveis disponíveis</Label>
              <div className="flex flex-wrap gap-2">
                {templateAtual?.variaveis.map((variavel, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer" 
                    onClick={() => setConteudoEditado(prev => prev + ` {${variavel}}`)}
                  >
                    {variavel}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Clique nas variáveis para inseri-las no texto</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Emoticons</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMostrarEmoticons(!mostrarEmoticons)}
                  className="text-xs h-7 px-2"
                >
                  {mostrarEmoticons ? "Ocultar" : "Mostrar"} emoticons
                </Button>
              </div>
              
              {mostrarEmoticons && (
                <div className="bg-white border rounded-md p-2 transition-all">
                  <div className="grid grid-cols-4 xs:grid-cols-6 sm:grid-cols-8 gap-1 xs:gap-2 mb-2">
                    {["☺️", "😊", "😄", "😁", "😆", "😂", "🙂", "😉", 
                      "😍", "🥰", "😘", "💕", "👍", "👏", "🙏", "🚀",
                      "✨", "🎉", "🌟", "🎄", "🎁", "👋", "🏼", "🤗"]
                      .map((emoji, idx) => (
                      <button 
                        key={idx} 
                        className="text-base sm:text-xl hover:bg-gray-100 p-1 rounded" 
                        onClick={() => setConteudoEditado(prev => prev + emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 xs:grid-cols-6 sm:grid-cols-8 gap-1 xs:gap-2">
                    {["😢", "😭", "😩", "😔", "😟", "😕", "🙁", "😣", 
                      "👌", "👈", "👉", "💪", "👀", "🐶", "🐱", "👎",
                      "💋", "❤️", "💔", "💌", "🙌", "🌸", "🌹", "🌺"]
                      .map((emoji, idx) => (
                      <button 
                        key={idx} 
                        className="text-base sm:text-xl hover:bg-gray-100 p-1 rounded" 
                        onClick={() => setConteudoEditado(prev => prev + emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 mb-0">Clique nos emoticons para inseri-los no texto</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Prévia WhatsApp:</Label>
              <div className="rounded-lg overflow-hidden">
                {/* Background do WhatsApp */}
                <div className="bg-[#e5ddd5] p-3" style={{
                  backgroundImage: `url("data:image/png;base64,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")`
                }}>
                  <div className="bg-white p-3 rounded-lg shadow-sm" style={{maxWidth: "80%", marginLeft: "auto"}}>
                    <p className="text-sm relative">
                      {conteudoEditado
                        .replace(/{nome_cliente}/g, "Maria Silva")
                        .replace(/{data_horario}/g, "15/03 às 14:30")
                        .replace(/{servico}/g, "Corte de Cabelo")
                        .replace(/{profissional}/g, "Carlos")
                        .replace(/{cupom_desconto}/g, "15%")}
                    </p>
                    <span className="text-[0.6rem] text-gray-500 text-right block mt-1">14:25 ✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
            </DialogClose>
            <Button onClick={salvarTemplate} className="w-full sm:w-auto">Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
