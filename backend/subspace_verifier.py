"""
Verificador de Subespaços - Backend Python
Verifica se um conjunto é um subespaço de ℝⁿ
"""

import numpy as np
from typing import List, Dict, Tuple, Any
import re


class SubspaceVerifier:
    """Classe para verificar propriedades de subespaço vetorial"""
    
    def __init__(self, dimension: int):
        """
        Inicializa o verificador
        
        Args:
            dimension: Dimensão do espaço ℝⁿ
        """
        self.dimension = dimension
        self.steps = []
        
    def parse_vector(self, vector_str: str) -> np.ndarray:
        """
        Parse string de vetor para numpy array
        
        Args:
            vector_str: String representando vetor (ex: "1,2,3" ou "[1,2,3]")
            
        Returns:
            numpy array do vetor
        """
        # Remove brackets and spaces
        vector_str = vector_str.strip().replace('[', '').replace(']', '')
        # Split by comma
        components = [float(x.strip()) for x in vector_str.split(',')]
        return np.array(components)
    
    def check_zero_vector(self, vectors: List[np.ndarray]) -> Tuple[bool, str]:
        """
        Verifica se o vetor zero está no conjunto
        
        Args:
            vectors: Lista de vetores do conjunto
            
        Returns:
            Tuple (resultado, explicação)
        """
        zero = np.zeros(self.dimension)
        contains_zero = any(np.allclose(v, zero) for v in vectors)
        
        explanation = "✓ O vetor zero (0) está no conjunto" if contains_zero else \
                     "✗ O vetor zero (0) NÃO está no conjunto"
        
        self.steps.append({
            'property': 'Vetor Zero',
            'result': bool(contains_zero),
            'explanation': explanation
        })
        
        return contains_zero, explanation
    
    def check_closure_addition(self, vectors: List[np.ndarray], 
                               constraint_func=None) -> Tuple[bool, str]:
        """
        Verifica se o conjunto é fechado sob adição
        
        Args:
            vectors: Lista de vetores do conjunto
            constraint_func: Função que verifica se um vetor satisfaz as restrições
            
        Returns:
            Tuple (resultado, explicação)
        """
        if len(vectors) < 2:
            explanation = "⚠ Conjunto muito pequeno para verificar fechamento sob adição"
            self.steps.append({
                'property': 'Fechamento sob Adição',
                'result': None,
                'explanation': explanation
            })
            return None, explanation
        
        # Test some pairs
        tested_pairs = []
        all_closed = True
        
        for i in range(min(len(vectors), 3)):
            for j in range(i+1, min(len(vectors), 3)):
                v1, v2 = vectors[i], vectors[j]
                sum_vector = v1 + v2
                
                # Check if sum is in the set
                if constraint_func:
                    in_set = constraint_func(sum_vector)
                else:
                    in_set = any(np.allclose(sum_vector, v) for v in vectors)
                
                tested_pairs.append({
                    'v1': v1.tolist(),
                    'v2': v2.tolist(),
                    'sum': sum_vector.tolist(),
                    'in_set': bool(in_set)
                })
                
                if not in_set:
                    all_closed = False
        
        if all_closed:
            explanation = f"✓ Fechado sob adição: testados {len(tested_pairs)} pares"
        else:
            explanation = f"✗ NÃO fechado sob adição: encontrado contra-exemplo"
        
        self.steps.append({
            'property': 'Fechamento sob Adição',
            'result': bool(all_closed),
            'explanation': explanation,
            'details': tested_pairs
        })
        
        return all_closed, explanation
    
    def check_closure_scalar(self, vectors: List[np.ndarray], 
                            constraint_func=None) -> Tuple[bool, str]:
        """
        Verifica se o conjunto é fechado sob multiplicação escalar
        
        Args:
            vectors: Lista de vetores do conjunto
            constraint_func: Função que verifica se um vetor satisfaz as restrições
            
        Returns:
            Tuple (resultado, explicação)
        """
        if len(vectors) == 0:
            explanation = "⚠ Conjunto vazio"
            self.steps.append({
                'property': 'Fechamento sob Multiplicação Escalar',
                'result': None,
                'explanation': explanation
            })
            return None, explanation
        
        # Test some scalars
        scalars = [0, 1, -1, 2, 0.5, -2]
        tested = []
        all_closed = True
        
        for scalar in scalars[:4]:  # Test first 4 scalars
            for i in range(min(len(vectors), 2)):  # Test first 2 vectors
                v = vectors[i]
                scaled = scalar * v
                
                # Check if scaled vector is in the set
                if constraint_func:
                    in_set = constraint_func(scaled)
                else:
                    in_set = any(np.allclose(scaled, vec) for vec in vectors)
                
                tested.append({
                    'vector': v.tolist(),
                    'scalar': scalar,
                    'result': scaled.tolist(),
                    'in_set': bool(in_set)
                })
                
                if not in_set:
                    all_closed = False
        
        if all_closed:
            explanation = f"✓ Fechado sob multiplicação escalar: testados {len(tested)} casos"
        else:
            explanation = f"✗ NÃO fechado sob multiplicação escalar: encontrado contra-exemplo"
        
        self.steps.append({
            'property': 'Fechamento sob Multiplicação Escalar',
            'result': bool(all_closed),
            'explanation': explanation,
            'details': tested
        })
        
        return all_closed, explanation
    
    def verify_subspace(self, vectors: List[np.ndarray], 
                       constraint_func=None) -> Dict[str, Any]:
        """
        Verifica se o conjunto é um subespaço
        
        Args:
            vectors: Lista de vetores do conjunto
            constraint_func: Função opcional que verifica se um vetor satisfaz as restrições
            
        Returns:
            Dicionário com resultado e passos da verificação
        """
        self.steps = []
        
        # Check three properties
        has_zero, zero_msg = self.check_zero_vector(vectors)
        closed_add, add_msg = self.check_closure_addition(vectors, constraint_func)
        closed_scalar, scalar_msg = self.check_closure_scalar(vectors, constraint_func)
        
        # Determine if it's a subspace
        is_subspace = has_zero and closed_add and closed_scalar
        
        return {
            'is_subspace': bool(is_subspace),
            'dimension': self.dimension,
            'num_vectors': len(vectors),
            'steps': self.steps,
            'summary': self._generate_summary(is_subspace)
        }
    
    def _generate_summary(self, is_subspace: bool) -> str:
        """Gera resumo da verificação"""
        if is_subspace:
            return "✓ O conjunto É um subespaço de ℝⁿ (satisfaz todas as propriedades)"
        else:
            return "✗ O conjunto NÃO é um subespaço de ℝⁿ (falha em pelo menos uma propriedade)"


def create_constraint_function(constraint_str: str, dimension: int):
    """
    Cria função de restrição a partir de string
    
    Args:
        constraint_str: String descrevendo a restrição (ex: "x + y = 0")
        dimension: Dimensão do espaço
        
    Returns:
        Função que verifica se um vetor satisfaz a restrição
    """
    if not constraint_str or constraint_str.strip() == "":
        return None
    
    # Parse constraint string
    # Example: "x + y = 0" or "x1 + x2 = 0" or "x + y + z = 0"
    constraint_str = constraint_str.strip().lower()
    
    # Replace variable names with array indices
    var_names = ['x', 'y', 'z', 'w']
    if dimension <= 4:
        # Use x, y, z, w notation
        def check_constraint(v):
            try:
                # Create local variables for evaluation
                local_vars = {}
                for i, var in enumerate(var_names[:dimension]):
                    local_vars[var] = v[i]
                
                # Parse equation
                if '=' in constraint_str:
                    left, right = constraint_str.split('=')
                    left_val = eval(left.strip(), {"__builtins__": {}}, local_vars)
                    right_val = eval(right.strip(), {"__builtins__": {}}, local_vars)
                    return abs(left_val - right_val) < 1e-10
                else:
                    # Assume it should equal zero
                    val = eval(constraint_str, {"__builtins__": {}}, local_vars)
                    return abs(val) < 1e-10
            except:
                return True  # If can't parse, assume satisfied
        
        return check_constraint
    
    return None


def generate_random_example(dimension: int = 2) -> Dict[str, Any]:
    """
    Gera exemplo aleatório de conjunto
    
    Args:
        dimension: Dimensão do espaço
        
    Returns:
        Dicionário com vetores e restrições
    """
    import random
    
    example_types = [
        {
            'name': 'Subespaço - Plano passando pela origem',
            'dimension': 3,
            'constraint': 'x + y + z = 0',
            'vectors': [
                [1, -1, 0],
                [1, 0, -1],
                [0, 1, -1],
                [0, 0, 0]
            ]
        },
        {
            'name': 'Não-subespaço - Plano não passando pela origem',
            'dimension': 3,
            'constraint': 'x + y + z = 1',
            'vectors': [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0.5, 0.5, 0]
            ]
        },
        {
            'name': 'Subespaço - Reta pela origem',
            'dimension': 2,
            'constraint': 'y = 2*x',
            'vectors': [
                [0, 0],
                [1, 2],
                [2, 4],
                [-1, -2]
            ]
        },
        {
            'name': 'Não-subespaço - Reta não passando pela origem',
            'dimension': 2,
            'constraint': 'y = x + 1',
            'vectors': [
                [0, 1],
                [1, 2],
                [2, 3],
                [-1, 0]
            ]
        },
        {
            'name': 'Subespaço - Eixo X',
            'dimension': 2,
            'constraint': 'y = 0',
            'vectors': [
                [0, 0],
                [1, 0],
                [2, 0],
                [-3, 0]
            ]
        }
    ]
    
    example = random.choice(example_types)
    
    # Match dimension if specified
    filtered = [ex for ex in example_types if ex['dimension'] == dimension]
    if filtered:
        example = random.choice(filtered)
    
    return example
