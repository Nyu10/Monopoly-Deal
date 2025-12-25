import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RentColorSelectionDialog from '../RentColorSelectionDialog';
import { CARD_TYPES } from '../../utils/gameHelpers';

describe('RentColorSelectionDialog', () => {
  const mockOnSelect = vi.fn();
  const mockOnCancel = vi.fn();

  const rentCard = {
    id: 'rent-1',
    type: CARD_TYPES.RENT,
    colors: ['blue', 'green'],
    name: 'Rent',
    value: 1
  };

  const wildRentCard = {
    id: 'rent-wild-1',
    type: CARD_TYPES.RENT_WILD,
    name: 'Wild Rent',
    value: 3
  };

  const playerWithProperties = {
    id: 'p0',
    name: 'Player 1',
    properties: [
      { id: 'b1', type: CARD_TYPES.PROPERTY, color: 'dark_blue', currentColor: 'dark_blue', value: 4 },
      { id: 'b2', type: CARD_TYPES.PROPERTY, color: 'dark_blue', currentColor: 'dark_blue', value: 4 },
      { id: 'g1', type: CARD_TYPES.PROPERTY, color: 'green', currentColor: 'green', value: 4 },
      { id: 'r1', type: CARD_TYPES.PROPERTY, color: 'red', currentColor: 'red', value: 2 }
    ]
  };

  const playerWithNoProperties = {
    id: 'p0',
    name: 'Player 1',
    properties: []
  };

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render the dialog with rent card', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Select Rent Color')).toBeTruthy();
  });

  it('should show only matching colors for regular rent card', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Should show blue and green (matching rent card colors)
    expect(screen.getByText(/Dark Blue/i)).toBeTruthy();
    expect(screen.getByText(/Green/i)).toBeTruthy();
    
    // Should NOT show red (not in rent card colors)
    expect(screen.queryByText(/Red/i)).toBeFalsy();
  });

  it('should show all colors for wild rent card', () => {
    render(
      <RentColorSelectionDialog
        card={wildRentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Should show all property colors
    expect(screen.getByText(/Dark Blue/i)).toBeTruthy();
    expect(screen.getByText(/Green/i)).toBeTruthy();
    expect(screen.getByText(/Red/i)).toBeTruthy();
  });

  it('should display rent values for each color', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Check for rent value display (should show $XM format)
    const rentValues = screen.getAllByText(/\$\d+M/);
    expect(rentValues.length).toBeGreaterThan(0);
  });

  it('should call onSelect with color when a color is clicked', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const blueButton = screen.getByText(/Dark Blue/i).closest('button');
    fireEvent.click(blueButton);

    expect(mockOnSelect).toHaveBeenCalledWith('dark_blue');
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show warning when player has no matching properties', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithNoProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/No Properties to Charge Rent/i)).toBeTruthy();
  });

  it('should display property count for each set', () => {
    render(
      <RentColorSelectionDialog
        card={rentCard}
        player={playerWithProperties}
        onSelect={mockOnSelect}
        onCancel={mockOnCancel}
      />
    );

    // Check for property count display (format: "X/Y Properties")
    expect(screen.getByText(/1\/3/i)).toBeTruthy();
  });
});
