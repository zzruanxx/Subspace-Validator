// Verificador de Subespaços - JavaScript Frontend

const API_BASE = window.location.origin;
let currentDimension = 2;
let vectorCount = 0;

// Toast notification system
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDimension();
    addVector();
    addVector();
});

// Update dimension and vector inputs
function updateDimension() {
    const dimensionSelect = document.getElementById('dimension');
    currentDimension = parseInt(dimensionSelect.value);
    
    const container = document.getElementById('vectors-container');
    const existingVectors = Array.from(container.querySelectorAll('.vector-input'));
    
    // Save existing values
    const values = existingVectors.map(v => {
        const inputs = v.querySelectorAll('input[type="number"]');
        return Array.from(inputs).map(inp => inp.value);
    });
    
    container.innerHTML = '';
    vectorCount = 0;
    
    if (values.length > 0) {
        values.forEach(val => addVector(val));
    }
}

// Add vector input fields
function addVector(values = null) {
    vectorCount++;
    const container = document.getElementById('vectors-container');
    const vectorDiv = document.createElement('div');
    vectorDiv.className = 'vector-input';
    
    // Vector label
    const label = document.createElement('span');
    label.className = 'vector-label';
    label.textContent = `v${vectorCount}`;
    vectorDiv.appendChild(label);
    
    // Create input fields for each dimension
    const varNames = ['x', 'y', 'z', 'w'];
    for (let i = 0; i < currentDimension; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.placeholder = varNames[i] || `d${i+1}`;
        input.setAttribute('aria-label', `Componente ${varNames[i] || i+1} do vetor ${vectorCount}`);
        input.value = values && values[i] !== undefined ? values[i] : '';
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') verifySubspace();
        });
        vectorDiv.appendChild(input);
    }
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remover vetor';
    removeBtn.setAttribute('aria-label', `Remover vetor ${vectorCount}`);
    removeBtn.onclick = () => {
        vectorDiv.style.animation = 'fadeOutVector 0.25s ease forwards';
        setTimeout(() => {
            vectorDiv.remove();
            renumberVectors();
        }, 250);
    };
    vectorDiv.appendChild(removeBtn);
    
    container.appendChild(vectorDiv);
}

// Renumber vector labels after deletion
function renumberVectors() {
    const labels = document.querySelectorAll('#vectors-container .vector-label');
    vectorCount = labels.length;
    labels.forEach((lbl, i) => {
        lbl.textContent = `v${i + 1}`;
    });
}

// Get vectors from input fields
function getVectors() {
    const container = document.getElementById('vectors-container');
    const vectorDivs = container.querySelectorAll('.vector-input');
    const vectors = [];
    
    vectorDivs.forEach(div => {
        const inputs = div.querySelectorAll('input[type="number"]');
        const vector = Array.from(inputs).map(inp => parseFloat(inp.value) || 0);
        vectors.push(vector);
    });
    
    return vectors;
}

// Show skeleton loading
function showLoading() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    
    const summaryDiv = document.getElementById('summary');
    summaryDiv.className = 'summary';
    summaryDiv.innerHTML = '';
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    const spinText = document.createElement('span');
    spinText.textContent = 'Analisando propriedades do subespaço...';
    spinner.appendChild(spinText);
    summaryDiv.appendChild(spinner);
    
    const stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const sk = document.createElement('div');
        sk.className = 'skeleton skeleton-block';
        stepsDiv.appendChild(sk);
    }
}

// Verify if the set is a subspace
async function verifySubspace() {
    const vectors = getVectors();
    const constraint = document.getElementById('constraint').value.trim();
    
    if (vectors.length === 0) {
        showToast('Adicione pelo menos um vetor.', 'error');
        return;
    }
    
    // Disable button and show loading text
    const btn = document.getElementById('btn-verify');
    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="btn-spinner"></span> Verificando…';
    
    showLoading();
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    try {
        const response = await fetch(`${API_BASE}/api/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dimension: currentDimension,
                vectors: vectors,
                constraint: constraint
            })
        });
        
        if (!response.ok) throw new Error('Erro na verificação');
        
        const result = await response.json();
        displayResults(result);
        
        if (currentDimension === 2) {
            resizeCanvas();
            visualizeSubspace(vectors, result.is_subspace, constraint);
            setTimeout(() => {
                document.getElementById('visualization').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        } else {
            document.getElementById('visualization').style.display = 'none';
        }
        
        showToast(
            result.is_subspace ? 'É um subespaço! ✓' : 'Não é um subespaço ✗',
            result.is_subspace ? 'success' : 'error'
        );
        
    } catch (error) {
        console.error('Error:', error);
        const summaryDiv = document.getElementById('summary');
        summaryDiv.className = 'summary failure';
        summaryDiv.textContent = '';
        const errorPara = document.createElement('p');
        errorPara.textContent = `Erro: ${error.message}`;
        summaryDiv.appendChild(errorPara);
        document.getElementById('steps').innerHTML = '';
        showToast('Erro ao verificar subespaço', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Display verification results
function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    
    // Summary
    const summaryDiv = document.getElementById('summary');
    summaryDiv.className = `summary ${result.is_subspace ? 'success' : 'failure'}`;
    summaryDiv.textContent = result.summary;
    
    // Steps
    const stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';
    
    result.steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        if (step.result === true) stepDiv.classList.add('step-success');
        else if (step.result === false) stepDiv.classList.add('step-failure');
        else stepDiv.classList.add('step-warning');
        stepDiv.style.animationDelay = `${index * 0.1}s`;
        
        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'step-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'step-title';
        titleSpan.textContent = `${index + 1}. ${step.property}`;
        
        const resultSpan = document.createElement('span');
        resultSpan.className = 'step-result';
        if (step.result === true) {
            resultSpan.classList.add('success');
            resultSpan.textContent = '✓ Satisfeito';
        } else if (step.result === false) {
            resultSpan.classList.add('failure');
            resultSpan.textContent = '✗ Não Satisfeito';
        } else {
            resultSpan.classList.add('warning');
            resultSpan.textContent = '⚠ Indeterminado';
        }
        
        headerDiv.appendChild(titleSpan);
        headerDiv.appendChild(resultSpan);
        
        // Explanation
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'step-explanation';
        explanationDiv.textContent = step.explanation;
        
        stepDiv.appendChild(headerDiv);
        stepDiv.appendChild(explanationDiv);
        
        // Details
        if (step.details && step.details.length > 0) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'step-details';
            
            const detailsTitle = document.createElement('strong');
            detailsTitle.textContent = 'Detalhes dos testes';
            detailsDiv.appendChild(detailsTitle);
            
            step.details.slice(0, 5).forEach(detail => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'detail-item';
                
                const exprSpan = document.createElement('span');
                const badgeSpan = document.createElement('span');
                badgeSpan.className = `detail-badge ${detail.in_set ? 'in-set' : 'not-in-set'}`;
                badgeSpan.textContent = detail.in_set ? '✓ no conjunto' : '✗ fora';
                
                if (detail.v1 && detail.v2) {
                    exprSpan.textContent = `${formatVector(detail.v1)} + ${formatVector(detail.v2)} = ${formatVector(detail.sum)}`;
                } else if (detail.vector && detail.scalar !== undefined) {
                    exprSpan.textContent = `${detail.scalar} × ${formatVector(detail.vector)} = ${formatVector(detail.result)}`;
                }
                
                itemDiv.appendChild(exprSpan);
                itemDiv.appendChild(badgeSpan);
                detailsDiv.appendChild(itemDiv);
            });
            
            stepDiv.appendChild(detailsDiv);
        }
        
        stepsDiv.appendChild(stepDiv);
    });
}

// Format vector for display
function formatVector(vector) {
    if (!Array.isArray(vector)) return '';
    return `(${vector.map(v => v.toFixed(2)).join(', ')})`;
}

// Load random example
async function loadRandomExample() {
    const btn = document.getElementById('btn-example');
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/api/random-example?dimension=${currentDimension}`);
        if (!response.ok) throw new Error('Erro ao carregar exemplo');
        
        const example = await response.json();
        
        document.getElementById('dimension').value = example.dimension;
        currentDimension = example.dimension;
        document.getElementById('constraint').value = example.constraint || '';
        
        const container = document.getElementById('vectors-container');
        container.innerHTML = '';
        vectorCount = 0;
        
        example.vectors.forEach(vector => addVector(vector));
        
        showToast(`Exemplo carregado: ${example.name || 'Aleatório'}`, 'info');
        
        setTimeout(() => verifySubspace(), 400);
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Erro ao carregar exemplo', 'error');
    } finally {
        btn.disabled = false;
    }
}

// Clear all inputs
function clearAll() {
    document.getElementById('constraint').value = '';
    const container = document.getElementById('vectors-container');
    container.innerHTML = '';
    vectorCount = 0;
    addVector();
    addVector();
    
    document.getElementById('results').style.display = 'none';
    document.getElementById('visualization').style.display = 'none';
    
    showToast('Campos limpos', 'info');
}

// Responsive canvas resizing
function resizeCanvas() {
    const canvas = document.getElementById('canvas');
    const container = document.getElementById('visualization');
    if (!container || container.style.display === 'none') return;
    
    const maxWidth = container.clientWidth - 58; // padding
    const baseWidth = 600;
    const baseHeight = 500;
    
    if (maxWidth < baseWidth) {
        canvas.width = maxWidth;
        canvas.height = Math.round(maxWidth * (baseHeight / baseWidth));
    } else {
        canvas.width = baseWidth;
        canvas.height = baseHeight;
    }
}

window.addEventListener('resize', () => {
    if (document.getElementById('visualization').style.display !== 'none') {
        resizeCanvas();
        // Re-render if data is available
        const vectors = getVectors();
        const constraint = document.getElementById('constraint').value.trim();
        if (vectors.length > 0 && currentDimension === 2) {
            // We don't have isSubspace cached, so just resize
            // Full re-render would need stored state
        }
    }
});
