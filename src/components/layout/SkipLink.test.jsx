import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkipLink } from './SkipLink';

describe('SkipLink Component (Acessibilidade WCAG 2.1 AA)', () => {
  it('deve renderizar link acessível com destino para #main-content', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /pular para o conteúdo principal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });
});