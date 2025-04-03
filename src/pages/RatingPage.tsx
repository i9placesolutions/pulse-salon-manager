import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Star, 
  Store,
  Send, 
  X, 
  Award, 
  Clock, 
  CalendarCheck, 
  MessageSquare, 
  ChevronRight, 
  Smile, 
  SmilePlus,
  Loader2
} from "lucide-react";
import { LoginModal } from "@/components/public-booking/LoginModal";

// Interface para estabelecimento
interface Establishment {
  id: number;
  name: string;
  address: string;
  phone: string;
  customUrl: string;
  logo: string;
  description?: string;
  ratings?: Rating[];
  averageRating?: number;
}

// Interface para avaliação
interface Rating {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  serviceId?: number;
  serviceName?: string;
}

// Interface para usuário logado
interface UserData {
  id: string;
  name: string;
  whatsapp: string;
  birthDate: string;
}

export default function RatingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const slug = params.slug;
  
  // Estados
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Estado para login
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentVisits, setRecentVisits] = useState<{id: number, serviceName: string, date: string}[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  
  useEffect(() => {
    if (!slug) return;

    // Simulação de carregamento de dados do estabelecimento
    const fetchEstablishment = async () => {
      try {
        setIsLoading(true);
        // Aqui você faria uma chamada de API para obter dados reais
        setTimeout(() => {
          setEstablishment({
            id: 1,
            name: "Salão Beleza Pura",
            address: "Rua das Flores, 123 - Centro",
            phone: "(11) 99999-9999",
            customUrl: slug as string,
            logo: "/logo.png",
            description: "Oferecemos os melhores serviços de beleza da região. Com profissionais experientes e produtos de alta qualidade.",
            averageRating: 4.7
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        setError("Não foi possível carregar as informações do estabelecimento.");
        setIsLoading(false);
      }
    };

    fetchEstablishment();
  }, [slug]);
  
  // Carregar visitas recentes quando o usuário estiver logado
  useEffect(() => {
    if (userData) {
      // Simulação de obtenção das visitas recentes
      setRecentVisits([
        { id: 1, serviceName: "Corte de Cabelo", date: "2024-03-15" },
        { id: 2, serviceName: "Manicure", date: "2024-03-02" },
        { id: 3, serviceName: "Hidratação", date: "2024-02-20" }
      ]);
    }
  }, [userData]);
  
  // Verificar se o usuário já está logado (através de localStorage, por exemplo)
  useEffect(() => {
    const storedUser = localStorage.getItem('ratingUserData');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao analisar dados do usuário", e);
      }
    }
  }, []);
  
  // Função para renderizar estrelas
  const renderStars = (count: number, isInteractive: boolean = true) => {
    return Array(5).fill(0).map((_, index) => (
      <button
        key={index}
        type="button"
        className={`text-2xl focus:outline-none transition-transform ${
          isInteractive ? "hover:scale-110 active:scale-95" : ""
        } ${
          (isInteractive ? (hoverRating || rating) : count) > index 
            ? "text-amber-400" 
            : "text-gray-300"
        }`}
        onMouseEnter={isInteractive ? () => setHoverRating(index + 1) : undefined}
        onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        onClick={isInteractive ? () => setRating(index + 1) : undefined}
        disabled={!isInteractive}
      >
        <Star className={`h-8 w-8 ${isInteractive ? "fill-current" : (count > index ? "fill-current" : "")}`} />
      </button>
    ));
  };
  
  // Função para lidar com o login
  const handleLoginSuccess = (user: UserData) => {
    setUserData(user);
    // Salvar no localStorage para futuras visitas
    localStorage.setItem('ratingUserData', JSON.stringify(user));
    setIsLoginModalOpen(false);
    toast({
      title: "Login realizado com sucesso",
      description: `Bem-vindo, ${user.name}! Agora você pode avaliar o estabelecimento.`,
      variant: "success",
    });
  };
  
  // Função para enviar avaliação
  const handleSubmitRating = () => {
    if (!userData) {
      setIsLoginModalOpen(true);
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma classificação de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular envio para API
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      toast({
        title: "Avaliação enviada com sucesso!",
        description: "Agradecemos seu feedback. Sua opinião é muito importante para nós.",
        variant: "success",
      });
    }, 1500);
  };
  
  // Renderização condicional de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f4fc] via-[#f0f1ff] to-[#fef8ff] p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-lg font-medium text-indigo-700">Carregando avaliações...</span>
        </div>
      </div>
    );
  }
  
  // Renderização condicional de erro
  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f4fc] via-[#f0f1ff] to-[#fef8ff] p-4">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200 max-w-md text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar</h2>
          <p className="text-red-600">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }
  
  // Renderização condicional de sucesso
  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f4fc] via-[#f0f1ff] to-[#fef8ff] p-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-100 max-w-md text-center shadow-lg">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Avaliação enviada!</h2>
          <p className="text-green-700 mb-6">Muito obrigado pelo seu feedback. Sua opinião é fundamental para melhorarmos nossos serviços.</p>
          <div className="flex justify-center mb-6">
            {renderStars(rating, false)}
          </div>
          {comment && (
            <div className="bg-white p-4 rounded-lg border border-green-100 mb-6">
              <p className="text-gray-700 italic">"{comment}"</p>
            </div>
          )}
          <Button 
            className="mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            onClick={() => {
              if (establishment) {
                window.location.href = `https://wa.me/?text=Acabo%20de%20avaliar%20o%20${encodeURIComponent(establishment.name)}!%20Confira%20em%20${encodeURIComponent(`https://pulse-salon.com.br/${establishment.customUrl}`)}`;
              }
            }}
          >
            Compartilhar avaliação
          </Button>
        </div>
      </div>
    );
  }
  
  // Renderização normal da página
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#f5f4fc] via-[#f0f1ff] to-[#fef8ff] p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto w-full z-10">
        {/* Cabeçalho do estabelecimento */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm w-full rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
            {/* Faixa decorativa superior */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 -mt-6 -mx-6 mb-4 rounded-t-2xl"></div>
            
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mr-5 overflow-hidden">
                {establishment?.logo ? (
                  <img 
                    src={establishment.logo} 
                    alt={establishment.name} 
                    className="w-16 h-16 object-contain" 
                  />
                ) : (
                  <Store className="w-10 h-10 text-indigo-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{establishment?.name}</h1>
                <div className="flex items-center mb-1">
                  {establishment?.averageRating && (
                    <div className="flex items-center text-sm text-gray-700 mr-3">
                      <div className="flex mr-1">
                        {renderStars(Math.round(establishment.averageRating), false)}
                      </div>
                      <span className="font-medium">{establishment.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{establishment?.address}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seção principal de avaliação */}
        <div className="grid gap-6 md:grid-cols-6">
          {/* Formulário de avaliação */}
          <div className="md:col-span-4">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 pb-4">
                <CardTitle className="text-xl text-indigo-700 flex items-center">
                  <Award className="mr-2 h-5 w-5 text-indigo-600" />
                  Avalie sua experiência
                </CardTitle>
                <CardDescription>
                  Compartilhe sua opinião sobre {establishment?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {userData ? (
                  <div className="space-y-6">
                    {/* Seleção de serviço (se houver visitas recentes) */}
                    {recentVisits.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Selecione o serviço que deseja avaliar:</h3>
                        <div className="space-y-2">
                          {recentVisits.map(visit => (
                            <div 
                              key={visit.id} 
                              onClick={() => setSelectedServiceId(visit.id)}
                              className={`p-3 rounded-lg border flex items-center cursor-pointer transition-all ${
                                selectedServiceId === visit.id 
                                  ? 'border-indigo-400 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                              }`}
                            >
                              <div className="bg-indigo-100 rounded-full p-2 mr-3">
                                <CalendarCheck className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{visit.serviceName}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(visit.date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border ${
                                selectedServiceId === visit.id 
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-gray-300'
                              }`}>
                                {selectedServiceId === visit.id && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Classificação por estrelas */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700">Sua classificação geral:</h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(rating)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {rating === 0 ? 'Selecione uma classificação' : 
                          rating === 1 ? 'Péssimo' :
                          rating === 2 ? 'Ruim' :
                          rating === 3 ? 'Regular' :
                          rating === 4 ? 'Bom' :
                          'Excelente'}
                      </p>
                    </div>
                    
                    {/* Comentário */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700">Seu comentário (opcional):</h3>
                      <Textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte-nos mais sobre sua experiência..."
                        className="min-h-[120px] border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    {/* Botão de envio */}
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                      onClick={handleSubmitRating}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar avaliação
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <SmilePlus className="h-12 w-12 text-indigo-500/70 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Faça login para avaliar
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Para compartilhar sua experiência com {establishment?.name}, 
                      por favor faça login com seu WhatsApp.
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Fazer login para avaliar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar com informações */}
          <div className="md:col-span-2 space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-400 to-cyan-400"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-800 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-cyan-600" /> 
                  Por que avaliar?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <p>
                  Sua avaliação ajuda outros clientes a tomarem decisões e também
                  nos ajuda a melhorar continuamente nossos serviços.
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-8 bg-cyan-400 rounded-full"></div>
                  <p className="italic font-medium text-cyan-700">
                    "Cada feedback nos aproxima da excelência!"
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {establishment?.description && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-400 to-fuchsia-400"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-800 flex items-center">
                    <Store className="w-4 h-4 mr-2 text-purple-600" />
                    Sobre {establishment.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p>{establishment.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de login */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
} 