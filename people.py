from config import db
from flask import abort, make_response
from models import Person, people_schema, person_schema

def read_all():
    people = Person.query.all()
    return people_schema.dump(people)


from flask import request, abort

def create():
    person = request.get_json()  # Obtener el cuerpo de la solicitud en formato JSON
    dni = person.get("dni")
    existing_person = Person.query.filter(Person.dni == dni).one_or_none()

    if existing_person is None:
        new_person = person_schema.load(person, session=db.session)
        db.session.add(new_person)
        db.session.commit()
        return person_schema.dump(new_person), 201
    else:
        abort(406, f"Person with dni {dni} already exists")

def read_one_by_dni(dni):
    person = Person.query.filter(Person.dni == dni).one_or_none()  # Suponiendo que tienes un campo 'dni' en tu modelo Person
    print(dni)
    if person is not None:
        return person_schema.dump(person)
    else:
        abort(404, f"Person with DNI {dni} not found")


def update(id, person):
    existing_person = Person.query.filter(Person.id == id).one_or_none()

    if existing_person:
        update_person = person_schema.load(person, session=db.session)
        existing_person.fname = update_person.fname
        db.session.merge(existing_person)
        db.session.commit()
        return person_schema.dump(existing_person), 201
    else:
        abort(404, f"Person with id {id} not found")


def delete(id):
    existing_person = Person.query.filter(Person.id == id).one_or_none()

    if existing_person:
        db.session.delete(existing_person)
        db.session.commit()
        return make_response(f"{id} successfully deleted", 200)
    else:
        abort(404, f"Person with id {id} not found")
