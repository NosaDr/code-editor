// app/api/verify-payment/route.ts

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin (server-side Firebase)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminDb = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { reference, userId, packageId } = await req.json();

    // Validate inputs
    if (!reference || !userId || !packageId) {
      return NextResponse.json(
        { error: "Missing required fields: reference, userId, packageId" },
        { status: 400 }
      );
    }

    // 1. Verify the transaction with Paystack using your SECRET key
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    // 2. Check Paystack says payment was successful
    if (!paystackData.status || paystackData.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed", details: paystackData.message },
        { status: 400 }
      );
    }

    const transactionRef = paystackData.data.reference;

    // 3. Check this reference hasn't already been used (prevents replay attacks)
    const existingTransaction = await adminDb
      .collection("creditTransactions")
      .where("paymentRef", "==", transactionRef)
      .get();

    if (!existingTransaction.empty) {
      return NextResponse.json(
        { error: "This transaction has already been processed" },
        { status: 409 }
      );
    }

    // 4. Match packageId to credit amounts
    const PACKAGES: Record<string, { credits: number; bonus: number; price: number; name: string }> = {
      "starter-basic": { credits: 100, bonus: 10, price: 2000, name: "Basic Pack" },
      "starter-premium": { credits: 250, bonus: 50, price: 5000, name: "Premium Pack" },
    };

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

    // 5. Verify the amount paid matches the expected price (in kobo)
    const amountPaidInKobo = paystackData.data.amount;
    const expectedAmountInKobo = pkg.price * 100;

    if (amountPaidInKobo !== expectedAmountInKobo) {
      return NextResponse.json(
        { error: "Amount paid does not match package price" },
        { status: 400 }
      );
    }

    const totalCredits = pkg.credits + pkg.bonus;

    // 6. Update user credits in Firestore (server-side, trusted)
    await adminDb.doc(`users/${userId}`).update({
      credits: FieldValue.increment(totalCredits),
      totalCreditsEarned: FieldValue.increment(totalCredits),
    });

    // 7. Log the transaction
    await adminDb.collection("creditTransactions").add({
      userId,
      packageId,
      packageName: pkg.name,
      creditsPurchased: pkg.credits,
      bonusCredits: pkg.bonus,
      totalCredits,
      amountPaid: pkg.price,
      paymentRef: transactionRef,
      date: FieldValue.serverTimestamp(),
      status: "completed",
      type: "registration",
    });

    return NextResponse.json({
      success: true,
      creditsAdded: totalCredits,
      message: `${totalCredits} credits added successfully`,
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}