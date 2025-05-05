# Scholar AI Agent: Agentic AI Research Assistant Powered by FlashAttention

### Developed by [notprakhargupta](https://github.com/notprakhargupta)

Scholar AI Agent is an intelligent, autonomous research assistant leveraging Agentic AI and FlashAttention. It efficiently searches, summarizes, and synthesizes complex scientific literature from sources like arXiv, enabling quick and accurate insights into the latest research.

## Project Structure

```
.
├── Agent/                 # Contains agent logic and planning scripts
├── data/                  # Stores downloaded scientific papers
├── docs/                  # Project documentation and usage instructions
├── models/                # Transformer models optimized with FlashAttention
├── src/                   # Core source code and utility scripts
├── .vscode/               # VSCode workspace settings
├── app.py                 # Main application script
├── components.json        # UI component configurations
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Requirements

* Python 3.8+
* Node.js (for UI components)

### Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### Running the Application

```bash
# Start the Python backend
python app.py

# Start the Next.js frontend
yarn dev
```

Your application will run locally, accessible via the frontend UI.

## Key Technologies

* **FlashAttention**: Accelerates transformer models for long-context document processing.
* **Agentic AI**: Automates multi-step research workflows and planning.
* **arXiv Integration**: Directly fetches and analyzes scientific literature.

## Contributions

Feel free to fork the project and contribute enhancements or open issues for suggestions and bug reports.

---

© 2024 Scholar AI Agent by [notprakhargupta](https://github.com/notprakhargupta). All rights reserved.
