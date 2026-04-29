import React from "react";

type TableComponent = React.FC<{ children: React.ReactNode }> & {
  Colgroup: React.FC<{ children: React.ReactNode }>;
  Col: React.FC<{ className?: string }>;
  Header: React.FC<{ children: React.ReactNode }>;
  Body: React.FC<{
    children: React.ReactNode;
    striped?: boolean;
    interactive?: boolean;
    virtualize?: boolean;
  }>;
  Row: React.FC<{ children: React.ReactNode }>;
  Head: React.FC<{ children: React.ReactNode }>;
  Cell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }>;
  Footer: React.FC<{ children: React.ReactNode }>;
};

export const Table: TableComponent = ({ children }) => {
  return (
    <div className="relative w-full min-w-[248px] overflow-auto rounded-lg border border-gray-alpha-400 bg-background-100 p-6">
      <table className="w-full border-collapse text-sm font-sans text-gray-900">{children}</table>
    </div>
  );
};

function TableColgroup({ children }: { children: React.ReactNode }) {
  return <colgroup>{children}</colgroup>;
}

function TableCol({ className }: { className?: string }) {
  return <col className={className} />;
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-gray-alpha-400">{children}</thead>;
}

function TableBody({
  children,
  striped,
  interactive,
}: {
  children: React.ReactNode;
  striped?: boolean;
  interactive?: boolean;
  virtualize?: boolean;
}) {
  return (
    <>
      <tbody className="table-row h-3" />
      <tbody
        className={`${striped ? "[&_tr:where(:nth-child(odd))]:bg-background-200" : ""}${interactive ? " [&_tr:hover]:bg-black/5 dark:[&_tr:hover]:bg-white/5" : ""}`}
      >
        {children}
      </tbody>
    </>
  );
}

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors [&_td:first-child]:rounded-l-[4px] [&_td:last-child]:rounded-r-[4px]">
      {children}
    </tr>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="h-10 px-2 text-left align-middle font-medium last:text-right">{children}</th>;
}

function TableCell({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-2 py-2.5 align-middle last:text-right ${className || ""}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

function TableFooter({ children }: { children: React.ReactNode }) {
  return <tfoot className="border-t border-gray-alpha-400">{children}</tfoot>;
}

Table.Colgroup = TableColgroup;
Table.Col = TableCol;
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.Footer = TableFooter;
