import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

interface RedeemInviteRequest {
  userId: string;
  inviterId: string;
}

interface RedeemInviteResponse {
  success: boolean;
  inviterId?: string;
  message?: string;
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

  const body = req.body as RedeemInviteRequest;

  if (!body.userId || typeof body.userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId' });
  }

  if (!body.inviterId || typeof body.inviterId !== 'string') {
    return res.status(400).json({ error: 'Missing inviterId' });
  }

  try {
    const db = getDb();

    const existingRedemption = await db
      .collection('redeemed_invites')
      .where('userId', '==', body.userId)
      .limit(1)
      .get();

    if (!existingRedemption.empty) {
      const response: RedeemInviteResponse = {
        success: false,
        message: 'User has already redeemed an invite',
      };
      return res.status(400).json(response);
    }

    if (body.userId === body.inviterId) {
      const response: RedeemInviteResponse = {
        success: false,
        message: 'Cannot redeem your own invite',
      };
      return res.status(400).json(response);
    }

    await db.collection('redeemed_invites').add({
      userId: body.userId,
      inviterId: body.inviterId,
      redeemedAt: FieldValue.serverTimestamp(),
      source: 'universal_link',
    });

    const response: RedeemInviteResponse = {
      success: true,
      inviterId: body.inviterId,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'unknown';
    console.error('Error redeeming invite:', errorMessage);
    return res.status(500).json({ error: `Internal server error: ${errorMessage}` });
  }
}
