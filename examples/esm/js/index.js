import {Wheel} from '../../../dist/spin-wheel-esm.js';

window.onload = () => {
  const wheel = new Wheel(document.querySelector('.wheel-wrapper'), {
    items: [
      {label: 'Add your options!'},
    ],
    itemBackgroundColors: [
      '#997BFF', // Base Purple
      '#A88FFF', // 10% Lighter
      '#C6B7FF', // 25% Lighter
      '#8A6AE0', // 10% Darker
      '#6C48A3', // 25% Darker
      '#FFFFFF', // White for contrast
      '#1A1A1A', // Dark Gray
    ],
    itemLabelColors: ['#0B0B0B', '#FFFFFF'],
    itemLabelFont: 'Segoe UI, sans-serif',
    itemLabelFontSizeMax: 40,
    borderColor: '#997BFF',
    borderWidth: 2,
    lineColor: '#8A6AE0',
    lineWidth: 1,
    onRest: handleSpinComplete,
    pointerAngle: 0,
    rotationResistance: -50,
    rotationSpeedMax: 1000,
  });

  window.wheel = wheel;

  // Get DOM elements
  const optionInput = document.getElementById('optionInput');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const optionsList = document.getElementById('optionsList');
  const resultDisplay = document.getElementById('resultDisplay');
  const spinBtn = document.getElementById('spinBtn');

  // Update the options list display
  function updateOptionsDisplay() {
    optionsList.innerHTML = '';
    wheel.items.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item.label;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.onclick = () => removeOption(index);

      li.appendChild(removeBtn);
      optionsList.appendChild(li);
    });

    spinBtn.disabled = wheel.items.length < 2;
  }

  // Add a new option with alternating segment colors
  function addOption() {
    const newOption = optionInput.value.trim();
    if (newOption) {
      const newItems = [...wheel.items];
      const index = newItems.length;
      const backgroundColor = wheel.props.itemBackgroundColors[index % wheel.props.itemBackgroundColors.length];
      const labelColor = backgroundColor === '#FFFFFF' || backgroundColor.startsWith('#9') || backgroundColor.startsWith('#A') || backgroundColor.startsWith('#C')
        ? '#0B0B0B'
        : '#FFFFFF';

      newItems.push({
        label: newOption,
        backgroundColor,
        labelColor,
      });

      wheel.items = newItems;
      optionInput.value = '';
      updateOptionsDisplay();
    }
  }

  // Remove an option
  function removeOption(index) {
    if (wheel.items.length > 1) {
      const newItems = [...wheel.items];
      newItems.splice(index, 1);
      wheel.items = newItems;
      updateOptionsDisplay();
    } else {
      alert('You must keep at least one option!');
    }
  }

  // Spin the wheel
  function spinWheel() {
    if (wheel.items.length < 2) return;

    spinBtn.disabled = true;

    // Moderate speed for smooth animation
    const speed = Math.random() * 200 + 700;
    wheel.spin(speed);
  }

  // Handle spin completion
  function handleSpinComplete(event) {
    const winner = wheel.items[event.currentIndex].label;
    resultDisplay.textContent = `Winner: ${winner}`;
    resultDisplay.classList.add('show');

    spinBtn.disabled = false;

    setTimeout(() => {
      resultDisplay.classList.remove('show');
    }, 3000);
  }

  // Event Listeners
  addOptionBtn.addEventListener('click', addOption);
  spinBtn.addEventListener('click', spinWheel);
  optionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addOption();
    }
  });

  // Initial display update
  updateOptionsDisplay();
};