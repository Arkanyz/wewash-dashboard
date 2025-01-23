import { toast } from '@/components/ui/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
}

export const useToast = () => {
  const showToast = ({ title, description, variant = 'default' }: ToastOptions) => {
    toast({
      title,
      description,
      variant
    });
  };

  return { toast: showToast };
};

export default useToast;
