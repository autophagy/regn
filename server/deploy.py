from app import create_app, db
import os

app = create_app(os.getenv('FLASK_CONFIG') or 'default')
db.create_all()
app.run()
