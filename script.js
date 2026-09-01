  var canOptions = document.querySelectorAll('.can-option');
  var selectedTypes = document.getElementById('selected-types');
  var hiddenSelection = document.getElementById('selected-cylinders');
  var totalEl = document.getElementById('order-total');

  function updateSelectedSummary(){
    var selected = [];
    canOptions.forEach(function(option){
      var check = option.querySelector('.can-check');
      var qtyInput = option.querySelector('.can-qty');
      var isChecked = check.checked;
      option.classList.toggle('selected', isChecked);
      qtyInput.disabled = !isChecked;

      if (isChecked) {
        var qty = parseInt(qtyInput.value, 10) || 0;
        if (qty > 0) {
          selected.push(check.value + ' x' + qty);
        }
      }
    });

    selectedTypes.textContent = selected.length ? 'Selected: ' + selected.join(', ') : 'No cylinders selected yet';
    hiddenSelection.value = selected.length ? selected.join(' | ') : '';
    updateTotal();
  }

  function updateTotal(){
    var total = 0;
    canOptions.forEach(function(option){
      var check = option.querySelector('.can-check');
      if (check.checked) {
        var price = parseFloat(check.getAttribute('data-price')) || 0;
        var qty = parseInt(option.querySelector('.can-qty').value, 10) || 0;
        total += price * qty;
      }
    });
    totalEl.textContent = 'R' + total;
  }

  canOptions.forEach(function(option){
    var check = option.querySelector('.can-check');
    var qtyInput = option.querySelector('.can-qty');

    check.addEventListener('change', updateSelectedSummary);
    qtyInput.addEventListener('input', updateSelectedSummary);
  });

  document.querySelectorAll('.price-row').forEach(function(row){
    row.addEventListener('click', function(){
      var size = row.getAttribute('data-size');
      var target = document.querySelector('.can-check[value="' + size + '"]');
      if (target) {
        target.checked = true;
        var qtyInput = target.closest('.can-option').querySelector('.can-qty');
        qtyInput.value = 1;
        updateSelectedSummary();
      }
    });
  });

  var form = document.getElementById('order-form');
  var submitBtn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(form.action.indexOf('YOUR_FORM_ID') !== -1){
      status.textContent = 'Form isn\'t connected yet — add your Formspree ID to go live.';
      status.className = 'form-status err';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function(res){
      if(res.ok){
        status.textContent = 'Order sent — we\'ll be in touch shortly.';
        status.className = 'form-status ok';
        form.reset();
        updateSelectedSummary();
      } else {
        status.textContent = 'Something went wrong — please WhatsApp us instead.';
        status.className = 'form-status err';
      }
    }).catch(function(){
      status.textContent = 'Something went wrong — please WhatsApp us instead.';
      status.className = 'form-status err';
    }).finally(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send order';
    });
  });

  updateSelectedSummary();
