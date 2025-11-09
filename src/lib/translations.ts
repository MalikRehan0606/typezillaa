
import type { Language } from '@/types';

type PageTranslations = {
  // Common
  loading: string;
  error: string;

  // Header/Global
  leaderboard: string;
  logout: string;
  login: string;
  signUp: string;
  startTyping: string;
  changeLevel: string;
  
  // Home page
  homeTitle: string;
  homeSubtitle: string;
  homeChooseChallenge: string;
  homeViewLeaderboard: string;
  
  // Levels page
  chooseYourChallenge: string;
  chooseYourChallengeDescription: string;
  levelSimple: string;
  levelSimpleDescription: string;
  levelIntermediate: string;
  levelIntermediateDescription:string;
  levelExpert: string;
  levelExpertDescription: string;
  wordCount: string;
  words: string;
  startChallenge: (level: string) => string;

  // Typing Test page
  challengeTitle: (level: string) => string;
  resetTest: string;
  time: string;
  timeLeft: string;
  wpm: string;
  accuracy: string;
  testComplete: string;
  calculatingResults: string;
  loadingChallenge: string;
  // Score submission dialog
  saveScorePromptTitle: string;
  saveScorePromptDescription: (wpm: number) => string;
  save: string;
  dontSave: string;
  scoreSaved: string;
  scoreSavedDescription: string;
  // Signup prompt
  signupPromptTitle: string;
  signupPromptDescription: string;
  noThanks: string;

  // Results page
  resultsTestType: string;
  resultsRaw: string;
  resultsCharacters: string;
  resultsConsistency: string;
  tryAgain: string;
  testIncomplete: string;
  scoreNotSaved: string;
  saveToLeaderboard: string;

  // Leaderboard page
  backToHome: string;
  leaderboardTitle: string;
  leaderboardDescription: string;
  rank: string;
  name: string;
  level: string;
  language: string;
  date: string;
  leaderboardTop50: string;
  noScores: string;
  leaderboardAllTime: string;
  leaderboardWeekly: string;
  leaderboardDaily: string;
  leaderboardAllTimeTitle: string;
  leaderboardWeeklyTitle: string;
  leaderboardDailyTitle: string;
  leaderboardTop100AllTime: string;
  nextResetIn: string;

  // About page
  aboutCreatedBy: string;
  aboutLaunchedOn: string;
  aboutWpmDistribution: string;
  aboutWpmDistributionDescription: string;
  aboutTotalTestsStarted: string;
  aboutTotalTestsStartedDescription: string;
  aboutTotalTimeTyping: string;
  aboutTotalTimeTypingDescription: string;
  aboutTotalTestsCompleted: string;
  aboutTotalTestsCompletedDescription: string;
  
  // Settings Dialog
  settingsTitle: string;
  settingsDescription: string;
  correctCharColor: string;
  colorDefault: string;
  colorPurple: string;
  colorBlue: string;
  colorIncognito: string;
  difficultyMode: string;
  difficultyDefault: string;
  difficultyPro: string;
  difficultyGod: string;
  selectLanguage: string;
  language: string;
  languageEnglish: string;
  languageSpanish: string;
  languageGerman: string;
  languageFrench: string;
  languageChanged: string;
  languageChangedDescription: string;

  // Typing Tip
  proTip: string;

  // Login Page
  loginTitle: string;
  loginDescription: string;
  loginEmailLabel: string;
  loginPasswordLabel: string;
  loginForgotPasswordLink: string;
  loginButton: string;
  loginDontHaveAccount: string;
  loginSignUpLink: string;
  loginSuccess: string;
  loginSuccessDescription: string;
  loginVerificationRequired: string;
  loginVerificationRequiredDescription: string;
  loginFailed: string;
  loginFailedInvalid: string;

  // Signup Page
  signUpTitle: string;
  signUpDescription: string;
  signUpNameLabel: string;
  signUpButton: string;
  signUpAlreadyHaveAccount: string;
  signUpLoginLink: string;
  signUpInvalidName: string;
  signUpInvalidNameDescription: string;
  signUpSuccess: string;
  signUpSuccessDescription: string;
  signUpFailed: string;

  // Forgot Password Page
  forgotPasswordTitle: string;
  forgotPasswordDescription: string;
  forgotPasswordSendLink: string;
  forgotPasswordBackToLogin: string;
  forgotPasswordRateLimit: string;
  forgotPasswordRateLimitTitle: string;
  forgotPasswordCheckEmail: string;
  forgotPasswordCheckEmailDescription: string;
  forgotPasswordOffline: string;
  forgotPasswordOfflineTitle: string;

  // Verify Email Page
  verifyEmailTitle: string;
  verifyEmailDescription: (email: string) => string;
  verifyEmailInstructions: string;
  verifyEmailResendButton: string;
  verifyEmailAfterwards: string;
  verifyEmailLoginLink: string;
  verifyEmailSent: string;
  verifyEmailSentDescription: string;
  verifyEmailFailed: string;
  verifyEmailFailedDescription: string;
};

export const translations: Record<Language, PageTranslations> = {
  en: {
    loading: 'Loading',
    error: 'Error',
    leaderboard: 'Leaderboard',
    logout: 'Logout',
    login: 'Login',
    signUp: 'Sign Up',
    startTyping: 'Start Typing',
    changeLevel: 'Change Level',
    homeTitle: 'Unlock Your True Typing Potential',
    homeSubtitle: 'Experience realistic typing tests, get AI-powered feedback, and track your progress to become a faster, more accurate typist.',
    homeChooseChallenge: 'Choose Your Challenge',
    homeViewLeaderboard: 'View Leaderboard',
    chooseYourChallenge: 'Choose Your Challenge',
    chooseYourChallengeDescription: 'Select a language and difficulty that suits you, and start improving your skills!',
    levelSimple: 'Simple',
    levelSimpleDescription: 'Perfect for beginners. Random lowercase words, no time limit.',
    levelIntermediate: 'Intermediate',
    levelIntermediateDescription: 'Select a word count and practice with a sequence of random words.',
    levelExpert: 'Expert',
    levelExpertDescription: 'A tougher word challenge. Select the number of words to type.',
    wordCount: 'Word count',
    words: 'words',
    startChallenge: (level: string) => `Start ${level}`,
    challengeTitle: (level: string) => `Typing Challenge (${level.charAt(0).toUpperCase() + level.slice(1)})`,
    resetTest: 'Reset Test',
    time: 'Time',
    timeLeft: 'Time Left',
    wpm: 'WPM',
    accuracy: 'Accuracy',
    testComplete: 'Test Complete!',
    calculatingResults: 'Calculating your results',
    loadingChallenge: 'Loading Challenge',
    saveScorePromptTitle: 'Save Score?',
    saveScorePromptDescription: (wpm: number) => `Your score was ${wpm} WPM. Submit this score to the leaderboard?`,
    save: 'Submit Score',
    dontSave: "Don't Submit",
    scoreSaved: "You're on the Board!",
    scoreSavedDescription: "Your score has been posted to the live leaderboard. See how you stack up!",
    signupPromptTitle: 'Save Your Score to the Leaderboard?',
    signupPromptDescription: 'Create a free account to save your results, track your progress, and see your name on the global leaderboard.',
    noThanks: 'No, thanks',
    resultsTestType: 'test type',
    resultsRaw: 'raw',
    resultsCharacters: 'characters',
    resultsConsistency: 'consistency',
    tryAgain: 'Try Again',
    testIncomplete: 'Test Incomplete',
    scoreNotSaved: 'Score not saved.',
    saveToLeaderboard: 'Save to Leaderboard',
    backToHome: 'Back to Home',
    leaderboardTitle: 'Global Leaderboard',
    leaderboardDescription: 'Top 10 scores for each level from the last 5 minutes. See how you stack up!',
    rank: 'Rank',
    name: 'Name',
    level: 'Level',
    language: 'Language',
    date: 'Date',
    leaderboardTop50: 'Top 10 scores for each level are shown. Good luck!',
    noScores: 'No scores recorded yet for this period.',
    leaderboardAllTime: 'All-time',
    leaderboardWeekly: 'Weekly',
    leaderboardDaily: 'Daily',
    leaderboardAllTimeTitle: 'All-Time Leaderboard',
    leaderboardWeeklyTitle: 'Weekly Leaderboard',
    leaderboardDailyTitle: 'Daily Leaderboard',
    leaderboardTop100AllTime: 'Top 100 unique players by their best score.',
    nextResetIn: 'Next reset in',
    aboutCreatedBy: 'Created with love by MALIK REHAN.',
    aboutLaunchedOn: 'Launched on 20th of June, 2025.',
    aboutWpmDistribution: 'WPM Distribution',
    aboutWpmDistributionDescription: 'WPM distribution from all players on the leaderboard.',
    aboutTotalTestsStarted: 'Total Tests Started',
    aboutTotalTestsStartedDescription: 'Global count from all players',
    aboutTotalTimeTyping: 'Total Time Typing',
    aboutTotalTimeTypingDescription: 'Cumulative time all users have spent in active tests.',
    aboutTotalTestsCompleted: 'Total Tests Completed',
    aboutTotalTestsCompletedDescription: 'Total sessions finished by all players',
    settingsTitle: 'Settings',
    settingsDescription: 'Customize your typing experience. Changes will apply to your next test.',
    correctCharColor: 'Correct Character Color',
    colorDefault: 'Default (Green)',
    colorPurple: 'Neon Purple',
    colorBlue: 'Blue',
    colorIncognito: 'Incognito',
    difficultyMode: 'Difficulty Mode',
    difficultyDefault: 'Default (no mistake limit)',
    difficultyPro: 'Pro (5 mistakes max)',
    difficultyGod: 'God (1 mistake max)',
    selectLanguage: 'Select Language',
    language: 'Language',
    languageEnglish: 'English',
    languageSpanish: 'Español (Spanish)',
    languageGerman: 'Deutsch (German)',
    languageFrench: 'Français (French)',
    languageChanged: 'Language Updated!',
    languageChangedDescription: 'The application language has been changed.',
    proTip: 'Pro Tip',
    loginTitle: 'Login',
    loginDescription: 'Enter your email below to login to your account',
    loginEmailLabel: 'Email',
    loginPasswordLabel: 'Password',
    loginForgotPasswordLink: 'Forgot your password?',
    loginButton: 'Login',
    loginDontHaveAccount: 'Don\'t have an account?',
    loginSignUpLink: 'Sign up',
    loginSuccess: 'Success',
    loginSuccessDescription: 'Logged in successfully!',
    loginVerificationRequired: 'Verification Required',
    loginVerificationRequiredDescription: 'A new verification link has been sent to your email. Please verify your account to continue.',
    loginFailed: 'Login Failed',
    loginFailedInvalid: "Invalid email or password. Please check your credentials and try again.",
    signUpTitle: 'Sign Up',
    signUpDescription: 'Enter your information to create an account',
    signUpNameLabel: 'Name',
    signUpButton: 'Create an account',
    signUpAlreadyHaveAccount: 'Already have an account?',
    signUpLoginLink: 'Login',
    signUpInvalidName: 'Invalid Name',
    signUpInvalidNameDescription: 'Name must be at least 3 characters long.',
    signUpSuccess: 'Account Created',
    signUpSuccessDescription: 'A verification link has been sent to your email. Please verify your account to continue.',
    signUpFailed: 'Signup Failed',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordDescription: 'Enter your email and we\'ll send you a link to reset your password.',
    forgotPasswordSendLink: 'Send Reset Link',
    forgotPasswordBackToLogin: 'Back to Login',
    forgotPasswordRateLimit: "You have requested a password reset too many times. Please try again in 24 hours.",
    forgotPasswordRateLimitTitle: "Rate Limit Exceeded",
    forgotPasswordCheckEmail: 'Check Your Email',
    forgotPasswordCheckEmailDescription: "If an account exists for that email, you'll receive a password reset link.",
    forgotPasswordOffline: "You appear to be offline. Please check your internet connection.",
    forgotPasswordOfflineTitle: "Offline",
    verifyEmailTitle: 'Verify Your Email',
    verifyEmailDescription: (email: string) => `We've sent a verification link to <strong>${email}</strong>.`,
    verifyEmailInstructions: 'Please check your inbox (and spam folder!) and click the link to activate your account.',
    verifyEmailResendButton: 'Resend Verification Email',
    verifyEmailAfterwards: 'After verifying, you can',
    verifyEmailLoginLink: 'log in',
    verifyEmailSent: 'Email Sent',
    verifyEmailSentDescription: 'A new verification link has been sent to your email address.',
    verifyEmailFailed: 'Error',
    verifyEmailFailedDescription: 'Failed to send verification email. Please try again later.',
  },
  es: {
    loading: 'Cargando',
    error: 'Error',
    leaderboard: 'Clasificación',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    signUp: 'Registrarse',
    startTyping: 'Empezar a Escribir',
    changeLevel: 'Cambiar Nivel',
    homeTitle: 'Desbloquea Tu Verdadero Potencial de Escritura',
    homeSubtitle: 'Experimenta pruebas de escritura realistas, obtén retroalimentación impulsada por IA y sigue tu progreso para convertirte en un mecanógrafo más rápido y preciso.',
    homeChooseChallenge: 'Elige Tu Desafío',
    homeViewLeaderboard: 'Ver Clasificación',
    chooseYourChallenge: 'Elige Tu Desafío',
    chooseYourChallengeDescription: '¡Selecciona un idioma y una dificultad que te convenga y comienza a mejorar tus habilidades!',
    levelSimple: 'Simple',
    levelSimpleDescription: 'Perfecto para principiantes. Palabras aleatorias en minúsculas, sin límite de tiempo.',
    levelIntermediate: 'Intermedio',
    levelIntermediateDescription: 'Selecciona una cantidad de palabras y practica con una secuencia de palabras aleatorias.',
    levelExpert: 'Experto',
    levelExpertDescription: 'Un desafío de palabras más difícil. Selecciona el número de palabras a escribir.',
    wordCount: 'Cantidad de palabras',
    words: 'palabras',
    startChallenge: (level: string) => `Empezar ${level}`,
    challengeTitle: (level: string) => `Desafío de Escritura (${level.charAt(0).toUpperCase() + level.slice(1)})`,
    resetTest: 'Reiniciar Prueba',
    time: 'Tiempo',
    timeLeft: 'Tiempo Restante',
    wpm: 'PPM',
    accuracy: 'Precisión',
    testComplete: '¡Prueba Completada!',
    calculatingResults: 'Calculando tus resultados',
    loadingChallenge: 'Cargando Desafío',
    saveScorePromptTitle: '¿Guardar Puntuación?',
    saveScorePromptDescription: (wpm: number) => `Tu puntuación fue de ${wpm} PPM. ¿Enviar esta puntuación a la clasificación?`,
    save: 'Enviar Puntuación',
    dontSave: 'No Enviar',
    scoreSaved: '¡Estás en la Clasificación!',
    scoreSavedDescription: 'Tu puntuación ha sido publicada en la clasificación en vivo. ¡Mira tu posición!',
    signupPromptTitle: '¿Guardar tu Puntuación en la Clasificación?',
    signupPromptDescription: 'Crea una cuenta gratuita para guardar tus resultados, seguir tu progreso y ver tu nombre en la clasificación global.',
    noThanks: 'No, gracias',
    resultsTestType: 'tipo de prueba',
    resultsRaw: 'bruto',
    resultsCharacters: 'caracteres',
    resultsConsistency: 'consistencia',
    tryAgain: 'Intentar de Nuevo',
    testIncomplete: 'Prueba Incompleta',
    scoreNotSaved: 'Puntuación no guardada.',
    saveToLeaderboard: 'Guardar en Clasificación',
    backToHome: 'Volver al Inicio',
    leaderboardTitle: 'Clasificación Global',
    leaderboardDescription: 'Mejores 10 puntuaciones para cada nivel de los últimos 5 minutos. ¡Mira cómo te comparas!',
    rank: 'Rango',
    name: 'Nombre',
    level: 'Nivel',
    language: 'Idioma',
    date: 'Fecha',
    leaderboardTop50: 'Se muestran las 10 mejores puntuaciones de cada nivel. ¡Buena suerte!',
    noScores: 'No hay puntuaciones registradas para este período.',
    leaderboardAllTime: 'Histórico',
    leaderboardWeekly: 'Semanal',
    leaderboardDaily: 'Diario',
    leaderboardAllTimeTitle: 'Clasificación Histórica',
    leaderboardWeeklyTitle: 'Clasificación Semanal',
    leaderboardDailyTitle: 'Clasificación Diaria',
    leaderboardTop100AllTime: 'Los 100 mejores jugadores únicos por su mejor puntuación.',
    nextResetIn: 'Próximo reinicio en',
    aboutCreatedBy: 'Creado con amor por MALIK REHAN.',
    aboutLaunchedOn: 'Lanzado el 20 de junio de 2025.',
    aboutWpmDistribution: 'Distribución de PPM',
    aboutWpmDistributionDescription: 'Distribución de PPM de todos los jugadores en la clasificación.',
    aboutTotalTestsStarted: 'Total de Pruebas Iniciadas',
    aboutTotalTestsStartedDescription: 'Conteo global de todos los jugadores',
    aboutTotalTimeTyping: 'Tiempo Total de Escritura',
    aboutTotalTimeTypingDescription: 'Tiempo acumulado que todos los usuarios han pasado en pruebas activas.',
    aboutTotalTestsCompleted: 'Total de Pruebas Completadas',
    aboutTotalTestsCompletedDescription: 'Total de sesiones terminadas por todos los jugadores',
    settingsTitle: 'Configuración',
    settingsDescription: 'Personaliza tu experiencia de escritura. Los cambios se aplicarán en tu próxima prueba.',
    correctCharColor: 'Color de Caracter Correcto',
    colorDefault: 'Predeterminado (Verde)',
    colorPurple: 'Púrpura Neón',
    colorBlue: 'Azul',
    colorIncognito: 'Incógnito',
    difficultyMode: 'Modo de Dificultad',
    difficultyDefault: 'Predeterminado (sin límite de errores)',
    difficultyPro: 'Pro (5 errores máx.)',
    difficultyGod: 'Dios (1 error máx.)',
    selectLanguage: 'Seleccionar Idioma',
    language: 'Idioma',
    languageEnglish: 'English (Inglés)',
    languageSpanish: 'Español',
    languageGerman: 'Deutsch (Alemán)',
    languageFrench: 'Français (Francés)',
    languageChanged: '¡Idioma Actualizado!',
    languageChangedDescription: 'El idioma de la aplicación ha sido cambiado.',
    proTip: 'Consejo Pro',
    loginTitle: 'Iniciar Sesión',
    loginDescription: 'Introduce tu correo electrónico para acceder a tu cuenta',
    loginEmailLabel: 'Correo Electrónico',
    loginPasswordLabel: 'Contraseña',
    loginForgotPasswordLink: '¿Olvidaste tu contraseña?',
    loginButton: 'Iniciar Sesión',
    loginDontHaveAccount: '¿No tienes una cuenta?',
    loginSignUpLink: 'Regístrate',
    loginSuccess: 'Éxito',
    loginSuccessDescription: '¡Has iniciado sesión correctamente!',
    loginVerificationRequired: 'Verificación Requerida',
    loginVerificationRequiredDescription: 'Se ha enviado un nuevo enlace de verificación a tu correo. Por favor, verifica tu cuenta para continuar.',
    loginFailed: 'Error al Iniciar Sesión',
    loginFailedInvalid: "Correo o contraseña no válidos. Por favor, comprueba tus credenciales e inténtalo de nuevo.",
    signUpTitle: 'Registrarse',
    signUpDescription: 'Introduce tus datos para crear una cuenta',
    signUpNameLabel: 'Nombre',
    signUpButton: 'Crear una cuenta',
    signUpAlreadyHaveAccount: '¿Ya tienes una cuenta?',
    signUpLoginLink: 'Iniciar Sesión',
    signUpInvalidName: 'Nombre no válido',
    signUpInvalidNameDescription: 'El nombre debe tener al menos 3 caracteres.',
    signUpSuccess: 'Cuenta Creada',
    signUpSuccessDescription: 'Se ha enviado un enlace de verificación a tu correo electrónico. Por favor, verifica tu cuenta para continuar.',
    signUpFailed: 'Error en el Registro',
    forgotPasswordTitle: 'Contraseña Olvidada',
    forgotPasswordDescription: 'Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    forgotPasswordSendLink: 'Enviar Enlace de Restablecimiento',
    forgotPasswordBackToLogin: 'Volver a Iniciar Sesión',
    forgotPasswordRateLimit: "Has solicitado un restablecimiento de contraseña demasiadas veces. Por favor, inténtalo de nuevo en 24 horas.",
    forgotPasswordRateLimitTitle: "Límite de Solicitudes Excedido",
    forgotPasswordCheckEmail: 'Revisa Tu Correo Electrónico',
    forgotPasswordCheckEmailDescription: "Si existe una cuenta para ese correo electrónico, recibirás un enlace para restablecer la contraseña.",
    forgotPasswordOffline: "Parece que no tienes conexión. Por favor, comprueba tu conexión a internet.",
    forgotPasswordOfflineTitle: "Sin Conexión",
    verifyEmailTitle: 'Verifica Tu Correo Electrónico',
    verifyEmailDescription: (email: string) => `Hemos enviado un enlace de verificación a <strong>${email}</strong>.`,
    verifyEmailInstructions: 'Por favor, revisa tu bandeja de entrada (¡y la carpeta de spam!) y haz clic en el enlace para activar tu cuenta.',
    verifyEmailResendButton: 'Reenviar Correo de Verificación',
    verifyEmailAfterwards: 'Después de verificar, puedes',
    verifyEmailLoginLink: 'iniciar sesión',
    verifyEmailSent: 'Correo Enviado',
    verifyEmailSentDescription: 'Se ha enviado un nuevo enlace de verificación a tu dirección de correo electrónico.',
    verifyEmailFailed: 'Error',
    verifyEmailFailedDescription: 'No se pudo enviar el correo de verificación. Por favor, inténtalo más tarde.',
  },
  de: {
    loading: 'Lädt',
    error: 'Fehler',
    leaderboard: 'Bestenliste',
    logout: 'Abmelden',
    login: 'Anmelden',
    signUp: 'Registrieren',
    startTyping: 'Tippen starten',
    changeLevel: 'Level ändern',
    homeTitle: 'Entfalte dein wahres Tipp-Potenzial',
    homeSubtitle: 'Erlebe realistische Tipp-Tests, erhalte KI-gestütztes Feedback und verfolge deinen Fortschritt, um ein schnellerer und genauerer Tipper zu werden.',
    homeChooseChallenge: 'Wähle deine Herausforderung',
    homeViewLeaderboard: 'Bestenliste ansehen',
    chooseYourChallenge: 'Wähle Deine Herausforderung',
    chooseYourChallengeDescription: 'Wähle eine Sprache und einen Schwierigkeitsgrad, der zu dir passt, und beginne, deine Fähigkeiten zu verbessern!',
    levelSimple: 'Einfach',
    levelSimpleDescription: 'Perfekt für Anfänger. Zufällige Kleinbuchstabenwörter, kein Zeitlimit.',
    levelIntermediate: 'Mittel',
    levelIntermediateDescription: 'Wähle eine Wortanzahl und übe mit einer Folge von zufälligen Wörtern.',
    levelExpert: 'Experte',
    levelExpertDescription: 'Eine schwierigere Wortherausforderung. Wähle die Anzahl der zu tippenden Wörter.',
    wordCount: 'Wortanzahl',
    words: 'Wörter',
    startChallenge: (level: string) => `${level} starten`,
    challengeTitle: (level: string) => `Tipp-Herausforderung (${level.charAt(0).toUpperCase() + level.slice(1)})`,
    resetTest: 'Test zurücksetzen',
    time: 'Zeit',
    timeLeft: 'Verbleibende Zeit',
    wpm: 'WPM',
    accuracy: 'Genauigkeit',
    testComplete: 'Test abgeschlossen!',
    calculatingResults: 'Deine Ergebnisse werden berechnet',
    loadingChallenge: 'Herausforderung wird geladen',
    saveScorePromptTitle: 'Ergebnis speichern?',
    saveScorePromptDescription: (wpm: number) => `Dein Ergebnis war ${wpm} WPM. Dieses Ergebnis an die Bestenliste senden?`,
    save: 'Ergebnis senden',
    dontSave: 'Nicht senden',
    scoreSaved: 'Du bist auf der Bestenliste!',
    scoreSavedDescription: 'Dein Ergebnis wurde in der Live-Bestenliste veröffentlicht. Schau dir deinen Rang an!',
    signupPromptTitle: 'Dein Ergebnis in der Bestenliste speichern?',
    signupPromptDescription: 'Erstelle ein kostenloses Konto, um deine Ergebnisse zu speichern, deinen Fortschritt zu verfolgen und deinen Namen auf der globalen Bestenliste zu sehen.',
    noThanks: 'Nein, danke',
    resultsTestType: 'Testtyp',
    resultsRaw: 'Roh',
    resultsCharacters: 'Zeichen',
    resultsConsistency: 'Konsistenz',
    tryAgain: 'Erneut versuchen',
    testIncomplete: 'Test unvollständig',
    scoreNotSaved: 'Ergebnis nicht gespeichert.',
    saveToLeaderboard: 'In Bestenliste speichern',
    backToHome: 'Zurück zur Startseite',
    leaderboardTitle: 'Globale Bestenliste',
    leaderboardDescription: 'Top-10-Ergebnisse für jedes Level aus den letzten 5 Minuten. Sieh, wie du dich schlägst!',
    rank: 'Rang',
    name: 'Name',
    level: 'Level',
    language: 'Sprache',
    date: 'Datum',
    leaderboardTop50: 'Die Top-10-Ergebnisse für jedes Level werden angezeigt. Viel Glück!',
    noScores: 'Für diesen Zeitraum wurden noch keine Ergebnisse erfasst.',
    leaderboardAllTime: 'Gesamt',
    leaderboardWeekly: 'Wöchentlich',
    leaderboardDaily: 'Täglich',
    leaderboardAllTimeTitle: 'Gesamt-Bestenliste',
    leaderboardWeeklyTitle: 'Wöchentliche Bestenliste',
    leaderboardDailyTitle: 'Tägliche Bestenliste',
    leaderboardTop100AllTime: 'Die 100 besten Einzelspieler nach ihrer besten Punktzahl.',
    nextResetIn: 'Nächster Reset in',
    aboutCreatedBy: 'Mit Liebe von MALIK REHAN erstellt.',
    aboutLaunchedOn: 'Gestartet am 20. Juni 2025.',
    aboutWpmDistribution: 'WPM-Verteilung',
    aboutWpmDistributionDescription: 'WPM-Verteilung aller Spieler auf der Bestenliste.',
    aboutTotalTestsStarted: 'Gesamtzahl der gestarteten Tests',
    aboutTotalTestsStartedDescription: 'Globale Zählung aller Spieler',
    aboutTotalTimeTyping: 'Gesamte Tippzeit',
    aboutTotalTimeTypingDescription: 'Kumulative Zeit, die alle Benutzer in aktiven Tests verbracht haben.',
    aboutTotalTestsCompleted: 'Gesamtzahl der abgeschlossenen Tests',
    aboutTotalTestsCompletedDescription: 'Gesamtzahl der von allen Spielern beendeten Sitzungen',
    settingsTitle: 'Einstellungen',
    settingsDescription: 'Passe dein Tipperlebnis an. Änderungen gelten für deinen nächsten Test.',
    correctCharColor: 'Farbe für korrekte Zeichen',
    colorDefault: 'Standard (Grün)',
    colorPurple: 'Neon-Lila',
    colorBlue: 'Blau',
    colorIncognito: 'Inkognito',
    difficultyMode: 'Schwierigkeitsmodus',
    difficultyDefault: 'Standard (kein Fehlerlimit)',
    difficultyPro: 'Profi (max. 5 Fehler)',
    difficultyGod: 'Gott (max. 1 Fehler)',
    selectLanguage: 'Sprache auswählen',
    language: 'Sprache',
    languageEnglish: 'English (Englisch)',
    languageSpanish: 'Español (Spanisch)',
    languageGerman: 'Deutsch',
    languageFrench: 'Français (Französisch)',
    languageChanged: 'Sprache aktualisiert!',
    languageChangedDescription: 'Die Anwendungssprache wurde geändert.',
    proTip: 'Profi-Tipp',
    loginTitle: 'Anmelden',
    loginDescription: 'Gib deine E-Mail-Adresse ein, um dich bei deinem Konto anzumelden',
    loginEmailLabel: 'E-Mail',
    loginPasswordLabel: 'Passwort',
    loginForgotPasswordLink: 'Passwort vergessen?',
    loginButton: 'Anmelden',
    loginDontHaveAccount: 'Du hast noch kein Konto?',
    loginSignUpLink: 'Registrieren',
    loginSuccess: 'Erfolg',
    loginSuccessDescription: 'Erfolgreich angemeldet!',
    loginVerificationRequired: 'Verifizierung erforderlich',
    loginVerificationRequiredDescription: 'Ein neuer Bestätigungslink wurde an deine E-Mail gesendet. Bitte bestätige dein Konto, um fortzufahren.',
    loginFailed: 'Anmeldung fehlgeschlagen',
    loginFailedInvalid: "Ungültige E-Mail oder ungültiges Passwort. Bitte überprüfe deine Anmeldedaten und versuche es erneut.",
    signUpTitle: 'Registrieren',
    signUpDescription: 'Gib deine Informationen ein, um ein Konto zu erstellen',
    signUpNameLabel: 'Name',
    signUpButton: 'Konto erstellen',
    signUpAlreadyHaveAccount: 'Du hast bereits ein Konto?',
    signUpLoginLink: 'Anmelden',
    signUpInvalidName: 'Ungültiger Name',
    signUpInvalidNameDescription: 'Der Name muss mindestens 3 Zeichen lang sein.',
    signUpSuccess: 'Konto erstellt',
    signUpSuccessDescription: 'Ein Bestätigungslink wurde an deine E-Mail-Adresse gesendet. Bitte bestätige dein Konto, um fortzufahren.',
    signUpFailed: 'Registrierung fehlgeschlagen',
    forgotPasswordTitle: 'Passwort vergessen',
    forgotPasswordDescription: 'Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.',
    forgotPasswordSendLink: 'Link zum Zurücksetzen senden',
    forgotPasswordBackToLogin: 'Zurück zum Login',
    forgotPasswordRateLimit: "Du hast zu oft eine Passwortzurücksetzung angefordert. Bitte versuche es in 24 Stunden erneut.",
    forgotPasswordRateLimitTitle: "Ratenlimit überschritten",
    forgotPasswordCheckEmail: 'Überprüfe deine E-Mails',
    forgotPasswordCheckEmailDescription: "Wenn ein Konto für diese E-Mail existiert, erhältst du einen Link zum Zurücksetzen des Passworts.",
    forgotPasswordOffline: "Du scheinst offline zu sein. Bitte überprüfe deine Internetverbindung.",
    forgotPasswordOfflineTitle: "Offline",
    verifyEmailTitle: 'Bestätige deine E-Mail',
    verifyEmailDescription: (email: string) => `Wir haben einen Bestätigungslink an <strong>${email}</strong> gesendet.`,
    verifyEmailInstructions: 'Bitte überprüfe deinen Posteingang (und den Spam-Ordner!) und klicke auf den Link, um dein Konto zu aktivieren.',
    verifyEmailResendButton: 'Bestätigungs-E-Mail erneut senden',
    verifyEmailAfterwards: 'Nach der Bestätigung kannst du dich',
    verifyEmailLoginLink: 'anmelden',
    verifyEmailSent: 'E-Mail gesendet',
    verifyEmailSentDescription: 'Ein neuer Bestätigungslink wurde an deine E-Mail-Adresse gesendet.',
    verifyEmailFailed: 'Fehler',
    verifyEmailFailedDescription: 'Fehler beim Senden der Bestätigungs-E-Mail. Bitte versuche es später erneut.',
  },
  fr: {
    loading: 'Chargement',
    error: 'Erreur',
    leaderboard: 'Classement',
    logout: 'Déconnexion',
    login: 'Connexion',
    signUp: 'S\'inscrire',
    startTyping: 'Commencer à taper',
    changeLevel: 'Changer de niveau',
    homeTitle: 'Libérez Votre Véritable Potentiel de Frappe',
    homeSubtitle: 'Expérimentez des tests de frappe réalistes, obtenez des retours basés sur l\'IA et suivez vos progrès pour devenir un dactylographe plus rapide et plus précis.',
    homeChooseChallenge: 'Choisissez votre défi',
    homeViewLeaderboard: 'Voir le classement',
    chooseYourChallenge: 'Choisissez Votre Défi',
    chooseYourChallengeDescription: 'Sélectionnez une langue et une difficulté qui vous conviennent, et commencez à améliorer vos compétences!',
    levelSimple: 'Simple',
    levelSimpleDescription: 'Parfait pour les débutants. Mots aléatoires en minuscules, sans limite de temps.',
    levelIntermediate: 'Intermédiaire',
    levelIntermediateDescription: 'Sélectionnez un nombre de mots et entraînez-vous avec une séquence de mots aléatoires.',
    levelExpert: 'Expert',
    levelExpertDescription: 'Un défi de mots plus difficile. Sélectionnez le nombre de mots à taper.',
    wordCount: 'Nombre de mots',
    words: 'mots',
    startChallenge: (level: string) => `Commencer ${level}`,
    challengeTitle: (level: string) => `Défi de Dactylographie (${level.charAt(0).toUpperCase() + level.slice(1)})`,
    resetTest: 'Réinitialiser le test',
    time: 'Temps',
    timeLeft: 'Temps restant',
    wpm: 'MPM',
    accuracy: 'Précision',
    testComplete: 'Test terminé !',
    calculatingResults: 'Calcul de vos résultats',
    loadingChallenge: 'Chargement du défi',
    saveScorePromptTitle: 'Enregistrer le score ?',
    saveScorePromptDescription: (wpm: number) => `Votre score était de ${wpm} MPM. Soumettre ce score au classement ?`,
    save: 'Soumettre le score',
    dontSave: 'Ne pas soumettre',
    scoreSaved: 'Vous êtes au classement !',
    scoreSavedDescription: 'Votre score a été publié sur le classement en direct. Voyez comment vous vous situez !',
    signupPromptTitle: 'Enregistrer votre score dans le classement ?',
    signupPromptDescription: 'Créez un compte gratuit pour enregistrer vos résultats, suivre vos progrès et voir votre nom dans le classement mondial.',
    noThanks: 'Non, merci',
    resultsTestType: 'type de test',
    resultsRaw: 'brut',
    resultsCharacters: 'caractères',
    resultsConsistency: 'cohérence',
    tryAgain: 'Réessayer',
    testIncomplete: 'Test Incomplet',
    scoreNotSaved: 'Score non enregistré.',
    saveToLeaderboard: 'Sauvegarder au classement',
    backToHome: 'Retour à l\'accueil',
    leaderboardTitle: 'Classement Mondial',
    leaderboardDescription: 'Top 10 scores pour chaque niveau des 5 dernières minutes. Voyez comment vous vous situez !',
    rank: 'Rang',
    name: 'Nom',
    level: 'Niveau',
    language: 'Langue',
    date: 'Date',
    leaderboardTop50: 'Les 10 meilleurs scores pour chaque niveau sont affichés. Bonne chance !',
    noScores: 'Aucun score enregistré pour cette période.',
    leaderboardAllTime: 'Global',
    leaderboardWeekly: 'Hebdomadaire',
    leaderboardDaily: 'Journalier',
    leaderboardAllTimeTitle: 'Classement Global',
    leaderboardWeeklyTitle: 'Classement Hebdomadaire',
    leaderboardDailyTitle: 'Classement Journalier',
    leaderboardTop100AllTime: 'Les 100 meilleurs joueurs uniques par leur meilleur score.',
    nextResetIn: 'Prochaine réinitialisation dans',
    aboutCreatedBy: 'Créé avec amour par MALIK REHAN.',
    aboutLaunchedOn: 'Lancé le 20 juin 2025.',
    aboutWpmDistribution: 'Distribution des MPM',
    aboutWpmDistributionDescription: 'Distribution des MPM de tous les joueurs du classement.',
    aboutTotalTestsStarted: 'Total des tests commencés',
    aboutTotalTestsStartedDescription: 'Décompte global de tous les joueurs',
    aboutTotalTimeTyping: 'Temps total de frappe',
    aboutTotalTimeTypingDescription: 'Temps cumulé que tous les utilisateurs ont passé dans des tests actifs.',
    aboutTotalTestsCompleted: 'Total des tests terminés',
    aboutTotalTestsCompletedDescription: 'Total des sessions terminées par tous les joueurs',
    settingsTitle: 'Paramètres',
    settingsDescription: 'Personnalisez votre expérience de frappe. Les modifications s\'appliqueront à votre prochain test.',
    correctCharColor: 'Couleur des caractères corrects',
    colorDefault: 'Défaut (Vert)',
    colorPurple: 'Violet Néon',
    colorBlue: 'Bleu',
    colorIncognito: 'Incognito',
    difficultyMode: 'Mode de difficulté',
    difficultyDefault: 'Défaut (pas de limite d\'erreurs)',
    difficultyPro: 'Pro (5 erreurs max)',
    difficultyGod: 'Dieu (1 erreur max)',
    selectLanguage: 'Sélectionner la langue',
    language: 'Langue',
    languageEnglish: 'English (Anglais)',
    languageSpanish: 'Español (Espagnol)',
    languageGerman: 'Deutsch (Allemand)',
    languageFrench: 'Français',
    languageChanged: 'Langue mise à jour !',
    languageChangedDescription: 'La langue de l\'application a été modifiée.',
    proTip: 'Conseil de pro',
    loginTitle: 'Connexion',
    loginDescription: 'Entrez votre email ci-dessous pour vous connecter à votre compte',
    loginEmailLabel: 'Email',
    loginPasswordLabel: 'Mot de passe',
    loginForgotPasswordLink: 'Mot de passe oublié ?',
    loginButton: 'Se connecter',
    loginDontHaveAccount: 'Vous n\'avez pas de compte ?',
    loginSignUpLink: 'Inscrivez-vous',
    loginSuccess: 'Succès',
    loginSuccessDescription: 'Connecté avec succès !',
    loginVerificationRequired: 'Vérification requise',
    loginVerificationRequiredDescription: 'Un nouveau lien de vérification a été envoyé à votre email. Veuillez vérifier votre compte pour continuer.',
    loginFailed: 'Échec de la connexion',
    loginFailedInvalid: "Email ou mot de passe invalide. Veuillez vérifier vos identifiants et réessayer.",
    signUpTitle: 'S\'inscrire',
    signUpDescription: 'Entrez vos informations pour créer un compte',
    signUpNameLabel: 'Nom',
    signUpButton: 'Créer un compte',
    signUpAlreadyHaveAccount: 'Vous avez déjà un compte ?',
    signUpLoginLink: 'Se connecter',
    signUpInvalidName: 'Nom invalide',
    signUpInvalidNameDescription: 'Le nom doit contenir au moins 3 caractères.',
    signUpSuccess: 'Compte créé',
    signUpSuccessDescription: 'Un lien de vérification a été envoyé à votre adresse e-mail. Veuillez vérifier votre compte pour continuer.',
    signUpFailed: 'Échec de l\'inscription',
    forgotPasswordTitle: 'Mot de passe oublié',
    forgotPasswordDescription: 'Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    forgotPasswordSendLink: 'Envoyer le lien de réinitialisation',
    forgotPasswordBackToLogin: 'Retour à la connexion',
    forgotPasswordRateLimit: "Vous avez demandé une réinitialisation de mot de passe trop de fois. Veuillez réessayer dans 24 heures.",
    forgotPasswordRateLimitTitle: "Limite de taux dépassée",
    forgotPasswordCheckEmail: 'Vérifiez votre e-mail',
    forgotPasswordCheckEmailDescription: "Si un compte existe pour cet e-mail, vous recevrez un lien de réinitialisation de mot de passe.",
    forgotPasswordOffline: "Vous semblez être hors ligne. Veuillez vérifier votre connexion Internet.",
    forgotPasswordOfflineTitle: "Hors ligne",
    verifyEmailTitle: 'Vérifiez votre e-mail',
    verifyEmailDescription: (email: string) => `Nous avons envoyé un lien de vérification à <strong>${email}</strong>.`,
    verifyEmailInstructions: 'Veuillez vérifier votre boîte de réception (et votre dossier de courrier indésirable !) et cliquer sur le lien pour activer votre compte.',
    verifyEmailResendButton: 'Renvoyer l\'e-mail de vérification',
    verifyEmailAfterwards: 'Après vérification, vous pouvez',
    verifyEmailLoginLink: 'vous connecter',
    verifyEmailSent: 'E-mail envoyé',
    verifyEmailSentDescription: 'Un nouveau lien de vérification a été envoyé à votre adresse e-mail.',
    verifyEmailFailed: 'Erreur',
    verifyEmailFailedDescription: 'Échec de l\'envoi de l\'e-mail de vérification. Veuillez réessayer plus tard.',
  },
};
