// Import the Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Configuration
const MODEL_NAME = 'gemini-2.5-flash';
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB limit for Gemini File API

// API Key Management & Robust Rotation
let API_KEYS = [];
const INJECTED_KEYS_STR = '/* GEMINI_API_KEYS_INJECTED */';

// Load build-injected keys first
if (INJECTED_KEYS_STR && !INJECTED_KEYS_STR.startsWith('/*')) {
    API_KEYS = INJECTED_KEYS_STR.split(',').map(k => k.trim()).filter(Boolean);
}

// Local storage key loading removed to prioritize build-injected environment keys

let currentKeyIndex = 0;
let genAI = null;

function initializeGenAI() {
    if (API_KEYS.length > 0) {
        const activeKey = API_KEYS[currentKeyIndex];
        genAI = new GoogleGenerativeAI(activeKey);
        console.log(`Initialized Gemini API with key index ${currentKeyIndex} (ending in ...${activeKey.slice(-4)})`);
    } else {
        genAI = null;
    }
}

function rotateAPIKey() {
    if (API_KEYS.length <= 1) return false;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    initializeGenAI();
    return true;
}

// Initialize on startup
initializeGenAI();

// The system instruction needs to be in a format compatible with the Gemini API
const SYSTEM_INSTRUCTION = {
    role: "user",
    parts: [{
        text: "You are Analyst AI, a specialized document analysis assistant for financial and ESG reporting.\n\n**CRITICAL: Response Requirements**\n- Provide ONLY the information requested in the user's prompt\n- Do NOT add extra sections like 'Recommendations', 'Summary', 'Conclusions', or 'Additional Notes'\n- Do NOT provide unsolicited advice or suggestions\n- Keep responses focused and minimal - answer only what is asked\n- Avoid verbose explanations unless specifically requested\n\n**CRITICAL: Accuracy and Source Requirements**\n- NEVER invent, assume, or hallucinate information that is not explicitly present in the provided documents\n- ONLY provide information that you can directly see and verify in the uploaded content\n- If information is not available in the document, clearly state \"This information is not available in the provided document\"\n- Do not make assumptions or fill in missing data with typical industry values\n\n**CRITICAL: Language Requirements**\n- ALWAYS respond in English only, regardless of the document's original language\n- If analyzing documents in other languages (Hindi, Spanish, French, Chinese, Arabic, etc.), translate all content and provide analysis in English\n- Maintain original numerical values and proper nouns but translate all descriptions, categories, and analysis text to English\n- When referencing non-English content, provide: \"[Original text] (English: [translation])\" format when helpful\n\n**CRITICAL: Page Reference Requirements**\n- When referencing page numbers, ALWAYS specify \"PDF page [number]\" for PDF documents\n- For other document types, use \"Document page [number]\"\n- NEVER use generic terms like \"page\" without specifying the document type\n- Page numbers must correspond to actual pages in the uploaded document\n- Do not reference pages that don't exist in the document\n\n**Document Type Identification**\n- When analyzing documents, first identify the company name from the document content\n- Then identify what type of report each document is based on its content:\n  - Annual Report (AR): Financial statements, annual performance, shareholder information\n  - Sustainability Report (SR): Environmental impact, social responsibility, governance practices\n  - ESG Report: Environmental, Social, and Governance metrics and performance\n- Clearly state the company name and document type at the beginning of your analysis for each document in the format: \"[Company Name] - [Document Type]\"\n\n**Core Analysis Guidelines:**\n- Respond in a clear, structured manner using Markdown formatting\n- When creating tables, use simple 3-column format: | Metric | Value | Pages |\n- Do NOT add Status columns or recommendation columns unless specifically requested\n- For data presentation, prefer tables over lists when applicable\n- Ensure table headers are clearly defined with | Header | format\n- Use alignment indicators when helpful\n- Provide accurate and comprehensive insights based ONLY on document content\n- Handle multilingual documents by translating content to English for analysis\n\n**CRITICAL: Duplicate Data Detection & Reporting**\n\nWhen analyzing documents, you MUST identify and report duplicate metrics/KPIs that appear multiple times:\n\n1. **For IDENTICAL values across multiple locations:**\n   - Report the metric once with all page references using proper format\n   - Format: \"Scope 1 Emissions: 500 MT (PDF pages: 15, 23, 45)\" or \"Scope 1 Emissions: 500 MT (Document pages: 15, 23, 45)\"\n\n2. **For DIFFERENT values of the same metric:**\n   - Report ALL instances with their respective page numbers\n   - Highlight the discrepancy clearly\n   - Format: \"⚠️ Scope 1 Emissions DISCREPANCY:\n     - 500 MT (PDF pages: 15, 23)\n     - 520 MT (PDF page: 45)\"\n\n3. **Always include:**\n   - Exact page numbers with proper document type specification\n   - Clear identification of discrepancies\n   - Both consistent and conflicting values\n   - All analysis and descriptions in English only\n   - ONLY information that is verifiable in the provided documents\n\n**Table Format for Metrics with Multiple References:**\n| Metric | Value | Pages |\n|--------|-------|-------|\n| Scope 1 Emissions | 500 MT | PDF pages: 15, 23 |\n| Scope 1 Emissions | 520 MT | PDF page: 45 |\n\n**Multilingual Document Handling:**\n- Accept documents in any language (Hindi, Spanish, French, Chinese, Arabic, Japanese, German, etc.)\n- Always provide analysis, summaries, and insights in English\n- Translate metric names, categories, and descriptions to English\n- Preserve original numerical values and units\n- Note the original document language for context when relevant\n- ONLY translate and report content that actually exists in the document\n\n**CRITICAL: Minimal Response Policy**\n- Answer ONLY what is asked in the prompt\n- Do not add sections like 'Recommendations for Environmental Data Validation'\n- Do not add 'Summary of Discrepancies and Recommendations'\n- Do not provide unsolicited analysis or suggestions\n- Keep responses clean and focused on the specific request\n\n**CRITICAL: No Hallucination Policy**\n- If a section, metric, or data point is missing, state this clearly\n- Do not provide \"typical\" or \"standard\" values when actual data is unavailable\n- Do not extrapolate or estimate missing information\n- When asked about information not in the document, respond: \"This specific information is not available in the provided document(s)\"\n\nThis ensures comprehensive data validation and transparency in reporting with consistent English output and absolute accuracy."
    }]
};

// State management
let messages = []; // Array of message objects {id, role, text}
let isLoading = false;
let loadingMessage = 'Analyst AI is typing...'; // Dynamic loading message
let uploadedFiles = []; // Array to store multiple files
let chatSession = null; // To hold the Gemini chat session
let promptPrefixes = []; // Initialize as empty array
let activePrefix = ''; // Removed localStorage for activePrefix
let isUserAtBottom = true; // Auto-scroll tracking

// Sequential Mode State
let isSequentialMode = true; // Default to true since Chat mode is eliminated
let seqTasks = [];             // [{id, name, prompt}]
let seqGlobalContext = '';     // Shared rules prepended to each task
let isRunningSeq = false;
let seqTaskIdCounter = 0;

// Load prompt presets from files
async function loadPromptPresets() {
    try {
        // Don't load from localStorage anymore - only use default prompts from files
        // const savedPrompts = JSON.parse(localStorage.getItem('prompt_prefixes') || '[]');

        // Load default presets from the presets.json file
        const response = await fetch('./prompts/presets.json');
        const presetConfig = await response.json();

        // Load content for each preset
        const filePromises = presetConfig.presets.map(async (preset) => {
            try {
                const contentResponse = await fetch(`./prompts/${preset.file}`);
                if (!contentResponse.ok) {
                    console.error(`Failed to load prompt file ${preset.file}: ${contentResponse.status}`);
                    return null;
                }
                const content = await contentResponse.text();
                // Log the first 100 characters to verify content is loaded
                console.log(`Loaded prompt ${preset.name} with content (first 100 chars):`, content.substring(0, 100));
                return {
                    id: preset.id,
                    name: preset.name,
                    content: content,
                    description: preset.description,
                    isDefault: true, // Mark as default preset
                    createdAt: new Date().toISOString()
                };
            } catch (error) {
                console.error(`Error loading prompt file ${preset.file}:`, error);
                return null;
            }
        });

        const defaultPrompts = (await Promise.all(filePromises)).filter(prompt => prompt !== null);

        // Only use default prompts, ignore any user-created prompts from localStorage
        promptPrefixes = [...defaultPrompts];
        if (typeof updateSeqPresetDropdown === 'function') {
            updateSeqPresetDropdown();
        }

        // We don't need to clear localStorage anymore since we're not using it for prompts
        // localStorage.removeItem('prompt_prefixes');
    } catch (error) {
        console.error('Error loading prompt presets:', error);
        // Fallback to ESG prompt if file loading fails
        promptPrefixes = [
            {
                id: 'esg-metrics-' + Date.now(),
                name: 'ESG Metrics Analysis',
                content: 'Analyze all ESG (Environmental, Social, Governance) metrics in this document. Focus on: Scope 1/2/3 emissions, water consumption, waste generation, energy usage, and social indicators. For any metric reported multiple times, provide all values with their specific PDF page references and identify any inconsistencies. ONLY report metrics that are explicitly mentioned in the document. Do not provide typical industry values or estimates for missing data. Provide analysis in English regardless of original document language. Also, identify the company name and what type of report this is (Annual Report, Sustainability Report, or ESG Report) and present it in the format: "[Company Name] - [Document Type]".',
                createdAt: new Date().toISOString()
            }
        ];
    }
}

// Initialize prompt prefixes
loadPromptPresets();

// Remove the old initializeDefaultPrompts function since we're loading from files

// DOM Elements - with error checking
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id '${id}' not found`);
    }
    return element;
}

const chatContainer = safeGetElement('chat-container');
const chatForm = safeGetElement('chat-form');
const messageInput = safeGetElement('message-input');
const sendButton = safeGetElement('send-button');
const attachButton = safeGetElement('attach-button');
const fileInput = safeGetElement('file-input');
const filePreview = safeGetElement('file-preview');
const fileList = safeGetElement('file-list');
const removeAllFilesButton = safeGetElement('remove-all-files');
const dragOverlay = safeGetElement('drag-overlay');
const resetSessionButton = safeGetElement('reset-session-button');

// Scroll Navigation Elements
const scrollToTopButton = safeGetElement('scroll-to-top');
const scrollToBottomButton = safeGetElement('scroll-to-bottom');

// Prompt Prefix Elements
const promptPrefixButton = safeGetElement('prompt-prefix-button');
const modelSelect = safeGetElement('model-select');
const promptPrefixModal = safeGetElement('prompt-prefix-modal');
const prefixForm = safeGetElement('prefix-form');
// ... other elements

// Add listener to model selector
if (modelSelect) {
    modelSelect.addEventListener('change', () => {
        // When model changes, we should ideally reset the session or just warn
        // For simplicity, we'll reset the session to ensure clean state
        if (confirm('Changing the model will reset your current chat session. Continue?')) {
            resetSession();
        } else {
            // Revert selection if user cancels
            // We would need to track previous value to revert, but this is simple enough
        }
    });
}

const prefixNameInput = safeGetElement('prefix-name');
const prefixContentInput = safeGetElement('prefix-content');
const autoApplyPrefixCheckbox = safeGetElement('auto-apply-prefix');
const clearPrefixFormButton = safeGetElement('clear-prefix-form');
const closePrefixModalButton = safeGetElement('close-prefix-modal');
const prefixList = safeGetElement('prefix-list');
const activePrefixSelect = safeGetElement('active-prefix-select');
const activePrefixIndicator = safeGetElement('active-prefix-indicator');
const activePrefixName = safeGetElement('active-prefix-name');
const removeActivePrefixButton = safeGetElement('remove-active-prefix');
const addNewPromptButton = safeGetElement('add-new-prompt-button'); // New element

// Quick Prompt Dropdown Elements
const quickPromptButton = safeGetElement('quick-prompt-button');
const quickPromptDropdown = safeGetElement('quick-prompt-dropdown');
const quickPromptList = safeGetElement('quick-prompt-list');
const managePrefixesLink = safeGetElement('manage-prefixes-link');

// File Processing Progress Elements (Note: Currently placeholders for future chunked upload implementation)
const fileProcessingProgressElement = safeGetElement('file-processing-progress');
const progressBar = safeGetElement('progress-bar');
const progressText = safeGetElement('progress-text');

// API Key Modal Elements (removed for build-injected environment keys)

// Safe event listener attachment function
function safeAddEventListener(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.error(`Cannot attach ${event} listener: element is null`);
    }
}

// Event Listeners with safe attachment
safeAddEventListener(chatForm, 'submit', handleSendMessage);
// Add keydown listener for Shift+Enter functionality
if (messageInput) {
    messageInput.addEventListener('keydown', function (event) {
        // If Shift+Enter is pressed, insert a new line instead of sending
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 1;
        }
        // If Enter is pressed without Shift, send the message
        else if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (chatForm) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}
safeAddEventListener(attachButton, 'click', () => {
    if (fileInput) {
        fileInput.click();
    } else {
        console.error('File input element not found');
    }
});
safeAddEventListener(fileInput, 'change', handleFileSelection);
safeAddEventListener(removeAllFilesButton, 'click', removeAllFiles);

// Drag and Drop Event Listeners
safeAddEventListener(chatContainer, 'dragover', handleDragOver);
safeAddEventListener(chatContainer, 'dragleave', handleDragLeave);
safeAddEventListener(chatContainer, 'drop', handleDrop);
document.addEventListener('dragover', preventDefaultDrag);
document.addEventListener('drop', preventDefaultDrag);

// Reset Session Event Listener
safeAddEventListener(resetSessionButton, 'click', resetSession);

// Prompt Prefix Event Listeners
safeAddEventListener(promptPrefixButton, 'click', openPromptPrefixModal);
safeAddEventListener(closePrefixModalButton, 'click', closePromptPrefixModal);
safeAddEventListener(prefixForm, 'submit', savePrefix);
safeAddEventListener(clearPrefixFormButton, 'click', clearPrefixForm);
safeAddEventListener(activePrefixSelect, 'change', setActivePrefix);
safeAddEventListener(removeActivePrefixButton, 'click', removeActivePrefix);
safeAddEventListener(addNewPromptButton, 'click', openNewPromptForm); // New event listener

// Quick Prompt Dropdown Event Listeners
safeAddEventListener(quickPromptButton, 'click', toggleQuickPromptDropdown);
safeAddEventListener(managePrefixesLink, 'click', openPromptPrefixModalFromDropdown);

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (quickPromptDropdown && !quickPromptDropdown.contains(event.target) && !quickPromptButton.contains(event.target)) {
        closeQuickPromptDropdown();
    }
});

// API Key Modal Event Listeners (removed for build-injected environment keys)

// Scroll Navigation Event Listeners
function handleChatScroll() {
    if (!chatContainer) return;
    // If user is within 50px of the bottom, consider them at the bottom
    const threshold = 50;
    isUserAtBottom = (chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight) <= threshold;
}

// Add scroll event listener to chat container for auto-scroll detection
if (chatContainer) {
    chatContainer.addEventListener('scroll', handleChatScroll);
}

// Initialize the chat with a welcome message
initializeChat();

// Remove the call to initializeDefaultPrompts since we're loading from files
// initializeDefaultPrompts();

// Initialize prompt prefix indicator
updateActivePrefixIndicator();

// Add event listener for clipboard paste events
if (messageInput) {
    messageInput.addEventListener('paste', handlePasteEvent);
}

// Initialize scroll position tracking
// if (chatContainer) {
//     // Set initial scroll position to bottom
//     setTimeout(() => {
//         chatContainer.scrollTop = chatContainer.scrollHeight;
//     }, 100);
//     
//     // Initialize isUserAtBottom
//     isUserAtBottom = true;
// }

// Essential Functions

// Function to handle clipboard paste events
function handlePasteEvent(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the item is a file (image)
        if (item.kind === 'file') {
            const file = item.getAsFile();

            // Check if it's an image file
            if (file && file.type.startsWith('image/')) {
                // Prevent the default paste behavior
                event.preventDefault();

                // Process the image file
                processFileUpload(file);

                // Show a notification
                showToast('Image pasted and added to upload queue!', 'success');
            }
        }
    }
}

/**
 * Prompt Prefix Management Functions
 */
function openPromptPrefixModal() {
    if (!promptPrefixModal) {
        console.error('Prompt prefix modal element not found');
        return;
    }
    renderPrefixList();
    updateActivePrefixSelect();
    promptPrefixModal.classList.remove('hidden');
}

function openNewPromptForm() {
    // Clear the form for a new prompt
    clearPrefixForm();

    // Remove any editing ID
    if (prefixForm) {
        delete prefixForm.dataset.editingId;
    }

    // Focus on the name field
    if (prefixNameInput) {
        prefixNameInput.focus();
    }
}

function closePromptPrefixModal() {
    if (!promptPrefixModal) {
        console.error('Prompt prefix modal element not found');
        return;
    }
    promptPrefixModal.classList.add('hidden');
    clearPrefixForm();
}

function savePrefix(event) {
    event.preventDefault();

    if (!prefixNameInput || !prefixContentInput) {
        console.error('Prefix form inputs not found');
        return;
    }

    const name = prefixNameInput.value.trim();
    const content = prefixContentInput.value.trim();

    if (!name || !content) {
        alert('Please enter both a name and content for the prefix.');
        return;
    }

    // Check if editing existing prefix
    const editingId = prefixForm.dataset.editingId;

    if (editingId) {
        // Update existing prefix
        const prefixIndex = promptPrefixes.findIndex(p => p.id === editingId);
        if (prefixIndex !== -1) {
            // Only update user-created prompts, not default file-based ones
            if (!promptPrefixes[prefixIndex].isDefault) {
                promptPrefixes[prefixIndex] = {
                    ...promptPrefixes[prefixIndex],
                    name,
                    content
                };
            } else {
                // For default prompts, create a copy with a new ID
                const newPrefix = {
                    id: Date.now().toString(),
                    name: name || promptPrefixes[prefixIndex].name,
                    content,
                    createdAt: new Date().toISOString()
                };
                promptPrefixes.push(newPrefix);
            }
        }
        delete prefixForm.dataset.editingId;
    } else {
        // Create new prefix (stored only in memory)
        const newPrefix = {
            id: Date.now().toString(),
            name,
            content,
            createdAt: new Date().toISOString()
        };
        promptPrefixes.push(newPrefix);
    }

    // Set as active if auto-apply is checked
    if (autoApplyPrefixCheckbox && autoApplyPrefixCheckbox.checked) {
        const savedPrefix = editingId ?
            promptPrefixes.find(p => p.id === editingId) :
            promptPrefixes[promptPrefixes.length - 1];
        activePrefix = savedPrefix.id;
        // Removed localStorage for activePrefix
    }

    // Don't save to localStorage anymore - only keep in memory
    // User prompts are only stored in memory during the session
    // To save permanently, user must download the prompt file

    // Update UI
    renderPrefixList();
    updateActivePrefixSelect();
    updateActivePrefixIndicator();
    clearPrefixForm();
    updateQuickPromptList();

    // Show success message
    alert('Prompt saved successfully! To save this prompt permanently, please download it using the download button next to the prompt.');
}

// Add function to download a prompt as a file
function downloadPromptAsFile(prefixId) {
    const prefix = promptPrefixes.find(p => p.id === prefixId);
    if (prefix) {
        // Create a Blob with the prompt content
        const blob = new Blob([prefix.content], { type: 'text/plain' });

        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prompt.txt`;

        // Trigger the download
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// Make download function globally available
window.downloadPromptAsFile = downloadPromptAsFile;

function clearPrefixForm() {
    if (prefixNameInput) prefixNameInput.value = '';
    if (prefixContentInput) prefixContentInput.value = '';
    if (autoApplyPrefixCheckbox) autoApplyPrefixCheckbox.checked = false;
    if (prefixForm) delete prefixForm.dataset.editingId;
}

function editPrefix(prefixId) {
    const prefix = promptPrefixes.find(p => p.id === prefixId);
    if (prefix) {
        if (prefixNameInput) prefixNameInput.value = prefix.name;
        if (prefixContentInput) {
            prefixContentInput.value = prefix.content;
            // Log the first 100 characters of the content being set
            console.log(`Setting content for ${prefix.name} (first 100 chars):`, prefix.content.substring(0, 100));
        }
        if (prefixForm) prefixForm.dataset.editingId = prefixId;
        if (autoApplyPrefixCheckbox) autoApplyPrefixCheckbox.checked = activePrefix === prefixId;

        // For default prompts, we should indicate that editing creates a copy
        if (prefix.isDefault) {
            if (prefixNameInput) prefixNameInput.value = `${prefix.name} (Copy)`;
        }

        // Ensure the modal is visible
        if (promptPrefixModal && promptPrefixModal.classList.contains('hidden')) {
            promptPrefixModal.classList.remove('hidden');
        }
    }
}

function deletePrefix(prefixId) {
    const prefixToDelete = promptPrefixes.find(p => p.id === prefixId);

    // Allow deletion of both default and user-created prompts
    // For default prompts, this just removes them from the current session
    if (prefixToDelete) {
        promptPrefixes = promptPrefixes.filter(p => p.id !== prefixId);

        // Clear active prefix if it was deleted
        if (activePrefix === prefixId) {
            activePrefix = '';
            // Removed localStorage for activePrefix
        }

        // Don't save to localStorage anymore - only keep in memory
        // const userPrompts = promptPrefixes.filter(p => !p.isDefault);
        // localStorage.setItem('prompt_prefixes', JSON.stringify(userPrompts));
        renderPrefixList();
        updateActivePrefixSelect();
        updateActivePrefixIndicator();
        updateQuickPromptList();
    }
}

function renderPrefixList() {
    if (!prefixList) {
        console.error('Prefix list element not found');
        return;
    }

    prefixList.innerHTML = '';

    if (promptPrefixes.length === 0) {
        prefixList.innerHTML = '<p class="text-gray-500 text-sm italic">No prefixes saved yet.</p>';
        return;
    }

    promptPrefixes.forEach(prefix => {
        const prefixElement = document.createElement('div');
        prefixElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200';

        // Add visual indicator for default prompts
        const nameDisplay = prefix.isDefault ?
            `${prefix.name} <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">Default</span>` :
            prefix.name;

        const actionButtons = prefix.isDefault ?
            `
            <button onclick="editPrefix('${prefix.id}')" class="text-blue-600 hover:text-blue-800 p-1" title="Create a copy to edit">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
            </button>
            <button onclick="setActivePrefixById('${prefix.id}')" class="text-green-600 hover:text-green-800 p-1" title="Set as active">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
            ` :
            `
            <button onclick="downloadPromptAsFile('${prefix.id}')" class="text-indigo-600 hover:text-indigo-800 p-1" title="Download as file">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <button onclick="editPrefix('${prefix.id}')" class="text-blue-600 hover:text-blue-800 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            </button>
            <button onclick="setActivePrefixById('${prefix.id}')" class="text-green-600 hover:text-green-800 p-1" title="Set as active">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
            <button onclick="deletePrefix('${prefix.id}')" class="text-red-600 hover:text-red-800 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
            </button>
            `;

        prefixElement.innerHTML = `
            <div class="flex-1">
                <h4 class="font-semibold text-gray-900">${nameDisplay}</h4>
                <p class="text-sm text-gray-700 truncate" style="max-width: 300px;">${escapeHtml(prefix.content)}</p>
            </div>
            <div class="flex items-center space-x-2">
                ${actionButtons}
            </div>
        `;

        prefixList.appendChild(prefixElement);
    });
}

function updateActivePrefixSelect() {
    if (!activePrefixSelect) {
        console.error('Active prefix select element not found');
        return;
    }

    activePrefixSelect.innerHTML = '<option value="">None</option>';

    promptPrefixes.forEach(prefix => {
        const option = document.createElement('option');
        option.value = prefix.id;
        option.textContent = prefix.name;
        option.selected = activePrefix === prefix.id;
        activePrefixSelect.appendChild(option);
    });
}

function setActivePrefix() {
    if (!activePrefixSelect) {
        console.error('Active prefix select element not found');
        return;
    }

    const selectedPrefixId = activePrefixSelect.value;
    activePrefix = selectedPrefixId;
    // Removed localStorage for activePrefix
    updateActivePrefixIndicator();
    updateQuickPromptList();
}

function setActivePrefixById(prefixId) {
    activePrefix = prefixId;
    // Removed localStorage for activePrefix
    updateActivePrefixSelect();
    updateActivePrefixIndicator();
    updateQuickPromptList();
}

function removeActivePrefix() {
    activePrefix = '';
    // Removed localStorage for activePrefix
    updateActivePrefixSelect();
    updateActivePrefixIndicator();
    updateQuickPromptList();
}

function updateActivePrefixIndicator() {
    if (!activePrefixIndicator || !activePrefixName) {
        console.error('Active prefix indicator elements not found');
        return;
    }

    if (activePrefix) {
        const prefix = promptPrefixes.find(p => p.id === activePrefix);
        if (prefix) {
            activePrefixName.textContent = prefix.name;
            activePrefixIndicator.classList.remove('hidden');
        } else {
            activePrefixIndicator.classList.add('hidden');
        }
    } else {
        activePrefixIndicator.classList.add('hidden');
    }
}

function getActivePrefixContent() {
    if (activePrefix) {
        const prefix = promptPrefixes.find(p => p.id === activePrefix);
        return prefix ? prefix.content : '';
    }
    return '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Quick Prompt Dropdown Functions
 */
function toggleQuickPromptDropdown() {
    if (!quickPromptDropdown) return;

    if (quickPromptDropdown.classList.contains('hidden')) {
        openQuickPromptDropdown();
    } else {
        closeQuickPromptDropdown();
    }
}

function openQuickPromptDropdown() {
    if (!quickPromptDropdown) return;

    updateQuickPromptList();
    quickPromptDropdown.classList.remove('hidden');
}

function closeQuickPromptDropdown() {
    if (!quickPromptDropdown) return;

    quickPromptDropdown.classList.add('hidden');
}

function updateQuickPromptList() {
    if (!quickPromptList) return;

    // Clear existing items except the "None" option
    const noneOption = quickPromptList.querySelector('[data-prefix-id=""]');
    quickPromptList.innerHTML = '';

    // Add "None" option back
    if (noneOption) {
        quickPromptList.appendChild(noneOption);
    } else {
        const noneButton = document.createElement('button');
        noneButton.type = 'button';
        noneButton.className = 'w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-700';
        noneButton.setAttribute('data-prefix-id', '');
        noneButton.innerHTML = `
            <span class="font-semibold">None</span>
            <p class="text-xs text-gray-500">No prefix applied</p>
        `;
        noneButton.addEventListener('click', () => selectQuickPrefix(''));
        quickPromptList.appendChild(noneButton);
    }

    // Add current prefixes
    promptPrefixes.forEach(prefix => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `w-full text-left px-3 py-2 hover:bg-gray-100 text-sm ${activePrefix === prefix.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
            }`;
        button.setAttribute('data-prefix-id', prefix.id);

        const truncatedContent = prefix.content.length > 60 ?
            prefix.content.substring(0, 60) + '...' :
            prefix.content;

        // Add visual indicator for default prompts
        const nameDisplay = prefix.isDefault ?
            `${prefix.name} (Default)` :
            prefix.name;

        button.innerHTML = `
            <span class="font-semibold">${escapeHtml(nameDisplay)}</span>
            <p class="text-xs text-gray-500">${escapeHtml(truncatedContent)}</p>
        `;

        button.addEventListener('click', () => selectQuickPrefix(prefix.id));
        quickPromptList.appendChild(button);
    });
}

function selectQuickPrefix(prefixId) {
    activePrefix = prefixId;
    // Removed localStorage for activePrefix
    updateActivePrefixIndicator();
    updateActivePrefixSelect();
    closeQuickPromptDropdown();

    // Focus back on message input
    if (messageInput) {
        messageInput.focus();
    }
}

function openPromptPrefixModalFromDropdown() {
    closeQuickPromptDropdown();
    openPromptPrefixModal();
}

// Make functions globally available for onclick handlers
window.editPrefix = editPrefix;
window.deletePrefix = deletePrefix;
window.setActivePrefixById = setActivePrefixById;

/**
 * Initialize the chat with a welcome message
 */
function initializeChat() {
    let welcomeMessage = `Hello! I'm Analyst AI specialized in document analysis. I can help you analyze documents, validate data consistency, and detect duplicate metrics across reports.

Upload documents or ask me anything!`;

    // Add warning if no build-injected keys are configured
    if (API_KEYS.length === 0) {
        welcomeMessage += '\n\n⚠️ **Configuration Required**: No Gemini API keys are configured. Please ensure they are injected at build time via GitHub Secrets (`GEMINI_API_KEYS`).';
    }

    messages = [
        {
            id: Date.now(),
            role: 'model',
            text: welcomeMessage
        }
    ];
    render();
}

// API Key Modal Functions removed (replaced by environment key injection)

/**
 * Reset Session Function
 */
function resetSession() {
    // Clear messages
    messages = [];

    // Reset chat session
    chatSession = null;

    // Clear any uploaded files
    removeAllFiles();

    // Reinitialize with welcome message
    initializeChat();
}

/**
 * Drag and Drop Functions
 */
function preventDefaultDrag(event) {
    event.preventDefault();
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (dragOverlay) {
        dragOverlay.classList.remove('hidden');
    }
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    // Only hide overlay if we're leaving the chat container itself
    if (chatContainer && !chatContainer.contains(event.relatedTarget)) {
        if (dragOverlay) {
            dragOverlay.classList.add('hidden');
        }
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    if (dragOverlay) {
        dragOverlay.classList.add('hidden');
    }

    const files = Array.from(event.dataTransfer.files);

    if (files.length > 0) {
        files.forEach(file => {
            processFileUpload(file);
        });
    }
}

/**
 * Process File Upload
 */
function processFileUpload(file) {
    // Check file type
    const validTypes = ['.pdf', '.docx', '.txt', '.html', '.htm', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));

    if (validTypes.includes(fileExtension.toLowerCase())) {
        // Check if file already exists
        const existingFileIndex = uploadedFiles.findIndex(f => f.name === file.name && f.size === file.size);
        if (existingFileIndex === -1) {
            uploadedFiles.push(file);
        }
        render();
    } else {
        alert('Please upload PDF, DOCX, TXT, HTML, HTM, or image files (JPG, PNG, GIF, BMP, TIFF) only.');
        if (fileInput) {
            fileInput.value = '';
        }
    }
}

/**
 * Handle file selection
 */
function handleFileSelection(event) {
    if (!event.target || !event.target.files) {
        console.error('File selection event is invalid');
        return;
    }

    const files = Array.from(event.target.files);
    files.forEach(file => {
        processFileUpload(file);
    });
}

/**
 * Remove all uploaded files
 */
function removeAllFiles() {
    uploadedFiles = [];
    if (fileInput) {
        fileInput.value = '';
    }
    render();
}

/**
 * Remove a specific file
 */
function removeFile(index) {
    if (index >= 0 && index < uploadedFiles.length) {
        uploadedFiles.splice(index, 1);
        if (uploadedFiles.length === 0 && fileInput) {
            fileInput.value = '';
        }
        render();
    }
}

/**
 * Render file list in the preview area
 */
function renderFileList() {
    if (!fileList) return;

    fileList.innerHTML = '';

    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between py-1 px-2 bg-white rounded text-sm border border-gray-200';

        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const fileInfo = `${file.name} (${fileSizeMB}MB)`;

        fileItem.innerHTML = `
            <span class="truncate flex-1 mr-2 text-gray-900" title="${file.name}">${fileInfo}</span>
            <button class="text-red-600 hover:text-red-800 p-1" onclick="removeFile(${index})" title="Remove file">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        `;

        fileList.appendChild(fileItem);
    });
}

/**
 * Upload a file to Gemini using the official File API (Resumable Upload)
 */
async function uploadFileToGemini(file) {
    const activeKey = API_KEYS.length > 0 ? API_KEYS[currentKeyIndex] : '';
    if (!activeKey) throw new Error("API Key is required for file upload");

    const fileSize = file.size;
    const mimeType = file.type || 'application/octet-stream';
    const displayName = file.name;

    console.log(`Starting upload for ${displayName} (${fileSize} bytes)`);

    // Step 1: Initialize Resumable Upload Session
    const initResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${activeKey}`, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Header-Content-Length': fileSize,
            'X-Goog-Upload-Header-Content-Type': mimeType,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ file: { display_name: displayName } })
    });

    if (!initResponse.ok) {
        const errorText = await initResponse.text();
        throw new Error(`Failed to initialize upload: ${errorText}`);
    }

    const uploadUrl = initResponse.headers.get('X-Goog-Upload-URL');
    if (!uploadUrl) throw new Error("Failed to get upload URL from headers");

    // Step 2: Perform the actual upload using XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('X-Goog-Upload-Offset', '0');
        xhr.setRequestHeader('X-Goog-Upload-Command', 'upload, finalize');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                const isLarge = fileSize > 20 * 1024 * 1024; // 20MB threshold
                updateProgressBar(percentComplete, `Uploading ${displayName}...`, isLarge);
            }
        };

        // No timeout – allow large files to upload as long as needed
        xhr.timeout = 0;

        xhr.ontimeout = () => reject(new Error("Upload timed out"));

        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('Upload complete:', response);
                    resolve(response.file);
                } catch (e) {
                    reject(new Error(`Failed to parse upload response: ${xhr.responseText}`));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
    });
}

async function getOrUploadFile(file) {
    const activeKey = API_KEYS.length > 0 ? API_KEYS[currentKeyIndex] : '';
    if (!activeKey) throw new Error("API Key is required for file upload");
    let meta = uploadedFileMetadata.find(m => m.name === file.name && m.apiKey === activeKey);
    if (!meta) {
        const fileMetadata = await uploadFileToGemini(file);
        meta = { name: file.name, uri: fileMetadata.uri, mimeType: fileMetadata.mimeType, apiKey: activeKey };
        uploadedFileMetadata.push(meta);
    }
    return meta;
}

function updateProgressBar(percent, message, isLargeFile = false) {
    if (fileProcessingProgressElement) {
        fileProcessingProgressElement.classList.remove('hidden');
    }
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
    }

    // Update the info text based on whether it's a large file (>20MB)
    const progressInfo = document.getElementById('progress-info');
    if (progressInfo) {
        if (isLargeFile) {
            progressInfo.textContent = 'File is over 20MB and will be processed in chunks for optimal performance.';
        } else {
            progressInfo.textContent = message || 'Uploading file to Gemini API...';
        }
    }
}

function hideProgressBar() {
    if (fileProcessingProgressElement) {
        fileProcessingProgressElement.classList.add('hidden');
    }
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    if (progressText) {
        progressText.textContent = '0%';
    }
}

/**
 * Handle sending a message
 */
async function handleSendMessage(event) {
    event.preventDefault();

    const userMessage = messageInput.value.trim();

    // Check if API key is set
    if (API_KEYS.length === 0) {
        showToast("No Gemini API keys configured. Please inject keys via environment/build.", "error");
        return;
    }

    let isRunningPresetAsChat = false;
    let presetChatPrompt = '';
    let presetDisplayName = '';

    if (isSequentialMode && !userMessage) {
        if (uploadedFiles.length === 0) {
            showToast("Please upload at least one document first.", "error");
            return;
        }
        const prefixContent = getActivePrefixContent();
        if (!prefixContent) {
            showToast("Please select an ESG Preset or Prompt Prefix first.", "error");
            return;
        }
        
        // Parse tasks
        const { globalContext, tasks } = parseTasksFromPrompt(prefixContent);
        if (tasks.length === 0) {
            // Run as a normal conversation chat task using the prefix content
            isRunningPresetAsChat = true;
            presetChatPrompt = prefixContent;
            const activePreset = promptPrefixes.find(p => p.id === activePrefix);
            presetDisplayName = activePreset ? `Run Preset: ${activePreset.name}` : `Run Prefix`;
        } else {
            seqGlobalContext = globalContext;
            seqTasks = tasks.map(t => ({
                id: 'task-' + (++seqTaskIdCounter),
                name: t.name,
                prompt: t.prompt
            }));

            runAllSequentialTasks();
            return;
        }
    }

    // Don't send if there's no message, no files, and not running a preset
    if (!userMessage && uploadedFiles.length === 0 && !isRunningPresetAsChat) return;

    try {
        // Set loading state
        isLoading = true;

        // Prepare the final message
        let finalMessage = isRunningPresetAsChat ? presetChatPrompt : userMessage;

        // Prepare the user message to display in the UI
        let userDisplayMessageText = '';
        if (isRunningPresetAsChat) {
            userDisplayMessageText = presetDisplayName;
        } else if (userMessage) {
            userDisplayMessageText = userMessage;
        } else if (uploadedFiles.length > 0) {
            userDisplayMessageText = `Please analyze these ${uploadedFiles.length} files: ${uploadedFiles.map(f => f.name).join(', ')}.`;
        }

        // Add user message to chat UI
        if (userDisplayMessageText) {
            messages.push({
                id: Date.now(),
                role: 'user',
                text: userDisplayMessageText
            });
        }

        // Clear input
        messageInput.value = '';

        // Add placeholder for model response
        const responseId = Date.now() + 1;

        messages.push({
            id: responseId,
            role: 'model',
            text: '',
            tokenCounts: { input: 0, output: 0 } // Initialize token counts
        });

        // Render to show user message and model placeholder
        render();

        // Send message to Gemini API and stream the response (with key rotation retries)
        let result = null;
        let attempt = 0;
        const maxAttempts = API_KEYS.length > 1 ? API_KEYS.length : 3;
        let waitDelay = 7000;

        while (attempt < maxAttempts) {
            try {
                // Initialize chat session if it doesn't exist
                const selectedModel = modelSelect ? modelSelect.value : MODEL_NAME;
                const model = genAI.getGenerativeModel({ model: selectedModel });
                console.log(`Using model: ${selectedModel}`);

                // Prepare content parts for the message (built dynamically for the current active key)
                const contentParts = [];

                // Add text with instruction to identify report types
                if (finalMessage) {
                    let enhancedMessage = finalMessage;
                    if (uploadedFiles.length > 0) {
                        enhancedMessage += "\n\nBefore analyzing the content, please identify the company name and what type of report each document is based on its content (Annual Report, Sustainability Report, or ESG Report) and mention this in your response in the format: \"[Company Name] - [Document Type]\".";
                    }
                    contentParts.push({ text: enhancedMessage });
                }

                // Add files if present (resolving/uploading using the current active key)
                if (uploadedFiles.length > 0) {
                    updateProgressBar(0, "Preparing files...");
                    for (let i = 0; i < uploadedFiles.length; i++) {
                        const file = uploadedFiles[i];
                        const meta = await getOrUploadFile(file);
                        contentParts.push({
                            fileData: {
                                mimeType: meta.mimeType,
                                fileUri: meta.uri
                            }
                        });
                    }
                    hideProgressBar();
                }

                if (!chatSession) {
                    const safetySettings = [
                        {
                            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold: HarmBlockThreshold.BLOCK_NONE
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                            threshold: HarmBlockThreshold.BLOCK_NONE
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                            threshold: HarmBlockThreshold.BLOCK_NONE
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                            threshold: HarmBlockThreshold.BLOCK_NONE
                        }
                    ];

                    const history = [];
                    // Map existing conversation history into Gemini format (user vs model)
                    // Skip the very first welcome message, and exclude the current user message (at messages.length - 2) and the empty model placeholder (at messages.length - 1)
                    if (messages.length > 2) {
                        for (let idx = 1; idx < messages.length - 2; idx++) {
                            const msg = messages[idx];
                            if (msg.text && (msg.role === 'user' || msg.role === 'model')) {
                                history.push({
                                    role: msg.role === 'model' ? 'model' : 'user',
                                    parts: [{ text: msg.text }]
                                });
                            }
                        }
                    }

                    chatSession = model.startChat({
                        history: history,
                        safetySettings,
                        generationConfig: {
                            temperature: 0.4,
                            maxOutputTokens: 64000 // Increase limit to prevent truncation
                        },
                        systemInstruction: SYSTEM_INSTRUCTION
                    });
                }

                // Count Input Tokens
                try {
                    // Include system instruction and file content for accurate count
                    const countResult = await model.countTokens({
                        contents: [{ role: 'user', parts: contentParts }],
                        systemInstruction: SYSTEM_INSTRUCTION
                    });

                    const count = countResult.totalTokens;
                    console.log(`Input Token Count: ${count}`);

                    // Update the UI with input tokens immediately
                    const modelMessageIndex = messages.findIndex(msg => msg.id === responseId);
                    if (modelMessageIndex !== -1) {
                        messages[modelMessageIndex].tokenCounts.input = count;
                        render();
                    }
                } catch (tokenError) {
                    console.error('Error counting tokens:', tokenError);
                }

                result = await chatSession.sendMessageStream(contentParts);
                break; // Success!
            } catch (error) {
                const errMsg = (error.message || "").toLowerCase();
                if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("resource exhausted") || errMsg.includes("api key") || errMsg.includes("permission") || errMsg.includes("403")) {
                    if (API_KEYS.length > 1) {
                        attempt++;
                        console.warn(`Chat failed with rate limit/quota or permissions error. Rotating key and retrying immediately...`);
                        rotateAPIKey();
                        chatSession = null; // Re-create session with the new key in next iteration
                        continue;
                    } else {
                        attempt++;
                        if (attempt >= maxAttempts) throw error;
                        
                        console.warn(`Rate limit exceeded. Waiting for cooldown...`);
                        isLoading = true;
                        loadingMessage = `Rate limit reached. Cooldown active... Retrying in ${waitDelay / 1000}s...`;
                        render();
                        await new Promise(resolve => setTimeout(resolve, waitDelay));
                        loadingMessage = 'Analyst AI is typing...';
                        render();
                        waitDelay *= 1.5;
                        continue;
                    }
                }
                throw error;
            }
        }

        // Process the streamed response
        let responseText = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            responseText += chunkText;

            // Check for finish reason in candidates
            if (chunk.candidates && chunk.candidates.length > 0) {
                const finishReason = chunk.candidates[0].finishReason;
                if (finishReason && finishReason !== 'STOP') {
                    console.warn('Generation stopped with reason:', finishReason);
                    // Append warning to text if it stopped abnormally
                    if (finishReason === 'SAFETY') {
                        responseText += '\n\n**[Generation stopped due to Safety Filters]**';
                    } else if (finishReason === 'MAX_TOKENS') {
                        responseText += '\n\n**[Generation stopped due to Max Token Limit]**';
                    } else {
                        responseText += `\n\n**[Generation stopped: ${finishReason}]**`;
                    }
                }
            }

            // Update the model's message with the accumulated text
            const modelMessageIndex = messages.findIndex(msg => msg.id === responseId);
            if (modelMessageIndex !== -1) {
                messages[modelMessageIndex].text = responseText;

                // Check for usage metadata in the chunk (often in the last chunk)
                if (chunk.usageMetadata) {
                    messages[modelMessageIndex].tokenCounts = {
                        input: chunk.usageMetadata.promptTokenCount,
                        output: chunk.usageMetadata.candidatesTokenCount,
                        total: chunk.usageMetadata.totalTokenCount
                    };
                }

                render();
            }
        }

        // Clear the files after successful processing
        if (uploadedFiles.length > 0) {
            removeAllFiles();
        }

    } catch (error) {
        console.error('Error sending message:', error);

        let errorMessage = 'Sorry, an error occurred. Please try again.';

        if (error.message && (error.message.includes('API key not valid') || error.message.includes('API key'))) {
            errorMessage = 'API key error: The active API key is invalid. Please check your injected keys or environment configuration.';
            API_KEYS = [];
            genAI = null;
            chatSession = null;
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }

        messages.push({
            id: Date.now() + 1,
            role: 'model',
            text: errorMessage
        });
    } finally {
        isLoading = false;
        render();
    }
}

/**
 * Render the chat messages
 */
function render() {
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }

    // Save current scroll position before rendering
    const previousScrollTop = chatContainer.scrollTop;
    const previousScrollHeight = chatContainer.scrollHeight;

    chatContainer.innerHTML = '';

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = message.role === 'user' ?
            'flex justify-end' : 'flex justify-start';

        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'relative';

        const messageContent = document.createElement('div');
        messageContent.className = message.role === 'user' ?
            'max-w-3xl bg-indigo-600 text-white p-3 rounded-lg' :
            'max-w-7xl bg-white text-gray-900 p-3 rounded-lg markdown-content border border-gray-200'; // Increased from max-w-6xl to max-w-7xl

        if (message.role === 'model') {
            // Use marked to parse the markdown
            try {
                // Sanitize and parse markdown content
                const sanitizedText = message.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                messageContent.innerHTML = marked.parse(message.text);
            } catch (parseError) {
                console.error('Markdown parsing error:', parseError);
                // Fallback to plain text if markdown parsing fails
                messageContent.textContent = message.text;
            }

            // Add copy button for the entire response
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity';

            // Copy button for entire response
            const copyButton = document.createElement('button');
            copyButton.className = 'p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600';
            copyButton.title = 'Copy entire response';
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
            `;
            copyButton.addEventListener('click', function (e) {
                e.stopPropagation();
                copyToClipboard(message.text);
            });

            buttonContainer.appendChild(copyButton);
            messageWrapper.appendChild(buttonContainer);
        } else {
            messageContent.textContent = message.text;
        }

        // Render Token Counts if available
        if (message.role === 'model' && message.tokenCounts) {
            const tokenInfoDiv = document.createElement('div');
            tokenInfoDiv.className = 'mt-2 text-xs text-gray-500 flex justify-end items-center space-x-3 border-t border-gray-100 pt-1';

            if (message.tokenCounts.input > 0) {
                tokenInfoDiv.innerHTML += `<span title="Tokens in your prompt + files">Input Tokens: <strong>${message.tokenCounts.input.toLocaleString()}</strong></span>`;
            }

            if (message.tokenCounts.output > 0) {
                tokenInfoDiv.innerHTML += `<span class="border-l border-gray-300 pl-3" title="Tokens generated by model">Output Tokens: <strong>${message.tokenCounts.output.toLocaleString()}</strong></span>`;
            } else if (isLoading && message.id === messages[messages.length - 1].id) {
                // Show "Generating..." while streaming if output is 0 but loading
                tokenInfoDiv.innerHTML += `<span class="border-l border-gray-300 pl-3 italic">Generating...</span>`;
            }

            // Only append if we have something to show
            if (tokenInfoDiv.innerHTML) {
                messageContent.appendChild(tokenInfoDiv);
            }
        }

        // Ensure proper rendering of table content and add copy buttons to tables
        messageContent.querySelectorAll('table').forEach((table, index) => {
            table.classList.add('markdown-content-table');

            // Create a container for the table with relative positioning
            const tableContainer = document.createElement('div');
            tableContainer.className = 'relative group/table';
            tableContainer.style.cssText = 'margin: 1rem 0;';

            // Move the table into the container
            table.parentNode.insertBefore(tableContainer, table);
            tableContainer.appendChild(table);

            // Add copy button for the table
            const tableButtonContainer = document.createElement('div');
            tableButtonContainer.className = 'absolute top-2 right-2 flex space-x-1 opacity-0 group-hover/table:opacity-100 transition-opacity';

            const tableCopyButton = document.createElement('button');
            tableCopyButton.className = 'p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600';
            tableCopyButton.title = 'Copy table';
            tableCopyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
            `;

            tableCopyButton.addEventListener('click', function (e) {
                e.stopPropagation();
                // Convert table to markdown format for copying
                const tableMarkdown = convertTableToMarkdown(table);
                copyToClipboard(tableMarkdown);
            });

            tableButtonContainer.appendChild(tableCopyButton);
            tableContainer.appendChild(tableButtonContainer);
        });

        messageWrapper.appendChild(messageContent);
        messageWrapper.classList.add('group'); // For hover effects
        messageDiv.appendChild(messageWrapper);
        chatContainer.appendChild(messageDiv);
    });

    // Add loading indicator if we're loading
    if (isLoading) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'flex justify-start';

        const loadingContent = document.createElement('div');
        loadingContent.className = 'max-w-7xl bg-white text-gray-900 p-3 rounded-lg flex items-center space-x-2 border border-gray-200'; // Changed from max-w-6xl to max-w-7xl

        loadingContent.innerHTML = `
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
                <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            </div>
            <span class="text-gray-700">${loadingMessage}</span>
        `;

        loadingDiv.appendChild(loadingContent);
        chatContainer.appendChild(loadingDiv);
    }

    // Update UI state based on isLoading
    if (messageInput) messageInput.disabled = isLoading;
    if (sendButton) sendButton.disabled = isLoading;
    if (attachButton) attachButton.disabled = isLoading;

    // Update file preview visibility
    if (uploadedFiles.length > 0 && filePreview) {
        filePreview.classList.remove('hidden');
        renderFileList();
    } else if (filePreview) {
        filePreview.classList.add('hidden');
    }

    // Update active prefix indicator
    updateActivePrefixIndicator();

    // Scroll to bottom with a delay to ensure content is rendered
    if (chatContainer) {
        // Only scroll to bottom if user is near the bottom already
        // This respects the project specification for chat scroll behavior
        setTimeout(() => {
            if (isUserAtBottom) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 10);
    }
}

// Make removeFile function globally available
window.removeFile = removeFile;

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
            // Show visual feedback
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback method
            fallbackCopyTextToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log('Text copied to clipboard');
            showToast('Copied to clipboard!');
        } else {
            console.error('Failed to copy text');
            showToast('Failed to copy to clipboard', 'error');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showToast('Failed to copy to clipboard', 'error');
    }

    document.body.removeChild(textArea);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Remove any existing toast
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
    toast.textContent = message;

    // Add to document
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

/**
 * Convert HTML table to markdown format
 */
function convertTableToMarkdown(tableElement) {
    let markdown = '';
    const rows = tableElement.querySelectorAll('tr');

    if (rows.length === 0) return '';

    // Process header row
    const headerCells = rows[0].querySelectorAll('th, td');
    const headers = Array.from(headerCells).map(cell => cell.textContent.trim());

    // Create header row
    markdown += '| ' + headers.join(' | ') + ' |\n';

    // Create separator row
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        const cellData = Array.from(cells).map(cell => cell.textContent.trim());
        markdown += '| ' + cellData.join(' | ') + ' |\n';
    }

    return markdown;
}

// Make functions globally available
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
window.convertTableToMarkdown = convertTableToMarkdown;

/* ================================================================
   INTEGRATED SEQUENTIAL MODE
   Each task runs as a separate, focused generateContent() call.
   Files are uploaded once to Gemini File API and cached.
   Results stream directly into the chat container as model messages.
   ================================================================ */

// ── Additional State ────────────────────────────────────────────
let uploadedFileMetadata = []; // Cached file metadata: { name, uri, mimeType }
let seqTaskOutputs = {};       // Store text results per task: { taskId: text }

// ── JSON Schemas for Structured ESG Extraction ───────────────────
const Task1Schema = {
    type: "OBJECT",
    properties: {
        companyName: { 
            type: "STRING", 
            description: "Name of the company, e.g. Mahindra & Mahindra Ltd. (Include PDF Page # where found, e.g., 'PDF page 1')" 
        },
        documentType: { 
            type: "STRING", 
            description: "Type of the report, e.g. Annual Report (Include PDF Page # where found, e.g., 'PDF page 1')" 
        },
        timePeriodCovered: { 
            type: "STRING", 
            description: "State the full time period, e.g. 1 April, 2023 to 31 March, 2024 (Include PDF Page # where found, e.g., 'PDF page 5')" 
        },
        boundaryDescription: { 
            type: "STRING", 
            description: "Extract the verbatim boundary description (Include PDF Page # where found, e.g., 'PDF page 5')" 
        },
        boundaryCompleteness: { 
            type: "STRING", 
            description: "Classify as 'Consolidated (within reporting boundary)' if the covered entities account for >=90% of the entire group's total consolidated revenue. Classify as 'Partial' if they account for <90% (e.g. if the scope only covers standalone/specific subsidiaries of a larger consolidated group). Otherwise classify as 'Unclear'.",
            enum: ["Consolidated (within reporting boundary)", "Partial", "Unclear"] 
        },
        validationNotes: { 
            type: "STRING", 
            description: "Explain the reasoning for your boundary completeness classification." 
        },
        reportingFrameworks: { 
            type: "STRING", 
            description: "List any specific reporting frameworks, e.g. GRI, BRSR (Include PDF Page # where found, e.g., 'PDF page 12')" 
        },
        ghgAssuranceCoverage: { 
            type: "STRING", 
            description: "Extract assurance/verification coverage only for GHG-related data exactly as stated (Include PDF Page # where found, e.g., 'PDF page 45'). If not available, write 'Not Found'." 
        },
        ghgAssuranceStandard: { 
            type: "STRING", 
            description: "Extract only the named assurance standard used for GHG (e.g. ISAE 3000, ISO 14064-3) exactly as stated (Include PDF Page # where found, e.g., 'PDF page 45'). If not available, write 'Not Found'." 
        }
    },
    required: ["companyName", "documentType", "timePeriodCovered", "boundaryDescription", "boundaryCompleteness", "validationNotes"]
};

const Task2RowSchema = {
    type: "OBJECT",
    properties: {
        metric: { type: "STRING" },
        value: { type: "STRING" },
        unit: { type: "STRING" },
        pageSource: { type: "STRING" },
        section: { type: "STRING" },
        reportingBoundary: { 
            type: "STRING", 
            description: "The reporting boundary specifically applicable to this metric/section (e.g. 'Standalone Operations of M&M Ltd', 'Specific Manufacturing Facilities', 'Automotive Sector only'). Do NOT copy the general report boundary blindly. Check the specific section text/footnotes to determine if a narrower boundary applies." 
        }
    },
    required: ["metric", "value", "unit", "pageSource", "section", "reportingBoundary"]
};

const Task2Schema = {
    type: "OBJECT",
    properties: {
        ghgTable: { type: "ARRAY", items: Task2RowSchema, description: "GHG Emissions Data table. Only include metrics with data actually available in the report. If a metric is missing/not disclosed, do not include it." },
        waterTable: { type: "ARRAY", items: Task2RowSchema, description: "Water Data table. Only include metrics with data actually available." },
        waterStressedTable: { type: "ARRAY", items: Task2RowSchema, description: "Water Data in Water-Stressed Regions table. Only include metrics with data actually available." },
        wasteGenerationTable: { type: "ARRAY", items: Task2RowSchema, description: "Waste Generation Data table. Only include metrics with data actually available." },
        wasteDisposalTable: { type: "ARRAY", items: Task2RowSchema, description: "Waste Disposal & Treatment Data table. Only include metrics with data actually available." },
        pollutantsTable: { type: "ARRAY", items: Task2RowSchema, description: "Air & Water Pollutants Data table. Only include metrics with data actually available." },
        energyTable: { type: "ARRAY", items: Task2RowSchema, description: "Energy Data table. Only include metrics with data actually available." }
    },
    required: ["ghgTable", "waterTable", "waterStressedTable", "wasteGenerationTable", "wasteDisposalTable", "pollutantsTable", "energyTable"]
};

const FinancialRowSchema = {
    type: "OBJECT",
    properties: {
        metric: { type: "STRING" },
        value: { type: "STRING" },
        unitCurrency: { type: "STRING" },
        pageSource: { type: "STRING" },
        section: { type: "STRING" }
    },
    required: ["metric", "value", "unitCurrency", "pageSource", "section"]
};

const Task3Schema = {
    type: "OBJECT",
    properties: {
        businessOverview: { type: "STRING", description: "Concise summary of the business (Include PDF Page #, e.g. 'PDF page 12')" },
        segmentInformation: { type: "STRING", description: "List each business segment with description and revenue (Include PDF Page #)" },
        productBreakdown: { type: "STRING", description: "List each product/category/service with description and revenue (Include PDF Page #)" },
        outsourcingInformation: { type: "STRING", description: "Explicit outsourcing statements if manufacturing, or N/A (Include PDF Page #)" },
        granularityBasis: { type: "STRING", description: "State 'Segment-based' or 'Product-based' and why (Include PDF Page #)" },
        revenueConsistencyStatus: { type: "STRING", description: "State 'Matches Consolidated Revenue' or 'Does Not Match Consolidated Revenue' (Include PDF Page #)" },
        financialTable: { type: "ARRAY", items: FinancialRowSchema, description: "Financial Data Table. Strictly include Consolidated Revenue, Segment Revenues, Product Revenues, and Consistency Check results." }
    },
    required: ["businessOverview", "segmentInformation", "productBreakdown", "outsourcingInformation", "granularityBasis", "revenueConsistencyStatus", "financialTable"]
};

const Task4Schema = {
    type: "OBJECT",
    properties: {
        dataAvailabilityNotes: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of sentences specifically explaining why any environmental or financial data is missing, unavailable, not reported, or excluded from the reporting boundary. Do NOT include general statements about reporting scope, boundaries, frameworks, or standard business descriptions. If no data is missing or no reasons are given, return an empty array."
        }
    },
    required: ["dataAvailabilityNotes"]
};

const Task5Schema = {
    type: "OBJECT",
    properties: {
        qcChecks: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    checkName: { type: "STRING", description: "Name of the QC check (e.g. Transcription Check, Year Check, Column Alignment, etc.)" },
                    status: { type: "STRING", description: "Status: 'Passed' or 'Failed / Discrepancy Found'" },
                    findings: { type: "STRING", description: "Details of any corrections, discrepancies, missed data, or anomalies found during this check. If no issues were found, state 'Passed successfully'." }
                },
                required: ["checkName", "status", "findings"]
            },
            description: "List of Quality Control checklist audits and findings. Do NOT re-output the full extracted tables. Output ONLY the checklist findings, corrections, and any missed data identified."
        }
    },
    required: ["qcChecks"]
};

const VarianceTask1Schema = {
    type: "OBJECT",
    properties: {
        kpis: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    kpiName: { type: "STRING" },
                    targetYearValue: { type: "STRING" },
                    targetYearUnit: { type: "STRING" },
                    previousYearValue: { type: "STRING" },
                    previousYearUnit: { type: "STRING" },
                    pageSource: { type: "STRING" }
                },
                required: ["kpiName", "targetYearValue", "targetYearUnit", "previousYearValue", "previousYearUnit", "pageSource"]
            }
        }
    },
    required: ["kpis"]
};

const VarianceTask2Schema = {
    type: "OBJECT",
    properties: {
        highVarianceKpis: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    kpiName: { type: "STRING" },
                    previousYearValue: { type: "STRING" },
                    targetYearValue: { type: "STRING" },
                    variancePercent: { type: "STRING", description: "Calculated percentage variance, e.g. 25.3%" },
                    direction: { type: "STRING", enum: ["Increase", "Decrease"] }
                },
                required: ["kpiName", "previousYearValue", "targetYearValue", "variancePercent", "direction"]
            }
        }
    },
    required: ["highVarianceKpis"]
};

const VarianceTask3Schema = {
    type: "OBJECT",
    properties: {
        explanations: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    kpiName: { type: "STRING" },
                    variancePercent: { type: "STRING" },
                    reason: { type: "STRING", description: "Verbatim or near-verbatim reason explaining the change" },
                    pageSource: { type: "STRING" }
                },
                required: ["kpiName", "variancePercent", "reason", "pageSource"]
            }
        }
    },
    required: ["explanations"]
};

function repairTruncatedJson(jsonStr) {
    jsonStr = jsonStr.trim();
    let insideString = false;
    let escape = false;
    const stack = [];
    let cleanStr = "";
    
    for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];
        cleanStr += char;
        
        if (escape) {
            escape = false;
            continue;
        }
        
        if (char === '\\') {
            escape = true;
            continue;
        }
        
        if (char === '"') {
            insideString = !insideString;
            continue;
        }
        
        if (!insideString) {
            if (char === '{' || char === '[') {
                stack.push(char);
            } else if (char === '}') {
                if (stack[stack.length - 1] === '{') {
                    stack.pop();
                }
            } else if (char === ']') {
                if (stack[stack.length - 1] === '[') {
                    stack.pop();
                }
            }
        }
    }
    
    let repaired = cleanStr;
    
    if (insideString) {
        if (escape) {
            repaired = repaired.slice(0, -1);
        }
        repaired += '"';
    }
    
    repaired = repaired.trim();
    if (repaired.endsWith(',')) {
        repaired = repaired.slice(0, -1).trim();
    }
    if (repaired.endsWith(':')) {
        repaired += ' []';
    }
    
    while (stack.length > 0) {
        const openChar = stack.pop();
        if (openChar === '{') {
            repaired = repaired.trim();
            if (repaired.endsWith(',')) repaired = repaired.slice(0, -1).trim();
            repaired += '}';
        } else if (openChar === '[') {
            repaired = repaired.trim();
            if (repaired.endsWith(',')) repaired = repaired.slice(0, -1).trim();
            repaired += ']';
        }
    }
    
    return repaired;
}

// ── Helper functions to convert JSON output to Markdown ──────────
function formatTask1ToMarkdown(data) {
    if (!data) return "No data returned.";
    return `*   **Company Name:** ${data.companyName || 'N/A'}
*   **Document Type:** ${data.documentType || 'N/A'}
*   **Time Period Covered:** ${data.timePeriodCovered || 'N/A'}
*   **Boundary Description:** ${data.boundaryDescription || 'N/A'}
*   **Boundary Completeness Classification:** ${data.boundaryCompleteness || 'N/A'}
*   **Validation Notes:** ${data.validationNotes || 'N/A'}
*   **Reporting Frameworks Mentioned:** ${data.reportingFrameworks || 'N/A'}
*   **GHG Assurance Coverage (If Available):** ${data.ghgAssuranceCoverage || 'N/A'}
*   **GHG Assurance Standard (If Available):** ${data.ghgAssuranceStandard || 'N/A'}`;
}

function formatTask2ToMarkdown(data) {
    if (!data) return "No data returned.";
    
    let md = "";
    const headers = ["Metric", "Value", "Unit", "Page Source (PDF#)", "Section", "Reporting Boundary"];
    
    const tables = [
        { title: "GHG Emissions Data", key: "ghgTable" },
        { title: "Water Data", key: "waterTable" },
        { title: "Water Data in Water-Stressed Regions", key: "waterStressedTable" },
        { title: "Waste Generation Data", key: "wasteGenerationTable" },
        { title: "Waste Disposal & Treatment Data", key: "wasteDisposalTable" },
        { title: "Air & Water Pollutants Data", key: "pollutantsTable" },
        { title: "Energy Data", key: "energyTable" }
    ];
    
    let hasAnyData = false;
    
    tables.forEach((t, index) => {
        const rows = data[t.key];
        if (rows && rows.length > 0) {
            hasAnyData = true;
            if (index > 0 && md) md += "\n\n";
            md += `**${t.title}**\n\n`;
            md += `| ${headers.join(" | ")} |\n`;
            md += `| ${headers.map(() => "---").join(" | ")} |\n`;
            rows.forEach(r => {
                md += `| ${r.metric || 'N/A'} | ${r.value || 'N/A'} | ${r.unit || 'N/A'} | ${r.pageSource || 'N/A'} | ${r.section || 'N/A'} | ${r.reportingBoundary || 'N/A'} |\n`;
            });
        }
    });
    
    if (!hasAnyData) {
        md = "No environmental data points found in the document.";
    }
    
    return md;
}

function formatTask3ToMarkdown(data) {
    if (!data) return "No data returned.";
    
    let md = `*   **Business Overview:** ${data.businessOverview || 'N/A'}
*   **Segment Information/Description:** ${data.segmentInformation || 'N/A'}
*   **Product Breakdown Information:** ${data.productBreakdown || 'N/A'}
*   **Outsourcing Information:** ${data.outsourcingInformation || 'N/A'}
*   **Granularity Basis for Mapping:** ${data.granularityBasis || 'N/A'}
*   **Revenue Consistency Status:** ${data.revenueConsistencyStatus || 'N/A'}`;
    
    if (data.financialTable && data.financialTable.length > 0) {
        const headers = ["Metric", "Value", "Unit / Currency", "Page Source (PDF#)", "Section"];
        md += `\n\n**Financial Data Table**\n\n`;
        md += `| ${headers.join(" | ")} |\n`;
        md += `| ${headers.map(() => "---").join(" | ")} |\n`;
        data.financialTable.forEach(r => {
            md += `| ${r.metric || 'N/A'} | ${r.value || 'N/A'} | ${r.unitCurrency || 'N/A'} | ${r.pageSource || 'N/A'} | ${r.section || 'N/A'} |\n`;
        });
    } else {
        md += `\n\nNo financial data points found.`;
    }
    
    return md;
}

function formatTask4ToMarkdown(data) {
    if (!data) return "No data returned.";
    
    let md = `**Data Availability Notes**\n\n`;
    
    if (data.dataAvailabilityNotes && data.dataAvailabilityNotes.length > 0) {
        data.dataAvailabilityNotes.forEach(note => {
            md += `*   ${note}\n`;
        });
    } else {
        md += `No data availability notes recorded.`;
    }
    
    return md;
}

function formatTask5ToMarkdown(data) {
    if (!data || !data.qcChecks || data.qcChecks.length === 0) return "No QC checklist data generated.";
    
    let md = "**Quality Control (QC) Audit Findings**\n\n";
    md += "| QC Check | Status | Findings / Corrections / Missed Data |\n";
    md += "| --- | --- | --- |\n";
    
    data.qcChecks.forEach(c => {
        const isPassed = c.status.toLowerCase().includes("passed");
        const statusEmoji = isPassed ? "✅ Passed" : "⚠️ Discrepancy/Correction";
        let findingsClean = c.findings ? c.findings : 'N/A';
        // Escape pipe characters to prevent breaking table borders
        findingsClean = findingsClean.replace(/\|/g, '\\|');
        // Convert newlines to HTML break tags for multiline cell support
        findingsClean = findingsClean.replace(/\n/g, '<br>');
        md += `| ${c.checkName} | ${statusEmoji} | ${findingsClean} |\n`;
    });
    
    return md;
}

function formatVarianceTask1ToMarkdown(data) {
    if (!data || !data.kpis || data.kpis.length === 0) return "No KPIs identified.";
    let md = "**Identified Multi-Year KPIs from Chat History:**\n\n";
    md += "| KPI Name | Target Year Value | Previous Year Value | Page Source (PDF#) |\n";
    md += "| --- | --- | --- | --- |\n";
    data.kpis.forEach(k => {
        md += `| ${k.kpiName} | ${k.targetYearValue} ${k.targetYearUnit} | ${k.previousYearValue} ${k.previousYearUnit} | ${k.pageSource} |\n`;
    });
    return md;
}

function formatVarianceTask2ToMarkdown(data) {
    if (!data || !data.highVarianceKpis || data.highVarianceKpis.length === 0) return "No KPIs found with >20% variance.";
    let md = "**KPIs with >20% Variance:**\n\n";
    md += "| KPI Name | Previous Year Value | Target Year Value | Variance (%) | Direction |\n";
    md += "| --- | --- | --- | --- | --- |\n";
    data.highVarianceKpis.forEach(k => {
        md += `| ${k.kpiName} | ${k.previousYearValue} | ${k.targetYearValue} | ${k.variancePercent} | ${k.direction} |\n`;
    });
    return md;
}

function formatVarianceTask3ToMarkdown(data) {
    if (!data || !data.explanations || data.explanations.length === 0) return "No explanations found in the documents.";
    let md = "**Explanations for Variances (>20%):**\n\n";
    md += "| KPI Name | Variance (%) | Explanation / Reason | Page Source (PDF#) |\n";
    md += "| --- | --- | --- | --- |\n";
    data.explanations.forEach(e => {
        let reasonClean = e.reason ? e.reason : 'N/A';
        reasonClean = reasonClean.replace(/\|/g, '\\|');
        md += `| ${e.kpiName} | ${e.variancePercent} | ${reasonClean} | ${e.pageSource} |\n`;
    });
    return md;
}

function getTaskSchemaAndFormatter(taskName) {
    const name = taskName.toLowerCase();
    
    // Route to variance-specific schemas if Variance Analysis preset is active
    if (activePrefix) {
        const active = promptPrefixes.find(p => p.id === activePrefix);
        if (active && active.name.toLowerCase().includes("variance")) {
            if (name.includes("task 1")) {
                return { schema: VarianceTask1Schema, formatter: formatVarianceTask1ToMarkdown };
            }
            if (name.includes("task 2")) {
                return { schema: VarianceTask2Schema, formatter: formatVarianceTask2ToMarkdown };
            }
            if (name.includes("task 3")) {
                return { schema: VarianceTask3Schema, formatter: formatVarianceTask3ToMarkdown };
            }
            return { schema: null, formatter: null };
        }
    }

    if (name.includes("task 1") || name.includes("document identification") || name.includes("reporting scope")) {
        return { schema: Task1Schema, formatter: formatTask1ToMarkdown };
    }
    if (name.includes("task 2") || name.includes("granular environmental") || name.includes("environmental data")) {
        return { schema: Task2Schema, formatter: formatTask2ToMarkdown };
    }
    if (name.includes("task 3") || name.includes("business context") || name.includes("financial data")) {
        return { schema: Task3Schema, formatter: formatTask3ToMarkdown };
    }
    if (name.includes("task 4") || name.includes("missing information") || name.includes("auditor mode")) {
        return { schema: Task4Schema, formatter: formatTask4ToMarkdown };
    }
    if (name.includes("task 5") || name.includes("quality control") || name.includes("qc checklist")) {
        return { schema: Task5Schema, formatter: formatTask5ToMarkdown };
    }
    return { schema: null, formatter: null };
}

// Note: Mode selector DOM reference was removed since Chat mode was eliminated.

function parseTasksFromPrompt(promptText) {
    const tasks = [];
    const parts = promptText.split(/(?=\*\*Task \d+:)/g);
    const globalContext = parts[0].trim();
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        
        const lines = part.split('\n');
        const firstLine = lines[0].replace(/\*\*|#/g, '').trim();
        
        tasks.push({
            name: firstLine,
            prompt: part
        });
    }
    
    return { globalContext, tasks };
}

async function runAllSequentialTasks() {
    if (isRunningSeq) return;
    if (API_KEYS.length === 0) {
        showToast("No Gemini API keys configured. Please inject keys via environment/build.", "error");
        return;
    }
    if (seqTasks.length === 0) { showToast('No tasks defined. Load a preset first.', 'error'); return; }
    if (uploadedFiles.length === 0) { showToast('Please upload at least one document first.', 'error'); return; }

    isRunningSeq = true;
    isLoading = true;
    loadingMessage = `Starting sequential extraction...`;
    render();

    // Reset task outputs
    seqTaskOutputs = {};

    // Clear active chat session to ensure clean state
    chatSession = null;

    try {
        // File uploading is now done dynamically inside each task retry loop to handle key-scoped files on rotation

        // Retrieve other settings
        const globalCtx = seqGlobalContext || '';
        const passPrev = true;
        const stopOnError = true;
        let prevOutput = '';

        const selectedModel = modelSelect ? modelSelect.value : MODEL_NAME;
        const model = genAI.getGenerativeModel({ model: selectedModel });

        // Add a single consolidated user query for the entire run
        const userText = `**[Sequential Run] Starting analysis using ${seqTasks.length} tasks...**`;
        messages.push({
            id: Date.now(),
            role: 'user',
            text: userText
        });
        render();

        // Add a single consolidated model response placeholder
        const consolidatedResponseId = Date.now() + 1;
        messages.push({
            id: consolidatedResponseId,
            role: 'model',
            text: '',
            tokenCounts: { input: 0, output: 0 }
        });
        render();

        let consolidatedText = '';
        let completedTasksInputTokens = 0;
        let completedTasksOutputTokens = 0;

        // Process tasks sequentially
        for (let i = 0; i < seqTasks.length; i++) {
            const task = seqTasks[i];
            
            isLoading = true;
            loadingMessage = `Running Task ${i + 1}/${seqTasks.length}: ${task.name}...`;
            render();

            const taskHeader = (i === 0) ? `## ⚡ ${task.name}\n\n` : `\n\n---\n\n## ⚡ ${task.name}\n\n`;
            const baseContentBeforeTask = consolidatedText;
            
            // Append task header to the consolidated message
            let modelMessageIndex = messages.findIndex(msg => msg.id === consolidatedResponseId);
            if (modelMessageIndex !== -1) {
                messages[modelMessageIndex].text = baseContentBeforeTask + taskHeader;
                render();
            }

            try {
                // Resolve task schema & formatter
                const { schema, formatter } = getTaskSchemaAndFormatter(task.name);

                // Build prompt
                let taskPrompt = '';
                if (globalCtx) {
                    taskPrompt += `**GLOBAL CONTEXT & RULES (apply to all tasks):**\n${globalCtx}\n\n---\n\n`;
                }
                taskPrompt += task.prompt;
                if (passPrev && i > 0) {
                    taskPrompt += `\n\n---\n**OUTPUTS FROM PREVIOUS TASKS (for reference only):**\n`;
                    for (let prevIdx = 0; prevIdx < i; prevIdx++) {
                        const prevTask = seqTasks[prevIdx];
                        const prevOutputVal = seqTaskOutputs[prevTask.id] || '';
                        if (prevOutputVal) {
                            taskPrompt += `\n### ${prevTask.name}\n${prevOutputVal}\n`;
                        }
                    }
                }

                if (schema) {
                    taskPrompt += `\n\nCRITICAL: You MUST respond with a JSON object that strictly adheres to the requested JSON schema structure. Do not output markdown tables, HTML, or conversational text. Output ONLY the raw JSON matching the schema. All fields should be fully populated based on the uploaded documents.`;
                }

                // Stream response with retries on 429/403/permission
                const genConfig = {
                    temperature: schema ? 0.25 : 0.5,
                    maxOutputTokens: 65536
                };

                if (schema) {
                    genConfig.responseMimeType = "application/json";
                    genConfig.responseSchema = schema;
                }

                let result = null;
                let attempt = 0;
                let attemptTaskInputTokens = 0;
                const maxAttempts = API_KEYS.length > 1 ? API_KEYS.length : 3;
                let waitDelay = 7000;

                while (attempt < maxAttempts) {
                    try {
                        // Re-get model instance with the current active key
                        const activeModel = genAI.getGenerativeModel({ model: selectedModel });
                        
                        // Build parts array dynamically for the current active key
                        const parts = [{ text: taskPrompt }];
                        if (uploadedFiles.length > 0) {
                            updateProgressBar(0, "Preparing files...");
                            for (let fIdx = 0; fIdx < uploadedFiles.length; fIdx++) {
                                const file = uploadedFiles[fIdx];
                                const meta = await getOrUploadFile(file);
                                parts.push({
                                    fileData: {
                                        mimeType: meta.mimeType,
                                        fileUri: meta.uri
                                    }
                                });
                            }
                            hideProgressBar();
                        }

                        // Build contents array including prior chat history (before the current sequential run)
                        const contents = [];
                        let lastAddedRole = null;
                        
                        if (messages.length > 2) {
                            for (let idx = 0; idx < messages.length - 2; idx++) {
                                const msg = messages[idx];
                                if (msg.text && (msg.role === 'user' || msg.role === 'model')) {
                                    const role = msg.role === 'model' ? 'model' : 'user';
                                    
                                    if (role === lastAddedRole) {
                                        contents[contents.length - 1].parts[0].text += `\n\n${msg.text}`;
                                    } else {
                                        contents.push({
                                            role: role,
                                            parts: [{ text: msg.text }]
                                        });
                                        lastAddedRole = role;
                                    }
                                }
                            }
                        }
                        
                        // Add the current task prompt + files as the active user turn
                        if (lastAddedRole === 'user') {
                            // Merge the text of the new taskPrompt into the last part's text if it's text
                            const lastPart = contents[contents.length - 1].parts[0];
                            if (lastPart && typeof lastPart.text === 'string') {
                                lastPart.text += `\n\n${taskPrompt}`;
                            } else {
                                contents[contents.length - 1].parts.push({ text: taskPrompt });
                            }
                            // Append any files (skip the first element of parts which is the text taskPrompt)
                            if (parts.length > 1) {
                                contents[contents.length - 1].parts.push(...parts.slice(1));
                            }
                        } else {
                            contents.push({
                                role: 'user',
                                parts: parts
                            });
                        }

                        // Count input tokens and add to consolidated count
                        let taskInputTokens = 0;
                        try {
                            const countResult = await activeModel.countTokens({
                                contents: contents,
                                systemInstruction: SYSTEM_INSTRUCTION
                            });
                            taskInputTokens = countResult.totalTokens;
                            let modelMessageIndex = messages.findIndex(msg => msg.id === consolidatedResponseId);
                            if (modelMessageIndex !== -1) {
                                messages[modelMessageIndex].tokenCounts.input = completedTasksInputTokens + taskInputTokens;
                            }
                        } catch (e) {
                            console.error('Error counting input tokens for task:', e);
                        }

                        result = await activeModel.generateContentStream({
                            contents: contents,
                            systemInstruction: SYSTEM_INSTRUCTION,
                            generationConfig: genConfig
                        });
                        
                        attemptTaskInputTokens = taskInputTokens;
                        break; // Success! Break out of the retry loop
                    } catch (streamError) {
                        const errMsg = (streamError.message || "").toLowerCase();
                        if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("resource exhausted") || errMsg.includes("api key") || errMsg.includes("permission") || errMsg.includes("403")) {
                            if (API_KEYS.length > 1) {
                                attempt++;
                                console.warn(`Task ${task.name} failed with rate limit/quota or permissions error. Rotating key and retrying immediately...`);
                                rotateAPIKey();
                                continue;
                            } else {
                                attempt++;
                                if (attempt >= maxAttempts) throw streamError;
                                
                                console.warn(`Rate limit / Quota exceeded (429). Retrying in ${waitDelay / 1000}s...`);
                                
                                // Update loading indicator message to notify the user
                                isLoading = true;
                                loadingMessage = `Rate limit reached. Cooldown active... Retrying task in ${waitDelay / 1000}s...`;
                                render();
                                
                                await new Promise(resolve => setTimeout(resolve, waitDelay));
                                
                                // Reset loading status back to normal after cooldown
                                loadingMessage = `Running Task ${i + 1}/${seqTasks.length}: ${task.name}...`;
                                render();
                                
                                waitDelay *= 1.5; // Exponential increase
                                continue;
                            }
                        } else {
                            throw streamError;
                        }
                    }
                }

                let responseText = '';
                let taskOutputTokens = 0;
                let warningMessage = '';
                for await (const chunk of result.stream) {
                    responseText += chunk.text();
                    
                    if (chunk.candidates && chunk.candidates.length > 0) {
                        const finishReason = chunk.candidates[0].finishReason;
                        if (finishReason && finishReason !== 'STOP') {
                            if (finishReason === 'SAFETY') {
                                warningMessage = '\n\n**[Generation stopped due to Safety Filters]**';
                            } else if (finishReason === 'MAX_TOKENS') {
                                warningMessage = '\n\n**[Generation stopped due to Max Token Limit]**';
                            } else {
                                warningMessage = `\n\n**[Generation stopped: ${finishReason}]**`;
                            }
                        }
                    }

                    if (chunk.usageMetadata) {
                        taskOutputTokens = chunk.usageMetadata.candidatesTokenCount;
                    }

                    modelMessageIndex = messages.findIndex(msg => msg.id === consolidatedResponseId);
                    if (modelMessageIndex !== -1) {
                        // Display progress in the UI during streaming
                        const displayProgress = schema 
                            ? `*Extracting structured ESG data...*\n\n\`\`\`json\n${responseText}\n\`\`\`${warningMessage}` 
                            : (responseText + warningMessage);
                        messages[modelMessageIndex].text = baseContentBeforeTask + taskHeader + displayProgress;
                        messages[modelMessageIndex].tokenCounts.output = completedTasksOutputTokens + taskOutputTokens;
                        render();
                    }
                }

                // Process formatting on completion of task
                let parsedMarkdown = responseText;
                if (schema && formatter) {
                    try {
                        let cleanText = responseText.trim();
                        if (cleanText.startsWith("```")) {
                            cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
                        }
                        let parsedData;
                        try {
                            parsedData = JSON.parse(cleanText);
                        } catch (firstErr) {
                            console.warn("Standard JSON parsing failed, attempting repair:", firstErr);
                            const repairedText = repairTruncatedJson(cleanText);
                            parsedData = JSON.parse(repairedText);
                        }
                        parsedMarkdown = formatter(parsedData);
                    } catch (parseErr) {
                        console.warn("Failed to parse task JSON response, falling back to raw response:", parseErr);
                    }
                }

                // Append warning message if any
                if (warningMessage) {
                    parsedMarkdown += warningMessage;
                }

                modelMessageIndex = messages.findIndex(msg => msg.id === consolidatedResponseId);
                if (modelMessageIndex !== -1) {
                    messages[modelMessageIndex].text = baseContentBeforeTask + taskHeader + parsedMarkdown;
                    render();
                }

                consolidatedText = baseContentBeforeTask + taskHeader + parsedMarkdown;
                prevOutput = parsedMarkdown;
                seqTaskOutputs[task.id] = parsedMarkdown;

                // Accumulate tokens on success
                completedTasksInputTokens += attemptTaskInputTokens;
                completedTasksOutputTokens += taskOutputTokens;

            } catch (taskError) {
                console.error(`Task ${task.name} failed:`, taskError);
                modelMessageIndex = messages.findIndex(msg => msg.id === consolidatedResponseId);
                if (modelMessageIndex !== -1) {
                    messages[modelMessageIndex].text = baseContentBeforeTask + taskHeader + `**Error:** ${taskError.message}`;
                    consolidatedText = messages[modelMessageIndex].text;
                    render();
                }
                if (stopOnError) {
                    modelMessageIndex = messages.findIndex(msg => msg.id === consolidatedResponseId);
                    if (modelMessageIndex !== -1) {
                        messages[modelMessageIndex].text += '\n\n⚠️ **Sequential run aborted due to task failure.**';
                        consolidatedText = messages[modelMessageIndex].text;
                        render();
                    }
                    break;
                }
            }
        }

    } catch (err) {
        console.error('Sequential run failed:', err);
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        isLoading = false;
        isRunningSeq = false;
        render();
    }
}

// No-op (initialization removed)


