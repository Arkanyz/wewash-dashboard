import { AppShell as MantineAppShell, Header, Text } from '@mantine/core';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <MantineAppShell
      padding="md"
      navbar={{ width: 300, breakpoint: 'sm' }}
      header={{ height: 60 }}
    >
      <MantineAppShell.Header>
        <Header height={60} p="xs">
          <Text size="xl" fw={700}>WeWash Dashboard</Text>
        </Header>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <Navbar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
