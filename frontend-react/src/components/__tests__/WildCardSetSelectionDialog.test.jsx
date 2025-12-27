import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WildCardSetSelectionDialog from '../WildCardSetSelectionDialog';
import { CARD_TYPES } from '../../constants';

// Mock the Card component since we don't need to test its implementation details
vi.mock('./Card', () => ({
  default: ({ card }) => <div data-testid="mock-card">{card.name}</div>
}));

// Mock gameHelpers
vi.mock('../../utils/gameHelpers', async () => {
    const actual = await vi.importActual('../../utils/gameHelpers');
    return {
        ...actual,
        getSets: (properties) => {
             // Simple mock implementation that groups by color
             // In a real app we might want to use the real logic, 
             // but for component testing we just want predictable props.
             const sets = {};
             if (!properties) return [];
             
             properties.forEach(p => {
                 const c = p.currentColor || p.color;
                 if (!sets[c]) sets[c] = { color: c, cards: [], isComplete: false };
                 sets[c].cards.push(p);
             });
             return Object.values(sets);
        },
        COLORS: {
            blue: { name: 'Blue', hex: '#0000FF', count: 2 },
            green: { name: 'Green', hex: '#008000', count: 3 },
            red: { name: 'Red', hex: '#FF0000', count: 3 },
            yellow: { name: 'Yellow', hex: '#FFFF00', count: 3 }
        }
    };
});

describe('WildCardSetSelectionDialog', () => {
  const mockOnSelect = vi.fn();
  const mockOnCancel = vi.fn();

  const rainbowWildCard = {
    id: 'wild-rainbow-1',
    name: 'Wild Property (All)',
    type: CARD_TYPES.PROPERTY_WILD,
    value: 0,
    isRainbow: true,
    colors: ['multi']
  };

  const dualWildCard = {
    id: 'wild-blue-green',
    name: 'Wild Property (Blue/Green)',
    type: CARD_TYPES.PROPERTY_WILD,
    value: 4,
    colors: ['blue', 'green']
  };

  const mockPlayer = {
    id: 'player-1',
    name: 'Test Player',
    properties: [
      { id: 'prop-1', color: 'blue', type: CARD_TYPES.PROPERTY, name: 'Blue Prop 1' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with a rainbow wild card', () => {
    render(
      <WildCardSetSelectionDialog
        card={rainbowWildCard}
        player={mockPlayer}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Where to Play Wild Card?')).toBeTruthy();
    expect(screen.getByText('Play as New Set')).toBeTruthy();
    expect(screen.queryByText('Bank It')).toBeNull();
  });

  it('shows existing compatible sets for dual color wild', () => {
    // Player has a blue property, which is compatible with blue/green wild
    render(
      <WildCardSetSelectionDialog
        card={dualWildCard}
        player={mockPlayer}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Add to Existing Set:')).toBeTruthy();
    expect(screen.getByText('Blue Set')).toBeTruthy();
  });

  it('calls onSelect with correct params when "Play as New Set" is clicked for dual wild', () => {
    render(
      <WildCardSetSelectionDialog
        card={dualWildCard}
        player={mockPlayer}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );
  
    // For dual wilds, the "Play as New Set" button usually defaults to the first color (or handled by specific UI logic)
    // In our component: onClick={() => onSelect({ asNewSet: true, color: card.isRainbow ? availableColors[0] : card.colors[0] })}
    
    // Find the main "Play as New Set" button
    fireEvent.click(screen.getByText('Play as New Set'));
    
    // Should default to first color ('blue')
    expect(mockOnSelect).toHaveBeenCalledWith({ asNewSet: true, color: 'blue' });
  });

  it('displays all color options for rainbow wild card new set selection', () => {
    render(
        <WildCardSetSelectionDialog
          card={rainbowWildCard}
          player={mockPlayer}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Or Choose Color for New Set:')).toBeTruthy();
      // Should see color names
      expect(screen.getByText('Red')).toBeTruthy();
      expect(screen.getByText('Green')).toBeTruthy();
      expect(screen.getByText('Yellow')).toBeTruthy();
  });

  it('calls onSelect with specific color when a rainbow color option is clicked', () => {
    render(
        <WildCardSetSelectionDialog
          card={rainbowWildCard}
          player={mockPlayer}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Green'));
      expect(mockOnSelect).toHaveBeenCalledWith({ asNewSet: true, color: 'green' });
  });

  it('calls onSelect when adding to an existing set', () => {
    render(
        <WildCardSetSelectionDialog
          card={dualWildCard} // Blue/Green
          player={mockPlayer} // Has Blue
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );
      
      // Click on the existing Blue Set button
      fireEvent.click(screen.getByText('Blue Set'));
      expect(mockOnSelect).toHaveBeenCalledWith({ asNewSet: false, color: 'blue' });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <WildCardSetSelectionDialog
        card={dualWildCard}
        player={mockPlayer}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
