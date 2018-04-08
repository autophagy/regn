from flask import request, jsonify
from functools import wraps
from jsonschema import Draft4Validator


def validate_schema(schema):
    validator = Draft4Validator(schema)

    def wrapper(fn):

        @wraps(fn)
        def wrapped(*args, **kwargs):
            input = request.get_json(force=True)
            errors = [error.message for error in validator.iter_errors(input)]
            if errors:
                response = jsonify(
                    dict(success=False, message="invalid", errors=errors)
                )
                response.status_code = 406
                return response

            else:
                return fn(*args, **kwargs)

        return wrapped

    return wrapper
