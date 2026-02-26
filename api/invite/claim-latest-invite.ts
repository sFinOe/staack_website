import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

interface ClaimLatestInviteRequest {
  userId: string;
  deviceId?: string;
}

interface ClaimLatestInviteResponse {
  success: boolean;
  inviterId?: string;
  token?: string;
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

  const body = req.body as ClaimLatestInviteRequest;

  if (!body.userId || typeof body.userId !== 'string') {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const db = getDb();

    const invitesSnapshot = await db
      .collection('pending_invites')
      .where('redeemed', '==', false)
      .where('source', '==', 'web')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (invitesSnapshot.empty) {
      const response: ClaimLatestInviteResponse = {
        success: false,
        message: 'No pending invite found',
      };
      return res.status(404).json(response);
    }

    const inviteDoc = invitesSnapshot.docs[0];
    const inviteData = inviteDoc.data();

    await inviteDoc.ref.update({
      redeemed: true,
      redeemedBy: body.userId,
      redeemedAt: FieldValue.serverTimestamp(),
    });

    const response: ClaimLatestInviteResponse = {
      success: true,
      inviterId: inviteData.inviterId,
      token: inviteDoc.id,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'unknown';
    console.error('Error claiming invite:', errorMessage);
    return res.status(500).json({ error: `Internal server error: ${errorMessage}` });
  }
}
