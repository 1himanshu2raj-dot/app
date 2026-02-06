const output = document.getElementById("calc-output");
const history = document.getElementById("calc-history");
const statusLabel = document.getElementById("calc-status");
const keys = document.querySelector(".calculator__keys");

const state = {
  currentValue: "0",
  previousValue: null,
  operator: null,
  waitingForNewValue: false,
};

const operators = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

const formatNumber = (value) => {
  if (!Number.isFinite(Number(value))) {
    return "Error";
  }

  const [integer, decimal] = value.split(".");
  const formattedInteger = Number(integer).toLocaleString("en-US");
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
};

const updateDisplay = () => {
  output.textContent = formatNumber(state.currentValue);
  if (state.operator && state.previousValue !== null) {
    history.textContent = `${formatNumber(state.previousValue)} ${operators[state.operator]}`;
  } else {
    history.textContent = state.previousValue ? formatNumber(state.previousValue) : "0";
  }
};

const setStatus = (message) => {
  statusLabel.textContent = message;
};

const handleDigit = (digit) => {
  if (state.waitingForNewValue) {
    state.currentValue = digit;
    state.waitingForNewValue = false;
  } else {
    state.currentValue = state.currentValue === "0" ? digit : state.currentValue + digit;
  }
  setStatus("Typing");
};

const handleDecimal = () => {
  if (state.waitingForNewValue) {
    state.currentValue = "0.";
    state.waitingForNewValue = false;
    setStatus("Typing");
    return;
  }

  if (!state.currentValue.includes(".")) {
    state.currentValue += ".";
    setStatus("Typing");
  }
};

const handleClear = () => {
  state.currentValue = "0";
  state.previousValue = null;
  state.operator = null;
  state.waitingForNewValue = false;
  setStatus("Cleared");
};

const handleSign = () => {
  if (state.currentValue === "0") return;
  state.currentValue = String(Number(state.currentValue) * -1);
  setStatus("Sign flipped");
};

const handlePercent = () => {
  const value = Number(state.currentValue);
  if (!Number.isFinite(value)) return;
  state.currentValue = String(value / 100);
  setStatus("Percent");
};

const compute = (first, second, operator) => {
  const a = Number(first);
  const b = Number(second);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "Error";

  switch (operator) {
    case "add":
      return String(a + b);
    case "subtract":
      return String(a - b);
    case "multiply":
      return String(a * b);
    case "divide":
      return b === 0 ? "Error" : String(a / b);
    default:
      return second;
  }
};

const handleOperator = (operator) => {
  if (state.operator && state.waitingForNewValue) {
    state.operator = operator;
    setStatus("Operator updated");
    return;
  }

  if (state.previousValue === null) {
    state.previousValue = state.currentValue;
  } else if (state.operator) {
    state.previousValue = compute(state.previousValue, state.currentValue, state.operator);
    state.currentValue = state.previousValue;
  }

  state.operator = operator;
  state.waitingForNewValue = true;
  setStatus("Operator selected");
};

const handleEquals = () => {
  if (!state.operator || state.previousValue === null) {
    setStatus("Ready");
    return;
  }

  state.currentValue = compute(state.previousValue, state.currentValue, state.operator);
  state.previousValue = null;
  state.operator = null;
  state.waitingForNewValue = true;
  setStatus("Result");
};

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const value = button.textContent.trim();

  switch (action) {
    case "digit":
      handleDigit(value);
      break;
    case "decimal":
      handleDecimal();
      break;
    case "clear":
      handleClear();
      break;
    case "sign":
      handleSign();
      break;
    case "percent":
      handlePercent();
      break;
    case "add":
    case "subtract":
    case "multiply":
    case "divide":
      handleOperator(action);
      break;
    case "equals":
      handleEquals();
      break;
    default:
      break;
  }

  updateDisplay();
});

window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") {
    handleDigit(event.key);
  } else if (event.key === ".") {
    handleDecimal();
  } else if (event.key === "Escape") {
    handleClear();
  } else if (event.key === "%") {
    handlePercent();
  } else if (event.key === "Enter" || event.key === "=") {
    handleEquals();
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    const map = {
      "+": "add",
      "-": "subtract",
      "*": "multiply",
      "/": "divide",
    };
    handleOperator(map[event.key]);
  } else {
    return;
  }

  event.preventDefault();
  updateDisplay();
});

updateDisplay();
