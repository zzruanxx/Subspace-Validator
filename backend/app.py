"""
Flask API para o Verificador de Subespaços
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import json
from subspace_verifier import SubspaceVerifier, create_constraint_function, generate_random_example
import os


from flask.json.provider import DefaultJSONProvider


# Custom JSON provider to handle numpy types
class NumpyJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        return super().default(obj)


app = Flask(__name__, static_folder='../static', static_url_path='/static')
app.json = NumpyJSONProvider(app)
CORS(app)


@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('../', 'index.html')


@app.route('/api/verify', methods=['POST'])
def verify_subspace():
    """
    Endpoint para verificar se um conjunto é subespaço
    
    Expected JSON:
    {
        "dimension": 2,
        "vectors": [[1,2], [3,4], [0,0]],
        "constraint": "x + y = 0"  // optional
    }
    """
    try:
        data = request.json
        
        dimension = data.get('dimension', 2)
        vectors_data = data.get('vectors', [])
        constraint_str = data.get('constraint', '')
        
        # Parse vectors
        vectors = []
        for v_data in vectors_data:
            if isinstance(v_data, list):
                vectors.append(np.array(v_data, dtype=float))
            elif isinstance(v_data, str):
                # Parse from string
                v_str = v_data.strip().replace('[', '').replace(']', '')
                components = [float(x.strip()) for x in v_str.split(',')]
                vectors.append(np.array(components))
        
        # Create constraint function if provided
        constraint_func = create_constraint_function(constraint_str, dimension)
        
        # Verify subspace
        verifier = SubspaceVerifier(dimension)
        result = verifier.verify_subspace(vectors, constraint_func)
        
        # Add constraint to result
        result['constraint'] = constraint_str
        
        return jsonify(result)
        
    except Exception as e:
        # Log error for debugging but don't expose stack trace to client
        app.logger.error(f"Error in verify_subspace: {e}", exc_info=True)
        return jsonify({
            'error': 'Erro interno ao processar requisição',
            'message': 'Erro ao verificar subespaço'
        }), 400


@app.route('/api/random-example', methods=['GET'])
def random_example():
    """
    Endpoint para gerar exemplo aleatório
    
    Query params:
        dimension: dimensão do espaço (default: 2)
    """
    try:
        dimension = int(request.args.get('dimension', 2))
        example = generate_random_example(dimension)
        return jsonify(example)
    except Exception as e:
        # Log error for debugging but don't expose stack trace to client
        app.logger.error(f"Error in random_example: {e}", exc_info=True)
        return jsonify({
            'error': 'Erro interno ao processar requisição',
            'message': 'Erro ao gerar exemplo'
        }), 400


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Verificador de Subespaços API'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Debug mode should only be enabled in development
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
