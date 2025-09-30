const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta uploads existe
const ensureUploadsDir = () => {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    return uploadsDir;
};

// Configuração para salvar no disco
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = ensureUploadsDir();
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Nome único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'application/pdf' ||
        file.mimetype.startsWith('audio/') ||
        file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos PNG, JPG, JPEG, PDF, de áudio e de vídeo são permitidos!'), false);
    }
};

const multerConfig = {
    storage: diskStorage, // ← MUDEI AQUI para diskStorage
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 10
    }
};

module.exports = {
    memoryUpload: multer({ ...multerConfig }),
    diskUpload: multer({ ...multerConfig }),
    
    atividadeUpload: multer({
        ...multerConfig,
        limits: {
            fileSize: 20 * 1024 * 1024,
            files: 4
        }
    }),
    
    usuarioUpload: multer({
        ...multerConfig,
        limits: {
            fileSize: 15 * 1024 * 1024,
            files: 2
        }
    })
};