// ASCII data keeps string length equal to UTF-8 byte length.
globalThis.makeBulkFixture = function (revision = 'R') {
  const targetBytes = 4 * 1024 * 1024;
  const rowCount = 10000, columns = 10;
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const id = String(i).padStart(5, '0');
    return Object.assign({ id }, Object.fromEntries(Array.from({ length: columns }, (_, c) => [`c${c}`, `${revision}${id} C${c}`])));
  });
  const serialize = rows => '<section>' + rows.map(row => `<div data-row="${row.id}">` + Array.from({ length: columns }, (_, c) => `<span>${row[`c${c}`]}</span>`).join('') + '</div>').join('') + '</section>';
  const remaining = targetBytes - serialize(rows).length;
  const perCell = Math.floor(remaining / (rowCount * columns));
  let extra = remaining % (rowCount * columns);
  for (const row of rows) for (let c = 0; c < columns; c++) row[`c${c}`] += 'x'.repeat(perCell + (extra-- > 0 ? 1 : 0));
  return { rows, serialize, targetBytes, rowCount, columns };
};
