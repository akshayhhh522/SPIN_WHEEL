// config.js - Logic for the probability configuration page

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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      options = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(options)) options = [];
      if (options.length === 0) {
        options = [{ label: 'Add your options!', weight: 0 }];
        saveOptions();
      }
    } catch (e) {
      console.error("Error loading options:", e);
      options = [{ label: 'Add your options!', weight: 0 }];
      saveOptions();
    }
  }
  function saveOptions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
      console.log("Options saved to localStorage:", options);
    } catch (e) {
      console.error("Error saving options:", e);
    }
  }

  // --- Render ---
  function renderOptions() {
    console.log('Rendering options. Current options:', JSON.stringify(options)); // Log options at start of render
    optionsList.innerHTML = '';
    const displayOptions = options.length >=0 ? options.filter(opt => opt.label !== 'Add your options!') : options;

    displayOptions.forEach((item, index) => {
      const originalIndex = options.findIndex(opt => opt.label === item.label);

      const node = optionItemTemplate.content.cloneNode(true);
      const label = node.querySelector('.option-label');
      const weightInput = node.querySelector('.option-weight');
      const removeBtn = node.querySelector('.remove-btn');

      label.textContent = item.label;
      console.log(`Rendering item: ${item.label}, Weight: ${item.weight}`); // Log item weight before setting input
      weightInput.value = item.weight || 0;
      console.log(`Set input value for ${item.label} to: ${weightInput.value}`); // Log the value set to the input
      weightInput.id = `weight-${originalIndex}`;
      weightInput.setAttribute('data-index', originalIndex);

      weightInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;
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

    // Add the new option
    options.push({ label, weight: 0 });
    console.log('Before weight reset:', JSON.stringify(options)); // Log before reset

    // Reset all weights to 1
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
        options = [{ label: 'Add your options!', weight: 1 }];
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

  // Add a hard check to ensure the sum of weights is exactly 100
  function validateWeightsHardCheck() {
    const optionsToValidate = options.filter(opt => opt.label !== 'Add your options!');

    // Calculate the total weight
    const totalWeight = optionsToValidate.reduce((sum, item) => {
      const weight = parseInt(item.weight || '0', 10);
      return sum + (isNaN(weight) || weight < 0 ? 0 : weight);
    }, 0);

    console.log('[validateWeightsHardCheck] Total weight:', totalWeight);

    // Check if the total weight is 100
    if (totalWeight !== 100) {
      const errorMessage = `Error: Total weight must be exactly 100. Current total: ${totalWeight}`;
      //alert(errorMessage); // Show an alert to the user
      throw new Error(errorMessage); // Throw an error to enforce the hard check
    }
  }

  // --- Save Weights ---
  function saveWeights() {
    try {
      validateWeightsHardCheck(); // Perform the hard check before saving
      saveOptions();
      resultDisplay.textContent = 'Weights saved successfully!';
      resultDisplay.style.color = '#90EE90'; // Light green for success
      resultDisplay.classList.add('show');
      setTimeout(() => resultDisplay.classList.remove('show'), 3000);
    } catch (error) {
      console.error('[saveWeights] Validation failed:', error.message);
      resultDisplay.textContent = error.message;
      resultDisplay.style.color = '#FF6347'; // Red for error
      resultDisplay.classList.add('show');
      setTimeout(() => resultDisplay.classList.remove('show'), 5000);
    }
  }

  // --- Event Listeners ---
  addOptionBtn.addEventListener('click', addOption);
  optionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addOption();
  });
  saveWeightsBtn.addEventListener('click', saveWeights);

  // --- Init ---
  loadOptions();
  renderOptions();
};
