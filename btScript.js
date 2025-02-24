document.addEventListener('DOMContentLoaded', () => {
    const cartButtonsContainer = document.getElementById('cart-buttons-container');
    const popupModal = document.getElementById('popup-modal');
    const closeButton = document.querySelector('.close-button');
    const timerOptions = document.querySelectorAll('.timer-option');
    const cartButtons = document.querySelectorAll('.cart-button-grid');

    let selectedCartNumber = null;
    let timers = {};

    function openTimerPopup(cartNumber) {
        selectedCartNumber = cartNumber;
        popupModal.style.display = 'block';
    }

    function closeTimerPopup() {
        popupModal.style.display = 'none';
    }

    function startTimer(durationMinutes) {
        if (!selectedCartNumber) return;

        const endTime = Date.now() + durationMinutes * 60 * 1000;
        timers[selectedCartNumber] = { endTime: endTime };

        saveTimers();
        updateTimerDisplay(selectedCartNumber, endTime);
        scheduleNotification(endTime, selectedCartNumber);
        closeTimerPopup();

        const button = document.querySelector(`.cart-button-grid[data-cart-number="${selectedCartNumber}"]`);
        if (button) {
            button.disabled = true;
        }
    }

    function updateTimerDisplay(cartNumber, endTime) {
      let timerDisplay = document.getElementById(`timer-${cartNumber}`);
      if (endTime <= Date.now() || !endTime) {

        if (timerDisplay) {
          timerDisplay.remove();
        }
        return; 
      }

      if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = `timer-${cartNumber}`;
        const cartButton = document.querySelector(`.cart-button-grid[data-cart-number="${cartNumber}"]`);
        if (cartButton) {
          cartButton.parentNode.insertBefore(timerDisplay, cartButton.nextSibling);
        }
      }
      function updateDisplay() {
        const timeLeft = endTime - Date.now();
        if (timeLeft <= 0) {
          timerDisplay.textContent = "Timp expirat!";
          clearInterval(intervalId);
          delete timers[cartNumber];
          saveTimers();
          resetButton(cartNumber); 
          return;
        }

        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        timerDisplay.textContent = `Timp rămas: ${minutes}m ${seconds}s`;
      }

        updateDisplay();
        const intervalId = setInterval(updateDisplay, 1000);
    }

    function scheduleNotification(endTime, cartNumber) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    const delay = endTime - Date.now();
                    if (delay > 0) {
                        setTimeout(() => {
                            new Notification("Timpul a expirat!", {
                                body: `Timpul pentru cartul ${cartNumber} a expirat!`,
                                icon: 'icon.png'
                            });
                        }, delay);
                    }
                }
            });
        }
    }

    function saveTimers() {
        localStorage.setItem('cartTimers', JSON.stringify(timers));
    }

    function loadTimers() {
        const storedTimers = localStorage.getItem('cartTimers');
        if (storedTimers) {
            timers = JSON.parse(storedTimers);
            for (const cartNumber in timers) {
                if (timers.hasOwnProperty(cartNumber)) {
                    const endTime = timers[cartNumber].endTime;
                    updateTimerDisplay(cartNumber, endTime);
                    const button = document.querySelector(`.cart-button-grid[data-cart-number="${cartNumber}"]`);
                    if(endTime > Date.now()) {
                        button.disabled = true;
                    }
                    scheduleNotification(endTime, cartNumber);
                }
            }
        }
    }

    function resetButton(cartNumber) {
        const button = document.querySelector(`.cart-button-grid[data-cart-number="${cartNumber}"]`);
        if (button) {
            button.disabled = false;
            button.textContent = cartNumber; 
        }
    }

    cartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cartNumber = button.dataset.cartNumber;
            openTimerPopup(cartNumber);
        });
    });

    closeButton.addEventListener('click', closeTimerPopup);

    timerOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const duration = parseFloat(event.target.dataset.duration);
            startTimer(duration);
        });
    });

    loadTimers();
});