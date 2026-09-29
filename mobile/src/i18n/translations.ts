export type Language = 'en' | 'ar';

export type TranslationKeys = typeof en;

const en = {
  // === AUTH - LOGIN ===
  login: {
    appName: 'AgriSmart',
    welcomeBack: 'Welcome back',
    subtitle: 'Sign in to manage your farm telemetry, soil matrices & harvests.',
    emailLabel: 'EMAIL ADDRESS',
    emailPlaceholder: 'name@agrifarm.ma',
    passwordLabel: 'PASSWORD',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordMsg: 'Please contact your farm administrator.',
    touchIdReady: 'Touch ID ready',
    touchIdSub: 'Instant field login',
    useSensor: 'Use Sensor',
    touchIdTitle: 'Touch ID',
    touchIdMsg: 'Sensor scan initialized',
    signIn: 'Sign in',
    createAccount: 'Create account',
    securityTitle: 'Protected by AgriSmart SecureFarm™',
    securitySub: 'Encrypted offline sync & multi-node agronomic integrity.',
    errorTitle: 'Error',
    errorFields: 'Please fill in all fields',
    loginFailed: 'Login Failed',
    somethingWrong: 'Something went wrong',
  },

  // === AUTH - REGISTER ===
  register: {
    title: 'Create Account',
    subtitle: 'Join the smart farming community',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password (min. 6 characters)',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    errorTitle: 'Error',
    errorFields: 'Please fill in all fields',
    registerFailed: 'Registration Failed',
    somethingWrong: 'Something went wrong',
  },

  // === HOME ===
  home: {
    greeting: 'Hello',
    subtitle: "Here's your farm overview",
    activeCrops: 'Active Crops',
    pendingTasks: 'Pending Tasks',
    quickActions: 'Quick Actions',
    scanPlant: 'Scan Plant',
    aiAssistant: 'AI Assistant',
    myCrops: 'My Crops',
    upcomingTasks: 'Upcoming Tasks',
    noDueDate: 'No due date',
  },

  // === COMMON ===
  common: {
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    switchLang: 'AR',
  },
};

const ar: TranslationKeys = {
  // === AUTH - LOGIN ===
  login: {
    appName: 'أجريسمارت',
    welcomeBack: 'مرحباً بعودتك',
    subtitle: 'سجّل دخولك لإدارة بيانات مزرعتك والتربة والحصاد.',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@agrifarm.ma',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    forgotPasswordTitle: 'نسيت كلمة المرور',
    forgotPasswordMsg: 'يرجى التواصل مع مدير المزرعة.',
    touchIdReady: 'بصمة الإصبع جاهزة',
    touchIdSub: 'تسجيل دخول فوري',
    useSensor: 'استخدم المستشعر',
    touchIdTitle: 'بصمة الإصبع',
    touchIdMsg: 'تم تهيئة المستشعر',
    signIn: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب',
    securityTitle: 'محمي بواسطة AgriSmart SecureFarm™',
    securitySub: 'مزامنة مشفرة دون اتصال وتكامل زراعي متعدد العقد.',
    errorTitle: 'خطأ',
    errorFields: 'يرجى ملء جميع الحقول',
    loginFailed: 'فشل تسجيل الدخول',
    somethingWrong: 'حدث خطأ ما',
  },

  // === AUTH - REGISTER ===
  register: {
    title: 'إنشاء حساب',
    subtitle: 'انضم إلى مجتمع الزراعة الذكية',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور (6 أحرف على الأقل)',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    errorTitle: 'خطأ',
    errorFields: 'يرجى ملء جميع الحقول',
    registerFailed: 'فشل إنشاء الحساب',
    somethingWrong: 'حدث خطأ ما',
  },

  // === HOME ===
  home: {
    greeting: 'مرحباً',
    subtitle: 'إليك نظرة عامة على مزرعتك',
    activeCrops: 'المحاصيل النشطة',
    pendingTasks: 'المهام المعلقة',
    quickActions: 'إجراءات سريعة',
    scanPlant: 'مسح النبات',
    aiAssistant: 'مساعد ذكي',
    myCrops: 'محاصيلي',
    upcomingTasks: 'المهام القادمة',
    noDueDate: 'لا يوجد موعد',
  },

  // === COMMON ===
  common: {
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    switchLang: 'EN',
  },
};

export const translations: Record<Language, TranslationKeys> = { en, ar };
