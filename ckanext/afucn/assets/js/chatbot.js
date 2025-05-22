document.addEventListener('DOMContentLoaded', function() {
    // Open/Close widget logic
    document.getElementById('who-chatbot-open').onclick = function() {
    document.getElementById('who-chatbot-frame-container').style.display = 'flex';
    document.getElementById('who-chatbot-open').style.display = 'none';
    };
    document.getElementById('who-chatbot-close').onclick = function() {
    document.getElementById('who-chatbot-frame-container').style.display = 'none';
    document.getElementById('who-chatbot-open').style.display = 'inline-block';
    };

    // Check iframe embedding
    window.addEventListener('DOMContentLoaded', function() {
    var iframe = document.getElementById('who-chatbot-iframe');
    var fallback = document.getElementById('who-chatbot-fallback');
    // Try to detect if iframe loaded or failed (will be blocked by browser)
    iframe.onload = function() {
        // If it loads, hide fallback
        fallback.style.display = 'none';
        iframe.style.display = 'block';
    };
    iframe.onerror = function() {
        // If error, show fallback
        fallback.style.display = 'block';
        iframe.style.display = 'none';
    };
    // Extra check: some browsers block before onerror fires
    setTimeout(function() {
        if (iframe.contentDocument === null || iframe.contentWindow.location.href === 'about:blank') {
        fallback.style.display = 'block';
        iframe.style.display = 'none';
        }
    }, 1500);
    });
});