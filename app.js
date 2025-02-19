// Tool switching functionality
class CreativeStudio {
    constructor() {
        this.currentTool = null;
        this.tools = {
            photo: {
                canvas: null,
                ctx: null,
                editor: null,
                isDrawing: false,
                lastX: 0,
                lastY: 0
            },
            video: {
                player: null,
                stream: null
            },
            code: {
                editor: null
            }
        };

        // Initialize immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Initialize event listeners first
        this.initializeEventListeners();
        
        // Initialize settings
        this.settings = new Settings(this);

        // Create canvas but don't initialize photo editor yet
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.classList.add('editor-canvas', 'photo-canvas');
        this.tools.photo.canvas = canvas;
        this.tools.photo.ctx = canvas.getContext('2d');

        // Show welcome screen
        this.showWelcomeScreen();

        // Hide photo toolbar initially
        const photoToolbar = document.querySelector('.photo-toolbar');
        if (photoToolbar) {
            photoToolbar.style.display = 'none';
        }
    }

    initializeEventListeners() {
        // Tool switching
        const toolButtons = document.querySelectorAll('.tool-btn:not(#settingsBtn)');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTool(e.currentTarget);
            });
        });
    }

    showWelcomeScreen() {
        const canvas = document.querySelector('.canvas');
        canvas.innerHTML = `
            <div class="welcome-screen">
                <h1>Welcome to Fade Creative Studio</h1>
                <p>Choose a tool to get started:</p>
                <div class="welcome-tools">
                    <button class="welcome-tool-btn" data-tool="photo">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M4,9H20V18H4V9Z"/>
                        </svg>
                        <span>Photo Editor</span>
                        <p>Edit, draw, and enhance your images</p>
                    </button>
                    <button class="welcome-tool-btn" data-tool="video">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
                        </svg>
                        <span>Video Editor</span>
                        <p>Record and edit video content</p>
                    </button>
                    <button class="welcome-tool-btn" data-tool="code">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z"/>
                        </svg>
                        <span>Code Editor</span>
                        <p>Write and preview HTML/CSS code</p>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners to welcome buttons
        const welcomeButtons = document.querySelectorAll('.welcome-tool-btn');
        welcomeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.currentTarget.dataset.tool;
                // First find and click the corresponding sidebar button
                const sidebarBtn = document.querySelector(`.tool-btn[data-tool="${toolName}"]`);
                if (sidebarBtn) {
                    // Remove active class from all buttons
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    // Add active class to selected button
                    sidebarBtn.classList.add('active');
                    // Switch to the tool
                    this.switchTool(sidebarBtn);
                }
            });
        });
    }

    switchTool(selectedBtn) {
        // Remove active class from all buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to selected button
        selectedBtn.classList.add('active');

        // Get tool name from data attribute
        const toolName = selectedBtn.dataset.tool;
        this.currentTool = toolName;

        // Clear canvas area
        const canvas = document.querySelector('.canvas');
        canvas.innerHTML = '';

        // Show/hide photo toolbar
        const photoToolbar = document.querySelector('.photo-toolbar');
        if (photoToolbar) {
            photoToolbar.style.display = toolName === 'photo' ? 'flex' : 'none';
        }

        // Load appropriate editor
        switch(toolName) {
            case 'photo':
                // Create new PhotoEditor instance
                this.tools.photo.editor = new PhotoEditor(this.tools.photo.canvas, this.tools.photo.ctx);
                // Initialize editor (this will show the canvas size modal)
                this.tools.photo.editor.initialize();
                break;
            case 'video':
                this.initializeVideoEditor(canvas);
                break;
            case 'code':
                this.initializeCodeEditor(canvas);
                break;
        }
    }

    async initializeVideoEditor(container) {
        const videoElement = document.createElement('video');
        videoElement.style.width = '100%';
        videoElement.style.maxWidth = '800px';
        videoElement.autoplay = true;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.tools.video.stream = stream;
            videoElement.srcObject = stream;
            container.appendChild(videoElement);
            this.tools.video.player = videoElement;
        } catch (err) {
            container.innerHTML = `<div class="error-message">
                Unable to access camera: ${err.message}
            </div>`;
        }
    }

    initializeCodeEditor(container) {
        // Create editor container
        const editorContainer = document.createElement('div');
        editorContainer.className = 'code-editor-container';
        
        // Create panels
        editorContainer.innerHTML = `
            <div class="editor-panels">
                <div class="editor-panel">
                    <div class="panel-header">
                        <h3>HTML</h3>
                        <button class="run-btn">Run</button>
                    </div>
                    <textarea class="code-editor html-editor" placeholder="Enter HTML here..."><!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html></textarea>
                </div>
                <div class="editor-panel">
                    <div class="panel-header">
                        <h3>CSS</h3>
                    </div>
                    <textarea class="code-editor css-editor" placeholder="Enter CSS here...">body {
    font-family: system-ui;
    background: #f5f5f7;
    color: #1d1d1f;
    padding: 20px;
}

h1 {
    color: #0071e3;
}</textarea>
                </div>
            </div>
            <div class="preview-panel">
                <div class="panel-header">
                    <h3>Preview</h3>
                    <div class="preview-controls">
                        <button class="preview-size-btn" data-size="desktop">Desktop</button>
                        <button class="preview-size-btn" data-size="tablet">Tablet</button>
                        <button class="preview-size-btn" data-size="mobile">Mobile</button>
                    </div>
                </div>
                <div class="preview-container">
                    <iframe id="previewFrame" title="Preview"></iframe>
                </div>
            </div>
        `;

        container.appendChild(editorContainer);

        // Initialize the web editor functionality
        this.tools.code.editor = new WebEditor(editorContainer);
    }
}

class Settings {
    constructor(studio) {
        this.studio = studio;
        this.settings = {
            theme: 'light',
            fontSize: '14',
            toolbarPosition: 'top',
            canvasSize: 'medium',
            autoSave: true
        };

        // Get DOM elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.overlay = document.querySelector('.overlay');

        // Create settings panel
        this.createSettingsPanel();
        
        // Add click event to settings button
        this.settingsBtn.addEventListener('click', () => {
            this.panel.classList.add('active');
            this.overlay.classList.add('active');
        });

        // Add click event to overlay
        this.overlay.addEventListener('click', () => {
            this.panel.classList.remove('active');
            this.overlay.classList.remove('active');
        });

        // Load saved settings
        this.loadSettings();
    }

    createSettingsPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'settings-panel';
        this.panel.innerHTML = `
            <div class="settings-header">
                <h2>Settings</h2>
                <button class="close-settings">✕</button>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>Theme</h3>
                    <div class="theme-group">
                        <h4>Light Themes</h4>
                        <div class="theme-selector">
                            <div class="theme-option ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                                <span class="theme-preview light"></span>
                                Light
                            </div>
                            <div class="theme-option ${this.settings.theme === 'light-warm' ? 'active' : ''}" data-theme="light-warm">
                                <span class="theme-preview light-warm"></span>
                                Warm
                            </div>
                            <div class="theme-option ${this.settings.theme === 'light-cool' ? 'active' : ''}" data-theme="light-cool">
                                <span class="theme-preview light-cool"></span>
                                Cool
                            </div>
                        </div>
                        <h4>Dark Themes</h4>
                        <div class="theme-selector">
                            <div class="theme-option ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                <span class="theme-preview dark"></span>
                                Dark
                            </div>
                            <div class="theme-option ${this.settings.theme === 'dark-warm' ? 'active' : ''}" data-theme="dark-warm">
                                <span class="theme-preview dark-warm"></span>
                                Warm
                            </div>
                            <div class="theme-option ${this.settings.theme === 'dark-cool' ? 'active' : ''}" data-theme="dark-cool">
                                <span class="theme-preview dark-cool"></span>
                                Cool
                            </div>
                        </div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Font Size</h3>
                    <select class="setting-select" data-setting="fontSize">
                        <option value="12" ${this.settings.fontSize === '12' ? 'selected' : ''}>Small</option>
                        <option value="14" ${this.settings.fontSize === '14' ? 'selected' : ''}>Medium</option>
                        <option value="16" ${this.settings.fontSize === '16' ? 'selected' : ''}>Large</option>
                    </select>
                </div>
                <div class="settings-section">
                    <h3>Canvas Size</h3>
                    <select class="setting-select" data-setting="canvasSize">
                        <option value="small" ${this.settings.canvasSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${this.settings.canvasSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${this.settings.canvasSize === 'large' ? 'selected' : ''}>Large</option>
                    </select>
                </div>
                <div class="settings-section">
                    <h3>Auto Save</h3>
                    <input type="checkbox" id="autoSave" ${this.settings.autoSave ? 'checked' : ''}>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(this.panel);

        // Add close button event
        const closeBtn = this.panel.querySelector('.close-settings');
        closeBtn.addEventListener('click', () => {
            this.panel.classList.remove('active');
            this.overlay.classList.remove('active');
        });

        // Add theme selection events
        this.panel.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.updateSetting('theme', theme);
                this.panel.querySelectorAll('.theme-option').forEach(opt => 
                    opt.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Add select input events
        this.panel.querySelectorAll('.setting-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateSetting(e.target.dataset.setting, e.target.value);
            });
        });
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('studioSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('studioSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            this.applySettings();
        }
    }

    applySettings() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.documentElement.style.setProperty('--base-font-size', `${this.settings.fontSize}px`);
    }
}

class PhotoEditor {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isDrawing = false;
        this.tool = 'brush';
        this.color = '#000000';
        this.strokeWidth = 2;
        this.undoStack = [];
        this.redoStack = [];
        this.lastX = 0;
        this.lastY = 0;
        this.textInput = null;
        this.scale = 1;
        this.points = [];
        this.animationFrameId = null;
        this.canvasRect = null;
        this.objects = [];
        this.selectedObject = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Initialize color picker
        const colorPickerContainer = document.querySelector('.color-picker');
        this.colorPicker = new ColorPicker(colorPickerContainer, (color) => {
            this.color = color;
        });

        // Remove the old color picker event listeners
        this.initializeTools();
    }

    initialize() {
        // Show canvas size modal first
        this.showCanvasSizeModal().then(() => {
            // Add canvas to workspace
            const canvasContainer = document.querySelector('.canvas');
            canvasContainer.innerHTML = '';
            canvasContainer.appendChild(this.canvas);
            
            // Fit canvas after adding to container
            this.fitCanvasToContainer();
            
            // Initialize tools after canvas is properly sized
            this.initializeTools();
            this.createLayersPanel();
            this.saveState();
            this.updateCanvasRect();
        });
    }

    showCanvasSizeModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'canvas-size-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Select Canvas Size</h2>
                    <div class="canvas-presets">
                        <button data-size="small" data-width="800" data-height="600">
                            <span class="size-preview"></span>
                            <div>
                                <h3>Small</h3>
                                <p>800 x 600</p>
                            </div>
                        </button>
                        <button data-size="medium" data-width="1024" data-height="768">
                            <span class="size-preview"></span>
                            <div>
                                <h3>Medium</h3>
                                <p>1024 x 768</p>
                            </div>
                        </button>
                        <button data-size="large" data-width="1280" data-height="720">
                            <span class="size-preview"></span>
                            <div>
                                <h3>Large</h3>
                                <p>1280 x 720</p>
                            </div>
                        </button>
                    </div>
                    <div class="custom-size">
                        <h3>Custom Size</h3>
                        <div class="size-inputs">
                            <input type="number" id="customWidth" placeholder="Width" min="100" max="4096" value="800">
                            <span>×</span>
                            <input type="number" id="customHeight" placeholder="Height" min="100" max="4096" value="600">
                        </div>
                        <button id="applyCustomSize">Create Custom Canvas</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle preset selections
            const presetButtons = modal.querySelectorAll('.canvas-presets button');
            presetButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const width = parseInt(btn.dataset.width);
                    const height = parseInt(btn.dataset.height);
                    
                    this.canvas.width = width;
                    this.canvas.height = height;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, width, height);
                    
                    modal.remove();
                    resolve();
                });
            });

            // Handle custom size
            const customBtn = modal.querySelector('#applyCustomSize');
            customBtn.addEventListener('click', () => {
                const width = parseInt(modal.querySelector('#customWidth').value);
                const height = parseInt(modal.querySelector('#customHeight').value);
                
                if (width >= 100 && width <= 4096 && height >= 100 && height <= 4096) {
                    this.canvas.width = width;
                    this.canvas.height = height;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, width, height);
                    
                    const canvasContainer = document.querySelector('.canvas');
                    canvasContainer.innerHTML = '';
                    canvasContainer.appendChild(this.canvas);
                    
                    this.fitCanvasToContainer();
                    modal.remove();
                    resolve();
                } else {
                    alert('Please enter valid dimensions (between 100 and 4096 pixels)');
                }
            });

            // Add keyboard support for custom size
            const customWidth = modal.querySelector('#customWidth');
            const customHeight = modal.querySelector('#customHeight');
            [customWidth, customHeight].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        customBtn.click();
                    }
                });
            });
        });
    }

    updateCanvasRect() {
        this.canvasRect = this.canvas.getBoundingClientRect();
    }

    getMousePos(e) {
        if (!this.canvasRect) {
            this.updateCanvasRect();
        }

        // Calculate the scale between actual canvas dimensions and displayed size
        const scaleX = this.canvas.width / this.canvasRect.width;
        const scaleY = this.canvas.height / this.canvasRect.height;

        return {
            x: (e.clientX - this.canvasRect.left) * scaleX,
            y: (e.clientY - this.canvasRect.top) * scaleY
        };
    }

    fitCanvasToContainer() {
        const container = this.canvas.parentElement;
        if (!container) return;

        // Get container dimensions with padding consideration
        const containerWidth = container.clientWidth - 64; // Increased padding
        const containerHeight = container.clientHeight - 64;

        // Calculate the scaling ratios
        const scaleX = containerWidth / this.canvas.width;
        const scaleY = containerHeight / this.canvas.height;
        
        // Use the smaller scale to ensure the canvas fits entirely
        const scale = Math.min(scaleX, scaleY);

        // Set the display size while maintaining aspect ratio
        this.canvas.style.width = `${this.canvas.width * scale}px`;
        this.canvas.style.height = `${this.canvas.height * scale}px`;

        // Center the canvas
        this.canvas.style.display = 'block';
        this.canvas.style.margin = 'auto';

        // Store the scale for coordinate calculations
        this.scale = scale;

        // Update canvas position for correct mouse coordinates
        this.updateCanvasRect();
    }

    initializeTools() {
        // Tool selection
        document.querySelectorAll('.toolbar-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.tool = btn.dataset.tool;
                document.querySelectorAll('.toolbar-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Enhanced stroke width control
        const strokeWidth = document.getElementById('strokeWidth');
        strokeWidth.addEventListener('input', (e) => {
            this.strokeWidth = e.target.value;
        });

        // Image import
        document.getElementById('importImage').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageImport(file);
            }
        });

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // Canvas events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    }

    startDrawing(e) {
        const pos = this.getMousePos(e);

        if (this.selectedObject && !this.selectedObject.isLocked) {
            // Check if click is within object bounds
            if (this.isClickedOnObject(pos, this.selectedObject)) {
                this.isDragging = true;
                this.dragOffset = {
                    x: pos.x - this.selectedObject.x,
                    y: pos.y - this.selectedObject.y
                };
                return;
            }
        }

        // If not dragging an object, proceed with normal drawing
        this.isDrawing = true;
        [this.lastX, this.lastY] = [pos.x, pos.y];
    }

    draw(e) {
        const pos = this.getMousePos(e);

        if (this.isDragging && this.selectedObject) {
            this.selectedObject.x = pos.x - this.dragOffset.x;
            this.selectedObject.y = pos.y - this.dragOffset.y;
            this.redrawCanvas();
            return;
        }

        if (!this.isDrawing) return;

        this.addPoint(pos.x, pos.y);

        // Cancel any existing animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Schedule the drawing
        this.animationFrameId = requestAnimationFrame(() => {
            this.ctx.strokeStyle = this.color;
            this.ctx.fillStyle = this.color;
            this.ctx.lineWidth = this.strokeWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            switch (this.tool) {
                case 'brush':
                    this.drawSmoothLine();
                    break;
                case 'rectangle':
                    this.drawRectangle(pos.x, pos.y);
                    break;
                case 'circle':
                    this.drawCircle(pos.x, pos.y);
                    break;
                case 'line':
                    this.drawLine(pos.x, pos.y);
                    break;
            }

            [this.lastX, this.lastY] = [pos.x, pos.y];
        });
    }

    addPoint(x, y) {
        this.points.push({ x, y });
        // Keep only last 8 points for smooth line
        if (this.points.length > 8) {
            this.points.shift();
        }
    }

    drawSmoothLine() {
        if (this.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        // Draw a curve through the points
        for (let i = 1; i < this.points.length - 2; i++) {
            const xc = (this.points[i].x + this.points[i + 1].x) / 2;
            const yc = (this.points[i].y + this.points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }

        // For the last two points
        if (this.points.length > 2) {
            const last = this.points.length - 1;
            this.ctx.quadraticCurveTo(
                this.points[last - 1].x,
                this.points[last - 1].y,
                this.points[last].x,
                this.points[last].y
            );
        }

        this.ctx.stroke();
    }

    stopDrawing() {
        if (this.isDragging) {
            this.isDragging = false;
        }
        if (this.isDrawing) {
            this.isDrawing = false;
            this.points = []; // Clear points array
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.saveState();
        }
    }

    drawRectangle(x, y) {
        this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
        this.ctx.beginPath();
        this.ctx.rect(this.lastX, this.lastY, x - this.lastX, y - this.lastY);
        this.ctx.stroke();
    }

    drawCircle(x, y) {
        this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
        this.ctx.beginPath();
        const radius = Math.sqrt(Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2));
        this.ctx.arc(this.lastX, this.lastY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    drawLine(x, y) {
        this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    addTextInput(x, y) {
        if (this.textInput) {
            this.commitText();
        }

        // Create text object instead of drawing directly
        const textObject = {
            type: 'text',
            x,
            y,
            text: '',
            fontSize: this.strokeWidth,
            color: this.color
        };
        
        this.addObject('text', textObject);
        this.createTextEditor(textObject);
    }

    commitText() {
        if (this.textInput && this.textInput.value) {
            const rect = this.canvas.getBoundingClientRect();
            this.ctx.font = `${this.strokeWidth}px sans-serif`;
            this.ctx.fillStyle = this.color;
            const x = (parseInt(this.textInput.style.left) - rect.left) / this.scale;
            const y = (parseInt(this.textInput.style.top) - rect.top) / this.scale;
            this.ctx.fillText(this.textInput.value, x, y);
            this.textInput.remove();
            this.textInput = null;
            this.saveState();
        }
    }

    saveState() {
        this.undoStack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        this.redoStack = []; // Clear redo stack
    }

    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            this.ctx.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.ctx.putImageData(state, 0, 0);
        }
    }

    handleImageImport(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const object = {
                    type: 'image',
                    image: img,
                    x: 0,
                    y: 0,
                    width: img.width,
                    height: img.height
                };
                this.addObject('image', object);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    createLayersPanel() {
        const layersPanel = document.createElement('div');
        layersPanel.className = 'layers-panel';
        layersPanel.innerHTML = `
            <div class="panel-header">
                <h3>Layers</h3>
            </div>
            <div class="layers-list"></div>
        `;
        
        this.canvas.parentElement.appendChild(layersPanel);
        this.layersList = layersPanel.querySelector('.layers-list');
    }

    addObject(type, props) {
        const object = {
            id: Date.now(),
            type,
            ...props,
            isVisible: true,
            isLocked: false
        };
        
        this.objects.push(object);
        this.addLayerItem(object);
        this.redrawCanvas();
    }

    addLayerItem(object) {
        const layer = document.createElement('div');
        layer.className = 'layer-item';
        layer.dataset.id = object.id;
        layer.innerHTML = `
            <div class="layer-preview"></div>
            <span class="layer-name">${object.type} ${this.objects.length}</span>
            <div class="layer-controls">
                <button class="visibility-btn" title="Toggle Visibility">👁️</button>
                <button class="lock-btn" title="Toggle Lock">🔒</button>
                <button class="delete-btn" title="Delete">🗑️</button>
            </div>
        `;

        layer.addEventListener('click', () => this.selectObject(object));
        
        // Add control button listeners
        layer.querySelector('.visibility-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            object.isVisible = !object.isVisible;
            layer.classList.toggle('hidden');
            this.redrawCanvas();
        });

        layer.querySelector('.lock-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            object.isLocked = !object.isLocked;
            layer.classList.toggle('locked');
        });

        layer.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteObject(object);
        });

        this.layersList.prepend(layer);
    }

    selectObject(object) {
        this.selectedObject = object;
        // Update UI to show selected state
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.id === object.id.toString()) {
                item.classList.add('selected');
            }
        });
        this.redrawCanvas();
    }

    deleteObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
            document.querySelector(`.layer-item[data-id="${object.id}"]`).remove();
            if (this.selectedObject === object) {
                this.selectedObject = null;
            }
            this.redrawCanvas();
        }
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all objects
        this.objects.forEach(obj => {
            if (!obj.isVisible) return;

            switch(obj.type) {
                case 'image':
                    this.ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
                    break;
                case 'text':
                    this.ctx.font = `${obj.fontSize}px sans-serif`;
                    this.ctx.fillStyle = obj.color;
                    this.ctx.fillText(obj.text, obj.x, obj.y);
                    break;
                // Add cases for other object types
            }

            // Draw selection outline
            if (obj === this.selectedObject) {
                this.drawSelectionOutline(obj);
            }
        });
    }

    drawSelectionOutline(obj) {
        this.ctx.strokeStyle = '#00a8ff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Draw bounding box based on object type
        switch(obj.type) {
            case 'image':
                this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                break;
            case 'text':
                const metrics = this.ctx.measureText(obj.text);
                this.ctx.strokeRect(obj.x, obj.y - obj.fontSize, 
                    metrics.width, obj.fontSize * 1.2);
                break;
        }
        
        this.ctx.setLineDash([]);
    }

    isClickedOnObject(pos, obj) {
        switch(obj.type) {
            case 'image':
                return pos.x >= obj.x && pos.x <= obj.x + obj.width &&
                       pos.y >= obj.y && pos.y <= obj.y + obj.height;
            case 'text':
                const metrics = this.ctx.measureText(obj.text);
                return pos.x >= obj.x && pos.x <= obj.x + metrics.width &&
                       pos.y >= obj.y - obj.fontSize && pos.y <= obj.y;
            default:
                return false;
        }
    }
}

class WebEditor {
    constructor(container) {
        this.container = container;
        this.htmlEditor = null;
        this.cssEditor = null;
        this.jsEditor = null;
        this.previewFrame = null;
        this.previewDelay = null;
        this.lastValidHTML = '';
        this.lastValidCSS = '';
        this.lastValidJS = '';
        
        this.initializeUI();
        this.initializeEditors();
        this.setupEventListeners();
        this.updatePreview();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="editor-layout">
                <div class="editor-section">
                    <div class="editor-tabs">
                        <button class="tab-btn active" data-tab="html">HTML</button>
                        <button class="tab-btn" data-tab="css">CSS</button>
                        <button class="tab-btn" data-tab="js">JavaScript</button>
                    </div>
                    <div class="editor-panes">
                        <div class="editor-pane active" data-pane="html">
                            <div class="editor-container html-editor"></div>
                        </div>
                        <div class="editor-pane" data-pane="css">
                            <div class="editor-container css-editor"></div>
                        </div>
                        <div class="editor-pane" data-pane="js">
                            <div class="editor-container js-editor"></div>
                        </div>
                    </div>
                </div>
                <div class="preview-section">
                    <div class="preview-header">
                        <div class="preview-controls">
                            <button class="preview-size-btn active" data-size="desktop">Desktop</button>
                            <button class="preview-size-btn" data-size="tablet">Tablet</button>
                            <button class="preview-size-btn" data-size="mobile">Mobile</button>
                        </div>
                        <button class="refresh-preview">
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="preview-container">
                        <iframe id="previewFrame" title="Preview"></iframe>
                    </div>
                </div>
            </div>
        `;
    }

    initializeEditors() {
        // Initialize HTML Editor
        this.htmlEditor = CodeMirror(this.container.querySelector('.html-editor'), {
            mode: 'xml',
            theme: 'ayu-dark',
            lineNumbers: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            value: this.getDefaultHTML()
        });

        // Initialize CSS Editor
        this.cssEditor = CodeMirror(this.container.querySelector('.css-editor'), {
            mode: 'css',
            theme: 'ayu-dark',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            value: this.getDefaultCSS()
        });

        // Initialize JavaScript Editor
        this.jsEditor = CodeMirror(this.container.querySelector('.js-editor'), {
            mode: 'javascript',
            theme: 'ayu-dark',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            value: this.getDefaultJS()
        });

        this.previewFrame = this.container.querySelector('#previewFrame');
    }

    setupEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Preview size switching
        this.container.querySelectorAll('.preview-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.size;
                this.setPreviewSize(size);
            });
        });

        // Editor change events
        [this.htmlEditor, this.cssEditor, this.jsEditor].forEach(editor => {
            editor.on('change', () => {
                clearTimeout(this.previewDelay);
                this.previewDelay = setTimeout(() => this.updatePreview(), 1000);
            });
        });

        // Refresh preview
        this.container.querySelector('.refresh-preview').addEventListener('click', () => {
            this.updatePreview(true);
        });
    }

    switchTab(tab) {
        // Update tab buttons
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update panes
        this.container.querySelectorAll('.editor-pane').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.pane === tab);
        });

        // Refresh the newly visible editor
        switch(tab) {
            case 'html': this.htmlEditor.refresh(); break;
            case 'css': this.cssEditor.refresh(); break;
            case 'js': this.jsEditor.refresh(); break;
        }
    }

    updatePreview(force = false) {
        const html = this.htmlEditor.getValue();
        const css = this.cssEditor.getValue();
        const js = this.jsEditor.getValue();

        if (force || 
            html !== this.lastValidHTML || 
            css !== this.lastValidCSS || 
            js !== this.lastValidJS) {
            
            try {
                const doc = this.previewFrame.contentDocument;
                doc.open();
                doc.write(this.generatePreviewHTML(html, css, js));
                doc.close();

                this.lastValidHTML = html;
                this.lastValidCSS = css;
                this.lastValidJS = js;
            } catch (error) {
                console.error('Preview update failed:', error);
            }
        }
    }

    generatePreviewHTML(html, css, js) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}</script>
            </body>
            </html>
        `;
    }

    setPreviewSize(size) {
        const container = this.container.querySelector('.preview-container');
        container.className = 'preview-container ' + size;
        
        // Update buttons
        this.container.querySelectorAll('.preview-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === size);
        });
    }

    getDefaultHTML() {
        return `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome to My Page</h1>
    <p>Start editing to see your changes!</p>
</body>
</html>`;
    }

    getDefaultCSS() {
        return `body {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    line-height: 1.6;
    color: #333;
}

h1 {
    color: #0066ff;
    font-size: 2.5rem;
    margin-bottom: 1rem;
}`;
    }

    getDefaultJS() {
        return `// Add your JavaScript code here
console.log('Hello, World!');`;
    }
}

class AITools {
    constructor(container) {
        this.container = container;
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="ai-tools-container">
                <div class="ai-sidebar">
                    <div class="ai-tool-group">
                        <h3>Image Generation</h3>
                        <button class="ai-tool-btn" data-tool="text-to-image">Text to Image</button>
                        <button class="ai-tool-btn" data-tool="image-variation">Image Variation</button>
                    </div>
                    <div class="ai-tool-group">
                        <h3>Text Generation</h3>
                        <button class="ai-tool-btn" data-tool="text-completion">Text Completion</button>
                        <button class="ai-tool-btn" data-tool="code-suggestion">Code Suggestion</button>
                    </div>
                    <div class="ai-tool-group">
                        <h3>Image Effects</h3>
                        <button class="ai-tool-btn" data-tool="style-transfer">Style Transfer</button>
                        <button class="ai-tool-btn" data-tool="image-enhance">Image Enhancement</button>
                    </div>
                </div>
                <div class="ai-workspace">
                    <div class="ai-input-area">
                        <textarea placeholder="Enter your prompt here..." class="ai-prompt"></textarea>
                        <div class="ai-options">
                            <select class="ai-model-select">
                                <option value="stable-diffusion">Stable Diffusion</option>
                                <option value="dalle-mini">DALL-E Mini</option>
                            </select>
                            <button class="ai-generate-btn">Generate</button>
                        </div>
                    </div>
                    <div class="ai-output-area">
                        <div class="ai-results"></div>
                        <div class="ai-loading" style="display: none;">
                            <div class="spinner"></div>
                            <p>AI is working its magic...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async generateImage(prompt) {
        try {
            this.showLoading();
            // Using Stable Diffusion through Replicate's free API
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: "stable-diffusion-v1-5",
                    input: { prompt: prompt }
                })
            });

            const result = await response.json();
            this.displayResults(result.output);
        } catch (error) {
            console.error('Error generating image:', error);
            this.showError('Failed to generate image. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async generateText(prompt) {
        try {
            this.showLoading();
            // Using GPT-J through API
            const response = await fetch('https://api.textcortex.com/v1/texts/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens: 100
                })
            });

            const result = await response.json();
            this.displayTextResults(result.text);
        } catch (error) {
            console.error('Error generating text:', error);
            this.showError('Failed to generate text. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    setupEventListeners() {
        const generateBtn = this.container.querySelector('.ai-generate-btn');
        const toolBtns = this.container.querySelectorAll('.ai-tool-btn');
        
        generateBtn.addEventListener('click', () => {
            const prompt = this.container.querySelector('.ai-prompt').value;
            const selectedTool = this.container.querySelector('.ai-tool-btn.active').dataset.tool;
            
            switch(selectedTool) {
                case 'text-to-image':
                    this.generateImage(prompt);
                    break;
                case 'text-completion':
                    this.generateText(prompt);
                    break;
                // Add other tool handlers
            }
        });

        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateInterface(btn.dataset.tool);
            });
        });
    }

    showLoading() {
        this.container.querySelector('.ai-loading').style.display = 'flex';
    }

    hideLoading() {
        this.container.querySelector('.ai-loading').style.display = 'none';
    }

    displayResults(results) {
        const resultsArea = this.container.querySelector('.ai-results');
        resultsArea.innerHTML = '';
        
        if (Array.isArray(results)) {
            results.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'ai-generated-image';
                resultsArea.appendChild(img);
            });
        }
    }

    updateInterface(tool) {
        const promptArea = this.container.querySelector('.ai-prompt');
        const optionsArea = this.container.querySelector('.ai-options');
        
        switch(tool) {
            case 'text-to-image':
                promptArea.placeholder = 'Describe the image you want to generate...';
                break;
            case 'text-completion':
                promptArea.placeholder = 'Enter your text prompt...';
                break;
            case 'style-transfer':
                // Add file upload interface
                break;
        }
    }
}

class ColorPicker {
    constructor(container, onChange) {
        this.container = container;
        this.onChange = onChange;
        this.currentColor = '#000000';
        this.initializeUI();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="color-picker-wrapper">
                <button class="color-display">
                    <span class="current-color" style="background-color: ${this.currentColor}"></span>
                </button>
                <div class="color-popup">
                    <div class="color-area">
                        <canvas class="color-canvas"></canvas>
                        <div class="color-pointer"></div>
                    </div>
                    <div class="hue-area">
                        <input type="range" class="hue-slider" min="0" max="360" value="0">
                    </div>
                    <div class="color-inputs">
                        <div class="color-preview" style="background-color: ${this.currentColor}"></div>
                        <input type="text" class="hex-input" value="${this.currentColor}">
                    </div>
                    <div class="preset-colors">
                        <button style="background: #000000"></button>
                        <button style="background: #ffffff"></button>
                        <button style="background: #ff0000"></button>
                        <button style="background: #00ff00"></button>
                        <button style="background: #0000ff"></button>
                        <button style="background: #ffff00"></button>
                    </div>
                </div>
            </div>
        `;

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas = this.container.querySelector('.color-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.drawColorArea(0);
    }

    drawColorArea(hue) {
        const gradient1 = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient1.addColorStop(0, '#fff');
        gradient1.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
        
        this.ctx.fillStyle = gradient1;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient2 = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient2.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient2.addColorStop(1, '#000');
        
        this.ctx.fillStyle = gradient2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        const colorDisplay = this.container.querySelector('.color-display');
        const popup = this.container.querySelector('.color-popup');
        const hueSlider = this.container.querySelector('.hue-slider');
        const hexInput = this.container.querySelector('.hex-input');
        const presetButtons = this.container.querySelectorAll('.preset-colors button');
        const canvas = this.container.querySelector('.color-canvas');

        colorDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = colorDisplay.getBoundingClientRect();
            popup.style.top = `${rect.bottom + 10}px`;
            popup.style.left = `${rect.left}px`;
            popup.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!popup.contains(e.target) && e.target !== colorDisplay) {
                popup.classList.remove('show');
            }
        });

        canvas.addEventListener('mousedown', (e) => {
            this.isPickingColor = true;
            this.pickColor(e);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.isPickingColor) {
                this.pickColor(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isPickingColor = false;
        });

        hueSlider.addEventListener('input', (e) => {
            this.drawColorArea(e.target.value);
        });

        hexInput.addEventListener('change', (e) => {
            this.setColor(e.target.value);
        });

        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setColor(btn.style.backgroundColor);
            });
        });
    }

    pickColor(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const color = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`;
        this.setColor(color);
    }

    setColor(color) {
        this.currentColor = color;
        this.container.querySelector('.current-color').style.backgroundColor = color;
        this.container.querySelector('.color-preview').style.backgroundColor = color;
        this.container.querySelector('.hex-input').value = color;
        if (this.onChange) {
            this.onChange(color);
        }
    }
}

// Initialize the application only once
const studio = new CreativeStudio(); 
