export const appConfig = {
  appName: 'HappyFaceAI.com',
  name: 'Happy Face AI',
  prices: [
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Perfect for individuals',
      monthlyPrice: 999, // in cents
      yearlyPrice: 9990, // in cents
      monthlyPriceId: 'price_test_monthly',
      yearlyPriceId: 'price_test_yearly',
      features: [
        'Unlimited happy face generations',
        'High-resolution outputs',
        'Priority support'
      ],
      isMostPopular: true,
      url: 'https://buy.stripe.com/test_eVa3eUdqQ77R7uM288',
      priceId: 'price_1QoY4OGhn5OuLuumS7oVky1C'
    }
    // Add more plans as needed
  ],
  allowFreeTrial: true
}

export default appConfig;