from sqlalchemy import func

from config import db
from flask import abort, make_response, jsonify

from models import Pizza, Person, pizza_schema


def read_one(pizza_id):
    pizza = Pizza.query.get(pizza_id)

    if pizza is not None:
        return pizza_schema.dump(pizza)
    else:
        abort(404, f"Pizza with ID {pizza_id} not found")


from datetime import datetime

def update(id, pizza_data):
    existing_pizza = Pizza.query.filter(Pizza.id == id).one_or_none()

    if existing_pizza:
        # Cargar los datos entrantes
        update_pizza = pizza_schema.load(pizza_data, session=db.session)

        # Actualiza el contenido
        existing_pizza.content = update_pizza.content

        # Asigna el timestamp recibido desde el frontend, convirtiéndolo a un objeto datetime
        timestamp_str = pizza_data.get('timestamp')
        if timestamp_str:
            try:
                # Asumiendo que el formato que envías es ISO 8601
                existing_pizza.timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M')
            except ValueError:
                abort(400, "Timestamp format is incorrect. Use 'YYYY-MM-DD HH:MM' format.")

        db.session.commit()  # Guarda los cambios
        return pizza_schema.dump(existing_pizza), 200  # Cambia a 200 para indicar éxito
    else:
        abort(404, f"Pizza with id {id} not found")


def delete(pizza_id):
    existing_pizza = Pizza.query.get(pizza_id)

    if existing_pizza:
        db.session.delete(existing_pizza)
        db.session.commit()
        return make_response(f"{pizza_id} successfully deleted", 204)
    else:
        abort(404, f"Pizza with ID {pizza_id} not found")


def create(pizza):
    person_id = pizza.get("person_id")
    person = Person.query.get(person_id)

    if person:
        new_pizza = pizza_schema.load(pizza, session=db.session)
        person.pizzas.append(new_pizza)
        db.session.commit()
        return pizza_schema.dump(new_pizza), 201
    else:
        abort(404, f"Person not found for ID: {person_id}")
def get_pizza_group():
    grouped_pizzas = db.session.query(
        func.strftime('%Y-%m-%d %H:%M', Pizza.timestamp).label('timestamp_rounded'),
        Pizza.id,
        Pizza.content,
        Person.fname.label('client_fname'),
        Person.lname.label('client_lname')
    ).join(Person, Pizza.person_id == Person.id).order_by(
        func.strftime('%Y-%m-%d %H:%M', Pizza.timestamp)
    ).all()

    # Organizar las pizzas en grupos por timestamp truncado
    grouped_pizzas_dict = {}
    for row in grouped_pizzas:
        timestamp_rounded = row.timestamp_rounded
        pizza = {
            'id': row.id,
            'content': row.content,
            'client': {
                'fname': row.client_fname,
                'lname': row.client_lname
            }
        }
        if timestamp_rounded not in grouped_pizzas_dict:
            grouped_pizzas_dict[timestamp_rounded] = []
        grouped_pizzas_dict[timestamp_rounded].append(pizza)

    # Convertir el diccionario en una lista de diccionarios para facilitar su uso en la plantilla, manteniendo el orden
    grouped_pizzas_list = [{'timestamp': timestamp, 'pizzas': pizzas} for timestamp, pizzas in sorted(grouped_pizzas_dict.items())]
    return jsonify(grouped_pizzas_list)