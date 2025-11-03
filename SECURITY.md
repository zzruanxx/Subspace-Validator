# Security Considerations

## Code Evaluation (eval() usage)

The application uses `eval()` in `backend/subspace_verifier.py` to parse mathematical constraint expressions. This is a deliberate design decision with the following mitigations:

### Risk Assessment
- **Scope**: Limited to parsing simple mathematical expressions like "x + y = 0"
- **Context**: Educational tool, not a production financial/medical system
- **Input Source**: User-provided constraints from a controlled web UI

### Mitigations in Place
1. **Restricted Builtins**: `eval()` is called with `{"__builtins__": {}}` to disable all built-in functions
2. **Limited Scope**: Only basic arithmetic operations (+, -, *, /) are expected
3. **Exception Handling**: Any evaluation errors are caught and handled gracefully
4. **Variable Limitation**: Only predefined variable names (x, y, z, w) are available

### Alternative Considerations
For a production system, consider:
- Using `sympy` for symbolic math parsing
- Implementing a custom expression parser
- Using `ast.literal_eval()` where applicable

## Flask Debug Mode

Debug mode is **disabled by default** in production. It can be enabled via environment variable:
```bash
export FLASK_DEBUG=true  # Only for development
```

## Error Handling

Error messages are sanitized to prevent information leakage:
- Stack traces are logged server-side only
- Generic error messages are returned to clients
- Detailed errors are only available in server logs

## XSS Prevention

All user input displayed in the UI is properly escaped:
- DOM manipulation uses `textContent` instead of `innerHTML` where possible
- User-provided constraint strings are escaped before display
- No direct HTML injection from user input
