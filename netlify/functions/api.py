import sys
import os

# Ensure the root project directory is in the Python module search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import serverless_wsgi
from api.index import app

def handler(event, context):
    """
    Netlify Serverless Function handler bridging AWS Lambda/Netlify events
    to the Flask application using serverless-wsgi.
    """
    # Netlify functions may pass event['path'] as either:
    # 1) '/api/something' (if rewritten directly)
    # 2) '/.netlify/functions/api/something'
    # 3) '/something'
    path = event.get('path', '')
    if path.startswith('/.netlify/functions/api'):
        remainder = path[len('/.netlify/functions/api'):]
        if not remainder.startswith('/api'):
            event['path'] = f"/api{remainder}" if remainder else "/api/"
        else:
            event['path'] = remainder
    elif not path.startswith('/api'):
        event['path'] = f"/api{path}"

    return serverless_wsgi.handle_request(app, event, context)
