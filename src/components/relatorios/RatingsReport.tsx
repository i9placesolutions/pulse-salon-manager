import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Star, 
  Calendar, 
  Download, 
  Filter, 
  LineChart, 
  PieChart,
  Smile,
  Frown,
  Meh,
  User,
  Clock,
  Share2
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Interface para avaliação
interface Rating {
  id: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  serviceId?: number;
  serviceName?: string;
}

export function RatingsReport() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [ratingsByService, setRatingsByService] = useState<{[key: string]: number}>({});
  const [ratingsByDay, setRatingsByDay] = useState<{[key: string]: number}>({});
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0]);
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Simulação de dados para o exemplo
  useEffect(() => {
    setLoading(true);
    
    // Simulação de carregamento de dados
    setTimeout(() => {
      // Gerar avaliações de exemplo
      const mockRatings: Rating[] = [];
      const now = new Date();
      const services = ['Corte de Cabelo', 'Manicure', 'Pedicure', 'Coloração', 'Hidratação', 'Barba'];
      const comments = [
        'Ótimo atendimento! Profissionais muito qualificados.',
        'Amei o resultado! Vou voltar com certeza.',
        'Ambiente muito agradável e aconchegante.',
        'Gostei do serviço, mas o tempo de espera foi um pouco longo.',
        'Excelente trabalho, recomendo!',
        'Adorei o resultado, mas achei o preço um pouco alto.',
        'Profissionais muito atenciosos e gentis.',
        'O resultado ficou incrível, melhor do que eu esperava!',
        'Ambiente limpo e bem organizado.',
        'Atendimento rápido e eficiente.'
      ];
      const names = ['Ana Silva', 'João Pedro', 'Maria Oliveira', 'Carlos Santos', 'Juliana Costa', 
                    'Roberto Almeida', 'Patrícia Lima', 'Fernando Souza', 'Camila Martins', 'Lucas Ferreira'];
      
      // Gerar 50 avaliações aleatórias
      for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(now.getDate() - Math.floor(Math.random() * 90)); // avaliações dos últimos 90 dias
        
        mockRatings.push({
          id: i + 1,
          userId: String(Math.floor(Math.random() * 1000) + 1),
          userName: names[Math.floor(Math.random() * names.length)],
          rating: Math.floor(Math.random() * 5) + 1, // 1 a 5 estrelas
          comment: comments[Math.floor(Math.random() * comments.length)],
          date: date.toISOString().split('T')[0],
          serviceId: Math.floor(Math.random() * 10) + 1,
          serviceName: services[Math.floor(Math.random() * services.length)]
        });
      }
      
      // Ordenar por data (mais recentes primeiro)
      mockRatings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calcular distribuição de avaliações
      const distribution = [0, 0, 0, 0, 0];
      mockRatings.forEach(rating => {
        distribution[rating.rating - 1]++;
      });
      
      // Calcular média
      const total = mockRatings.reduce((sum, rating) => sum + rating.rating, 0);
      const avg = total / mockRatings.length;
      
      // Agrupar por serviço
      const byService: {[key: string]: number} = {};
      mockRatings.forEach(rating => {
        if (rating.serviceName) {
          if (!byService[rating.serviceName]) {
            byService[rating.serviceName] = 0;
          }
          byService[rating.serviceName]++;
        }
      });
      
      // Agrupar por dia (últimos 30 dias)
      const byDay: {[key: string]: number} = {};
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      for (let i = 0; i <= 30; i++) {
        const day = new Date();
        day.setDate(now.getDate() - i);
        const dateStr = day.toISOString().split('T')[0];
        byDay[dateStr] = 0;
      }
      
      mockRatings.forEach(rating => {
        const ratingDate = new Date(rating.date);
        if (ratingDate >= thirtyDaysAgo) {
          const dateStr = rating.date;
          if (byDay[dateStr] !== undefined) {
            byDay[dateStr]++;
          }
        }
      });
      
      // Atualizar estados
      setRecentRatings(mockRatings.slice(0, 10)); // 10 avaliações mais recentes
      setRatingDistribution(distribution);
      setAverageRating(avg);
      setTotalRatings(mockRatings.length);
      setRatingsByService(byService);
      setRatingsByDay(byDay);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);
  
  // Configuração para o gráfico de linha de avaliações por dia
  const lineChartData = {
    labels: Object.keys(ratingsByDay).sort().slice(-14), // Últimos 14 dias
    datasets: [
      {
        label: 'Avaliações',
        data: Object.keys(ratingsByDay).sort().slice(-14).map(date => ratingsByDay[date]),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
    },
  };
  
  // Configuração para o gráfico de barras por serviço
  const barChartData = {
    labels: Object.keys(ratingsByService),
    datasets: [
      {
        label: 'Avaliações por serviço',
        data: Object.values(ratingsByService),
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)', // indigo
          'rgba(99, 102, 241, 0.7)', // indigo mais claro
          'rgba(129, 140, 248, 0.7)', // indigo ainda mais claro
          'rgba(165, 180, 252, 0.7)', // indigo ainda mais claro
          'rgba(224, 231, 255, 0.7)', // indigo bem claro
          'rgba(67, 56, 202, 0.7)', // indigo mais escuro
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(99, 102, 241)',
          'rgb(129, 140, 248)',
          'rgb(165, 180, 252)',
          'rgb(224, 231, 255)',
          'rgb(67, 56, 202)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
    },
  };
  
  // Configuração para o gráfico de pizza da distribuição
  const pieChartData = {
    labels: ['1 estrela', '2 estrelas', '3 estrelas', '4 estrelas', '5 estrelas'],
    datasets: [
      {
        label: 'Distribuição de avaliações',
        data: ratingDistribution,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)', // vermelho
          'rgba(249, 115, 22, 0.7)', // laranja
          'rgba(245, 158, 11, 0.7)', // amarelo
          'rgba(16, 185, 129, 0.7)', // verde
          'rgba(79, 70, 229, 0.7)', // indigo
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(79, 70, 229)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  // Função para renderizar estrelas
  const renderStars = (count: number) => {
    return (
      <div className="flex">
        {Array(5).fill(0).map((_, index) => (
          <Star key={index} className={`h-4 w-4 ${index < count ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Componente de sentimento com base na avaliação
  const RatingSentiment = ({ rating }: { rating: number }) => {
    if (rating >= 4) {
      return <Smile className="h-5 w-5 text-green-500" />;
    } else if (rating === 3) {
      return <Meh className="h-5 w-5 text-amber-500" />;
    } else {
      return <Frown className="h-5 w-5 text-red-500" />;
    }
  };
  
  // Função para gerar o link de compartilhamento
  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const establishmentSlug = "seu-estabelecimento"; // Isso deve vir do estado real
    return `${baseUrl}/rating/${establishmentSlug}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho e filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-800 flex items-center">
            <Star className="mr-2 h-5 w-5 fill-amber-400 text-amber-400" />
            Relatório de Avaliações
          </h2>
          <p className="text-gray-600 text-sm">
            Análise das avaliações de clientes e tendências de satisfação
          </p>
        </div>
        
        <div className="flex gap-3">
          <Tabs 
            value={selectedPeriod} 
            onValueChange={(value) => setSelectedPeriod(value as any)}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <TabsList className="bg-gray-50">
              <TabsTrigger value="week" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Mês
              </TabsTrigger>
              <TabsTrigger value="quarter" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Trimestre
              </TabsTrigger>
              <TabsTrigger value="year" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Ano
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            className="flex gap-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Indicadores principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 border-indigo-100 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avaliação Média</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-800">{averageRating.toFixed(1)}</h3>
                  <div className="flex mb-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 border-indigo-100 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Avaliações</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-gray-800">{totalRatings}</h3>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full mb-1">
                    +{Math.floor(Math.random() * 10) + 1}% vs. último período
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <BarChart className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 border-indigo-100 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Link de Avaliação</p>
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                      onClick={() => {
                        navigator.clipboard.writeText(generateShareLink());
                        alert("Link copiado para a área de transferência!");
                      }}
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Copiar Link
                    </Button>
                    <span className="text-sm text-gray-500">ou</span>
                    <Button 
                      size="sm" 
                      className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => {
                        window.open(`https://wa.me/?text=Avalie%20nosso%20estabelecimento%3A%20${encodeURIComponent(generateShareLink())}`, '_blank');
                      }}
                    >
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Share2 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 border-indigo-100 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-4">
            <CardTitle className="text-indigo-700 font-medium text-base flex items-center">
              <LineChart className="h-4 w-4 mr-2 text-indigo-600" />
              Tendência de Avaliações
            </CardTitle>
            <CardDescription>Número de avaliações recebidas por dia</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 border-indigo-100 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-4">
            <CardTitle className="text-indigo-700 font-medium text-base flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-indigo-600" />
              Distribuição de Avaliações
            </CardTitle>
            <CardDescription>Quantidade de avaliações por pontuação</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Avaliações por serviço */}
      <Card className="bg-white/80 border-indigo-100 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-4">
          <CardTitle className="text-indigo-700 font-medium text-base flex items-center">
            <BarChart className="h-4 w-4 mr-2 text-indigo-600" />
            Avaliações por Serviço
          </CardTitle>
          <CardDescription>Quantidade de avaliações recebidas por cada serviço</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>
      
      {/* Avaliações recentes */}
      <Card className="bg-white/80 border-indigo-100 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-4 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-indigo-700 font-medium text-base flex items-center">
              <Clock className="h-4 w-4 mr-2 text-indigo-600" />
              Avaliações Recentes
            </CardTitle>
            <CardDescription>Últimas avaliações deixadas pelos clientes</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            Ver todas
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {recentRatings.map((rating) => (
              <div key={rating.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 rounded-full p-2 mt-1">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">{rating.userName}</h4>
                        <div className="text-xs text-gray-500">{formatDate(rating.date)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(rating.rating)}
                        <RatingSentiment rating={rating.rating} />
                      </div>
                    </div>
                    {rating.serviceName && (
                      <div className="mb-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {rating.serviceName}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">{rating.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 