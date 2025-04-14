import {Wheel} from '../dist/spin-wheel-esm.js';

window.onload = () => {
  let wheel;
  let spinTimeout = null;
  let selectedSpeed = 'medium';
  let stopGlowTimeoutId = null; // Store timeout ID globally to clear it when needed
  
  const speedMap = {
    slow: 400,
    medium: 700,
    fast: 1000
  };

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
      speedControls.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active-speed'));
      btn.classList.add('active-speed');
    });
  });

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
      const backgroundColor = props.itemBackgroundColors[index % props.itemBackgroundColors.length];
      const labelColor = backgroundColor === '#FFFFFF' || backgroundColor.startsWith('#9') || backgroundColor.startsWith('#A') || backgroundColor.startsWith('#C') 
        ? '#0B0B0B' 
        : '#FFFFFF';
      
      newItems.push({ 
        label: newOption,
        backgroundColor,
        labelColor
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
    resultDisplay.classList.remove('show');
    
    // Clear any previous highlight and glow before spinning
    wheel.highlightIndex = null;
    wheel.stopGlow();
    wheel.refresh();
    
    // Use selected speed
    const speed = speedMap[selectedSpeed];
    
    // Add a specific onRest event handler to ensure we highlight when auto-stopped
    const originalOnRest = wheel.onRest;
    wheel.onRest = (event) => {
      // Reset to original handler after first trigger
      wheel.onRest = originalOnRest;
      
      // Cancel stop timeout since the wheel has naturally come to rest
      if (spinTimeout) {
        clearTimeout(spinTimeout);
        spinTimeout = null;
      }
      
      // Call the original handler to process the event
      if (originalOnRest) {
        originalOnRest(event);
      }
    };
    
    wheel.spin(speed);

    // Set a timer to stop the wheel after 10 seconds
    if (spinTimeout) clearTimeout(spinTimeout);
    spinTimeout = setTimeout(() => {
      wheel.stop();
      spinBtn.disabled = false;
    }, 10000);
  }

  // Revised handleSpinComplete function in index.js
  function handleSpinComplete(event) {
    console.log('handleSpinComplete triggered. Event:', event); // Debug log

    const winnerIndex = event.currentIndex;

    if (winnerIndex === undefined || winnerIndex === null || winnerIndex < 0) {
         console.error('Invalid winnerIndex received in handleSpinComplete:', winnerIndex);
         if (spinBtn) spinBtn.disabled = false;
         return;
    }

    if (!wheel || !wheel.items || winnerIndex >= wheel.items.length) {
         console.error('Wheel object or items array is invalid, or winnerIndex out of bounds.');
         if (spinBtn) spinBtn.disabled = false;
         return;
    }

    const winnerItem = wheel.items[winnerIndex];
    if (!winnerItem) {
        console.error('Could not find winner item for index:', winnerIndex);
        if (spinBtn) spinBtn.disabled = false;
        return;
    }

    const winnerLabel = winnerItem.label || `Item ${winnerIndex + 1}`;
    if (resultDisplay) {
        resultDisplay.textContent = `Winner: ${winnerLabel}`;
        resultDisplay.classList.add('show');
    }

    // --- DETAILED CHECK for startGlow method ---
    wheel.highlightIndex = winnerIndex; // Set the index first
    console.log('Checking wheel object just before calling startGlow:', wheel);

    if (wheel && typeof wheel.startGlow === 'function') {
        // Method exists, call it
        console.log('startGlow method FOUND on wheel object. Calling it...');
        wheel.startGlow();
    } else {
        // Method does NOT exist
        console.error('startGlow method NOT FOUND on wheel object!');
        // Log available keys to see what *is* available
        if (wheel) {
             console.log('Available keys on wheel object:', Object.keys(wheel));
             // Also check the prototype if possible
             if (Object.getPrototypeOf(wheel)) {
                 console.log('Available keys on wheel prototype:', Object.keys(Object.getPrototypeOf(wheel)));
             }
        } else {
            console.error('The wheel variable itself is invalid here.');
        }
    }
    // --- END OF DETAILED CHECK ---

    // Re-enable spin button
    if (spinBtn) spinBtn.disabled = false;

    // Stop glow and remove highlight after 3 seconds
    if (stopGlowTimeoutId) clearTimeout(stopGlowTimeoutId);
    stopGlowTimeoutId = setTimeout(() => {
        console.log('Stopping glow and removing highlight.');
        if (wheel) {
             wheel.highlightIndex = null;
             // Call stopGlow only if it exists (though it should if startGlow does)
             if (typeof wheel.stopGlow === 'function') {
                 wheel.stopGlow();
             } else {
                  console.error('stopGlow method not found during cleanup!');
                  // Might need to manually call refresh if stopGlow is missing
                  // wheel.refresh();
             }
        }
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