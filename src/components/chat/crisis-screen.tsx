'use client'

import { useConversationStore } from '@/store/conversation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Phone, MessageCircle, Heart } from 'lucide-react'

export function CrisisScreen() {
  const { setState } = useConversationStore()

  const handleReturnToChat = () => {
    setState('CONVERSATIONAL_DISCOVERY')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Crisis Alert Header */}
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-6 w-6" />
              <CardTitle className="text-destructive">Crisis Support Resources</CardTitle>
            </div>
            <p className="text-destructive/80">
              Your safety is our top priority. Please reach out for immediate help.
            </p>
          </CardHeader>
        </Card>

        {/* Emergency Resources */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Emergency Services</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  If you're in immediate danger to yourself or others:
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => window.open('tel:911')}
                >
                  Call 911
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Crisis Lifeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  24/7 confidential support for people in distress:
                </p>
                <div className="space-y-2">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.open('tel:988')}
                  >
                    Call 988
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('sms:988')}
                  >
                    Text 988
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Additional Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">What you can do right now:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Reach out to a trusted friend, family member, or mental health professional</li>
                <li>• Go to your nearest emergency room</li>
                <li>• Stay with someone you trust</li>
                <li>• Remove any means of self-harm from your environment</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Online Resources:</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a 
                    href="https://suicidepreventionlifeline.org/chat/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Crisis Chat (suicidepreventionlifeline.org)
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.crisistextline.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Crisis Text Line
                  </a>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Return to Chat */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            When you're ready and feeling safer, you can return to our conversation.
          </p>
          <Button 
            variant="outline" 
            onClick={handleReturnToChat}
            className="px-8"
          >
            Return to Safe Conversation
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Important:</strong> This AI assistant is not a replacement for professional mental health care or emergency services. 
              If you're experiencing a mental health emergency, please contact emergency services or a mental health professional immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}