import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME", "NEXUS AI Decision Intelligence")
    API_VERSION = os.getenv("API_VERSION", "2.1.0")
    DEBUG = os.getenv("DEBUG", "False").strip().lower() in {"1", "true", "yes", "on"}
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "8000"))
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
    DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")


settings = Settings()