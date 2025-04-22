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

  // 補助的なCSSで広告オーバーレイを非表示
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
  console.log('Ver.2');

  // 広告検出とスキップ処理
  const skipAd = () => {
    const activeVideo = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (!activeVideo) return;

    const isAd = activeVideo.querySelector(
      'ytd-ad-slot-renderer, .badge-shape-wiz--ad, [class*="sponsored"]'
    );

    if (isAd) {
      // 次の動画にスクロール
      const nextVideo = activeVideo.nextElementSibling;
      activeVideo.remove();
      if (nextVideo && nextVideo.tagName === 'YTD-REEL-VIDEO-RENDERER') {
        nextVideo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('Ad detected, scrolled to next Short');
      } else {
        console.log('Next video not found');
      }
    }
  };

  // 動的変更を監視
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length || mutation.removedNodes.length) {
        skipAd();
      }
    });
  });

  // Shortsページ全体を監視
  observer.observe(document.body, { childList: true, subtree: true });

  // 初回実行と定期チェック
  skipAd();
  setInterval(skipAd, 5000); // 500msごとにチェック
})();
