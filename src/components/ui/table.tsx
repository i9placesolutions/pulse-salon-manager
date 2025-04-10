import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    variant: {
      default: "",
      blue: "border-blue-200 rounded-md overflow-hidden",
      purple: "border-purple-200 rounded-md overflow-hidden",
      green: "border-green-200 rounded-md overflow-hidden",
      amber: "border-amber-200 rounded-md overflow-hidden",
      emerald: "border-emerald-200 rounded-md overflow-hidden",
      rose: "border-rose-200 rounded-md overflow-hidden",
      indigo: "border-indigo-200 rounded-md overflow-hidden",
      cyan: "border-cyan-200 rounded-md overflow-hidden",
      orange: "border-orange-200 rounded-md overflow-hidden",
      gray: "border-gray-200 rounded-md overflow-hidden",
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

interface TableProps extends 
  React.HTMLAttributes<HTMLTableElement>,
  VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(tableVariants({ variant, className }))}
        {...props}
      />
    </div>
  )
)
Table.displayName = "Table"

const tableHeaderVariants = cva("[&_tr]:border-b", {
  variants: {
    variant: {
      default: "",
      blue: "bg-blue-50 [&_tr]:hover:bg-blue-100/50",
      purple: "bg-purple-50 [&_tr]:hover:bg-purple-100/50",
      green: "bg-green-50 [&_tr]:hover:bg-green-100/50",
      amber: "bg-amber-50 [&_tr]:hover:bg-amber-100/50",
      emerald: "bg-emerald-50 [&_tr]:hover:bg-emerald-100/50",
      rose: "bg-rose-50 [&_tr]:hover:bg-rose-100/50",
      indigo: "bg-indigo-50 [&_tr]:hover:bg-indigo-100/50",
      cyan: "bg-cyan-50 [&_tr]:hover:bg-cyan-100/50",
      orange: "bg-orange-50 [&_tr]:hover:bg-orange-100/50",
      gray: "bg-gray-50 [&_tr]:hover:bg-gray-100/50",
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

interface TableHeaderProps extends 
  React.HTMLAttributes<HTMLTableSectionElement>,
  VariantProps<typeof tableHeaderVariants> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, variant, ...props }, ref) => (
    <thead ref={ref} className={cn(tableHeaderVariants({ variant, className }))} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const tableRowVariants = cva(
  "border-b transition-colors data-[state=selected]:bg-muted", {
  variants: {
    variant: {
      default: "hover:bg-muted/50",
      blue: "hover:bg-blue-50/50",
      purple: "hover:bg-purple-50/50",
      green: "hover:bg-green-50/50",
      amber: "hover:bg-amber-50/50",
      emerald: "hover:bg-emerald-50/50",
      rose: "hover:bg-rose-50/50",
      indigo: "hover:bg-indigo-50/50",
      cyan: "hover:bg-cyan-50/50",
      orange: "hover:bg-orange-50/50",
      gray: "hover:bg-gray-50/50",
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

interface TableRowProps extends 
  React.HTMLAttributes<HTMLTableRowElement>,
  VariantProps<typeof tableRowVariants> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(tableRowVariants({ variant, className }))}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

const tableHeadVariants = cva(
  "h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      blue: "text-blue-700",
      purple: "text-purple-700",
      green: "text-green-700",
      amber: "text-amber-700",
      emerald: "text-emerald-700",
      rose: "text-rose-700",
      indigo: "text-indigo-700",
      cyan: "text-cyan-700",
      orange: "text-orange-700",
      gray: "text-gray-700",
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

interface TableHeadProps extends 
  React.ThHTMLAttributes<HTMLTableCellElement>,
  VariantProps<typeof tableHeadVariants> {}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, variant, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(tableHeadVariants({ variant, className }))}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
