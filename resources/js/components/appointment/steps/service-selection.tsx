import { Card } from '@/components/ui/card';

interface ServiceSelectionProps {
  services?: Array<{
    id: number;
    name: string;
    description: string;
    price: string;
    duration_minutes: number;
    category?: string;
    image_path?: string;
  }>;
  selectedServiceId?: number;
  onSelectService: (serviceId: number) => void;
  error?: string;
}

export default function ServiceSelection({
  services = [],
  selectedServiceId,
  onSelectService,
  error,
}: ServiceSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select a Dental Service</h2>
        <p className="text-muted-foreground mb-6">
          Choose the dental service you need for your appointment
        </p>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-4 cursor-pointer hover:border-primary transition-colors ${
              selectedServiceId === service.id
                ? 'border-2 border-primary bg-primary/5'
                : ''
            }`}
            onClick={() => onSelectService(service.id)}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{service.name}</h3>
                <div className="text-sm font-semibold text-primary">
                  ₱{service.price}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 flex-grow">
                {service.description}
              </p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div>Duration: {service.duration_minutes} min</div>
                {service.category && <div>Category: {service.category}</div>}
              </div>
            </div>
          </Card>
        ))}

        {services.length === 0 && (
          <div className="col-span-2 p-8 text-center text-muted-foreground">
            No dental services available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
