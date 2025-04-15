import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  Payment,
  Professional,
  RevenueData,
  AccountReceivable,
  Expense,
  CashFlow,
  TaxRecord,
  PaymentMethodConfig,
  ExpenseSplit
} from "@/types/financial";

export const useFinancialManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [paymentMethodConfigs, setPaymentMethodConfigs] = useState<PaymentMethodConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  // Função principal para carregar todos os dados financeiros
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadPayments(),
        loadProfessionals(),
        loadRevenueData(),
        loadAccountsReceivable(),
        loadExpenses(),
        loadCashFlow(),
        loadTaxRecords(),
        loadPaymentMethodConfigs()
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar dados financeiros",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // === FUNÇÕES PARA CARREGAMENTO DE DADOS ===

  // Carregar pagamentos
  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Converter dados do formato snake_case para camelCase
      const formattedData = data?.map(item => ({
        id: item.id,
        client: item.client,
        service: item.service,
        value: item.value,
        method: item.method,
        date: item.date,
        status: item.status,
        taxes: item.taxes,
        fees: item.fees,
        pixKey: item.pix_key,
        cardBrand: item.card_brand,
        installments: item.installments
      })) || [];
      
      setPayments(formattedData);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    }
  };

  // Carregar profissionais
  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.name,
        commission: item.commission,
        services: item.services,
        status: item.status
      })) || [];
      
      setProfessionals(formattedData);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  // Carregar dados de receita
  const loadRevenueData = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue_data')
        .select('*')
        .order('date');

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        revenue: item.revenue,
        expenses: item.expenses,
        forecast: item.forecast_revenue && item.forecast_expenses ? {
          revenue: item.forecast_revenue,
          expenses: item.forecast_expenses
        } : undefined
      })) || [];
      
      setRevenueData(formattedData);
    } catch (error) {
      console.error("Erro ao carregar dados de receita:", error);
    }
  };

  // Carregar contas a receber
  const loadAccountsReceivable = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .order('due_date');

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.id,
        client: item.client,
        value: item.value,
        dueDate: item.due_date,
        status: item.status,
        installment: item.installment
      })) || [];
      
      setAccountsReceivable(formattedData);
    } catch (error) {
      console.error("Erro ao carregar contas a receber:", error);
    }
  };

  // Carregar despesas
  const loadExpenses = async () => {
    try {
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;
      
      // Carregar os splits de despesas para cada despesa
      const expensesWithSplits = await Promise.all(
        (expensesData || []).map(async (expense) => {
          const { data: splitsData, error: splitsError } = await supabase
            .from('expense_splits')
            .select('*')
            .eq('expense_id', expense.id);
            
          if (splitsError) throw splitsError;
          
          const splits = splitsData?.map(split => ({
            department: split.department,
            percentage: split.percentage,
            value: split.value
          })) || [];
          
          return {
            id: expense.id,
            name: expense.name,
            value: expense.value,
            date: expense.date,
            category: expense.category,
            status: expense.status,
            isRecurring: expense.is_recurring,
            costCenter: expense.cost_center,
            taxRate: expense.tax_rate,
            taxValue: expense.tax_value,
            taxDueDate: expense.tax_due_date,
            split: splits
          };
        })
      );
      
      setExpenses(expensesWithSplits);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    }
  };

  // Carregar fluxo de caixa
  const loadCashFlow = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.id,
        date: item.date,
        type: item.type,
        category: item.category,
        description: item.description,
        value: item.value,
        status: item.status,
        paymentMethod: item.payment_method,
        relatedDocument: item.related_document,
        isRecurring: item.is_recurring
      })) || [];
      
      setCashFlow(formattedData);
    } catch (error) {
      console.error("Erro ao carregar fluxo de caixa:", error);
    }
  };

  // Carregar registros de impostos
  const loadTaxRecords = async () => {
    try {
      const { data: taxData, error: taxError } = await supabase
        .from('tax_records')
        .select('*')
        .order('due_date');

      if (taxError) throw taxError;
      
      // Carregar anexos para cada registro de imposto
      const taxRecordsWithAttachments = await Promise.all(
        (taxData || []).map(async (tax) => {
          const { data: attachmentsData, error: attachmentsError } = await supabase
            .from('tax_attachments')
            .select('file_path')
            .eq('tax_record_id', tax.id);
            
          if (attachmentsError) throw attachmentsError;
          
          const attachments = attachmentsData?.map(attachment => attachment.file_path) || [];
          
          return {
            id: tax.id,
            name: tax.name,
            type: tax.type,
            value: tax.value,
            baseValue: tax.base_value,
            rate: tax.rate,
            dueDate: tax.due_date,
            status: tax.status,
            paymentDate: tax.payment_date,
            attachments: attachments
          };
        })
      );
      
      setTaxRecords(taxRecordsWithAttachments);
    } catch (error) {
      console.error("Erro ao carregar registros de impostos:", error);
    }
  };

  // Carregar configurações de métodos de pagamento
  const loadPaymentMethodConfigs = async () => {
    try {
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_method_configs')
        .select('*');

      if (methodsError) throw methodsError;
      
      const configsWithDetails = await Promise.all(
        (methodsData || []).map(async (method) => {
          // Carregar chaves PIX se for do tipo PIX
          let pixKeys = [];
          let cardBrands = [];
          
          if (method.type === 'Pix') {
            const { data: pixData, error: pixError } = await supabase
              .from('pix_keys')
              .select('*')
              .eq('payment_method_id', method.id);
              
            if (pixError) throw pixError;
            
            pixKeys = pixData?.map(key => ({
              key: key.key,
              type: key.type
            })) || [];
          }
          
          // Carregar bandeiras de cartão se for do tipo Cartão
          if (method.type === 'Cartão') {
            const { data: brandsData, error: brandsError } = await supabase
              .from('card_brands')
              .select('*')
              .eq('payment_method_id', method.id);
              
            if (brandsError) throw brandsError;
            
            cardBrands = brandsData?.map(brand => ({
              name: brand.name,
              enabled: brand.enabled,
              maxInstallments: brand.max_installments,
              minValue: brand.min_value,
              fees: {
                fixed: brand.fee_fixed,
                percentage: brand.fee_percentage
              }
            })) || [];
          }
          
          return {
            type: method.type,
            enabled: method.enabled,
            fees: {
              fixed: method.fee_fixed,
              percentage: method.fee_percentage
            },
            pixKeys: pixKeys.length > 0 ? pixKeys : undefined,
            cardBrands: cardBrands.length > 0 ? cardBrands : undefined
          };
        })
      );
      
      setPaymentMethodConfigs(configsWithDetails);
    } catch (error) {
      console.error("Erro ao carregar configurações de métodos de pagamento:", error);
    }
  };

  // === FUNÇÕES PARA CRIAÇÃO, ATUALIZAÇÃO E REMOÇÃO ===

  // Adicionar um novo pagamento
  const addPayment = async (payment: Omit<Payment, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          client: payment.client,
          service: payment.service,
          value: payment.value,
          method: payment.method,
          date: payment.date,
          status: payment.status,
          taxes: payment.taxes,
          fees: payment.fees,
          pix_key: payment.pixKey,
          card_brand: payment.cardBrand,
          installments: payment.installments
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newPayment: Payment = {
          id: data[0].id,
          client: data[0].client,
          service: data[0].service,
          value: data[0].value,
          method: data[0].method,
          date: data[0].date,
          status: data[0].status,
          taxes: data[0].taxes,
          fees: data[0].fees,
          pixKey: data[0].pix_key,
          cardBrand: data[0].card_brand,
          installments: data[0].installments
        };
        
        setPayments(current => [newPayment, ...current]);
        return newPayment;
      }
      
      throw new Error("Erro ao adicionar pagamento.");
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status de um pagamento
  const updatePaymentStatus = async (id: number, status: Payment['status']) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status, updated_at: new Date() })
        .eq('id', id);
        
      if (error) throw error;
      
      setPayments(current => 
        current.map(payment => 
          payment.id === id ? { ...payment, status } : payment
        )
      );
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status do pagamento:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar uma nova conta a receber
  const addAccountReceivable = async (account: Omit<AccountReceivable, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert({
          client: account.client,
          value: account.value,
          due_date: account.dueDate,
          status: account.status,
          installment: account.installment
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newAccount: AccountReceivable = {
          id: data[0].id,
          client: data[0].client,
          value: data[0].value,
          dueDate: data[0].due_date,
          status: data[0].status,
          installment: data[0].installment
        };
        
        setAccountsReceivable(current => [...current, newAccount]);
        return newAccount;
      }
      
      throw new Error("Erro ao adicionar conta a receber.");
    } catch (error) {
      console.error("Erro ao adicionar conta a receber:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status de uma conta a receber
  const updateAccountReceivableStatus = async (id: number, status: AccountReceivable['status']) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({ status, updated_at: new Date() })
        .eq('id', id);
        
      if (error) throw error;
      
      setAccountsReceivable(current => 
        current.map(account => 
          account.id === id ? { ...account, status } : account
        )
      );
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status da conta a receber:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar nova despesa
  const addExpense = async (expense: Omit<Expense, "id">) => {
    setIsLoading(true);
    try {
      // Primeiro inserir a despesa
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          name: expense.name,
          value: expense.value,
          date: expense.date,
          category: expense.category,
          status: expense.status,
          is_recurring: expense.isRecurring,
          cost_center: expense.costCenter,
          tax_rate: expense.taxRate,
          tax_value: expense.taxValue,
          tax_due_date: expense.taxDueDate
        })
        .select();
        
      if (error) throw error;
      
      if (!data || !data[0]) {
        throw new Error("Erro ao adicionar despesa.");
      }
      
      const newExpenseId = data[0].id;
      
      // Se houver split, inserir os splits
      if (expense.split && expense.split.length > 0) {
        const splitsToInsert = expense.split.map(split => ({
          expense_id: newExpenseId,
          department: split.department,
          percentage: split.percentage,
          value: split.value
        }));
        
        const { error: splitError } = await supabase
          .from('expense_splits')
          .insert(splitsToInsert);
          
        if (splitError) throw splitError;
      }
      
      // Recarregar as despesas para garantir dados atualizados
      await loadExpenses();
      
      return newExpenseId;
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status de uma despesa
  const updateExpenseStatus = async (id: number, status: Expense['status']) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status, updated_at: new Date() })
        .eq('id', id);
        
      if (error) throw error;
      
      setExpenses(current => 
        current.map(expense => 
          expense.id === id ? { ...expense, status } : expense
        )
      );
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status da despesa:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar item ao fluxo de caixa
  const addCashFlowItem = async (item: Omit<CashFlow, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cash_flow')
        .insert({
          date: item.date,
          type: item.type,
          category: item.category,
          description: item.description,
          value: item.value,
          status: item.status,
          payment_method: item.paymentMethod,
          related_document: item.relatedDocument,
          is_recurring: item.isRecurring
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newItem: CashFlow = {
          id: data[0].id,
          date: data[0].date,
          type: data[0].type,
          category: data[0].category,
          description: data[0].description,
          value: data[0].value,
          status: data[0].status,
          paymentMethod: data[0].payment_method,
          relatedDocument: data[0].related_document,
          isRecurring: data[0].is_recurring
        };
        
        setCashFlow(current => [newItem, ...current]);
        return newItem;
      }
      
      throw new Error("Erro ao adicionar item ao fluxo de caixa.");
    } catch (error) {
      console.error("Erro ao adicionar item ao fluxo de caixa:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar fluxo de caixa
  const updateCashFlow = async (items: CashFlow[]) => {
    setCashFlow(items);
    // Aqui você poderia implementar uma sincronização com o banco de dados se necessário
  };

  // Atualizar status de um imposto
  const updateTaxStatus = async (id: number, status: TaxRecord['status'], paymentDate?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tax_records')
        .update({ 
          status, 
          payment_date: paymentDate || null,
          updated_at: new Date() 
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setTaxRecords(current => 
        current.map(tax => 
          tax.id === id ? { 
            ...tax, 
            status,
            paymentDate: paymentDate
          } : tax
        )
      );
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status do imposto:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    payments,
    professionals,
    revenueData,
    accountsReceivable,
    expenses,
    cashFlow,
    taxRecords,
    paymentMethodConfigs,
    isLoading,
    
    // Métodos de carregamento
    loadAllData,
    loadPayments,
    loadProfessionals,
    loadRevenueData,
    loadAccountsReceivable,
    loadExpenses,
    loadCashFlow,
    loadTaxRecords,
    loadPaymentMethodConfigs,
    
    // Métodos de CRUD
    addPayment,
    updatePaymentStatus,
    addAccountReceivable,
    updateAccountReceivableStatus,
    addExpense,
    updateExpenseStatus,
    addCashFlowItem,
    updateCashFlow,
    updateTaxStatus
  };
};
