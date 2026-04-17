"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { ChatMessage, AgentType } from "@/lib/sof-types"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isProcessing: boolean
}

const agentColors: Record<AgentType, string> = {
  payroll: "bg-blue-500",
  banking: "bg-emerald-500",
  legal: "bg-amber-500",
  property: "bg-violet-500",
}

export function ChatPanel({ messages, onSendMessage, isProcessing }: ChatPanelProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)

  return (
    <Card className="flex flex-col h-full border-primary/20">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <Bot className="w-5 h-5 text-primary" />
          SOF Agent Assistant
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ask questions or instruct agents to re-analyze
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-in",
                message.role === "user" && "flex-row-reverse"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.agentType
                    ? agentColors[message.agentType]
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] space-y-1",
                  message.role === "user" && "text-right"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm whitespace-pre-line",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-foreground"
                  )}
                >
                  {message.content}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {message.agentType && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {message.agentType} Agent
                    </Badge>
                  )}
                  <span suppressHydrationWarning>{formatTime(message.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3 animate-slide-in">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div className="bg-primary/15 border border-primary/30 rounded-lg p-3 flex-1">
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs font-medium text-primary">Agent working</span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-soft" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-soft" style={{ animationDelay: "200ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-soft" style={{ animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or give an instruction..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            "Explain the flags",
            "Re-run payroll agent",
            "Summary of findings",
            "What documents are missing?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)}
              className="text-xs px-2 py-1 rounded-full bg-accent hover:bg-accent/80 text-muted-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </Card>
  )
}
