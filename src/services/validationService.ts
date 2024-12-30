import { z } from 'zod';
import { logService } from './logService';

// Schémas de validation
const emailSchema = z.string().email('Email invalide');
const phoneSchema = z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide');
const postalCodeSchema = z.string().regex(/^\d{5}$/, 'Code postal invalide');

// Schéma pour une laverie
const laundrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  postal_code: postalCodeSchema,
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  phone: phoneSchema,
  email: emailSchema,
  status: z.enum(['active', 'inactive', 'maintenance']),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Schéma pour une machine
const machineSchema = z.object({
  id: z.string().optional(),
  laundry_id: z.string(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['washer', 'dryer']),
  status: z.enum(['active', 'inactive', 'maintenance']),
  model: z.string(),
  serial_number: z.string(),
  installation_date: z.string().datetime(),
  last_maintenance: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Schéma pour une intervention
const interventionSchema = z.object({
  id: z.string().optional(),
  machine_id: z.string(),
  technician_id: z.string(),
  type: z.enum(['maintenance', 'repair', 'installation']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  scheduled_date: z.string().datetime(),
  completion_date: z.string().datetime().optional(),
  notes: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Schéma pour un technicien
const technicianSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: emailSchema,
  phone: phoneSchema,
  status: z.enum(['active', 'inactive']),
  zone: z.string(),
  specialization: z.array(z.string()),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Validation générique
  public async validate<T>(schema: z.ZodSchema<T>, data: unknown): Promise<{ 
    success: boolean; 
    data?: T; 
    errors?: z.ZodError 
  }> {
    try {
      const validatedData = await schema.parseAsync(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logService.warning('validation', 'Validation failed', {
          errors: error.errors,
          data
        });
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Validations spécifiques
  public async validateLaundry(data: unknown) {
    return this.validate(laundrySchema, data);
  }

  public async validateMachine(data: unknown) {
    return this.validate(machineSchema, data);
  }

  public async validateIntervention(data: unknown) {
    return this.validate(interventionSchema, data);
  }

  public async validateTechnician(data: unknown) {
    return this.validate(technicianSchema, data);
  }

  // Validations personnalisées
  public validateEmail(email: string) {
    return emailSchema.safeParse(email);
  }

  public validatePhone(phone: string) {
    return phoneSchema.safeParse(phone);
  }

  public validatePostalCode(postalCode: string) {
    return postalCodeSchema.safeParse(postalCode);
  }

  // Validation avec transformation
  public async validateAndTransform<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    transform?: (data: T) => Promise<T>
  ): Promise<{ 
    success: boolean; 
    data?: T; 
    errors?: z.ZodError 
  }> {
    const validation = await this.validate(schema, data);
    
    if (!validation.success || !validation.data) {
      return validation;
    }

    try {
      const transformedData = transform 
        ? await transform(validation.data)
        : validation.data;
      
      return { success: true, data: transformedData };
    } catch (error) {
      logService.error('validation', 'Transform failed', { error, data });
      return { 
        success: false, 
        errors: new z.ZodError([{
          code: 'custom',
          path: [],
          message: 'Transform failed'
        }])
      };
    }
  }
}

export const validationService = ValidationService.getInstance();
export type {
  Laundry,
  Machine,
  Intervention,
  Technician
} from 'zod';
