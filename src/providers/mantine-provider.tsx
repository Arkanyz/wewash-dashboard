import { MantineProvider as BaseMantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

interface MantineProviderProps {
  children: React.ReactNode;
}

export function MantineProvider({ children }: MantineProviderProps) {
  return (
    <BaseMantineProvider>
      <Notifications position="top-right" />
      {children}
    </BaseMantineProvider>
  );
}
