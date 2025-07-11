# SpeakFree Translator

Live, on-demand translation for web chats and social media.

---

## Features
- **Live translation** for WhatsApp Web and LinkedIn Messaging
- **On-demand translation**: Hover over any message to see its translation
- **Context-aware**: Translates with chat context for more natural results
- **Language detection**: Detects the main language of each chat
- **Outgoing message translation**: Optionally confirm and edit translations before sending
- **Customizable**: Choose your primary (target) language in the extension settings

---

## Supported Platforms
- **WhatsApp Web** (`https://web.whatsapp.com/`)
- **LinkedIn Messaging** (`https://www.linkedin.com/`)

---

## Installation

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd SpeakFree
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up API keys**
   - Copy `.env.example` to `.env` and fill in your API keys:
     ```sh
     cp .env.example .env
     # Edit .env and add your keys
     ```
   - Required variables:
     - `OPENAI_API_KEY` (for OpenAI translation)
     - `GEMINI_API_KEY` (for Google Gemini translation)

4. **Build the extension**
   ```sh
   npm run build
   # or
   ./build.sh
   ```
   - This will bundle scripts, inject API keys, and copy static files to `dist/`.

5. **Load into your browser**
   - Go to `chrome://extensions` (or your browser's extension page)
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

---

## Configuration

- **Primary Language**: Set your target translation language in the extension settings (click the extension icon → Settings).
- **Translation Provider**: By default, Gemini is used. You can change the provider in code (`src/content/translation/translationService.ts`).
- **API Keys**: Never commit your real `.env` file. Use `.env.example` for sharing config.

---

## Usage

- **Hover over any message** in WhatsApp or LinkedIn to see its translation in a tooltip.
- **Outgoing messages**: When you send a message, a confirmation popup will show the translation. You can edit it before sending.
- **Settings**: Click the extension icon, then the gear/settings icon, to choose your primary language.

---

## Development

- **Source structure**:
  - `src/content/adapters/` — Platform-specific logic (WhatsApp, LinkedIn)
  - `src/content/translation/` — Translation providers and service
  - `src/content/ui/` — Tooltip and confirmation popup UI
  - `src/content/utils/` — Utilities and style injectors
  - `src/content/contentScript.ts` — Main orchestrator
  - `src/settings/` and `src/popup/` — Extension UI
- **Build**: See `build.sh` for details. Uses `esbuild` and TypeScript.
- **API Key Injection**: Keys are injected at build time using environment variables and esbuild's `--define`.
- **Adding Providers**: Implement the `TranslationProvider` interface and add to `TranslationService.availableProviders`.
- **Adding Platforms**: Extend `BaseAdapter` and add a config in `adapters/` and `configs/`.

---

## Security Notes
- **API keys** are never committed to the repo and are injected only at build time.
- **.env**: Always keep your `.env` file private.
- **Permissions**: The extension only requests access to WhatsApp and LinkedIn domains, and uses `storage` for settings.

---

## License
MIT 

---

Enjoy seamless, contextual chat translation with SpeakFree! 