'use client'

import { Button } from "@/components/ui/button"
import { useUser, useClerk } from "@clerk/nextjs"
import appConfig from "@/lib/app-config"
import { useState } from "react"

type Interval = "month" | "year"

const toHumanPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

export default function PricingSection() {
  const { user, isSignedIn } = useUser()
  const clerk = useClerk()
  const [interval] = useState<Interval>("month")
  const [isLoading, setIsLoading] = useState(false)
  
  const plan = appConfig.prices[0] // Using the first plan for now

  const handleSubscribeClick = async () => {
    if (!isSignedIn) {
      // Redirect to sign in with return URL
      clerk.openSignIn({
        redirectUrl: '/#pricing'
      })
      return
    }

    setIsLoading(true)
    try {
      const paymentUrl = `${plan.url}?prefilled_email=${user?.emailAddresses[0]?.emailAddress}&client_reference_id=${user?.id}`
      window.location.href = paymentUrl
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12">Simple Pricing, Unlimited Smiles</h2>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h3 className="text-2xl font-semibold text-center mb-4">{plan.name}</h3>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold">
                ${interval === "month" ? toHumanPrice(plan.monthlyPrice) : toHumanPrice(plan.yearlyPrice)}
              </span>
              <span className="text-gray-600">/{interval}</span>
            </div>
            <ul className="mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleSubscribeClick}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : appConfig.allowFreeTrial ? 'Start 3-Day Free Trial' : 'Subscribe Now'}
            </Button>
            {appConfig.allowFreeTrial && (
              <p className="text-sm text-gray-600 text-center mt-4">
                No charge if cancelled within the trial period
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 