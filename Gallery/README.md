# NDLS Gallery

Solution d'hébergement personnel de photos/vidéos avec synchronisation automatique sur tous les appareils.

## Fonctionnalités clés

### Client Web & Mobile

- Consultation et gestion des médias
- Upload multiple
- Synchronisation en temps réel
- Visionnage hors ligne
- Détection de doublons

## Prérequis

- VPS Linux (1 CPU, 2GB RAM, 20GB SSD)
- Node.js 18+
- SQLite3
- FFmpeg
- Nginx (recommandé)

## Installation rapide

```bash
# Installer les dépendances
sudo apt update && sudo apt install -y nodejs npm ffmpeg sqlite3 nginx

# Cloner le dépôt
sudo git clone [URL_DU_REPO] /opt/ndls-gallery
cd /opt/ndls-gallery/Server
npm install

# Configurer Nginx et SSL
sudo certbot --nginx -d votre-domaine.com

# Démarrer le service
sudo systemctl enable --now ndls-gallery
```

## Configuration de l'environnement

Créer un fichier `.env` à la racine du dossier Server avec les variables suivantes :

```
NODE_ENV=development
PORT=3000
UPLOAD_DIR=./data/media
THUMBS_DIR=./data/thumbs
```

## Structure du projet

```
NDLS/
├── Server/      # API et logique métier
├── WebClient/   # Application web
└── iOS/         # Application mobile iOS
```

## API Principale

- `GET /api/media` - Lister les médias
- `POST /api/media/upload` - Uploader des fichiers
- `GET /api/albums` - Gérer les albums

## Configuration requise

- Accès internet
- Navigateur web récent
- iOS 15+ pour l'application mobile

## Licence

Open Source - ISC

## Auteur

Andrea Belvedere
