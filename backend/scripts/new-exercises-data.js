// Nouveaux exercices pour le niveau 68c973738b6e19e85d67e35a
const newExercises = [
  {
    translations: {
      fr: {
        name: "Variables et Types de Données",
        question: "Créez des variables pour stocker différents types de données en JavaScript",
        explanation: "Créez trois variables : une chaîne de caractères, un nombre et un booléen. Affichez leurs valeurs avec console.log()"
      },
      en: {
        name: "Variables and Data Types",
        question: "Create variables to store different data types in JavaScript",
        explanation: "Create three variables: a string, a number, and a boolean. Display their values with console.log()"
      },
      ar: {
        name: "المتغيرات وأنواع البيانات",
        question: "أنشئ متغيرات لتخزين أنواع مختلفة من البيانات في JavaScript",
        explanation: "أنشئ ثلاثة متغيرات: نص، رقم، وقيمة منطقية. اعرض قيمها باستخدام console.log()"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 10,
    language: "javascript",
    testCases: [
      {
        input: "",
        expected: "string, number, boolean",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez let ou const pour déclarer les variables, Utilisez console.log() pour afficher les valeurs",
    solutions: [`let nom = "JavaScript";
let age = 25;
let isActive = true;

console.log(nom, age, isActive);`]
  },
  {
    translations: {
      fr: {
        name: "Fonction de Calcul",
        question: "Créez une fonction qui calcule la somme de deux nombres",
        explanation: "Écrivez une fonction appelée 'somme' qui prend deux paramètres et retourne leur somme"
      },
      en: {
        name: "Calculation Function",
        question: "Create a function that calculates the sum of two numbers",
        explanation: "Write a function called 'sum' that takes two parameters and returns their sum"
      },
      ar: {
        name: "دالة الحساب",
        question: "أنشئ دالة تحسب مجموع رقمين",
        explanation: "اكتب دالة تسمى 'sum' تأخذ معاملين وتعيد مجموعهما"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 15,
    language: "javascript",
    testCases: [
      {
        input: "somme(5, 10)",
        expected: "15",
        points: 1,
        public: true
      },
      {
        input: "somme(3, 7)",
        expected: "10",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez le mot-clé 'function' pour créer une fonction, Utilisez 'return' pour retourner le résultat",
    solutions: [`function somme(a, b) {
  return a + b;
}

console.log(somme(5, 10));`]
  },
  {
    translations: {
      fr: {
        name: "Boucle et Tableau",
        question: "Parcourez un tableau et affichez chaque élément",
        explanation: "Créez un tableau de fruits et utilisez une boucle for pour afficher chaque fruit"
      },
      en: {
        name: "Loop and Array",
        question: "Iterate through an array and display each element",
        explanation: "Create an array of fruits and use a for loop to display each fruit"
      },
      ar: {
        name: "الحلقة والمصفوفة",
        question: "تكرر عبر مصفوفة وتعرض كل عنصر",
        explanation: "أنشئ مصفوفة من الفواكه واستخدم حلقة for لعرض كل فاكهة"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 20,
    language: "javascript",
    testCases: [
      {
        input: "",
        expected: "pomme\nbanane\norange",
        points: 1,
        public: true
      }
    ],
    hint: "Créez un tableau avec des fruits, Utilisez une boucle for pour parcourir le tableau, Utilisez console.log() pour afficher chaque élément",
    solutions: [`let fruits = ["pomme", "banane", "orange"];

for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}`]
  },
  {
    translations: {
      fr: {
        name: "Conditions et Logique",
        question: "Créez une fonction qui vérifie si un nombre est pair ou impair",
        explanation: "Écrivez une fonction qui prend un nombre en paramètre et retourne 'pair' ou 'impair'"
      },
      en: {
        name: "Conditions and Logic",
        question: "Create a function that checks if a number is even or odd",
        explanation: "Write a function that takes a number as parameter and returns 'even' or 'odd'"
      },
      ar: {
        name: "الشروط والمنطق",
        question: "أنشئ دالة تتحقق من كون الرقم زوجي أو فردي",
        explanation: "اكتب دالة تأخذ رقماً كمعامل وتعيد 'زوجي' أو 'فردي'"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 15,
    language: "javascript",
    testCases: [
      {
        input: "verifierParite(4)",
        expected: "pair",
        points: 1,
        public: true
      },
      {
        input: "verifierParite(7)",
        expected: "impair",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez l'opérateur modulo (%) pour vérifier le reste de la division, Utilisez if/else pour les conditions",
    solutions: [`function verifierParite(nombre) {
  if (nombre % 2 === 0) {
    return "pair";
  } else {
    return "impair";
  }
}

console.log(verifierParite(4));`]
  },
  {
    translations: {
      fr: {
        name: "Objet et Propriétés",
        question: "Créez un objet représentant une personne avec ses propriétés",
        explanation: "Créez un objet 'personne' avec les propriétés nom, âge et ville, puis affichez ces informations"
      },
      en: {
        name: "Object and Properties",
        question: "Create an object representing a person with their properties",
        explanation: "Create a 'person' object with name, age and city properties, then display this information"
      },
      ar: {
        name: "الكائن والخصائص",
        question: "أنشئ كائناً يمثل شخصاً بخصائصه",
        explanation: "أنشئ كائن 'person' بخصائص الاسم والعمر والمدينة، ثم اعرض هذه المعلومات"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 20,
    language: "javascript",
    testCases: [
      {
        input: "",
        expected: "Nom: Alice, Âge: 30, Ville: Paris",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez les accolades {} pour créer un objet, Utilisez la notation point pour accéder aux propriétés",
    solutions: [`let personne = {
  nom: "Alice",
  age: 30,
  ville: "Paris"
};

console.log("Nom:", personne.nom, "Âge:", personne.age, "Ville:", personne.ville);`]
  },
  {
    translations: {
      fr: {
        name: "Méthodes de Tableau",
        question: "Utilisez les méthodes push, pop et length sur un tableau",
        explanation: "Créez un tableau vide, ajoutez des éléments avec push, puis affichez la longueur"
      },
      en: {
        name: "Array Methods",
        question: "Use push, pop and length methods on an array",
        explanation: "Create an empty array, add elements with push, then display the length"
      },
      ar: {
        name: "طرق المصفوفة",
        question: "استخدم طرق push و pop و length على مصفوفة",
        explanation: "أنشئ مصفوفة فارغة، أضف عناصر بـ push، ثم اعرض الطول"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 25,
    language: "javascript",
    testCases: [
      {
        input: "",
        expected: "3",
        points: 1,
        public: true
      }
    ],
    hint: "Créez un tableau vide avec [], Utilisez push() pour ajouter des éléments, Utilisez length pour obtenir la taille",
    solutions: [`let tableau = [];
tableau.push("premier");
tableau.push("deuxième");
tableau.push("troisième");

console.log(tableau.length);`]
  },
  {
    translations: {
      fr: {
        name: "Fonction Fléchée",
        question: "Créez une fonction fléchée qui calcule le carré d'un nombre",
        explanation: "Utilisez la syntaxe des fonctions fléchées pour créer une fonction qui calcule le carré"
      },
      en: {
        name: "Arrow Function",
        question: "Create an arrow function that calculates the square of a number",
        explanation: "Use arrow function syntax to create a function that calculates the square"
      },
      ar: {
        name: "الدالة السهمية",
        question: "أنشئ دالة سهمية تحسب مربع رقم",
        explanation: "استخدم صيغة الدالة السهمية لإنشاء دالة تحسب المربع"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 15,
    language: "javascript",
    testCases: [
      {
        input: "carre(5)",
        expected: "25",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez la syntaxe () => {} pour les fonctions fléchées, Retournez le résultat avec return",
    solutions: [`const carre = (x) => {
  return x * x;
};

console.log(carre(5));`]
  },
  {
    translations: {
      fr: {
        name: "Template Literals",
        question: "Utilisez les template literals pour créer une phrase dynamique",
        explanation: "Créez une phrase qui utilise des variables avec les template literals (backticks)"
      },
      en: {
        name: "Template Literals",
        question: "Use template literals to create a dynamic sentence",
        explanation: "Create a sentence that uses variables with template literals (backticks)"
      },
      ar: {
        name: "القوالب الحرفية",
        question: "استخدم القوالب الحرفية لإنشاء جملة ديناميكية",
        explanation: "أنشئ جملة تستخدم متغيرات مع القوالب الحرفية (الخط المائل العكسي)"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 10,
    language: "javascript",
    testCases: [
      {
        input: "",
        expected: "Bonjour, je m'appelle Jean et j'ai 25 ans",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez les backticks (`) au lieu des guillemets, Utilisez ${} pour insérer des variables",
    solutions: [`let nom = "Jean";
let age = 25;

console.log(\`Bonjour, je m'appelle \${nom} et j'ai \${age} ans\`);`]
  },
  {
    translations: {
      fr: {
        name: "Destructuring",
        question: "Utilisez la destructuration pour extraire des valeurs d'un objet",
        explanation: "Créez un objet avec plusieurs propriétés et utilisez la destructuration pour les extraire"
      },
      en: {
        name: "Destructuring",
        question: "Use destructuring to extract values from an object",
        explanation: "Create an object with multiple properties and use destructuring to extract them"
      },
      ar: {
        name: "التفكيك",
        question: "استخدم التفكيك لاستخراج قيم من كائن",
        explanation: "أنشئ كائناً بخصائص متعددة واستخدم التفكيك لاستخراجها"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 20,
    language: "javascript",
    testCases: [
      {
        input: "",
        expected: "Marque: Toyota, Modèle: Corolla",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez const { propriete1, propriete2 } = objet, Accédez directement aux propriétés extraites",
    solutions: [`let voiture = {
  marque: "Toyota",
  modele: "Corolla",
  annee: 2020
};

const { marque, modele } = voiture;
console.log("Marque:", marque, "Modèle:", modele);`]
  },
  {
    translations: {
      fr: {
        name: "Fonction avec Paramètres par Défaut",
        question: "Créez une fonction avec des paramètres par défaut",
        explanation: "Créez une fonction qui salue une personne avec un message par défaut"
      },
      en: {
        name: "Function with Default Parameters",
        question: "Create a function with default parameters",
        explanation: "Create a function that greets a person with a default message"
      },
      ar: {
        name: "دالة بمعاملات افتراضية",
        question: "أنشئ دالة بمعاملات افتراضية",
        explanation: "أنشئ دالة تحيي شخصاً برسالة افتراضية"
      }
    },
    type: "Code",
    difficulty: "easy",
    points: 15,
    language: "javascript",
    testCases: [
      {
        input: "saluer('Alice')",
        expected: "Bonjour, Alice! Comment allez-vous?",
        points: 1,
        public: true
      }
    ],
    hint: "Utilisez = 'valeur' dans les paramètres pour définir des valeurs par défaut, Appelez la fonction avec un seul paramètre",
    solutions: [`function saluer(nom, message = "Comment allez-vous?") {
  console.log(\`Bonjour, \${nom}! \${message}\`);
}

saluer("Alice");`]
  }
];

module.exports = newExercises;









