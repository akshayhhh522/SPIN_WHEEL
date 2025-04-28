// config.js - Logic for the probability configuration page

const DEBUG_FORCE_CLEAR_STORAGE = false; // <-- SET THIS BACK TO FALSE

window.onload = () => {
  const optionInput = document.getElementById('optionInput');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const optionsList = document.getElementById('optionsList');
  const optionItemTemplate = document.getElementById('optionItemTemplate');
  const resultDisplay = document.getElementById('resultDisplay');
  const saveWeightsBtn = document.getElementById('saveWeightsBtn');

  // --- LocalStorage Key ---
  const STORAGE_KEY = 'wheelOptions';

  // --- State ---
  let options = [];

  // --- Load from localStorage ---
  function loadOptions() {
    // --- TEMPORARY DEBUGGING --- 
    if (DEBUG_FORCE_CLEAR_STORAGE) {
        console.warn('[DEBUG] Force clearing storage AND skipping load.');
        localStorage.removeItem(STORAGE_KEY);
        // Directly initialize with placeholder and EXIT EARLY
        options = [{ label: 'Add your options!', weight: 0 }];
        console.log('[loadOptions - DEBUG OVERRIDE] Initialized options:', JSON.stringify(options));
        return; // Skip the rest of the loading logic
    }
    // --- END TEMPORARY DEBUGGING --- 

    // This part will only run if DEBUG_FORCE_CLEAR_STORAGE is false
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('[loadOptions] localStorage.getItem result:', saved);

      let loadedOptions = saved ? JSON.parse(saved) : [];

      // Basic validation
      if (!Array.isArray(loadedOptions)) {
          loadedOptions = [];
      }

      // Ensure weights are numbers and handle placeholder
      options = loadedOptions.map(opt => ({
          ...opt,
          weight: (typeof opt.weight === 'number' && !isNaN(opt.weight)) ? opt.weight : 0
      }));

      if (options.length === 0) {
        options = [{ label: 'Add your options!', weight: 0 }];
      }
      else if (options.length === 1 && options[0].label === 'Add your options!') {
          options[0].weight = 0;
      }

      console.log('[loadOptions] Final loaded/initialized options:', JSON.stringify(options));

    } catch (e) {
      console.error("[loadOptions] Error loading or parsing options:", e);
      options = [{ label: 'Add your options!', weight: 0 }];
    }
  }

  function saveOptions() {
    try {
      // Filter out placeholder before saving to localStorage
      const optionsToSave = options.filter(opt => opt.label !== 'Add your options!');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(optionsToSave));
      console.log("Options saved to localStorage:", optionsToSave);
    } catch (e) {
      console.error("Error saving options:", e);
      // Optionally display an error to the user here as well
      resultDisplay.textContent = 'Error saving options to storage.';
      resultDisplay.style.color = '#FF6347';
      resultDisplay.classList.add('show');
    }
  }

  // --- Render ---
  function renderOptions() {
    console.log('Rendering options. Current options:', JSON.stringify(options)); // Log options at start of render
    optionsList.innerHTML = '';
    const displayOptions = options.length > 1 ? options.filter(opt => opt.label !== 'Add your options!') : options;

    displayOptions.forEach((item, index) => {
      const originalIndex = options.findIndex(opt => opt.label === item.label);

      const node = optionItemTemplate.content.cloneNode(true);
      const label = node.querySelector('.option-label');
      const weightInput = node.querySelector('.option-weight');
      const removeBtn = node.querySelector('.remove-btn');

      label.textContent = item.label;
      console.log(`Rendering item: ${item.label}, Weight: ${item.weight}`); // Log item weight before setting input
      weightInput.value = item.weight || 0;  // Default to 0 for new items
      console.log(`Set input value for ${item.label} to: ${weightInput.value}`); // Log the value set to the input
      weightInput.id = `weight-${originalIndex}`;
      weightInput.setAttribute('data-index', originalIndex);

      weightInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;  // Ensure weight can't be negative
        e.target.value = val;
        const idxToUpdate = parseInt(e.target.getAttribute('data-index'), 10);
        if (options[idxToUpdate]) {
          options[idxToUpdate].weight = val;
        }
      });

      removeBtn.onclick = () => {
        const idxToRemove = parseInt(weightInput.getAttribute('data-index'), 10);
        removeOption(idxToRemove);
      };
      optionsList.appendChild(node);
    });
    saveWeightsBtn.disabled = options.length === 1 && options[0].label === 'Add your options!';
  }

  // --- Add Option ---
  function addOption() {
    const label = optionInput.value.trim();
    if (!label) return;

    if (options.length === 1 && options[0].label === 'Add your options!') {
      options = [];
    }

    if (options.some(opt => opt.label === label)) {
      alert('Option already exists!');
      return;
    }

    // Add the new option with a default weight of 0
    options.push({ label, weight: 0 });
    console.log('Before weight reset:', JSON.stringify(options)); // Log before reset

    // Reset all weights to 0 instead of 1
    options.forEach(option => {
      option.weight = 0;
    });
    console.log('After weight reset:', JSON.stringify(options)); // Log after reset

    saveOptions();
    renderOptions(); // This will trigger the logs inside renderOptions
    optionInput.value = '';
  }

  // --- Remove Option ---
  function removeOption(indexToRemove) {
    if (options.length > 1) {
      options.splice(indexToRemove, 1);
      if (options.length === 0) {
        options = [{ label: 'Add your options!', weight: 0 }];
      }
      saveOptions();
      renderOptions();
    } else if (options.length === 1 && options[0].label !== 'Add your options!') {
      options = [{ label: 'Add your options!', weight: 0 }];
      saveOptions();
      renderOptions();
    } else {
      alert('Cannot remove the placeholder option.');
    }
  }

  // --- Save Weights ---
  function saveWeights() {
    // Filter out the placeholder if it exists before calculating total
    const optionsToValidate = options.filter(opt => opt.label !== 'Add your options!');

    // Calculate the total weight, allowing 0 and preventing negative
    const totalWeight = optionsToValidate.reduce((sum, item) => {
      const weight = parseInt(item.weight || '0', 10); // Default to 0 if missing
      // Use 0 for invalid/negative weights, otherwise use the weight
      return sum + (isNaN(weight) || weight < 0 ? 0 : weight);
    }, 0);

    console.log('[saveWeights] Calculated total weight for validation:', totalWeight);

    // --- Strict Check: Total weight MUST be 100 ---
    if (totalWeight === 100) {
      // If total is 100, save the options
      saveOptions(); // Call the actual saving function
      resultDisplay.textContent = 'Weights saved successfully! (Total: 100)';
      resultDisplay.style.color = '#90EE90'; // Light green for success
      resultDisplay.classList.add('show');
      setTimeout(() => resultDisplay.classList.remove('show'), 3000);
    } else {
      // If total is not 100, show an error message and DO NOT SAVE
      resultDisplay.textContent = `Error: Total weight must be 100 to save. Current total: ${totalWeight}`;
      resultDisplay.style.color = '#FF6347'; // Tomato red for error
      resultDisplay.classList.add('show');
      console.error('[saveWeights] Save prevented. Total weight is not 100.');
    }
  }

  // --- Event Listeners ---
  addOptionBtn.addEventListener('click', addOption);
  optionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addOption();
  });
  saveWeightsBtn.addEventListener('click', saveWeights); // This now calls the validation function

  // --- Init ---
  loadOptions();
  renderOptions();
};

