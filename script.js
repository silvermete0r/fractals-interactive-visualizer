
class FractalRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastX;
                const deltaY = e.clientY - this.lastY;
                this.offsetX += deltaX / this.zoom;
                this.offsetY += deltaY / this.zoom;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.render();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom *= zoomFactor;
            
            this.offsetX += (x / this.zoom) * (1 - zoomFactor);
            this.offsetY += (y / this.zoom) * (1 - zoomFactor);
            
            this.render();
        });
    }

    mandelbrot(x0, y0, maxIter) {
        let x = 0, y = 0;
        let iter = 0;
        while (x*x + y*y < 4 && iter < maxIter) {
            const xTemp = x*x - y*y + x0;
            y = 2*x*y + y0;
            x = xTemp;
            iter++;
        }
        return iter;
    }

    julia(x0, y0, maxIter) {
        let x = x0, y = y0;
        const cx = -0.4, cy = 0.6;
        let iter = 0;
        while (x*x + y*y < 4 && iter < maxIter) {
            const xTemp = x*x - y*y + cx;
            y = 2*x*y + cy;
            x = xTemp;
            iter++;
        }
        return iter;
    }

    sierpinskiCarpet(x, y, size, depth) {
        if (depth === 0) {
            this.ctx.fillRect(x, y, size, size);
            return;
        }

        const newSize = size / 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (i !== 1 || j !== 1) {
                    this.sierpinskiCarpet(
                        x + i * newSize,
                        y + j * newSize,
                        newSize,
                        depth - 1
                    );
                }
            }
        }
    }

    sierpinskiTriangle(x1, y1, x2, y2, x3, y3, depth) {
        if (depth === 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.closePath();
            this.ctx.fill();
            return;
        }

        const x12 = (x1 + x2) / 2;
        const y12 = (y1 + y2) / 2;
        const x23 = (x2 + x3) / 2;
        const y23 = (y2 + y3) / 2;
        const x31 = (x3 + x1) / 2;
        const y31 = (y3 + y1) / 2;

        this.sierpinskiTriangle(x1, y1, x12, y12, x31, y31, depth - 1);
        this.sierpinskiTriangle(x12, y12, x2, y2, x23, y23, depth - 1);
        this.sierpinskiTriangle(x31, y31, x23, y23, x3, y3, depth - 1);
    }

    pythagorasTree(x, y, size, angle, depth) {
        if (depth === 0) return;

        const x1 = x + size * Math.cos(angle);
        const y1 = y - size * Math.sin(angle);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        const newSize = size * 0.7;
        this.pythagorasTree(x1, y1, newSize, angle + Math.PI/4, depth - 1);
        this.pythagorasTree(x1, y1, newSize, angle - Math.PI/4, depth - 1);
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        const fractalType = document.getElementById('fractalType').value;
        const maxIter = parseInt(document.getElementById('iterations').value);
        const color = document.getElementById('colorPicker').value;

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        switch (fractalType) {
            case 'mandelbrot':
                for (let px = 0; px < width; px++) {
                    for (let py = 0; py < height; py++) {
                        const x0 = (px - width/2)/this.zoom + this.offsetX;
                        const y0 = (py - height/2)/this.zoom + this.offsetY;
                        const iter = this.mandelbrot(x0/200, y0/200, maxIter);
                        if (iter === maxIter) {
                            this.ctx.fillRect(px, py, 1, 1);
                        }
                    }
                }
                break;

            case 'julia':
                for (let px = 0; px < width; px++) {
                    for (let py = 0; py < height; py++) {
                        const x0 = (px - width/2)/this.zoom + this.offsetX;
                        const y0 = (py - height/2)/this.zoom + this.offsetY;
                        const iter = this.julia(x0/200, y0/200, maxIter);
                        if (iter === maxIter) {
                            this.ctx.fillRect(px, py, 1, 1);
                        }
                    }
                }
                break;

            case 'sierpinski-carpet':
                const carpetSize = Math.min(width, height) * 0.8;
                const carpetX = (width - carpetSize) / 2;
                const carpetY = (height - carpetSize) / 2;
                this.sierpinskiCarpet(carpetX, carpetY, carpetSize, 5);
                break;

            case 'sierpinski-triangle':
                const triangleSize = Math.min(width, height) * 0.8;
                const triangleX = (width - triangleSize) / 2;
                const triangleY = height - (height - triangleSize) / 2;
                this.sierpinskiTriangle(
                    triangleX, triangleY,
                    triangleX + triangleSize, triangleY,
                    triangleX + triangleSize/2, triangleY - triangleSize * Math.sin(Math.PI/3),
                    6
                );
                break;

            case 'pythagoras-tree':
                const treeSize = Math.min(width, height) * 0.3;
                this.pythagorasTree(
                    width/2 - treeSize/2,
                    height - 50,
                    treeSize,
                    Math.PI/2,
                    12
                );
                break;
        }
    }
}

// Initialize the application
const canvas = document.getElementById('fractalCanvas');
const renderer = new FractalRenderer(canvas);

// Fractal information
const fractalInfo = {
    'mandelbrot': {
        title: 'Mandelbrot Set',
        description: 'The Mandelbrot set is a famous fractal defined as the set of complex numbers c for which the sequence f(z) = z² + c does not escape to infinity.',
        properties: ['Dimension: 2', 'Named after: Benoit Mandelbrot', 'Year: 1980']
    },
    'julia': {
        title: 'Julia Set',
        description: 'Julia sets are fractals that emerge from complex function iteration, similar to the Mandelbrot set but with a fixed c value in f(z) = z² + c.',
        properties: ['Dimension: 1-2', 'Named after: Gaston Julia', 'Year: 1918']
    },
    'sierpinski-carpet': {
        title: 'Sierpiński Carpet',
        description: 'A plane fractal created by recursively removing the middle ninth of a square, resulting in a self-similar pattern with infinite complexity.',
        properties: ['Dimension: ~1.893', 'Named after: Wacław Sierpiński', 'Year: 1916']
    },
    'sierpinski-triangle': {
        title: 'Sierpiński Triangle',
        description: 'A fractal formed by recursively removing the central triangle from an equilateral triangle, creating a self-similar pattern.',
        properties: ['Dimension: ~1.585', 'Named after: Wacław Sierpiński', 'Year: 1915']
    },
    'pythagoras-tree': {
        title: 'Pythagoras Tree',
        description: 'A plane fractal constructed from squares, where each square branches into two squares at 45° angles, forming a tree-like structure.',
        properties: ['Dimension: 2', 'Named after: Pythagoras', 'Modern fractal interpretation: 1980s']
    }
};

// Update info panel
function updateInfo(fractalType) {
    const info = fractalInfo[fractalType];
    document.getElementById('fractalTitle').textContent = info.title;
    document.getElementById('fractalDescription').textContent = info.description;
    document.getElementById('fractalProperties').innerHTML = 
        info.properties.map(prop => `<div class="mb-2">${prop}</div>`).join('');
}

// Event listeners
document.getElementById('fractalType').addEventListener('change', (e) => {
    updateInfo(e.target.value);
    renderer.zoom = 1;
    renderer.offsetX = 0;
    renderer.offsetY = 0;
    renderer.render();
});

document.getElementById('iterations').addEventListener('input', () => renderer.render());
document.getElementById('colorPicker').addEventListener('input', () => renderer.render());

// Initial render
updateInfo('mandelbrot');
renderer.render();

// Handle window resize
function handleResize() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = Math.min(window.innerHeight * 0.6, 600);
    renderer.render();
}

window.addEventListener('resize', handleResize);
handleResize(); // Initial size setup

// Add color scheme presets
const colorSchemes = {
    'classic': '#3B82F6',
    'fire': '#EF4444',
    'emerald': '#10B981',
    'purple': '#8B5CF6',
    'golden': '#F59E0B'
};

// Add color scheme selector
const colorSchemeSelect = document.createElement('select');
colorSchemeSelect.className = 'bg-gray-800 text-white px-4 py-2 rounded-lg';
colorSchemeSelect.innerHTML = `
    <option value="custom">Custom Color</option>
    ${Object.entries(colorSchemes).map(([name, color]) => 
        `<option value="${color}">${name.charAt(0).toUpperCase() + name.slice(1)}</option>`
    ).join('')}
`;
document.getElementById('fractalControls').prepend(colorSchemeSelect);

colorSchemeSelect.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') {
        document.getElementById('colorPicker').value = e.target.value;
        renderer.render();
    }
});

// Add export functionality
const exportButton = document.createElement('button');
exportButton.className = 'bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg ml-4';
exportButton.textContent = 'Export PNG';
document.getElementById('fractalControls').appendChild(exportButton);

exportButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `fractal-${document.getElementById('fractalType').value}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Add loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading fixed top-4 right-4 bg-blue-600 px-4 py-2 rounded-lg hidden';
loadingIndicator.textContent = 'Rendering...';
document.body.appendChild(loadingIndicator);

// Enhance renderer with loading indicator
const originalRender = renderer.render;
renderer.render = function() {
    loadingIndicator.classList.remove('hidden');
    requestAnimationFrame(() => {
        originalRender.call(this);
        loadingIndicator.classList.add('hidden');
    });
};

// Add tooltips to controls
const controls = document.getElementById('fractalControls').children;
Array.from(controls).forEach(control => {
    control.classList.add('control-item', 'relative');
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    
    if (control.id === 'iterations') {
        tooltip.textContent = 'Adjust detail level';
    } else if (control.id === 'colorPicker') {
        tooltip.textContent = 'Choose custom color';
    }
    
    if (tooltip.textContent) {
        control.appendChild(tooltip);
    }
});

// Add keyboard controls
document.addEventListener('keydown', (e) => {
    const step = 10 / renderer.zoom;
    switch(e.key) {
        case 'ArrowUp':
            renderer.offsetY -= step;
            break;
        case 'ArrowDown':
            renderer.offsetY += step;
            break;
        case 'ArrowLeft':
            renderer.offsetX -= step;
            break;
        case 'ArrowRight':
            renderer.offsetX += step;
            break;
        case '+':
        case '=':
            renderer.zoom *= 1.1;
            break;
        case '-':
        case '_':
            renderer.zoom *= 0.9;
            break;
        default:
            return;
    }
    e.preventDefault();
    renderer.render();
});

// Add touch support
let lastTouchDistance = 0;

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        const zoomDelta = currentDistance / lastTouchDistance;
        renderer.zoom *= zoomDelta;
        lastTouchDistance = currentDistance;
        
        renderer.render();
    } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - renderer.lastX;
        const deltaY = touch.clientY - renderer.lastY;
        
        renderer.offsetX += deltaX / renderer.zoom;
        renderer.offsetY += deltaY / renderer.zoom;
        
        renderer.lastX = touch.clientX;
        renderer.lastY = touch.clientY;
        
        renderer.render();
    }
});

// Performance optimization for Mandelbrot and Julia sets
const workerCode = `
    onmessage = function(e) {
        const {type, x0, y0, maxIter} = e.data;
        let result;
        
        if (type === 'mandelbrot') {
            result = mandelbrot(x0, y0, maxIter);
        } else if (type === 'julia') {
            result = julia(x0, y0, maxIter);
        }
        
        postMessage(result);
    };

    function mandelbrot(x0, y0, maxIter) {
        let x = 0, y = 0;
        let iter = 0;
        while (x*x + y*y < 4 && iter < maxIter) {
            const xTemp = x*x - y*y + x0;
            y = 2*x*y + y0;
            x = xTemp;
            iter++;
        }
        return iter;
    }

    function julia(x0, y0, maxIter) {
        let x = x0, y = y0;
        const cx = -0.4, cy = 0.6;
        let iter = 0;
        while (x*x + y*y < 4 && iter < maxIter) {
            const xTemp = x*x - y*y + cx;
            y = 2*x*y + cy;
            x = xTemp;
            iter++;
        }
        return iter;
    }
`;

const workerBlob = new Blob([workerCode], {type: 'application/javascript'});
const workerUrl = URL.createObjectURL(workerBlob);
const workers = Array(navigator.hardwareConcurrency || 4)
    .fill(null)
    .map(() => new Worker(workerUrl));

// Clean up workers when the page is closed
window.addEventListener('beforeunload', () => {
    workers.forEach(worker => worker.terminate());
    URL.revokeObjectURL(workerUrl);
});