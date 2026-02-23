import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Database
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'bharatbit-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Email Configuration
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', 'support@bharatbit.world')
OTC_EMAIL = os.environ.get('OTC_EMAIL', 'otc@bharatbit.world')
