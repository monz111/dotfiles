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

  const adSkipper = document.createElement('div');
  adSkipper.textContent = 'Ad Skipper';
  adSkipper.style.padding = '10px';
  adSkipper.style.backgroundColor = '#1d1b1b';
  adSkipper.style.color = '#f1f1f1';
  adSkipper.style.margin = '5px 0';
  adSkipper.style.borderRadius = '5px';

  const mastheadContainer = document.querySelector('#start');
  mastheadContainer.after(adSkipper);

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
