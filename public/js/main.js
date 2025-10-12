function goBackOrHome() {
  if (window.history.length > 1) {
    // Si hay una página de referencia (historial), vuelve.
    window.history.back();
  } else {
    // Si no hay historial, ve a la página de inicio.
    window.location.href = '/'; // Cambia '/home' por tu URL de inicio
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('backButton');
  const typeSelect = document.getElementById('type');
  const methodContainer = document.getElementById('method-container');
  const methodSelect = document.getElementById('method');

  if (backButton) {
    backButton.addEventListener('click', function(event) {
      event.preventDefault();
      goBackOrHome();
    });
  }
});