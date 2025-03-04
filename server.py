from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# SQLite database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'items.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Item model
class Item(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    variants = db.Column(db.String(200), nullable=False)  # Store as comma-separated string

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'description': self.description,
            'variants': self.variants.split(',')
        }

# Create database tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/api/items', methods=['GET'])
def get_items():
    items = Item.query.all()
    return jsonify([item.to_dict() for item in items])

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    new_item = Item(
        id=data['id'],
        name=data['name'],
        category=data['category'],
        price=data['price'],
        description=data['description'],
        variants=','.join(data['variants'])
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@app.route('/api/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return '', 204

@app.route('/api/items/<item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.json
    
    item.name = data['name']
    item.category = data['category']
    item.price = data['price']
    item.description = data['description']
    item.variants = ','.join(data['variants'])
    
    db.session.commit()
    return jsonify(item.to_dict())

if __name__ == '__main__':
    app.run(debug=True, port=5000)
