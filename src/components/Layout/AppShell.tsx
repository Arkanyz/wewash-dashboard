import { AppShell as MantineAppShell, Header, Text } from '@mantine/core';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <MantineAppShell
      padding="md"
      navbar={<Navbar />}
      header={
        <Header height={60} p="xs">
          <Text size="xl" fw={700}>WeWash Dashboard</Text>
        </Header>
      }
    >
      <Outlet />
    </MantineAppShell>
  );
}
