import { IssueReport } from '../types';

export const DEMO_SCENARIOS: IssueReport[] = [
  {
    id: 'cart-coupon-stacking',
    title: 'Bug: Coupon stack limit bypassed when order contains gift card',
    description: `When a customer applies a percentage promo coupon (e.g. 'SUMMER20') on an order that already has a store credit / gift card applied, the system erroneously recalculates discount percentage against the gross total instead of the remaining post-credit subtotal. This causes negative cart balance and margin loss.`,
    targetFile: 'src/pricing/discount-calculator.ts',
    language: 'typescript',
    expectedBehavior: 'Discount percentage must be applied strictly to the remaining subtotal after store credits are deducted.',
    actualBehavior: 'Discount percentage is applied to original subtotal, resulting in excessive discount exceeding remaining balance.',
    stackTrace: 'Error: Cart total cannot be negative (-14.50 USD) at assertValidTotal (discount-calculator.ts:42)',
    sourceCode: `export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PricingBreakdown {
  subtotal: number;
  storeCreditApplied: number;
  promoDiscount: number;
  finalTotal: number;
}

export function calculateCartTotal(
  items: CartItem[],
  storeCredit: number,
  promoDiscountPercent: number
): PricingBreakdown {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // BUG: Calculating promo discount against full subtotal instead of remaining post-credit amount
  const promoDiscount = (subtotal * promoDiscountPercent) / 100;

  // Deduction
  const afterCredit = Math.max(0, subtotal - storeCredit);
  const finalTotal = afterCredit - promoDiscount;

  if (finalTotal < 0) {
    throw new Error(\`Cart total cannot be negative (\${finalTotal.toFixed(2)} USD)\`);
  }

  return {
    subtotal,
    storeCreditApplied: Math.min(storeCredit, subtotal),
    promoDiscount,
    finalTotal: Number(finalTotal.toFixed(2)),
  };
}`,
  },
  {
    id: 'jwt-boundary-offbyone',
    title: 'Bug: Token rejected on exact millisecond of expiration boundary',
    description: `User sessions report sporadic 401 Unauthorized errors during token refresh. Investigation shows that when token expiration timestamp matches the current timestamp, isTokenValid treats it as expired due to a strict greater-than-or-equal check without tolerance window.`,
    targetFile: 'src/auth/token-validator.ts',
    language: 'typescript',
    expectedBehavior: 'A token is considered valid up to and including its expiration second, with standard 5-second clock skew tolerance.',
    actualBehavior: 'Token is immediately invalidated on the exact expiration second with 0s grace period.',
    sourceCode: `export interface TokenPayload {
  userId: string;
  exp: number; // Unix timestamp in seconds
}

export function isTokenValid(
  payload: TokenPayload,
  currentTimeSec: number,
  clockSkewSec: number = 0
): boolean {
  // BUG: Token is rejected when currentTimeSec >= payload.exp without adding clockSkew tolerance
  if (currentTimeSec >= payload.exp) {
    return false;
  }
  return true;
}`,
  },
  {
    id: 'telemetry-zero-division',
    title: 'Bug: Availability SLA metric returns NaN when server receives zero requests in sample period',
    description: `During off-peak maintenance hours when requests drop to 0, the uptime monitor crashes with "TypeError: Cannot read properties of NaN". calculateAvailability() divides successful requests by total requests without guarding against zero total.`,
    targetFile: 'src/metrics/telemetry.ts',
    language: 'typescript',
    expectedBehavior: 'When total requests is 0, the service was healthy, so availability SLA should default to 100.0%.',
    actualBehavior: '0 / 0 returns NaN, which corrupts JSON reporting and crashes dashboard widgets.',
    stackTrace: 'RangeError: Invalid format NaN in metrics serializer at formatSLA (telemetry.ts:28)',
    sourceCode: `export function calculateAvailability(
  successfulRequests: number,
  totalRequests: number
): number {
  // BUG: Zero division produces NaN when totalRequests is 0
  const rate = (successfulRequests / totalRequests) * 100;
  return Number(rate.toFixed(2));
}`,
  },
  {
    id: 'python-pagination-overflow',
    title: 'Bug: Python slice returns full array when page offset exceeds bounds',
    description: `API pagination handler returns all database records instead of an empty page when client passes an offset larger than total row count.`,
    targetFile: 'app/pagination.py',
    language: 'python',
    expectedBehavior: 'Returns empty list [] when offset >= total records.',
    actualBehavior: 'Returns entire list or wraps around unexpectedly.',
    sourceCode: `def paginate_items(items: list, offset: int, limit: int) -> list:
    total = len(items)
    # BUG: If offset is negative or exceeds total, it mishandles slice
    if offset > total:
        return items  # Defect: Returns all items instead of empty list []
    return items[offset:offset + limit]
`,
  },
];
