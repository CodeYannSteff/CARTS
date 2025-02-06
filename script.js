document.addEventListener('DOMContentLoaded', () => {
    const cartButtons = document.querySelectorAll('.cart-button');

    cartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.classList.add('animate');

            setTimeout(() => {
                event.target.classList.remove('animate');
                alert("Cart selected! (Navigation would occur here)");
            }, 500);
        });
    });
});