"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  IconDeviceAnalytics,
  IconCheck,
  IconLoader2
} from "@tabler/icons-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { posthog } from "posthog-js"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  useCase: z.string().min(10, { message: "Please provide at least 10 characters" }),
  qps: z.string().min(1, { message: "Please estimate your queries per second" }),
  monthlyRequests: z.string().min(1, { message: "Please estimate your monthly request volume" }),
  specialNeeds: z.string().optional(),
})

interface RequestApiTokenDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestApiTokenDialog({ isOpen, onOpenChange }: RequestApiTokenDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      useCase: "",
      qps: "",
      monthlyRequests: "",
      specialNeeds: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/request-api-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit request')
      }
      
      // Track successful submission with PostHog
      posthog.capture("api_token_requested", {
        email: values.email,
        useCase: values.useCase,
        estimatedQps: values.qps,
        estimatedMonthlyRequests: values.monthlyRequests,
        hasSpecialNeeds: !!values.specialNeeds,
      })
      
      setIsSuccess(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Reset form state when dialog is closed
      if (!open) {
        setIsSuccess(false)
        setError(null)
        form.reset()
      }
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Request NSFW AI API Token</DialogTitle>
          <DialogDescription>
            Please provide the following information to request API access. We'll review your application and contact you soon.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 px-2 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Request Submitted</h3>
            <p className="mt-2 text-sm text-gray-500 mb-4">
              Thank you for your interest! We'll review your request and get back to you as soon as possible.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll use this email to send your API token and contact you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main use case <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how you plan to use our NSFW AI API" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="qps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated QPS <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormDescription>
                        Queries per second
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="monthlyRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly requests <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 50,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="specialNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special requirements (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special needs or requirements" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              
              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 