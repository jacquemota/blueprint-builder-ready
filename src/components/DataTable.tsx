import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  searchable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
  searchPlaceholder = 'Buscar...',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const searchableKeys = columns.filter(c => c.searchable !== false).map(c => c.key);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(item =>
      searchableKeys.some(key => {
        const val = item[key];
        return val != null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, searchableKeys]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              paged.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b transition-colors hover:bg-muted/30 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
