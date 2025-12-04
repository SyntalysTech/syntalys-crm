'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaRobot, FaArrowRight, FaQuoteLeft, FaBroadcastTower, FaPlay, FaStop, FaVolumeUp, FaCalendarAlt } from 'react-icons/fa';

// Motivational quotes
const motivationalQuotesES = [
  { quote: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer" },
  { quote: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { quote: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { quote: "Cree que puedes y ya estarás a medio camino.", author: "Theodore Roosevelt" },
  { quote: "La mejor manera de predecir el futuro es crearlo.", author: "Peter Drucker" },
  { quote: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de forma más inteligente.", author: "Henry Ford" },
  { quote: "No esperes. El tiempo nunca será el adecuado.", author: "Napoleon Hill" },
  { quote: "Todo lo que siempre has querido está al otro lado del miedo.", author: "George Addair" },
  { quote: "La perseverancia no es una carrera larga; son muchas carreras cortas una tras otra.", author: "Walter Elliot" },
  { quote: "El éxito generalmente llega a quienes están demasiado ocupados para buscarlo.", author: "Henry David Thoreau" },
  { quote: "La calidad no es un acto, es un hábito.", author: "Aristóteles" },
  { quote: "Las oportunidades no ocurren. Las creas tú.", author: "Chris Grosser" },
  { quote: "El trabajo duro supera al talento cuando el talento no trabaja duro.", author: "Tim Notke" },
  { quote: "El único límite a nuestra realización del mañana serán nuestras dudas de hoy.", author: "Franklin D. Roosevelt" },
  { quote: "Los sueños no funcionan a menos que tú lo hagas.", author: "John C. Maxwell" },
];

const motivationalQuotesFR = [
  { quote: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.", author: "Albert Schweitzer" },
  { quote: "Ne comptez pas les jours, faites que les jours comptent.", author: "Muhammad Ali" },
  { quote: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
  { quote: "Croyez que vous pouvez et vous êtes déjà à mi-chemin.", author: "Theodore Roosevelt" },
  { quote: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker" },
  { quote: "L'échec est simplement l'opportunité de recommencer, cette fois plus intelligemment.", author: "Henry Ford" },
  { quote: "N'attendez pas. Le moment ne sera jamais parfait.", author: "Napoleon Hill" },
  { quote: "Tout ce que vous avez toujours voulu est de l'autre côté de la peur.", author: "George Addair" },
  { quote: "La persévérance n'est pas une longue course; ce sont plusieurs courtes courses l'une après l'autre.", author: "Walter Elliot" },
  { quote: "Le succès vient généralement à ceux qui sont trop occupés pour le chercher.", author: "Henry David Thoreau" },
  { quote: "La qualité n'est pas un acte, c'est une habitude.", author: "Aristote" },
  { quote: "Les opportunités n'arrivent pas. Vous les créez.", author: "Chris Grosser" },
  { quote: "Le travail acharné bat le talent quand le talent ne travaille pas dur.", author: "Tim Notke" },
  { quote: "La seule limite à notre réalisation de demain sera nos doutes d'aujourd'hui.", author: "Franklin D. Roosevelt" },
  { quote: "Les rêves ne fonctionnent pas à moins que vous ne le fassiez.", author: "John C. Maxwell" },
];

// Bible proverbs
const bibleProverbsES = [
  { verse: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propio entendimiento.", reference: "Proverbios 3:5" },
  { verse: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
  { verse: "El principio de la sabiduría es el temor del Señor.", reference: "Proverbios 9:10" },
  { verse: "Porque yo sé los planes que tengo para vosotros, planes de bienestar y no de calamidad.", reference: "Jeremías 29:11" },
  { verse: "Esfuérzate y sé valiente. No temas ni te desanimes, porque el Señor tu Dios estará contigo.", reference: "Josué 1:9" },
  { verse: "El que trabaja su tierra se saciará de pan, pero el que sigue a los ociosos se llenará de pobreza.", reference: "Proverbios 28:19" },
  { verse: "Entrega al Señor todo lo que haces; confía en él, y él te ayudará.", reference: "Salmos 37:5" },
  { verse: "La respuesta amable calma el enojo, pero la agresiva echa leña al fuego.", reference: "Proverbios 15:1" },
  { verse: "El corazón del hombre piensa su camino, pero el Señor endereza sus pasos.", reference: "Proverbios 16:9" },
  { verse: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora.", reference: "Eclesiastés 3:1" },
];

const bibleProverbsFR = [
  { verse: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta propre intelligence.", reference: "Proverbes 3:5" },
  { verse: "Je puis tout par celui qui me fortifie.", reference: "Philippiens 4:13" },
  { verse: "Le commencement de la sagesse, c'est la crainte de l'Éternel.", reference: "Proverbes 9:10" },
  { verse: "Car je connais les projets que j'ai formés sur vous, projets de paix et non de malheur.", reference: "Jérémie 29:11" },
  { verse: "Fortifie-toi et prends courage. Ne crains point, car l'Éternel ton Dieu est avec toi.", reference: "Josué 1:9" },
  { verse: "Celui qui cultive son champ est rassasié de pain.", reference: "Proverbes 28:19" },
  { verse: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira.", reference: "Psaumes 37:5" },
  { verse: "Une réponse douce calme la fureur, mais une parole dure excite la colère.", reference: "Proverbes 15:1" },
  { verse: "Le cœur de l'homme médite sa voie, mais c'est l'Éternel qui dirige ses pas.", reference: "Proverbes 16:9" },
  { verse: "Il y a un temps pour tout, un temps pour toute chose sous les cieux.", reference: "Ecclésiaste 3:1" },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [radioLanguage, setRadioLanguage] = useState<'es' | 'fr'>('es');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dayOfYear = useMemo(() => getDayOfYear(), []);

  const dailyQuote = useMemo(() => {
    const quotes = language === 'fr' ? motivationalQuotesFR : motivationalQuotesES;
    return quotes[dayOfYear % quotes.length];
  }, [dayOfYear, language]);

  const dailyProverb = useMemo(() => {
    const proverbs = language === 'fr' ? bibleProverbsFR : bibleProverbsES;
    return proverbs[dayOfYear % proverbs.length];
  }, [dayOfYear, language]);

  const radioStreams = {
    es: 'https://streaming12.elitecomunicacion.es:8050/stream?type=.mp3',
    fr: 'https://direct.franceinfo.fr/live/franceinfo-midfi.mp3',
  };

  const handlePlayRadio = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = radioStreams[radioLanguage];
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error playing radio:', error);
          setIsLoading(false);
        });
    }
  };

  const handleRadioLanguageChange = (lang: 'es' | 'fr') => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
    }
    setRadioLanguage(lang);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.dashboard.welcome}, {profile?.full_name || profile?.email?.split('@')[0] || '-'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quotes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bible Proverb - First */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/images/sagrada-biblia-icon.png"
                alt="Biblia"
                width={60}
                height={60}
                className="opacity-70"
              />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.dashboard.bibleProverb}</span>
            </div>
            <blockquote className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              &ldquo;{dailyProverb.verse}&rdquo;
            </blockquote>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 text-right">
              — {dailyProverb.reference}
            </p>
          </div>

          {/* Daily Quote - Second */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaQuoteLeft className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.dashboard.dailyMotivation}</span>
            </div>
            <blockquote className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              &ldquo;{dailyQuote.quote}&rdquo;
            </blockquote>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 text-right">
              — {dailyQuote.author}
            </p>
          </div>

          {/* AI Assistant */}
          <div className="bg-syntalys-blue dark:bg-gray-950 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <FaRobot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{t.dashboard.aiAssistant}</h3>
                  <p className="text-gray-400 text-sm">{t.dashboard.aiAssistantDescription}</p>
                </div>
              </div>
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                {t.dashboard.openChat}
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Radio */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaBroadcastTower className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t.dashboard.bibleRadio}</span>
            </div>

            {/* Language selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleRadioLanguageChange('es')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  radioLanguage === 'es'
                    ? 'bg-syntalys-blue dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t.dashboard.spanish}
              </button>
              <button
                onClick={() => handleRadioLanguageChange('fr')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  radioLanguage === 'fr'
                    ? 'bg-syntalys-blue dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t.dashboard.french}
              </button>
            </div>

            {/* Play button */}
            <button
              onClick={handlePlayRadio}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-syntalys-blue dark:bg-white hover:opacity-90 dark:hover:bg-gray-100 text-white dark:text-gray-900'
              } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                  {t.dashboard.radioLoading}
                </>
              ) : isPlaying ? (
                <>
                  <FaStop className="w-4 h-4" />
                  {t.dashboard.stopRadio}
                </>
              ) : (
                <>
                  <FaPlay className="w-4 h-4" />
                  {t.dashboard.playRadio}
                </>
              )}
            </button>

            {/* Audio visualization */}
            {isPlaying && (
              <div className="mt-4 flex items-center justify-center gap-2 py-2">
                <FaVolumeUp className="w-4 h-4 text-gray-400" />
                <div className="flex items-end gap-0.5 h-5">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 12 + 6}px`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: '0.4s',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {radioLanguage === 'es' ? 'Radio Fe' : 'RCF'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {language === 'fr' ? 'Accès rapide' : 'Acceso rápido'}
              </span>
            </div>
            <div className="space-y-2">
              <Link
                href="/dashboard/leads"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">{t.nav.leads}</span>
                <FaArrowRight className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/pipeline"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">{t.nav.pipeline}</span>
                <FaArrowRight className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/clientes"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">{t.nav.clients}</span>
                <FaArrowRight className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/estadisticas"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-200">{t.nav.stats}</span>
                <FaArrowRight className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
