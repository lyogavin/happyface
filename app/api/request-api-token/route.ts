import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/azure-send-email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Extract form data
    const { email, useCase, qps, monthlyRequests, specialNeeds } = body
    
    // Validate required fields
    if (!email || !useCase || !qps || !monthlyRequests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create email content
    const subject = `New API Token Request from ${email}`
    const htmlContent = `
      <h2>New API Token Request</h2>
      <p><strong>From:</strong> ${email}</p>
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Main Use Case:</strong> ${useCase}</li>
        <li><strong>Estimated QPS:</strong> ${qps}</li>
        <li><strong>Estimated Monthly Requests:</strong> ${monthlyRequests}</li>
        ${specialNeeds ? `<li><strong>Special Requirements:</strong> ${specialNeeds}</li>` : ''}
      </ul>
      <p>Please review this request and respond to the user.</p>
    `
    
    // Send email notification to admin
    await sendEmail('lyo.gavin@gmail.com', subject, htmlContent)

    console.log('Email sent successfully to admin')
    
    return NextResponse.json(
      { success: true, message: 'API token request submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing API token request:', error)
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 