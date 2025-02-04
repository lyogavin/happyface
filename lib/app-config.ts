export const appConfig = {
  appName: 'HappyFaceAI.com',
  name: 'Happy Face AI',
  comfyuiHost: 'http://125.136.64.90:40657',
  prices: [
    {
      id: 'credits-30',
      name: '30 Credits',
      description: 'Perfect for trying out',
      price: 290, // in cents ($2.90)
      credits: 30,
      features: [
        '30 happy face generations',
        'High-resolution outputs',
        'Pay as you go'
      ],
      isMostPopular: false,
      url: 'https://buy.stripe.com/test_4gwbLqgD22RBaGY9AB',
      priceId: 'price_1Qon9ZGhn5OuLuumwtgZ10q4'
    },
    {
      id: 'credits-80',
      name: '80 Credits',
      description: 'Best value',
      price: 590, // in cents ($5.90)
      credits: 80,
      features: [
        '80 happy face generations',
        'High-resolution outputs',
        'Pay as you go',
        'Save 26% per credit'
      ],
      isMostPopular: true,
      url: 'https://buy.stripe.com/test_7sIeXC86w9fZ16o146',
      priceId: 'price_1QonAYGhn5OuLuumU5gf4xkL'
    }
  ],
  allowFreeTrial: true
}

export default appConfig;