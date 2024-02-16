document.addEventListener('DOMContentLoaded', (event) => {
    adjustColumnWidths('bulkEditForm');
    addRowsToTable(20); // Initial rows added for demonstration
    enableDragAndCopy();
});

function adjustColumnWidths(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');
    let colWidths = new Array(table.rows[0].cells.length).fill(0);
    // Create a temporary canvas to measure text width accurately

    // Create a temporary canvas to measure text width accurately
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    context.font = "16px Arial";

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const cells = rows[rowIndex].cells;

        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
            const cell = cells[cellIndex];
            const text = cell.innerText || cell.textContent;

            // Measure text width
            const metrics = context.measureText(text);
            const textWidth = metrics.width;

            if (textWidth > colWidths[cellIndex]) {
                colWidths[cellIndex] = textWidth;
            }
        }
    }

    // Apply the maximum width plus some padding to each column
    const headerCells = table.rows[0].cells;
    colWidths.forEach((width, index) => {
        headerCells[index].style.width = `${width + 1}px`;
    });
}

function addRowsToTable(numberOfRows) {
    const tableBody = document.getElementById('bulkEditForm').getElementsByTagName('tbody')[0];
    for (let i = 0; i < numberOfRows; i++) {
        const newRow = tableBody.insertRow();
        for (let j = 0; j < 11; j++) {
            const cell = newRow.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.oninput = function() { adjustColumnWidths('bulkEditForm'); };
            cell.appendChild(input);
        }
    }
}

function enableDragAndCopy() {
    const table = document.getElementById('bulkEditForm');
    let isDragging = false;
    let startCell = null;
    let cellsToHighlight = [];

    table.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT') {
            isDragging = true;
            startCell = e.target;
            cellsToHighlight.push(e.target);
            e.target.parentElement.style.backgroundColor = 'yellow'; // Highlight the starting cell
        }
    });

    table.addEventListener('mousemove', (e) => {
        if (isDragging && e.target.tagName === 'INPUT' && !cellsToHighlight.includes(e.target)) {
            e.target.parentElement.style.backgroundColor = 'yellow';
            cellsToHighlight.push(e.target);
        }
    });

    table.addEventListener('mouseup', () => {
        if (isDragging && startCell) {
            cellsToHighlight.forEach(cell => {
                cell.value = startCell.value; // Copy the start cell value to all highlighted cells
                cell.parentElement.style.backgroundColor = ''; // Reset background color
            });
            cellsToHighlight = [];
            isDragging = false;
            startCell = null;
        }
    });
}

// Hook up add rows buttons
document.getElementById('addRows').addEventListener('click', () => addRowsToTable(100));
document.getElementById('addCustomRows').addEventListener('click', () => {
    const numberOfRows = parseInt(document.getElementById('customRows').value, 10);
    if (!isNaN(numberOfRows) && numberOfRows > 0) {
        addRowsToTable(numberOfRows);
    }
});
