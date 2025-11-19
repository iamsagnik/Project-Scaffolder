# Folder Structure Generator

A VS Code extension that generates folders and files from a `.sgmtr` specification.

## How it works

1. Create a file named `project.sgmtr`.
2. Write JSON describing your structure:

```json
{
  "src": {
    "components": {
      "Header.jsx": "// header component"
    },
    "utils": {
      "api.js": "// api code"
    }
  },
  "README.md": "# project"
}
