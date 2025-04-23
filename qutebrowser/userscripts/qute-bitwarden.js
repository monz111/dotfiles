#!/Users/monz/.n/bin/node

/**
 * Bitwarden integration for qutebrowser
 *
 * This script retrieves credentials from Bitwarden CLI and
 * fills them into web forms or copies TOTP codes.
 * Added support for custom fields.
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
  customFieldsOnly: args.includes('--custom-fields-only'),
  customFieldName: args.includes('--custom-field')
    ? args[args.indexOf('--custom-field') + 1]
    : null,
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
    // Add https:// if the URL doesn't start with http:// or https://
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }

    const { hostname } = parseURL(url);
    if (!hostname) {
      console.error(`Could not extract hostname from URL: ${url}`);
      return '';
    }

    const parts = hostname.split('.');

    // Return the hostname as-is if it's an IP address
    if (parts.length === 4 && parts.every((part) => !isNaN(parseInt(part, 10)))) {
      return hostname;
    }

    // Handle common domain format
    if (parts.length > 1) {
      // Extract the domain part
      const domain = parts.slice(-2).join('.');
      console.log(`Extracted domain ${domain} from ${url}`);
      return domain;
    } else {
      console.log(`Using hostname ${hostname} from ${url}`);
      return hostname;
    }
  } catch (error) {
    console.error(`Failed to extract domain from URL ${url}: ${error.message}`);
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

    try {
      const items = JSON.parse(output);

      // Check if session is valid but no items are found
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error('No items found in Bitwarden vault. Please check your vault.');
        sendQuteCommand(config.fifo, 'message-error "No items found in Bitwarden vault"');
        process.exit(1);
      }

      return items;
    } catch (parseError) {
      console.error(`Failed to parse Bitwarden output: ${parseError.message}`);
      console.error('Bitwarden output preview:', output.substring(0, 200) + '...');
      sendQuteCommand(config.fifo, 'message-error "Failed to parse Bitwarden output"');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Failed to get Bitwarden entries: ${error.message}`);

    // Specifically detect session issues
    if (error.message.includes('unauthorized') || error.message.includes('Invalid session')) {
      console.error(
        'Bitwarden session is invalid or expired. Run `bw unlock` to get a new session key.'
      );
      sendQuteCommand(config.fifo, 'message-error "Bitwarden session is invalid. Run `bw unlock`"');
    } else {
      sendQuteCommand(
        config.fifo,
        `message-error "Failed to get Bitwarden entries: ${error.message}"`
      );
    }

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
  // Handle empty domain error
  if (!domain) {
    console.error('Empty domain. Cannot filter entries.');
    sendQuteCommand(config.fifo, 'message-error "Empty domain. Check URL format."');
    process.exit(1);
  }

  // Output debug information
  console.log(`Filtering entries for domain: ${domain}`);

  const filtered = entries.filter((entry) => {
    // Skip if no login property exists
    if (!entry.login) {
      return false;
    }

    // Skip if no URIs exist
    if (!entry.login.uris || !Array.isArray(entry.login.uris) || entry.login.uris.length === 0) {
      return false;
    }

    return entry.login.uris.some((uri) => {
      if (!uri.uri) return false;

      const entryDomain = extractDomain(uri.uri);
      const matched = entryDomain.includes(domain) || domain.includes(entryDomain);

      // Debug: Output matched entry
      if (matched) {
        console.log(`Matched entry: ${entry.name} (${entryDomain})`);
      }

      return matched;
    });
  });

  // Output filtering result information
  console.log(`Found ${filtered.length} matching entries out of ${entries.length} total`);

  return filtered;
};

/**
 * Display UI for user to select an entry
 * @param {Array} entries - List of Bitwarden entries
 * @returns {Object} - Selected entry
 */
const selectEntry = (entries) => {
  if (!entries || entries.length === 0) {
    console.error('No entries to select from.');
    return null;
  }

  // Display additional information for each entry (for debugging)
  entries.forEach((entry, i) => {
    console.log(`Entry ${i}: ${entry.name}`);
    if (entry.login) {
      console.log(`  - Username: ${entry.login.username ? '[SET]' : '[NOT SET]'}`);
      console.log(`  - Password: ${entry.login.password ? '[SET]' : '[NOT SET]'}`);
      console.log(`  - Has TOTP: ${entry.login.totp ? 'Yes' : 'No'}`);
    } else {
      console.log('  - No login information');
    }

    if (entry.fields && Array.isArray(entry.fields) && entry.fields.length > 0) {
      console.log(`  - Custom fields: ${entry.fields.length}`);
      entry.fields.forEach((field) => {
        console.log(`    - ${field.name}: ${field.value ? '[HAS VALUE]' : '[NO VALUE]'}`);
      });
    } else {
      console.log('  - No custom fields');
    }
  });

  const entriesList = entries.map((entry, index) => `${index}: ${entry.name}`).join('\n');

  try {
    const inputFile = path.join(process.env.HOME, '.qutebrowser', 'userscripts', 'bw_entries.txt');
    writeFileSync(inputFile, entriesList);

    console.log(`Wrote ${entries.length} entries to temporary file for selection`);
    console.log(`Using dmenu command: ${config.dmenuInvocation}`);

    const command = `${config.dmenuInvocation} < ${inputFile}`;
    const selection = execSync(command, { encoding: 'utf8' }).trim();

    console.log(`User selected: "${selection}"`);

    // Case: Only a number
    if (/^\d+$/.test(selection)) {
      const index = parseInt(selection, 10);
      if (index >= 0 && index < entries.length) {
        return entries[index];
      } else {
        console.error(
          `Invalid selection index: ${index}, must be between 0 and ${entries.length - 1}`
        );
        return null;
      }
    }

    // Case: Format like "number: "
    const match = selection.match(/^(\d+):/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (index >= 0 && index < entries.length) {
        return entries[index];
      } else {
        console.error(
          `Invalid selection index: ${index}, must be between 0 and ${entries.length - 1}`
        );
        return null;
      }
    }

    // Case: Selection by name
    const entryByName = entries.find((entry) => entry.name === selection);
    if (entryByName) {
      return entryByName;
    }

    // Case: Selection cannot be parsed
    console.error(`Could not parse selection: "${selection}"`);
    return null;
  } catch (error) {
    console.error(`Failed to select entry: ${error.message}`);
    if (error.stderr) {
      console.error(`STDERR: ${error.stderr.toString()}`);
    }
    return null;
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
 * Get custom fields from an entry
 * @param {Object} entry - Bitwarden entry
 * @returns {Array} - List of custom fields
 */
const getCustomFields = (entry) => {
  if (!entry.fields || !Array.isArray(entry.fields)) {
    return [];
  }
  return entry.fields;
};

/**
 * Get a specific custom field by name
 * @param {Array} fields - List of custom fields
 * @param {string} name - Name of the field to get
 * @returns {Object|null} - Custom field object or null if not found
 */
const getCustomFieldByName = (fields, name) => {
  return fields.find((field) => field.name === name) || null;
};

/**
 * Fill a form field with a value
 * @param {string} value - Value to fill
 */
const fillField = (value) => {
  sendQuteCommand(config.fifo, `jseval -q document.activeElement.value = "${value}"`);
};

/**
 * Get form input fields from the page
 * @returns {Promise<Array>} - List of input fields with their attributes
 */
const getFormFields = () => {
  const getFieldsScript = `
    (function() {
      const inputs = document.querySelectorAll('input');
      const fields = [];
      
      inputs.forEach((input, index) => {
        // Skip hidden inputs
        if (input.type === 'hidden') return;
        
        // Collect relevant attributes
        const field = {
          index: index,
          id: input.id || '',
          name: input.name || '',
          type: input.type || '',
          placeholder: input.placeholder || '',
          label: ''
        };
        
        // Try to find associated label
        const labelFor = document.querySelector(\`label[for="\${input.id}"]\`);
        if (labelFor) {
          field.label = labelFor.textContent.trim();
        } else {
          // Try to find parent label
          const parentLabel = input.closest('label');
          if (parentLabel) {
            field.label = parentLabel.textContent.trim().replace(input.outerHTML, '').trim();
          }
        }
        
        fields.push(field);
      });
      
      return JSON.stringify(fields);
    })();
  `;

  try {
    // Write the script to a temporary file
    const scriptFile = path.join(process.env.HOME, '.qutebrowser', 'userscripts', 'get_fields.js');
    writeFileSync(scriptFile, getFieldsScript);

    // Execute the script in the browser and get the result
    sendQuteCommand(config.fifo, `jseval -q --file ${scriptFile} >> /tmp/bw_form_fields.json`);

    // Wait for the file to be written
    execSync('sleep 0.3');

    // Read the result from the temporary file
    const fieldsJson = execSync('cat /tmp/bw_form_fields.json', { encoding: 'utf8' });

    // Parse the JSON
    return JSON.parse(fieldsJson);
  } catch (error) {
    console.error(`Failed to get form fields: ${error.message}`);
    return [];
  }
};

/**
 * Find the best match for a field name in the form
 * @param {Array} formFields - List of form fields
 * @param {string} fieldName - Field name to match
 * @returns {Object|null} - Best matching form field or null if no match
 */
const findBestFieldMatch = (formFields, fieldName) => {
  const fieldNameLower = fieldName.toLowerCase();

  // Priority 1: Exact match on name attribute
  for (const field of formFields) {
    if (field.name.toLowerCase() === fieldNameLower) {
      return field;
    }
  }

  // Priority 2: Exact match on id attribute
  for (const field of formFields) {
    if (field.id.toLowerCase() === fieldNameLower) {
      return field;
    }
  }

  // Priority 3: Exact match on label attribute
  for (const field of formFields) {
    if (field.label.toLowerCase() === fieldNameLower) {
      return field;
    }
  }

  // Priority 4: Partial match on name attribute
  for (const field of formFields) {
    if (
      field.name.toLowerCase().includes(fieldNameLower) ||
      (fieldNameLower.includes(field.name.toLowerCase()) && field.name.length > 3)
    ) {
      return field;
    }
  }

  // Priority 5: Partial match on id attribute
  for (const field of formFields) {
    if (
      field.id.toLowerCase().includes(fieldNameLower) ||
      (fieldNameLower.includes(field.id.toLowerCase()) && field.id.length > 3)
    ) {
      return field;
    }
  }

  // Priority 6: Partial match on placeholder attribute
  for (const field of formFields) {
    if (field.placeholder.toLowerCase().includes(fieldNameLower)) {
      return field;
    }
  }

  // Priority 7: Partial match on label attribute
  for (const field of formFields) {
    if (field.label.toLowerCase().includes(fieldNameLower)) {
      return field;
    }
  }

  return null;
};

/**
 * Fill a specific form field
 * @param {Object} field - Form field to fill
 * @param {string} value - Value to fill
 */
const fillFormField = (field, value) => {
  sendQuteCommand(
    config.fifo,
    `jseval -q document.querySelectorAll('input')[${field.index}].value = "${value}"`
  );
};

/**
 * Handle filling credentials or copying TOTP
 * @param {Object} entry - Selected Bitwarden entry
 */
const handleCredentials = async (entry) => {
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
  const customFields = getCustomFields(entry);

  if (config.customFieldsOnly) {
    if (config.customFieldName) {
      const field = getCustomFieldByName(customFields, config.customFieldName);
      if (field) {
        fillField(field.value);
      } else {
        sendQuteCommand(
          config.fifo,
          `message-error "Custom field '${config.customFieldName}' not found"`
        );
      }
    } else {
      // Show all custom fields and let user select one
      const fieldNames = customFields.map((field, index) => `${index}: ${field.name}`).join('\n');
      if (!fieldNames) {
        sendQuteCommand(config.fifo, 'message-error "No custom fields available"');
        return;
      }

      try {
        const inputFile = path.join(
          process.env.HOME,
          '.qutebrowser',
          'userscripts',
          'bw_fields.txt'
        );
        writeFileSync(inputFile, fieldNames);

        const command = `${config.dmenuInvocation.replace('Bitwarden entry', 'Custom field')} < ${inputFile}`;
        const selection = execSync(command, { encoding: 'utf8' }).trim();
        const index = parseInt(selection.split(':')[0], 10);

        fillField(customFields[index].value);
      } catch (error) {
        console.error(`Failed to select custom field: ${error.message}`);
        process.exit(1);
      }
    }
    return;
  }

  if (config.usernameOnly) {
    fillField(username);
  } else if (config.passwordOnly) {
    fillField(password);
  } else {
    // Get form fields from the page
    const formFields = getFormFields();

    if (formFields.length > 0) {
      // 1. First determine what type of field is currently active
      let activeFieldType = 'username'; // Default: assume first field is username

      // Detect the type of active field based on its properties
      const activeFieldScript = `
        (function() {
          const active = document.activeElement;
          if (!active || active.tagName !== 'INPUT') return 'unknown';
          
          if (active.type === 'password') return 'password';
          
          // If type is not password, determine from name, id, or placeholder
          const attrs = [active.name, active.id, active.placeholder].map(a => (a || '').toLowerCase());
          
          if (attrs.some(a => a.includes('pass'))) return 'password';
          if (attrs.some(a => a.includes('user') || a.includes('email') || a.includes('login'))) return 'username';
          
          return 'unknown';
        })();
      `;

      try {
        // Write the script to a temporary file
        const scriptFile = path.join(
          process.env.HOME,
          '.qutebrowser',
          'userscripts',
          'active_field.js'
        );
        writeFileSync(scriptFile, activeFieldScript);

        // Execute the script in the browser and get the result
        sendQuteCommand(config.fifo, `jseval -q --file ${scriptFile} >> /tmp/bw_active_field.txt`);

        // Wait for the file to be written
        execSync('sleep 0.3');

        // Read the result from the temporary file
        activeFieldType = execSync('cat /tmp/bw_active_field.txt', { encoding: 'utf8' }).trim();
      } catch (error) {
        console.error(`Failed to determine active field type: ${error.message}`);
      }

      // 2. Process based on active field type
      if (activeFieldType === 'password') {
        // If current field is password, fill it
        fillField(password);

        // Then try to locate and fill username field (may need to go back)
        const usernameField =
          findBestFieldMatch(formFields, 'username') ||
          findBestFieldMatch(formFields, 'email') ||
          findBestFieldMatch(formFields, 'login');

        if (usernameField) {
          sendQuteCommand(config.fifo, 'fake-key <Shift-Tab>');
          fillFormField(usernameField, username);
          // Go back to password field
          sendQuteCommand(config.fifo, 'fake-key <Tab>');
        }
      } else {
        // If current field is not password, fill it as username
        fillField(username);

        // Find password field and fill it
        const passwordField = findBestFieldMatch(formFields, 'password');

        if (passwordField) {
          // Move to next field with tab
          sendQuteCommand(config.fifo, 'fake-key <Tab>');
          fillFormField(passwordField, password);
        } else {
          // If password field not found, tab to next field and fill
          sendQuteCommand(config.fifo, 'fake-key <Tab>');
          fillField(password);
        }
      }

      // 3. Try to fill custom fields automatically
      if (customFields.length > 0) {
        let filledFields = 0;
        let matchResults = [];

        for (const customField of customFields) {
          const fieldMatch = findBestFieldMatch(formFields, customField.name);
          if (fieldMatch) {
            fillFormField(fieldMatch, customField.value);
            filledFields++;
            matchResults.push(
              `"${customField.name}" → "${fieldMatch.name || fieldMatch.id || fieldMatch.placeholder}"`
            );
          }
        }

        if (filledFields > 0) {
          sendQuteCommand(
            config.fifo,
            `message-info "Filled ${filledFields} custom fields: ${matchResults.join(', ')}"`
          );
        } else if (customFields.length > 0) {
          sendQuteCommand(
            config.fifo,
            'message-info "Custom fields exist but no matching form fields found"'
          );
        }
      }
    } else {
      // Fallback to old behavior if form fields can't be detected
      fillField(username);
      sendQuteCommand(config.fifo, 'fake-key <Tab>');
      fillField(password);

      // If there are custom fields, notify that they can be filled
      if (customFields.length > 0) {
        sendQuteCommand(
          config.fifo,
          'message-info "Use --custom-fields-only to fill custom fields"'
        );
      }
    }
  }
};

/**
 * Main function
 */
const main = () => {
  console.log('Starting Bitwarden qutebrowser integration...');

  // Script version information
  console.log('Script version: 1.1.0 (with custom fields support)');

  // Display command line arguments
  console.log('Command line arguments:', args);

  // Display configuration
  console.log('Configuration:', {
    url: config.url,
    fifo: config.fifo ? '[SET]' : '[NOT SET]',
    usernameOnly: config.usernameOnly,
    passwordOnly: config.passwordOnly,
    totpOnly: config.totpOnly,
    customFieldsOnly: config.customFieldsOnly,
    customFieldName: config.customFieldName,
  });

  // Check required environment variables
  if (!config.fifo) {
    console.error('QUTE_FIFO environment variable not set.');
    process.exit(1);
  }

  if (!config.url) {
    console.error('QUTE_URL environment variable not set.');
    sendQuteCommand(config.fifo, 'message-error "QUTE_URL environment variable not set"');
    process.exit(1);
  }

  // Extract domain from URL
  const domain = extractDomain(config.url);
  if (!domain) {
    console.error('Could not extract domain from QUTE_URL:', config.url);
    sendQuteCommand(
      config.fifo,
      `message-error "Could not extract domain from URL: ${config.url}"`
    );
    process.exit(1);
  }

  try {
    // Check if Bitwarden CLI session is valid
    const sessionKey = getBitwardenSession();
    console.log('Bitwarden session key retrieved successfully');

    // Retrieve all entries
    console.log('Getting Bitwarden entries...');
    const entries = getBitwardenEntries();
    console.log(`Retrieved ${entries.length} entries from Bitwarden`);

    // Filter by domain
    console.log(`Filtering entries for domain: ${domain}`);
    const filteredEntries = filterEntries(entries, domain);

    // Check filtering results
    if (filteredEntries.length === 0) {
      console.error(`No Bitwarden entries found for domain: ${domain}`);

      // Try variations of the domain name
      const domainParts = domain.split('.');
      if (domainParts.length > 2) {
        const alternativeDomain = domainParts.slice(1).join('.');
        console.log(`Trying alternative domain: ${alternativeDomain}`);
        const alternativeEntries = filterEntries(entries, alternativeDomain);

        if (alternativeEntries.length > 0) {
          console.log(`Found ${alternativeEntries.length} entries with alternative domain`);
          // Use entries from alternative domain
          const selectedEntry = selectEntry(alternativeEntries);
          handleCredentials(selectedEntry);
          return;
        }
      }

      sendQuteCommand(
        config.fifo,
        `message-error "No Bitwarden entries found for domain: ${domain}"`
      );
      process.exit(1);
    }

    // Select and process entry
    console.log(`Found ${filteredEntries.length} entries for domain ${domain}`);
    const selectedEntry = selectEntry(filteredEntries);

    if (!selectedEntry) {
      console.error('No entry selected.');
      sendQuteCommand(config.fifo, 'message-error "No entry selected"');
      process.exit(1);
    }

    console.log(`Selected entry: ${selectedEntry.name}`);
    handleCredentials(selectedEntry);
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    sendQuteCommand(config.fifo, `message-error "An error occurred: ${error.message}"`);
    process.exit(1);
  }
};

// Run the script
main();
