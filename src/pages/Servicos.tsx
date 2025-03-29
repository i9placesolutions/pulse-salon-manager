import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Clock,
  Download,
  Package,
  FileSpreadsheet,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Info,
  FileText,
  X,
} from "lucide-react";
import { Service, ServicePackage, ExtendedService } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import { ServiceForm } from "@/components/servicos/ServiceForm";
import { ServicePackageForm } from "@/components/servicos/ServicePackageForm";
import { ServiceMetrics } from "@/components/servicos/ServiceMetrics";
import { ServiceCharts } from "@/components/servicos/ServiceCharts";
import { formatCurrency } from "@/utils/currency";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportData } from "@/utils/export";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Label,
} from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

interface PerformanceData {
  appointmentsLastMonth: number;
  rating: number;
  popularityRank: number;
  avgDuration: number;
  priceHistory: { date: string; price: number }[];
  trend: 'up' | 'down' | 'stable';
}

interface ExtendedService extends Service {
  performanceData?: PerformanceData;
}

const mockServices: ExtendedService[] = [
  {
    id: 1,
    name: "Corte Feminino",
    description: "Corte feminino tradicional",
    category: "Corte",
    duration: 60,
    price: 80,
    status: "active",
    commission: {
      type: "percentage",
      value: 50,
    },
    professionals: [1, 2],
    products: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 45,
      rating: 4.8,
      popularityRank: 1,
      avgDuration: 55, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 75 },
        { date: "2024-02-15", price: 80 },
      ],
      trend: "up",
    }
  },
  {
    id: 2,
    name: "Coloração",
    description: "Coloração completa",
    category: "Tintura",
    duration: 120,
    price: 150,
    status: "active",
    commission: {
      type: "percentage",
      value: 40,
    },
    professionals: [1, 3],
    products: [
      { productId: 3, quantity: 1 },
      { productId: 4, quantity: 2 },
    ],
    performanceData: {
      appointmentsLastMonth: 32,
      rating: 4.6,
      popularityRank: 2,
      avgDuration: 125, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 140 },
        { date: "2024-03-01", price: 150 },
      ],
      trend: "stable",
    }
  },
  {
    id: 3,
    name: "Manicure",
    description: "Esmaltação simples",
    category: "Manicure",
    duration: 45,
    price: 50,
    status: "active",
    commission: {
      type: "percentage",
      value: 60,
    },
    professionals: [3],
    products: [
      { productId: 5, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 28,
      rating: 4.3,
      popularityRank: 3,
      avgDuration: 40, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 45 },
        { date: "2024-02-01", price: 50 },
      ],
      trend: "up",
    }
  },
  {
    id: 4,
    name: "Hidratação Profunda",
    description: "Tratamento intensivo para cabelos danificados",
    category: "Tratamento",
    duration: 90,
    price: 120,
    status: "active",
    commission: {
      type: "percentage",
      value: 45,
    },
    professionals: [1, 2],
    products: [
      { productId: 6, quantity: 1 },
      { productId: 7, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 15,
      rating: 4.9,
      popularityRank: 4,
      avgDuration: 85, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 110 },
        { date: "2024-03-15", price: 120 },
      ],
      trend: "up",
    }
  },
  {
    id: 5,
    name: "Limpeza de Pele",
    description: "Limpeza facial profunda",
    category: "Estética",
    duration: 60,
    price: 140,
    status: "active",
    commission: {
      type: "fixed",
      value: 50,
    },
    professionals: [3],
    products: [
      { productId: 8, quantity: 1 },
    ],
    performanceData: {
      appointmentsLastMonth: 8,
      rating: 4.7,
      popularityRank: 5,
      avgDuration: 65, // Em minutos
      priceHistory: [
        { date: "2024-01-01", price: 130 },
        { date: "2024-02-01", price: 140 },
      ],
      trend: "down",
    }
  },
];

const mockProfessionals = [
  { id: 1, name: "Ana Silva" },
  { id: 2, name: "João Santos" },
  { id: 3, name: "Maria Oliveira" },
];

export default function Servicos() {
  // Rest of the code remains unchanged
}
