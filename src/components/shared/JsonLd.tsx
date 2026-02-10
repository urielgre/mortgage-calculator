'use client';

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Smart Mortgage Calculator",
        "url": "https://mortgage-calculator-tau-five.vercel.app",
        "description": "Free mortgage calculator with PITI breakdown, tax benefits, affordability analysis, rent vs buy comparison, and wealth building projections for all 50 US states.",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Monthly PITI payment calculation",
          "Property tax by state and county",
          "Federal and state tax benefit analysis",
          "Rent vs buy 10-year comparison",
          "Affordability calculator (28% DTI rule)",
          "PMI timeline and removal analysis",
          "Extra payment savings calculator",
          "10-year wealth building projection",
          "PDF report export",
          "URL sharing with full state encoding"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much house can I afford?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Financial experts recommend spending no more than 28% of your gross monthly income on housing costs (including mortgage payment, property taxes, insurance, and HOA). Our affordability calculator uses this 28% rule along with current interest rates to estimate your maximum purchase price."
            }
          },
          {
            "@type": "Question",
            "name": "What is PMI and when can I remove it?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Private Mortgage Insurance (PMI) is required when your down payment is less than 20% of the home's value. Under the Homeowners Protection Act, your lender must automatically cancel PMI when your loan balance reaches 78% of the original home value. You can also request cancellation at 80% LTV. Our PMI timeline calculator shows exactly when you'll reach these milestones."
            }
          },
          {
            "@type": "Question",
            "name": "Should I rent or buy?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The rent vs buy decision depends on many factors including how long you plan to stay, local market conditions, your financial situation, and tax benefits. Our calculator compares the total cost of renting vs buying over 10 years, accounting for appreciation, tax savings, equity building, and investment opportunity costs."
            }
          },
          {
            "@type": "Question",
            "name": "How do extra payments save money?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Extra mortgage payments go directly toward reducing your principal balance, which means you pay less interest over the life of the loan. Even small additional monthly payments can save tens of thousands of dollars and shorten your loan by years. Our extra payments calculator shows the exact savings."
            }
          },
          {
            "@type": "Question",
            "name": "What are typical closing costs?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Closing costs typically range from 2-5% of the loan amount and include origination fees, appraisal, title insurance, escrow fees, and prepaid items. Our calculator estimates closing costs and shows the total cash needed to close, including your down payment."
            }
          },
          {
            "@type": "Question",
            "name": "How does this calculator work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This calculator uses standard amortization formulas, current federal and state tax brackets for all 50 states, county-level property tax data, and financial modeling to provide comprehensive mortgage analysis. All calculations run in your browser — no data is sent to any server. Sources include IRS tax tables, state revenue departments, and CFPB guidelines."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
