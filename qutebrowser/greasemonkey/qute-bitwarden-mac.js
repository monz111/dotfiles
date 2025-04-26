// ==UserScript==
// @name        Bitwarden Account Selector for Mac
// @version     0.2
// @description Bitwarden-like account selector for qutebrowser
// @author      monz111
// @match       *://*/*
// @run-at      document-idle
// @require     https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

(function () {
  'use strict';
  console.log('loaded Bitwarden');

  // Debug mode - set to false to disable console logs
  const DEBUG = true;

  // Configuration
  const CONFIG = {
    maxVisibleItems: 3,
    styles: {
      colors: {
        background: '#1e2130',
        border: '#2a2f40',
        highlight: '#2a3145',
        text: '#ffffff',
        subtext: '#a0a0b0',
        scrollbar: {
          thumb: '#3b97e3',
          track: '#1e2130',
        },
      },
    },
  };

  let state = {
    bitwardenData: null,
    selectedIndex: 0,
    ignoreTimeout: 3000,
    lastOpenVaultTime: null,
  };

  // Sample account data - will be replaced by bitwardenData if available
  const defaultAccounts = [
    { title: 'サポートアカウント', email: 'support@airy-hr.com' },
    { title: 'yuya.monzen@', email: 'yuya.monzen@edge-inc.co.jp' },
    { title: '+1', email: 'yuya.monzen+1@edge-inc.co.jp' },
    { title: 'テストアカウント', email: 'test@example.com' },
    { title: '開発用アカウント', email: 'dev@example.com' },
    { title: '管理者アカウント', email: 'admin@example.com' },
  ];

  const fieldSelectors = {
    username: [
      'input[name="username"]',
      'input[name="email"]',
      'input[name="user"]',
      'input[name="login"]',
      'input[name="userid"]',
      'input[name="user_id"]',
      'input[type="email"]',
      'input[id*="username"]',
      'input[id*="email"]',
      'input[id*="user"]',
      'input[aria-label*="username" i]',
      'input[aria-label*="email" i]',
    ],
    password: [
      'input[name="password"]',
      'input[name="pass"]',
      'input[name="pwd"]',
      'input[type="password"]',
      'input[id*="password"]',
      'input[id*="pass"]',
      'input[aria-label*="password" i]',
    ],
  };

  // Logging utility function
  function log(...args) {
    if (DEBUG) {
      console.log('[Bitwarden Account Selector]', ...args);
    }
  }

  /**
   * Handle messages from external sources
   * @param {MessageEvent} event - The message event
   */
  function handleMessage(event) {
    if (!event.data || event.data.type !== 'bitwardenData') return;
    const currentTime = new Date();
    const isOpenVault = event.data.data === 'open-vault';
    log('Message received on:', currentTime.toLocaleString());

    try {
      //To display credentials immediately when account data is already provided
      if (isOpenVault) {
        if (!state.bitwardenData) {
          return;
        }
        state.lastOpenVaultTime = currentTime;
      }

      if (!state.bitwardenData) {
        log('Received account data');
        state.bitwardenData = Array.isArray(event.data.data) ? event.data.data : null;
      }

      if (
        !isOpenVault &&
        state.lastOpenVaultTime &&
        currentTime - state.lastOpenVaultTime < state.ignoreTimeout
      ) {
        const sec = (
          (state.ignoreTimeout - (currentTime - state.lastOpenVaultTime)) /
          1000
        ).toFixed(1);
        log(`Message skipped because of the ignore period. Time left: [${sec}] seconds.`);
        return;
      }

      // Find and show account list for the appropriate input field
      const activeInput = $('input:focus');
      if (activeInput.length) {
        showAccountList(activeInput);
      } else {
        const firstInput = $(
          'input[type="text"], input[type="email"], input[type="password"]'
        ).first();
        if (firstInput.length) {
          showAccountList(firstInput);
        } else {
          // No input found - show centered message
          const $container = createContainer(null, true);
          $container.append(createNoInputMessage());
        }
      }
    } catch (e) {
      console.error('Failed to process account data:', e);
    }
  }

  const bitwardenIcon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACZUExURQAAAP///////////////////////////////////////////////////////////////////////////xdd3CVn3iVo3iZn3jRx4DRx4UN74kN741GF5V+Q52CP52CQ526Z6W6a6X2j632k632k7Iuu7Yuu7pm475m48Jq476jC8rbM9LfM9MXX9tPh+NTh+OLr+/H1/f///72ZZPIAAAAUdFJOUwAQIDBAUF9gb3CPkJ+gr7C/z9/vMBy4TQAAC29JREFUeNrt3Wtf2zgWB2CFpsOmMJRLQmGb6XJpgLINTfz9P9y+6PS3M70MibFjSef5fwAcdB5LR7IDKW2U0Xjy5ujk9KyR7HN2enz0ZjIepa4y2j88Nazl5eRwf6+D6k+ODWW5OX6hgbHqF5+j1+1vfjN/FTndb1X/f+n4IhMYu/sjE9g7MmS15XCLdvA3s3/kSWD0xmDVmTcbHQ7tWf3rnQQ2WAZemf5rFvDq2eXfINWd357Z/Buh2jNRfwLM/1aBn/Z/xiZGXtn/xc7ZT3eDI/WPsxv82YmQ879AefNj/feNSuhGUAMQvA04NCaxcmQBCJ7x3wBYAOLtBEwAwTMxAQTvA0cmAFOACUAXkNJrYxF7I+Ad8KA5/vMQ0EhEzUgLqA1MyTeAY68BVoDga4AVIHD2PQeMncOU0olhiJvTlEZGIXYTMDYIkTNOE4MQ+yTgwCBEzoEHAbHz1jlg7Jx4FyD6PtAfBAmds2QMYgcAAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEAAEAAFAABAABAABQAAQAAQAAUAAEACkcADr+w+X04B5/+FxBUCzupoGztUqOoCH2TR03j3EBnA3DZ+7yADUf3ABgwJ4UP3pdDp9iApgNVP86XQ6fbcKCuBK7f/cC8QEsFL5b1mHBPCo8N9yHxLAXOG/5T8hAVwq/LdchASg7v8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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';

  /**
   * Create an overlay element that covers the whole page
   * @return {jQuery} - The overlay element
   */
  function createOverlay() {
    // Remove existing overlay if any
    $('#qute-bitwarden-overlay').remove();

    const $overlay = $('<div>', {
      id: 'qute-bitwarden-overlay',
      css: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        backgroundColor: 'rgba(0,0,0,0.01)', // Nearly transparent but captures clicks
      },
    });

    // Close dropdown when overlay is clicked
    $overlay.on('click', removeUI);

    $('body').append($overlay);
    return $overlay;
  }

  /**
   * Remove all UI elements (overlay and account list)
   */
  function removeUI() {
    $('#qute-bitwarden-account-list, #qute-bitwarden-overlay').remove();
  }

  /**
   * Get account data to display
   * @return {Array} - Account data to display
   */
  function getAccounts() {
    return state.bitwardenData || defaultAccounts;
  }

  /**
   * Create a container for the account list
   * @param {DOMRect} inputRect - The rectangle of the input field
   * @param {boolean} isFixed - Whether to use fixed positioning
   * @return {jQuery} - The container element
   */
  function createContainer(inputRect, isFixed = false) {
    const colors = CONFIG.styles.colors;

    // Remove existing container if any
    $('#qute-bitwarden-account-list').remove();

    const containerProps = {
      id: 'qute-bitwarden-account-list',
      css: {
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: isFixed ? 'fixed' : 'absolute',
        zIndex: 9999,
        fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        color: colors.text,
        overflowY: 'auto',
        maxHeight: '300px', // Initial value
      },
    };

    // If we have inputRect, position relative to it
    if (inputRect) {
      Object.assign(containerProps.css, {
        width: inputRect.width + 'px',
        top: (isFixed ? inputRect.bottom + 5 : inputRect.bottom + window.scrollY + 5) + 'px',
        left: (isFixed ? inputRect.left : inputRect.left + window.scrollX) + 'px',
      });
    } else if (isFixed) {
      // Center the container if no input
      Object.assign(containerProps.css, {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
      });
    }

    const $container = $('<div>', containerProps);

    // Prevent click propagation
    $container.on('click', (e) => e.stopPropagation());

    // Add scrollbar styles
    addScrollbarStyles();

    $('body').append($container);
    return $container;
  }

  /**
   * Add scrollbar styles to document
   */
  function addScrollbarStyles() {
    const colors = CONFIG.styles.colors;

    // Only add styles once
    if (!$('#qute-bitwarden-scrollbar-styles').length) {
      $('<style id="qute-bitwarden-scrollbar-styles">')
        .text(`
          #qute-bitwarden-account-list::-webkit-scrollbar {
            width: 6px;
          }
          #qute-bitwarden-account-list::-webkit-scrollbar-track {
            background: ${colors.scrollbar.track};
          }
          #qute-bitwarden-account-list::-webkit-scrollbar-thumb {
            background-color: ${colors.scrollbar.thumb};
            border-radius: 6px;
          }
          .qute-bitwarden-link:focus-visible, .qute-bitwarden-link:focus {
            outline: 1px dotted #ccc;
          }
        `)
        .appendTo('head');
    }
  }

  /**
   * 指定されたセレクタリストから最初の有効な入力フィールドを取得
   * @param {string[]} selectors - セレクタの配列
   * @returns {jQuery} 見つかった入力フィールド（または空のjQueryオブジェクト）
   */
  function findInputField(selectors) {
    for (const selector of selectors) {
      const $input = $(selector).first();
      if ($input.length) return $input;
    }
    return $();
  }

  /**
   * 入力フィールドに値を設定し、結果をログ出力
   * @param {string} fieldName - フィールド名（ログ用）
   * @param {jQuery} $input - 対象のjQuery入力要素
   * @param {string} value - 設定する値
   */
  function fillInputField(fieldName, $input, value) {
    if ($input.length) {
      $input.each(function () {
        // ネイティブのvalueセッターを使用して値を設定
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });

        // Reactの状態を更新するために、値をセットしてイベントを発火
        nativeInputValueSetter.call(this, value);
        this.dispatchEvent(inputEvent);
        this.dispatchEvent(changeEvent);

        // 保険としてjQueryのval()でも値を設定
        $(this).val(value);
      });

      log(`${fieldName} input found and filled:`, $input);
    } else {
      console.warn(`${fieldName} input not found.`);
    }
  }

  /**
   * name属性に基づいて入力フィールドを取得
   * @param {string} name - inputのname属性値
   * @returns {jQuery} 見つかった入力フィールド（または空のjQueryオブジェクト）
   */
  const findInputByName = (name) => {
    const $input = $(`input[name="${name}"]`).first();
    return $input.length ? $input : $();
  };

  /**
   * カスタムフィールドを処理
   * @param {Array} fields - カスタムフィールドの配列
   */
  const processCustomFields = (fields) => {
    fields.forEach(({ name, value }) => {
      const $input = findInputByName(name);
      fillInputField(name.charAt(0).toUpperCase() + name.slice(1), $input, value);
    });
  };

  /**
   * フォームの自動入力処理
   * @param {Object} data - アカウントデータ
   */
  function autoFillForm({ username, password, fields }) {
    const selectors = fieldSelectors;
    const $usernameInput = findInputField(selectors.username);
    const $passwordInput = findInputField(selectors.password);

    fillInputField('Username', $usernameInput, username);
    fillInputField('Password', $passwordInput, password);

    if (fields?.length) {
      processCustomFields(fields);
    }
  }

  /**
   * Create an item for the account list
   * @param {object} account - Account data
   * @param {number} index - Index of the account
   * @param {number} total - Total number of accounts
   * @param {jQuery} $input - The input field
   * @return {jQuery} - The created item
   */
  function createAccountItem(account, index, total, $input) {
    const colors = CONFIG.styles.colors;
    const isSelected = index === state.selectedIndex;

    const $item = $('<div>', {
      class: 'qute-bitwarden-list-item',
    }).css({
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      borderBottom: index === total - 1 ? 'none' : `1px solid ${colors.border}`,
      backgroundColor: isSelected ? colors.highlight : 'transparent',
    });

    // Icon
    const $iconWrapper = $('<div>', {
      class: 'qute-bitwarden-icon-wrapper',
    });

    const $icon = $('<div>', {
      class: 'qute-bitwarden-icon',
    })
      .css({
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px',
      })
      .append(
        $('<object>', {
          type: 'image/png',
        })
          .attr('data', `https://icons.bitwarden.net/${account.origin}/icon.png`)
          .css({
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            objectFit: 'contain',
          })
          .append(
            $('<img>', {
              src: bitwardenIcon,
              css: {
                width: '100%',
                height: '100%',
                borderRadius: '6px',
                objectFit: 'contain',
              },
            })
          )
      );
    $iconWrapper.append($icon);

    // Text content
    const $textWrapper = $('<div>', {
      class: 'qute-bitwarden-text-wrapper',
    });

    const $title = $('<div>', {
      class: 'qute-bitwarden-title',
    })
      .css({
        fontSize: '15px',
        fontWeight: 600,
        color: colors.text,
        marginBottom: '2px',
      })
      .text(account.name || '');

    const $email = $('<div>', {
      class: 'qute-bitwarden-email',
    })
      .css({
        fontSize: '13px',
        color: colors.subtext,
      })
      .text(account.username || '');

    $textWrapper.append($title, $email);

    // Clickable link
    const $link = $('<a>', {
      class: 'qute-bitwarden-link',
      href: '#',
    }).css({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    });

    $link.on('click', function (e) {
      e.preventDefault();
      autoFillForm(account);
      removeUI();
    });

    $item.append($iconWrapper, $textWrapper, $link);
    return $item;
  }

  /**
   * Update selection highlighting in the account list
   * @param {jQuery} $list - The list container
   */
  function updateSelection($list) {
    const colors = CONFIG.styles.colors;

    $list.children().each(function (i) {
      $(this).css('backgroundColor', i === state.selectedIndex ? colors.highlight : 'transparent');
    });

    // Ensure selected item is visible
    const $selected = $list.children().eq(state.selectedIndex);
    if ($selected.length) {
      const listHeight = $list.height();
      const itemHeight = $selected.outerHeight();
      const itemTop = $selected.position().top;

      if (itemTop < 0) {
        $list.scrollTop($list.scrollTop() + itemTop);
      } else if (itemTop + itemHeight > listHeight) {
        $list.scrollTop($list.scrollTop() + itemTop + itemHeight - listHeight);
      }
    }
  }

  /**
   * Show account list dropdown
   * @param {jQuery} $input - The input field to show accounts for
   */
  function showAccountList($input) {
    removeUI(); // Clear any existing UI
    createOverlay();

    const accounts = getAccounts();

    const inputRect = $input[0].getBoundingClientRect();
    const $container = createContainer(inputRect);

    if (accounts && accounts.length > 0) {
      let $firstItem = null;

      // Add accounts to list
      $.each(accounts, function (i, account) {
        if (!account) return; // Skip undefined accounts

        const $item = createAccountItem(account, i, accounts.length, $input);
        $container.append($item);

        if (i === 0) $firstItem = $item;
      });

      // Calculate and set container height based on item height
      if ($firstItem) {
        const itemHeight = $firstItem.outerHeight();
        if (itemHeight) {
          const maxItems = Math.min(CONFIG.maxVisibleItems, accounts.length);
          $container.css('maxHeight', itemHeight * maxItems + 'px');

          // Focus first item
          setTimeout(function () {
            const $firstLink = $firstItem.find('a');
            if ($firstLink.length) $firstLink.focus();
          }, 50);
        }
      }
    } else {
      // No accounts available
      $container.append(createNoAccountsMessage());
    }
    log('Account list displayed');
  }

  /**
   * Create a "no accounts" message element
   * @return {jQuery} - The message element
   */
  function createNoAccountsMessage() {
    const $message = $('<div>', {
      class: 'qute-bitwarden-message',
    })
      .css({
        padding: '15px',
        fontSize: '16px',
        textAlign: 'center',
        color: CONFIG.styles.colors.text,
      })
      .text('Account not found.');

    setTimeout(() => {
      $message.fadeOut(500, () => {
        $message.remove();
        removeUI();
      });
    }, 2000);

    return $message;
  }

  /**
   * Create a "no input" message element
   * @return {jQuery} - The message element
   */
  function createNoInputMessage() {
    const $message = $('<div>', {
      class: 'qute-bitwarden-message',
    })
      .css({
        padding: '15px',
        fontSize: '16px',
        textAlign: 'center',
        whiteSpace: 'pre-line',
        color: CONFIG.styles.colors.text,
      })
      .text('[bitwarden]\nNo input field was detected.');

    setTimeout(() => {
      $message.fadeOut(500, () => {
        $message.remove();
        removeUI();
      });
    }, 2000);

    return $message;
  }

  /**
   * Handle keyboard navigation
   * @param {Event} e - The keyboard event
   * @return {boolean} - False if the event was handled
   */
  function handleKeyboardNavigation(e) {
    const $list = $('#qute-bitwarden-account-list');
    if (!$list.length) return true;

    const accounts = getAccounts();
    if (!accounts || !accounts.length) return true;

    switch (e.keyCode) {
      case 38: // Up arrow
        e.preventDefault();
        state.selectedIndex = (state.selectedIndex - 1 + accounts.length) % accounts.length;
        updateSelection($list);
        return false;
      case 40: // Down arrow
        e.preventDefault();
        state.selectedIndex = (state.selectedIndex + 1) % accounts.length;
        updateSelection($list);
        return false;
      case 39: // Right arrow
      case 13: // Enter
        e.preventDefault();
        const $selectedItem = $list.children().eq(state.selectedIndex);
        $selectedItem.find('a').trigger('click');
        return false;
      case 37: // Left arrow
      case 27: // Escape
        e.preventDefault();
        e.stopPropagation();
        removeUI();
        return false;
    }

    return true;
  }

  /**
   * Initialize the script
   */
  function initialize() {
    // Register message event listener
    window.addEventListener('message', handleMessage);

    // Add keyboard navigation support
    $(document).on('keydown', handleKeyboardNavigation);
  }

  // Initialize when document is ready
  $(document).ready(initialize);
})();
