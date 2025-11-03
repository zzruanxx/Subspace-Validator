// Verificador de Subespaços - JavaScript Frontend

const API_BASE = window.location.origin;
let currentDimension = 2;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDimension();
    // Add initial vectors
    addVector();
    addVector();
});

// Update dimension and vector inputs
function updateDimension() {
    const dimensionSelect = document.getElementById('dimension');
    currentDimension = parseInt(dimensionSelect.value);
    
    // Clear and recreate vector inputs
    const container = document.getElementById('vectors-container');
    const existingVectors = Array.from(container.querySelectorAll('.vector-input'));
    
    // Save existing values if any
    const values = existingVectors.map(v => {
        const inputs = v.querySelectorAll('input[type="number"]');
        return Array.from(inputs).map(inp => inp.value);
    });
    
    // Clear container
    container.innerHTML = '';
    
    // Recreate with saved values or empty
    if (values.length > 0) {
        values.forEach(val => addVector(val));
    }
}

// Add vector input fields
function addVector(values = null) {
    const container = document.getElementById('vectors-container');
    const vectorDiv = document.createElement('div');
    vectorDiv.className = 'vector-input';
    
    // Create input fields for each dimension
    const varNames = ['x', 'y', 'z', 'w'];
    for (let i = 0; i < currentDimension; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.placeholder = varNames[i] || `v${i+1}`;
        input.value = values && values[i] !== undefined ? values[i] : '';
        vectorDiv.appendChild(input);
    }
    
    // Add remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✗';
    removeBtn.onclick = () => vectorDiv.remove();
    vectorDiv.appendChild(removeBtn);
    
    container.appendChild(vectorDiv);
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

// Verify if the set is a subspace
async function verifySubspace() {
    const vectors = getVectors();
    const constraint = document.getElementById('constraint').value.trim();
    
    if (vectors.length === 0) {
        alert('Por favor, adicione pelo menos um vetor.');
        return;
    }
    
    // Show loading state
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    
    const summaryDiv = document.getElementById('summary');
    summaryDiv.className = 'summary';
    summaryDiv.innerHTML = '<p>Verificando...</p><div class="loading"></div>';
    
    const stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dimension: currentDimension,
                vectors: vectors,
                constraint: constraint
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro na verificação');
        }
        
        const result = await response.json();
        displayResults(result);
        
        // Show visualization for 2D
        if (currentDimension === 2) {
            visualizeSubspace(vectors, result.is_subspace, constraint);
        }
        
    } catch (error) {
        console.error('Error:', error);
        const summaryDiv = document.getElementById('summary');
        summaryDiv.className = 'summary failure';
        // Use textContent to prevent XSS
        const errorPara = document.createElement('p');
        errorPara.style.color = 'red';
        errorPara.textContent = `Erro: ${error.message}`;
        summaryDiv.innerHTML = '';
        summaryDiv.appendChild(errorPara);
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
        
        // Step header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'step-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'step-title';
        titleSpan.textContent = `${index + 1}. ${step.property}`;
        
        const resultSpan = document.createElement('span');
        resultSpan.className = 'step-result';
        if (step.result === true) {
            resultSpan.className += ' success';
            resultSpan.textContent = '✓ Satisfeito';
        } else if (step.result === false) {
            resultSpan.className += ' failure';
            resultSpan.textContent = '✗ Não Satisfeito';
        } else {
            resultSpan.className += ' warning';
            resultSpan.textContent = '⚠ Indeterminado';
        }
        
        headerDiv.appendChild(titleSpan);
        headerDiv.appendChild(resultSpan);
        
        // Step explanation
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'step-explanation';
        explanationDiv.textContent = step.explanation;
        
        stepDiv.appendChild(headerDiv);
        stepDiv.appendChild(explanationDiv);
        
        // Step details if available
        if (step.details && step.details.length > 0) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'step-details';
            
            const detailsTitle = document.createElement('strong');
            detailsTitle.textContent = 'Detalhes dos testes:';
            detailsDiv.appendChild(detailsTitle);
            
            step.details.slice(0, 5).forEach(detail => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'detail-item';
                
                if (detail.v1 && detail.v2) {
                    // Addition test
                    itemDiv.innerHTML = `
                        ${formatVector(detail.v1)} + ${formatVector(detail.v2)} = ${formatVector(detail.sum)}
                        <span style="color: ${detail.in_set ? 'green' : 'red'}">
                            ${detail.in_set ? '✓ no conjunto' : '✗ fora do conjunto'}
                        </span>
                    `;
                } else if (detail.vector && detail.scalar !== undefined) {
                    // Scalar multiplication test
                    itemDiv.innerHTML = `
                        ${detail.scalar} × ${formatVector(detail.vector)} = ${formatVector(detail.result)}
                        <span style="color: ${detail.in_set ? 'green' : 'red'}">
                            ${detail.in_set ? '✓ no conjunto' : '✗ fora do conjunto'}
                        </span>
                    `;
                }
                
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
    try {
        const response = await fetch(`${API_BASE}/api/random-example?dimension=${currentDimension}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar exemplo');
        }
        
        const example = await response.json();
        
        // Set dimension
        document.getElementById('dimension').value = example.dimension;
        currentDimension = example.dimension;
        
        // Set constraint
        document.getElementById('constraint').value = example.constraint || '';
        
        // Clear and add vectors
        const container = document.getElementById('vectors-container');
        container.innerHTML = '';
        
        example.vectors.forEach(vector => {
            addVector(vector);
        });
        
        // Optionally auto-verify
        setTimeout(() => verifySubspace(), 500);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao carregar exemplo: ' + error.message);
    }
}

// Clear all inputs
function clearAll() {
    document.getElementById('constraint').value = '';
    const container = document.getElementById('vectors-container');
    container.innerHTML = '';
    addVector();
    addVector();
    
    document.getElementById('results').style.display = 'none';
    document.getElementById('visualization').style.display = 'none';
}
