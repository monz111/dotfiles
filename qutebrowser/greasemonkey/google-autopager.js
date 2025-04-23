// ==UserScript==
// @name         Google Autopager for qutebrowser
// @version      1.3
// @description  Autopager for Google search (US and Japan) with page separators, page numbers, and toggle button
// @match        *://*.google.com/*
// @match        *://*.google.co.jp/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  // Constants
  const contentSelector = 'div#search'; // Search results container
  const scrollThreshold = 0.8; // Load next page at 80% scroll
  const debugMode = false; // Enable debug logs
  let currentPage = 1; // Current page number
  let isAutoPagerEnabled = true; // AutoPager state

  // Debug logging function
  function log(...args) {
    if (debugMode) {
      console.log(...args);
    }
  }

  // Styles for separator, page number, and toggle button
  const styles = `
        .autopager-separator {
            border: 0;
            height: 2px;
            background: #ccc;
            margin: 20px 0;
            position: relative;
        }
        .autopager-page-number {
            font-size: 14px;
            color: #666;
            margin: 10px 0 5px 10px;
            display: block;
        }
        .autopager-toggle-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 15px;
            background: #0078d4;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
            opacity: 0.9;
        }
        .autopager-toggle-button:hover {
            background: #005ba1;
        }
        .autopager-toggle-button.off {
            background: #666;
        }
    `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'autopager-toggle-button';
  toggleButton.textContent = 'AutoPager ON';
  document.body.appendChild(toggleButton);

  // Scroll handler
  function scrollHandler() {
    if (!isAutoPagerEnabled) return;
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    log('Scroll check:', scrollPosition, pageHeight);
    if (scrollPosition / pageHeight > scrollThreshold) {
      loadNextPage();
    }
  }

  // Enable/disable scroll listener
  function setScrollListener(enabled) {
    if (enabled) {
      window.addEventListener('scroll', scrollHandler);
    } else {
      window.removeEventListener('scroll', scrollHandler);
    }
  }

  // Toggle button click handler
  toggleButton.addEventListener('click', () => {
    isAutoPagerEnabled = !isAutoPagerEnabled;
    toggleButton.textContent = `AutoPager ${isAutoPagerEnabled ? 'ON' : 'OFF'}`;
    toggleButton.classList.toggle('off', !isAutoPagerEnabled);
    setScrollListener(isAutoPagerEnabled);
    log('AutoPager toggled:', isAutoPagerEnabled ? 'ON' : 'OFF');
  });

  // Load next page
  function loadNextPage() {
    // Get query parameters from current URL
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const query = searchParams.get('q'); // Search query
    if (!query) {
      log('No query found in URL');
      return;
    }

    // Calculate next page number (start=10,20,30,...)
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * 10;
    searchParams.set('start', startIndex);
    const nextUrl = url.origin + url.pathname + '?' + searchParams.toString();
    log('Fetching:', nextUrl);

    GM_xmlhttpRequest({
      method: 'GET',
      url: nextUrl,
      onload: function (response) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.responseText, 'text/html');
        const newContent = doc.querySelector(contentSelector);
        if (newContent) {
          const targetNode = document.querySelector(contentSelector) || document.body;
          // Add page number element
          currentPage = nextPage;
          const pageNumber = document.createElement('div');
          pageNumber.className = 'autopager-page-number';
          pageNumber.textContent = `Page ${currentPage}`;
          targetNode.appendChild(pageNumber);
          // Add separator
          const separator = document.createElement('hr');
          separator.className = 'autopager-separator';
          targetNode.appendChild(separator);
          // Add content
          targetNode.appendChild(newContent);
          log(
            'Appended page number (Page ' + currentPage + '), separator, and content from:',
            nextUrl
          );
        } else {
          log('No content found for selector:', contentSelector);
        }
      },
    });
  }

  // Initialize
  setScrollListener(true);
  log('Autopager initialized for:', window.location.href);
})();
