
// Arquivo principal que reexporta todas as funcionalidades de exportação
// Isso mantém a compatibilidade com o código existente

// Exportações do módulo csvExport
import { convertToCSV, downloadCSV } from './exports/csvExport';

// Exportações do módulo campaignExport
import { exportCampaignReport, exportCampaignToPDF } from './exports/campaignExport';

// Exportações do módulo clientExport
import { 
  prepareExportData, 
  exportToExcel as exportClientToExcel,
  exportToPDF as exportClientToPDF,
  exportClientReport
} from './exports/clientExport';

// Exportações do módulo generalExport
import { 
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportData
} from './exports/generalExport';

// Exportações do módulo productExport
import {
  exportProductsToCSV,
  exportMovementsToCSV
} from './exports/productExport';

// Exportação de formatters
import {
  formatDateString,
  formatCurrency
} from './exports/formatters';

// Exportação de todos os componentes mantendo a mesma API pública
export {
  // CSV Export
  convertToCSV,
  downloadCSV,
  
  // Campaign Export
  exportCampaignReport,
  exportCampaignToPDF,
  
  // Client Export
  prepareExportData,
  exportClientToExcel,
  exportClientToPDF,
  exportClientReport,
  
  // General Export
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportData,
  
  // Product Export
  exportProductsToCSV,
  exportMovementsToCSV,
  
  // Formatters
  formatDateString,
  formatCurrency
};
