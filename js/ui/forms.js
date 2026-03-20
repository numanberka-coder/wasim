/* ========================================
   FORMS - Form Handling & Custom Inputs
   ======================================== */


/**
 * Initialize custom form elements
 */
function initForms() {
  initFileInputs();
  initRangeInputs();
  initCheckboxRows();
  console.log('📝 Forms initialized');
}

/**
 * Initialize custom file inputs
 */
function initFileInputs() {
  const fileInputs = $$('.file-input');

  fileInputs.forEach(container => {
    const input = container.querySelector('input[type="file"]');
    const btn = container.querySelector('.file-btn');
    const nameEl = container.querySelector('.file-name');

    if (!input || !btn) return;

    // Click button to trigger file input
    btn.addEventListener('click', () => input.click());

    // Update file name display
    input.addEventListener('change', () => {
      if (nameEl) {
        const file = input.files?.[0];
        nameEl.textContent = file ? file.name : 'Seçilmedi';
        nameEl.title = file ? file.name : '';
      }
    });
  });
}

/**
 * Initialize range inputs with output display
 */
function initRangeInputs() {
  const rangeRows = $$('.range-row');

  rangeRows.forEach(row => {
    const input = row.querySelector('input[type="range"]');
    const output = row.querySelector('output');

    if (!input || !output) return;

    // Set initial value
    updateRangeOutput(input, output);

    // Update on change
    input.addEventListener('input', () => {
      updateRangeOutput(input, output);
    });
  });
}

/**
 * Update range output display
 */
function updateRangeOutput(input, output) {
  const value = input.value;
  const unit = input.dataset.unit || '';
  output.textContent = value + unit;
}

/**
 * Initialize checkbox rows
 */
function initCheckboxRows() {
  const checkboxRows = $$('.checkbox-row');

  checkboxRows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const label = row.querySelector('.checkbox-label');

    if (!checkbox || !label) return;

    // Click label to toggle checkbox
    label.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

/**
 * Create custom file input element
 */
function createFileInput(options = {}) {
  const {
    accept = 'image/*',
    buttonText = '📁 Dosya Seç',
    onChange = null,
  } = options;

  const container = document.createElement('div');
  container.className = 'file-input';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'file-btn secondary btn-sm';
  btn.textContent = buttonText;

  const name = document.createElement('span');
  name.className = 'file-name';
  name.textContent = 'Seçilmedi';

  btn.addEventListener('click', () => input.click());

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    name.textContent = file ? file.name : 'Seçilmedi';

    if (file && onChange) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        onChange(file, dataUrl);
      } catch (e) {
        console.error('File read error:', e);
      }
    }
  });

  container.appendChild(input);
  container.appendChild(btn);
  container.appendChild(name);

  return { container, input, clear: () => { input.value = ''; name.textContent = 'Seçilmedi'; } };
}

/**
 * Create range input with label and output
 */
function createRangeInput(options = {}) {
  const {
    label = 'Value',
    min = 0,
    max = 100,
    step = 1,
    value = 50,
    unit = '',
    onChange = null,
  } = options;

  const row = document.createElement('div');
  row.className = 'range-row';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.dataset.unit = unit;

  const output = document.createElement('output');
  output.textContent = value + unit;

  input.addEventListener('input', () => {
    output.textContent = input.value + unit;
    if (onChange) {
      onChange(Number(input.value));
    }
  });

  row.appendChild(labelEl);
  row.appendChild(input);
  row.appendChild(output);

  return { row, input, output, setValue: (v) => { input.value = v; output.textContent = v + unit; } };
}

/**
 * Create checkbox row
 */
function createCheckboxRow(options = {}) {
  const {
    label = 'Option',
    checked = false,
    onChange = null,
  } = options;

  const row = document.createElement('label');
  row.className = 'checkbox-row';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;

  const labelEl = document.createElement('span');
  labelEl.className = 'checkbox-label';
  labelEl.textContent = label;

  input.addEventListener('change', () => {
    if (onChange) {
      onChange(input.checked);
    }
  });

  row.appendChild(input);
  row.appendChild(labelEl);

  return { row, input, setChecked: (v) => { input.checked = v; } };
}

/**
 * Get form data from a container
 */
function getFormData(container) {
  const data = {};
  const inputs = container.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const name = input.name || input.id;
    if (!name) return;

    if (input.type === 'checkbox') {
      data[name] = input.checked;
    } else if (input.type === 'number' || input.type === 'range') {
      data[name] = Number(input.value);
    } else {
      data[name] = input.value;
    }
  });

  return data;
}

/**
 * Set form data to a container
 */
function setFormData(container, data) {
  for (const [name, value] of Object.entries(data)) {
    const input = container.querySelector(`[name="${name}"], #${name}`);
    if (!input) continue;

    if (input.type === 'checkbox') {
      input.checked = Boolean(value);
    } else {
      input.value = value;
    }

    // Trigger change for range inputs
    if (input.type === 'range') {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
