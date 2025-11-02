import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  onSort,
  sortKey,
  sortOrder,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort && columns.find((col) => col.key === key)?.sortable) {
      onSort(key);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-primary-600">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

