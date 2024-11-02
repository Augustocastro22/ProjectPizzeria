import config
from flask import render_template, jsonify
from flask_cors import CORS
from models import Person, people_schema, person_schema
from people import read_all

app = config.connex_app
app.add_api(config.basedir / "swagger.yml")

CORS(app.app, origins=["http://localhost:3000"])

@app.route("/")
def home():
    people = Person.query.all()
    return render_template("home.html", people=people)

@app.route("/api/clientes", methods=["GET"])
def get_people():
    people = read_all()
    return jsonify(people)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
