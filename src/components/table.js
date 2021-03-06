import React, {useState} from "react";

// columns is an array of objects which have keys:
// field: should be present in every object in rows
// (optional) headerName: what will display in table header

const SortableTable = ({rows, columns, title, id}) => {
    const [sortField, setSortField] = useState(columns.find(column => column.initSort).field || columns[0].field);
    const [sortReverse, setSortReverse] = useState(false);

    return (
        <table id={id}>
            <caption>{title}</caption>
            <thead>
                <tr>
                    {columns.map(column => (
                        <th key={column.field} style={{cursor: column.unSortable ? '' : 'pointer'}} onClick={column.unSortable ? null : () => {
                            setSortField(column.field)
                            setSortReverse(prev => {return column.field === sortField ? !prev : false})
                        }}>
                            {column.headerName || column.field} 
                            {`${sortField === column.field ? (sortReverse ? String.fromCharCode(8593) : String.fromCharCode(8595)) : ""}`}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.sort((a, b) => {
                    return (
                        columns.find(column => column.field === sortField).sortAscending ? -1 : 1) 
                        * (sortReverse ? -1 : 1) 
                        * (b[sortField].toString().localeCompare(a[sortField].toString(), undefined, {numeric: true}))
                }).map((row, index) => (
                    <tr key={index} style={{color: row.color}}>
                        {columns.map((column) => (
                            <td>{column.transformer ? column.transformer(row[column.field]) : row[column.field]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default SortableTable;