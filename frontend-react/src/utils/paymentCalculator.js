import { CARD_TYPES } from '../utils/gameHelpers';
import { getSets } from '../utils/gameHelpers';

/**
 * Calculate the optimal payment for a debt
 * Prioritizes:
 * 1) Cash (money cards) first
 * 2) Properties that don't break a complete set (minimizing count)
 * 3) Properties that break a complete set (minimizing count)
 * 
 * @param {Array} availableCards - All cards the player can pay with (bank + properties)
 * @param {number} amountDue - Amount that needs to be paid
 * @param {Array} allProperties - All properties the player owns (needed to determine sets)
 * @returns {Array} - Optimal set of cards to pay with
 */
export function calculateOptimalPayment(availableCards, amountDue, allProperties = null) {
  if (!availableCards || availableCards.length === 0) {
    return [];
  }

  // 1. Determine card location (Bank vs Board) if possible
  // If allProperties is provided, we can strictly separate Bank (Cash) from Board (Properties/Upgrades)
  let moneyCards = [];
  let boardCards = [];

  if (allProperties) {
    const boardIds = new Set(allProperties.map(c => c.id));
    moneyCards = availableCards.filter(c => !boardIds.has(c.id));
    boardCards = availableCards.filter(c => boardIds.has(c.id));
  } else {
    // Fallback: Use type definitions if we don't know where cards effectively are
    // Property cards are strictly those that are PROPERTY or PROPERTY_WILD
    boardCards = availableCards.filter(c => 
      c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD
    );
    // Everything else is treated as money (Cash, Action cards in bank, Rent cards in bank, etc.)
    moneyCards = availableCards.filter(c => 
      c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD
    );
  }

  // Sort money cards by value (ascending) - Pay with smallest bills first
  const sortedMoney = [...moneyCards].sort((a, b) => (a.value || 0) - (b.value || 0));
  
  // Step 1: Try to pay with money/bank cards first
  const moneyPayment = findExactOrMinimalOverpayment(sortedMoney, amountDue);
  
  if (getTotalValue(moneyPayment) >= amountDue) {
    return moneyPayment;
  }

  // Step 2: Need to use board assets - categorize them
  const remainingAmount = amountDue - getTotalValue(moneyPayment);
  
  // If we don't have property info, fall back to simple sorting
  if (!allProperties) {
    const sortedProps = [...boardCards].sort((a, b) => (a.value || 0) - (b.value || 0));
    const propPayment = findExactOrMinimalOverpayment(sortedProps, remainingAmount);
    return [...moneyPayment, ...propPayment];
  }

  // Determine which properties are in complete sets
  const sets = getSets(allProperties);
  const completeSetCardIds = new Set();
  sets.forEach(set => {
    if (set.isComplete) {
      set.cards.forEach(card => completeSetCardIds.add(card.id));
    }
  });

  // Categorize board cards
  // Non-set-breaking: Loose properties, or houses/hotels on INCOMPLETE sets (if any? shouldn't be), 
  // or properties that are not part of a complete set.
  // CRITICAL: Houses/Hotels usually only exist on complete sets. 
  // Should we prioritize giving up a House (Action card value) vs breaking the Set (Property card)?
  // Usually House Value (3M/4M) is high. Breaking a set is bad.
  // But giving a House doesn't "break" the set completion status, just lowers rent.
  // So Houses are "Non-Set-Breaking" technically??
  // Let's stick effectively to "Not in a Complete Set" vs "In a Complete Set".
  
  const nonSetBreaking = boardCards.filter(c => !completeSetCardIds.has(c.id));
  const setBreaking = boardCards.filter(c => completeSetCardIds.has(c.id));

  // Sort both by value (descending) to minimize number of properties given
  const sortedNonSetBreaking = [...nonSetBreaking].sort((a, b) => (b.value || 0) - (a.value || 0));
  const sortedSetBreaking = [...setBreaking].sort((a, b) => (b.value || 0) - (a.value || 0));

  // Step 3: Try to pay with non-set-breaking properties first
  const nonSetPayment = findExactOrMinimalOverpayment(sortedNonSetBreaking, remainingAmount);
  
  if (getTotalValue(nonSetPayment) >= remainingAmount) {
    return [...moneyPayment, ...nonSetPayment];
  }

  // Step 4: Need to use set-breaking properties too
  const stillRemaining = remainingAmount - getTotalValue(nonSetPayment);
  const setBreakingPayment = findExactOrMinimalOverpayment(sortedSetBreaking, stillRemaining);
  
  return [...moneyPayment, ...nonSetPayment, ...setBreakingPayment];
}

/**
 * Find exact change or minimal overpayment using greedy + backtracking
 */
function findExactOrMinimalOverpayment(cards, target) {
  if (cards.length === 0 || target <= 0) return [];

  // Try to find exact match first using dynamic programming
  const exactMatch = findExactMatch(cards, target);
  if (exactMatch) return exactMatch;

  // If no exact match, find minimal overpayment
  return findMinimalOverpayment(cards, target);
}

/**
 * Find exact match using dynamic programming (subset sum)
 */
function findExactMatch(cards, target) {
  const n = cards.length;
  
  // dp[i][j] = true if we can make sum j using first i cards
  const dp = Array(n + 1).fill(null).map(() => Array(target + 1).fill(false));
  
  // Base case: sum 0 is always possible
  for (let i = 0; i <= n; i++) {
    dp[i][0] = true;
  }

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const cardValue = cards[i - 1].value || 0;
    for (let j = 0; j <= target; j++) {
      // Don't take this card
      dp[i][j] = dp[i - 1][j];
      
      // Take this card if possible
      if (j >= cardValue && dp[i - 1][j - cardValue]) {
        dp[i][j] = true;
      }
    }
  }

  // If exact match not possible, return null
  if (!dp[n][target]) return null;

  // Backtrack to find the cards
  const result = [];
  let i = n;
  let j = target;
  
  while (i > 0 && j > 0) {
    // If we didn't use card i-1
    if (dp[i - 1][j]) {
      i--;
    } else {
      // We used card i-1
      result.push(cards[i - 1]);
      j -= cards[i - 1].value || 0;
      i--;
    }
  }

  return result;
}

/**
 * Find minimal overpayment using greedy approach
 */
function findMinimalOverpayment(cards, target) {
  // Sort by value descending for greedy approach
  const sorted = [...cards].sort((a, b) => (b.value || 0) - (a.value || 0));
  
  const result = [];
  let sum = 0;

  for (const card of sorted) {
    if (sum >= target) break;
    result.push(card);
    sum += card.value || 0;
  }

  return result;
}

/**
 * Get total value of cards
 */
function getTotalValue(cards) {
  return cards.reduce((sum, card) => sum + (card.value || 0), 0);
}

/**
 * Test the payment algorithm
 */
export function testPaymentAlgorithm() {
  const tests = [
    {
      name: 'Exact match with money cards',
      cards: [
        { id: '1', type: CARD_TYPES.MONEY, value: 1 },
        { id: '2', type: CARD_TYPES.MONEY, value: 2 },
        { id: '3', type: CARD_TYPES.MONEY, value: 3 },
      ],
      amount: 5,
      expected: { total: 5, cardCount: 2 } // Should use 2M + 3M
    },
    {
      name: 'Prioritize money over properties',
      cards: [
        { id: '1', type: CARD_TYPES.MONEY, value: 3 },
        { id: '2', type: CARD_TYPES.PROPERTY, value: 2, name: 'Baltic' },
        { id: '3', type: CARD_TYPES.PROPERTY, value: 4, name: 'Boardwalk' },
      ],
      amount: 5,
      expected: { total: 5, usesProperty: false } // Should use 3M + 2M property, but prefer money
    },
    {
      name: 'Use properties when money insufficient',
      cards: [
        { id: '1', type: CARD_TYPES.MONEY, value: 2 },
        { id: '2', type: CARD_TYPES.PROPERTY, value: 3, name: 'Park Place' },
      ],
      amount: 5,
      expected: { total: 5, cardCount: 2 }
    },
    {
      name: 'Minimal overpayment',
      cards: [
        { id: '1', type: CARD_TYPES.MONEY, value: 10 },
        { id: '2', type: CARD_TYPES.MONEY, value: 1 },
      ],
      amount: 5,
      expected: { total: 10, overpayment: 5 } // No exact match, pay 10M
    },
    {
      name: 'Complex exact match',
      cards: [
        { id: '1', type: CARD_TYPES.MONEY, value: 1 },
        { id: '2', type: CARD_TYPES.MONEY, value: 2 },
        { id: '3', type: CARD_TYPES.MONEY, value: 3 },
        { id: '4', type: CARD_TYPES.PROPERTY, value: 4, name: 'Boardwalk' },
      ],
      amount: 5,
      expected: { total: 5, usesProperty: false } // Should use 2M + 3M
    }
  ];

  console.log('🧪 Testing Payment Algorithm...\n');

  tests.forEach((test, index) => {
    const result = calculateOptimalPayment(test.cards, test.amount);
    const total = getTotalValue(result);
    const usesProperty = result.some(c => c.type !== CARD_TYPES.MONEY);
    
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`  Amount due: $${test.amount}M`);
    console.log(`  Payment: $${total}M (${result.length} cards)`);
    console.log(`  Cards used: ${result.map(c => c.name || `$${c.value}M`).join(', ')}`);
    console.log(`  Uses property: ${usesProperty}`);
    
    // Validate
    const passed = total >= test.amount;
    console.log(`  ✅ ${passed ? 'PASSED' : 'FAILED'}\n`);
  });
}
