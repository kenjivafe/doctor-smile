import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [selectedTab, setSelectedTab] = React.useState(value || defaultValue || '')

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedTab(value)
      }
    }, [value])

    // Store the onValueChange callback in a ref to avoid re-renders
    const onChangeRef = React.useRef(onValueChange)
    React.useEffect(() => {
      onChangeRef.current = onValueChange
    }, [onValueChange])

    // Expose the value change handler through a custom property
    const divRef = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => {
      const div = divRef.current as HTMLDivElement & { _valueChangeCallback?: (value: string) => void }
      if (div) {
        div._valueChangeCallback = (newValue: string) => {
          setSelectedTab(newValue)
          onChangeRef.current?.(newValue)
        }
      }
      return div as HTMLDivElement
    })

    return (
      <div
        ref={divRef}
        className={cn(className)}
        data-selected-tab={selectedTab}
        {...props}
      />
    )
  }
)
Tabs.displayName = "Tabs"

// TabsList props are the same as div props
type TabsListProps = React.HTMLAttributes<HTMLDivElement>

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const tabsEl = React.useContext(React.createContext<HTMLElement | null>(null))
    const selectedTab = tabsEl?.dataset.selectedTab
    const isSelected = selectedTab === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isSelected}
        data-state={isSelected ? "active" : "inactive"}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          className
        )}
        onClick={() => {
          const tabs = tabsEl?.closest('[data-selected-tab]')
          if (tabs) {
            // Define a type for the extended HTMLElement with our custom property
            type TabsElement = HTMLElement & { _valueChangeCallback?: (value: string) => void }
            const onValueChange = (tabs as TabsElement)._valueChangeCallback
            if (typeof onValueChange === 'function') {
              onValueChange(value)
            } else {
              tabs.setAttribute('data-selected-tab', value)
            }
          }
        }}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const tabsEl = React.useContext(React.createContext<HTMLElement | null>(null))
    const selectedTab = tabsEl?.dataset.selectedTab
    const isSelected = selectedTab === value

    if (!isSelected) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isSelected ? "active" : "inactive"}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
