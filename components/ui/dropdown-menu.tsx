"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple dropdown menu implementation without Radix UI
interface DropdownMenuProps {
    children: React.ReactNode
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    asChild?: boolean
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    sideOffset?: number
    align?: 'start' | 'center' | 'end'
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    inset?: boolean
    asChild?: boolean
}

interface DropdownMenuCheckboxItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    checked?: boolean
}

interface DropdownMenuRadioItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    inset?: boolean
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
}

// Global context to manage all dropdowns
const GlobalDropdownContext = React.createContext<{
    openDropdownId: string | null
    setOpenDropdownId: (id: string | null) => void
}>({
    openDropdownId: null,
    setOpenDropdownId: () => { },
})

const DropdownMenuContext = React.createContext<{
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    dropdownId: string
}>({
    isOpen: false,
    setIsOpen: () => { },
    dropdownId: '',
})

const DropdownMenu = ({ children }: DropdownMenuProps) => {
    const dropdownId = React.useId()
    const globalContext = React.useContext(GlobalDropdownContext)
    const isOpen = globalContext.openDropdownId === dropdownId

    const setIsOpen = React.useCallback((open: boolean) => {
        if (open) {
            globalContext.setOpenDropdownId(dropdownId)
        } else {
            if (globalContext.openDropdownId === dropdownId) {
                globalContext.setOpenDropdownId(null)
            }
        }
    }, [dropdownId, globalContext])

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, dropdownId }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

// Provider to wrap the entire app or navbar
export const DropdownMenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)

    return (
        <GlobalDropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
            {children}
        </GlobalDropdownContext.Provider>
    )
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
    ({ className, children, asChild, ...props }, ref) => {
        const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)
        const triggerRef = React.useRef<HTMLElement | null>(null)

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
        }

        if (asChild) {
            // When asChild is true, clone the child element and add the trigger functionality
            const child = React.Children.only(children) as React.ReactElement
            return React.cloneElement(child, {
                ref: (node: HTMLElement | null) => {
                    triggerRef.current = node
                    if (typeof ref === 'function') ref(node as any)
                    else if (ref && node) (ref as React.MutableRefObject<any>).current = node
                },
                'data-dropdown-trigger': true,
                className: cn(child.props.className, className),
                onClick: (e: React.MouseEvent) => {
                    handleClick(e)
                    child.props.onClick?.(e)
                },
                ...props
            })
        }

        return (
            <button
                ref={(node) => {
                    triggerRef.current = node
                    if (typeof ref === 'function') ref(node)
                    else if (ref && node) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
                }}
                data-dropdown-trigger
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ className, children, sideOffset = 4, align = 'end', ...props }, ref) => {
        const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)
        const contentRef = React.useRef<HTMLDivElement | null>(null)
        const triggerRef = React.useRef<HTMLElement | null>(null)
        const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        // Get trigger element position
        React.useEffect(() => {
            if (isOpen) {
                const updatePosition = () => {
                    // Find the trigger button in the DOM by finding the element with data-dropdown-trigger
                    const triggers = document.querySelectorAll<HTMLElement>('[data-dropdown-trigger]')
                    // Find the one that belongs to this dropdown (the one inside our parent container)
                    const parentContainer = contentRef.current?.parentElement
                    
                    for (let i = 0; i < triggers.length; i++) {
                        const t = triggers[i]
                        if (parentContainer && parentContainer.contains(t)) {
                            const rect = t.getBoundingClientRect()
                            setPosition({
                                top: rect.bottom + sideOffset,
                                left: rect.right, // Use right edge of trigger for right-aligned dropdown
                                width: rect.width
                            })
                            break
                        }
                    }
                }
                updatePosition()
                window.addEventListener('resize', updatePosition)
                window.addEventListener('scroll', updatePosition)
                
                return () => {
                    window.removeEventListener('resize', updatePosition)
                    window.removeEventListener('scroll', updatePosition)
                }
            }
        }, [isOpen, sideOffset])

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node
                const current = contentRef.current
                
                // Get the trigger button
                const triggerContainer = document.querySelector(`[data-dropdown-trigger]`)
                
                // Close if clicked outside both the content and the trigger
                if (current && !current.contains(target)) {
                    // Check if click is on trigger
                    let element: Node | null = target
                    let isClickOnTrigger = false
                    
                    while (element && element !== document.body) {
                        if (element instanceof HTMLElement && element.hasAttribute('data-dropdown-trigger')) {
                            isClickOnTrigger = true
                            break
                        }
                        element = element.parentNode
                    }
                    
                    if (!isClickOnTrigger) {
                        setIsOpen(false)
                    }
                }
            }

            if (isOpen) {
                // Use setTimeout to avoid immediate closing when opening
                setTimeout(() => {
                    document.addEventListener('mousedown', handleClickOutside)
                }, 0)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [isOpen, setIsOpen])

        if (!isOpen || !mounted) return null

        const dropdownContent = (
            <div
                ref={(node) => {
                    contentRef.current = node
                    if (typeof ref === 'function') ref(node)
                    else if (ref && node) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
                }}
                style={{ 
                    position: 'fixed',
                    top: position.top,
                    right: `calc(100vw - ${position.left}px)`,
                    zIndex: 9999,
                    transformOrigin: 'top right'
                }}
                className={cn(
                    "min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-gray-800 p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {children}
            </div>
        )

        return createPortal(dropdownContent, document.body)
    }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
    ({ className, inset, asChild, children, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext)

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, {
                ...children.props,
                className: cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    inset && "pl-8",
                    className,
                    children.props.className
                ),
                onClick: (e: React.MouseEvent) => {
                    setIsOpen(false)
                    children.props.onClick?.(e)
                    props.onClick?.(e as any)
                }
            } as any)
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    inset && "pl-8",
                    className
                )}
                onClick={(e) => {
                    setIsOpen(false)
                    props.onClick?.(e)
                }}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
    ({ className, children, checked, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext)

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    className
                )}
                onClick={(e) => {
                    setIsOpen(false)
                    props.onClick?.(e)
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {checked && <Check className="h-4 w-4" />}
                </span>
                {children}
            </button>
        )
    }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
    ({ className, children, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext)

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    className
                )}
                onClick={(e) => {
                    setIsOpen(false)
                    props.onClick?.(e)
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Circle className="h-2 w-2 fill-current" />
                </span>
                {children}
            </button>
        )
    }
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
    ({ className, inset, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "px-2 py-1.5 text-sm font-semibold",
                inset && "pl-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)}
            {...props}
        />
    )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
    ({ className, children, ...props }, ref) => (
        <span
            ref={ref}
            className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
            {...props}
        >
            {children}
        </span>
    )
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Placeholder components for compatibility
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
}






