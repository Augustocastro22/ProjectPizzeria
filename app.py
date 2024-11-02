import config
from flask import render_template, jsonify
from models import Person

app = config.connex_app
app.add_api(config.basedir / "swagger.yml")


@app.route("/")
def home():
    people = Person.query.all()
    return render_template("home.html", people=people)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

@app.route("/api/clientes", methods=["GET"])
def get_people():
    # Datos de ejemplo; podrías obtenerlos desde una base de datos
    people = [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
        {"id": 3, "name": "Charlie"}
    ]
    return jsonify(people)