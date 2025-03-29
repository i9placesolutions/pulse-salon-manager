
import { useMemo } from "react";
import { 
  Settings, 
  MessageSquare, 
  Users, 
  CreditCard, 
  FileText, 
  Shield 
} from "lucide-react";
import { ConfigGeral } from "@/components/configuracoes/ConfigGeral";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigRelatorios } from "@/components/configuracoes/ConfigRelatorios";

export function useTabsConfig() {
  return useMemo(() => [
    {
      id: "geral",
      title: "Geral",
      icon: <Settings className="h-4 w-4 mr-2" />,
      iconDetail: <Settings className="h-5 w-5 mr-2 text-blue-600" />,
      content: <ConfigGeral />,
      baseColor: "blue",
      gradientFrom: "blue",
      gradientTo: "blue"
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      iconDetail: <MessageSquare className="h-5 w-5 mr-2 text-green-600" />,
      content: <ConfigWhatsApp />,
      baseColor: "green",
      gradientFrom: "green",
      gradientTo: "emerald"
    },
    {
      id: "usuarios",
      title: "Usuários",
      icon: <Users className="h-4 w-4 mr-2" />,
      iconDetail: <Users className="h-5 w-5 mr-2 text-indigo-600" />,
      content: <ConfigUsuarios />,
      baseColor: "indigo",
      gradientFrom: "indigo",
      gradientTo: "violet"
    },
    {
      id: "pagamentos",
      title: "Pagamentos",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      iconDetail: <CreditCard className="h-5 w-5 mr-2 text-amber-600" />,
      content: <ConfigPagamentos />,
      baseColor: "amber",
      gradientFrom: "amber",
      gradientTo: "orange"
    },
    {
      id: "relatorios",
      title: "Relatórios",
      icon: <FileText className="h-4 w-4 mr-2" />,
      iconDetail: <FileText className="h-5 w-5 mr-2 text-cyan-600" />,
      content: <ConfigRelatorios />,
      baseColor: "cyan",
      gradientFrom: "cyan",
      gradientTo: "teal"
    },
    {
      id: "seguranca",
      title: "Segurança",
      icon: <Shield className="h-4 w-4 mr-2" />,
      iconDetail: <Shield className="h-5 w-5 mr-2 text-rose-600" />,
      content: <ConfigSeguranca />,
      baseColor: "rose",
      gradientFrom: "rose",
      gradientTo: "red"
    }
  ], []);
}
