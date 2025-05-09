// Global variables for translation
var gtTranslateSettings = {
  initialized: false,      // Tracks if Google Translate has been initialized
  defaultLanguage: 'en',  // Default language (English)
  includeLanguages: 'en,fr,pt', // Supported languages: English, French, Portuguese
  currentLanguage: null,  // Currently selected language
  isChanging: false      // Flag to prevent multiple simultaneous translations
};

// Custom logger that only logs in debug mode
function log() {
  if (window.gtTranslateDebug === true) {
    console.log.apply(console, arguments);
  }
}

function logError() {
  if (window.gtTranslateDebug === true) {
    console.error.apply(console, arguments);
  }
}

// Initialize the translation elements
function initGoogleTranslate() {
  // Create a hidden Google Translate element if it doesn't exist
  if (!document.getElementById('google_translate_element2')) {
    var element = document.createElement('div');
    element.id = 'google_translate_element2';
    element.style.display = 'none';
    document.body.appendChild(element);
  }
  
  // Load Google Translate script if not already loaded
  if (typeof window.googleTranslateElementInit2 !== 'function') {
    window.googleTranslateElementInit2 = function() {
      // Initialize Google Translate with our custom settings
      new google.translate.TranslateElement({
        pageLanguage: gtTranslateSettings.defaultLanguage,
        includedLanguages: gtTranslateSettings.includeLanguages,
        autoDisplay: false, // Don't show Google's default UI
        gaTrack: false,     // Disable Google Analytics tracking
        floatPosition: 0,   // Disable floating translation button
        disableAutoTranslation: true, // Disable automatic translation
        disableTrns: true,  // Try to disable additional features
        multilanguagePage: true // Indicate we control the language UI
      }, 'google_translate_element2');
      
      gtTranslateSettings.initialized = true;
      log("Google Translate Element initialized");
      
      // Apply the initial language from cookies if needed
      setTimeout(function() {
        var storedLang = readCookieLanguage();
        log("Checking for stored language:", storedLang);
        
        if (storedLang && storedLang !== 'en') {
          log("Applying stored language from cookie:", storedLang);
          doGTranslate(storedLang);
        }
      }, 1000);
    };
  }
  
  // Load the Google Translate script
  if (!document.getElementById('google_translate_script')) {
    var script = document.createElement('script');
    script.id = 'google_translate_script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
    script.async = true;
    document.body.appendChild(script);
    log("Google Translate script loaded");
  }
}

// Read the current language from the cookie
function readCookieLanguage() {
  var match = document.cookie.match('(^|;) ?googtrans=([^;]*)(;|$)');
  return match ? match[2].split('/')[2] : gtTranslateSettings.defaultLanguage;
}

// Fire an event on an element
function fireEvent(element, event) {
  log("Firing " + event + " event on", element);
  try {
    if (document.createEventObject) {
      var evt = document.createEventObject();
      element.fireEvent('on' + event, evt);
    } else {
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent(event, true, true);
      element.dispatchEvent(evt);
    }
  } catch (e) {
    logError("Error firing event:", e);
  }
}

// Set cookies for the language
function setLanguageCookies(lang) {
  // For English, remove all translation cookies
  if (lang === 'en') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + location.hostname;
  } else {
    // For other languages, set cookies at multiple levels to ensure they work
    document.cookie = 'googtrans=/en/' + lang + '; path=/;';
    document.cookie = 'googtrans=/en/' + lang + '; path=/; domain=' + location.hostname;
    document.cookie = 'googtrans=/en/' + lang + '; path=/; domain=.' + location.hostname;
  }
}

// Main translation function
function doGTranslate(lang) {
  log("doGTranslate called with:", lang);
  
  // Prevent multiple simultaneous translation attempts
  if (gtTranslateSettings.isChanging) {
    log("Translation already in progress, ignoring request");
    return;
  }
  
  gtTranslateSettings.isChanging = true;
  
  // Special handling for English - reset to original language
  if (lang === 'en') {
    resetTranslation();
    return;
  }
  
  // Setting the cookie first is important
  setLanguageCookies(lang);
  gtTranslateSettings.currentLanguage = lang;
  
  // Find the Google Translate combo box
  var foundCombo = false;
  var teCombo = null;
  
  var selects = document.getElementsByTagName('select');
  for (var i = 0; i < selects.length; i++) {
    if (selects[i].className.indexOf('goog-te-combo') != -1) {
      teCombo = selects[i];
      foundCombo = true;
      break;
    }
  }
  
  if (!foundCombo) {
    log("Google Translate combo not found, waiting...");
    setTimeout(function() {
      gtTranslateSettings.isChanging = false;
      doGTranslate(lang);
    }, 500);
    return;
  }
  
  log("Google Translate combo found, setting value to:", lang);
  teCombo.value = lang;
  fireEvent(teCombo, 'change');
  fireEvent(teCombo, 'change');
  
  // Update active state of buttons to reflect current language
  $('.translate-btn').removeClass('active');
  $('.translate-btn[data-lang="' + lang + '"]').addClass('active');
  
  setTimeout(function() {
    gtTranslateSettings.isChanging = false;
    var cookieLang = readCookieLanguage();
    log("After translation, cookie language is:", cookieLang);
    
    if (cookieLang !== lang) {
      log("Cookie didn't update correctly, forcing cookie update");
      setLanguageCookies(lang);
    }
  }, 1000);
}

// Reset translation to original language (English)
function resetTranslation() {
  log("Resetting translation to original language");
  setLanguageCookies('en');
  
  var foundCombo = false;
  var teCombo = null;
  
  var selects = document.getElementsByTagName('select');
  for (var i = 0; i < selects.length; i++) {
    if (selects[i].className.indexOf('goog-te-combo') != -1) {
      teCombo = selects[i];
      foundCombo = true;
      break;
    }
  }
  
  if (foundCombo && teCombo) {
    log("Found Google Translate combo, resetting to English");
    teCombo.value = 'en';
    fireEvent(teCombo, 'change');
    fireEvent(teCombo, 'change');
  }
  
  // Update active state of buttons to show English as selected
  $('.translate-btn').removeClass('active');
  $('.translate-btn[data-lang="en"]').addClass('active');
  
  // Try to reset using Google Translate API if available
  try {
    if (window.google && google.translate) {
      if (google.translate.TranslateElement && google.translate.TranslateElement.getInstance) {
        var te = google.translate.TranslateElement.getInstance();
        if (te) {
          log("Found TranslateElement instance");
          if (typeof te.restore === 'function') {
            log("Using restore() method");
            te.restore();
          } else if (typeof te.reset === 'function') {
            log("Using reset() method");
            te.reset();
          }
        }
      }
    }
  } catch (e) {
    logError("Error resetting translation:", e);
  }
  
  gtTranslateSettings.currentLanguage = 'en';
  
  // Remove any Google Translate UI elements
  try {
    $('.goog-te-banner-frame').remove();
    $('.goog-te-menu-frame').remove();
    $('iframe.goog-te-menu-frame').remove();
    $('iframe.skiptranslate').remove();
  } catch (e) {
    logError("Error removing Google frames:", e);
  }
  
  setTimeout(function() {
    gtTranslateSettings.isChanging = false;
  }, 1000);
}

// Ensures Google Translate doesn't translate our interface elements
function preventTranslation() {
  log("Setting up translation prevention");
  
  // Add CSS to hide Google Translate elements
  var css = document.createElement('style');
  css.type = 'text/css';
  css.innerHTML = 'div.skiptranslate, #google_translate_element2 { display: none !important; }' +
                  'body { top: 0 !important; }' +
                  'font { background-color: transparent !important; box-shadow: none !important; }';
  document.getElementsByTagName('head')[0].appendChild(css);
  
  // Add notranslate class to our language buttons
  $('.translate-button-group, .translate-btn').addClass('notranslate');
  
  // Use MutationObserver to prevent Google Translate from modifying our UI
  if (window.MutationObserver) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Check for added nodes
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            var node = mutation.addedNodes[i];
            
            // Remove Google highlight classes
            if (node.classList && node.classList.contains('goog-text-highlight')) {
              node.classList.remove('goog-text-highlight');
            }
            
            // Hide Google's dictionary popups
            if (node.id === 'goog-gt-tt' || 
                (node.classList && node.classList.contains('goog-te-balloon-frame'))) {
              node.style.display = 'none';
              node.style.visibility = 'hidden';
            }
          }
        }
        
        // Check for attribute changes that might be Google adding highlights
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          var node = mutation.target;
          if (node.classList && node.classList.contains('goog-text-highlight')) {
            node.classList.remove('goog-text-highlight');
          }
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    log("MutationObserver set up for translation prevention");
  }
}

// Initialize when the document is ready
$(document).ready(function() {
  log("Document ready, initializing translate widget");
  
  // Make sure our buttons don't get translated
  $('.translate-button-group, .translate-btn').addClass('notranslate');
  
  // Add click handler to language buttons
  $('.translate-btn').on('click', function(e) {
    e.preventDefault();
    var newLang = $(this).data('lang');
    log("Language button clicked with value:", newLang);
    doGTranslate(newLang);
  });
  
  // Get the current language from cookie
  var currentLang = readCookieLanguage();
  log("Initial language from cookie:", currentLang);
  
  // Initialize Google Translate
  initGoogleTranslate();
  
  // Prevent translation of our UI elements
  preventTranslation();
  
  // Save the current language on unload
  $(window).on('beforeunload', function() {
    if (gtTranslateSettings.currentLanguage) {
      log("Saving current language before unload:", gtTranslateSettings.currentLanguage);
      setLanguageCookies(gtTranslateSettings.currentLanguage);
    }
  });
});
