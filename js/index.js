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
    onRest: handleSpinComplete, // Keep existing onRest
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

  // Audio Elements
  const rouletteSound = document.getElementById('rouletteSound');
  let isSpinning = false; // Track spinning state for tick sound

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
          
          const removeBtn = clone.querySelector('.remove-btn');
          removeBtn.onclick = () => removeOption(index);
          
          const weightContainer = clone.querySelector('.weight-container');
          if (weightContainer) {
            weightContainer.remove(); // Remove the weight container placeholder if it exists
          }
          
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
    spinCenterBtn.disabled = true;
    resultDisplay.textContent = '';
    resultDisplay.classList.remove('show');

    // Stop any previously playing sounds
    // stopSound(rouletteSound);

    // Play spin start sound - set loop to true
    // playSound(rouletteSound, true);
    isSpinning = true; // Set spinning flag

    // Fetch options directly from localStorage for weighted calculation
    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Filter out placeholder if present
    options = options.filter(opt => opt.label !== 'Add your options!');

    if (options.length < 2) {
      alert('Please add at least two options to spin the wheel.');
      spinBtn.disabled = false;
      spinCenterBtn.disabled = false;
      isSpinning = false;
      // stopSound(rouletteSound);
      return;
    }

    // --- Improved Weight and Probability Logic ---
    const totalWeight = options.reduce((sum, item) => {
      // Use 0 as default, allow 0 weight, prevent negative
      const weight = parseInt(item.weight || '0', 10);
      return sum + (isNaN(weight) || weight < 0 ? 0 : weight);
    }, 0);

    let winnerLabel;

    // Handle case where all weights are 0
    if (totalWeight === 0) {
      console.warn("[spinWheel] Total weight is zero. Picking winner with equal probability.");
      if (options.length === 0) {
         console.error("[spinWheel] No options available to pick from.");
         spinBtn.disabled = false;
         spinCenterBtn.disabled = false;
         isSpinning = false;
         // stopSound(rouletteSound);
         return;
      }
      // Pick a random index directly
      const randomIndex = Math.floor(Math.random() * options.length);
      winnerLabel = options[randomIndex].label;
      console.log(`[spinWheel] Winning label (equal probability fallback): ${winnerLabel}`);

    } else {
      // Normalize weights and build cumulative distribution
      const distribution = [];
      let cumulative = 0;
      options.forEach((item) => {
        const weight = parseInt(item.weight || '0', 10);
        const effectiveWeight = isNaN(weight) || weight < 0 ? 0 : weight;
        const normalized = effectiveWeight / totalWeight; // Will be 0 if effectiveWeight is 0
        cumulative += normalized;
        distribution.push({ label: item.label, threshold: cumulative });
      });

      // Ensure the last item's threshold is exactly 1 to handle potential floating point inaccuracies
      if (distribution.length > 0) {
          distribution[distribution.length - 1].threshold = 1.0;
      }

      // Draw random number
      const rand = Math.random();
      console.log(`[spinWheel] Random draw: ${rand.toFixed(4)}`);

      // Find winner based on random threshold
      const winnerEntry = distribution.find(entry => rand <= entry.threshold);

      if (!winnerEntry) {
        // This should be very unlikely with the threshold adjustment, but handle robustly
        console.error("[spinWheel] Failed to determine winner via threshold. This indicates an issue. Using fallback.");
        // Fallback: Pick first item with non-zero weight, or just first item
        const fallbackWinner = options.find(opt => (parseInt(opt.weight || '0', 10)) > 0) || options[0];
        if (!fallbackWinner) {
           console.error("[spinWheel] Fallback failed: No options available.");
           spinBtn.disabled = false;
           spinCenterBtn.disabled = false;
           isSpinning = false;
           // stopSound(rouletteSound);
           return;
        }
        winnerLabel = fallbackWinner.label;
        console.warn(`[spinWheel] Using fallback winner: ${winnerLabel}`);
      } else {
          winnerLabel = winnerEntry.label;
      }

      console.log(`[spinWheel] Winning label (weighted): ${winnerLabel}`);
    }
    // --- End Improved Weight and Probability Logic ---


    // Find the index of the winner in the *current wheel items* for spinToItem
    const winnerIndex = wheel.items.findIndex(item => item.label === winnerLabel);

    spinVisually(winnerLabel, winnerIndex); // Use helper function for the rest
  }

  // Helper function to handle the visual spinning part
  function spinVisually(winnerLabel, winnerIndex) {
      if (winnerIndex !== -1) {
        wheel.highlightIndex = null; // Reset highlight before spinning

        // Calculate duration based on speed setting
        let duration = 5000; // Default duration
        let revolutions = 5; // Default revolutions
        switch (selectedSpeed) {
          case 'slow':
            duration = 10000;
            revolutions = 3;
            break;
          case 'fast':
            duration = 3000;
            revolutions = 8;
            break;
          case 'medium': // Default case
          default:
            duration = 5000;
            revolutions = 5;
            break;
        }
        console.log(`[spinVisually] Speed: ${selectedSpeed}, Duration: ${duration}, Revolutions: ${revolutions}`);

        // Spin the visual wheel
        wheel.spinToItem(winnerIndex, duration, true, revolutions);

        // Set onRest callback (overwrites the one in props, which is fine)
        wheel.onRest = () => {
          console.log('[onRest] Spin finished. Winner:', winnerLabel);
          isSpinning = false; // Clear spinning flag
          // stopSound(rouletteSound); // Stop roulette sound

          wheel.highlightIndex = winnerIndex; // SET HIGHLIGHT INDEX HERE

          const winnerText = `Winner: ${winnerLabel}`;
          resultDisplay.textContent = winnerText;
          resultDisplay.classList.add('show');
          spinBtn.disabled = false;
          spinCenterBtn.disabled = false;
        };
      } else {
        console.error(`[spinVisually] Winner label '${winnerLabel}' not found in wheel items. This shouldn't happen.`);
        alert('An error occurred determining the winner segment.');
        isSpinning = false; // Clear spinning flag on error too
        // stopSound(rouletteSound); // Stop sound on error too
        spinBtn.disabled = false;
        spinCenterBtn.disabled = false;
      }
  }

  // Revised handleSpinComplete function in index.js - now handled by onRest in spinWheel
  function handleSpinComplete(event) {
      console.log('Wheel rested at index:', event.currentIndex);
      isSpinning = false; // Ensure flag is cleared
      // stopSound(rouletteSound); // Stop sound if manual stop occurs
  }

  // Utility functions for sound control
  function playSound(soundElement, loop = false) {
    if (soundElement) {
      soundElement.loop = loop;
      soundElement.currentTime = 0;
      soundElement.play();
    }
  }

  function stopSound(soundElement) {
    if (soundElement) {
      soundElement.pause();
      soundElement.currentTime = 0;
      soundElement.loop = false;
    }
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