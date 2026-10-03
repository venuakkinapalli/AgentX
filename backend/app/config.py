import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Smart Hostel Management Platform - Admin API"
    APP_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Supabase credentials (server-side only)
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # CORS Origins
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def active_supabase_key(self) -> str:
        # Prefer service role key on backend if provided; otherwise use publishable key
        return self.SUPABASE_SERVICE_ROLE_KEY.strip() or self.SUPABASE_PUBLISHABLE_KEY.strip()

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
