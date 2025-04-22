#!/Users/monz/.n/bin/node

/**
 * Bitwarden integration for qutebrowser
 *
 * This script retrieves credentials from Bitwarden CLI and
 * fills them into web forms or copies TOTP codes.
 */

const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { parse: parseURL } = require('url');
const path = require('path');

// Command line arguments and environment variables
const args = process.argv.slice(2);
const env = process.env;

// Configuration options
const config = {
  url: env.QUTE_URL || '',
  fifo: env.QUTE_FIFO,
  usernameOnly: args.includes('--username-only'),
  passwordOnly: args.includes('--password-only'),
  totpOnly: args.includes('--totp-only'),
  dmenuInvocation: args.includes('--dmenu-invocation')
    ? args[args.indexOf('--dmenu-invocation') + 1]
    : 'choose -p "Bitwarden entry"',
};

/**
 * Extract domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - The extracted domain or empty string
 */
const extractDomain = (url) => {
  if (!url) return '';

  try {
    const { hostname } = parseURL(url);
    if (!hostname) return '';

    const parts = hostname.split('.');
    return parts.length > 1 ? parts.slice(-2).join('.') : hostname;
  } catch (error) {
    console.error(`Failed to extract domain: ${error.message}`);
    return '';
  }
};

/**
 * Get Bitwarden session key from environment or keychain
 * @returns {string} - The Bitwarden session key
 */
const getBitwardenSession = () => {
  let sessionKey = env.BW_SESSION;

  if (!sessionKey) {
    try {
      // Get session key from keychain
      sessionKey = execSync('security find-generic-password -s "bw_session" -w', {
        encoding: 'utf8',
      }).trim();

      if (!sessionKey) {
        throw new Error('BW_SESSION not found in keychain');
      }
    } catch (error) {
      console.error('BW_SESSION not found. Run `bw login` or `bw unlock`.');
      process.exit(1);
    }
  }

  return sessionKey;
};

/**
 * Get entries from Bitwarden CLI
 * @returns {Array} - List of Bitwarden entries
 */
const getBitwardenEntries = () => {
  try {
    const sessionKey = getBitwardenSession();
    const command = `bw list items --session "${sessionKey}"`;
    const output = execSync(command, { encoding: 'utf8' });

    return JSON.parse(output);
  } catch (error) {
    console.error(`Failed to get Bitwarden entries: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Filter entries by domain
 * @param {Array} entries - List of Bitwarden entries
 * @param {string} domain - Domain to match
 * @returns {Array} - Filtered list of entries
 */
const filterEntries = (entries, domain) => {
  return entries.filter((entry) => {
    if (!entry.login?.uris) return false;

    return entry.login.uris.some((uri) => {
      const entryDomain = extractDomain(uri.uri);
      return entryDomain.includes(domain);
    });
  });
};

/**
 * Display UI for user to select an entry
 * @param {Array} entries - List of Bitwarden entries
 * @returns {Object} - Selected entry
 */
const selectEntry = (entries) => {
  const entriesList = entries.map((entry) => `${entry.name}`).join('\n');

  try {
    const inputFile = path.join(process.env.HOME, '.qutebrowser', 'userscripts', 'bw_entries.txt');
    writeFileSync(inputFile, entriesList);

    const command = `${config.dmenuInvocation} < ${inputFile}`;
    const selection = execSync(command, { encoding: 'utf8' }).trim();
    const index = parseInt(selection.split(':')[0], 10);

    return entries[index];
  } catch (error) {
    console.error(`Failed to select entry: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Send command to qutebrowser
 * @param {string} fifo - Path to qutebrowser FIFO
 * @param {string} command - Command to send
 */
const sendQuteCommand = (fifo, command) => {
  try {
    writeFileSync(fifo, command + '\n');
  } catch (error) {
    console.error(`Failed to write to QUTE_FIFO: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Get TOTP code for an entry
 * @param {Object} entry - Bitwarden entry
 * @param {string} sessionKey - Bitwarden session key
 * @returns {string} - TOTP code
 */
const getTotp = (entry, sessionKey) => {
  try {
    const command = `bw get totp "${entry.id}" --session "${sessionKey}"`;
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Failed to get TOTP: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Handle filling credentials or copying TOTP
 * @param {Object} entry - Selected Bitwarden entry
 */
const handleCredentials = (entry) => {
  if (!entry?.login) {
    console.error('No valid login entry selected.');
    process.exit(1);
  }

  const sessionKey = getBitwardenSession();

  if (config.totpOnly) {
    const totp = getTotp(entry, sessionKey);
    // Copy TOTP to clipboard
    execSync(`echo "${totp}" | pbcopy`);
    sendQuteCommand(config.fifo, 'message-info "TOTP copied to clipboard"');
    return;
  }

  const username = entry.login.username || '';
  const password = entry.login.password || '';

  if (config.usernameOnly) {
    sendQuteCommand(config.fifo, `jseval -q document.activeElement.value = "${username}"`);
  } else if (config.passwordOnly) {
    sendQuteCommand(config.fifo, `jseval -q document.activeElement.value = "${password}"`);
  } else {
    // Fill both username and password
    sendQuteCommand(config.fifo, `jseval -q document.activeElement.value = "${username}"`);
    sendQuteCommand(config.fifo, 'fake-key <Tab>');
    sendQuteCommand(config.fifo, `jseval -q document.activeElement.value = "${password}"`);
  }
};

/**
 * Main function
 */
const main = () => {
  // Validate required environment variables
  if (!config.fifo) {
    console.error('QUTE_FIFO environment variable not set.');
    process.exit(1);
  }

  const domain = extractDomain(config.url);
  if (!domain) {
    console.error('Could not extract domain from QUTE_URL.');
    process.exit(1);
  }

  // Get and filter Bitwarden entries
  const entries = getBitwardenEntries();
  const filteredEntries = filterEntries(entries, domain);

  if (filteredEntries.length === 0) {
    console.error(`No Bitwarden entries found for domain: ${domain}`);
    process.exit(1);
  }

  // Let user select an entry and handle it
  const selectedEntry = selectEntry(filteredEntries);
  handleCredentials(selectedEntry);
};

// Run the script
main();
