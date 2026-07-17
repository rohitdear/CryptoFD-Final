'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TradingDataManagement() {
  const [activities, setActivities] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [prices, setPrices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize data
  const initializeData = async () => {
    if (!window.confirm("This will populate 7 months of historical data. Continue?")) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/trading-data/init?action=init', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        toast.success(`Data initialized: ${result.stats.dailyRecords} daily records, ${result.stats.trades} trades`)
        setIsInitialized(true)
        fetchData()
      }
    } catch (error) {
      toast.error('Failed to initialize data')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete all data
  const deleteAllData = async () => {
    if (!window.confirm("⚠️ This will DELETE ALL trading data. This cannot be undone. Continue?")) return
    if (!window.confirm("Are you absolutely sure? Click OK to confirm deletion.")) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/trading-data/delete-all', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        toast.success('All data deleted successfully')
        setIsInitialized(false)
        setActivities([])
        setPortfolio([])
        setPrices([])
      }
    } catch (error) {
      toast.error('Failed to delete data')
    } finally {
      setIsLoading(false)
    }
  }

  // Activity form
  const [activityForm, setActivityForm] = useState({
    crypto: 'BTC',
    action: 'BUY',
    amount: '',
    profit: '',
  })

  // Portfolio form
  const [portfolioForm, setPortfolioForm] = useState({
    asset: '',
    percentage: '',
    value: '',
  })

  // Price form
  const [priceForm, setPriceForm] = useState({
    crypto: 'BTC',
    date: new Date().toISOString().split('T')[0],
    price: '',
  })

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [actRes, portRes, priceRes] = await Promise.all([
        fetch('/api/admin/trading-data?type=activity&limit=20'),
        fetch('/api/admin/trading-data?type=portfolio'),
        fetch('/api/admin/trading-data?type=prices&limit=20'),
      ])

      if (actRes.ok) setActivities(await actRes.json())
      if (portRes.ok) setPortfolio(await portRes.json())
      if (priceRes.ok) setPrices(await priceRes.json())
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Add trading activity
  const addActivity = async () => {
    if (!activityForm.crypto || !activityForm.amount) {
      toast.error('Fill all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/trading-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'activity',
          data: {
            crypto: activityForm.crypto,
            action: activityForm.action,
            amount: parseFloat(activityForm.amount),
            profit: activityForm.profit ? parseFloat(activityForm.profit) : null,
          },
        }),
      })

      if (response.ok) {
        toast.success('Trade added')
        setActivityForm({ crypto: 'BTC', action: 'BUY', amount: '', profit: '' })
        fetchData()
      }
    } catch (error) {
      toast.error('Failed to add trade')
    }
  }

  // Update portfolio
  const updatePortfolio = async () => {
    if (!portfolioForm.asset || portfolioForm.percentage === '') {
      toast.error('Fill all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/trading-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'portfolio',
          data: {
            asset: portfolioForm.asset,
            percentage: parseInt(portfolioForm.percentage),
            value: parseFloat(portfolioForm.value || '0'),
          },
        }),
      })

      if (response.ok) {
        toast.success('Portfolio updated')
        setPortfolioForm({ asset: '', percentage: '', value: '' })
        fetchData()
      }
    } catch (error) {
      toast.error('Failed to update portfolio')
    }
  }

  // Add crypto price
  const addPrice = async () => {
    if (!priceForm.crypto || !priceForm.price) {
      toast.error('Fill all required fields')
      return
    }

    try {
      const response = await fetch('/api/admin/trading-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'prices',
          data: {
            crypto: priceForm.crypto,
            date: priceForm.date,
            price: parseFloat(priceForm.price),
          },
        }),
      })

      if (response.ok) {
        toast.success('Price added')
        setPriceForm({
          crypto: 'BTC',
          date: new Date().toISOString().split('T')[0],
          price: '',
        })
        fetchData()
      }
    } catch (error) {
      toast.error('Failed to add price')
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Trading Data Management</h1>
            <p className="text-muted-foreground">Manage all trading data shown in "Our Works" section</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={initializeData} disabled={isLoading || isInitialized} size="lg" variant="outline">
              {isLoading ? "Initializing..." : isInitialized ? "✓ Data Initialized" : "Initialize Sample Data"}
            </Button>
            <Button onClick={deleteAllData} disabled={isLoading} size="lg" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activity">Live Trading Activity</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Allocation</TabsTrigger>
            <TabsTrigger value="prices">Crypto Prices</TabsTrigger>
          </TabsList>

          {/* Live Trading Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Trade</CardTitle>
                <CardDescription>Add a new trading activity entry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Cryptocurrency</label>
                    <select
                      value={activityForm.crypto}
                      onChange={(e) => setActivityForm({ ...activityForm, crypto: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                    >
                      <option>BTC</option>
                      <option>ETH</option>
                      <option>BNB</option>
                      <option>SOL</option>
                      <option>XRP</option>
                      <option>ADA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <select
                      value={activityForm.action}
                      onChange={(e) => setActivityForm({ ...activityForm, action: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                    >
                      <option>BUY</option>
                      <option>SELL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (USDT)</label>
                    <Input
                      type="number"
                      value={activityForm.amount}
                      onChange={(e) => setActivityForm({ ...activityForm, amount: e.target.value })}
                      placeholder="50000"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Profit (USDT) - Optional</label>
                    <Input
                      type="number"
                      value={activityForm.profit}
                      onChange={(e) => setActivityForm({ ...activityForm, profit: e.target.value })}
                      placeholder="500"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button onClick={addActivity} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade
                </Button>
              </CardContent>
            </Card>

            {/* Activities List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trading Activity</CardTitle>
                <CardDescription>{activities.length} trades recorded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No trades yet</p>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{act.crypto}</span>
                            <Badge variant={act.action === 'BUY' ? 'default' : 'secondary'}>
                              {act.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${Number(act.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            {act.profit && ` • Profit: $${Number(act.profit).toLocaleString()}`}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(act.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Allocation Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Portfolio Allocation</CardTitle>
                <CardDescription>Set allocation percentages for different assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Asset</label>
                    <select
                      value={portfolioForm.asset}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, asset: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                    >
                      <option value="">Select asset</option>
                      <option value="Bitcoin">Bitcoin</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="BNB">BNB</option>
                      <option value="Solana">Solana</option>
                      <option value="Stablecoins">Stablecoins</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Percentage (%)</label>
                    <Input
                      type="number"
                      value={portfolioForm.percentage}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, percentage: e.target.value })}
                      placeholder="30"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Value (USDT) - Optional</label>
                    <Input
                      type="number"
                      value={portfolioForm.value}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, value: e.target.value })}
                      placeholder="1000000"
                      step="1000"
                    />
                  </div>
                </div>
                <Button onClick={updatePortfolio} className="w-full">
                  Update Allocation
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Portfolio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolio.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No portfolio data</p>
                  ) : (
                    portfolio.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.asset}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(item.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crypto Prices Tab */}
          <TabsContent value="prices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Crypto Price</CardTitle>
                <CardDescription>Add historical or current price data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Cryptocurrency</label>
                    <select
                      value={priceForm.crypto}
                      onChange={(e) => setPriceForm({ ...priceForm, crypto: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                    >
                      <option>BTC</option>
                      <option>ETH</option>
                      <option>BNB</option>
                      <option>SOL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={priceForm.date}
                      onChange={(e) => setPriceForm({ ...priceForm, date: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Price (USDT)</label>
                    <Input
                      type="number"
                      value={priceForm.price}
                      onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                      placeholder="50000.00"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button onClick={addPrice} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Price
                </Button>
              </CardContent>
            </Card>

            {/* Prices List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Price Data</CardTitle>
                <CardDescription>{prices.length} price records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {prices.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No price data</p>
                  ) : (
                    prices.map((price) => (
                      <div key={price.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <span className="font-medium">{price.crypto}</span>
                          <p className="text-sm text-muted-foreground">
                            ${Number(price.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(price.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
