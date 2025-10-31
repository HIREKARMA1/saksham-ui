// i18n Infrastructure for multi-language support
// Supports: English, Hindi, Odia (extensible for more languages)

export type Language = 'en' | 'hi' | 'or';

export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.features': string;
  'nav.pricing': string;
  'nav.about': string;
  'nav.contact': string;
  
  // Hero Section
  'hero.title': string;
  'hero.subtitle': string;
  'hero.cta.primary': string;
  'hero.cta.secondary': string;
  
  // Statistics
  'stats.jobsSecured': string;
  'stats.usersActive': string;
  'stats.rating': string;
  
  // Features
  'features.title': string;
  'features.subtitle': string;
  'feature.assessment.title': string;
  'feature.assessment.description': string;
  'feature.mockInterview.title': string;
  'feature.mockInterview.description': string;
  'feature.jobHunter.title': string;
  'feature.jobHunter.description': string;
  'feature.resumeBuilder.title': string;
  'feature.resumeBuilder.description': string;
  'feature.questionBank.title': string;
  'feature.questionBank.description': string;
  'feature.analytics.title': string;
  'feature.analytics.description': string;
  
  // Why Choose Us
  'whyChoose.title': string;
  'whyChoose.subtitle': string;
  'whyChoose.aiPowered.title': string;
  'whyChoose.aiPowered.description': string;
  'whyChoose.realTime.title': string;
  'whyChoose.realTime.description': string;
  'whyChoose.comprehensive.title': string;
  'whyChoose.comprehensive.description': string;
  'whyChoose.expert.title': string;
  'whyChoose.expert.description': string;
  
  // How It Works
  'howItWorks.title': string;
  'howItWorks.subtitle': string;
  'howItWorks.step1.title': string;
  'howItWorks.step1.description': string;
  'howItWorks.step2.title': string;
  'howItWorks.step2.description': string;
  'howItWorks.step3.title': string;
  'howItWorks.step3.description': string;
  'howItWorks.step4.title': string;
  'howItWorks.step4.description': string;
  
  // Testimonials
  'testimonials.title': string;
  'testimonials.subtitle': string;
  
  // Partners
  'partners.title': string;
  'partners.subtitle': string;
  
  // FAQ
  'faq.title': string;
  'faq.subtitle': string;
  
  // Problem Solution
  'problemSolution.badge': string;
  'problemSolution.title': string;
  'problemSolution.subtitle': string;
  'problemSolution.tabProblems': string;
  'problemSolution.tabSolutions': string;
  'problemSolution.cta.primary': string;
  'problemSolution.cta.secondary': string;
  
  'problem.unprepared.title': string;
  'problem.unprepared.description': string;
  'problem.unprepared.point1': string;
  'problem.unprepared.point2': string;
  'problem.unprepared.point3': string;
  'problem.unprepared.point4': string;
  
  'problem.time.title': string;
  'problem.time.description': string;
  'problem.time.point1': string;
  'problem.time.point2': string;
  'problem.time.point3': string;
  'problem.time.point4': string;
  
  'problem.feedback.title': string;
  'problem.feedback.description': string;
  'problem.feedback.point1': string;
  'problem.feedback.point2': string;
  'problem.feedback.point3': string;
  'problem.feedback.point4': string;
  
  'problem.outdated.title': string;
  'problem.outdated.description': string;
  'problem.outdated.point1': string;
  'problem.outdated.point2': string;
  'problem.outdated.point3': string;
  'problem.outdated.point4': string;
  
  'solution.aiPractice.title': string;
  'solution.aiPractice.description': string;
  'solution.aiPractice.benefit1': string;
  'solution.aiPractice.benefit2': string;
  'solution.aiPractice.benefit3': string;
  'solution.aiPractice.benefit4': string;
  
  'solution.instantFeedback.title': string;
  'solution.instantFeedback.description': string;
  'solution.instantFeedback.benefit1': string;
  'solution.instantFeedback.benefit2': string;
  'solution.instantFeedback.benefit3': string;
  'solution.instantFeedback.benefit4': string;
  
  'solution.comprehensive.title': string;
  'solution.comprehensive.description': string;
  'solution.comprehensive.benefit1': string;
  'solution.comprehensive.benefit2': string;
  'solution.comprehensive.benefit3': string;
  'solution.comprehensive.benefit4': string;
  
  'solution.smartPrep.title': string;
  'solution.smartPrep.description': string;
  'solution.smartPrep.benefit1': string;
  'solution.smartPrep.benefit2': string;
  'solution.smartPrep.benefit3': string;
  'solution.smartPrep.benefit4': string;
  
  // Footer
  'footer.tagline': string;
  'footer.copyright': string;
  'footer.product': string;
  'footer.company': string;
  'footer.support': string;
  'footer.legal': string;
  
  // Auth
  'auth.login.title': string;
  'auth.login.subtitle': string;
  'auth.login.email': string;
  'auth.login.password': string;
  'auth.login.submit': string;
  'auth.login.forgotPassword': string;
  'auth.login.noAccount': string;
  'auth.login.createAccount': string;
  'auth.register.title': string;
  'auth.register.subtitle': string;
  'auth.register.firstName': string;
  'auth.register.lastName': string;
  'auth.register.email': string;
  'auth.register.password': string;
  'auth.register.confirmPassword': string;
  'auth.register.phone': string;
  'auth.register.agreeTerms': string;
  'auth.register.submit': string;
  'auth.register.haveAccount': string;
  'auth.register.signIn': string;
  
  // Common
  'common.learnMore': string;
  'common.getStarted': string;
  'common.signUp': string;
  'common.login': string;
  'common.logout': string;
  'common.dashboard': string;
  'common.profile': string;
  'common.settings': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
}

export type Translations = Record<Language, TranslationKeys>;

const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Get Interview Ready With Saksham AI',
    'hero.subtitle': 'Build your resume, practice smarter, and get real-time support with AI Interview Assistant.',
    'hero.cta.primary': 'Start Interview Prep',
    'hero.cta.secondary': 'View Demo',
    
    // Statistics
    'stats.jobsSecured': 'START YOUR JOURNEY',
    'stats.usersActive': 'AI-POWERED INTERVIEW PREP',
    'stats.rating': 'TRUSTED BY STUDENTS',
    
    // Features
    'features.title': 'Powerful Features to Help You Succeed',
    'features.subtitle': 'Everything you need to ace your interviews and land your dream job',
    'feature.assessment.title': 'AI Interview Copilot',
    'feature.assessment.description': 'Your smart AI interview assistant that helps you answer questions confidently in real time.',
    'feature.mockInterview.title': 'Mock Interview',
    'feature.mockInterview.description': 'Practice real interview questions and get instant feedback to improve fast.',
    'feature.jobHunter.title': 'AI Job Hunter',
    'feature.jobHunter.description': 'Apply to the 100x best jobs automatically in seconds.',
    'feature.resumeBuilder.title': 'AI Resume Builder',
    'feature.resumeBuilder.description': 'Make a strong, ATS-ready resume in one click no writing skills needed.',
    'feature.questionBank.title': 'Interview Questions Bank',
    'feature.questionBank.description': 'Explore top questions asked by real companies and learn how to ace them.',
    'feature.analytics.title': 'Performance Analytics',
    'feature.analytics.description': 'Track your progress and identify improvement areas with detailed insights.',
    
    // Why Choose Us
    'whyChoose.title': 'Why Choose Saksham?',
    'whyChoose.subtitle': 'The most comprehensive AI-powered interview preparation platform',
    'whyChoose.aiPowered.title': 'AI-Powered Intelligence',
    'whyChoose.aiPowered.description': 'Leverage cutting-edge AI technology to get personalized feedback and recommendations.',
    'whyChoose.realTime.title': 'Real-Time Assistance',
    'whyChoose.realTime.description': 'Get instant help during practice sessions with our intelligent copilot.',
    'whyChoose.comprehensive.title': 'Comprehensive Resources',
    'whyChoose.comprehensive.description': 'Access a vast library of interview questions, coding challenges, and study materials.',
    'whyChoose.expert.title': 'Expert Guidance',
    'whyChoose.expert.description': 'Learn from industry experts and successful candidates who\'ve been there.',
    
    // How It Works
    'howItWorks.title': 'How Saksham Works',
    'howItWorks.subtitle': 'Four simple steps to interview success',
    'howItWorks.step1.title': 'Sign Up & Create Profile',
    'howItWorks.step1.description': 'Create your account and build your professional profile with our AI-powered resume builder.',
    'howItWorks.step2.title': 'Practice & Learn',
    'howItWorks.step2.description': 'Access our comprehensive question bank and take mock interviews to sharpen your skills.',
    'howItWorks.step3.title': 'Get AI Feedback',
    'howItWorks.step3.description': 'Receive detailed analysis and personalized recommendations to improve your performance.',
    'howItWorks.step4.title': 'Land Your Dream Job',
    'howItWorks.step4.description': 'Apply to jobs with confidence and ace your interviews with our real-time copilot assistance.',
    
    // Testimonials
    'testimonials.title': 'What Our Users Say',
    'testimonials.subtitle': 'Join thousands of successful candidates who trusted Saksham',
    
    // Partners
    'partners.title': 'Trusted by Leading Companies',
    'partners.subtitle': 'Our platform is recognized by top organizations worldwide',
    
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know about Saksham AI',
    
    // Problem Solution
    'problemSolution.badge': 'Transform Your Interview Preparation',
    'problemSolution.title': 'From Interview Anxiety to',
    'problemSolution.subtitle': 'We understand the challenges you face. Here\'s how Saksham AI solves them.',
    'problemSolution.tabProblems': 'Common Problems',
    'problemSolution.tabSolutions': 'Our Solutions',
    'problemSolution.cta.primary': 'Start Your Free Trial',
    'problemSolution.cta.secondary': 'See How It Works',
    
    'problem.unprepared.title': 'Feeling Unprepared',
    'problem.unprepared.description': 'Walking into interviews without proper practice and confidence',
    'problem.unprepared.point1': 'Don\'t know what questions to expect',
    'problem.unprepared.point2': 'Lack of real interview experience',
    'problem.unprepared.point3': 'Nervous about behavioral questions',
    'problem.unprepared.point4': 'Unsure how to present yourself',
    
    'problem.time.title': 'Limited Time to Practice',
    'problem.time.description': 'Struggling to find time for comprehensive interview preparation',
    'problem.time.point1': 'Busy schedule with limited prep time',
    'problem.time.point2': 'No access to mock interviewers',
    'problem.time.point3': 'Can\'t afford expensive coaching',
    'problem.time.point4': 'Need flexible practice options',
    
    'problem.feedback.title': 'No Quality Feedback',
    'problem.feedback.description': 'Practicing without knowing what you\'re doing wrong',
    'problem.feedback.point1': 'No one to review your answers',
    'problem.feedback.point2': 'Don\'t know your weak areas',
    'problem.feedback.point3': 'Repeating the same mistakes',
    'problem.feedback.point4': 'Can\'t track improvement',
    
    'problem.outdated.title': 'Outdated Resources',
    'problem.outdated.description': 'Using generic prep materials that don\'t match real interviews',
    'problem.outdated.point1': 'Questions don\'t match actual interviews',
    'problem.outdated.point2': 'No company-specific preparation',
    'problem.outdated.point3': 'Generic advice that doesn\'t help',
    'problem.outdated.point4': 'Resources not updated regularly',
    
    'solution.aiPractice.title': 'AI-Powered Mock Interviews',
    'solution.aiPractice.description': 'Practice with realistic AI interviews anytime, anywhere',
    'solution.aiPractice.benefit1': 'Unlimited practice sessions 24/7',
    'solution.aiPractice.benefit2': 'Realistic interview simulations',
    'solution.aiPractice.benefit3': 'Company-specific question patterns',
    'solution.aiPractice.benefit4': 'Voice and video interview support',
    
    'solution.instantFeedback.title': 'Instant AI Feedback',
    'solution.instantFeedback.description': 'Get detailed analysis and improvement suggestions immediately',
    'solution.instantFeedback.benefit1': 'Real-time performance analysis',
    'solution.instantFeedback.benefit2': 'Personalized improvement tips',
    'solution.instantFeedback.benefit3': 'Track progress over time',
    'solution.instantFeedback.benefit4': 'Identify and fix weak areas',
    
    'solution.comprehensive.title': 'Comprehensive Question Bank',
    'solution.comprehensive.description': '10,000+ real interview questions from top companies',
    'solution.comprehensive.benefit1': 'Technical & behavioral questions',
    'solution.comprehensive.benefit2': 'Company-specific questions',
    'solution.comprehensive.benefit3': 'Regularly updated database',
    'solution.comprehensive.benefit4': 'Industry-specific content',
    
    'solution.smartPrep.title': 'Smart Preparation Plan',
    'solution.smartPrep.description': 'AI creates personalized study plans based on your needs',
    'solution.smartPrep.benefit1': 'Customized learning paths',
    'solution.smartPrep.benefit2': 'Focus on your weak areas',
    'solution.smartPrep.benefit3': 'Time-efficient preparation',
    'solution.smartPrep.benefit4': 'Adaptive difficulty levels',
    
    // Footer
    'footer.tagline': 'Empowering job seekers with AI-driven interview preparation',
    'footer.copyright': '© 2025 Saksham AI. All rights reserved.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    
    // Auth
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Login to your account to continue your journey',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Login',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.createAccount': 'Create account',
    'auth.register.title': 'Create your account',
    'auth.register.subtitle': 'Start your journey to interview success',
    'auth.register.firstName': 'First name',
    'auth.register.lastName': 'Last name',
    'auth.register.email': 'Email',
    'auth.register.password': 'Password',
    'auth.register.confirmPassword': 'Confirm password',
    'auth.register.phone': 'Phone number',
    'auth.register.agreeTerms': 'I agree to the Terms & Conditions',
    'auth.register.submit': 'Create account',
    'auth.register.haveAccount': 'Already have an account?',
    'auth.register.signIn': 'Sign in',
    
    // Common
    'common.learnMore': 'Learn More',
    'common.getStarted': 'Get Started',
    'common.signUp': 'Sign Up',
    'common.login': 'Login',
    'common.logout': 'Logout',
    'common.dashboard': 'Dashboard',
    'common.profile': 'Profile',
    'common.settings': 'Settings',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.features': 'विशेषताएं',
    'nav.pricing': 'मूल्य निर्धारण',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क करें',
    
    // Hero Section
    'hero.title': 'सक्षम AI के साथ इंटरव्यू के लिए तैयार हो जाइए',
    'hero.subtitle': 'अपना रिज्यूमे बनाएं, स्मार्ट तरीके से अभ्यास करें, और AI इंटरव्यू असिस्टेंट के साथ रियल-टाइम सपोर्ट पाएं।',
    'hero.cta.primary': 'इंटरव्यू की तैयारी शुरू करें',
    'hero.cta.secondary': 'डेमो देखें',
    
    // Statistics
    'stats.jobsSecured': 'अपनी यात्रा शुरू करें',
    'stats.usersActive': 'AI-संचालित इंटरव्यू तैयारी',
    'stats.rating': 'छात्रों द्वारा विश्वसनीय',
    
    // Features
    'features.title': 'सफलता के लिए शक्तिशाली विशेषताएं',
    'features.subtitle': 'आपके इंटरव्यू को एस करने और अपने सपनों की नौकरी पाने के लिए आवश्यक सब कुछ',
    'feature.assessment.title': 'AI इंटरव्यू कोपायलट',
    'feature.assessment.description': 'आपका स्मार्ट AI इंटरव्यू असिस्टेंट जो रियल टाइम में आत्मविश्वास से सवालों के जवाब देने में मदद करता है।',
    'feature.mockInterview.title': 'मॉक इंटरव्यू',
    'feature.mockInterview.description': 'वास्तविक इंटरव्यू प्रश्नों का अभ्यास करें और तेजी से सुधार के लिए तुरंत फीडबैक पाएं।',
    'feature.jobHunter.title': 'AI जॉब हंटर',
    'feature.jobHunter.description': 'सेकंडों में 100x सर्वश्रेष्ठ नौकरियों के लिए स्वचालित रूप से आवेदन करें।',
    'feature.resumeBuilder.title': 'AI रिज्यूमे बिल्डर',
    'feature.resumeBuilder.description': 'एक क्लिक में मजबूत, ATS-रेडी रिज्यूमे बनाएं कोई लेखन कौशल की आवश्यकता नहीं।',
    'feature.questionBank.title': 'इंटरव्यू प्रश्न बैंक',
    'feature.questionBank.description': 'वास्तविक कंपनियों द्वारा पूछे गए शीर्ष प्रश्नों का अन्वेषण करें और उन्हें एस करना सीखें।',
    'feature.analytics.title': 'प्रदर्शन विश्लेषण',
    'feature.analytics.description': 'विस्तृत अंतर्दृष्टि के साथ अपनी प्रगति को ट्रैक करें और सुधार के क्षेत्रों की पहचान करें।',
    
    // Why Choose Us
    'whyChoose.title': 'सक्षम क्यों चुनें?',
    'whyChoose.subtitle': 'सबसे व्यापक AI-संचालित इंटरव्यू तैयारी प्लेटफॉर्म',
    'whyChoose.aiPowered.title': 'AI-संचालित बुद्धिमत्ता',
    'whyChoose.aiPowered.description': 'व्यक्तिगत फीडबैक और सिफारिशें प्राप्त करने के लिए अत्याधुनिक AI तकनीक का लाभ उठाएं।',
    'whyChoose.realTime.title': 'रियल-टाइम सहायता',
    'whyChoose.realTime.description': 'हमारे बुद्धिमान कोपायलट के साथ अभ्यास सत्रों के दौरान तुरंत मदद पाएं।',
    'whyChoose.comprehensive.title': 'व्यापक संसाधन',
    'whyChoose.comprehensive.description': 'इंटरव्यू प्रश्नों, कोडिंग चुनौतियों और अध्ययन सामग्री की विशाल लाइब्रेरी तक पहुंचें।',
    'whyChoose.expert.title': 'विशेषज्ञ मार्गदर्शन',
    'whyChoose.expert.description': 'उद्योग विशेषज्ञों और सफल उम्मीदवारों से सीखें जो वहां रह चुके हैं।',
    
    // How It Works
    'howItWorks.title': 'सक्षम कैसे काम करता है',
    'howItWorks.subtitle': 'इंटरव्यू सफलता के लिए चार सरल कदम',
    'howItWorks.step1.title': 'साइन अप करें और प्रोफाइल बनाएं',
    'howItWorks.step1.description': 'अपना खाता बनाएं और हमारे AI-संचालित रिज्यूमे बिल्डर के साथ अपनी पेशेवर प्रोफाइल बनाएं।',
    'howItWorks.step2.title': 'अभ्यास करें और सीखें',
    'howItWorks.step2.description': 'अपने कौशल को तेज करने के लिए हमारे व्यापक प्रश्न बैंक तक पहुंचें और मॉक इंटरव्यू लें।',
    'howItWorks.step3.title': 'AI फीडबैक प्राप्त करें',
    'howItWorks.step3.description': 'अपने प्रदर्शन को बेहतर बनाने के लिए विस्तृत विश्लेषण और व्यक्तिगत सिफारिशें प्राप्त करें।',
    'howItWorks.step4.title': 'अपने सपनों की नौकरी पाएं',
    'howItWorks.step4.description': 'आत्मविश्वास के साथ नौकरियों के लिए आवेदन करें और हमारी रियल-टाइम कोपायलट सहायता के साथ अपने इंटरव्यू को एस करें।',
    
    // Testimonials
    'testimonials.title': 'हमारे उपयोगकर्ता क्या कहते हैं',
    'testimonials.subtitle': 'हजारों सफल उम्मीदवारों में शामिल हों जिन्होंने सक्षम पर भरोसा किया',
    
    // Partners
    'partners.title': 'अग्रणी कंपनियों द्वारा विश्वसनीय',
    'partners.subtitle': 'हमारा प्लेटफॉर्म दुनिया भर के शीर्ष संगठनों द्वारा मान्यता प्राप्त है',
    
    // FAQ
    'faq.title': 'अक्सर पूछे जाने वाले प्रश्न',
    'faq.subtitle': 'सक्षम AI के बारे में जानने के लिए आवश्यक सब कुछ',
    
    // Problem Solution
    'problemSolution.badge': 'अपनी इंटरव्यू तैयारी में क्रांति लाएं',
    'problemSolution.title': 'इंटरव्यू की चिंता से',
    'problemSolution.subtitle': 'हम आपकी चुनौतियों को समझते हैं। यहाँ बताया गया है कि सक्षम AI उन्हें कैसे हल करता है।',
    'problemSolution.tabProblems': 'आम समस्याएं',
    'problemSolution.tabSolutions': 'हमारे समाधान',
    'problemSolution.cta.primary': 'अपना मुफ्त ट्रायल शुरू करें',
    'problemSolution.cta.secondary': 'यह कैसे काम करता है देखें',
    
    'problem.unprepared.title': 'अपर्याप्त तैयारी महसूस करना',
    'problem.unprepared.description': 'उचित अभ्यास और आत्मविश्वास के बिना इंटरव्यू में जाना',
    'problem.unprepared.point1': 'पता नहीं कि किन सवालों की उम्मीद करें',
    'problem.unprepared.point2': 'वास्तविक इंटरव्यू अनुभव की कमी',
    'problem.unprepared.point3': 'व्यवहारिक प्रश्नों के बारे में घबराहट',
    'problem.unprepared.point4': 'खुद को कैसे पेश करें यह अनिश्चित',
    
    'problem.time.title': 'अभ्यास के लिए सीमित समय',
    'problem.time.description': 'व्यापक इंटरव्यू तैयारी के लिए समय खोजने में संघर्ष',
    'problem.time.point1': 'सीमित तैयारी समय के साथ व्यस्त कार्यक्रम',
    'problem.time.point2': 'मॉक इंटरव्यूअर तक पहुंच नहीं',
    'problem.time.point3': 'महंगी कोचिंग का खर्च नहीं उठा सकते',
    'problem.time.point4': 'लचीले अभ्यास विकल्प की आवश्यकता',
    
    'problem.feedback.title': 'गुणवत्तापूर्ण फीडबैक नहीं',
    'problem.feedback.description': 'यह जाने बिना अभ्यास करना कि आप क्या गलत कर रहे हैं',
    'problem.feedback.point1': 'आपके उत्तरों की समीक्षा करने वाला कोई नहीं',
    'problem.feedback.point2': 'अपने कमजोर क्षेत्रों को नहीं जानते',
    'problem.feedback.point3': 'वही गलतियाँ दोहराना',
    'problem.feedback.point4': 'सुधार को ट्रैक नहीं कर सकते',
    
    'problem.outdated.title': 'पुराने संसाधन',
    'problem.outdated.description': 'सामान्य तैयारी सामग्री का उपयोग जो वास्तविक इंटरव्यू से मेल नहीं खाती',
    'problem.outdated.point1': 'प्रश्न वास्तविक इंटरव्यू से मेल नहीं खाते',
    'problem.outdated.point2': 'कोई कंपनी-विशिष्ट तैयारी नहीं',
    'problem.outdated.point3': 'सामान्य सलाह जो मदद नहीं करती',
    'problem.outdated.point4': 'संसाधन नियमित रूप से अपडेट नहीं होते',
    
    'solution.aiPractice.title': 'AI-संचालित मॉक इंटरव्यू',
    'solution.aiPractice.description': 'कभी भी, कहीं भी यथार्थवादी AI इंटरव्यू के साथ अभ्यास करें',
    'solution.aiPractice.benefit1': '24/7 असीमित अभ्यास सत्र',
    'solution.aiPractice.benefit2': 'यथार्थवादी इंटरव्यू सिमुलेशन',
    'solution.aiPractice.benefit3': 'कंपनी-विशिष्ट प्रश्न पैटर्न',
    'solution.aiPractice.benefit4': 'वॉयस और वीडियो इंटरव्यू समर्थन',
    
    'solution.instantFeedback.title': 'तत्काल AI फीडबैक',
    'solution.instantFeedback.description': 'तुरंत विस्तृत विश्लेषण और सुधार सुझाव प्राप्त करें',
    'solution.instantFeedback.benefit1': 'रियल-टाइम प्रदर्शन विश्लेषण',
    'solution.instantFeedback.benefit2': 'व्यक्तिगत सुधार टिप्स',
    'solution.instantFeedback.benefit3': 'समय के साथ प्रगति ट्रैक करें',
    'solution.instantFeedback.benefit4': 'कमजोर क्षेत्रों की पहचान और सुधार करें',
    
    'solution.comprehensive.title': 'व्यापक प्रश्न बैंक',
    'solution.comprehensive.description': 'शीर्ष कंपनियों से 10,000+ वास्तविक इंटरव्यू प्रश्न',
    'solution.comprehensive.benefit1': 'तकनीकी और व्यवहारिक प्रश्न',
    'solution.comprehensive.benefit2': 'कंपनी-विशिष्ट प्रश्न',
    'solution.comprehensive.benefit3': 'नियमित रूप से अपडेट किया गया डेटाबेस',
    'solution.comprehensive.benefit4': 'उद्योग-विशिष्ट सामग्री',
    
    'solution.smartPrep.title': 'स्मार्ट तैयारी योजना',
    'solution.smartPrep.description': 'AI आपकी आवश्यकताओं के आधार पर व्यक्तिगत अध्ययन योजना बनाता है',
    'solution.smartPrep.benefit1': 'अनुकूलित सीखने के मार्ग',
    'solution.smartPrep.benefit2': 'अपने कमजोर क्षेत्रों पर ध्यान दें',
    'solution.smartPrep.benefit3': 'समय-कुशल तैयारी',
    'solution.smartPrep.benefit4': 'अनुकूली कठिनाई स्तर',
    
    // Footer
    'footer.tagline': 'AI-संचालित इंटरव्यू तैयारी के साथ जॉब सीकर्स को सशक्त बनाना',
    'footer.copyright': '© 2025 सक्षम AI। सर्वाधिकार सुरक्षित।',
    'footer.product': 'उत्पाद',
    'footer.company': 'कंपनी',
    'footer.support': 'समर्थन',
    'footer.legal': 'कानूनी',
    
    // Auth
    'auth.login.title': 'वापसी पर स्वागत है',
    'auth.login.subtitle': 'अपनी यात्रा जारी रखने के लिए अपने खाते में लॉगिन करें',
    'auth.login.email': 'ईमेल',
    'auth.login.password': 'पासवर्ड',
    'auth.login.submit': 'लॉगिन',
    'auth.login.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.login.noAccount': 'खाता नहीं है?',
    'auth.login.createAccount': 'खाता बनाएं',
    'auth.register.title': 'अपना खाता बनाएं',
    'auth.register.subtitle': 'इंटरव्यू सफलता की अपनी यात्रा शुरू करें',
    'auth.register.firstName': 'पहला नाम',
    'auth.register.lastName': 'अंतिम नाम',
    'auth.register.email': 'ईमेल',
    'auth.register.password': 'पासवर्ड',
    'auth.register.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.register.phone': 'फ़ोन नंबर',
    'auth.register.agreeTerms': 'मैं नियम और शर्तों से सहमत हूं',
    'auth.register.submit': 'खाता बनाएं',
    'auth.register.haveAccount': 'पहले से खाता है?',
    'auth.register.signIn': 'साइन इन करें',
    
    // Common
    'common.learnMore': 'और जानें',
    'common.getStarted': 'शुरू करें',
    'common.signUp': 'साइन अप',
    'common.login': 'लॉग इन',
    'common.logout': 'लॉग आउट',
    'common.dashboard': 'डैशबोर्ड',
    'common.profile': 'प्रोफाइल',
    'common.settings': 'सेटिंग्स',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
  },
  or: {
    // Navigation
    'nav.home': 'ମୂଳପୃଷ୍ଠା',
    'nav.features': 'ବୈଶିଷ୍ଟ୍ୟ',
    'nav.pricing': 'ମୂଲ୍ୟ',
    'nav.about': 'ଆମ ବିଷୟରେ',
    'nav.contact': 'ଯୋଗାଯୋଗ',
    
    // Hero Section
    'hero.title': 'ସକ୍ଷମ AI ସହିତ ସାକ୍ଷାତକାର ପାଇଁ ପ୍ରସ୍ତୁତ ହୁଅନ୍ତୁ',
    'hero.subtitle': 'ଆପଣଙ୍କର ରିଜ୍ୟୁମ୍ ତିଆରି କରନ୍ତୁ, ସ୍ମାର୍ଟ ଉପାୟରେ ଅଭ୍ୟାସ କରନ୍ତୁ, ଏବଂ AI ସାକ୍ଷାତକାର ସହାୟକ ସହିତ ରିଅଲ୍-ଟାଇମ୍ ସପୋର୍ଟ ପାଆନ୍ତୁ।',
    'hero.cta.primary': 'ସାକ୍ଷାତକାର ପ୍ରସ୍ତୁତି ଆରମ୍ଭ କରନ୍ତୁ',
    'hero.cta.secondary': 'ଡେମୋ ଦେଖନ୍ତୁ',
    
    // Statistics
    'stats.jobsSecured': 'ଆପଣଙ୍କର ଯାତ୍ରା ଆରମ୍ଭ କରନ୍ତୁ',
    'stats.usersActive': 'AI-ଚାଳିତ ସାକ୍ଷାତକାର ପ୍ରସ୍ତୁତି',
    'stats.rating': 'ଛାତ୍ରମାନଙ୍କ ଦ୍ୱାରା ବିଶ୍ୱସ୍ତ',
    
    // Features
    'features.title': 'ସଫଳତା ପାଇଁ ଶକ୍ତିଶାଳୀ ବୈଶିଷ୍ଟ୍ୟ',
    'features.subtitle': 'ଆପଣଙ୍କର ସାକ୍ଷାତକାରକୁ ଏସ୍ କରିବା ଏବଂ ଆପଣଙ୍କର ସ୍ୱପ୍ନର ଚାକିରି ପାଇବା ପାଇଁ ଆବଶ୍ୟକ ସବୁକିଛି',
    'feature.assessment.title': 'AI ସାକ୍ଷାତକାର କୋପାଇଲଟ୍',
    'feature.assessment.description': 'ଆପଣଙ୍କର ସ୍ମାର୍ଟ AI ସାକ୍ଷାତକାର ସହାୟକ ଯାହା ରିଅଲ୍ ଟାଇମରେ ଆତ୍ମବିଶ୍ୱାସର ସହିତ ପ୍ରଶ୍ନର ଉତ୍ତର ଦେବାରେ ସାହାଯ୍ୟ କରେ।',
    'feature.mockInterview.title': 'ମକ୍ ସାକ୍ଷାତକାର',
    'feature.mockInterview.description': 'ପ୍ରକୃତ ସାକ୍ଷାତକାର ପ୍ରଶ୍ନଗୁଡିକର ଅଭ୍ୟାସ କରନ୍ତୁ ଏବଂ ଦ୍ରୁତ ଉନ୍ନତି ପାଇଁ ତୁରନ୍ତ ଫିଡବ୍ୟାକ୍ ପାଆନ୍ତୁ।',
    'feature.jobHunter.title': 'AI ଜବ୍ ହଣ୍ଟର୍',
    'feature.jobHunter.description': 'ସେକେଣ୍ଡରେ 100x ସର୍ବୋତ୍ତମ ଚାକିରି ପାଇଁ ସ୍ୱୟଂଚାଳିତ ଭାବରେ ଆବେଦନ କରନ୍ତୁ।',
    'feature.resumeBuilder.title': 'AI ରିଜ୍ୟୁମ୍ ବିଲ୍ଡର୍',
    'feature.resumeBuilder.description': 'ଗୋଟିଏ କ୍ଲିକରେ ଶକ୍ତିଶାଳୀ, ATS-ପ୍ରସ୍ତୁତ ରିଜ୍ୟୁମ୍ ତିଆରି କରନ୍ତୁ କୌଣସି ଲେଖା କୌଶଳ ଆବଶ୍ୟକ ନାହିଁ।',
    'feature.questionBank.title': 'ସାକ୍ଷାତକାର ପ୍ରଶ୍ନ ବ୍ୟାଙ୍କ',
    'feature.questionBank.description': 'ପ୍ରକୃତ କମ୍ପାନୀଗୁଡିକ ଦ୍ୱାରା ପଚରାଯାଇଥିବା ଶୀର୍ଷ ପ୍ରଶ୍ନଗୁଡିକ ଅନ୍ୱେଷଣ କରନ୍ତୁ ଏବଂ ସେଗୁଡିକୁ ଏସ୍ କରିବା ଶିଖନ୍ତୁ।',
    'feature.analytics.title': 'କାର୍ଯ୍ୟଦକ୍ଷତା ବିଶ୍ଳେଷଣ',
    'feature.analytics.description': 'ବିସ୍ତୃତ ଅନ୍ତର୍ଦୃଷ୍ଟି ସହିତ ଆପଣଙ୍କର ଅଗ୍ରଗତି ଟ୍ରାକ୍ କରନ୍ତୁ ଏବଂ ଉନ୍ନତି କ୍ଷେତ୍ର ଚିହ୍ନଟ କରନ୍ତୁ।',
    
    // Why Choose Us
    'whyChoose.title': 'ସକ୍ଷମ କାହିଁକି ବାଛନ୍ତୁ?',
    'whyChoose.subtitle': 'ସର୍ବାଧିକ ବ୍ୟାପକ AI-ଚାଳିତ ସାକ୍ଷାତକାର ପ୍ରସ୍ତୁତି ପ୍ଲାଟଫର୍ମ',
    'whyChoose.aiPowered.title': 'AI-ଚାଳିତ ବୁଦ୍ଧି',
    'whyChoose.aiPowered.description': 'ବ୍ୟକ୍ତିଗତ ଫିଡବ୍ୟାକ୍ ଏବଂ ସୁପାରିଶ ପାଇବା ପାଇଁ ଅତ୍ୟାଧୁନିକ AI ପ୍ରଯୁକ୍ତିର ଲାଭ ଉଠାନ୍ତୁ।',
    'whyChoose.realTime.title': 'ରିଅଲ୍-ଟାଇମ୍ ସହାୟତା',
    'whyChoose.realTime.description': 'ଆମର ବୁଦ୍ଧିମାନ କୋପାଇଲଟ୍ ସହିତ ଅଭ୍ୟାସ ସେସନ୍ ସମୟରେ ତୁରନ୍ତ ସାହାଯ୍ୟ ପାଆନ୍ତୁ।',
    'whyChoose.comprehensive.title': 'ବ୍ୟାପକ ସମ୍ବଳ',
    'whyChoose.comprehensive.description': 'ସାକ୍ଷାତକାର ପ୍ରଶ୍ନ, କୋଡିଂ ଚ୍ୟାଲେଞ୍ଜ ଏବଂ ଅଧ୍ୟୟନ ସାମଗ୍ରୀର ବିଶାଳ ଲାଇବ୍ରେରୀ ଆକ୍ସେସ୍ କରନ୍ତୁ।',
    'whyChoose.expert.title': 'ବିଶେଷଜ୍ଞ ମାର୍ଗଦର୍ଶନ',
    'whyChoose.expert.description': 'ଶିଳ୍ପ ବିଶେଷଜ୍ଞ ଏବଂ ସଫଳ ପ୍ରାର୍ଥୀଙ୍କଠାରୁ ଶିଖନ୍ତୁ ଯେଉଁମାନେ ସେଠାରେ ରହିଛନ୍ତି।',
    
    // How It Works
    'howItWorks.title': 'ସକ୍ଷମ କିପରି କାମ କରେ',
    'howItWorks.subtitle': 'ସାକ୍ଷାତକାର ସଫଳତା ପାଇଁ ଚାରୋଟି ସରଳ ପଦକ୍ଷେପ',
    'howItWorks.step1.title': 'ସାଇନ୍ ଅପ୍ କରନ୍ତୁ ଏବଂ ପ୍ରୋଫାଇଲ୍ ତିଆରି କରନ୍ତୁ',
    'howItWorks.step1.description': 'ଆପଣଙ୍କର ଖାତା ତିଆରି କରନ୍ତୁ ଏବଂ ଆମର AI-ଚାଳିତ ରିଜ୍ୟୁମ୍ ବିଲ୍ଡର୍ ସହିତ ଆପଣଙ୍କର ପେଶାଦାର ପ୍ରୋଫାଇଲ୍ ତିଆରି କରନ୍ତୁ।',
    'howItWorks.step2.title': 'ଅଭ୍ୟାସ କରନ୍ତୁ ଏବଂ ଶିଖନ୍ତୁ',
    'howItWorks.step2.description': 'ଆପଣଙ୍କର କୌଶଳକୁ ତୀକ୍ଷ୍ଣ କରିବା ପାଇଁ ଆମର ବ୍ୟାପକ ପ୍ରଶ୍ନ ବ୍ୟାଙ୍କ ଆକ୍ସେସ୍ କରନ୍ତୁ ଏବଂ ମକ୍ ସାକ୍ଷାତକାର ନିଅନ୍ତୁ।',
    'howItWorks.step3.title': 'AI ଫିଡବ୍ୟାକ୍ ପାଆନ୍ତୁ',
    'howItWorks.step3.description': 'ଆପଣଙ୍କର କାର୍ଯ୍ୟଦକ୍ଷତାକୁ ଉନ୍ନତ କରିବା ପାଇଁ ବିସ୍ତୃତ ବିଶ୍ଳେଷଣ ଏବଂ ବ୍ୟକ୍ତିଗତ ସୁପାରିଶ ପାଆନ୍ତୁ।',
    'howItWorks.step4.title': 'ଆପଣଙ୍କର ସ୍ୱପ୍ନର ଚାକିରି ପାଆନ୍ତୁ',
    'howItWorks.step4.description': 'ଆତ୍ମବିଶ୍ୱାସର ସହିତ ଚାକିରି ପାଇଁ ଆବେଦନ କରନ୍ତୁ ଏବଂ ଆମର ରିଅଲ୍-ଟାଇମ୍ କୋପାଇଲଟ୍ ସହାୟତା ସହିତ ଆପଣଙ୍କର ସାକ୍ଷାତକାର ଏସ୍ କରନ୍ତୁ।',
    
    // Testimonials
    'testimonials.title': 'ଆମର ଉପଭୋକ୍ତାମାନେ କଣ କୁହନ୍ତି',
    'testimonials.subtitle': 'ହଜାରେ ସଫଳ ପ୍ରାର୍ଥୀଙ୍କ ସହିତ ଯୋଗ ଦିଅନ୍ତୁ ଯେଉଁମାନେ ସକ୍ଷମ ଉପରେ ବିଶ୍ୱାସ କଲେ',
    
    // Partners
    'partners.title': 'ଅଗ୍ରଣୀ କମ୍ପାନୀଗୁଡିକ ଦ୍ୱାରା ବିଶ୍ୱାସିତ',
    'partners.subtitle': 'ଆମର ପ୍ଲାଟଫର୍ମ ବିଶ୍ୱବ୍ୟାପୀ ଶୀର୍ଷ ସଂଗଠନଗୁଡିକ ଦ୍ୱାରା ସ୍ୱୀକୃତିପ୍ରାପ୍ତ',
    
    // FAQ
    'faq.title': 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ',
    'faq.subtitle': 'ସକ୍ଷମ AI ବିଷୟରେ ଜାଣିବା ପାଇଁ ଆପଣଙ୍କୁ ଆବଶ୍ୟକ ସବୁକିଛି',
    
    // Problem Solution
    'problemSolution.badge': 'Transform Your Interview Preparation',
    'problemSolution.title': 'From Interview Anxiety to',
    'problemSolution.subtitle': 'We understand the challenges you face. Here is how Saksham AI solves them.',
    'problemSolution.tabProblems': 'Common Problems',
    'problemSolution.tabSolutions': 'Our Solutions',
    'problemSolution.cta.primary': 'Start Your Free Trial',
    'problemSolution.cta.secondary': 'See How It Works',
    
    'problem.unprepared.title': 'Feeling Unprepared',
    'problem.unprepared.description': 'Walking into interviews without proper practice and confidence',
    'problem.unprepared.point1': 'Do not know what questions to expect',
    'problem.unprepared.point2': 'Lack of real interview experience',
    'problem.unprepared.point3': 'Nervous about behavioral questions',
    'problem.unprepared.point4': 'Unsure how to present yourself',
    
    'problem.time.title': 'Limited Time to Practice',
    'problem.time.description': 'Struggling to find time for comprehensive interview preparation',
    'problem.time.point1': 'Busy schedule with limited prep time',
    'problem.time.point2': 'No access to mock interviewers',
    'problem.time.point3': 'Cannot afford expensive coaching',
    'problem.time.point4': 'Need flexible practice options',
    
    'problem.feedback.title': 'No Quality Feedback',
    'problem.feedback.description': 'Practicing without knowing what you are doing wrong',
    'problem.feedback.point1': 'No one to review your answers',
    'problem.feedback.point2': 'Do not know your weak areas',
    'problem.feedback.point3': 'Repeating the same mistakes',
    'problem.feedback.point4': 'Cannot track improvement',
    
    'problem.outdated.title': 'Outdated Resources',
    'problem.outdated.description': 'Using generic prep materials that do not match real interviews',
    'problem.outdated.point1': 'Questions do not match actual interviews',
    'problem.outdated.point2': 'No company-specific preparation',
    'problem.outdated.point3': 'Generic advice that does not help',
    'problem.outdated.point4': 'Resources not updated regularly',
    
    'solution.aiPractice.title': 'AI-Powered Mock Interviews',
    'solution.aiPractice.description': 'Practice with realistic AI interviews anytime, anywhere',
    'solution.aiPractice.benefit1': '24/7 unlimited practice sessions',
    'solution.aiPractice.benefit2': 'Realistic interview simulations',
    'solution.aiPractice.benefit3': 'Company-specific question patterns',
    'solution.aiPractice.benefit4': 'Voice and video interview support',
    
    'solution.instantFeedback.title': 'Instant AI Feedback',
    'solution.instantFeedback.description': 'Get detailed analysis and improvement suggestions immediately',
    'solution.instantFeedback.benefit1': 'Real-time performance analysis',
    'solution.instantFeedback.benefit2': 'Personalized improvement tips',
    'solution.instantFeedback.benefit3': 'Track progress over time',
    'solution.instantFeedback.benefit4': 'Identify and fix weak areas',
    
    'solution.comprehensive.title': 'Comprehensive Question Bank',
    'solution.comprehensive.description': '10,000+ real interview questions from top companies',
    'solution.comprehensive.benefit1': 'Technical and behavioral questions',
    'solution.comprehensive.benefit2': 'Company-specific questions',
    'solution.comprehensive.benefit3': 'Regularly updated database',
    'solution.comprehensive.benefit4': 'Industry-specific content',
    
    'solution.smartPrep.title': 'Smart Preparation Plan',
    'solution.smartPrep.description': 'AI creates personalized study plans based on your needs',
    'solution.smartPrep.benefit1': 'Customized learning paths',
    'solution.smartPrep.benefit2': 'Focus on your weak areas',
    'solution.smartPrep.benefit3': 'Time-efficient preparation',
    'solution.smartPrep.benefit4': 'Adaptive difficulty levels',
    
    // Footer
    'footer.tagline': 'AI-ଚାଳିତ ସାକ୍ଷାତକାର ପ୍ରସ୍ତୁତି ସହିତ ଚାକିରି ଖୋଜୁଥିବା ଲୋକଙ୍କୁ ସଶକ୍ତ କରିବା',
    'footer.copyright': '© 2025 ସକ୍ଷମ AI। ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।',
    'footer.product': 'ଉତ୍ପାଦ',
    'footer.company': 'କମ୍ପାନୀ',
    'footer.support': 'ସମର୍ଥନ',
    'footer.legal': 'ଆଇନଗତ',
    
    // Auth
    'auth.login.title': 'ପୁଣି ସ୍ୱାଗତ',
    'auth.login.subtitle': 'ଆପଣଙ୍କର ଯାତ୍ରା ଜାରି ରଖିବା ପାଇଁ ଆପଣଙ୍କର ଖାତାରେ ଲଗଇନ୍ କରନ୍ତୁ',
    'auth.login.email': 'ଇମେଲ୍',
    'auth.login.password': 'ପାସୱାର୍ଡ',
    'auth.login.submit': 'ଲଗଇନ୍',
    'auth.login.forgotPassword': 'ପାସୱାର୍ଡ ଭୁଲି ଯାଇଛନ୍ତି?',
    'auth.login.noAccount': 'ଖାତା ନାହିଁ?',
    'auth.login.createAccount': 'ଖାତା ତିଆରି କରନ୍ତୁ',
    'auth.register.title': 'ଆପଣଙ୍କର ଖାତା ତିଆରି କରନ୍ତୁ',
    'auth.register.subtitle': 'ସାକ୍ଷାତକାର ସଫଳତାର ଆପଣଙ୍କର ଯାତ୍ରା ଆରମ୍ଭ କରନ୍ତୁ',
    'auth.register.firstName': 'ପ୍ରଥମ ନାମ',
    'auth.register.lastName': 'ଶେଷ ନାମ',
    'auth.register.email': 'ଇମେଲ୍',
    'auth.register.password': 'ପାସୱାର୍ଡ',
    'auth.register.confirmPassword': 'ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ',
    'auth.register.phone': 'ଫୋନ୍ ନମ୍ବର',
    'auth.register.agreeTerms': 'ମୁଁ ନିୟମ ଏବଂ ଶର୍ତ୍ତଗୁଡିକରେ ସହମତ',
    'auth.register.submit': 'ଖାତା ତିଆରି କରନ୍ତୁ',
    'auth.register.haveAccount': 'ପୂର୍ବରୁ ଖାତା ଅଛି?',
    'auth.register.signIn': 'ସାଇନ୍ ଇନ୍ କରନ୍ତୁ',
    
    // Common
    'common.learnMore': 'ଅଧିକ ଜାଣନ୍ତୁ',
    'common.getStarted': 'ଆରମ୍ଭ କରନ୍ତୁ',
    'common.signUp': 'ସାଇନ୍ ଅପ୍',
    'common.login': 'ଲଗଇନ୍',
    'common.logout': 'ଲଗଆଉଟ୍',
    'common.dashboard': 'ଡ୍ୟାସବୋର୍ଡ',
    'common.profile': 'ପ୍ରୋଫାଇଲ୍',
    'common.settings': 'ସେଟିଂସ୍',
    'common.loading': 'ଲୋଡ୍ ହେଉଛି...',
    'common.error': 'ତ୍ରୁଟି',
    'common.success': 'ସଫଳତା',
  },
};

export default translations;

