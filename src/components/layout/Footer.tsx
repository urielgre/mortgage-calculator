'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const faqItems = [
  {
    question: 'How much house can I afford?',
    answer:
      'Most lenders use the 28/36 rule: your monthly housing costs (mortgage, taxes, insurance) should not exceed 28% of your gross monthly income, and total debt payments should stay below 36%. Use the Affordability tab in this calculator to see your maximum home price based on your specific income, debts, and down payment amount.',
  },
  {
    question: 'What is PMI and when can I remove it?',
    answer:
      "Private Mortgage Insurance (PMI) is required when your down payment is less than 20% of the home price. It protects the lender if you default and typically costs 0.3%-1.5% of the loan amount annually. Under the Homeowners Protection Act, you can request PMI removal at 80% loan-to-value (LTV) and it's automatically cancelled at 78% LTV. Check the Housing Costs tab to see your PMI timeline.",
  },
  {
    question: 'Should I rent or buy a home?',
    answer:
      'The answer depends on how long you plan to stay (typically 5+ years to break even on buying), local market conditions, and your financial readiness. Key factors include the price-to-rent ratio in your area, your down payment savings, credit score, and job stability. Use the Rent vs Buy tab to compare total costs over time, including tax benefits, equity building, and investment opportunity cost of your down payment.',
  },
  {
    question: 'How do extra mortgage payments save money?',
    answer:
      'Extra payments go directly toward your principal balance, reducing the total interest charged over the life of the loan. Even small additional payments can save tens of thousands of dollars. For example, adding $200/month to a $400,000 30-year mortgage at 7% can save over $100,000 in interest and pay off the loan 7 years early. Enter extra payments in the Property input tab to see your savings.',
  },
  {
    question: 'What are typical closing costs?',
    answer:
      "Closing costs typically range from 2-5% of the purchase price. They include loan origination fees (0.5-1%), title insurance (0.5-1%), appraisal ($300-$600), home inspection ($300-$500), escrow and recording fees, and prepaid items like property taxes and homeowners insurance. This calculator estimates closing costs and includes them in the Wealth Building tab's net worth projection.",
  },
  {
    question: 'How does this calculator work?',
    answer:
      'This calculator uses the standard amortization formula to compute monthly principal and interest payments. It adds property taxes (using county-level rates for all 50 US states plus DC sourced from county assessor offices and the Tax Foundation), homeowners insurance, PMI, HOA fees, and maintenance costs. Tax benefits are modeled by comparing standard vs. itemized deductions using current IRS tax brackets. All calculations run entirely in your browser \u2014 no data is sent to any server.',
  },
]

export function Footer() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <footer role="contentinfo" className="border-t pt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          v2.0 · Last updated February 2026 · Disclaimer
        </p>
        <p className="text-sm text-muted-foreground">
          Free mortgage calculator — no login, no ads, no data collection. All
          calculations run entirely in your browser.
        </p>
        <p className="text-sm text-muted-foreground">
          Tax data verified through 2026. Not affiliated with any financial
          institution.
        </p>
      </footer>
    </div>
  )
}
