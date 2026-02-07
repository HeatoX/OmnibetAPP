import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeMessage, sendMessage } from '@/lib/telegram-service';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/telegram
 * Webhook handler for Telegram Bot updates
 */
export async function POST(request) {
    try {
        const update = await request.json();

        // Handle incoming message
        if (update.message) {
            await handleMessage(update.message);
        }

        // Handle callback query (button presses)
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('Telegram webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

/**
 * Handle incoming text messages
 */
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text?.trim() || '';
    const username = message.from?.first_name || message.from?.username;

    // Command handlers
    if (text.startsWith('/start')) {
        await handleStart(chatId, username, message);
    } else if (text.startsWith('/subscribe')) {
        await handleSubscribe(chatId, message);
    } else if (text.startsWith('/status')) {
        await handleStatus(chatId);
    } else if (text.startsWith('/pause')) {
        await updateSubscriptionStatus(chatId, 'paused');
        await sendMessage(chatId, '⏸️ Alertas pausadas. Usa /resume para reactivar.');
    } else if (text.startsWith('/resume')) {
        await updateSubscriptionStatus(chatId, 'active');
        await sendMessage(chatId, '▶️ ¡Alertas reactivadas! Recibirás las próximas predicciones.');
    } else if (text.startsWith('/settings')) {
        await handleSettings(chatId);
    } else if (text.startsWith('/help')) {
        await sendHelpMessage(chatId);
    }
}

/**
 * /start command - Welcome new users
 */
async function handleStart(chatId, username, message) {
    // Check if user is already registered
    const { data: existing } = await supabase
        .from('telegram_subscribers')
        .select('id')
        .eq('chat_id', chatId.toString())
        .single();

    if (!existing) {
        // Register new subscriber
        await supabase.from('telegram_subscribers').insert({
            chat_id: chatId.toString(),
            username,
            status: 'active',
            preferences: { diamonds: true, banker: true, dailySummary: true }
        });
    }

    await sendWelcomeMessage(chatId, username);
}

/**
 * /subscribe command - Link to OmniBet account
 */
async function handleSubscribe(chatId, message) {
    const parts = message.text?.split(' ');
    const linkCode = parts?.[1];

    if (!linkCode) {
        await sendMessage(chatId, `
Para vincular tu cuenta de OmniBet:

1. Ve a tu perfil en OmniBet AI
2. Haz clic en "Conectar Telegram"
3. Copia el código que te aparece
4. Envíamelo aquí: /subscribe CODIGO

Ejemplo: \`/subscribe ABC123\`
        `);
        return;
    }

    // Verify link code (this would check against a temp codes table)
    const { data: linkData } = await supabase
        .from('telegram_link_codes')
        .select('user_id')
        .eq('code', linkCode)
        .eq('used', false)
        .single();

    if (!linkData) {
        await sendMessage(chatId, '❌ Código inválido o expirado. Genera uno nuevo en OmniBet.');
        return;
    }

    // Link the accounts
    await supabase.from('telegram_subscribers')
        .update({ omnibet_user_id: linkData.user_id })
        .eq('chat_id', chatId.toString());

    await supabase.from('telegram_link_codes')
        .update({ used: true })
        .eq('code', linkCode);

    await sendMessage(chatId, '✅ ¡Cuenta vinculada con éxito! Ahora recibirás alertas personalizadas según tu nivel de suscripción.');
}

/**
 * /status command - Show subscription status
 */
async function handleStatus(chatId) {
    const { data: subscriber } = await supabase
        .from('telegram_subscribers')
        .select('*')
        .eq('chat_id', chatId.toString())
        .single();

    if (!subscriber) {
        await sendMessage(chatId, 'No estás registrado. Usa /start para comenzar.');
        return;
    }

    const statusEmoji = subscriber.status === 'active' ? '🟢' : '🔴';

    await sendMessage(chatId, `
📱 *Tu Estado de Suscripción*

${statusEmoji} Estado: ${subscriber.status === 'active' ? 'Activo' : 'Pausado'}
📅 Desde: ${new Date(subscriber.created_at).toLocaleDateString('es-ES')}
🔗 Cuenta OmniBet: ${subscriber.omnibet_user_id ? 'Vinculada ✅' : 'No vinculada'}

*Preferencias:*
💎 Alertas Diamante: ${subscriber.preferences?.diamonds ? 'Sí' : 'No'}
🔥 Banker del Día: ${subscriber.preferences?.banker ? 'Sí' : 'No'}
📊 Resumen Diario: ${subscriber.preferences?.dailySummary ? 'Sí' : 'No'}
    `);
}

/**
 * /settings command - Show settings menu
 */
async function handleSettings(chatId) {
    await sendMessage(chatId, `
⚙️ *Configuración de Alertas*

Selecciona qué alertas quieres recibir:

Usa estos comandos:
• /toggle_diamonds - Alertas de predicciones 💎
• /toggle_banker - Banker del Día 🔥
• /toggle_summary - Resumen diario 📊

Usa /status para ver tu configuración actual.
    `);
}

/**
 * Update subscription status
 */
async function updateSubscriptionStatus(chatId, status) {
    await supabase.from('telegram_subscribers')
        .update({ status })
        .eq('chat_id', chatId.toString());
}

/**
 * Send help message
 */
async function sendHelpMessage(chatId) {
    await sendMessage(chatId, `
🤖 *OmniBet AI - Ayuda*

*Comandos disponibles:*
/start - Iniciar el bot
/subscribe CÓDIGO - Vincular cuenta OmniBet
/status - Ver tu estado
/settings - Configurar alertas
/pause - Pausar alertas
/resume - Reanudar alertas
/help - Ver esta ayuda

*¿Tienes problemas?*
Contacta soporte: support@omnibet.ai
    `);
}

/**
 * Handle callback queries (inline buttons)
 */
async function handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.data;

    // Handle different callback actions
    // This would be expanded based on button types

    await sendMessage(chatId, 'Acción procesada.');
}
