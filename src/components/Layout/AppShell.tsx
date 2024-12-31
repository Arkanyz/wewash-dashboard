import { AppShell, Header, Text } from '@mantine/core';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <AppShell
      padding="md"
      navbar={{ width: 300, breakpoint: 'sm' }}
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <Header height={60} p="xs">
          <Text size="xl" fw={700}>WeWash Dashboard</Text>
        </Header>
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
