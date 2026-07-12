// Endpoint invocado periódicamente por Vercel Cron Job.
// Notifica por email los mensajes que llevan 5 minutos sin leerse.
// Protegido con CRON_SECRET para evitar invocaciones no autorizadas.
//
// NOTA: el AC pide notificar a los 5 minutos, pero vercel.json programa este cron
// cada hora ("0 * * * *") porque el plan Hobby de Vercel no permite crons más
// frecuentes que una vez al día para intervalos de minutos/horas. Consecuencia:
// el retraso real puede llegar a ~65 minutos. Decisión aceptada conscientemente
// (revisión de H6.1, 2026-07-08); si se necesita cumplir los 5 minutos, la
// alternativa es un disparador externo (ej. cron-job.org) llamando a este mismo
// endpoint con el header Authorization, sin tocar el código.

import { NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";
import { MESSAGE_NOTIFICATION_DELAY_MS } from "~/lib/order-constants";
import { sendNewMessageEmail } from "~/lib/resend";

export const dynamic = "force-dynamic"; // nunca cachear este endpoint

export async function GET(req: Request) {
  // Verificar CRON_SECRET: si no está configurado o el token no coincide, rechazar
  const expectedToken = env.CRON_SECRET;
  if (!expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threshold = new Date(Date.now() - MESSAGE_NOTIFICATION_DELAY_MS);

  // Mensajes candidatos: llevan 5min+ sin leer y aún no se ha avisado de ellos por email.
  const pendingMessages = await db.message.findMany({
    where: {
      createdAt: { lte: threshold },
      readAt: null,
      emailNotifiedAt: null,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, conversationId: true, senderId: true },
  });

  if (pendingMessages.length === 0) {
    return NextResponse.json({ data: { notified: 0 } });
  }

  // Agrupamos por conversación + remitente: si alguien mandó varios mensajes sin
  // respuesta, solo se notifica una vez (el más reciente, gracias al orderBy desc).
  const latestIdByGroup = new Map<string, string>();
  for (const message of pendingMessages) {
    const groupKey = `${message.conversationId}:${message.senderId}`;
    if (!latestIdByGroup.has(groupKey)) {
      latestIdByGroup.set(groupKey, message.id);
    }
  }

  let notified = 0;
  for (const messageId of latestIdByGroup.values()) {
    try {
      // Se marca como notificado ANTES de enviar para evitar doble envío si el cron se reintenta.
      // El where readAt:null revalida que no se haya leído justo entre el findMany y este update.
      const { count } = await db.message.updateMany({
        where: { id: messageId, readAt: null },
        data: { emailNotifiedAt: new Date() },
      });
      if (count === 0) continue; // se leyó entretanto: no se envía email (AC5)
      await sendNewMessageEmail(messageId);
      notified++;
    } catch (error) {
      console.error(
        `[cron/send-message-notifications] Error notificando mensaje ${messageId}`,
        error,
      );
    }
  }

  // El resto de mensajes de cada grupo ya quedan cubiertos por el email del más
  // reciente: se marcan como notificados sin enviar un email por cada uno.
  const handledIds = new Set(latestIdByGroup.values());
  const restIds = pendingMessages
    .map((m) => m.id)
    .filter((id) => !handledIds.has(id));
  if (restIds.length > 0) {
    await db.message.updateMany({
      where: { id: { in: restIds } },
      data: { emailNotifiedAt: new Date() },
    });
  }

  return NextResponse.json({ data: { notified } });
}
