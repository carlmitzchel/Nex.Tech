import { Checkbox, Table } from "@mantine/core";
import { Prisma } from "@prisma/client";
import {
  IconChevronLeftPipe,
  IconChevronRightPipe,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import styles from "./table.module.scss";

const TableBody = ({
  data,
  pageSize,
  disablePageButton,
  disableCheckbox,
  selectedRows,
  setSelectedRows,
}) => {
  // Update prop name to disablePageButton
  const [loading, setLoading] = useState(true);
  const columnNames = Object.values(Prisma.BooksScalarFieldEnum);

  const headerMapping = {
    id: "ID",
    barcode: "Barcode",
    call_num: "Call Number",
    title: "Title",
    accession_num: "Accession Number",
    author: "Author",
    edition: "Edition",
    publisher: "Publisher",
    copyright_date: "Copyright Date",
    condition: "Condition",
  };

  const visibleColumns = [
    "id",
    "author",
    "title",
    "publisher",
    "edition",
    "accession_num",
    "call_num",
    "barcode",
    "copyright_date",
    "condition",
  ];

  const columns = columnNames.map((columnName) => ({
    header: headerMapping[columnName] || columnName,
    accessorKey: columnName,
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  const handleCheckboxChange = (row) => {
    setSelectedRows((prevRows) => {
      if (prevRows.find((selectedRows) => selectedRows.id === row.id)) {
        return prevRows.filter((selectedRows) => selectedRows.id !== row.id);
      } else {
        return [
          ...prevRows,
          {
            id: row.id,
            barcode: row.original.barcode,
            call_num: row.original.call_num,
            title: row.original.title,
            accession_num: row.original.accession_num,
            author: row.original.author,
            edition: row.original.edition,
            publisher: row.original.publisher,
            actual_id: row.original.id,
            image: row.original.image,
            copyright_date: row.original.copyright_date,
            condition: row.original.condition,
          },
        ];
      }
    });
  };

  useEffect(() => {
    console.log(selectedRows);
  }, [selectedRows]);

  return (
    <div className={styles.container}>
      <Table
        className={styles.database_table}
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
      >
        <Table.Thead>
          <Table.Tr className={styles.database_header}>
            <Table.Th></Table.Th> {/* Empty header for checkbox column */}
            {table
              .getHeaderGroups()
              .map((headerGroup) =>
                headerGroup.headers
                  .filter((header) => visibleColumns.includes(header.id))
                  .map((header) => (
                    <Table.Th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Table.Th>
                  ))
              )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody
          className={styles.database_body}
          selectedRows={selectedRows}
        >
          {table.getRowModel().rows.map((row) => (
            <Table.Tr
              key={row.id}
              className={styles.database_body_row}
              bg={
                selectedRows?.find((selectedRows) => selectedRows.id === row.id)
                  ? "var(--mantine-color-yellow-light)"
                  : undefined
              }
            >
              <Table.Td>
                {!disableCheckbox && (
                  <Checkbox
                    aria-label="Select row"
                    checked={
                      selectedRows?.find(
                        (selectedRow) => selectedRow.id === row.id
                      ) !== undefined
                    }
                    onChange={() => handleCheckboxChange(row)}
                  />
                )}
              </Table.Td>
              {row
                .getVisibleCells()
                .filter((cell) =>
                  visibleColumns.includes(cell.column.columnDef.accessorKey)
                )
                .map((cell) => (
                  <Table.Td key={cell.column.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {!disablePageButton && data.length > 6 && (
        <div className={styles.page_btn}>
          <IconChevronLeftPipe
            onClick={() => table.setPageIndex(0)}
            className={styles.navigator}
          />

          <IconChevronsLeft
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={styles.navigator}
          />

          <IconChevronsRight
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={styles.navigator}
          />

          <IconChevronRightPipe
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            className={styles.navigator}
          />
        </div>
      )}
    </div>
  );
};

export default TableBody;
