import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/actions/utils"

export type ToastVariant = "default" | "destructive" | "info" | "notice" | "success" | "api"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-fit min-w-[280px] max-w-[420px] flex-col-reverse p-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-fit items-center justify-between space-x-2 overflow-hidden border p-2 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white dark:bg-background dark:border-gray-800 text-gray-900 dark:text-gray-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
        destructive: "border-red-300 bg-red-100 dark:bg-background dark:border-red-900 text-red-950 dark:text-red-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
        info: "border-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-950 dark:text-yellow-200 dark:border-yellow-900/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
        notice: "border-blue-300 bg-blue-100 dark:bg-blue-900/20 text-blue-950 dark:text-blue-200 dark:border-blue-900/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
        success: "border-emerald-300 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-950 dark:text-emerald-200 dark:border-emerald-900/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
        api: "border-cyan-300 bg-cyan-100 dark:bg-cyan-900/20 text-cyan-950 dark:text-cyan-200 dark:border-cyan-900/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BaseToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
  VariantProps<typeof toastVariants> {
  variant?: ToastVariant
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  BaseToastProps
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-2 rounded-md p-0.5 text-gray-500 dark:text-gray-400 opacity-0 transition-opacity hover:text-gray-900 dark:hover:text-gray-200 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-gray-950 dark:text-gray-200 [&+div]:text-xs mb-0.5", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-gray-800 dark:text-gray-400 leading-relaxed mb-1", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastProgressBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: ToastVariant }
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("absolute bottom-0 left-0 right-0 h-[3px] w-full bg-transparent", className)}
    style={{ margin: 0, padding: 0 }}
    {...props}
  >
    <div className={cn(
      "h-full progress-animation",
      variant === "destructive" ? "bg-red-500" :
        variant === "info" ? "bg-yellow-500" :
          variant === "notice" ? "bg-blue-500" :
            variant === "success" ? "bg-emerald-500" :
              variant === "api" ? "bg-cyan-500" :
                "bg-blue-500"
    )} style={{ margin: 0, padding: 0 }} />
  </div>
))
ToastProgressBar.displayName = "ToastProgressBar"

type ToastActionElement = React.ReactElement<typeof ToastAction>

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProgressBar,
  type ToastActionElement,
}
