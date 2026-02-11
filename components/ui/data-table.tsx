/**
 * Data Table Component
 * 
 * A reusable data table component with sorting, pagination,
 * search, and row selection capabilities.
 */

"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Download, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Badge } from "./badge";

// Table column type
export interface Column<T> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

// Table props
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  title?: string;
  description?: string;
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (rows: string[]) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

/**
 * Data Table Component
 * 
 * @example
 * ```tsx
 * const columns = [
 *   { key: 'name', header: 'Name', accessor: 'name', sortable: true },
 *   { key: 'email', header: 'Email', accessor: 'email' },
 *   { 
 *     key: 'status', 
 *     header: 'Status', 
 *     accessor: 'status',
 *     cell: (row) => <Badge>{row.status}</Badge>
 *   },
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   keyExtractor={(user) => user.id}
 *   searchable
 *   pageSize={10}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  description,
  searchable = true,
  searchKeys,
  pageSize: initialPageSize = 10,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = "No data available",
  loading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const keys = searchKeys || columns.filter((c) => c.searchable !== false).map((c) => c.key);

    return data.filter((row) => {
      return keys.some((key) => {
        const column = columns.find((c) => c.key === key);
        if (!column) return false;
        
        const value = typeof column.accessor === "function"
          ? null
          : row[column.accessor];
        
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = columns.find((c) => c.key === sortColumn);
      if (!column) return 0;

      const valueA = typeof column.accessor === "function"
        ? column.accessor(a)
        : a[column.accessor];
      const valueB = typeof column.accessor === "function"
        ? column.accessor(b)
        : b[column.accessor];

      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      const comparison = String(valueA).localeCompare(String(valueB));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, sortedData.length);

  // Handle sort
  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(paginatedData.map(keyExtractor));
    } else {
      onSelectionChange?.([]);
    }
  };

  // Handle select row
  const handleSelectRow = (key: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedRows, key]
      : selectedRows.filter((k) => k !== key);
    onSelectionChange?.(newSelection);
  };

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === "asc"
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        {searchable && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                {/* Select all checkbox */}
                {selectable && (
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                
                {/* Column headers */}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`p-4 text-left font-medium ${
                      column.sortable ? "cursor-pointer hover:bg-muted/75 transition-colors" : ""
                    } ${column.className || ""}`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const key = keyExtractor(row);
                  const isSelected = selectedRows.includes(key);

                  return (
                    <tr
                      key={key}
                      className={`border-t transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-muted/50" : ""
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(key, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => (
                        <td key={column.key} className={`p-4 ${column.className || ""}`}>
                          {column.cell
                            ? column.cell(row)
                            : typeof column.accessor === "function"
                            ? column.accessor(row)
                            : String(row[column.accessor] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Page info */}
        <p className="text-sm text-muted-foreground">
          Showing {sortedData.length === 0 ? 0 : startItem} to {endItem} of {sortedData.length} results
        </p>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Page size */}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Column helper function to create common column types
 */
export function createTextColumn<T>(key: string, header: string, accessor: keyof T, options?: Partial<Column<T>>): Column<T> {
  return {
    key,
    header,
    accessor,
    sortable: true,
    searchable: true,
    ...options,
  };
}

export function createBadgeColumn<T>(
  key: string,
  header: string,
  accessor: keyof T,
  getVariant: (value: string) => "default" | "secondary" | "destructive" | "outline" = () => "default"
): Column<T> {
  return {
    key,
    header,
    accessor,
    cell: (row) => {
      const value = String(row[accessor] ?? "");
      return <Badge variant={getVariant(value)}>{value}</Badge>;
    },
  };
}

export function createDateColumn<T>(
  key: string,
  header: string,
  accessor: keyof T,
  locale = "en-US"
): Column<T> {
  return {
    key,
    header,
    accessor,
    cell: (row) => {
      const value = row[accessor];
      if (!value) return "-";
      const date = new Date(value as string);
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  };
}

export function createActionColumn<T>(
  key: string,
  actions: Array<{
    label: string;
    onClick: (row: T) => void;
    variant?: "default" | "destructive" | "outline" | "ghost";
  }>
): Column<T> {
  return {
    key,
    header: "Actions",
    accessor: "" as keyof T,
    className: "text-right",
    cell: (row) => (
      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "ghost"}
            size="sm"
            onClick={() => action.onClick(row)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    ),
  };
}
