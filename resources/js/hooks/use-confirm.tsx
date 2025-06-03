import * as React from 'react';
import { ConfirmDialog } from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useConfirm() {
  const [open, setOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'default',
    onConfirm: () => {},
  });

  const confirm = (options: ConfirmOptions) => {
    setOptions(options);
    setOpen(true);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await options.onConfirm();
    } finally {
      setIsProcessing(false);
      setOpen(false);
    }
  };

  return {
    confirm,
    ConfirmationDialog: () => (
      <ConfirmDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            if (options.onCancel) {
              options.onCancel();
            }
            setOpen(false);
          }
        }}
        title={options.title}
        description={options.description}
        confirmLabel={options.confirmLabel}
        cancelLabel={options.cancelLabel}
        confirmVariant={options.confirmVariant}
        onConfirm={handleConfirm}
        isProcessing={isProcessing}
      />
    ),
  };
}
