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
    const toneSelect = document.getElementById('toneSelect');
    const explainToggle = document.getElementById('explainToggle');
    const explanationPanel = document.getElementById('explanationPanel');
    const explanationText = document.getElementById('explanationText');

    // State
    const STORAGE_KEY = 'gemini_api_key';

    // Initialize
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
        apiKeyInput.value = savedKey;
    } else {
        // specific UX: If no key, show settings immediately
        settingsPanel.classList.remove('hidden');
    }

    // Event Listeners
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem(STORAGE_KEY, key);
            alert('API Key saved!');
            settingsPanel.classList.add('hidden');
        } else {
            alert('Please enter a valid API Key.');
        }
    });

    inputText.addEventListener('input', () => {
        const length = inputText.value.length;
        charCount.textContent = `${length} chars`;
    });

    copyBtn.addEventListener('click', () => {
        if (!outputText.textContent) return;

        const textToCopy = outputText.innerText; // internal text handles newlines better usually
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✓</span>'; // Quick visual feedback
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    fixBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        const apiKey = localStorage.getItem(STORAGE_KEY);

        if (!text) {
            alert('Please enter some text to fix.');
            return;
        }

        if (!apiKey) {
            alert('Please go to settings and enter your Gemini API Key first.');
            settingsPanel.classList.remove('hidden');
            return;
        }

        // Set Loading State
        setLoading(true);
        outputText.textContent = ''; // Clear previous output

        try {
            const tone = toneSelect.value;
            const explain = explainToggle.checked;

            const result = await callGeminiAPI(text, apiKey, tone, explain);

            if (result.correctedText) {
                outputText.textContent = result.correctedText;
            } else {
                outputText.textContent = result; // Fallback if plain text
            }

            if (result.explanation && explain) {
                explanationText.textContent = result.explanation;
                explanationPanel.classList.remove('hidden');
            } else {
                explanationPanel.classList.add('hidden');
            }
        } catch (error) {
            console.error(error);
            outputText.textContent = `Error: ${error.message}`;
        } finally {
            setLoading(false);
        }
    });

    // Helper Functions
    function setLoading(isLoading) {
        if (isLoading) {
            fixBtn.disabled = true;
            loadingSpinner.classList.remove('hidden');
            btnText.classList.add('hidden');
        } else {
            fixBtn.disabled = false;
            loadingSpinner.classList.add('hidden');
            btnText.classList.remove('hidden');
        }
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
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const response = await fetch(API_URL, {
            method: 'POST', // ... rest of fetch
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
        }

        const data = await response.json();

        // Extracting text from Gemini response structure
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            const rawText = data.candidates[0].content.parts[0].text.trim();

            if (explain) {
                // Try to parse JSON
                try {
                    // Clean markdown code blocks if present
                    const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                    return JSON.parse(jsonString);
                } catch (e) {
                    console.error("Failed to parse JSON response", e);
                    return { correctedText: rawText, explanation: "Could not parse explanation." };
                }
            } else {
                return { correctedText: rawText };
            }
        } else {
            throw new Error('Unexpected response format from Gemini.');
        }
    }
});
