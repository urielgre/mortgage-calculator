// =============================================================
// pmi.ts — PMI removal timeline
// Extracted from index.html without modifying formulas
// =============================================================

// --- Interfaces ---

export interface PMITimelineInput {
  /** Loan amount */
  loanAmount: number;
  /** Purchase price */
  purchasePrice: number;
  /** Monthly P&I payment */
  monthlyPI: number;
  /** Annual interest rate as %, e.g. 6.5 */
  interestRate: number;
  /** Annual appreciation rate as %, e.g. 3 */
  appreciationRate: number;
  /** Down payment as %, e.g. 15 */
  downPaymentPercent: number;
  /** Monthly extra principal payment */
  extraMonthly: number;
  /** Annual PMI rate as %, e.g. 0.5 */
  pmiRate: number;
}

export interface PMITimelineResult {
  /** Whether PMI is required */
  hasPMI: boolean;
  /** Monthly PMI amount */
  monthlyPMI: number;
  /** Month when PMI auto-cancels (78% of original purchase price) */
  autoRemovalMonth: number | null;
  /** Month when you can request PMI removal (80% of current appraised value) */
  requestRemovalMonth: number | null;
  /** Total PMI paid until auto-cancellation */
  totalPMIPaidUntilAuto: number;
  /** $ saved by requesting early removal instead of waiting for auto */
  savedByRequesting: number;
  /** Auto-removal expressed as years (string, e.g. "8.2") */
  autoRemovalYear: string;
  /** Request-removal expressed as years (string, e.g. "4.5") */
  requestRemovalYear: string;
}

// --- Functions ---

/**
 * Calculate PMI removal timeline: auto-cancellation at 78% original LTV,
 * and optional early request at 80% current (appraised) LTV.
 * Extracted from calculatePMIRemoval() in index.html.
 */
export function calculatePMITimeline(
  input: PMITimelineInput
): PMITimelineResult {
  if (input.downPaymentPercent >= 20) {
    return {
      hasPMI: false,
      monthlyPMI: 0,
      autoRemovalMonth: null,
      requestRemovalMonth: null,
      totalPMIPaidUntilAuto: 0,
      savedByRequesting: 0,
      autoRemovalYear: 'N/A',
      requestRemovalYear: 'N/A',
    };
  }

  const extraMonthly = input.extraMonthly || 0;
  const pmiRate = input.pmiRate || 0.5;
  const monthlyRate = input.interestRate / 100 / 12;
  const monthlyPMIRate = (pmiRate / 100) / 12;
  let balance = input.loanAmount;
  let month = 0;
  let totalPMIPaid = 0;
  const monthlyPMI = input.loanAmount * monthlyPMIRate;

  // Auto-removal at 78% of ORIGINAL purchase price
  const autoRemovalBalance = input.purchasePrice * 0.78;
  let autoRemovalMonth: number | null = null;

  // Request removal at 80% of CURRENT appraised value
  let requestRemovalMonth: number | null = null;

  while (month < 360 && balance > 0) {
    month++;
    const interest = balance * monthlyRate;
    const basePrincipal = input.monthlyPI - interest;
    const extra = Math.min(extraMonthly, balance - basePrincipal);
    const principal = Math.min(
      basePrincipal + Math.max(extra, 0),
      balance
    );
    balance = Math.max(balance - principal, 0);

    if (balance > autoRemovalBalance) {
      totalPMIPaid += monthlyPMI;
    }

    if (autoRemovalMonth === null && balance <= autoRemovalBalance) {
      autoRemovalMonth = month;
    }

    // Current value with appreciation
    const currentValue =
      input.purchasePrice *
      Math.pow(1 + input.appreciationRate / 100, month / 12);
    const currentLTV = (balance / currentValue) * 100;

    if (requestRemovalMonth === null && currentLTV <= 80) {
      requestRemovalMonth = month;
    }

    if (autoRemovalMonth && requestRemovalMonth) break;
  }

  return {
    hasPMI: true,
    monthlyPMI,
    autoRemovalMonth,
    requestRemovalMonth,
    totalPMIPaidUntilAuto: totalPMIPaid,
    savedByRequesting:
      autoRemovalMonth && requestRemovalMonth
        ? (autoRemovalMonth - requestRemovalMonth) * monthlyPMI
        : 0,
    autoRemovalYear: autoRemovalMonth
      ? (autoRemovalMonth / 12).toFixed(1)
      : 'N/A',
    requestRemovalYear: requestRemovalMonth
      ? (requestRemovalMonth / 12).toFixed(1)
      : 'N/A',
  };
}
