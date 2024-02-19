document.addEventListener('DOMContentLoaded', (event) => {
    adjustColumnWidths('bulkEditForm');
    addRowsToTable(20); // Initial rows added for demonstration
    enableDragAndCopy();
    setupDownloadCsv();
});


function setupDownloadCsv() {
    document.getElementById('downloadCsv').addEventListener('click', function() {
        const table = document.getElementById('bulkEditForm'); // Adjust this ID to match your table's ID
        let csvContent = "data:text/csv;charset=utf-8,";
        // Extract headers
        let headers = Array.from(table.rows[1].cells).map(header => `"${header.innerText}"`).join(",");
        csvContent += headers + "\r\n";

        for (let i = 1; i < table.rows.length; i++) { // Start from 1 to skip header row
            let row = table.rows[i];
            let rowData = [];
            for (let j = 0; j < row.cells.length; j++) {
                let input = row.cells[j].querySelector('input');
                rowData.push(input ? `"${input.value}"` : "");
            }
            csvContent += rowData.join(",") + "\r\n";
        }

        let fileName = prompt("Please enter a name for your CSV file", "");
        if (fileName) {
            fileName += " Bulk Edit " + new Date().toISOString().slice(0,10);
            let encodedUri = encodeURI(csvContent);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", fileName + ".csv");
            document.body.appendChild(link); // Required for FF
            link.click();
            document.body.removeChild(link);
        }
    });
}

function adjustColumnWidths(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');
    let colWidths = new Array(table.rows[0].cells.length).fill(0);
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
        input.oninput = () => handleInputValidation(input, j);
  
        cell.appendChild(input);
      }
    }
  }


// Input validation functions
function validateEmployeeNumber(inputValue) {
    const regex = /^\d{8}$/;
    const isValid = regex.test(inputValue);
    return { isValid, message: isValid ? '' : 'Incorrect number format. PERNER needs to be 8 digits "00123456"' };
  }
  
  // Add more input validation functions here
  
  // oninput event handling
  function handleInputValidation(input, columnIndex) {
    const validationFunctions = [
      validateEmployeeNumber,
      // Add more input validation functions here
    ];
  
    const cellValue = input.value.trim();
    const validationResult = validateCell(cellValue, validationFunctions);
  
    if (!validationResult.isValid) {
      displayErrorMessage(cellValue, validationResult.message, input);
    } else {
      hideErrorMessage(input);
    }
  }
  
  // Existing utility functions
  function validateCell(value, validations) {
    let isValid = true;
    let message = '';
  
    for (const validation of validations) {
      const validationResult = validation(value);
      if (!validationResult.isValid) {
        isValid = false;
        message = validationResult.message;
        break;
      }
    }
  
    return { isValid, message };
  }
  
  function displayErrorMessage(cellValue, message, input) {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = `Error: ${message} - ${cellValue}`;
    input.parentElement.insertBefore(errorMessage, input.nextSibling);
  }
  
  function hideErrorMessage(input) {
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }


  function isValidEmployeeNumber(value) {
    return /^\d{8}$/.test(value);
}

function isValidEmployeeName(value) {
    return /^[a-zA-Z\s]+$/.test(value);
}

function isValidHistoricalDate(value) {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return regex.test(value);
}

function isValidCostCenterOrIO(value) {
    const regex = /^-?\d{8,10}$/;
    return regex.test(value);
}

function isValidPayCode(value) {
    const regex = /^[A-Z0-9\-]+$/;
    return regex.test(value);
}

// You can add event listeners to the input fields and call the corresponding validation function

function attachInputValidation(input, columnIndex) {
    switch (columnIndex) {
        case 0: // Employee Number
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (isValidEmployeeNumber(value)) {
                    input.setCustomValidity('');
                    input.style.backgroundColor = '';
                } else {
                    input.setCustomValidity('Incorrect number format. PERNER needs to be 8 digits "00123456"');
                    input.style.backgroundColor = 'red';
                }
            });
            break;
        case 1: // Employee Name
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (isValidEmployeeName(value)) {
                    input.setCustomValidity('');
                    input.style.backgroundColor = '';
                } else {
                    input.setCustomValidity('Only letters and whitespaces are allowed');
                    input.style.backgroundColor = 'red';
                }
            });
            break;
        case 2: // Historical Date
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (isValidHistoricalDate(value)) {
                    input.setCustomValidity('');
                    input.style.backgroundColor = '';
                } else {
                    input.setCustomValidity('Incorrect date format "mm/dd/yyyy"');
                    input.style.backgroundColor = 'red';
                }
            });
            break;
        case 3: // Cost Center/IO
        case 6: // New Cost Center/IO
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (isValidCostCenterOrIO(value)) {
                    input.setCustomValidity('');
                    input.style.backgroundColor = '';
                } else {
                    input.setCustomValidity('Incorrect CostCenter/IO format. Needs to be 8 to 10 digits');
                    input.style.backgroundColor = 'red';
                }
            });
            break;
        case 4: // Pay Code
        case 7: // New Pay Code
            input.addEventListener('input', () => {
                const value = input.value.trim();
                if (isValidPayCode(value)) {
                    input.setCustomValidity('');
                    input.style.backgroundColor = '';
                } else {
                    input.setCustomValidity('Incorrect paycode format');
                    input.style.backgroundColor = 'red';
                }
            });
            break;
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