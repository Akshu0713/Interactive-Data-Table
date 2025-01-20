import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DataTable.css';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://docs.google.com/spreadsheets/d/1vwc803C8MwWBMc7ntCre3zJ5xZtG881HKkxlIrwwxNs/gviz/tq?tqx=out:json'
        );
        const json = JSON.parse(response.data.substring(47).slice(0, -2));

        const headers = json.table.cols.map(col => col.label || 'Unnamed Column');
        const rows = json.table.rows.map(row =>
          row.c.map(cell => cell?.v ?? '')
        );

        setColumns(headers);
        setData(rows);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSort = (columnIndex) => {
    let direction = 'asc';
    if (sortConfig.key === columnIndex && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnIndex && sortConfig.direction === 'desc') {
      direction = '';
    }

    setSortConfig({ key: columnIndex, direction });

    if (direction) {
      const sortedData = [...data].sort((a, b) => {
        const aValue = parseSortableValue(a[columnIndex]);
        const bValue = parseSortableValue(b[columnIndex]);
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return direction === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
      setData(sortedData);
    } else {
      setData([...data]); // Reset sort to original data order if direction is empty
    }
  };

  const parseSortableValue = (value) => {
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', ''));
    }
    if (typeof value === 'string' && value.startsWith('$')) {
      return parseFloat(value.replace('$', ''));
    }
    return value;
  };

  const filteredData = filter
    ? data.filter(row =>
        row[0]?.toString().toLowerCase().includes(filter.toLowerCase())
      )
    : data;

  return (
    <div>
      <h1>Data Table</h1>
      <input
        type="text"
        placeholder="Filter by Domain Name"
        value={filter}
        onChange={handleFilterChange}
      />
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} onClick={() => handleSort(index)}>
                {col} {sortConfig.key === index ? (sortConfig.direction === 'asc' ? '▲' : sortConfig.direction === 'desc' ? '▼' : '') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{formatCell(cell, columns[cellIndex])}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>No matching data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const formatCell = (value, column) => {
  if (/price/i.test(column) && typeof value === 'number') {
    return `$${value.toFixed(2)}`;
  }
  if (/spam score/i.test(column)) {
    return `${parseFloat(value).toFixed(2)}`;
  }
  return value;
};

export default DataTable;
