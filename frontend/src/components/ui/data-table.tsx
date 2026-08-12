import * as React from "react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export interface ColumnDef<T> {
  header: string
  accessorKey: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

export interface DataTableProps<T> {
  data: readonly T[]
  columns: readonly ColumnDef<T>[]
  keyExtractor: (item: T, index: number) => string | number
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "Nenhum dado encontrado.",
  className,
}: DataTableProps<T>) {
  const renderCellContent = (item: T, column: ColumnDef<T>): React.ReactNode => {
    if (typeof column.accessorKey === "function") {
      return column.accessorKey(item)
    }
    const val = item[column.accessorKey]
    if (val === null || val === undefined) return "-"
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      return String(val)
    }
    return val as React.ReactNode
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <table className="w-full text-left text-sm border-collapse">
        <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn("px-4 py-3 font-medium", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Carregando dados...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item, rowIndex)}
                className="hover:bg-muted/40 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn("px-4 py-3 text-foreground", col.className)}
                  >
                    {renderCellContent(item, col)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
