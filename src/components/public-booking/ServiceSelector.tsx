import { useState } from "react";
import { Search, Scissors, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  category: string;
}

interface ServiceSelectorProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceSelector({ services, onSelect }: ServiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Extrair categorias únicas
  const categories = Array.from(new Set(services.map(service => service.category)));
  
  // Filtrar serviços com base na busca e categoria selecionada
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === "" || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === null || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            Todos
          </Button>
          
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="border rounded-lg p-4 hover:border-pink-300 hover:bg-pink-50 transition-colors cursor-pointer shadow-sm"
            onClick={() => onSelect(service)}
          >
            <div className="flex justify-between">
              <div className="font-medium">{service.name}</div>
              <div className="text-pink-600 font-semibold">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(service.price)}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
            
            <div className="flex justify-between mt-3">
              <div className="flex items-center text-sm text-gray-500">
                <Scissors className="h-3 w-3 mr-1" />
                {service.duration} min
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-100 p-0 h-8 w-8 rounded-full"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {filteredServices.length === 0 && (
          <div className="col-span-2 py-8 text-center text-gray-500">
            Nenhum serviço encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
} 