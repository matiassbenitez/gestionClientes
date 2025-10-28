function debounce(func, delay) {
      let timeoutId; // Variable para almacenar el ID del temporizador

      // Esta es la función que se llamará en el evento 'input'
      return function() {
          // 'this' y 'arguments' capturan el contexto y los argumentos del evento
          const context = this;
          const args = arguments;

          // 1. Limpiar el temporizador anterior
          // Esto cancela la llamada anterior si el usuario sigue escribiendo
          clearTimeout(timeoutId);

          // 2. Establecer un nuevo temporizador
          // La función original (func) se ejecutará solo después del 'delay'
          timeoutId = setTimeout(() => {
              func.apply(context, args);
          }, delay);
      };
  }