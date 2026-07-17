// Custom chatbot responses - no external AI API needed
const generateChatResponse = async (message: string) => {
  // Use custom chatbot responses
  try {
    return generateFallbackResponse(message)
  } catch (error) {
    // Fallback to default response if any error occurs
    return generateFallbackResponse(message)
  }
}

const generateFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('create') || lowerMessage.includes('deposit')) {
    return `To create a fixed deposit on CryptoFD:

1. Log into your dashboard
2. Open your wallet and add USDT first (this is required for all investments)
3. Click "New Investment" or "Create FD"
4. Choose your plan based on your investment amount:
   - Starter: $50-$499 (2% daily)
   - Bronze: $500-$1,999 (2.2% daily)
   - Silver: $2,000-$4,999 (2.5% daily)
   - Gold: $5,000-$9,999 (2.75% daily)
   - Platinum: $10,000-$49,999 (3% daily)
   - Diamond: $50,000+ (3.3% daily)

5. Enter your USDT amount
6. Approve the transaction
7. Your investment is active immediately!

Daily earnings start accruing the next day. After 30 days, your principal + earnings are automatically returned to your wallet.`
  }

  if (lowerMessage.includes('referral') || lowerMessage.includes('earn passive')) {
    return `CryptoFD Referral Program - Earn 10% Bonus:

How It Works:
When a referral user creates a fixed deposit (FD) of any amount, you will get a referral bonus of 10% of the investment amount.

Examples:
- Referral invests $100 → You get $10 bonus
- Referral invests $1,000 → You get $100 bonus
- Referral invests $5,000 → You get $500 bonus
- Referral invests $10,000 → You get $1,000 bonus

That's it! Share your referral link and start earning passive income!`
  }

  if (lowerMessage.includes('profit') || lowerMessage.includes('calculate') || (lowerMessage.includes('earn') && !lowerMessage.includes('referral'))) {
    return `Here's how CryptoFD profits work:

Daily Earnings Formula: Investment Amount × Daily ROI %

Example (Silver Plan - $2,000 at 2.5% daily):
- Daily earnings: $2,000 × 2.5% = $50/day
- 7-day earnings: $50 × 7 = $350
- 30-day earnings: $50 × 30 = $1,500
- Total after 30 days: $2,000 + $1,500 = $3,500 (75% profit!)

You can withdraw daily earnings anytime (3% fee applies).
After 30 days, your principal is returned automatically.

Want to calculate for a different amount? Just tell me the investment size!`
  }

  if (lowerMessage.includes('withdraw')) {
    return `Withdrawal Information:

Daily Earnings: Always and Anytime You Can Withdraw
- No lock-in period
- Withdraw your daily earnings whenever you want
- 3% withdrawal fee applies
- Processed in 30 minutes to 1 hour

Principal: Locked for 30 days
- After 30 days: Automatically returned to your wallet
- No fee on principal return
- Can immediately reinvest

Withdrawal Fee Example:
- Withdraw $100 earnings → Fee $3 → You receive $97
- Withdraw $1,000 earnings → Fee $30 → You receive $970
- Withdraw $5,000 earnings → Fee $150 → You receive $4,850

Strategy: You can withdraw daily earnings anytime, keep principal invested for continuous income!`
  }

  if (lowerMessage.includes('plan') || lowerMessage.includes('investment') && lowerMessage.includes('different')) {
    return `CryptoFD Investment Plans - Choose What Works For You:

Available Plans:

1. Starter Plan
   - Investment Range: $50 - $499
   - Daily ROI: 2%

2. Bronze Plan
   - Investment Range: $500 - $1,999
   - Daily ROI: 2.2%

3. Silver Plan
   - Investment Range: $2,000 - $4,999
   - Daily ROI: 2.5%

4. Gold Plan
   - Investment Range: $5,000 - $9,999
   - Daily ROI: 2.75%

5. Platinum Plan
   - Investment Range: $10,000 - $49,999
   - Daily ROI: 3%

6. Diamond Plan
   - Investment Range: $50,000+
   - Daily ROI: 3.3%

How to Choose:
- Invest what you can afford
- Higher investments = Higher daily percentage
- All plans are 30 days
- Earnings withdraw anytime

Example: $5,000 in Gold Plan = $137.50/day profit!

Which plan interests you?`
  }

  if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
    return `CryptoFD Security & Safety:

Your Investment is Protected By:
✓ Blockchain Verification - All transactions on BSC (auditable)
✓ Smart Contracts - Automated, tamper-proof payouts
✓ Cold Storage - Primary funds stored offline
✓ 100% Capital Guarantee - Principal fully protected
✓ Military-Grade Encryption - AES-256 encryption
✓ Multi-Signature Approvals - Multiple authorizations needed
✓ 24/7 Monitoring - Real-time security surveillance
✓ Insurance Coverage - Additional asset protection

Why You're Safe:
1. Transparent blockchain = no hidden activities
2. Smart contracts = no human error possible
3. Cold storage = protected from hacking
4. Insurance = financial backup
5. Professional team = experienced in crypto security

Your capital is 100% safe!`
  }

  return `Welcome to CryptoFD Assistant! I can help you with:
- Creating fixed deposits
- Calculating profits
- Understanding withdrawals
- Learning about our referral program
- Security information
- Any other questions about CryptoFD

What would you like to know?`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return Response.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    const response = await generateChatResponse(message.trim())

    return Response.json({
      success: true,
      response: response,
    })
  } catch (error) {
    console.error('[v0] Chat API error:', error instanceof Error ? error.message : error)
    
    // Fallback to simple response if everything fails
    const fallbackResponse = generateFallbackResponse('How can I help?')
    
    return Response.json(
      { 
        success: true,
        response: fallbackResponse
      },
      { status: 200 }
    )
  }
}
