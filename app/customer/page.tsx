"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Send,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Bot,
  User,
  Paperclip,
  AlertCircle,
  Shield,
  Clock,
  ChevronRight,
  X,
} from "lucide-react"

type MessageType = "bot" | "user" | "system"
type MessageStatus = "sending" | "sent" | "error"

interface ChatMessage {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  status?: MessageStatus
  documents?: UploadedDocument[]
  options?: string[]
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  status: "uploading" | "uploaded" | "processing" | "verified" | "needs_review"
}

interface JourneyStep {
  id: number
  title: string
  status: "pending" | "active" | "completed"
}

export default function CustomerJourneyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Hello! I'm your Source of Funds verification assistant. I'll guide you through providing the information we need to verify where your funds are coming from.\n\nThis process helps us comply with regulations and protect you from fraud.",
      timestamp: new Date(),
    },
    {
      id: "prompt-1",
      type: "bot",
      content: "To get started, please describe the source(s) of your funds. For example:\n\n• Employment income (salary, bonuses)\n• Savings accumulated over time\n• Gift from a family member\n• Sale of property or assets\n• Inheritance",
      timestamp: new Date(),
      options: [
        "I have employment income",
        "I received a gift from family",
        "I have savings",
        "Multiple sources",
      ],
    },
  ])
  
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([
    { id: 1, title: "Provide Statement", status: "active" },
    { id: 2, title: "Upload Documents", status: "pending" },
    { id: 3, title: "Verification", status: "pending" },
    { id: 4, title: "Confirmation", status: "pending" },
  ])
  const [currentStep, setCurrentStep] = useState(1)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }
  
  const simulateBotResponse = async (userMessage: string) => {
    setIsProcessing(true)
    
    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 1500))
    
    // Determine response based on current step and message content
    if (currentStep === 1) {
      // Analyze statement and ask for documents
      addMessage({
        type: "bot",
        content: "Thank you for that information. Let me analyze what you've told me...",
      })
      
      await new Promise((r) => setTimeout(r, 2000))
      
      // Update journey step
      setJourneySteps((prev) =>
        prev.map((step) =>
          step.id === 1 ? { ...step, status: "completed" } :
          step.id === 2 ? { ...step, status: "active" } : step
        )
      )
      setCurrentStep(2)
      
      addMessage({
        type: "bot",
        content: "Based on your statement, I've identified the following funding sources that need verification:\n\n" +
          "1. Employment Income - £65,000 annual salary\n" +
          "2. Gift from family member\n\n" +
          "To verify these, I'll need the following documents:",
      })
      
      await new Promise((r) => setTimeout(r, 1000))
      
      addMessage({
        type: "system",
        content: "DOCUMENTS_REQUIRED",
        documents: [
          { id: "doc-1", name: "Recent payslips (last 3 months)", type: "payslip", status: "uploading" },
          { id: "doc-2", name: "Bank statement showing salary deposits", type: "bank_statement", status: "uploading" },
          { id: "doc-3", name: "Gift letter from family member", type: "gift_letter", status: "uploading" },
        ],
      })
      
      await new Promise((r) => setTimeout(r, 500))
      
      addMessage({
        type: "bot",
        content: "Please upload the documents above. You can drag and drop files or click to browse.",
      })
    } else if (currentStep === 2) {
      // If documents uploaded, process them
      if (uploadedDocs.length > 0) {
        addMessage({
          type: "bot",
          content: "I'm reviewing the documents you've uploaded...",
        })
        
        await new Promise((r) => setTimeout(r, 2500))
        
        // Update journey step
        setJourneySteps((prev) =>
          prev.map((step) =>
            step.id === 2 ? { ...step, status: "completed" } :
            step.id === 3 ? { ...step, status: "active" } : step
          )
        )
        setCurrentStep(3)
        
        // Check if we need more info
        const needsMoreInfo = Math.random() > 0.5
        
        if (needsMoreInfo) {
          addMessage({
            type: "bot",
            content: "I've reviewed your documents. However, I need some clarification:\n\n" +
              "The gift amount mentioned in your statement doesn't exactly match the bank transfer shown in your statement. " +
              "Could you please clarify or provide additional documentation?",
            options: [
              "The amount was transferred in two parts",
              "I'll upload an updated gift letter",
              "Speak to an advisor",
            ],
          })
        } else {
          await new Promise((r) => setTimeout(r, 1000))
          
          // Update to confirmation
          setJourneySteps((prev) =>
            prev.map((step) =>
              step.id === 3 ? { ...step, status: "completed" } :
              step.id === 4 ? { ...step, status: "active" } : step
            )
          )
          setCurrentStep(4)
          
          addMessage({
            type: "bot",
            content: "Great news! I've successfully verified your source of funds:\n\n" +
              "✓ Employment income verified\n" +
              "✓ Gift documentation verified\n\n" +
              "Your application will now proceed to the next stage. You'll receive a confirmation email shortly.",
          })
          
          addMessage({
            type: "system",
            content: "VERIFICATION_COMPLETE",
          })
        }
      } else {
        addMessage({
          type: "bot",
          content: "Please upload the required documents to continue with the verification process.",
        })
      }
    } else if (currentStep === 3) {
      // Handle clarification responses
      addMessage({
        type: "bot",
        content: "Thank you for the clarification. Let me update the verification...",
      })
      
      await new Promise((r) => setTimeout(r, 2000))
      
      // Update to confirmation
      setJourneySteps((prev) =>
        prev.map((step) =>
          step.id === 3 ? { ...step, status: "completed" } :
          step.id === 4 ? { ...step, status: "active" } : step
        )
      )
      setCurrentStep(4)
      
      addMessage({
        type: "bot",
        content: "Your source of funds has been verified successfully!\n\n" +
          "✓ Employment income - £65,000\n" +
          "✓ Family gift - £30,000\n\n" +
          "Total verified: £95,000\n\n" +
          "Your application will proceed to the next stage.",
      })
      
      addMessage({
        type: "system",
        content: "VERIFICATION_COMPLETE",
      })
    }
    
    setIsProcessing(false)
  }
  
  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return
    
    const userMessage = inputValue.trim()
    setInputValue("")
    
    addMessage({
      type: "user",
      content: userMessage,
      status: "sent",
    })
    
    await simulateBotResponse(userMessage)
  }
  
  const handleOptionClick = async (option: string) => {
    if (isProcessing) return
    
    addMessage({
      type: "user",
      content: option,
      status: "sent",
    })
    
    await simulateBotResponse(option)
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    Array.from(files).forEach((file) => {
      const newDoc: UploadedDocument = {
        id: `upload-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        status: "uploading",
      }
      
      setUploadedDocs((prev) => [...prev, newDoc])
      
      // Simulate upload progress
      setTimeout(() => {
        setUploadedDocs((prev) =>
          prev.map((doc) =>
            doc.id === newDoc.id ? { ...doc, status: "uploaded" } : doc
          )
        )
      }, 1500)
    })
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  const removeDocument = (docId: string) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.id !== docId))
  }
  
  const renderMessage = (message: ChatMessage) => {
    if (message.type === "system") {
      if (message.content === "DOCUMENTS_REQUIRED") {
        return (
          <div className="space-y-3 animate-slide-in">
            {message.documents?.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
                </div>
                <Upload className="w-5 h-5 text-primary" />
              </div>
            ))}
          </div>
        )
      }
      
      if (message.content === "VERIFICATION_COMPLETE") {
        return (
          <div className="p-6 bg-gradient-to-br from-success/20 to-success/5 rounded-2xl border-2 border-success/30 animate-slide-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">Verification Complete</p>
                <p className="text-sm text-muted-foreground">Your source of funds has been verified</p>
              </div>
            </div>
          </div>
        )
      }
      
      return null
    }
    
    const isBot = message.type === "bot"
    
    return (
      <div className={cn("flex gap-3 animate-slide-in", !isBot && "flex-row-reverse")}>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isBot ? "bg-primary" : "bg-accent"
        )}>
          {isBot ? (
            <Bot className="w-5 h-5 text-primary-foreground" />
          ) : (
            <User className="w-5 h-5 text-foreground" />
          )}
        </div>
        <div className={cn(
          "max-w-[80%] space-y-3",
          !isBot && "items-end"
        )}>
          <div className={cn(
            "p-4 rounded-2xl",
            isBot ? "bg-white border border-border shadow-sm" : "bg-primary text-primary-foreground"
          )}>
            <p className={cn(
              "text-sm whitespace-pre-line leading-relaxed",
              isBot ? "text-foreground" : "text-primary-foreground"
            )}>
              {message.content}
            </p>
          </div>
          
          {/* Quick reply options */}
          {isBot && message.options && (
            <div className="flex flex-wrap gap-2">
              {message.options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleOptionClick(option)}
                  disabled={isProcessing}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          
          <p className={cn(
            "text-xs text-muted-foreground",
            !isBot && "text-right"
          )}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    )
  }
  
  const progressPercentage = ((currentStep - 1) / (journeySteps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Source of Funds Verification</h1>
              <p className="text-xs text-primary-foreground/70">Secure document verification</p>
            </div>
          </div>
          <Badge variant="outline" className="border-white/30 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            ~5 min
          </Badge>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Progress Steps */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              {journeySteps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      step.status === "completed" && "bg-success text-success-foreground",
                      step.status === "active" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      step.status === "pending" && "bg-muted text-muted-foreground"
                    )}>
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-2 text-center max-w-[80px]",
                      step.status === "active" ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <div className="flex-1 mx-2">
                      <ChevronRight className={cn(
                        "w-5 h-5",
                        step.status === "completed" ? "text-success" : "text-muted-foreground/30"
                      )} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>
        
        {/* Chat Interface */}
        <Card className="border-2 border-primary/10 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-accent/30 to-background">
            {messages.map((message) => (
              <div key={message.id}>
                {renderMessage(message)}
              </div>
            ))}
            
            {/* Uploaded Documents Preview */}
            {uploadedDocs.length > 0 && currentStep === 2 && (
              <div className="space-y-2 animate-slide-in">
                <p className="text-xs font-medium text-muted-foreground">Uploaded Documents:</p>
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="flex-1 text-sm truncate">{doc.name}</span>
                    {doc.status === "uploading" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {uploadedDocs.every((d) => d.status === "uploaded") && (
                  <Button
                    className="w-full mt-2"
                    onClick={() => simulateBotResponse("Documents uploaded")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Documents for Verification
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex gap-3 animate-slide-in">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Processing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-border p-4 bg-white">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
            />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || currentStep !== 2}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={
                  currentStep === 1 
                    ? "Describe your source of funds..." 
                    : currentStep === 2 
                      ? "Upload documents or ask a question..."
                      : "Type your response..."
                }
                className="min-h-[44px] max-h-[120px] resize-none"
                disabled={isProcessing}
              />
              
              <Button
                size="icon"
                className="flex-shrink-0"
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your data is encrypted and secure. <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </Card>
        
        {/* Help Section */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
            <AlertCircle className="w-4 h-4" />
            Need help?
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
            <FileText className="w-4 h-4" />
            Document guidelines
          </a>
        </div>
      </div>
    </div>
  )
}
