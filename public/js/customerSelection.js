document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('customerSelected', (event) => {
    const customerId = event.detail.id;
    if (customerId) {
      console.log('Customer selected with ID:', customerId);
      window.location.href = `/customers/${customerId}`;

    } else {
      console.log('else selected');
      console.error('No customer ID provided in the event detail.');
    }
  });
});