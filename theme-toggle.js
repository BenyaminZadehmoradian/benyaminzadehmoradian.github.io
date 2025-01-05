document.addEventListener('DOMContentLoaded', () => {
    const toggleCheckbox = document.querySelector('.toggle-checkbox');
    const body = document.body;

    // Function to apply the theme based on checkbox state
    function applyTheme() {
        if (toggleCheckbox.checked) {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
        }
    }

    // Event listener for checkbox state change
    toggleCheckbox.addEventListener('change', applyTheme);

    // Load and apply the saved theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        toggleCheckbox.checked = savedTheme === 'dark-theme';
    } else {
        // Optionally, set initial theme based on system preference if no saved theme
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        toggleCheckbox.checked = prefersDarkScheme;
        applyTheme();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('load-more');

    loadMoreBtn.addEventListener('click', () => {
        window.location.href = 'details.html'; // Replace 'details.html' with the URL of the detailed page
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleCheckbox = document.querySelector('.toggle-checkbox');
    const body = document.body;
    const loadMoreBtn = document.getElementById('load-more');

    // Function to apply the theme based on checkbox state
    function applyTheme() {
        if (toggleCheckbox.checked) {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
        }
    }

    // Load and apply the saved theme preference on page load
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.classList.add(savedTheme);
            toggleCheckbox.checked = savedTheme === 'dark-theme';
        } else {
            // Set initial theme based on system preference if no saved theme
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            toggleCheckbox.checked = prefersDarkScheme;
            applyTheme();
        }
    }

    // Event listener for theme toggle
    toggleCheckbox.addEventListener('change', applyTheme);

    // Event listener for "Load More" button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            window.location.href = 'details.html'; // Replace with the desired URL
        });
    }

    // Initialize theme on page load
    loadSavedTheme();
});

$('.fade-scroll').css('opacity', function () {
    var elementTop = $(this).offset().top;
    return 1 - Math.min((scrollTop - elementTop + 100) / 10, 1);
});
