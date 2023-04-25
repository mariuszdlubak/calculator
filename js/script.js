const history = document.getElementById("history");
const previewArea = document.getElementById("preview");

const operators = ['/', '*', '-', '+'];
const errors = ['undefined', 'Infinity', '-Infinity'];

let data = "";
let operatorCounter = 0;
let lastOperator = false;
let bracketOpen = 0;
let pointInLastNumber = false;
let lastNumber = "";

const button = ( char ) => {
    if(data.length > 0 && data.charAt(data.length - 1) == ')') {
        data += '*' + char;
        operatorCounter++;
        lastOperator = false;
    } else {
        data += char;
        lastOperator = false;
    }
    formatData();
}

const swapOperator = ( char ) => {
    if(data.charAt(data.length - 2) != '(') {
        data = data.slice(0, -1);
        data += char;
    } else {
        if(char == '+' || char == '-') {
            data = data.slice(0, -1);
            data += char;
        }
    }
}

const operator = ( op ) => {
    let lastChar = data.charAt(data.length - 1);
    if(lastChar == ',') {
        return;
    }
    if(lastOperator) {
        swapOperator(op);
        lastOperator = true;
    } else if(lastChar == '(') {
        if(op == '+' || op == '-') {
            data += op;
            lastOperator = true;
            operatorCounter++;
        } else {
            lastOperator = false;
        }
    } else if(data.length > 0) {
        data += op;
        lastOperator = true;
        operatorCounter++;
    }
    formatData();
}

const bracket = () => {
    let lastChar = data.charAt(data.length - 1);
    if(lastChar == ',') return;
    let openBracket = ['(', '/', '*', '-', '+'];
    if(openBracket.includes(lastChar)) {
        data += '(';
        bracketOpen++;
        lastOperator = false;
    } else if(bracketOpen == 0 && data.length > 0) {
        data += '*(';
        bracketOpen++;
        operatorCounter++;
    } else if(bracketOpen > 0) {
        data += ')';
        bracketOpen--;
    }
    formatData();
}

const point = () => {
    if(data.length > 0 && !pointInLastNumber && !lastOperator && data.charAt(data.length - 1) != '(' && data.charAt(data.length - 1) != ')') {
        data += ',';
        pointInLastNumber = true;
    }
    formatData();
}

const percent = () => {
    let percentData = lastNumber;
    percentData = percentData.split('(').join('');
    percentData = percentData.split('-').join('');
    percentData = percentData.split(',').join('.');
    if(percentData.length > 0) {
        let charsToDelete = 0 - percentData.length;
        data = data.slice(0, charsToDelete);
        data += percentData / 100;
        data = data.split('.').join(',');
        formatData();
    }
}

const changeOperator = () => {
    if(lastNumber.length > 0) {
        if(lastNumber.length > 1 && lastNumber.charAt(0) == '(' && lastNumber.charAt(1) != '-') {
            lastNumber = lastNumber.slice(1);
        }
        let charsToDelete = 0 - lastNumber.length;
        if(lastNumber.slice(0, 2) == '(-') {
            data = data.slice(0, charsToDelete);
            data += lastNumber.slice(2);
            bracketOpen--;
            operatorCounter--;
        } else {
            data = data.slice(0, charsToDelete);
            data += '(-' + lastNumber;
            bracketOpen++;
            operatorCounter++;
        }
    } else {
        data += '(-';
        bracketOpen++;
        operatorCounter++;
        lastOperator = true;
    }
    formatData();
}

const deleteAll = () => {
    data = "";
    operatorCounter = 0;
    lastOperator = false;
    bracketOpen = 0;
    pointInLastNumber = false;
    lastNumber = "";
    history.innerHTML = "";
    previewArea.innerText = "";
}

const deleteLast = () => {
    if(operators.includes(data.charAt(data.length - 1))) {
        operatorCounter--;
        lastOperator = false;
    }
    if(data.charAt(data.length - 1) == ')') {
        bracketOpen++;
    }
    if(data.charAt(data.length - 1) == '(') {
        bracketOpen--;
    }
    data = data.slice(0, -1);
    if(operators.includes(data.charAt(data.length - 1))) {
        lastOperator = true;
    }
    formatData();
}

const formatData = () => {
    let dataFormat = "";
    let pointExists = false;
    lastNumber = "";
    for(i = 0; i < data.length; i++) {
        if(operators.includes(data.charAt(i))) {
            dataFormat += '<span class="mark">' + data.charAt(i) + '</span>';
            pointExists = false;
            if(data.charAt(i) == '-' && data.charAt(i - 1) == '(') {
                lastNumber += data.charAt(i);
            } else {
                lastNumber = "";
            }
        } else if(data.charAt(i) == ',') {
            pointExists = true;
            dataFormat += data.charAt(i);
            lastNumber += data.charAt(i);
        } else {
            dataFormat += data.charAt(i);
            lastNumber += data.charAt(i);
        }
    }
    pointInLastNumber = pointExists;
    history.innerHTML = dataFormat;
    history.scrollTop = history.scrollHeight;
    preview();
}

const calc = () => {
    let dataToCalculate = data;
    let bracket = bracketOpen;
    while(operators.includes(dataToCalculate.charAt(dataToCalculate.length - 1))) {
        dataToCalculate = dataToCalculate.slice(0, -1);
    }
    dataToCalculate = dataToCalculate.split(',').join('.');
    if(dataToCalculate.charAt(dataToCalculate.length - 1) == '(') {
        dataToCalculate += '1';
    }
    while(bracket > 0) {
        dataToCalculate += ')';
        bracket--;
    }
    let compute = new Function("return " + dataToCalculate);
    return compute();
}

const preview = () => {
    if(operatorCounter > 0 && !lastOperator) {
        let result = "" + calc();
        result = result.split('.').join(',');
        if(errors.includes(result)) {
            previewArea.innerText = "";
        } else {
            previewArea.innerText = result;
        }
    } else {
        previewArea.innerText = "";
    }
    if(data == '(-') {
        previewArea.innerText = "";
    }
}

const calculate = () => {
    if(operatorCounter > 0 && !lastOperator && data != '(-') {
        let resultData = calc();
        let result = "" + resultData;
        result = result.split('.').join(',');
        if(!errors.includes(result)) {
            history.innerHTML = '<span class="out">' + result + '</span>';
            data = "" + result;
            operatorCounter = 0;
            lastOperator = false;
            pointInLastNumber = result.includes(',');
            bracketOpen = 0;
            lastNumber = result;
            if(resultData < 0) {
                operatorCounter++;
                lastNumber = '(' + result;
                data = '(' + result;
                bracketOpen++;
            }
        }
    }
    previewArea.innerHTML = "";
}

const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const clickKey = ( id ) => {
    document.getElementById(id).classList.add('active');
    setTimeout(() => {
        document.getElementById(id).classList.remove('active');
        document.getElementById(id).click();
    }, 100);
}

window.addEventListener("keyup", (e) => {
        if(numbers.includes(e.key)) {
            clickKey(e.key);
        } else if (e.key == '/') {
            clickKey('division');
        } else if (e.key == '*') {
            clickKey('multiplication');
        } else if (e.key == '-') {
            clickKey('minus');
        } else if (e.key == '+') {
            clickKey('plus');
        } else if(e.key == 'Enter' || e.key == '=') {
            clickKey('calculate');
        } else if(e.key == 'Delete') {
            clickKey('delete');
        } else if(e.key == 'Backspace') {
            clickKey('backspace');
        } else if(e.key == '(' || e.key == ')') {
            clickKey('bracket');
        } else if(e.key == '.' || e.key == ',') {
            clickKey('point');
        } else if (e.key == '%') {
            clickKey('percent');
        }  
    }
);
