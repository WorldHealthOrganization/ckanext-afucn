$(document).ready(() => {
    console.log('jQuery loaded here');
     // Get the header element
     const header = $('.main-header');
    
     // Function to handle scroll
     function handleScroll() {
         // Get the current scroll position
         const scrollPosition = $(window).scrollTop();
         
         // Add or remove the sticky class based on scroll position
         if (scrollPosition > 100) {
             header.addClass('header-sticky');
         } else {
             header.removeClass('header-sticky');
         }
     }
     
     // Listen for scroll events
     $(window).on('scroll', handleScroll);
     
     // Initial check
     handleScroll();
 
     // Handle dropdown functionality
     function initializeDropdowns() {
         // Remove any existing event listeners
         $('.dropdown').off('mouseenter mouseleave');
 
         if (window.innerWidth >= 768) {
             // Desktop behavior - hover
             $('.dropdown').on('mouseenter', function() {
                 // Get dropdown toggle and menu
                 const $toggle = $(this).find('.dropdown-toggle');
                 const $menu = $(this).find('.dropdown-menu');
                 
                 // Show dropdown using Bootstrap's dropdown API
                 new bootstrap.Dropdown($toggle[0]).show();
             }).on('mouseleave', function() {
                 // Get dropdown toggle
                 const $toggle = $(this).find('.dropdown-toggle');
                 
                 // Hide dropdown using Bootstrap's dropdown API
                 new bootstrap.Dropdown($toggle[0]).hide();
             });
         }
     }
 
     // Initialize dropdowns
     initializeDropdowns();
 
     // Reinitialize on window resize with debounce
     let resizeTimer;
     $(window).on('resize', function() {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(initializeDropdowns, 250);
     });
  });