// Ensure all product images have consistent dimensions
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown hover effect
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('mouseenter', function() {
        const dropdownMenu = this.querySelector('.dropdown-menu');
        if (dropdownMenu) {
          dropdownMenu.style.opacity = '1';
          dropdownMenu.style.visibility = 'visible';
        }
      });

      dropdown.addEventListener('mouseleave', function() {
        const dropdownMenu = this.querySelector('.dropdown-menu');
        if (dropdownMenu) {
          dropdownMenu.style.opacity = '0';
          dropdownMenu.style.visibility = 'hidden';
        }
      });
    });
  });