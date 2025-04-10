import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, FileText, Calendar, Users, UserCheck, Package,
  TrendingUp, Star, Clock, Activity, Scissors, ShoppingBag,
  AlertTriangle, Filter, Eye, Settings, FileDown, FileSpreadsheet,
  BarChart3, FileBarChart, BookOpen
} from "lucide-react";

export default function RelatoriosSimple() {
  const [viewMode, setViewMode] = useState("dashboard");
  
  return (
    <div className="space-y-6">
      <h1>Relatórios</h1>
      <p>Componente simplificado para teste</p>
    </div>
  );
}
