// ==UserScript==
// @name         YouTube Shorts AdBlock with is-active Attribute
// @namespace    monz
// @version      0.5
// @description  Skip YouTube Shorts ads based on is-active attribute and ad-specific elements
// @match        https://www.youtube.com/shorts/*
// @match        https://youtu.be/*
// ==/UserScript==

(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
        ytd-ad-slot-renderer,
        .badge-shape-wiz--ad,
        [class*="sponsored"],
        [aria-label*="advertisement"] {
            display: none !important;
        }
    `;
  document.head.appendChild(style);
  console.log('[Youtube Shorts AD Skipper] Ver.3');

  const skipAd = () => {
    const activeVideo = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (!activeVideo) return;

    const isAd = activeVideo.querySelector(
      'ytd-ad-slot-renderer, .badge-shape-wiz--ad, [class*="sponsored"]'
    );

    if (isAd) {
      const parentVideo = activeVideo.closest('.reel-video-in-sequence-new');
      const nextVideo = parentVideo.nextElementSibling;
      if (nextVideo) {
        nextVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('Ad detected, scrolled to next Short');
      } else {
        console.log('Next video not found');
      }
    }
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length || mutation.removedNodes.length) {
        skipAd();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  skipAd();
})();
