export const appConfig = {
  appName: 'HappyFaceAI.com',
  name: 'Happy Face AI',
  description: 'Generate images of cum faces and clothes remover images with AI. Cum face generator. AI Clothes remover',
  keywords: ['cum face', 'clothes remover', 'AI', 'image generation', 'funny images', 'memes', 'cum face generator', 'AI clothes remover'],
  url: process.env.NEXT_PUBLIC_APP_URL || "https://cumfaceai.com",
  comfyuiHost: 'http://45.18.173.26:41040', // third backend server
  comfyuiHostClothesRemover: 'http://27.75.143.67:43691', // fourth backend server
  freeCredits: 3,
  prices: [
    {
      id: 'credits-30',
      name: '30 Credits',
      description: 'Perfect for trying out',
      price: 290, // in cents ($2.90)
      credits: 30,
      features: [
        '30 cum face generations',
        'or 30 clothes remover generations',
        'High-resolution outputs',
        'Pay as you go',
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
        '80 cum face generations',
        'or 80 clothes remover generations',
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