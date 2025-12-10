# Project Scaffolder (SGMTR)

Project Scaffolder is a VS Code extension that helps you understand, visualize, and generate project structures.  
It works in both directions:

1. Generate a structure file (.sgmtr) from an existing project.  
2. Generate folders and files from a .sgmtr structure file.

It is available in the VS Code Marketplace under the name Project Scaffolder.

---

## Features

### 1. Reverse Generation (Code to Structure)
Create a `.sgmtr` file from any folder.  
The file includes:

- Complete folder and file hierarchy  
- Language-based detection  
- Import and export mappings for JavaScript, TypeScript, Python, Java, C and C++  
- File metadata

Use this to understand and document any codebase quickly.

---

### 2. Structural Preview (Read-Only)
Preview your `.sgmtr` file before writing anything to disk.

Two preview modes are supported:

- Structure-only view  
- Structure with import/export information

Previewing is safe and does not modify your workspace.

---

### 3. Forward Generation (Structure to Code)
Use a `.sgmtr` file to generate folders and files automatically.  
This is useful for scaffolding new projects or reusing existing layouts.

---

### 4. Workspace Templates
The extension includes ready-to-use enterprise templates:

- Chrome / Web Extension (MV3)  
- MERN Full-Stack App  
- Microservices Backend Skeleton  
- Monorepo (Frontend, Backend, Shared Packages)

Selecting a template generates a complete project structure.

---

### 5. .sgmtrignore Support
You can generate a `.sgmtrignore` from your `.gitignore`.  
This keeps your structural maps clean by excluding build folders, dependencies, system files, and other ignored paths.

---

### 6. Round-Trip Workflow
SGMTR supports a full two-way workflow:

- Reverse generate an `.sgmtr` file from an existing project  
- Edit or refine the structure  
- Forward generate a new scaffold  
- Continue coding and reverse generate again when needed

Your project structure stays consistent and documented.

---

## Commands

All commands are available in the Command Palette and the Explorer context menu.

- SGMTR: Create .sgmtr from Folder  
- SGMTR: Generate Preview  
- SGMTR: Generate Directory  
- SGMTR: Create Project from Template  
- Generate .sgmtrignore from .gitignore  
- Flow Preview (experimental)

Flow Preview is under development and may not be stable yet.

---

## How to Use

### Reverse Generate
Right-click any folder and choose **SGMTR: Create .sgmtr from Folder**.  
A `.sgmtr` file will be created at the workspace root.

### Preview
Right-click a `.sgmtr` file and select **SGMTR: Generate Preview**.  
Inspect the structure before generating anything.

### Forward Generate
Right-click a `.sgmtr` file and choose **SGMTR: Generate Directory**.  
A full project structure will be created.

### Templates
Run **SGMTR: Create Project from Template** and select one of the available templates.

---

## Bug Reports and Feedback
If you find any issues or have suggestions, please report them using the GitHub Issues page linked in the extension listing.  
Feedback is welcomed and helps improve the tool.

