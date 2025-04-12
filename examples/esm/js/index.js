import {Wheel} from '../../../dist/spin-wheel-esm.js';

window.onload = () => {
  let wheel = null;

  // Initial wheel setup with new purple color scheme
  const props = {
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
    itemLabelColors: ['#0B0B0B', '#FFFFFF'], // Dark text on light segments, white on dark
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
  };

  // Initialize the wheel
  const container = document.querySelector('.wheel-wrapper');
  wheel = new Wheel(container, props);
  window.wheel = wheel;

  console.log('Initializing the wheel with props:', props);
  console.log('Wheel container:', container);

  // Get DOM elements
  const optionInput = document.getElementById('optionInput');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const optionsList = document.getElementById('optionsList');
  const resultDisplay = document.getElementById('resultDisplay');
  const spinBtn = document.getElementById('spinBtn');

  console.log('DOM elements:', { optionInput, addOptionBtn, optionsList, resultDisplay, spinBtn });

  if (!optionInput) console.error('optionInput not found');
  if (!addOptionBtn) console.error('addOptionBtn not found');
  if (!optionsList) console.error('optionsList not found');
  if (!resultDisplay) console.error('resultDisplay not found');
  if (!spinBtn) console.error('spinBtn not found');

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
      const backgroundColor = props.itemBackgroundColors[index % props.itemBackgroundColors.length];
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
  addOptionBtn.addEventListener('click', () => {
    console.log('Add Option button clicked');
    addOption();
  });

  spinBtn.addEventListener('click', () => {
    console.log('Spin button clicked');
    spinWheel();
  });

  optionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      console.log('Enter key pressed in option input');
      event.preventDefault();
      addOption();
    }
  });

  // Initial display update
  updateOptionsDisplay();
};