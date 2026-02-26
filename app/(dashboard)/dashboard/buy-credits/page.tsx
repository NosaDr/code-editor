"use client";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Coins, Zap, Star, Crown, CheckCircle, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 1000,
    bonus: 0,
    popular: false,
    icon: Coins,
    color: 'from-slate-600 to-slate-700',
    badge: 'bg-slate-500',
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 100,
    price: 2000,
    bonus: 10,
    popular: true,
    icon: Zap,
    color: 'from-emerald-600 to-emerald-700',
    badge: 'bg-emerald-500',
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 250,
    price: 5000,
    bonus: 50,
    popular: false,
    icon: Star,
    color: 'from-blue-600 to-blue-700',
    badge: 'bg-blue-500',
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    credits: 500,
    price: 10000,
    bonus: 150,
    popular: false,
    icon: Crown,
    color: 'from-purple-600 to-purple-700',
    badge: 'bg-purple-500',
  }
];

export default function BuyCreditsPage() {
  const { user, userData } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default to Basic
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase credits");
      return;
    }

    setLoading(true);

    try {
      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();
      
      const totalCredits = selectedPackage.credits + selectedPackage.bonus;
      
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        email: user.email!,
        amount: selectedPackage.price * 100, // Convert to kobo
        currency: 'NGN',
        metadata: {
          custom_fields: [
            { display_name: "User ID", variable_name: "user_id", value: user.uid },
            { display_name: "Package", variable_name: "package", value: selectedPackage.id },
            { display_name: "Credits", variable_name: "credits", value: totalCredits.toString() }
          ]
        },
        onSuccess: async (transaction: any) => {
          try {
            // Update user credits in Firestore
            await updateDoc(doc(db, "users", user.uid), {
              credits: increment(totalCredits),
              totalCreditsEarned: increment(totalCredits),
            });

            // Log the transaction
            await addDoc(collection(db, "creditTransactions"), {
              userId: user.uid,
              packageId: selectedPackage.id,
              packageName: selectedPackage.name,
              creditsPurchased: selectedPackage.credits,
              bonusCredits: selectedPackage.bonus,
              totalCredits: totalCredits,
              amountPaid: selectedPackage.price,
              paymentRef: transaction.reference,
              date: serverTimestamp(),
              status: 'completed'
            });

            toast.success(`Successfully purchased ${totalCredits} credits! 🎉`);
            
            // Refresh page to show new balance
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            
          } catch (error) {
            console.error("Error updating credits:", error);
            toast.error("Payment successful but error updating credits. Please contact support.");
            setLoading(false);
          }
        },
        onCancel: () => {
          setLoading(false);
          toast.error("Transaction cancelled.");
        }
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error initializing payment. Please try again.");
      setLoading(false);
    }
  };

  const currentCredits = userData?.credits || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Purchase Credits</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Credits are used to unlock practice sessions and mock exams. Choose a package that fits your study needs.
        </p>
      </div>

      {/* Current Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-sm mb-1">Current Balance</p>
            <h2 className="text-5xl font-bold flex items-center gap-3">
              <Coins size={48} className="text-emerald-300" />
              {currentCredits.toLocaleString()}
              <span className="text-2xl text-emerald-200">credits</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-emerald-200 text-sm mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-100">
              {(userData?.totalCreditsEarned || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Zap className="text-emerald-600" size={28} />
          Choose Your Package
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedPackage.id === pkg.id;
            const totalCredits = pkg.credits + pkg.bonus;

            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative rounded-2xl p-6 transition-all transform hover:scale-105 ${
                  isSelected
                    ? 'ring-4 ring-emerald-500 shadow-2xl scale-105'
                    : 'shadow-lg hover:shadow-xl'
                } bg-gradient-to-br ${pkg.color} text-white`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="text-emerald-300" size={28} />
                  </div>
                )}

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Icon size={48} />
                  </div>
                </div>

                {/* Package Name */}
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>

                {/* Credits */}
                <div className="mb-4">
                  <p className="text-2xl font-bold">{pkg.credits}</p>
                  <p className="text-sm opacity-90">credits</p>
                  
                  {pkg.bonus > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-2 bg-white/20 rounded-lg py-2 px-3">
                      <TrendingUp size={16} />
                      <span className="text-sm font-bold">+{pkg.bonus} BONUS</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                {pkg.bonus > 0 && (
                  <p className="text-sm mb-4 bg-white/10 rounded-lg py-2 px-3">
                    Total: <strong>{totalCredits} credits</strong>
                  </p>
                )}

                {/* Price */}
                <div className="border-t border-white/20 pt-4">
                  <p className="text-xl font-bold">₦{pkg.price.toLocaleString()}</p>
                  <p className="text-sm opacity-75">
                    ₦{(pkg.price / totalCredits).toFixed(2)} per credit
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase Summary */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Purchase Summary</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600">Package</span>
            <span className="font-bold text-slate-900">{selectedPackage.name}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600">Base Credits</span>
            <span className="font-bold text-slate-900">{selectedPackage.credits}</span>
          </div>
          
          {selectedPackage.bonus > 0 && (
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-emerald-600 flex items-center gap-2">
                <TrendingUp size={16} />
                Bonus Credits
              </span>
              <span className="font-bold text-emerald-600">+{selectedPackage.bonus}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-slate-900">Total Credits</span>
            <span className="text-2xl font-bold text-emerald-600">
              {selectedPackage.credits + selectedPackage.bonus}
            </span>
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Processing...
            </>
          ) : (
            <>
              <Coins size={24} />
              Purchase for ₦{selectedPackage.price.toLocaleString()}
            </>
          )}
        </button>
        
        <p className="text-xs text-center text-slate-500 mt-4">
          Secured by Paystack • Credits are non-refundable
        </p>
      </div>

      {/* How Credits Work */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
          <Zap className="text-blue-600" size={20} />
          How Credits Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex gap-3">
            <span className="text-blue-600">•</span>
            <span><strong>Subject Practice:</strong> 5 credits per session</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600">•</span>
            <span><strong>JAMB Mock:</strong> 20 credits per exam</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600">•</span>
            <span><strong>WAEC/NECO Mock:</strong> 15 credits per exam</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600">•</span>
            <span><strong>Junior Exams:</strong> 10 credits per exam</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600">•</span>
            <span><strong>Credits never expire</strong> - use them anytime!</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-600">•</span>
            <span><strong>View explanations:</strong> 1 credit per question</span>
          </div>
        </div>
      </div>
    </div>
  );
}