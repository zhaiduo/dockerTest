// config.js
'use strict';
exports.setting = {
    "development": {
        "PORT": 8080,
        "HOST": "localhost",
        "HTTP": "http",
        "UPLOAD_URL": "upload",
        "UPLOAD_DIR": "uploads",
        "CORS_DOMAIN": "http://localhost:8088",
        "IMG_PREFIX": "blob_",
        "SQL_DIR": "db"
    },
    "production": {
        "PORT": 8080,
        "HOST": "",
        "HTTP": "http",
        "UPLOAD_URL": "upload",
        "UPLOAD_DIR": "uploads",
        "CORS_DOMAIN": "http://:8088",
        "IMG_PREFIX": "blob_",
        "SQL_DIR": "db"
    }
};