import pathlib
import connexion
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow

# Configura el directorio base
basedir = pathlib.Path(__file__).parent.resolve()

# Crea la aplicación Connexion
connex_app = connexion.App(__name__, specification_dir=basedir)
app = connex_app.app

# Configura la base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{basedir / 'people.db'}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicializa la base de datos y Marshmallow
db = SQLAlchemy(app)
ma = Marshmallow(app)

# Inicializa Flask-Migrate
migrate = Migrate(app, db)

