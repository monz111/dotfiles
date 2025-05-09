#!/usr/bin/env /usr/local/bin/node

/**
 * Bitwarden Account List for Qutebrowser with Session Persistence
 *
 * This script fetches account credentials for the current site from Bitwarden
 * and displays them in a qutebrowser message. Accounts are filtered to match
 * the exact hostname (including subdomains) of the current page.
 *
 * Requirements:
 * - Node.js
 * - Bitwarden CLI (bw)
 *
 * Usage:
 * :spawn --userscript bitwarden-persistent.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const os = require('os');
const fs = require('fs').promises;

const DEBUG = true;
const COMMAND_TIMEOUT = 10000;
const QUTE_FIFO = process.env.QUTE_FIFO;
const BW_PATHS = [
  '/usr/local/bin/bw',
  '/usr/bin/bw',
  '/opt/homebrew/bin/bw',
  `${os.homedir()}/.n/bin/bw`,
  `${os.homedir()}/.npm-global/bin/bw`,
  `${os.homedir()}/node_modules/.bin/bw`,
];
const currentUrl = process.env.QUTE_URL || '';
const keychainConfig = {
  accountName: 'qute-bitwarden',
  serviceName: 'bw_session',
  expiryServiceName: 'bw_session_expiry',
  sessionTimeout: 6 * 60 * 60 * 1000, // 6 hours
};

async function sendMessage(message, isError = false) {
  if (message != undefined && message != null) {
    const messageType = isError ? 'error' : 'info';
    const sanitizedMessage = message.replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/;/g, ',');
    await fs.access(QUTE_FIFO, fs.constants.W_OK);
    await fs.appendFile(
      QUTE_FIFO,
      `message-${messageType} "[qute-bitwarden] ${sanitizedMessage}"\n`
    );
  }
}

function error(message) {
  log(message, true);
}

function log(message, isError = false) {
  if (DEBUG && message != undefined && message != null) {
    sendMessage(message, isError);
  }
}

/**
 * Find the Bitwarden CLI executable
 * @returns {Promise<string>} Path to bw executable
 */
async function findBwPath() {
  for (const bwPath of BW_PATHS) {
    try {
      await fs.access(bwPath, fs.constants.X_OK);
      return bwPath;
    } catch (e) {
      // Path not found or not executable, continue to next
    }
  }

  // Try to find using 'which' command
  try {
    const { stdout } = await execAsync('which bw');
    if (stdout.trim()) {
      return stdout.trim();
    }
  } catch (e) {
    // Command failed, continue to fallback
  }

  // Not found
  return null;
}

function setSession(session) {
  try {
    const sessionCmd = `security add-generic-password -a "${keychainConfig.accountName}" -s "${keychainConfig.serviceName}" -w "${session}" -U`;
    exec(sessionCmd);

    const expiryTime = Date.now() + keychainConfig.sessionTimeout;
    const expiryCmd = `security add-generic-password -a "${keychainConfig.accountName}" -s "${keychainConfig.expiryServiceName}" -w "${expiryTime}" -U`;
    exec(expiryCmd);
    log(`Session set: ${session}`);
  } catch (e) {
    sendMessage(`Failed to store session: ${e.message}`, true);
  }
}

async function deleteSession() {
  try {
    const sessionCmd = `security delete-generic-password -a "${keychainConfig.accountName}" -s "${keychainConfig.serviceName}"`;
    await execAsync(sessionCmd);

    const expiryCmd = `security delete-generic-password -a "${keychainConfig.accountName}" -s "${keychainConfig.expiryServiceName}"`;
    await execAsync(expiryCmd);
    log('Session deleted');
  } catch (e) {
    sendMessage(`Failed to delete session: ${e.message}`, true);
  }
}

async function getSession(bwPath) {
  try {
    const expiryCmd = `security find-generic-password -a "${keychainConfig.accountName}" -s "${keychainConfig.expiryServiceName}" -w`;
    const { stdout: expiryTimestamp } = await execAsync(expiryCmd);
    const expiryTime = parseInt(expiryTimestamp.trim(), 10);
    const currentTime = Date.now();

    log(`Session expired at ${new Date(expiryTime).toLocaleString()}`);
    if (currentTime > expiryTime) {
      log('Session expired');
      await deleteSession();
      throw Error('new session');
    }

    // If not expired, get and return the session
    const sessionCmd = `security find-generic-password -a "${keychainConfig.accountName}" -s "${keychainConfig.serviceName}" -w`;
    const { stdout: session } = await execAsync(sessionCmd);
    log(`Session set: ${session}`);

    return session;
  } catch (error) {
    const password = await showPasswordDialog();
    const newSession = await unlockBitwarden(bwPath, password);
    const session = setSession(newSession);
    log(`Session set: ${session}`);

    return session;
  }
}

async function showPasswordDialog() {
  const script = `
    set thePassword to ""
    set theResult to ""
    
    tell application "System Events"
      activate
      set dialogResult to display dialog "Enter your Bitwarden master password:" with title "Bitwarden Unlock" default answer "" buttons {"Cancel", "OK"} default button "OK" with hidden answer
      set theResult to button returned of dialogResult
      set thePassword to text returned of dialogResult
    end tell
    
    delay 0.3
    tell application "qutebrowser" to activate
    
    if theResult is "OK" then
      thePassword
    else
      ""
    end if
  `;
  try {
    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "\\'")}'`, {
      timeout: COMMAND_TIMEOUT * 50,
    });
    return stdout.trim();
  } catch (e) {
    error(`Error in password dialog: ${e.message}`);
    error('Bitwarden: Failed to display password dialog. Check AppleScript permissions.');
    return 'error';
  }
}

async function unlockBitwarden(bwPath, password) {
  try {
    const { stdout } = await execAsync(
      `echo '${password.replace(/'/g, "\\'")}' | ${bwPath} unlock --raw`,
      {
        timeout: COMMAND_TIMEOUT,
      }
    );
    const sessionKey = stdout.trim();
    return sessionKey;
  } catch (e) {
    const errorParts = e.message.split('[27C');
    const lastPart = errorParts.length > 1 ? errorParts[errorParts.length - 1].trim() : e.message;
    sendMessage(`Bitwarden unlock failed: ${lastPart}`, true);
  }
}

async function getAccounts(bwPath, session, currentUrl) {
  try {
    const command = `${bwPath} list items --session '${session}' --url '${currentUrl}' --raw`;
    const { stdout } = await execAsync(command, { timeout: COMMAND_TIMEOUT * 10 });
    const items = JSON.parse(stdout);
    const accounts = items
      .filter((item) => {
        // Ensure item has login, username, and password
        if (!item.login || !item.login.username || !item.login.password) {
          return false;
        }
        // Check if any URI matches the exact hostname
        const uris = item.login.uris || [];
        return uris.some((uriObj) => {
          try {
            const uriHostname = new URL(uriObj.uri).hostname;
            return uriHostname === new URL(currentUrl).hostname;
          } catch (error) {
            sendMessage(`Invalid URI in item ${item.name}: ${uriObj.uri} (${error.message})`, true);
            return false;
          }
        });
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        username: item.login.username,
        password: item.login.password,
        hasTotp: !!item.login.totp,
        fields: item.fields || [],
        origin: new URL(item.login.uris[0].uri).origin.replace(/^https?:\/\//, ''),
      }));
    return accounts;
  } catch (error) {
    return null;
  }
}

async function postGreaseMonkey(accounts) {
  try {
    const data = JSON.stringify(accounts);
    const command = `:jseval -q --world=main window.postMessage({ type: 'bitwardenData', data: ${data} }, '*');`;
    await fs.appendFile(QUTE_FIFO, command);
  } catch (e) {
    `Failed to write to QUTE_FIFO: ${e.message}`;
  }
}

async function main() {
  if (!currentUrl) return null;
  // deleteSession();return
  postGreaseMonkey('open-vault');
  const bwPath = await findBwPath();
  const session = await getSession(bwPath);
  const accounts = await getAccounts(bwPath, session, currentUrl);
  postGreaseMonkey(accounts);
}

main();
