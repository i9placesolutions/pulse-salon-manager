
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerHeaderProps {
  establishmentName: string;
  establishmentLogo: string;
}

export function CustomerHeader({ establishmentName, establishmentLogo }: CustomerHeaderProps) {
  return (
    <header className="bg-primary/5 border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={establishmentLogo} alt={establishmentName} />
            <AvatarFallback>{establishmentName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              {establishmentName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Portal de Acesso do Cliente
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
