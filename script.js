document.addEventListener('DOMContentLoaded', function () {

  var canOptions = document.querySelectorAll('.can-option');
  var selectedTypes = document.getElementById('selected-types');
  var hiddenSelection = document.getElementById('selected-cylinders');
  var estimatedTotal = document.getElementById('estimated-total');
  var totalEl = document.getElementById('order-total');

  function updateSelectedSummary() {
    var selected = [];

    canOptions.forEach(function (option) {
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

    selectedTypes.textContent = selected.length
      ? 'Selected: ' + selected.join(', ')
      : 'No cylinders selected yet';

    hiddenSelection.value = selected.length
      ? selected.join(' | ')
      : '';

    updateTotal();
  }

  function updateTotal() {
    var total = 0;

    canOptions.forEach(function (option) {
      var check = option.querySelector('.can-check');
      var qtyInput = option.querySelector('.can-qty');

      if (check.checked) {
        var price = parseFloat(check.getAttribute('data-price')) || 0;
        var qty = parseInt(qtyInput.value, 10) || 0;
        total += price * qty;
      }
    });

    totalEl.textContent = 'R' + total.toLocaleString('en-ZA');

    if (estimatedTotal) {
      estimatedTotal.value = total > 0
        ? 'R' + total.toLocaleString('en-ZA')
        : '';
    }
  }

  canOptions.forEach(function (option) {
    var check = option.querySelector('.can-check');
    var qtyInput = option.querySelector('.can-qty');

    check.addEventListener('change', updateSelectedSummary);

    qtyInput.addEventListener('input', function () {
      updateSelectedSummary();
    });

    qtyInput.addEventListener('change', function () {
      updateSelectedSummary();
    });

    /*
     * Quantity controls are inside the checkbox label.
     * Prevent label activation when the customer interacts
     * with the quantity field, otherwise the checkbox can
     * toggle off and the quantity field becomes unusable.
     */
    qtyInput.addEventListener('mousedown', function (event) {
      event.stopPropagation();
    });

    qtyInput.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      qtyInput.focus();
    });
  });

  /* Clicking a price card selects that cylinder and scrolls to the order form. */
  document.querySelectorAll('.price-card').forEach(function (card) {
    card.addEventListener('click', function (event) {
      var size = card.getAttribute('data-size');
      var target = Array.prototype.find.call(
        document.querySelectorAll('.can-check'),
        function (checkbox) {
          return checkbox.value === size;
        }
      );

      if (target) {
        event.preventDefault();
        target.checked = true;

        var option = target.closest('.can-option');
        var qtyInput = option.querySelector('.can-qty');
        qtyInput.value = 1;

        updateSelectedSummary();

        var orderSection = document.getElementById('order');
        if (orderSection) {
          orderSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  var form = document.getElementById('order-form');
  var submitBtn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');

  if (!form) {
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var hasSelection = false;
    canOptions.forEach(function (option) {
      if (option.querySelector('.can-check').checked) {
        hasSelection = true;
      }
    });

    if (!hasSelection) {
      status.textContent = 'Please select at least one cylinder size.';
      status.className = 'form-status err';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    status.textContent = 'Sending your order…';
    status.className = 'form-status';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(function (res) {
        if (res.ok) {
          status.textContent = 'Order sent — we’ll be in touch shortly.';
          status.className = 'form-status ok';
          form.reset();
          updateSelectedSummary();
        } else {
          return res.json()
            .catch(function () { return {}; })
            .then(function (data) {
              var message = 'Something went wrong — please WhatsApp us instead.';

              if (data && data.errors && data.errors.length) {
                message = data.errors.map(function (error) {
                  return error.message;
                }).join(' ');
              }

              status.textContent = message;
              status.className = 'form-status err';
            });
        }
      })
      .catch(function () {
        status.textContent = 'Something went wrong — please WhatsApp us instead.';
        status.className = 'form-status err';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send LPG order';
      });
  });

  updateSelectedSummary();
});