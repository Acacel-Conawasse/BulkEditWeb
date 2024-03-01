document.addEventListener('DOMContentLoaded', () => {
    initializeTableFeatures();
});

function initializeTableFeatures() {
    adjustColumnWidths('bulkEditForm');
    addRowsToTable(30); // Initial rows for demonstration
    setupEventListeners();
    enableDragAndCopy();
}

function setupEventListeners() {
    document.getElementById('downloadCsv').addEventListener('click', downloadCsv);
    document.querySelector('.add-rows').addEventListener('click', () => addRowsToTable(100));
    document.querySelector('.add-custom').addEventListener('click', addCustomRows);
    document.getElementById('customErrorModalDismiss').addEventListener('click', clearAndCloseErrorModal);
}

function downloadCsv() {
    const table = document.getElementById('bulkEditForm');
    let isDataValid = true; // Flag to track overall data validation status.

    // Iterate over each row in the table body to check if required fields are filled.
    Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
        const inputs = row.querySelectorAll('input'); // Get all input elements in the row.
        const filledCellsCount = Array.from(inputs).filter(input => input.value.trim()).length; // Count non-empty cells.

        // Proceed with validation only if more than two cells are filled in the row.
        if (filledCellsCount > 2) {
            // Define the indices of required columns.
            const requiredColumns = [0, 1, 2, 5, 6, 7]; 

            requiredColumns.forEach(colIndex => {
                const input = inputs[colIndex]; // Access the input by its column index.
                if (input && !input.value.trim()) { // Check if the input exists and is empty.
                    input.classList.add('invalid'); // Highlight the input field.
                    isDataValid = false; // Indicate that the validation failed.
                } else if (input) {
                    input.classList.remove('invalid'); // Remove highlighting if input is valid.
                }
            });
        }
    });

    // Only proceed with CSV download if all required data is valid.
    if (isDataValid) {
        // Continue with CSV generation and download.
        generateAndDownloadCSV(table);
    } else {
        // Show an error message if data is invalid.
        showErrorModal('Missing data in required fields for rows with more than 2 filled columns. Please review.');
    }
}

function generateAndDownloadCSV(table) {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Extract headers.
    let headers = Array.from(table.querySelectorAll('thead th')).map(header => `"${header.innerText}"`).join(",");
    csvContent += headers + "\r\n";

    // Extract data from tbody only.
    Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
        let rowData = Array.from(row.querySelectorAll('td')).map(cell => {
            let input = cell.querySelector('input');
            return input ? `"${input.value}"` : '""';
        }).join(",");
        csvContent += rowData + "\r\n";
    });

    const fileName = prompt("Enter a name for your CSV file:", "BulkEdit") + " " + new Date().toISOString().slice(0, 10) + ".csv";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showErrorModal(message) {
    // Implement your modal display logic here. For demonstration, using alert.
    alert(message);
}



function adjustColumnWidths(tableId) {
    const table = document.getElementById(tableId);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "16px Arial";

    Array.from(table.rows).forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
            const textWidth = context.measureText(cell.innerText || cell.textContent).width;
            cell.style.width = Math.max(parseInt(cell.style.width, 10) || 0, textWidth) + "px";
        });
    });
}

function addRowsToTable(numberOfRows) {
    const tableBody = document.getElementById('bulkEditForm').querySelector('tbody');
    for (let i = 0; i < numberOfRows; i++) {
        const newRow = tableBody.insertRow();
        for (let j = 0; j < 11; j++) {
            const cell = newRow.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            attachInputValidation(input, cell, j);
            cell.appendChild(input);
        }
    }
}
function attachInputValidation(input, cell, columnIndex) {
    input.addEventListener('change', () => {
        const validationResult = validateInput(input.value, columnIndex);
        if (!validationResult.isValid) {
            cell.style.backgroundColor = 'red';
            showErrorModal(validationResult.message, () => {
                input.value = '';
                cell.style.backgroundColor = ''; // Clear background color
            });
        } else {
            cell.style.backgroundColor = ''; // Reset background color on valid input
        }
    });
}

function validateInput(value, columnIndex) {
    switch (columnIndex) {
        case 0: 
            return { isValid: /^\d{8}$/.test(value), message: 'Employee Number must be 8 digits' };
        case 1: 
            return { isValid: /^[A-Za-z]+(?:-[A-Za-z]+)?\s[A-Za-z]+/.test(value), message: 'Invalid format. Name should be "Lastname Firstname" or "Lastname-Firstname Firstname", with no comma.' };
        case 2: 
            return { isValid: /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(value), message: 'Invalid date format. Date format should be mm/dd/yyyy.' };
        case 3: 
            return { isValid: /^-?\d{8,10}$/.test(value), message: 'Invalid CC/OU. Please enter 8-10 digits. No special characters allowed.' };
        case 4: 
            return { isValid: /^[A-Z0-9\-]+$/.test(value), message: 'Invalid Paycode. Should be in uppercase, digits and hyphen allowed.' };
        case 5: 
            return { isValid: /^-?\d+(\.\d+)?$/.test(value), message: 'Invalid amount. Please enter a valid number.' };
        case 6: 
            return { isValid: /^-?\d{8,10}$/.test(value), message: 'Invalid CC/OU. Please enter 8-10 digits. No special characters allowed.' };
        case 7: 
            return { isValid: /^[A-Z0-9\-]+$/.test(value), message: 'Invalid Paycode. Should be in uppercase, digits and hyphen allowed.' };
        case 8: 
            return { isValid: /^-?\d+(\.\d+)?$/.test(value), message: 'Invalid amount. Please enter a valid number.' };
    }
}


function addCustomRows() {
    const numberOfRows = parseInt(document.getElementById('customRows').value, 10);
    if (!isNaN(numberOfRows) && numberOfRows > 0) {
        addRowsToTable(numberOfRows);
    } else {
        showErrorModal('Please enter a valid number of rows');
    }
}

function showErrorModal(message, clearFunction) {
    document.getElementById('customErrorModalMessage').textContent = message;
    document.querySelector('.frame').style.display = 'block'; // Show the error modal
    currentInvalidInputClearFunction = clearFunction; // Assign the clear function to be called on modal close
}

function clearAndCloseErrorModal() {
    if (typeof currentInvalidInputClearFunction === 'function') {
        currentInvalidInputClearFunction(); // Clear the input value and reset cell color
    }
    document.querySelector('.frame').style.display = 'none'; // Hide the error modal
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
//Drag and Copy
function enableDragAndCopy() {
    const table = document.getElementById('bulkEditForm');
    let isDragging = false;
    let startCell = null;
    let cellsToHighlight = [];

    table.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.value.trim() !== '') {
            isDragging = true;
            startCell = e.target;
            cellsToHighlight.push(e.target);
            e.target.parentElement.style.backgroundColor = 'yellow'; // Highlight the starting cell
        }
    });

    table.addEventListener('mousemove', (e) => {
        if (isDragging && e.target.tagName === 'INPUT' && !cellsToHighlight.includes(e.target)) {
            // Get the column index of the starting cell
            const startCellIndex = Array.from(startCell.parentElement.children).indexOf(startCell);
            // Get the column index of the current cell
            const currentCellIndex = Array.from(e.target.parentElement.children).indexOf(e.target);
    
            // Highlight the current cell only if it's in the same column as the starting cell
            if (startCellIndex === currentCellIndex) {
                e.target.parentElement.style.backgroundColor = 'yellow';
                cellsToHighlight.push(e.target);
            }
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

//////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Rows
//Add Rows
document.querySelector('.add-rows').addEventListener('click', () => addRowsToTable(100));
document.querySelector('.add-custom').addEventListener('click', () => {
    const numberOfRows = parseInt(document.getElementById('customRows').value, 10);
    if (!isNaN(numberOfRows) && numberOfRows > 0) {
        addRowsToTable(numberOfRows);
    }
});
document.querySelector('.add-rows1').addEventListener('click', () => addRowsToTable(100));
document.querySelector('.add-custom1').addEventListener('click', () => {
    const numberOfRows = parseInt(document.getElementById('customRows1').value, 10);
    if (!isNaN(numberOfRows) && numberOfRows > 0) {
        addRowsToTable(numberOfRows);
    }
});
