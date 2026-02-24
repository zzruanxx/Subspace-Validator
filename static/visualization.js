// Visualização Geométrica 2D para Subespaços

// Polyfill for roundRect (Safari < 16, older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        const [tl, tr, br, bl] = r;
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

function visualizeSubspace(vectors, isSubspace, constraint) {
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
    
    ctx.clearRect(0, 0, width, height);
    
    // Background — dark
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    const scale = Math.min(40, Math.floor(Math.min(width, height) / 16));
    const originX = width / 2;
    const originY = height / 2;
    
    drawGrid(ctx, width, height, originX, originY, scale);
    drawAxes(ctx, width, height, originX, originY, scale);
    
    if (constraint && constraint.trim() !== '') {
        drawConstraint(ctx, constraint, originX, originY, scale, width, height, isSubspace);
    }
    
    vectors.forEach((vector, index) => {
        drawVector(ctx, vector, originX, originY, scale, index, isSubspace);
    });
    
    drawLegend(ctx, vectors, isSubspace, width);
    updateVizInfo(vectors, isSubspace, constraint);
}

function drawGrid(ctx, width, height, originX, originY, scale) {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    
    for (let x = originX % scale; x < width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = originY % scale; y < height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawAxes(ctx, width, height, originX, originY, scale) {
    // Axes
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
    
    // Tick marks and labels
    ctx.fillStyle = '#555555';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const maxTicks = Math.floor(width / scale / 2);
    for (let i = -maxTicks; i <= maxTicks; i++) {
        if (i === 0) continue;
        const x = originX + i * scale;
        if (x > 10 && x < width - 10) {
            ctx.beginPath();
            ctx.moveTo(x, originY - 3);
            ctx.lineTo(x, originY + 3);
            ctx.stroke();
            ctx.fillText(String(i), x, originY + 6);
        }
    }
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const maxTicksY = Math.floor(height / scale / 2);
    for (let i = -maxTicksY; i <= maxTicksY; i++) {
        if (i === 0) continue;
        const y = originY - i * scale;
        if (y > 10 && y < height - 10) {
            ctx.beginPath();
            ctx.moveTo(originX - 3, y);
            ctx.lineTo(originX + 3, y);
            ctx.stroke();
            ctx.fillText(String(i), originX - 8, y);
        }
    }
    
    // Axis labels
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('x', width - 18, originY - 8);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('y', originX + 8, 8);
    
    // Origin
    ctx.fillStyle = '#444444';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('O', originX - 6, originY + 4);
}

function drawConstraint(ctx, constraint, originX, originY, scale, width, height, isSubspace) {
    constraint = constraint.toLowerCase().trim();
    
    const goodColor = 'rgba(16, 185, 129, 0.5)';
    const badColor = 'rgba(239, 68, 68, 0.4)';
    ctx.strokeStyle = isSubspace ? goodColor : badColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    
    try {
        if (constraint.includes('y') || constraint.includes('x')) {
            if (constraint.includes('=')) {
                ctx.beginPath();
                let firstPoint = true;
                
                for (let screenX = 0; screenX < width; screenX += 2) {
                    const x = (screenX - originX) / scale;
                    let y = null;
                    
                    if (constraint.match(/y\s*=\s*(-?\d*\.?\d*)\s*\*?\s*x/)) {
                        const match = constraint.match(/y\s*=\s*(-?\d*\.?\d*)\s*\*?\s*x/);
                        const m = parseFloat(match[1]) || 1;
                        y = m * x;
                    } else if (constraint.match(/y\s*=\s*x\s*\+\s*(-?\d+\.?\d*)/)) {
                        const match = constraint.match(/y\s*=\s*x\s*\+\s*(-?\d+\.?\d*)/);
                        const b = parseFloat(match[1]);
                        y = x + b;
                    } else if (constraint.match(/x\s*\+\s*y\s*=\s*(-?\d+\.?\d*)/)) {
                        const match = constraint.match(/x\s*\+\s*y\s*=\s*(-?\d+\.?\d*)/);
                        const c = parseFloat(match[1]);
                        y = c - x;
                    } else if (constraint.includes('y = 0')) {
                        y = 0;
                    } else if (constraint.includes('x = 0')) {
                        ctx.moveTo(originX, 0);
                        ctx.lineTo(originX, height);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        return;
                    }
                    
                    if (y !== null && !isNaN(y)) {
                        const screenY = originY - y * scale;
                        if (screenY >= -50 && screenY <= height + 50) {
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
    
    ctx.setLineDash([]);
}

function drawVector(ctx, vector, originX, originY, scale, index, isSubspace) {
    if (vector.length < 2) return;
    
    const x = vector[0];
    const y = vector[1];
    const endX = originX + x * scale;
    const endY = originY - y * scale;
    
    const colors = [
        '#818cf8', // indigo
        '#a78bfa', // violet
        '#f472b6', // pink
        '#22d3ee', // cyan
        '#fbbf24', // amber
        '#34d399', // emerald
    ];
    const color = colors[index % colors.length];
    
    // Shadow (subtle glow for dark bg)
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 0;
    
    // Vector line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
    
    // Arrowhead (filled)
    const angle = Math.atan2(originY - endY, endX - originX);
    const arrowLength = 12;
    const arrowAngle = Math.PI / 7;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY + arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY + arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
    
    // Point at tip
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Label with background — clamp to canvas bounds
    const labelText = `v${index + 1}`;
    const coordText = `(${x.toFixed(1)}, ${y.toFixed(1)})`;
    
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    const labelWidth = Math.max(ctx.measureText(labelText).width, ctx.measureText(coordText).width) + 12;
    
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;
    let labelX = endX + 12;
    let labelY = endY - 20;
    
    // Keep label inside canvas
    const pillH = 34;
    const pillR = 6;
    if (labelX + labelWidth + 4 > canvasW) labelX = endX - labelWidth - 16;
    if (labelY - 4 < 0) labelY = 6;
    if (labelY + pillH > canvasH) labelY = canvasH - pillH - 4;
    
    // Background pill — dark
    ctx.fillStyle = 'rgba(17, 17, 17, 0.92)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(labelX - 4, labelY - 4, labelWidth + 4, pillH, pillR);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(labelText, labelX + 2, labelY);
    
    ctx.fillStyle = '#888888';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(coordText, labelX + 2, labelY + 16);
}

function drawLegend(ctx, vectors, isSubspace, width) {
    const legendX = 12;
    const legendY = 12;
    const lineHeight = 18;
    const padding = 10;
    const legendH = padding * 2 + lineHeight;
    const legendW = 200;
    
    ctx.fillStyle = 'rgba(17, 17, 17, 0.88)';
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendW, legendH, 8);
    ctx.fill();
    ctx.stroke();
    
    const statusColor = isSubspace ? '#34d399' : '#f87171';
    const statusText = isSubspace ? '✓ É subespaço' : '✗ Não é subespaço';
    
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(statusText, legendX + padding, legendY + padding + lineHeight / 2);
}

function updateVizInfo(vectors, isSubspace, constraint) {
    const infoDiv = document.getElementById('viz-info');
    infoDiv.innerHTML = '';
    
    const parts = [];
    
    const vectorInfo = document.createElement('span');
    vectorInfo.textContent = `${vectors.length} vetor${vectors.length !== 1 ? 'es' : ''} plotado${vectors.length !== 1 ? 's' : ''}`;
    parts.push(vectorInfo);
    
    if (constraint && constraint.trim() !== '') {
        const sep1 = document.createTextNode('  •  ');
        parts.push(sep1);
        const constraintInfo = document.createElement('span');
        constraintInfo.textContent = `Restrição: ${constraint}`;
        constraintInfo.style.fontFamily = "'SF Mono', 'Fira Code', monospace";
        constraintInfo.style.fontSize = '0.9em';
        parts.push(constraintInfo);
    }
    
    const sep2 = document.createTextNode('  •  ');
    parts.push(sep2);
    
    const resultSpan = document.createElement('span');
    resultSpan.style.fontWeight = '600';
    resultSpan.style.color = isSubspace ? '#10b981' : '#ef4444';
    resultSpan.textContent = isSubspace ? '✓ Subespaço válido' : '✗ Não é subespaço';
    parts.push(resultSpan);
    
    parts.forEach(p => infoDiv.appendChild(p));
}
