import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

interface CreatePendingInviteRequest {
  inviterId: string;
}

interface PendingInvite {
  token: string;
  inviterId: string;
  createdAt: FirebaseFirestore.FieldValue;
  redeemed: boolean;
  redeemedBy: string | null;
  redeemedAt: FirebaseFirestore.FieldValue | null;
  source: 'app' | 'web';
}

function getDb(): FirebaseFirestore.Firestore {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as CreatePendingInviteRequest;

  if (!body.inviterId || typeof body.inviterId !== 'string') {
    return res.status(400).json({ error: 'Missing inviterId' });
  }

  try {
    const db = getDb();
    const token = randomUUID();

    const pendingInvite: PendingInvite = {
      token,
      inviterId: body.inviterId,
      createdAt: FieldValue.serverTimestamp(),
      redeemed: false,
      redeemedBy: null,
      redeemedAt: null,
      source: 'app',
    };

    await db.collection('pending_invites').doc(token).set(pendingInvite);

    return res.status(200).json({
      success: true,
      token,
      inviterId: body.inviterId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'unknown';
    console.error('Error creating pending invite:', errorMessage);
    return res.status(500).json({ error: `Internal server error: ${errorMessage}` });
  }
}
