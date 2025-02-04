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
      url: 'https://buy.stripe.com/28o1444Nx05DanS145',
      priceId: 'price_1QoozhK1azW3oEWADjbBgKgx'
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
      url: 'https://buy.stripe.com/cN24gg6VF3hPfIc000',
      priceId: 'price_1QoozhK1azW3oEWABQ3VUYhS'
    }
  ],
  allowFreeTrial: true
}

export default appConfig;