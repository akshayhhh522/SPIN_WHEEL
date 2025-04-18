import {Wheel} from '../dist/spin-wheel-esm.js';

window.onload = () => {
  let wheel;
  let spinTimeout = null;
  let selectedSpeed = 'medium';
  let stopGlowTimeoutId = null; // Store timeout ID globally to clear it when needed

  const STORAGE_KEY = 'wheelOptions';
  const SPEED_KEY = 'spinSpeed';

  const speedMap = {
    slow: 400,
    medium: 700,
    fast: 1000
  };

  // Function to determine label color based on background
  function getContrastColor(backgroundColor) {
    // Simple check for light vs dark purple/white/gray
    return backgroundColor === '#FFFFFF' || 
           backgroundColor.startsWith('#A') || 
           backgroundColor.startsWith('#C') ||
           backgroundColor.startsWith('#9') // Added base purple check
           ? '#0B0B0B' // Dark text for light backgrounds
           : '#FFFFFF'; // White text for dark backgrounds
  }

  // Load saved speed from localStorage
  function loadSpeed() {
    selectedSpeed = localStorage.getItem(SPEED_KEY) || 'medium';
    updateSpeedControls();
  }

  // Initial wheel setup with new purple color scheme
  const props = {
    items: [
      { label: 'Add your options!' }
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
    itemLabelRadius: 0.88, // Increased from default (likely 0.85) to move labels outwards
    borderColor: '#997BFF',
    borderWidth: 2,
    lineColor: '#8A6AE0',
    lineWidth: 1,
    onRest: handleSpinComplete,
    pointerAngle: 0,
    rotationResistance: -50,
    rotationSpeedMax: 1000
  };

  // Initialize the wheel
  const container = document.querySelector('.wheel-wrapper');
  wheel = new Wheel(container, props);
  window.wheel = wheel;

  // Load saved options from localStorage and update wheel
  function loadFromLocalStorage() {
    let options = [];
    try {
      const savedOptions = localStorage.getItem(STORAGE_KEY);
      options = savedOptions ? JSON.parse(savedOptions) : [];
      if (!Array.isArray(options)) options = []; // Ensure it's an array
    } catch (e) {
      console.error('Error loading options from localStorage:', e);
      options = [];
    }

    if (options.length === 0) {
      // Initialize with default if localStorage is empty or invalid
      options = [{ label: 'Add your options!', weight: 1 }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    }

    // Update wheel items based on loaded options
    wheel.items = options.map((opt, index) => ({
      label: opt.label,
      weight: opt.weight || 1, // Ensure weight is at least 1
      backgroundColor: props.itemBackgroundColors[index % props.itemBackgroundColors.length],
      labelColor: getContrastColor(props.itemBackgroundColors[index % props.itemBackgroundColors.length])
    }));

    updateOptionsDisplay(); // Update the list display as well
  }

  // Save current options (with weights) to localStorage
  function saveToLocalStorage(optionsToSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(optionsToSave));
    } catch (e) {
      console.error('Error saving options to localStorage:', e);
    }
  }

  // Insert speed controls into the DOM
  const spinControls = document.querySelector('.spin-controls');
  const speedControls = document.createElement('div');
  speedControls.className = 'speed-controls';
  speedControls.innerHTML = `
    <span>Speed:</span>
    <button class="speed-btn" data-speed="slow">Slow</button>
    <button class="speed-btn active-speed" data-speed="medium">Medium</button>
    <button class="speed-btn" data-speed="fast">Fast</button>
  `;
  spinControls.insertBefore(speedControls, spinControls.firstChild);

  // Speed button event listeners
  speedControls.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSpeed = btn.getAttribute('data-speed');
      localStorage.setItem(SPEED_KEY, selectedSpeed); // Save selected speed to localStorage
      speedControls.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active-speed'));
      btn.classList.add('active-speed');
      console.log('[Speed Control] selectedSpeed changed to:', selectedSpeed);
    });
  });

  function updateSpeedControls() {
    speedControls.querySelectorAll('.speed-btn').forEach(btn => {
      btn.classList.remove('active-speed');
      if (btn.getAttribute('data-speed') === selectedSpeed) {
        btn.classList.add('active-speed');
      }
    });
  }

  // Log initial selectedSpeed
  console.log('[Init] selectedSpeed:', selectedSpeed);

  // Get DOM elements
  const optionInput = document.getElementById('optionInput');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const optionsList = document.getElementById('optionsList');
  const resultDisplay = document.getElementById('resultDisplay');
  const spinBtn = document.getElementById('spinBtn');
  const spinCenterBtn = document.getElementById('spinCenterBtn'); // Get the new center button

  // Update the options list display based on localStorage
  function updateOptionsDisplay() {
    optionsList.innerHTML = '';
    const template = document.getElementById('optionItemTemplate');
    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (options.length === 1 && options[0].label === 'Add your options!') {
        // Don't display the placeholder in the list
    } else {
        options.forEach((item, index) => {
          const clone = template.content.cloneNode(true);
          const labelSpan = clone.querySelector('.option-label');
          labelSpan.textContent = item.label;
          
          // Remove the weight display logic
          /*
          const weightDisplay = document.createElement('span');
          weightDisplay.className = 'weight-display';
          // Display the weight fetched from localStorage
          weightDisplay.textContent = `Weight: ${item.weight || 1}`;
          */
          
          const removeBtn = clone.querySelector('.remove-btn');
          removeBtn.onclick = () => removeOption(index);
          
          // Remove the placeholder replacement logic if it exists
          const weightContainer = clone.querySelector('.weight-container');
          if (weightContainer) {
            // weightContainer.replaceWith(weightDisplay); // Don't replace with weight
            weightContainer.remove(); // Remove the weight container placeholder if it exists
          }
          /* else {
            // If no weight-container placeholder, attempt to remove the weight display if it was added differently
            const existingWeightDisplay = clone.querySelector('.weight-display');
            if (existingWeightDisplay) {
                existingWeightDisplay.remove();
            }
          } */
          
          optionsList.appendChild(clone);
        });
    }
    spinBtn.disabled = options.length < 2 || (options.length === 1 && options[0].label === 'Add your options!');
  }

  // Add a new option to localStorage
  function addOption() {
    const newOptionLabel = optionInput.value.trim();
    if (newOptionLabel) {
      let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      // Remove placeholder if it exists
      if (options.length === 1 && options[0].label === 'Add your options!') {
        options = [];
      }

      // Add the new option with default weight 1
      options.push({ 
        label: newOptionLabel,
        weight: 1 
      });
      
      saveToLocalStorage(options);
      loadFromLocalStorage(); // Reload wheel and update display from storage
      optionInput.value = '';
    }
  }

  // Remove an option from localStorage
  function removeOption(index) {
    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    if (options.length > 1) {
      options.splice(index, 1);
      saveToLocalStorage(options);
      loadFromLocalStorage(); // Reload wheel and update display from storage
    } else if (options.length === 1 && options[0].label !== 'Add your options!') {
        // If removing the last real option, replace with placeholder
        options = [{ label: 'Add your options!', weight: 1 }];
        saveToLocalStorage(options);
        loadFromLocalStorage();
    } else {
      alert('Cannot remove the placeholder option.');
    }
  }

  // Spin the wheel based on weights from localStorage
  function spinWheel() {
    console.log('[SpinWheel] Called. Current selectedSpeed:', selectedSpeed);
    spinBtn.disabled = true;
    spinCenterBtn.disabled = true; // Disable center button too
    resultDisplay.textContent = ''; // Clear previous result
    resultDisplay.classList.remove('show'); // Hide result display
    if (typeof wheel.stopGlow === 'function') wheel.stopGlow(); // Stop previous glow

    // Fetch options directly from localStorage for weighted calculation
    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Filter out placeholder if present
    options = options.filter(opt => opt.label !== 'Add your options!');

    if (options.length < 2) {
        alert('Please add at least two options to spin!');
        spinBtn.disabled = false;
        spinCenterBtn.disabled = false; // Re-enable center button on error
        return;
    }

    const weightedArray = [];
    options.forEach((item) => {
      const weight = parseInt(item.weight || '1', 10);
      const effectiveWeight = isNaN(weight) || weight < 1 ? 1 : weight;
      for (let i = 0; i < effectiveWeight; i++) {
        weightedArray.push(item.label);
      }
      console.log(`[spinWheel] Option '${item.label}' effective weight:`, effectiveWeight);
    });

    if (weightedArray.length === 0) {
      resultDisplay.textContent = 'No valid options with weights to spin!';
      spinBtn.disabled = false;
      spinCenterBtn.disabled = false; // Re-enable center button on error
      return;
    }

    // Shuffle and pick winner
    for (let i = weightedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedArray[i], weightedArray[j]] = [weightedArray[j], weightedArray[i]];
    }
    const winnerLabel = weightedArray[Math.floor(Math.random() * weightedArray.length)];
    
    // Find the index of the winner in the *current wheel items* for spinToItem
    const winnerIndex = wheel.items.findIndex(item => item.label === winnerLabel);

    if (winnerIndex !== -1) {
      wheel.highlightIndex = null; // Reset highlight
      
      let duration = 10000;
      let revolutions = 3;
      if (selectedSpeed === 'slow') {
        duration = 12000;
        revolutions = 3;
      } else if (selectedSpeed === 'medium') {
        duration = 10000;
        revolutions = 6;
      } else if (selectedSpeed === 'fast') {
        duration = 7000;
        revolutions = 9;
      }
      console.log('[Spin] selectedSpeed:', selectedSpeed, '| duration:', duration, '| revolutions:', revolutions, '| winnerIndex:', winnerIndex);
      
      // Spin the visual wheel to the determined winner index
      wheel.spinToItem(winnerIndex, duration, true, revolutions);
      
      // Set onRest callback for when the spin animation finishes
      wheel.onRest = () => {
        console.log('Spin finished. Winner:', winnerLabel);
        wheel.highlightIndex = winnerIndex; // Highlight the winner segment
        resultDisplay.textContent = `Winner: ${winnerLabel}`;
        resultDisplay.classList.add('show'); // Show and animate result display
        spinBtn.disabled = false; // Re-enable spin button
        spinCenterBtn.disabled = false; // Re-enable center button
      };
    } else {
      console.error('Winner label not found in current wheel items:', winnerLabel);
      resultDisplay.textContent = 'Error determining winner!';
      spinBtn.disabled = false;
      spinCenterBtn.disabled = false; // Re-enable center button on error
    }
  }

  // Revised handleSpinComplete function in index.js - now handled by onRest in spinWheel
  function handleSpinComplete(event) {
      // This can be kept minimal or removed if all logic is in spinWheel's onRest
      console.log('Wheel rested at index:', event.currentIndex);
  }

  // Event Listeners
  addOptionBtn.addEventListener('click', addOption);
  spinBtn.addEventListener('click', spinWheel);
  spinCenterBtn.addEventListener('click', spinWheel); // Add listener for center button
  optionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addOption();
    }
  });

  // Initialize
  loadSpeed();
  loadFromLocalStorage(); // Load options from storage on initial load
};