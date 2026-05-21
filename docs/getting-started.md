# Getting Started

```bash
git clone https://github.com/agentdock/agentdock-os.git
cd agentdock-os
cp .env.example .env
docker compose up -d
```

Open `http://localhost:3000` and initialize the database with `POST /system/init-db` on the API.
