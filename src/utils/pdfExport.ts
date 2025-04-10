// Utilitário para exportação de dados em formato PDF
import { jsPDF } from 'jspdf';
// Importação do plugin autoTable
import autoTable from 'jspdf-autotable';

// Funções auxiliares para formatação
function formatCampaignType(type: string): string {
  switch (type) {
    case 'discount': return 'Desconto';
    case 'coupon': return 'Cupom';
    case 'cashback': return 'Cashback';
    case 'vip': return 'Programa VIP';
    default: return type;
  }
}

function formatCampaignStatus(status: string): string {
  switch (status) {
    case 'active': return 'Ativa';
    case 'scheduled': return 'Agendada';
    case 'completed': return 'Concluída';
    case 'draft': return 'Rascunho';
    default: return status;
  }
}

/**
 * Gera e faz o download de um relatório de campanha em PDF
 * @param campaignData Dados da campanha
 * @param usageData Dados de uso da campanha
 * @param filename Nome do arquivo (sem extensão)
 * @returns true se o PDF foi gerado com sucesso
 */
export function exportCampaignToPDF(
  campaignData: {
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
  },
  usageData: {
    id: string;
    customer: {
      id: string;
      name: string;
    };
    date: string;
    amount: number;
    serviceOrProduct: string;
  }[],
  filename: string = 'relatorio-campanha'
): boolean {
  try {
    // Cria uma nova instância do jsPDF
    const doc = new jsPDF();
    
    // Configurações gerais do documento
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    
    // Função para adicionar linhas separadoras
    const addSeparator = (yPos: number) => {
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      return yPos + 8; // Retorna a nova posição Y após a linha
    };
    
    // Função para adicionar cabeçalhos de seção
    const addSectionHeader = (text: string, yPos: number) => {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text(text, margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      return yPos + 12;
    };
    
    // ========================
    // CABEÇALHO DO RELATÓRIO
    // ========================
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(41, 128, 185); // Azul do Pulse
    doc.text('RELATÓRIO DE CAMPANHA', pageWidth / 2, 20, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Adiciona a data do relatório
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${today}`, pageWidth - margin, 20, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    let yPos = 30; // Posição inicial após o cabeçalho
    
    // ========================
    // INFORMAÇÕES DA CAMPANHA
    // ========================
    yPos = addSectionHeader('Informações da Campanha', yPos);
    
    // Cria uma tabela com duas colunas para as informações da campanha
    const campaignInfo = [
      ['Nome', campaignData.name],
      ['Tipo', formatCampaignType(campaignData.type)],
      ['Data de Início', new Date(campaignData.startDate).toLocaleDateString('pt-BR')]
    ];
    
    if (campaignData.endDate) {
      campaignInfo.push(['Data de Término', new Date(campaignData.endDate).toLocaleDateString('pt-BR')]);
    }
    
    campaignInfo.push(['Status', formatCampaignStatus(campaignData.status)]);
    
    // Adiciona a tabela de informações da campanha
    autoTable(doc, {
      startY: yPos,
      body: campaignInfo,
      theme: 'plain',
      styles: { 
        fontSize: 11,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 }
      }
    });
    
    // Atualiza a posição Y após a tabela
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Adiciona um separador
    yPos = addSeparator(yPos);

    // ========================
    // MÉTRICAS DA CAMPANHA
    // ========================
    yPos = addSectionHeader('Métricas da Campanha', yPos);
    
    // Prepara os dados de métricas em duas colunas para exibição mais organizada
    const metricsDataLeft = [
      ['Total de Usos', campaignData.metrics.totalUses.toString()],
      ['Taxa de Conversão', `${campaignData.metrics.conversionRate}%`],
      ['Receita Total', `R$ ${campaignData.metrics.totalRevenue.toFixed(2)}`]
    ];
    
    const metricsDataRight = [
      ['Clientes Únicos', campaignData.metrics.totalCustomers.toString()],
      ['Gasto Médio', `R$ ${campaignData.metrics.averageSpend.toFixed(2)}`],
      ['Taxa de Resgate', `${campaignData.metrics.redemptionRate}%`]
    ];
    
    // Primeira coluna de métricas (lado esquerdo)
    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: metricsDataLeft,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: margin },
      tableWidth: contentWidth / 2 - 5
    });
    
    // Segunda coluna de métricas (lado direito)
    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: metricsDataRight,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: pageWidth / 2 }
    });
    
    // Atualiza a posição Y após as duas tabelas
    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Adiciona um separador
    yPos = addSeparator(yPos);

    // ========================
    // HISTÓRICO DE USO
    // ========================
    yPos = addSectionHeader('Histórico de Uso', yPos);

    try {
      // Limita o número de entradas para evitar documentos muito grandes
      const limitedUsageData = usageData.slice(0, 50);
      
      // Verifica se há dados de uso para exibir
      if (limitedUsageData.length > 0) {
        const usageTableData = limitedUsageData.map(usage => [
          usage.customer.name,
          new Date(usage.date).toLocaleDateString('pt-BR'),
          usage.serviceOrProduct,
          `R$ ${usage.amount.toFixed(2)}`
        ]);

        try {
          // Tabela de histórico de uso
          autoTable(doc, {
            startY: yPos,
            head: [['Cliente', 'Data', 'Serviço/Produto', 'Valor']],
            body: usageTableData,
            theme: 'striped',
            headStyles: { 
              fillColor: [41, 128, 185], 
              textColor: 255,
              fontStyle: 'bold' 
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240]
            },
            styles: { 
              fontSize: 9,
              cellPadding: 4 
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 35 },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 35, halign: 'right' }
            }
          });
          
          // Atualiza a posição Y após a tabela
          const docWithTable = doc as unknown as { lastAutoTable?: { finalY: number } };
          if (docWithTable.lastAutoTable) {
            yPos = docWithTable.lastAutoTable.finalY + 5;
          }
          
        } catch (tableError) {
          console.error('Erro ao criar tabela de histórico:', tableError);
          // Se falhar ao adicionar a tabela de histórico, adiciona uma mensagem
          doc.text('Não foi possível gerar a tabela de histórico de uso', margin, yPos + 10);
          yPos += 20;
        }
      } else {
        // Se não houver dados de uso para exibir
        doc.setFontSize(10);
        doc.text('Nenhum registro de uso encontrado para esta campanha.', margin, yPos + 10);
        yPos += 20;
      }
    } catch (error) {
      console.error('Erro ao adicionar tabela de histórico:', error);
      // Se falhar ao adicionar a tabela, pelo menos adicionamos uma mensagem
      doc.text('Não foi possível incluir o histórico de uso.', margin, yPos + 10);
      yPos += 20;
    }
    
    // ========================
    // RODAPÉ DO RELATÓRIO
    // ========================
    // @ts-ignore - O tipo não inclui getNumberOfPages, mas o método existe
    const totalPages = doc.internal.getNumberOfPages();
    
    // Adiciona informações de rodapé em todas as páginas
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Adiciona uma linha separadora no rodapé
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(
        margin, 
        doc.internal.pageSize.getHeight() - 15, 
        pageWidth - margin, 
        doc.internal.pageSize.getHeight() - 15
      );
      
      // Adiciona o texto do rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      // Lado esquerdo: Nome do sistema
      doc.text(
        'Pulse Salon Manager',
        margin,
        doc.internal.pageSize.getHeight() - 8
      );
      
      // Centro: Data de geração
      doc.text(
        `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
      
      // Lado direito: Número da página
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    }

    // Salva o PDF
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar o arquivo PDF');
  }
}
