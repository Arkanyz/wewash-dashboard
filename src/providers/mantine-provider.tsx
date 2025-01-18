import { MantineProvider as BaseMantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});

interface MantineProviderProps {
  children: React.ReactNode;
}

export function MantineProvider({ children }: MantineProviderProps) {
  return (
    <BaseMantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      {children}
    </BaseMantineProvider>
  );
}
