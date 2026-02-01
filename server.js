const { WebcastPushConnection } = require('tiktok-live-connector');
const { Server } = require('socket.io');

// === CONFIGURACIÓN ===
// CAMBIA ESTO POR EL USUARIO QUE ESTÁ EN VIVO (Sin @)
let tiktokUsername = "marycorona847"; 

// Configuración del servidor para Render
const PORT = process.env.PORT || 3000;
const io = new Server(PORT, {
    cors: {
        origin: "*", // Permite conexiones desde cualquier lugar (App/Web)
        methods: ["GET", "POST"]
    }
});

console.log(`🔌 Iniciando servidor en puerto ${PORT}...`);

// Conexión a TikTok
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Conectar al Live
tiktokLiveConnection.connect().then(state => {
    console.info(`✅ Conectado al Live de: ${state.roomId}`);
}).catch(err => {
    console.error('❌ Error al conectar (¿El usuario está en vivo?):', err);
});

// === EVENTOS ===

// 1. CHAT
tiktokLiveConnection.on('chat', data => {
    io.emit('chat', {
        user: data.uniqueId,
        comment: data.comment
    });
});

// 2. LIKES
tiktokLiveConnection.on('like', data => {
    io.emit('like', {
        user: data.uniqueId,
        count: data.likeCount
    });
});

// 3. REGALOS
tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return; // Ignorar spam de racha
    
    console.log(`🎁 ${data.uniqueId} envió ${data.giftName}`);
    io.emit('gift', {
        user: data.uniqueId,
        giftName: data.giftName,
        diamondCount: data.diamondCount
    });

});
