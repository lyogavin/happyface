'use client'

import { Button } from "@/components/ui/button"
import { useClerk, useUser } from "@clerk/nextjs"
import { useState } from "react"
import { appConfig } from "@/lib/app-config"
import { IconCoin } from "@tabler/icons-react"

const toHumanPrice = (price: number) => (price / 100).toFixed(2)

export default function PricingSection() {
  const { user, isSignedIn } = useUser()
  const clerk = useClerk()
  const [isLoading, setIsLoading] = useState(false)

  
  const handlePurchaseClick = async (plan: typeof appConfig.prices[0]) => {
    if (!isSignedIn) {
      clerk.openSignIn({
        redirectUrl: '/#pricing'
      })
      return
    }

    setIsLoading(true)
    try {
      const paymentUrl = `${plan.url}?prefilled_email=${user?.emailAddresses[0]?.emailAddress}&client_reference_id=${user?.id}`
      window.open(paymentUrl, '_blank')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12">Simple Credit Packages</h2>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">Flexibility</h3>
              <p className="text-gray-600">Choose the package that fits your needs. Use credits whenever you want.</p>
            </div>
            <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">No Expiration</h3>
              <p className="text-gray-600">Your credits stay valid forever. No pressure to use them quickly.</p>
            </div>
            <div className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-xl mb-2">Bulk Savings</h3>
              <p className="text-gray-600">Get better value when you purchase larger credit packages.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {appConfig.prices.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden p-8 ${
                plan.isMostPopular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="text-center mb-4 h-[26px]">
                {plan.isMostPopular && (
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-semibold text-center">{plan.name}</h3>
              <p className="text-gray-600 text-center mt-2 mb-6">{plan.description}</p>
              
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">${toHumanPrice(plan.price)}</span>
                </div>
                <span className="text-gray-600 flex items-center justify-center gap-1">
                  <IconCoin className="w-4 h-4 text-amber-500" />
                  for {plan.credits} credits
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                size="lg" 
                onClick={() => handlePurchaseClick(plan)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (
                  <span className="flex items-center justify-center gap-2">
                    <IconCoin className="w-5 h-5 text-amber-400" />
                    Purchase Credits
                  </span>
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center mt-4">
                Credits never expire
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 