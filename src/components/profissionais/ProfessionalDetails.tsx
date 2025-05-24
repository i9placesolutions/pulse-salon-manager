import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Professional,
  ProfessionalAppointment,
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance 
} from "@/types/professional";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Calendar,
  Clock,
  DollarSign,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  History,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { WorkingHoursForm } from "./WorkingHoursForm";
import { useProfessionalManagement } from "@/hooks/useProfessionalManagement";

interface ProfessionalDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: Professional;
  appointments: ProfessionalAppointment[];
  commissions: ProfessionalCommission[];
  payments: ProfessionalPayment[];
  performance: ProfessionalPerformance;
}

export const ProfessionalDetails = ({
  open,
  onOpenChange,
  professional,
  appointments,
  commissions,
  payments,
  performance,
}: ProfessionalDetailsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteProfessional } = useProfessionalManagement();

  const handleRegisterPayment = (payment: ProfessionalPayment) => {
    toast({
      title: "Pagamento registrado",
      description: `Pagamento de ${formatCurrency(payment.value)} foi registrado com sucesso.`,
    });
  };

  const handleSaveWorkingHours = (workingHours: any) => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de horário de trabalho foram salvas com sucesso.",
    });
  };
  
  // Função para lidar com a exclusão do profissional
  const handleDeleteProfessional = async () => {
    if (!professional || !professional.id) return;
    
    try {
      setIsDeleting(true);
      await deleteProfessional(professional.id);
      
      // Fechar o diálogo de confirmação e o modal de detalhes
      setShowDeleteDialog(false);
      onOpenChange(false);
      
      toast({
        title: "Profissional excluído",
        description: "O profissional foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o profissional. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSpecialtiesBadges = () => {
    if (!professional.specialties || professional.specialties.length === 0) {
      return <span className="text-muted-foreground">Nenhuma especialidade definida</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {professional.specialties.map((specialty) => (
          <Badge 
            key={specialty.id} 
            style={{ backgroundColor: specialty.color, color: "#fff" }}
          >
            {specialty.name}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
              {professional.name.charAt(0)}
            </span>
            {professional.name}
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  professional.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {professional.status === "active" ? "Ativo" : "Inativo"}
              </span>
              
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Excluir Profissional
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                        <p className="font-medium">Atenção:</p>
                        <p>Esta ação removerá permanentemente o profissional {professional.name} e todos os dados associados.</p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteProfessional} 
                      className="bg-red-500 hover:bg-red-600 text-white"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-center">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Horários</TabsTrigger>
            <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 rounded-lg">
              <div className="flex-shrink-0 w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-2 border-white shadow-md">
                {professional.avatar ? (
                  <img 
                    src={professional.avatar} 
                    alt={professional.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {professional.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-indigo-800">{professional.name}</h3>
                <div className="mt-1">
                  {renderSpecialtiesBadges()}
                </div>
                <div className="flex gap-3 mt-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    professional.status === "active"
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-red-400 to-rose-500 text-white"
                  }`}>
                    {professional.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                    {professional.experienceLevel === "beginner" ? "Iniciante" : 
                    professional.experienceLevel === "intermediate" ? "Intermediário" : "Avançado"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-200">
                <Award className="h-6 w-6 text-amber-600 mb-1" />
                <p className="font-bold text-lg text-amber-800">#{professional.monthRanking || '-'}</p>
                <p className="text-xs text-amber-600">Ranking</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="overflow-hidden border-indigo-200">
                <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <CardTitle className="text-indigo-700">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong className="text-indigo-700">Email:</strong> {professional.email}</p>
                  <p><strong className="text-indigo-700">Telefone:</strong> {professional.phone}</p>
                  <p><strong className="text-indigo-700">Especialidades:</strong></p>
                  <div className="ml-4">{renderSpecialtiesBadges()}</div>
                  <p><strong className="text-indigo-700">Data de Contratação:</strong> {new Date(professional.hiringDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong className="text-indigo-700">Dias de Trabalho:</strong> {professional.workingDays?.join(', ') || 'Não definido'}</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-emerald-200">
                <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                  <CardTitle className="text-emerald-700">Informações Profissionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong className="text-emerald-700">Nível de Experiência:</strong> {
                    professional.experienceLevel === 'beginner' ? 'Iniciante' : 
                    professional.experienceLevel === 'intermediate' ? 'Intermediário' : 'Avançado'
                  }</p>
                  <p><strong className="text-emerald-700">Status:</strong> {professional.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                  <p><strong className="text-emerald-700">Modelo de Pagamento:</strong> {professional.paymentModel === 'commission' ? 'Comissão' : 'Salário Fixo'}</p>
                  {professional.paymentModel === 'commission' && (
                    <p><strong className="text-emerald-700">Taxa de Comissão:</strong> {professional.commissionRate}%</p>
                  )}
                  {professional.paymentModel === 'fixed' && (
                    <p><strong className="text-emerald-700">Salário Fixo:</strong> {formatCurrency(professional.fixedSalary || 0)}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="overflow-hidden border-blue-200">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                <CardContent className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <p className="mt-2 text-2xl font-bold text-blue-700">{professional.totalAppointments}</p>
                  <p className="text-sm text-blue-600">Atendimentos</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-green-200">
                <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                <CardContent className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <p className="mt-2 text-2xl font-bold text-green-700">{formatCurrency(professional.totalCommission || 0)}</p>
                  <p className="text-sm text-green-600">Comissão Total</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-purple-200">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-fuchsia-500"></div>
                <CardContent className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <p className="mt-2 text-2xl font-bold text-purple-700">{formatCurrency(professional.averageMonthlyRevenue || 0)}</p>
                  <p className="text-sm text-purple-600">Média Mensal</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-amber-200">
                <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <CardContent className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-amber-100">
                  <Clock className="h-8 w-8 text-amber-600" />
                  <p className="mt-2 text-2xl font-bold text-amber-700">{professional.averageAppointmentDuration} min</p>
                  <p className="text-sm text-amber-600">Tempo Médio</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <WorkingHoursForm
              open={activeTab === "schedule"}
              onOpenChange={() => {}}
              workingHours={professional.workingHours}
              blockedDates={professional.blockedDates}
              onSave={handleSaveWorkingHours}
            />
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Atendimentos</CardTitle>
                <CardDescription>
                  Histórico de atendimentos do profissional
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{new Date(appointment.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{appointment.clientName}</TableCell>
                          <TableCell>{appointment.serviceName}</TableCell>
                          <TableCell>{formatCurrency(appointment.value)}</TableCell>
                          <TableCell>{formatCurrency(appointment.commission)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              appointment.status === 'confirmed' ? 'default' :
                              appointment.status === 'completed' ? 'default' :
                              appointment.status === 'canceled' ? 'destructive' : 'outline'
                            }>
                              {appointment.status === 'confirmed' ? 'Confirmado' :
                               appointment.status === 'completed' ? 'Concluído' :
                               appointment.status === 'canceled' ? 'Cancelado' :
                               appointment.status === 'pending' ? 'Pendente' : appointment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum atendimento registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Comissões</CardTitle>
                <CardDescription>
                  Histórico de comissões do profissional
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Referência</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell>{new Date(commission.paymentDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {commission.referenceType === 'service' ? 'Serviço' : 'Produto'}
                            </Badge>
                          </TableCell>
                          <TableCell>{commission.referenceName}</TableCell>
                          <TableCell>{formatCurrency(commission.value)}</TableCell>
                          <TableCell>
                            <Badge variant={commission.status === 'paid' ? 'default' : 'outline'}>
                              {commission.status === 'paid' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma comissão registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos</CardTitle>
                <CardDescription>
                  Histórico de pagamentos do profissional
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês Referência</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Pagamento</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.referenceMonth}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.type === 'commission' ? 'Comissão' : 'Salário'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(payment.value)}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'paid' ? 'default' : 'outline'}>
                              {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                          <TableCell>
                            {payment.status !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRegisterPayment(payment)}
                              >
                                Registrar Pagamento
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum pagamento registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMetrics performance={performance} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Histórico de Alterações
                </CardTitle>
                <CardDescription>
                  Registro de mudanças realizadas no cadastro do profissional
                </CardDescription>
              </CardHeader>
              <CardContent>
                {professional.history && professional.history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {professional.history.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium">{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{item.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">Nenhuma alteração registrada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
