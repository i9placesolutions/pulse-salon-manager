
import { formatDate, formatCampaignType, formatCampaignStatus } from '../formatters';
import { exportCampaignToPDF } from '../pdfExport';

// Definindo tipos para os objetos usados na exportação
interface CampaignData {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: string;
  metrics: {
    totalUses: number;
    totalCustomers: number;
    conversionRate: number;
    averageSpend: number;
    totalRevenue: number;
    redemptionRate: number;
  };
}

interface UsageData {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  date: string;
  amount: number;
  serviceOrProduct: string;
}

interface ColumnDefinition<T> {
  key: keyof T | ((item: T) => string | number);
  label: string;
  format?: (value: any) => string;
}

/**
 * Exporta dados no formato adequado para o relatório de campanhas de marketing
 * @param campaignData Dados da campanha
 * @param usageData Dados de uso da campanha
 * @param filename Nome do arquivo
 */
export function exportCampaignReport(
  campaignData: CampaignData,
  usageData: UsageData[],
  filename: string = 'relatorio-campanha'
): void {
  // Informações da campanha
  const campaignInfo = [
    { label: 'Nome da Campanha', value: campaignData.name },
    { label: 'Tipo', value: formatCampaignType(campaignData.type) },
    { label: 'Data de Início', value: new Date(campaignData.startDate).toLocaleDateString('pt-BR') },
    ...(campaignData.endDate 
      ? [{ label: 'Data de Término', value: new Date(campaignData.endDate).toLocaleDateString('pt-BR') }] 
      : []),
    { label: 'Status', value: formatCampaignStatus(campaignData.status) },
    { label: 'Total de Usos', value: campaignData.metrics.totalUses },
    { label: 'Clientes Únicos', value: campaignData.metrics.totalCustomers },
    { label: 'Taxa de Conversão', value: `${campaignData.metrics.conversionRate}%` },
    { label: 'Gasto Médio', value: `R$ ${campaignData.metrics.averageSpend.toFixed(2)}` },
    { label: 'Receita Total', value: `R$ ${campaignData.metrics.totalRevenue.toFixed(2)}` },
    { label: 'Taxa de Resgate', value: `${campaignData.metrics.redemptionRate}%` },
  ];

  // Cabeçalho
  let csvContent = "Relatório de Campanha\n\n";
  
  // Informações da campanha
  campaignInfo.forEach(info => {
    csvContent += `${info.label},${info.value}\n`;
  });
  
  // Espaço em branco
  csvContent += "\n\nHistórico de Uso\n\n";
  
  // Definindo as colunas com tipo genérico
  const usageColumns: ColumnDefinition<UsageData>[] = [
    { 
      key: (item: UsageData) => item.customer.name, 
      label: 'Cliente' 
    },
    { 
      key: 'date',
      label: 'Data', 
      format: (value: string) => new Date(value).toLocaleDateString('pt-BR') 
    },
    { 
      key: 'serviceOrProduct', 
      label: 'Serviço/Produto' 
    },
    { 
      key: 'amount', 
      label: 'Valor (R$)', 
      format: (value: number) => value.toFixed(2) 
    }
  ];
  
  // Cabeçalho do histórico
  csvContent += usageColumns.map(col => col.label).join(',') + '\n';
  
  // Linhas de dados
  usageData.forEach(usage => {
    const row = usageColumns.map(col => {
      let value: any;
      
      if (typeof col.key === 'function') {
        value = col.key(usage);
      } else {
        value = usage[col.key];
      }
      
      // Aplicar formatação se existir
      if (col.format && value !== undefined) {
        value = col.format(value);
      }
      
      return `"${value}"`;
    }).join(',');
    
    csvContent += row + '\n';
  });
  
  // Cria o arquivo e faz o download
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${formatDate(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exporta também relatórios em PDF
export { exportCampaignToPDF };
