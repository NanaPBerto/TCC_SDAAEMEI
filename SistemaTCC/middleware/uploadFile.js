// uploadFile.js /*
const multer = require('multer');
const path = require('path');

// Configuração para salvar em memória
const memoryStorage = multer.memoryStorage();

// Configuração para salvar no disco
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
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

// Configurações com limites aumentados
const multerConfig = {
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limite por arquivo
        files: 10 // Máximo de 10 arquivos
    }
};

// Exportar diferentes configurações
module.exports = {
    // Para salvar em memória (usar nas rotas)
    memoryUpload: multer({ 
        storage: memoryStorage,
        ...multerConfig
    }),
    
    // Para salvar no disco
    diskUpload: multer({ 
        storage: diskStorage,
        ...multerConfig
    }),
    
    // Para campos específicos com configurações personalizadas
    atividadeUpload: multer({
        storage: memoryStorage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 20 * 1024 * 1024, // 20MB
            files: 4 // Máximo 4 arquivos (imagem, video, musica, partitura)
        }
    }),
    
    usuarioUpload: multer({
        storage: memoryStorage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 15 * 1024 * 1024, // 15MB
            files: 2 // Máximo 2 arquivos (imagem, minicurriculo)
        }
    })
};