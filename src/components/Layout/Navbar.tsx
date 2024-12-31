import { Navbar as MantineNavbar, NavLink, ScrollArea } from '@mantine/core';
import { IconQuestionMark, IconDashboard, IconSettings, IconChartBar, IconTool } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();

  const links = [
    { icon: IconDashboard, label: 'Tableau de bord', to: '/dashboard' },
    { icon: IconTool, label: 'Interventions', to: '/interventions' },
    { icon: IconChartBar, label: 'Analytics', to: '/analytics' },
    { icon: IconSettings, label: 'Paramètres', to: '/settings' },
    { icon: IconQuestionMark, label: 'Support & Aide', to: '/help-center' },
  ];

  const items = links.map((link) => (
    <NavLink
      key={link.label}
      active={location.pathname === link.to}
      label={link.label}
      leftSection={<link.icon size="1rem" stroke={1.5} />}
      component={Link}
      to={link.to}
    />
  ));

  return (
    <MantineNavbar width={{ base: 300 }} p="xs">
      <MantineNavbar.Section grow component={ScrollArea}>
        {items}
      </MantineNavbar.Section>
    </MantineNavbar>
  );
}
