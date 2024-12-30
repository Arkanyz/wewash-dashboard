import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../components/navigation/Sidebar';
import { useAppStore } from '../../stores/useAppStore';

// Mock du store
vi.mock('../../stores/useAppStore');

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Configuration du mock pour le store
    (useAppStore as any).mockImplementation(() => ({
      currentUser: {
        id: '1',
        full_name: 'John Doe',
        role: 'admin',
      },
      sidebarOpen: true,
    }));
  });

  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Vérifier que tous les éléments de navigation sont présents
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Laveries')).toBeInTheDocument();
    expect(screen.getByText('Techniciens')).toBeInTheDocument();
    expect(screen.getByText('Statistiques & Analyses')).toBeInTheDocument();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByText('Support & Aide')).toBeInTheDocument();
  });

  it('displays user information in footer', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Administrateur')).toBeInTheDocument();
  });

  it('applies active styles to current route', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const activeLink = screen.getByText('Accueil').closest('a');
    expect(activeLink).toHaveClass('bg-[#1E90FF]/10');
  });
});
