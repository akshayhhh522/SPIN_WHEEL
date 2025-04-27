import {Wheel} from '../dist/spin-wheel-esm.js';
import * as easing from '../scripts/easing.js';

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
    return backgroundColor === '#FFFFFF' || 
           backgroundColor.startsWith('#A') || 
           backgroundColor.startsWith('#C') ||
           backgroundColor.startsWith('#9') 
           ? '#0B0B0B' 
           : '#FFFFFF'; 
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
      '#997BFF', 
      '#A88FFF', 
      '#C6B7FF', 
      '#8A6AE0', 
      '#6C48A3', 
      '#FFFFFF', 
      '#1A1A1A', 
    ],
    itemLabelColors: ['#0B0B0B', '#FFFFFF'], 
    itemLabelFont: 'Segoe UI, sans-serif',
    itemLabelFontSizeMax: 40,
    itemLabelRadius: 0.88, 
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
      if (!Array.isArray(options)) options = []; 
    } catch (e) {
      console.error('Error loading options from localStorage:', e);
      options = [];
    }

    if (options.length === 0) {
      options = [{ label: 'Add your options!', weight: 0 }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    }

    wheel.items = options.map((opt, index) => ({
      label: opt.label,
      weight: opt.weight || 0, 
      backgroundColor: props.itemBackgroundColors[index % props.itemBackgroundColors.length],
      labelColor: getContrastColor(props.itemBackgroundColors[index % props.itemBackgroundColors.length])
    }));

    updateOptionsDisplay(); 
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
      localStorage.setItem(SPEED_KEY, selectedSpeed); 
      speedControls.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active-speed'));
      btn.classList.add('active-speed');
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

  // Get DOM elements
  const optionInput = document.getElementById('optionInput');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const optionsList = document.getElementById('optionsList');
  const resultDisplay = document.getElementById('resultDisplay');
  const spinBtn = document.getElementById('spinBtn');
  const spinCenterBtn = document.getElementById('spinCenterBtn'); 
  const winnerHistoryList = document.getElementById('winnerHistoryList');

  // Winner Popup Modal logic
  const winnerPopup = document.getElementById('winnerPopup');
  const winnerPopupText = document.getElementById('winnerPopupText');
  const winnerPopupClose = document.getElementById('winnerPopupClose');

  function showWinnerPopup(winnerLabel) {
    winnerPopupText.textContent = winnerLabel;
    winnerPopup.classList.add('show');
    winnerPopupText.classList.remove('winner-popup-animate');
    // Trigger reflow for animation restart
    void winnerPopupText.offsetWidth;
    winnerPopupText.classList.add('winner-popup-animate');
  }

  function hideWinnerPopup() {
    winnerPopup.classList.remove('show');
  }

  winnerPopupClose.addEventListener('click', hideWinnerPopup);
  winnerPopup.addEventListener('click', (e) => {
    if (e.target === winnerPopup) hideWinnerPopup();
  });

  // --- Winner History Logic ---
  const HISTORY_KEY = 'winnerHistory';
  const MAX_HISTORY = 20;

  function loadWinnerHistory() {
    let history = [];
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      history = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(history)) history = [];
    } catch (e) {
      history = [];
    }
    return history;
  }

  function saveWinnerHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function renderWinnerHistory() {
    const history = loadWinnerHistory();
    winnerHistoryList.innerHTML = '';
    history.forEach((winner, idx) => {
      const li = document.createElement('li');
      // Add trophy icon (SVG inline for best compatibility)
      li.innerHTML = `<span class="trophy-icon" style="vertical-align:middle;margin-right:6px;">🏆</span><span>${winner}</span>`;
      winnerHistoryList.appendChild(li);
    });
  }

  function addWinnerToHistory(winnerLabel) {
    let history = loadWinnerHistory();
    history.unshift(winnerLabel);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    saveWinnerHistory(history);
    renderWinnerHistory();
  }

  // Update the options list display based on localStorage
  function updateOptionsDisplay() {
    optionsList.innerHTML = '';
    const template = document.getElementById('optionItemTemplate');
    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (options.length === 1 && options[0].label === 'Add your options!') {
    } else {
        options.forEach((item, index) => {
          const clone = template.content.cloneNode(true);
          const labelSpan = clone.querySelector('.option-label');
          labelSpan.textContent = item.label;
          
          const removeBtn = clone.querySelector('.remove-btn');
          removeBtn.onclick = () => removeOption(index);
          
          const weightContainer = clone.querySelector('.weight-container');
          if (weightContainer) {
            weightContainer.remove(); 
          }
          
          optionsList.appendChild(clone);
        });
    }
    spinBtn.disabled = options.length < 2 || (options.length === 1 && options[0].label === 'Add your options!');

    // Make optionsList draggable (UI only, does not affect wheel logic)
    optionsList.setAttribute('draggable', 'false');
    let dragSrcIndex = null;

    optionsList.addEventListener('dragstart', function(e) {
      const li = e.target.closest('li');
      if (!li) return;
      dragSrcIndex = Array.from(optionsList.children).indexOf(li);
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragSrcIndex);
    });

    optionsList.addEventListener('dragend', function(e) {
      const li = e.target.closest('li');
      if (li) li.classList.remove('dragging');
    });

    optionsList.addEventListener('dragover', function(e) {
      e.preventDefault();
      const li = e.target.closest('li');
      if (!li || li.classList.contains('dragging')) return;
      li.classList.add('dragover');
    });

    optionsList.addEventListener('dragleave', function(e) {
      const li = e.target.closest('li');
      if (li) li.classList.remove('dragover');
    });

    optionsList.addEventListener('drop', function(e) {
      e.preventDefault();
      const li = e.target.closest('li');
      if (!li) return;
      const dropIndex = Array.from(optionsList.children).indexOf(li);
      if (dragSrcIndex === null || dragSrcIndex === dropIndex) return;
      const dragged = optionsList.children[dragSrcIndex];
      if (dragged) {
        if (dropIndex > dragSrcIndex) {
          li.after(dragged);
        } else {
          li.before(dragged);
        }
      }
      optionsList.querySelectorAll('li').forEach(el => el.classList.remove('dragover', 'dragging'));
      dragSrcIndex = null;
    });

    // Set draggable attribute for each option item
    optionsList.querySelectorAll('li').forEach(li => {
      li.setAttribute('draggable', 'true');
    });
  }

  // Add a new option to localStorage
  function addOption() {
    const newOptionLabel = optionInput.value.trim();
    if (newOptionLabel) {
      let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      if (options.length === 1 && options[0].label === 'Add your options!') {
        options = [];
      }

      options.push({ 
        label: newOptionLabel,
        weight: 1 
      });
      
      saveToLocalStorage(options);
      loadFromLocalStorage(); 
      optionInput.value = '';
    }
  }

  // Remove an option from localStorage
  function removeOption(index) {
    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    if (options.length > 1) {
      options.splice(index, 1);
      saveToLocalStorage(options);
      loadFromLocalStorage(); 
    } else if (options.length === 1 && options[0].label !== 'Add your options!') {
        options = [{ label: 'Add your options!', weight: 0 }];
        saveToLocalStorage(options);
        loadFromLocalStorage();
    } else {
      alert('Cannot remove the placeholder option.');
    }
  }

  // Spin the wheel based on weights from localStorage
  function spinWheel() {
    spinBtn.disabled = true;
    spinCenterBtn.disabled = true; 
    resultDisplay.textContent = ''; 
    resultDisplay.classList.remove('show'); 
    if (typeof wheel.stopGlow === 'function') wheel.stopGlow(); 

    // Disable gesture/touch controls during spin
    wheel.isInteractive = false;

    let options = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    options = options.filter(opt => opt.label !== 'Add your options!');

    if (options.length < 2) {
        alert('Please add at least two options to spin!');
        spinBtn.disabled = false;
        spinCenterBtn.disabled = false;
        // Re-enable gesture/touch controls if spin fails
        wheel.isInteractive = true;
        return;
    }

    const weightedArray = [];
    options.forEach((item) => {
      const weight = parseInt(item.weight || '0', 10);
      if (!isNaN(weight) && weight > 0) {
        for (let i = 0; i < weight; i++) {
          weightedArray.push(item.label);
        }
      }
    });

    if (weightedArray.length === 0) {
      resultDisplay.textContent = 'No valid options with weights to spin!';
      spinBtn.disabled = false;
      spinCenterBtn.disabled = false;
      // Re-enable gesture/touch controls if spin fails
      wheel.isInteractive = true;
      return;
    }

    for (let i = weightedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedArray[i], weightedArray[j]] = [weightedArray[j], weightedArray[i]];
    }
    const winnerLabel = weightedArray[Math.floor(Math.random() * weightedArray.length)];
    
    const winnerIndex = wheel.items.findIndex(item => item.label === winnerLabel);

    if (winnerIndex !== -1) {
      wheel.highlightIndex = null; 
      
      let baseDuration = 9000; // Increased base duration for smoother deceleration
      let baseRevolutions = 8; // More revolutions for a longer spin
      const numSegments = wheel.items.length;
      const duration = baseDuration + numSegments * 300; // Even longer for more segments
      const revolutions = baseRevolutions + Math.floor(numSegments / 3); // More revolutions for more segments
      wheel.spinToItem(winnerIndex, duration, false, revolutions, 1, easing.quinticOut);
      
      wheel.onRest = () => {
        console.log('[onRest] Spin finished. Winner:', winnerLabel, 'at', Date.now());
        wheel.highlightIndex = winnerIndex;
        console.log('[onRest] Calling startGlow at', Date.now());
        wheel.startGlow();
        resultDisplay.textContent = `Winner: ${winnerLabel}`;
        resultDisplay.classList.add('show'); 
        showWinnerPopup(winnerLabel);
        addWinnerToHistory(winnerLabel);
        spinBtn.disabled = false; 
        spinCenterBtn.disabled = false; 
        // Re-enable gesture/touch controls after spin
        wheel.isInteractive = true;
      };
    } else {
      console.error('Winner label not found in current wheel items:', winnerLabel);
      resultDisplay.textContent = 'Error determining winner!';
      spinBtn.disabled = false;
      spinCenterBtn.disabled = false; 
      // Re-enable gesture/touch controls if spin fails
      wheel.isInteractive = true;
    }
  }

  function handleSpinComplete(event) {
      console.log('Wheel rested at index:', event.currentIndex);
  }

  addOptionBtn.addEventListener('click', addOption);
  spinBtn.addEventListener('click', spinWheel);
  spinCenterBtn.addEventListener('click', spinWheel); 
  optionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addOption();
    }
  });

  loadSpeed();
  loadFromLocalStorage(); 
  renderWinnerHistory();
};