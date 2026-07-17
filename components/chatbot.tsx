"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Sparkles,
  TrendingUp,
  Wallet,
  Users,
  HelpCircle,
  Shield,
  Clock,
  DollarSign,
  Zap,
  Lock,
  TrendingDown,
  Repeat,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface QuickAction {
  label: string
  icon: React.ReactNode
  query: string
}

const quickActions: QuickAction[] = [
  { label: "Create FD", icon: <MessageCircle className="w-3 h-3" />, query: "How do I create a fixed deposit and get started with investing?" },
  { label: "Profit Calculator", icon: <MessageCircle className="w-3 h-3" />, query: "Calculate my profit on a $5000 investment for 30 days" },
  { label: "Deposit Guide", icon: <MessageCircle className="w-3 h-3" />, query: "How do I deposit USDT and what are the steps?" },
  { label: "Daily Withdrawals", icon: <MessageCircle className="w-3 h-3" />, query: "Can I withdraw my daily earnings anytime?" },
  { label: "Referral Income", icon: <MessageCircle className="w-3 h-3" />, query: "How can I earn passive income through referrals?" },
  { label: "Security Info", icon: <MessageCircle className="w-3 h-3" />, query: "Is my money completely safe and secure?" },
  { label: "FD Plans", icon: <MessageCircle className="w-3 h-3" />, query: "What are all the different investment plans available?" },
  { label: "Our Platform", icon: <MessageCircle className="w-3 h-3" />, query: "Tell me about CryptoFD and how it works" },
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Hello! I'm your CryptoFD AI Assistant. I can help you understand how to invest, earn, withdraw, and more. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (userMessage?: string) => {
    const message = (userMessage || input).trim()
    if (!message || isTyping) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get response")
      }

      const responseContent = typeof data.response === 'string' 
        ? data.response 
        : JSON.stringify(data.response)

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: responseContent,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : "Sorry, I couldn't process your request. Please try again or contact support@cryptofdforever.com."
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        type: "bot",
        content: errorMessage,
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 sm:h-14 w-12 sm:w-14 rounded-full bg-primary shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center hover:scale-110 transition-transform z-40"
        aria-label="Open chat"
      >
        <MessageCircle className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[600px] max-w-sm bg-background rounded-2xl shadow-2xl flex flex-col z-50 border border-border overflow-hidden">
      {/* Premium Header with Gradient */}
      <div className="relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Bot className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate">CryptoFD AI</h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">Always here to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 rounded-full p-1 sm:p-1.5 transition-all duration-200 hover:scale-110 flex-shrink-0 ml-2"
            aria-label="Close chat"
          >
            <X className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages with improved styling */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-background via-background to-secondary/5">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              "flex gap-1 sm:gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
              message.type === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.type === "bot" && (
              <Bot className="h-3.5 sm:h-5 w-3.5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-1 hidden sm:block" />
            )}
            <div
              className={cn(
                "px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl max-w-[75%] sm:max-w-xs break-words text-xs sm:text-sm leading-relaxed shadow-sm transition-all",
                message.type === "user"
                  ? "bg-gradient-to-r from-primary to-primary/90 text-white rounded-br-none font-medium"
                  : "bg-secondary/80 text-foreground border border-border rounded-bl-none hover:bg-secondary transition-colors"
              )}
            >
              {typeof message.content === 'string' ? (
                message.content.split('\n').map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))
              ) : (
                <div>Unable to display message</div>
              )}
            </div>
            {message.type === "user" && (
              <User className="h-3.5 sm:h-5 w-3.5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-1 hidden sm:block" />
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-1 sm:gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Bot className="h-3.5 sm:h-5 w-3.5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-1 hidden sm:block" />
            <div className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-secondary/80 text-foreground border border-border rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Always Visible and Mobile Optimized */}
      <div className="border-t border-border bg-gradient-to-b from-secondary/50 to-secondary/20 flex-shrink-0">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between hover:bg-secondary/70 transition-colors duration-200 group"
        >
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate flex-1">
            Quick Questions
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {showQuickActions ? (
              <ChevronUp className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <ChevronDown className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground group-hover:text-foreground" />
            )}
          </div>
        </button>

        {showQuickActions && (
          <div className="px-2 sm:px-4 pb-2 sm:pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 animate-in slide-in-from-top-2 duration-200">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs h-auto py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-md hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 font-medium whitespace-normal text-left justify-start gap-2 flex items-start"
                onClick={() => {
                  handleSend(action.query)
                  setShowQuickActions(false)
                }}
                disabled={isTyping}
                title={action.label}
              >
                <span className="flex-shrink-0 mt-0.5">{action.icon}</span>
                <span className="flex-1 line-clamp-2 break-words">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Input Section - Mobile Optimized */}
      <div className="p-2 sm:p-4 border-t border-border bg-gradient-to-r from-background to-secondary/30 flex gap-1.5 sm:gap-2 rounded-b-2xl flex-shrink-0">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything..."
          className="text-xs sm:text-sm bg-secondary/50 border-border hover:bg-secondary/70 transition-colors focus:bg-secondary"
          disabled={isTyping}
        />
        <Button
          onClick={() => handleSend()}
          size="icon"
          className="h-8 sm:h-10 w-8 sm:w-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 hover:scale-105 shadow-lg flex-shrink-0"
          disabled={!input.trim() || isTyping}
        >
          {isTyping ? (
            <Loader2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" />
          ) : (
            <Send className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
