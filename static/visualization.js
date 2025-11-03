// Visualização Geométrica 2D para Subespaços

function visualizeSubspace(vectors, isSubspace, constraint) {
    // Only visualize for 2D
    // Note: currentDimension is defined in app.js and must be loaded first
    if (typeof currentDimension === 'undefined' || currentDimension !== 2) {
        document.getElementById('visualization').style.display = 'none';
        return;
    }
    
    const vizDiv = document.getElementById('visualization');
    vizDiv.style.display = 'block';
    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Setup coordinate system
    const scale = 40; // pixels per unit
    const originX = width / 2;
    const originY = height / 2;
    
    // Draw grid
    drawGrid(ctx, width, height, originX, originY, scale);
    
    // Draw axes
    drawAxes(ctx, width, height, originX, originY);
    
    // Draw constraint line/region if exists
    if (constraint && constraint.trim() !== '') {
        drawConstraint(ctx, constraint, originX, originY, scale, width, height, isSubspace);
    }
    
    // Draw vectors
    vectors.forEach((vector, index) => {
        drawVector(ctx, vector, originX, originY, scale, index, isSubspace);
    });
    
    // Update info
    updateVizInfo(vectors, isSubspace, constraint);
}

function drawGrid(ctx, width, height, originX, originY, scale) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = originX % scale; x < width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = originY % scale; y < height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawAxes(ctx, width, height, originX, originY) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('x', width - 20, originY - 10);
    ctx.fillText('y', originX + 10, 20);
    ctx.fillText('O', originX + 5, originY - 5);
}

function drawConstraint(ctx, constraint, originX, originY, scale, width, height, isSubspace) {
    // Parse and draw constraint
    constraint = constraint.toLowerCase().trim();
    
    ctx.strokeStyle = isSubspace ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)';
    ctx.fillStyle = isSubspace ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)';
    ctx.lineWidth = 3;
    
    // Try to parse common constraint formats
    try {
        if (constraint.includes('y') && constraint.includes('x')) {
            // Try to extract y = f(x) or similar
            if (constraint.includes('=')) {
                const parts = constraint.split('=');
                
                ctx.beginPath();
                let firstPoint = true;
                
                // Draw line by evaluating points
                for (let screenX = 0; screenX < width; screenX += 2) {
                    const x = (screenX - originX) / scale;
                    let y = null;
                    
                    // Try different formats
                    if (constraint.match(/y\s*=\s*(-?\d*\.?\d*)\s*\*?\s*x/)) {
                        // y = mx format
                        const match = constraint.match(/y\s*=\s*(-?\d*\.?\d*)\s*\*?\s*x/);
                        const m = parseFloat(match[1]) || 1;
                        y = m * x;
                    } else if (constraint.match(/y\s*=\s*x\s*\+\s*(-?\d+\.?\d*)/)) {
                        // y = x + b format
                        const match = constraint.match(/y\s*=\s*x\s*\+\s*(-?\d+\.?\d*)/);
                        const b = parseFloat(match[1]);
                        y = x + b;
                    } else if (constraint.match(/x\s*\+\s*y\s*=\s*(-?\d+\.?\d*)/)) {
                        // x + y = c format
                        const match = constraint.match(/x\s*\+\s*y\s*=\s*(-?\d+\.?\d*)/);
                        const c = parseFloat(match[1]);
                        y = c - x;
                    } else if (constraint.includes('y = 0')) {
                        // y = 0 (x-axis)
                        y = 0;
                    } else if (constraint.includes('x = 0')) {
                        // x = 0 (y-axis) - draw vertical line
                        ctx.moveTo(originX, 0);
                        ctx.lineTo(originX, height);
                        ctx.stroke();
                        return;
                    }
                    
                    if (y !== null && !isNaN(y)) {
                        const screenY = originY - y * scale;
                        
                        if (screenY >= 0 && screenY <= height) {
                            if (firstPoint) {
                                ctx.moveTo(screenX, screenY);
                                firstPoint = false;
                            } else {
                                ctx.lineTo(screenX, screenY);
                            }
                        }
                    }
                }
                
                ctx.stroke();
            }
        }
    } catch (e) {
        console.log('Could not parse constraint for visualization:', e);
    }
}

function drawVector(ctx, vector, originX, originY, scale, index, isSubspace) {
    if (vector.length < 2) return;
    
    const x = vector[0];
    const y = vector[1];
    
    const endX = originX + x * scale;
    const endY = originY - y * scale;
    
    // Vector color
    const colors = [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#fa709a',
        '#feca57'
    ];
    const color = colors[index % colors.length];
    
    // Draw vector line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(originY - endY, endX - originX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY + arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY + arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
    
    // Draw point at end
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`v${index + 1}`, endX + 10, endY - 10);
    ctx.font = '12px Arial';
    ctx.fillText(`(${x.toFixed(1)}, ${y.toFixed(1)})`, endX + 10, endY + 5);
}

function updateVizInfo(vectors, isSubspace, constraint) {
    const infoDiv = document.getElementById('viz-info');
    
    let info = '<strong>Visualização 2D:</strong><br>';
    info += `<strong>Vetores:</strong> ${vectors.length} vetores plotados<br>`;
    
    if (constraint && constraint.trim() !== '') {
        info += `<strong>Restrição:</strong> ${constraint}<br>`;
    }
    
    if (isSubspace) {
        info += '<span style="color: green;">✓ O conjunto forma um subespaço (região/linha verde)</span>';
    } else {
        info += '<span style="color: red;">✗ O conjunto NÃO forma um subespaço</span>';
    }
    
    infoDiv.innerHTML = info;
}
