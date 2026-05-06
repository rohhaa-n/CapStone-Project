from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.challenges import challenges_bp
from routes.validate import validate_bp
from routes.hints import hints_bp


load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    app.register_blueprint(challenges_bp, url_prefix="/api")
    app.register_blueprint(validate_bp, url_prefix="/api")
    app.register_blueprint(hints_bp, url_prefix="/api")
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)

