import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, PenSquare } from 'lucide-react';

interface DentalServiceFormProps {
  service?: {
    id?: number;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: string;
    is_active: boolean;
  };
  isEditing?: boolean;
}

export const DentalServiceForm = ({ 
  service = {
    name: '',
    description: '',
    price: 0,
    duration_minutes: 30,
    category: 'general',
    is_active: true
  }, 
  isEditing = false 
}: DentalServiceFormProps) => {
  const [values, setValues] = useState({
    name: service.name || '',
    description: service.description || '',
    price: service.price || 0,
    duration_minutes: service.duration_minutes || 30,
    category: service.category || 'general',
    is_active: service.is_active !== undefined ? service.is_active : true,
  });
  

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ 
      ...prev, 
      [name]: name === 'price' ? parseFloat(value) : parseInt(value, 10) 
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setValues(prev => ({ ...prev, is_active: checked }));
  };
  
  const handleSelectChange = (value: string) => {
    setValues(prev => ({ ...prev, category: value }));
  };
  

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', String(values.price));
    formData.append('duration_minutes', String(values.duration_minutes));
    formData.append('category', values.category);
    formData.append('is_active', values.is_active ? '1' : '0');
    

    
    if (isEditing && service.id) {
      formData.append('_method', 'PUT');
      router.post(`/admin/dental-services/${service.id}`, formData, {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: (errors) => {
          setErrors(errors);
          setIsSubmitting(false);
        },
      });
    } else {
      router.post('/admin/dental-services', formData, {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: (errors) => {
          setErrors(errors);
          setIsSubmitting(false);
        },
      });
    }
  };
  
  const handleCancel = () => {
    router.get('/admin/dental-services');
  };
  
  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'cosmetic', label: 'Cosmetic' },
    { value: 'orthodontic', label: 'Orthodontic' },
    { value: 'surgical', label: 'Surgical' },
    { value: 'pediatric', label: 'Pediatric' },
    { value: 'preventive', label: 'Preventive' }
  ];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                required
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₱) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={values.price}
                onChange={handleNumberChange}
                required
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
            
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) <span className="text-red-500">*</span></Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="5"
                step="5"
                value={values.duration_minutes}
                onChange={handleNumberChange}
                required
                className={errors.duration_minutes ? 'border-red-500' : ''}
              />
              {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes}</p>}
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select 
                value={values.category} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          

          
          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_active" 
              checked={values.is_active} 
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_active">Active Service</Label>
            {errors.is_active && <p className="text-sm text-red-500">{errors.is_active}</p>}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isEditing ? (
                <>
                  <PenSquare className="w-4 h-4 mr-2" />
                  Update Service
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Service
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
