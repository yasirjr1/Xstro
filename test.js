function renderBoard(board) {
    let moveNum = 1;
    return board
      .map(row => '| ' + row.map(cell => cell || moveNum++).join(' | ') + ' |')
      .join('\n');
  }

  console.log(renderBoard(`| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 9 |`))