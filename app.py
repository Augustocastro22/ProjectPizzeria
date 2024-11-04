import config
from flask import render_template, jsonify, request, abort
from flask_cors import CORS
import pizzas
from models import Person, Pizza
from people import read_all, create, read_one_by_dni, delete
import people
from sqlalchemy import func

app = config.connex_app
app.add_api(config.basedir / "swagger.yml")

CORS(app.app, origins=["http://localhost:3000"])


@app.route("/api/clientes", methods=["GET"])
def get_people():
    people = read_all()
    return jsonify(people)

app.add_url_rule('/api/create_people', 'create_people', create, methods=['POST'])

@app.route("/api/people/<string:dni>", methods=['GET'])
def get_person_by_dni(dni):
    return read_one_by_dni(dni)

@app.route("/api/clientes/<id>", methods=["PUT"])
def update_person(id):
    person_data = request.get_json()
    return people.update(id, person_data)


@app.route("/api/clientes/<id>", methods=["DELETE"])
def delete_person(id):
    return delete(id)
@app.route('/api/pizzas', methods=['POST'])
def create_pizza():
    pizza_data = request.get_json()
    print(pizza_data)
    return pizzas.create(pizza_data)

@app.route('/api/grouped_pizzas', methods=['GET'])
def get_grouped_pizzas():
    return pizzas.get_pizza_group()


@app.route('/api/pizzas/<id>', methods=['PUT'])
def update_pizza(id):
    pizza_data = request.get_json()
    if not pizza_data or 'content' not in pizza_data:
        abort(400, "Missing 'content' in request data")

    return pizzas.update(id, pizza_data)

@app.route('/api/pizzas/<id>', methods=['DELETE'])
def delete_pizza(id):
    return pizzas.delete(id)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
