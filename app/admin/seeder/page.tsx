"use client";
import { useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Loader2, CheckCircle, Database, Trash2, AlertCircle, Beaker, Palette, Calculator, Globe } from "lucide-react";
import { toast } from "sonner";

// Categorized subjects
const SUBJECTS_DATA = {
  // SCIENCE SUBJECTS
  sciences: [
    { id: "physics", name: "Physics", color: "bg-blue-100 text-blue-600" },
    { id: "chemistry", name: "Chemistry", color: "bg-green-100 text-green-600" },
    { id: "biology", name: "Biology", color: "bg-emerald-100 text-emerald-600" },
    { id: "mathematics", name: "Mathematics", color: "bg-indigo-100 text-indigo-600" },
    { id: "further-mathematics", name: "Further Mathematics", color: "bg-purple-100 text-purple-600" },
    { id: "agricultural-science", name: "Agricultural Science", color: "bg-lime-100 text-lime-600" },
  ],
  
  // ARTS SUBJECTS
  arts: [
    { id: "literature", name: "Literature in English", color: "bg-purple-100 text-purple-600" },
    { id: "government", name: "Government", color: "bg-red-100 text-red-600" },
    { id: "crs", name: "Christian Religious Studies", color: "bg-amber-100 text-amber-600" },
    { id: "irs", name: "Islamic Religious Studies", color: "bg-teal-100 text-teal-600" },
    { id: "history", name: "History", color: "bg-orange-100 text-orange-600" },
    { id: "geography", name: "Geography", color: "bg-cyan-100 text-cyan-600" },
    { id: "civic-education", name: "Civic Education", color: "bg-rose-100 text-rose-600" },
  ],
  
  // COMMERCIAL SUBJECTS
  commercial: [
    { id: "accounting", name: "Accounting", color: "bg-green-100 text-green-600" },
    { id: "commerce", name: "Commerce", color: "bg-emerald-100 text-emerald-600" },
    { id: "economics", name: "Economics", color: "bg-blue-100 text-blue-600" },
    { id: "business-studies", name: "Business Studies", color: "bg-teal-100 text-teal-600" },
  ],
  
  // GENERAL/CORE SUBJECTS (Available to all students)
  general: [
    { id: "english", name: "English Language", color: "bg-slate-100 text-slate-600" },
    { id: "yoruba", name: "Yoruba", color: "bg-yellow-100 text-yellow-700" },
    { id: "igbo", name: "Igbo", color: "bg-green-100 text-green-700" },
    { id: "hausa", name: "Hausa", color: "bg-red-100 text-red-700" },
    { id: "french", name: "French", color: "bg-blue-100 text-blue-700" },
    { id: "computer-studies", name: "Computer Studies", color: "bg-indigo-100 text-indigo-600" },
  ]
};

// Sample questions for each subject
const SAMPLE_QUESTIONS: Record<string, any[]> = {
  physics: [
    {
      questionText: "What is the SI unit of force?",
      options: ["Newton", "Joule", "Watt", "Pascal"],
      correctOption: 0,
      explanation: "The SI unit of force is the Newton (N), named after Sir Isaac Newton."
    },
    {
      questionText: "Which of the following is a vector quantity?",
      options: ["Speed", "Distance", "Velocity", "Time"],
      correctOption: 2,
      explanation: "Velocity is a vector quantity because it has both magnitude and direction."
    },
    {
      questionText: "What is the acceleration due to gravity on Earth?",
      options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"],
      correctOption: 1,
      explanation: "The standard acceleration due to gravity on Earth is approximately 9.8 m/s²."
    }
  ],
  chemistry: [
    {
      questionText: "What is the chemical symbol for Gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctOption: 2,
      explanation: "The chemical symbol for Gold is Au, from its Latin name 'Aurum'."
    },
    {
      questionText: "What is the pH of pure water?",
      options: ["5", "6", "7", "8"],
      correctOption: 2,
      explanation: "Pure water has a pH of 7, making it neutral."
    },
    {
      questionText: "Which gas is most abundant in Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
      correctOption: 2,
      explanation: "Nitrogen makes up about 78% of Earth's atmosphere."
    }
  ],
  biology: [
    {
      questionText: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
      correctOption: 2,
      explanation: "Mitochondria are known as the powerhouse of the cell because they produce ATP."
    },
    {
      questionText: "What is photosynthesis?",
      options: [
        "Breaking down food",
        "Converting light energy to chemical energy",
        "Cell division",
        "Protein synthesis"
      ],
      correctOption: 1,
      explanation: "Photosynthesis is the process by which plants convert light energy into chemical energy."
    }
  ],
  mathematics: [
    {
      questionText: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correctOption: 1,
      explanation: "15% of 200 = (15/100) × 200 = 30"
    },
    {
      questionText: "Solve: 2x + 5 = 15",
      options: ["x = 3", "x = 5", "x = 7", "x = 10"],
      correctOption: 1,
      explanation: "2x + 5 = 15 → 2x = 10 → x = 5"
    }
  ],
  english: [
    {
      questionText: "What is the plural of 'Child'?",
      options: ["Childs", "Children", "Childes", "Childer"],
      correctOption: 1,
      explanation: "The correct plural form of 'child' is 'children'."
    },
    {
      questionText: "Identify the verb in this sentence: 'The cat runs quickly.'",
      options: ["cat", "runs", "quickly", "the"],
      correctOption: 1,
      explanation: "'Runs' is the action word (verb) in this sentence."
    }
  ],
  literature: [
    {
      questionText: "Who wrote 'Things Fall Apart'?",
      options: ["Wole Soyinka", "Chinua Achebe", "Chimamanda Adichie", "Ben Okri"],
      correctOption: 1,
      explanation: "'Things Fall Apart' was written by Chinua Achebe in 1958."
    }
  ],
  government: [
    {
      questionText: "What does 'Democracy' mean?",
      options: [
        "Rule by the military",
        "Rule by the people",
        "Rule by the rich",
        "Rule by one person"
      ],
      correctOption: 1,
      explanation: "Democracy means 'rule by the people', from Greek 'demos' (people) and 'kratos' (rule)."
    }
  ],
  accounting: [
    {
      questionText: "What is the accounting equation?",
      options: [
        "Assets = Liabilities + Equity",
        "Assets = Revenue - Expenses",
        "Profit = Revenue - Costs",
        "Cash = Assets - Liabilities"
      ],
      correctOption: 0,
      explanation: "The fundamental accounting equation is: Assets = Liabilities + Equity"
    }
  ],
  economics: [
    {
      questionText: "What is the law of demand?",
      options: [
        "As price increases, demand increases",
        "As price decreases, demand decreases",
        "As price increases, demand decreases",
        "Price does not affect demand"
      ],
      correctOption: 2,
      explanation: "The law of demand states that as price increases, quantity demanded decreases (inverse relationship)."
    }
  ]
};

export default function AdminSeeder() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const seedSubjects = async () => {
    setLoading(true);
    setProgress("Starting to seed subjects...");
    
    try {
      let totalSubjects = 0;
      
      // Seed subjects by category
      for (const [category, subjects] of Object.entries(SUBJECTS_DATA)) {
        setProgress(`Seeding ${category} subjects...`);
        
        for (const subject of subjects) {
          await setDoc(doc(db, "subjects", subject.id), {
            id: subject.id,
            name: subject.name,
            color: subject.color,
            category: category, // sciences, arts, commercial, or general
            createdAt: new Date().toISOString(),
          });
          totalSubjects++;
        }
      }
      
      setProgress(`✅ Successfully seeded ${totalSubjects} subjects!`);
      toast.success(`${totalSubjects} subjects added successfully!`);
      
    } catch (error) {
      console.error("Error seeding subjects:", error);
      toast.error("Failed to seed subjects");
      setProgress("❌ Error seeding subjects");
    } finally {
      setLoading(false);
    }
  };

  const seedQuestions = async () => {
    setLoading(true);
    setProgress("Starting to seed questions...");
    
    try {
      let totalQuestions = 0;
      
      for (const [subjectId, questions] of Object.entries(SAMPLE_QUESTIONS)) {
        setProgress(`Seeding questions for ${subjectId}...`);
        
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          await setDoc(doc(db, "questions", `${subjectId}_q${i + 1}`), {
            subject: subjectId,
            questionText: question.questionText,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation,
            createdAt: new Date().toISOString(),
          });
          totalQuestions++;
        }
      }
      
      setProgress(`✅ Successfully seeded ${totalQuestions} questions!`);
      toast.success(`${totalQuestions} questions added successfully!`);
      
    } catch (error) {
      console.error("Error seeding questions:", error);
      toast.error("Failed to seed questions");
      setProgress("❌ Error seeding questions");
    } finally {
      setLoading(false);
    }
  };

  const seedAll = async () => {
    await seedSubjects();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
    await seedQuestions();
  };


    const updateExistingSubjects = async () => {
    setLoading(true);
    setProgress("Fetching existing subjects...");
    
    try {
      const subjectsSnapshot = await getDocs(collection(db, "subjects"));
      
      let updated = 0;
      let skipped = 0;
      
      for (const docSnap of subjectsSnapshot.docs) {
        const subjectId = docSnap.id;
        const subjectData = docSnap.data();
        
        // Skip if already has category
        if (subjectData.category) {
          skipped++;
          continue;
        }
        
        // Auto-assign category based on subject name
        let category: 'sciences' | 'arts' | 'commercial' | 'general' = 'general';
        
        const subjectName = subjectId.toLowerCase();
        
        // Science subjects
        if (['physics', 'chemistry', 'biology', 'mathematics', 'further-mathematics', 'agricultural-science'].includes(subjectName)) {
          category = 'sciences';
        }
        // Arts subjects
        else if (['literature', 'government', 'crs', 'irs', 'history', 'geography', 'civic-education'].includes(subjectName)) {
          category = 'arts';
        }
        // Commercial subjects
        else if (['accounting', 'commerce', 'economics', 'business-studies'].includes(subjectName)) {
          category = 'commercial';
        }
        // General/Core subjects
        else if (['english', 'yoruba', 'igbo', 'hausa', 'french', 'computer-studies'].includes(subjectName)) {
          category = 'general';
        }
        
        // Update the document
        await updateDoc(doc(db, "subjects", subjectId), {
          category: category
        });
        
        updated++;
        setProgress(`Updated ${updated} subjects (${category})...`);
      }
      
      setProgress(`✅ Updated ${updated} subjects! Skipped ${skipped} (already had categories).`);
      toast.success(`${updated} subjects updated with categories!`);
      
    } catch (error) {
      console.error("Error updating subjects:", error);
      toast.error("Failed to update subjects");
      setProgress("❌ Error updating subjects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Database Seeder</h1>
            <p className="text-slate-500">Populate your Firebase with subjects and sample questions</p>
          </div>

          {/* Subject Categories Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Beaker className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="font-bold text-slate-900">{SUBJECTS_DATA.sciences.length}</p>
              <p className="text-xs text-slate-600">Science Subjects</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <Palette className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="font-bold text-slate-900">{SUBJECTS_DATA.arts.length}</p>
              <p className="text-xs text-slate-600">Arts Subjects</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <Calculator className="mx-auto text-green-600 mb-2" size={24} />
              <p className="font-bold text-slate-900">{SUBJECTS_DATA.commercial.length}</p>
              <p className="text-xs text-slate-600">Commercial</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <Globe className="mx-auto text-slate-600 mb-2" size={24} />
              <p className="font-bold text-slate-900">{SUBJECTS_DATA.general.length}</p>
              <p className="text-xs text-slate-600">General/Core</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={seedSubjects}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Seed Subjects Only ({Object.values(SUBJECTS_DATA).flat().length} subjects)
                </>
              )}
            </button>

            <button
              onClick={seedQuestions}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Seed Sample Questions ({Object.values(SAMPLE_QUESTIONS).flat().length} questions)
                </>
              )}
            </button>

            <button
              onClick={seedAll}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Seed Everything (Subjects + Questions)
                </>
              )}
            </button>
          </div>

          {/* Progress Display */}
          {progress && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-700 text-center">{progress}</p>
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>This will add subjects with proper categorization (sciences, arts, commercial, general)</li>
                <li>Sample questions are provided for testing purposes</li>
                <li>Existing documents with the same IDs will be overwritten</li>
                <li>You can run this multiple times safely</li>
              </ul>
            </div>
          </div>

          {/* Subject List Preview */}
          <div className="mt-8">
            <h3 className="font-bold text-slate-900 mb-4">Subjects to be seeded:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(SUBJECTS_DATA).map(([category, subjects]) => (
                <div key={category} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-700 mb-2 capitalize flex items-center gap-2">
                    {category === 'sciences' && <Beaker size={16} className="text-blue-600" />}
                    {category === 'arts' && <Palette size={16} className="text-purple-600" />}
                    {category === 'commercial' && <Calculator size={16} className="text-green-600" />}
                    {category === 'general' && <Globe size={16} className="text-slate-600" />}
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {subjects.map((subject) => (
                      <span
                        key={subject.id}
                        className={`text-[10px] px-2 py-1 rounded-full ${subject.color}`}
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}