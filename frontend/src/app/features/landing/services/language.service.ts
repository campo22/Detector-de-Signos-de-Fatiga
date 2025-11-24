import { Injectable, signal } from '@angular/core';

type Language = 'es' | 'en';
type Translations = Record<string, any>;

const esTranslations = {
  "header": {
    "features": "Características",
    "caseStudies": "Casos de Éxito",
    "howItWorks": "Cómo Funciona",
    "roiCalculator": "Calculadora ROI",
    "pricing": "Precios",
    "faq": "FAQ",
    "login": "Iniciar Sesión",
    "bookDemo": "Solicitar Demo"
  },
  "hero": {
    "tag": "Detección de Fatiga con IA",
    "title": "Revoluciona la Seguridad de tu Flota",
    "subtitle": "Nuestra IA detecta la fatiga en tiempo real, previniendo accidentes y optimizando el rendimiento de tus conductores.",
    "cta": {
      "bookDemo": "Solicitar Demo",
      "watchVideo": "Ver video"
    }
  },
  "logoCloud": {
    "title": "La Confianza de los Líderes del Sector"
  },
  "features": {
    "tag": "Ventaja IA",
    "title": "Una Plataforma Inteligente para un Futuro Seguro",
    "subtitle": "Descubre las herramientas que SafeTrack pone a tu disposición para una gestión de flotas proactiva y eficiente.",
    "cards": {
      "realTime": {
        "title": "Detección en Tiempo Real",
        "description": "Nuestro sistema de IA monitorea constantemente al conductor, identificando signos de somnolencia o distracción al instante."
      },
      "predictive": {
        "title": "Análisis Predictivo",
        "description": "Analizamos patrones de conducción y datos biométricos para predecir y prevenir incidentes antes de que ocurran."
      },
      "alerts": {
        "title": "Alertas Inteligentes",
        "description": "Enviamos alertas en cabina y al centro de control para tomar acciones inmediatas, garantizando la seguridad del conductor y la carga."
      },
      "reports": {
        "title": "Reportes y KPIs",
        "description": "Accede a un dashboard intuitivo con informes detallados y métricas clave para optimizar la eficiencia y seguridad de tu flota."
      },
      "coaching": {
        "title": "Coaching Personalizado",
        "description": "Generamos programas de formación personalizados basados en el rendimiento individual de cada conductor."
      },
      "integration": {
        "title": "Fácil Integración",
        "description": "Nuestra plataforma se integra sin problemas con tus sistemas de gestión de flotas existentes (FMS)."
      }
    }
  },
  "systemTour": {
    "title": "Explore SafeTrack en Acción",
    "subtitle": "Un recorrido visual por nuestra plataforma. Vea cómo nuestras interfaces intuitivas le brindan control y visibilidad total sobre la seguridad de su flota.",
    "slides": {
      "dashboard": {
        "title": "Dashboard Principal",
        "description": "Visualice el estado general de su flota de un vistazo, con KPIs clave, alertas recientes y un mapa interactivo en tiempo real."
      },
      "monitoring": {
        "title": "Monitoreo Individual",
        "description": "Profundice en el rendimiento de cada conductor, revise eventos específicos con clips de video y acceda a su historial de conducción."
      },
      "reports": {
        "title": "Reportes Analíticos",
        "description": "Genere informes personalizados para identificar tendencias, evaluar riesgos y tomar decisiones basadas en datos para optimizar su operación."
      },
      "alerts": {
        "title": "Gestión de Alertas",
        "description": "Configure y gestione umbrales de alerta, notificaciones y protocolos de respuesta para un manejo de incidentes eficiente y proactivo."
      }
    }
  },
  "testimonials": {
    "title": "La Confianza de los Líderes del Sector",
    "subtitle": "Empresas de toda la región confían en SafeTrack para proteger a sus equipos y activos más valiosos.",
    "cards": {
      "perez": {
        "name": "Juan Pérez",
        "role": "Jefe de Flota, Logística Veloz",
        "quote": "SafeTrack ha sido un cambio de juego para nosotros. Redujimos los incidentes por fatiga en un 80% en el primer trimestre."
      },
      "rodriguez": {
        "name": "Maria Rodriguez",
        "role": "Gerente de Seguridad",
        "quote": "La capacidad de recibir alertas en tiempo real nos ha permitido intervenir antes de que ocurran accidentes."
      },
      "gomez": {
        "name": "Carlos Gómez",
        "role": "Director de Operaciones",
        "quote": "El retorno de inversión fue casi inmediato gracias a la optimización que logramos."
      }
    },
    "stat": "Feedback positivo después de usar SafeTrack"
  },
  "caseStudies": {
    "tag": "Resultados Comprobados",
    "title": "Historias de Éxito: Datos Reales",
    "subtitle": "Vea cómo empresas líderes en logística y transporte han transformado su seguridad y eficiencia operativa con SafeTrack.",
    "readMore": "Leer caso de éxito completo",
    "cards": {
      "transglobal": {
        "sector": "LOGÍSTICA INTERNACIONAL",
        "name": "TransGlobal Logistics",
        "quote": "La implementación de SafeTrack no solo redujo drásticamente los accidentes, sino que también nos dio una visibilidad sin precedentes sobre la eficiencia de nuestra flota.",
        "metric1": "Reducción de incidentes por fatiga",
        "metric2": "Mejora en la eficiencia de combustible"
      },
      "cargaRapida": {
        "sector": "TRANSPORTE REGIONAL",
        "name": "Carga Rápida del Norte",
        "quote": "Las alertas proactivas son increíblemente efectivas. Hemos podido intervenir en situaciones de riesgo antes de que se convirtieran en problemas serios.",
        "metric1": "Disminución de alertas críticas no atendidas",
        "metric2": "Cobertura y monitoreo continuo"
      }
    }
  },
  "howItWorks": {
    "title": "Simple, Potente y Efectivo",
    "subtitle": "Implementa SafeTrack en 3 sencillos pasos y transforma la seguridad de tu operación.",
    "steps": {
      "step1": {
        "title": "1. Instalación Rápida",
        "description": "Nuestros dispositivos se instalan en minutos en cualquier vehículo de tu flota, sin configuraciones complejas."
      },
      "step2": {
        "title": "2. Monitoreo 24/7",
        "description": "La IA analiza en tiempo real el comportamiento del conductor y las condiciones del vehículo, 24 horas al día."
      },
      "step3": {
        "title": "3. Acción y Optimización",
        "description": "Recibe alertas proactivas y utiliza nuestros análisis para tomar decisiones informadas y mejorar la seguridad."
      }
    }
  },
  "roi": {
    "tag": "Valor Cuantificable",
    "title": "Calcule su Ahorro Anual",
    "subtitle": "Nuestros clientes ven un retorno de inversión tangible. Utilice nuestra calculadora para estimar el impacto financiero que SafeTrack podría tener en su operación. Los resultados se basan en una reducción promedio de incidentes del 82%.",
    "form": {
      "vehicles": "Número de vehículos en su flota",
      "incidents": "Incidentes anuales por fatiga (promedio)",
      "cost": "Costo promedio por incidente ($)"
    },
    "results": {
      "title": "Ahorro potencial anual estimado:",
      "cta": "Discutir mis Resultados"
    }
  },
  "pricing": {
    "title": "Planes a la Medida de tu Flota",
    "subtitle": "Ofrecemos soluciones flexibles que se adaptan al tamaño y las necesidades de tu operación. Hablemos para encontrar el plan perfecto para ti.",
    "billing": {
      "monthly": "Mensual",
      "yearly": "Anual",
      "save": "Ahorra 15%"
    },
    "features": {
      "detection": "Detección de fatiga por IA",
      "inCabAlerts": "Alertas en cabina",
      "basicDashboard": "Dashboard de seguridad básico",
      "predictiveAnalysis": "Análisis predictivo de riesgos",
      "advancedReports": "Reportes avanzados y KPIs",
      "coaching": "Coaching personalizado para conductores"
    },
    "plans": {
      "popular": "Más Popular",
      "customPrice": "Personalizado",
      "cta": "Solicitar Demo",
      "essential": {
        "title": "Esencial",
        "description": "Ideal para flotas pequeñas que buscan empezar con la seguridad proactiva."
      },
      "professional": {
        "title": "Profesional",
        "description": "La solución completa para flotas que buscan optimizar seguridad y eficiencia."
      },
      "enterprise": {
        "title": "Empresarial",
        "description": "Para grandes flotas con necesidades complejas y personalización avanzada."
      }
    }
  },
  "faq": {
    "title": "Preguntas Frecuentes",
    "subtitle": "Encuentra respuestas a las dudas más comunes sobre SafeTrack.",
    "questions": {
      "q1": {
        "question": "¿Cómo funciona la detección de fatiga por IA?",
        "answer": "Nuestro sistema utiliza una cámara en cabina que analiza en tiempo real los rasgos faciales del conductor, como el parpadeo, la frecuencia de bostezos y la dirección de la mirada. Los algoritmos de IA identifican patrones que indican somnolencia o distracción y activan una alerta si se detecta un riesgo."
      },
      "q2": {
        "question": "¿La instalación del dispositivo es complicada?",
        "answer": "No, la instalación es muy sencilla y rápida. Nuestros dispositivos están diseñados para ser 'plug-and-play' y pueden ser instalados por su propio personal en minutos, o podemos coordinar una instalación profesional si lo prefiere. No se requieren modificaciones complejas en el vehículo."
      },
      "q3": {
        "question": "¿Cómo se integra SafeTrack con mi sistema de gestión de flotas (FMS) actual?",
        "answer": "Ofrecemos una API robusta y flexible que permite una integración fluida con la mayoría de los FMS del mercado. Esto le permite centralizar toda la información de seguridad y operativa en una única plataforma, la que ya utiliza su equipo."
      },
      "q4": {
        "question": "¿Qué pasa con la privacidad del conductor?",
        "answer": "La privacidad es una prioridad para nosotros. El sistema solo graba y almacena clips cortos cuando se detecta un evento de riesgo (ej. fatiga, distracción). Todo el procesamiento de datos se realiza bajo estrictas políticas de seguridad y cumplimiento de normativas de protección de datos. La finalidad es exclusivamente la seguridad, no la vigilancia."
      }
    }
  },
  "contact": {
    "title": "Tome el Atajo a la Producción",
    "subtitle": "Descubra cómo SafeTrack puede transformar la seguridad y eficiencia de tu flota. Nuestro equipo de expertos está listo para mostrarte el poder de nuestra plataforma en una demostración personalizada.",
    "perks": {
      "perk1": "Análisis sin costo",
      "perk2": "Implementación rápida"
    },
    "form": {
      "name": "Nombre",
      "company": "Empresa",
      "email": "Correo Electrónico",
      "phone": "Teléfono",
      "message": "¿Cómo podemos ayudarte?",
      "submit": "Enviar Solicitud",
      "submitting": "Enviando...",
      "success": "¡Gracias! Hemos recibido tu solicitud. Nos pondremos en contacto contigo pronto.",
      "error": "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo."
    }
  },
  "demoModal": {
    "title": "Solicite su Demo Personalizada",
    "subtitle": "Complete el formulario y uno de nuestros especialistas se pondrá en contacto para agendar una demostración adaptada a sus necesidades.",
    "form": {
      "name": "Nombre Completo",
      "company": "Nombre de la Empresa",
      "email": "Correo Electrónico de Trabajo",
      "submit": "Solicitar mi Demo",
      "submitting": "Enviando...",
      "success": "¡Solicitud recibida! Gracias por su interés. Nos pondremos en contacto pronto.",
      "error": "No se pudo enviar la solicitud. Por favor, inténtelo de nuevo."
    }
  },
  "loginModal": {
    "title": "Inicie sesión en su cuenta",
    "welcome": "¡Bienvenido de nuevo!",
    "subtitle": "Introduzca su correo electrónico y contraseña.",
    "visual": {
      "title": "Seguridad que nunca duerme.",
      "subtitle": "Monitoreo inteligente para proteger cada kilómetro de su viaje."
    },
    "form": {
      "email": "Correo Electrónico",
      "password": "Contraseña",
      "forgot": "¿Olvidó su contraseña?",
      "submit": "Iniciar Sesión",
      "submitting": "Iniciando...",
      "success": "¡Bienvenido de nuevo!",
      "error": "Correo o contraseña incorrectos."
    },
    "forgotPassword": {
      "title": "Recuperar Contraseña",
      "subtitle": "Ingrese su correo y le enviaremos un enlace de recuperación.",
      "submit": "Enviar Enlace",
      "submitting": "Enviando...",
      "success": "¡Enlace enviado! Revise su correo.",
      "backToLogin": "Volver a Iniciar Sesión"
    },
    "signup": {
      "title": "Cree su cuenta",
      "subtitle": "Comience su viaje hacia una flota más segura.",
      "prompt": "¿No tiene una cuenta?",
      "link": "Regístrese",
      "form": {
        "name": "Nombre completo",
        "company": "Nombre de la empresa",
        "submit": "Crear Cuenta",
        "submitting": "Creando...",
        "success": "¡Cuenta creada! Ahora puede iniciar sesión.",
        "error": "No se pudo crear la cuenta. Inténtelo de nuevo."
      }
    },
    "login": {
      "prompt": "¿Ya tiene una cuenta?",
      "link": "Iniciar Sesión"
    }
  },
  "chatbot": {
    "welcome": "¡Hola! Soy el asistente de SafeTrack. ¿Cómo puedo ayudarte hoy?",
    "proactive": "¿Preguntas? ¡Estoy aquí para ayudar!",
    "tooltip": "Asistente IA",
    "typing": "Asistente está escribiendo...",
    "quickReplies": {
      "whatIs": "¿Qué es SafeTrack?",
      "howItWorks": "¿Cómo funciona?",
      "pricing": "Ver precios"
    }
  },
  "footer": {
    "tagline": "Revoluciona la Seguridad de tu Flota con IA.",
    "resources": {
      "title": "Recursos",
      "blog": "Blog",
      "caseStudies": "Casos de Éxito",
      "whitepapers": "Whitepapers"
    },
    "company": {
      "title": "Empresa",
      "about": "Sobre Nosotros",
      "contact": "Contacto",
      "careers": "Carreras"
    },
    "legal": {
      "title": "Legal",
      "privacy": "Política de Privacidad",
      "terms": "Términos y Condiciones"
    },
    "copyright": "Todos los derechos reservados."
  }
};

const enTranslations = {
  "header": {
    "features": "Features",
    "caseStudies": "Case Studies",
    "howItWorks": "How It Works",
    "roiCalculator": "ROI Calculator",
    "pricing": "Pricing",
    "faq": "FAQ",
    "login": "Log In",
    "bookDemo": "Book a Demo"
  },
  "hero": {
    "tag": "AI-Powered Fatigue Detection",
    "title": "Revolutionize Your Fleet's Safety",
    "subtitle": "Our AI detects fatigue in real-time, preventing accidents and optimizing your drivers' performance.",
    "cta": {
      "bookDemo": "Book a Demo",
      "watchVideo": "Watch Video"
    }
  },
  "logoCloud": {
    "title": "Trusted by Industry Leaders"
  },
  "features": {
    "tag": "AI Advantage",
    "title": "An Intelligent Platform for a Secure Future",
    "subtitle": "Discover the tools SafeTrack provides for proactive and efficient fleet management.",
    "cards": {
      "realTime": {
        "title": "Real-Time Detection",
        "description": "Our AI system constantly monitors the driver, instantly identifying signs of drowsiness or distraction."
      },
      "predictive": {
        "title": "Predictive Analysis",
        "description": "We analyze driving patterns and biometric data to predict and prevent incidents before they happen."
      },
      "alerts": {
        "title": "Smart Alerts",
        "description": "We send in-cab and control center alerts for immediate action, ensuring driver and cargo safety."
      },
      "reports": {
        "title": "Reports and KPIs",
        "description": "Access an intuitive dashboard with detailed reports and key metrics to optimize your fleet's efficiency and safety."
      },
      "coaching": {
        "title": "Personalized Coaching",
        "description": "We generate personalized training programs based on the individual performance of each driver."
      },
      "integration": {
        "title": "Easy Integration",
        "description": "Our platform seamlessly integrates with your existing Fleet Management Systems (FMS)."
      }
    }
  },
  "systemTour": {
    "title": "Explore SafeTrack in Action",
    "subtitle": "A visual tour of our platform. See how our intuitive interfaces give you full control and visibility over your fleet's safety.",
    "slides": {
      "dashboard": {
        "title": "Main Dashboard",
        "description": "View your fleet's overall status at a glance, with key KPIs, recent alerts, and a real-time interactive map."
      },
      "monitoring": {
        "title": "Individual Monitoring",
        "description": "Drill down into each driver's performance, review specific events with video clips, and access their driving history."
      },
      "reports": {
        "title": "Analytical Reports",
        "description": "Generate custom reports to identify trends, assess risks, and make data-driven decisions to optimize your operation."
      },
      "alerts": {
        "title": "Alert Management",
        "description": "Configure and manage alert thresholds, notifications, and response protocols for efficient and proactive incident handling."
      }
    }
  },
  "testimonials": {
    "title": "Trusted by Industry Leaders",
    "subtitle": "Companies across the region rely on SafeTrack to protect their most valuable assets and teams.",
    "cards": {
      "perez": {
        "name": "John Perez",
        "role": "Fleet Manager, Swift Logistics",
        "quote": "SafeTrack has been a game-changer for us. We reduced fatigue-related incidents by 80% in the first quarter."
      },
      "rodriguez": {
        "name": "Maria Rodriguez",
        "role": "Safety Manager",
        "quote": "The ability to receive real-time alerts has allowed us to intervene before accidents happen."
      },
      "gomez": {
        "name": "Carlos Gomez",
        "role": "Director of Operations",
        "quote": "The return on investment was almost immediate thanks to the optimization we achieved."
      }
    },
    "stat": "Positive feedback after using SafeTrack"
  },
  "caseStudies": {
    "tag": "Proven Results",
    "title": "Success Stories: Real Data",
    "subtitle": "See how leading logistics and transportation companies have transformed their safety and operational efficiency with SafeTrack.",
    "readMore": "Read full case study",
    "cards": {
      "transglobal": {
        "sector": "INTERNATIONAL LOGISTICS",
        "name": "TransGlobal Logistics",
        "quote": "Implementing SafeTrack not only drastically reduced accidents but also gave us unprecedented visibility into our fleet's efficiency.",
        "metric1": "Reduction in fatigue-related incidents",
        "metric2": "Improvement in fuel efficiency"
      },
      "cargaRapida": {
        "sector": "REGIONAL TRANSPORT",
        "name": "Northern Express Freight",
        "quote": "The proactive alerts are incredibly effective. We've been able to intervene in risky situations before they became serious problems.",
        "metric1": "Decrease in unaddressed critical alerts",
        "metric2": "Continuous coverage and monitoring"
      }
    }
  },
  "howItWorks": {
    "title": "Simple, Powerful, and Effective",
    "subtitle": "Implement SafeTrack in 3 simple steps and transform your operation's safety.",
    "steps": {
      "step1": {
        "title": "1. Quick Installation",
        "description": "Our devices install in minutes in any vehicle in your fleet, without complex configurations."
      },
      "step2": {
        "title": "2. 24/7 Monitoring",
        "description": "The AI analyzes driver behavior and vehicle conditions in real-time, 24 hours a day."
      },
      "step3": {
        "title": "3. Action and Optimization",
        "description": "Receive proactive alerts and use our analytics to make informed decisions and improve safety."
      }
    }
  },
  "roi": {
    "tag": "Quantifiable Value",
    "title": "Calculate Your Annual Savings",
    "subtitle": "Our clients see a tangible return on investment. Use our calculator to estimate the financial impact SafeTrack could have on your operation. Results are based on an average incident reduction of 82%.",
    "form": {
      "vehicles": "Number of vehicles in your fleet",
      "incidents": "Annual fatigue-related incidents (average)",
      "cost": "Average cost per incident ($)"
    },
    "results": {
      "title": "Estimated potential annual savings:",
      "cta": "Discuss My Results"
    }
  },
  "pricing": {
    "title": "Plans Tailored to Your Fleet",
    "subtitle": "We offer flexible solutions that adapt to the size and needs of your operation. Let's talk to find the perfect plan for you.",
    "billing": {
      "monthly": "Monthly",
      "yearly": "Yearly",
      "save": "Save 15%"
    },
    "features": {
      "detection": "AI fatigue detection",
      "inCabAlerts": "In-cab alerts",
      "basicDashboard": "Basic safety dashboard",
      "predictiveAnalysis": "Predictive risk analysis",
      "advancedReports": "Advanced reports and KPIs",
      "coaching": "Personalized driver coaching"
    },
    "plans": {
      "popular": "Most Popular",
      "customPrice": "Custom",
      "cta": "Request Demo",
      "essential": {
        "title": "Essential",
        "description": "Ideal for small fleets looking to get started with proactive safety."
      },
      "professional": {
        "title": "Professional",
        "description": "The complete solution for fleets aiming to optimize safety and efficiency."
      },
      "enterprise": {
        "title": "Enterprise",
        "description": "For large fleets with complex needs and advanced customization."
      }
    }
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "subtitle": "Find answers to the most common questions about SafeTrack.",
    "questions": {
      "q1": {
        "question": "How does AI fatigue detection work?",
        "answer": "Our system uses an in-cab camera that analyzes the driver's facial features in real-time, such as blinking, yawning frequency, and gaze direction. AI algorithms identify patterns that indicate drowsiness or distraction and trigger an alert if a risk is detected."
      },
      "q2": {
        "question": "Is the device installation complicated?",
        "answer": "No, the installation is very simple and fast. Our devices are designed to be 'plug-and-play' and can be installed by your own staff in minutes, or we can coordinate a professional installation if you prefer. No complex vehicle modifications are required."
      },
      "q3": {
        "question": "How does SafeTrack integrate with my current FMS?",
        "answer": "We offer a robust and flexible API that allows for seamless integration with most FMS on the market. This allows you to centralize all safety and operational information on a single platform, the one your team already uses."
      },
      "q4": {
        "question": "What about driver privacy?",
        "answer": "Privacy is a priority for us. The system only records and stores short clips when a risk event is detected (e.g., fatigue, distraction). All data processing is done under strict security policies and compliance with data protection regulations. The purpose is exclusively for safety, not surveillance."
      }
    }
  },
  "contact": {
    "title": "Take the Shortcut to Production",
    "subtitle": "Discover how SafeTrack can transform your fleet's safety and efficiency. Our team of experts is ready to show you the power of our platform in a personalized demo.",
    "perks": {
      "perk1": "Cost-free analysis",
      "perk2": "Rapid implementation"
    },
    "form": {
      "name": "Name",
      "company": "Company",
      "email": "Email Address",
      "phone": "Phone",
      "message": "How can we help you?",
      "submit": "Send Request",
      "submitting": "Sending...",
      "success": "Thank you! We have received your request. We will contact you shortly.",
      "error": "There was an error sending the form. Please try again."
    }
  },
  "demoModal": {
    "title": "Request Your Personalized Demo",
    "subtitle": "Complete the form and one of our specialists will contact you to schedule a demo tailored to your needs.",
    "form": {
      "name": "Full Name",
      "company": "Company Name",
      "email": "Work Email Address",
      "submit": "Request My Demo",
      "submitting": "Sending...",
      "success": "Request received! Thank you for your interest. We will be in touch shortly.",
      "error": "Could not send the request. Please try again."
    }
  },
  "loginModal": {
    "title": "Login to your account",
    "welcome": "Welcome Back!",
    "subtitle": "Enter your email and password.",
    "visual": {
      "title": "Safety that never sleeps.",
      "subtitle": "Intelligent monitoring to protect every mile of your journey."
    },
    "form": {
      "email": "Email Address",
      "password": "Password",
      "forgot": "Forgot password?",
      "submit": "Sign In",
      "submitting": "Signing in...",
      "success": "Welcome back!",
      "error": "Incorrect email or password."
    },
    "forgotPassword": {
      "title": "Reset Password",
      "subtitle": "Enter your email and we will send you a reset link.",
      "submit": "Send Link",
      "submitting": "Sending...",
      "success": "Link sent! Please check your email.",
      "backToLogin": "Back to Sign In"
    },
    "signup": {
      "title": "Create your account",
      "subtitle": "Start your journey to a safer fleet.",
      "prompt": "Don't have an account?",
      "link": "Sign Up",
      "form": {
        "name": "Full name",
        "company": "Company name",
        "submit": "Create Account",
        "submitting": "Creating...",
        "success": "Account created! You can now sign in.",
        "error": "Could not create account. Please try again."
      }
    },
    "login": {
      "prompt": "Already have an account?",
      "link": "Sign In"
    }
  },
  "chatbot": {
    "welcome": "Hello! I'm the SafeTrack assistant. How can I help you today?",
    "proactive": "Questions? I'm here to help!",
    "tooltip": "AI Assistant",
    "typing": "Assistant is typing...",
    "quickReplies": {
      "whatIs": "What is SafeTrack?",
      "howItWorks": "How does it work?",
      "pricing": "View pricing"
    }
  },
  "footer": {
    "tagline": "Revolutionize Your Fleet's Safety with AI.",
    "resources": {
      "title": "Resources",
      "blog": "Blog",
      "caseStudies": "Case Studies",
      "whitepapers": "Whitepapers"
    },
    "company": {
      "title": "Company",
      "about": "About Us",
      "contact": "Contact",
      "careers": "Careers"
    },
    "legal": {
      "title": "Legal",
      "privacy": "Privacy Policy",
      "terms": "Terms & Conditions"
    },
    "copyright": "All Rights Reserved."
  }
};


const ALL_TRANSLATIONS: Record<Language, Translations> = {
  es: esTranslations,
  en: enTranslations,
};

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translations = signal<Translations>({});
  currentLang = signal<Language>('es');

  init(): void {
    const savedLang = localStorage.getItem('safetrack-lang') as Language | null;
    const initialLang = savedLang || 'es';
    this.setLanguage(initialLang);
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    localStorage.setItem('safetrack-lang', lang);
    this.loadTranslations(lang);
  }
  
  private loadTranslations(lang: Language): void {
    const translations = ALL_TRANSLATIONS[lang];
    if (translations) {
      this.translations.set(translations);
    } else {
      console.error(`Could not find bundled translations for language "${lang}"`);
      this.translations.set({});
    }
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result: any = this.translations();

    for (const k of keys) {
      if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, k)) {
        result = result[k];
      } else {
        return key; // Return the key itself if not found
      }
    }

    return typeof result === 'string' ? result : key;
  }
}
