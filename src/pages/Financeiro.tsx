import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, FileUp, Calendar, Filter, Eye, Settings, RotateCcw, FileText, FileSpreadsheet } from "lucide-react";
import { SummaryCards } from "@/components/financeiro/SummaryCards";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import { PaymentsList } from "@/components/financeiro/PaymentsList";
import { ProfessionalsList } from "@/components/financeiro/ProfessionalsList";
import { AccountsReceivable } from "@/components/financeiro/AccountsReceivable";
import { ExpensesList } from "@/components/financeiro/ExpensesList";
import { NewRevenueDialog } from "@/components/financeiro/NewRevenueDialog";
import { NewExpenseDialog } from "@/components/financeiro/NewExpenseDialog";
import { CashFlowPanel } from "@/components/financeiro/CashFlowPanel";
import { CostControlPanel } from "@/components/financeiro/CostControlPanel";
import { TaxManagementPanel } from "@/components/financeiro/TaxManagementPanel";
import { useToast } from "@/hooks/use-toast";
import { useFinancialManagement } from "@/hooks/useFinancialManagement";
import {
  Payment,
  Professional,
  RevenueData,
  AccountReceivable,
  Expense,
  CashFlow,
  TaxRecord,
  PaymentMethodConfig
} from "@/types/financial";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  calculateTotalRevenue, 
  calculateTotalExpenses, 
  calculateCashFlowBalance,
  getOverdueAccounts,
  countOverdueAccounts
} from '@/utils/financial';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { sub, format, parse, isAfter, isBefore, add } from "date-fns";
import { DateRange } from "react-day-picker";
import { PeriodSelectButton } from "@/components/financeiro/PeriodSelectButton";
import { FinancialProjections } from "@/components/financeiro/FinancialProjections";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

const Financeiro = () => {
  const {
    payments,
    professionals,
    revenueData,
    accountsReceivable,
    expenses,
    cashFlow,
    taxRecords,
    paymentMethodConfigs,
    isLoading,
    updateCashFlow,
    updateAccountReceivableStatus,
    updateExpenseStatus,
    addPayment,
    addExpense,
    addCashFlowItem,
    updateTaxStatus
  } = useFinancialManagement();
  const [view, setView] = useState<"week" | "month" | "year">("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { toast } = useToast();
  
  // Usar os dados diretamente do hook para garantir sincronização com Supabase

  const handleUpdateCashFlow = async (newData: CashFlow[]) => {
    try {
      await updateCashFlow(newData);
      toast({
        title: "Fluxo de caixa atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o fluxo de caixa.",
        variant: "destructive"
      });
    }
  };

  // Função para marcar um item como pago/recebido
  const handleMarkItemAsPaid = async (type: 'expense' | 'account', id: number) => {
    try {
      if (type === 'expense') {
        await updateExpenseStatus(id, 'Pago');
        toast({
          title: "Despesa paga",
          description: "A despesa foi marcada como paga com sucesso.",
        });
      } else {
        await updateAccountReceivableStatus(id, 'Pago');
        toast({
          title: "Conta recebida",
          description: "A conta foi marcada como recebida com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a operação.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAlertItem = (item: Expense | AccountReceivable, action: string) => {
    if ('dueDate' in item) {
      // É uma conta a receber
      handleMarkItemAsPaid('account', item.id);
    } else {
      // É uma despesa
      handleMarkItemAsPaid('expense', item.id);
    }
    
    toast({
      title: action === "pagar" ? "Despesa marcada como paga" : "Pagamento registrado",
      description: `A atualização foi realizada com sucesso.`
    });
  };

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Financeiro" 
        subtitle="Controle de receitas, despesas e fluxo de caixa"
        variant="blue"
        badge="Finanças"
        action={
          <div className="flex space-x-2">

            <NewRevenueDialog />
            <NewExpenseDialog />
          </div>
        }
      />

      {/* SummaryCards movido para o topo, fora das abas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-700">Visão Geral Financeira</h2>
        </div>
        
        <SummaryCards 
          payments={payments} 
          expenses={expenses} 
          professionals={professionals} 
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full h-10 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <TabsTrigger 
            value="overview" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger 
            value="revenues" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileUp className="h-4 w-4" />
            <span className="font-medium">Receitas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">Despesas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="taxes"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium">Impostos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-8">
                <RevenueChart data={revenueData} period={view} setPeriod={setView} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <PaymentsList payments={payments} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfessionalsList professionals={professionals} />
              <AccountsReceivable 
                accounts={accountsReceivable} 
                onNewEntry={async (entry) => {
                  try {
                    await addCashFlowItem(entry);
                    toast({
                      title: "Receita adicionada",
                      description: "A entrada foi adicionada ao fluxo de caixa."
                    });
                  } catch (error) {
                    toast({
                      title: "Erro",
                      description: "Não foi possível adicionar a entrada ao fluxo de caixa.",
                      variant: "destructive"
                    });
                  }
                }} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-12">
                {/* Componente FinancialAlerts removido conforme existente */}
              </div>
            </div>
            
            <FinancialProjections 
              expenses={expenses}
              accountsReceivable={accountsReceivable}
              cashFlow={cashFlow}
            />
          </div>
        </TabsContent>

        <TabsContent value="revenues">
          <CashFlowPanel data={cashFlow} onUpdateData={handleUpdateCashFlow} />
        </TabsContent>

        <TabsContent value="expenses">
          <div className="space-y-4">
            <ExpensesList 
              expenses={expenses} 
              onUpdateExpense={async (updatedExpense) => {
                try {
                  await updateExpenseStatus(updatedExpense.id, updatedExpense.status);
                  toast({
                    title: "Despesa atualizada",
                    description: "O status da despesa foi atualizado com sucesso."
                  });
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Não foi possível atualizar a despesa.",
                    variant: "destructive"
                  });
                }
              }}
              onNewEntry={async (entry) => {
                try {
                  await addExpense(entry);
                  toast({
                    title: "Despesa adicionada",
                    description: "A despesa foi adicionada com sucesso."
                  });
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Não foi possível adicionar a despesa.",
                    variant: "destructive"
                  });
                }
              }}  
            />
            <CostControlPanel expenses={expenses} />
          </div>
        </TabsContent>

        <TabsContent value="taxes">
          <TaxManagementPanel taxes={taxRecords} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Financeiro;