"use client";

import { memo, ReactNode } from "react";
import { Package, Loader2 } from "lucide-react";

// ── Types ──
export interface DataViewColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header text (table) / Label text (card) */
  header: string;
  /** How to render the cell value */
  render: (item: T) => ReactNode;
  /** If true, this field is hidden on mobile card view */
  hideOnCard?: boolean;
  /** If true, this field spans full width in card grid */
  cardFullWidth?: boolean;
}

export interface DataViewProps<T> {
  /** The data array to display */
  data: T[];
  /** Column/field definitions */
  columns: DataViewColumn<T>[];
  /** Extract a unique key from each item */
  keyExtractor: (item: T) => string;
  /** Custom icon for empty state */
  emptyIcon?: ReactNode;
  /** Custom empty state title */
  emptyTitle?: string;
  /** Custom empty state description */
  emptyDescription?: string;
  /** Whether the data is currently loading */
  isLoading?: boolean;
}

// ── Inner Components (no generics for memo) ──

function DataViewTableInnerComponent<T>({
  data,
  columns,
  keyExtractor,
}: Pick<DataViewProps<T>, "data" | "columns" | "keyExtractor">) {
  return (
    <div className="data-view-table-wrapper hidden md:block">
      <table className="data-view-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DataViewTableInner = memo(
  DataViewTableInnerComponent,
) as typeof DataViewTableInnerComponent;

function DataViewCardListInnerComponent<T>({
  data,
  columns,
  keyExtractor,
}: Pick<DataViewProps<T>, "data" | "columns" | "keyExtractor">) {
  const cardColumns = columns.filter((col) => !col.hideOnCard);

  return (
    <div className="data-view-card-list md:hidden">
      {data.map((item) => (
        <div key={keyExtractor(item)} className="data-view-card">
          <div className="data-view-card-grid">
            {cardColumns.map((col) => (
              <div
                key={col.key}
                className={`data-view-card-field ${col.cardFullWidth ? "data-view-card-field--full" : ""}`}
              >
                <span className="data-view-card-label">{col.header}</span>
                <div className="data-view-card-value">{col.render(item)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const DataViewCardListInner = memo(
  DataViewCardListInnerComponent,
) as typeof DataViewCardListInnerComponent;

// ── Empty State ──
const DataViewEmpty = memo(function DataViewEmpty({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="data-view-table-wrapper">
      <div className="data-view-empty">
        <div className="data-view-empty-icon">
          {icon || <Package className="w-8 h-8" />}
        </div>
        <h3 className="data-view-empty-title">{title || "No data found"}</h3>
        <p className="data-view-empty-desc">
          {description || "Try adjusting your filters or create a new item."}
        </p>
      </div>
    </div>
  );
});

// ── Main Component ──
export function DataViewComponent<T>({
  data,
  columns,
  keyExtractor,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  isLoading,
}: DataViewProps<T>) {
  if (isLoading) {
    return (
      <div className="data-view-table-wrapper">
        <div className="data-view-empty">
          <div className="data-view-empty-icon text-brand">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="data-view-empty-title tracking-wide font-heading">
            Loading data...
          </h3>
          <p className="data-view-empty-desc">
            Please wait while we fetch the latest information.
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <DataViewEmpty
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      <DataViewTableInner
        data={data}
        columns={columns}
        keyExtractor={keyExtractor}
      />
      <DataViewCardListInner
        data={data}
        columns={columns}
        keyExtractor={keyExtractor}
      />
    </>
  );
}

export const DataView = memo(DataViewComponent) as typeof DataViewComponent;
