const Store = require('electron-store');
const store = new Store();

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const apiKeyInput = document.getElementById('apiKey');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const fixBtn = document.getElementById('fixBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = document.querySelector('.btn-text');
    const charCount = document.getElementById('charCount');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const toneSelect = document.getElementById('toneSelect');
    const explainToggle = document.getElementById('explainToggle');
    const explanationPanel = document.getElementById('explanationPanel');
    const explanationText = document.getElementById('explanationText');
    const themeBtn = document.getElementById('themeBtn');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    const toastContainer = document.getElementById('toastContainer');

    const STORAGE_KEY = 'geminiApiKey';
    const THEME_KEY = 'theme';

    // --- Toast Notifications ---
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.2s ease forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    }

    // --- Theme ---
    const savedTheme = store.get(THEME_KEY, 'light');
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        store.set(THEME_KEY, next);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    }

    // --- API Key ---
    const savedKey = store.get(STORAGE_KEY);
    if (savedKey) {
        apiKeyInput.value = savedKey;
    } else {
        settingsPanel.classList.remove('hidden');
    }

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            store.set(STORAGE_KEY, key);
            showToast('API Key saved!', 'success');
            settingsPanel.classList.add('hidden');
        } else {
            showToast('Please enter a valid API Key.', 'error');
        }
    });

    toggleKeyVisibility.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
    });

    // --- Input / Char+Word Count ---
    inputText.addEventListener('input', updateCount);

    function updateCount() {
        const text = inputText.value;
        const chars = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        charCount.textContent = `${chars} chars · ${words} words`;
    }

    // --- Clear Button ---
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        updateCount();
        inputText.focus();
    });

    // --- Copy Button ---
    copyBtn.addEventListener('click', () => {
        const text = outputText.innerText?.trim();
        if (!text || outputText.querySelector('.empty-state')) return;

        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span style="font-size:14px">✓</span>';
            showToast('Copied to clipboard!', 'success', 2000);
            setTimeout(() => { copyBtn.innerHTML = originalIcon; }, 2000);
        }).catch(() => {
            showToast('Failed to copy.', 'error');
        });
    });

    // --- Keyboard Shortcut (Cmd/Ctrl + Enter) ---
    inputText.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            fixBtn.click();
        }
    });

    // --- Check It ---
    fixBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        const apiKey = store.get(STORAGE_KEY);

        if (!text) {
            showToast('Please enter some text to check.', 'error');
            return;
        }

        if (!apiKey) {
            showToast('Add your Gemini API Key in settings first.', 'error');
            settingsPanel.classList.remove('hidden');
            return;
        }

        setLoading(true);
        outputText.innerHTML = '';

        try {
            const tone = toneSelect.value;
            const explain = explainToggle.checked;
            const result = await callGeminiAPI(text, apiKey, tone, explain);

            if ('correctedText' in result) {
                outputText.textContent = result.correctedText;
            } else {
                outputText.textContent = '';
                showToast('Unexpected response from API.', 'error', 5000);
            }

            if (result.explanation && explain) {
                explanationText.textContent = result.explanation;
                explanationPanel.classList.remove('hidden');
            } else {
                explanationPanel.classList.add('hidden');
            }
        } catch (error) {
            console.error(error);
            outputText.textContent = '';
            showToast(`Error: ${error.message}`, 'error', 5000);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        fixBtn.disabled = isLoading;
        loadingSpinner.classList.toggle('hidden', !isLoading);
        btnText.classList.toggle('hidden', isLoading);
    }

    async function callGeminiAPI(text, apiKey, tone, explain) {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        let prompt = `Please correct the grammar, spelling, and punctuation of the following text.\n\nTone: ${tone}\n`;

        if (explain) {
            prompt += `Also provide a brief explanation of the major changes made.\n`;
            prompt += `Return the result as a VALID JSON object with the following structure: { "correctedText": "...", "explanation": "..." }.\n`;
        } else {
            prompt += `Return ONLY the corrected text. Do not add any markdown formatting unless asked.\n`;
        }

        prompt += `Here is the text:\n\n${text}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
        }

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts) {
            const rawText = data.candidates[0].content.parts[0].text.trim();

            if (explain) {
                try {
                    const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                    return JSON.parse(jsonString);
                } catch (e) {
                    return { correctedText: rawText, explanation: 'Could not parse explanation.' };
                }
            } else {
                return { correctedText: rawText };
            }
        } else {
            throw new Error('Unexpected response format from Gemini.');
        }
    }
});
