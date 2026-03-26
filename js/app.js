/* ==========================================================
   TRUEGRAIN SAMPLE REQUEST FORM
   Color catalog, size selection, validation, Formspree submit.
   Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
   ========================================================== */

(function () {
  'use strict';

  /* ---- CONFIG ---- */
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  var THANKYOU_URL       = 'thankyou.html';

  /* ---- COLOR CATALOG (TrueGrain 6-color lineup) ---- */
  var COLORS = [
    { id: 'royal-ipe',          label: 'Royal IPE',          swatch: 'images/swatch-royal-ipe.jpg'          },
    { id: 'aged-oak',           label: 'Aged Oak',           swatch: 'images/swatch-aged-oak.jpg'           },
    { id: 'embered-taupe',      label: 'Embered Taupe',      swatch: 'images/swatch-embered-taupe.jpg'      },
    { id: 'tropical-walnut',    label: 'Tropical Walnut',    swatch: 'images/swatch-tropical-walnut.jpg'    },
    { id: 'coast-driftwood',    label: 'Coast Driftwood',    swatch: 'images/swatch-coast-driftwood.jpg'    },
    { id: 'new-england-birch',  label: 'New England Birch',  swatch: 'images/swatch-new-england-birch.jpg'  }
  ];

  /* ---- STATE ---- */
  var selectedSize   = null;   // '6' or '12'
  var selectedColors = [];     // array of color ids

  /* ---- DOM REFS ---- */
  var sizeGrid      = document.getElementById('size-grid');
  var swatchGrid    = document.getElementById('color-swatch-grid');
  var countNum      = document.getElementById('count-num');
  var countText     = document.getElementById('count-text');
  var selectAllBtn  = document.getElementById('btn-select-all');
  var summarySize   = document.getElementById('summary-size');
  var summaryColors = document.getElementById('summary-colors');
  var sizeError     = document.getElementById('size-error');
  var colorError    = document.getElementById('color-error');
  var form          = document.getElementById('sample-form');
  var submitBtn     = document.getElementById('sample-submit');
  var successPanel  = document.getElementById('form-success');
  var newReqBtn     = document.getElementById('btn-new-request');

  /* ---- HELPERS ---- */
  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  function clearError(el) { if (el) el.textContent = ''; }
  function setError(el, msg) { if (el) el.textContent = msg; }

  /* ---- RENDER SWATCHES ---- */
  function renderSwatches() {
    swatchGrid.innerHTML = '';
    COLORS.forEach(function (c) {
      var item = document.createElement('div');
      item.className = 'swatch-item';
      item.setAttribute('role', 'checkbox');
      item.setAttribute('aria-checked', 'false');
      item.setAttribute('aria-label', c.label);
      item.setAttribute('tabindex', '0');
      item.dataset.colorId = c.id;

      var circle = document.createElement('div');
      circle.className = 'swatch-circle';
      circle.style.backgroundImage = 'url(' + c.swatch + ')';
      circle.style.backgroundSize = 'cover';
      circle.style.backgroundPosition = 'center';

      var label = document.createElement('span');
      label.className = 'swatch-label';
      label.textContent = c.label;

      item.appendChild(circle);
      item.appendChild(label);
      swatchGrid.appendChild(item);

      item.addEventListener('click', function () { toggleColor(c.id); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleColor(c.id);
        }
      });
    });
  }

  /* ---- SIZE SELECTION ---- */
  function initSizeCards() {
    var cards = sizeGrid.querySelectorAll('.size-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () { selectSize(card.dataset.size); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectSize(card.dataset.size);
        }
      });
    });
  }

  function selectSize(size) {
    selectedSize = size;
    clearError(sizeError);
    var cards = sizeGrid.querySelectorAll('.size-card');
    cards.forEach(function (card) {
      var isActive = card.dataset.size === size;
      card.classList.toggle('selected', isActive);
      card.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    updateSummary();
  }

  /* ---- COLOR TOGGLE ---- */
  function toggleColor(colorId) {
    clearError(colorError);
    var idx = selectedColors.indexOf(colorId);
    if (idx >= 0) {
      selectedColors.splice(idx, 1);
    } else {
      selectedColors.push(colorId);
    }
    refreshSwatchUI();
    updateSummary();
  }

  /* ---- SELECT ALL / DESELECT ALL ---- */
  function toggleSelectAll() {
    clearError(colorError);
    if (selectedColors.length === COLORS.length) {
      selectedColors = [];
    } else {
      selectedColors = COLORS.map(function (c) { return c.id; });
    }
    refreshSwatchUI();
    updateSummary();
  }

  function refreshSwatchUI() {
    var items = swatchGrid.querySelectorAll('.swatch-item');
    items.forEach(function (item) {
      var isSelected = selectedColors.indexOf(item.dataset.colorId) >= 0;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
    countNum.textContent = selectedColors.length;
    countText.textContent = selectedColors.length === 1 ? 'color selected' : 'colors selected';

    // Update Select All button label
    if (selectAllBtn) {
      var allSelected = selectedColors.length === COLORS.length;
      selectAllBtn.textContent = allSelected ? 'Deselect All' : 'Select All';
      selectAllBtn.classList.toggle('active', allSelected);
    }
  }

  /* ---- SUMMARY ---- */
  function updateSummary() {
    summarySize.textContent = selectedSize ? selectedSize + '-inch board sample' : 'Not selected';
    if (selectedColors.length === 0) {
      summaryColors.textContent = 'None selected';
    } else {
      var names = selectedColors.map(function (id) {
        var match = COLORS.find(function (c) { return c.id === id; });
        return match ? match.label : id;
      });
      summaryColors.textContent = names.join(', ');
    }
  }

  /* ---- VALIDATION ---- */
  function validate() {
    var valid = true;

    // Size
    if (!selectedSize) {
      setError(sizeError, 'Please select a sample size.');
      valid = false;
    }

    // Colors
    if (selectedColors.length === 0) {
      setError(colorError, 'Please select at least one color.');
      valid = false;
    }

    // Name
    var nameEl  = document.getElementById('sample-name');
    var nameErr = document.getElementById('sample-name-error');
    clearError(nameErr);
    nameEl.classList.remove('error');
    if (!nameEl.value.trim()) {
      nameEl.classList.add('error');
      setError(nameErr, 'Name is required.');
      valid = false;
    }

    // Email
    var emailEl  = document.getElementById('sample-email');
    var emailErr = document.getElementById('sample-email-error');
    clearError(emailErr);
    emailEl.classList.remove('error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value.trim())) {
      emailEl.classList.add('error');
      setError(emailErr, 'Please enter a valid email address.');
      valid = false;
    }

    // Phone (optional, validate format if filled)
    var phoneEl  = document.getElementById('sample-phone');
    var phoneErr = document.getElementById('sample-phone-error');
    clearError(phoneErr);
    phoneEl.classList.remove('error');
    if (phoneEl.value.trim() && phoneEl.value.replace(/\D/g, '').length < 7) {
      phoneEl.classList.add('error');
      setError(phoneErr, 'Please enter a valid phone number.');
      valid = false;
    }

    // Address
    var addrEl  = document.getElementById('sample-address');
    var addrErr = document.getElementById('sample-address-error');
    clearError(addrErr);
    addrEl.classList.remove('error');
    if (!addrEl.value.trim()) {
      addrEl.classList.add('error');
      setError(addrErr, 'Street address is required.');
      valid = false;
    }

    // City
    var cityEl  = document.getElementById('sample-city');
    var cityErr = document.getElementById('sample-city-error');
    clearError(cityErr);
    cityEl.classList.remove('error');
    if (!cityEl.value.trim()) {
      cityEl.classList.add('error');
      setError(cityErr, 'City is required.');
      valid = false;
    }

    // State
    var stateEl  = document.getElementById('sample-state');
    var stateErr = document.getElementById('sample-state-error');
    clearError(stateErr);
    stateEl.classList.remove('error');
    if (!stateEl.value) {
      stateEl.classList.add('error');
      setError(stateErr, 'Please select a state.');
      valid = false;
    }

    // ZIP
    var zipEl  = document.getElementById('sample-zip');
    var zipErr = document.getElementById('sample-zip-error');
    clearError(zipErr);
    zipEl.classList.remove('error');
    if (!zipEl.value.trim() || !/^[0-9]{5}(-[0-9]{4})?$/.test(zipEl.value.trim())) {
      zipEl.classList.add('error');
      setError(zipErr, 'Please enter a valid ZIP code (e.g. 08742).');
      valid = false;
    }

    return valid;
  }

  /* ---- BUILD PAYLOAD ---- */
  function buildPayload() {
    var colorNames = selectedColors.map(function (id) {
      var match = COLORS.find(function (c) { return c.id === id; });
      return match ? match.label : id;
    });

    return {
      _subject: 'New TrueGrain Decking Sample Request',

      /* Contact */
      name:    document.getElementById('sample-name').value.trim(),
      email:   document.getElementById('sample-email').value.trim(),
      phone:   document.getElementById('sample-phone').value.trim() || '(not provided)',
      company: document.getElementById('sample-company').value.trim() || '(not provided)',

      /* Shipping */
      address:  document.getElementById('sample-address').value.trim(),
      address2: document.getElementById('sample-address2').value.trim() || '',
      city:     document.getElementById('sample-city').value.trim(),
      state:    document.getElementById('sample-state').value,
      zip:      document.getElementById('sample-zip').value.trim(),

      /* Samples */
      sample_size:      selectedSize + '-inch',
      colors_requested: colorNames.join(', '),
      color_count:      colorNames.length + ' color(s)',

      /* Notes */
      notes: document.getElementById('sample-notes').value.trim() || '(none)',

      /* Meta */
      submitted_at: new Date().toLocaleString('en-US', { timeZoneName: 'short' }),
      source: 'TrueGrain Decking Sample Request Form'
    };
  }

  /* ---- SET LOADING STATE ---- */
  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting\u2026';
    } else {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Submit Sample Request';
    }
  }

  /* ---- SUBMIT ---- */
  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      // Scroll to first error
      var firstError = document.querySelector('.form-error:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Please fix the highlighted fields.');
      return;
    }

    var payload = buildPayload();
    setLoading(true);

    fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      setLoading(false);
      if (res.ok) {
        // Show inline success
        form.style.display = 'none';
        successPanel.style.display = 'block';
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        return res.json().then(function (data) {
          throw new Error((data && data.error) || 'Submission failed.');
        });
      }
    })
    .catch(function (err) {
      setLoading(false);
      console.error('TrueGrain sample form submission error:', err);
      showToast('Something went wrong. Please try again or contact us directly.');
    });
  }

  /* ---- RESET ---- */
  function resetForm() {
    selectedSize = null;
    selectedColors = [];
    form.reset();
    form.style.display = 'block';
    successPanel.style.display = 'none';

    // Reset size cards
    sizeGrid.querySelectorAll('.size-card').forEach(function (card) {
      card.classList.remove('selected');
      card.setAttribute('aria-checked', 'false');
    });

    // Reset swatches
    refreshSwatchUI();
    updateSummary();

    // Clear all errors
    document.querySelectorAll('.form-error').forEach(function (el) { el.textContent = ''; });
    document.querySelectorAll('.form-input.error').forEach(function (el) { el.classList.remove('error'); });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', function () {
    renderSwatches();
    initSizeCards();
    updateSummary();
    form.addEventListener('submit', handleSubmit);
    newReqBtn.addEventListener('click', resetForm);
    if (selectAllBtn) selectAllBtn.addEventListener('click', toggleSelectAll);
  });

}());
