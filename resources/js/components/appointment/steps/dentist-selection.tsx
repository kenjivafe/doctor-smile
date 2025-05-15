import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

interface DentistSelectionProps {
  dentists?: Array<{
    id: number;
    name: string;
    specialty?: string;
    avatar?: string;
  }>;
  selectedDentistId?: number;
  onSelectDentist: (dentistId: number) => void;
  error?: string;
}

export default function DentistSelection({
  dentists = [],
  selectedDentistId,
  onSelectDentist,
  error,
}: DentistSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose a Dentist</h2>
        <p className="text-muted-foreground mb-6">
          Select a dentist for your appointment
        </p>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {dentists.map((dentist) => (
          <Card
            key={dentist.id}
            className={`p-4 cursor-pointer hover:border-primary transition-colors ${
              selectedDentistId === dentist.id
                ? 'border-2 border-primary bg-primary/5'
                : ''
            }`}
            onClick={() => onSelectDentist(dentist.id)}
          >
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                {dentist.avatar ? (
                  <img
                    src={dentist.avatar}
                    alt={dentist.name}
                    className="aspect-square h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium uppercase">
                    {dentist.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{dentist.name}</h3>
                {dentist.specialty && (
                  <p className="text-sm text-muted-foreground">
                    {dentist.specialty}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {dentists.length === 0 && (
          <div className="col-span-2 p-8 text-center text-muted-foreground">
            No dentists available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
