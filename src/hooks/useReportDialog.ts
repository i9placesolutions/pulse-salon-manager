
import { useState } from "react";
import { useToast } from "./use-toast";

export function useReportDialog() {
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Handle generating report
  const handleGenerateReport = (data: any) => {
    // Mock function for generating report
    console.log("Generating report with data:", data);
    
    setIsReportDialogOpen(false);
    
    toast({
      title: "Relatório gerado",
      description: "O relatório foi gerado com sucesso.",
    });
  };

  return {
    isReportDialogOpen,
    setIsReportDialogOpen,
    handleGenerateReport,
  };
}
