'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { FaRobot, FaArrowRight, FaQuoteLeft, FaBook, FaBroadcastTower, FaPlay, FaStop, FaVolumeUp } from 'react-icons/fa';

// Motivational quotes in Spanish
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
  { quote: "No tengas miedo de renunciar a lo bueno para perseguir lo grandioso.", author: "John D. Rockefeller" },
  { quote: "La única forma de hacer un trabajo excelente es amar lo que haces.", author: "Steve Jobs" },
  { quote: "Actúa como si lo que haces marca la diferencia. Lo hace.", author: "William James" },
  { quote: "El secreto de salir adelante es comenzar.", author: "Mark Twain" },
  { quote: "La calidad no es un acto, es un hábito.", author: "Aristóteles" },
  { quote: "Las oportunidades no ocurren. Las creas tú.", author: "Chris Grosser" },
  { quote: "El trabajo duro supera al talento cuando el talento no trabaja duro.", author: "Tim Notke" },
  { quote: "No te preocupes por los fracasos, preocúpate por las chances que pierdes cuando ni siquiera lo intentas.", author: "Jack Canfield" },
  { quote: "El único límite a nuestra realización del mañana serán nuestras dudas de hoy.", author: "Franklin D. Roosevelt" },
  { quote: "Los sueños no funcionan a menos que tú lo hagas.", author: "John C. Maxwell" },
  { quote: "Cada logro comienza con la decisión de intentarlo.", author: "John F. Kennedy" },
  { quote: "El optimismo es la fe que conduce al logro.", author: "Helen Keller" },
  { quote: "Tu tiempo es limitado, no lo desperdicies viviendo la vida de otra persona.", author: "Steve Jobs" },
  { quote: "Haz hoy lo que otros no harán, para que mañana puedas hacer lo que otros no pueden.", author: "Jerry Rice" },
  { quote: "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje de continuar.", author: "Winston Churchill" },
  { quote: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
  { quote: "No hay atajos para ningún lugar que valga la pena.", author: "Beverly Sills" },
  { quote: "Convierte tus heridas en sabiduría.", author: "Oprah Winfrey" },
  { quote: "La excelencia no es un acto, sino un hábito.", author: "Aristóteles" },
  { quote: "Nunca es demasiado tarde para ser lo que podrías haber sido.", author: "George Eliot" },
  { quote: "El único imposible es aquel que no intentas.", author: "Anónimo" },
];

// Motivational quotes in French
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
  { quote: "N'ayez pas peur de renoncer au bien pour poursuivre le grand.", author: "John D. Rockefeller" },
  { quote: "La seule façon de faire un excellent travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
  { quote: "Agissez comme si ce que vous faites fait une différence. C'est le cas.", author: "William James" },
  { quote: "Le secret pour avancer est de commencer.", author: "Mark Twain" },
  { quote: "La qualité n'est pas un acte, c'est une habitude.", author: "Aristote" },
  { quote: "Les opportunités n'arrivent pas. Vous les créez.", author: "Chris Grosser" },
  { quote: "Le travail acharné bat le talent quand le talent ne travaille pas dur.", author: "Tim Notke" },
  { quote: "Ne vous inquiétez pas des échecs, inquiétez-vous des chances que vous manquez quand vous n'essayez même pas.", author: "Jack Canfield" },
  { quote: "La seule limite à notre réalisation de demain sera nos doutes d'aujourd'hui.", author: "Franklin D. Roosevelt" },
  { quote: "Les rêves ne fonctionnent pas à moins que vous ne le fassiez.", author: "John C. Maxwell" },
  { quote: "Chaque accomplissement commence par la décision d'essayer.", author: "John F. Kennedy" },
  { quote: "L'optimisme est la foi qui mène à l'accomplissement.", author: "Helen Keller" },
  { quote: "Votre temps est limité, ne le gaspillez pas à vivre la vie de quelqu'un d'autre.", author: "Steve Jobs" },
  { quote: "Faites aujourd'hui ce que les autres ne feront pas, pour que demain vous puissiez faire ce que les autres ne peuvent pas.", author: "Jerry Rice" },
  { quote: "Le succès n'est pas définitif, l'échec n'est pas fatal: ce qui compte c'est le courage de continuer.", author: "Winston Churchill" },
  { quote: "La discipline est le pont entre les objectifs et les réalisations.", author: "Jim Rohn" },
  { quote: "Il n'y a pas de raccourcis vers un endroit qui en vaut la peine.", author: "Beverly Sills" },
  { quote: "Transformez vos blessures en sagesse.", author: "Oprah Winfrey" },
  { quote: "L'excellence n'est pas un acte, mais une habitude.", author: "Aristote" },
  { quote: "Il n'est jamais trop tard pour être ce que vous auriez pu être.", author: "George Eliot" },
  { quote: "Le seul impossible est celui que vous n'essayez pas.", author: "Anonyme" },
];

// Bible proverbs in Spanish
const bibleProverbsES = [
  { verse: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propio entendimiento.", reference: "Proverbios 3:5" },
  { verse: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
  { verse: "El principio de la sabiduría es el temor del Señor.", reference: "Proverbios 9:10" },
  { verse: "Porque yo sé los planes que tengo para vosotros, planes de bienestar y no de calamidad.", reference: "Jeremías 29:11" },
  { verse: "Esfuérzate y sé valiente. No temas ni te desanimes, porque el Señor tu Dios estará contigo.", reference: "Josué 1:9" },
  { verse: "El que trabaja su tierra se saciará de pan, pero el que sigue a los ociosos se llenará de pobreza.", reference: "Proverbios 28:19" },
  { verse: "Más vale sabiduría que piedras preciosas, y nada que puedas desear se compara con ella.", reference: "Proverbios 8:11" },
  { verse: "Entrega al Señor todo lo que haces; confía en él, y él te ayudará.", reference: "Salmos 37:5" },
  { verse: "Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.", reference: "Proverbios 22:6" },
  { verse: "La respuesta amable calma el enojo, pero la agresiva echa leña al fuego.", reference: "Proverbios 15:1" },
  { verse: "El que guarda su boca guarda su alma; el que mucho abre sus labios tendrá calamidad.", reference: "Proverbios 13:3" },
  { verse: "Mejor es lo poco con el temor del Señor, que el gran tesoro donde hay turbación.", reference: "Proverbios 15:16" },
  { verse: "El hierro con hierro se aguza, y el hombre con el hombre.", reference: "Proverbios 27:17" },
  { verse: "El corazón del hombre piensa su camino, pero el Señor endereza sus pasos.", reference: "Proverbios 16:9" },
  { verse: "Mejor es el fin del negocio que su principio; mejor es el sufrido de espíritu que el altivo.", reference: "Eclesiastés 7:8" },
  { verse: "Echa tu pan sobre las aguas, porque después de muchos días lo hallarás.", reference: "Eclesiastés 11:1" },
  { verse: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora.", reference: "Eclesiastés 3:1" },
  { verse: "El que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.", reference: "Filipenses 1:6" },
  { verse: "No te dejes vencer por el mal, sino vence el mal con el bien.", reference: "Romanos 12:21" },
  { verse: "Bienaventurado el varón que no anduvo en consejo de malos.", reference: "Salmos 1:1" },
  { verse: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.", reference: "Salmos 119:105" },
  { verse: "Si carecen de sabiduría, pídansela a nuestro generoso Dios, y él se la dará.", reference: "Santiago 1:5" },
  { verse: "El perezoso desea, y nada alcanza; pero el alma de los diligentes será satisfecha.", reference: "Proverbios 13:4" },
  { verse: "El que mucho habla, mucho yerra; el que frena su lengua es prudente.", reference: "Proverbios 10:19" },
  { verse: "Donde no hay dirección sabia, caerá el pueblo; mas en la multitud de consejeros hay seguridad.", reference: "Proverbios 11:14" },
  { verse: "Dad, y se os dará; medida buena, apretada, remecida y rebosando.", reference: "Lucas 6:38" },
  { verse: "El que halla esposa halla el bien, y alcanza la benevolencia del Señor.", reference: "Proverbios 18:22" },
  { verse: "Mejor es adquirir sabiduría que oro preciado; adquirir inteligencia vale más que la plata.", reference: "Proverbios 16:16" },
  { verse: "El justo caerá siete veces y volverá a levantarse; los malvados tropezarán en la desgracia.", reference: "Proverbios 24:16" },
  { verse: "La ansiedad en el corazón del hombre lo deprime, pero la buena palabra lo alegra.", reference: "Proverbios 12:25" },
  { verse: "El que perdona la ofensa cultiva el amor; el que insiste en la ofensa divide a los amigos.", reference: "Proverbios 17:9" },
];

// Bible proverbs in French
const bibleProverbsFR = [
  { verse: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta propre intelligence.", reference: "Proverbes 3:5" },
  { verse: "Je puis tout par celui qui me fortifie.", reference: "Philippiens 4:13" },
  { verse: "Le commencement de la sagesse, c'est la crainte de l'Éternel.", reference: "Proverbes 9:10" },
  { verse: "Car je connais les projets que j'ai formés sur vous, projets de paix et non de malheur.", reference: "Jérémie 29:11" },
  { verse: "Fortifie-toi et prends courage. Ne crains point, car l'Éternel ton Dieu est avec toi.", reference: "Josué 1:9" },
  { verse: "Celui qui cultive son champ est rassasié de pain, mais celui qui poursuit des choses vaines est dénué de sens.", reference: "Proverbes 28:19" },
  { verse: "Car la sagesse vaut mieux que les perles, et tout ce qu'on peut désirer ne l'égale pas.", reference: "Proverbes 8:11" },
  { verse: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira.", reference: "Psaumes 37:5" },
  { verse: "Instruis l'enfant selon la voie qu'il doit suivre; et quand il sera vieux, il ne s'en détournera pas.", reference: "Proverbes 22:6" },
  { verse: "Une réponse douce calme la fureur, mais une parole dure excite la colère.", reference: "Proverbes 15:1" },
  { verse: "Celui qui veille sur sa bouche garde son âme; celui qui ouvre de grandes lèvres court à sa perte.", reference: "Proverbes 13:3" },
  { verse: "Mieux vaut peu, avec la crainte de l'Éternel, qu'un grand trésor avec le trouble.", reference: "Proverbes 15:16" },
  { verse: "Comme le fer aiguise le fer, ainsi un homme excite la colère d'un homme.", reference: "Proverbes 27:17" },
  { verse: "Le cœur de l'homme médite sa voie, mais c'est l'Éternel qui dirige ses pas.", reference: "Proverbes 16:9" },
  { verse: "Mieux vaut la fin d'une chose que son commencement; mieux vaut un esprit patient qu'un esprit hautain.", reference: "Ecclésiaste 7:8" },
  { verse: "Jette ton pain sur la face des eaux, car avec le temps tu le retrouveras.", reference: "Ecclésiaste 11:1" },
  { verse: "Il y a un temps pour tout, un temps pour toute chose sous les cieux.", reference: "Ecclésiaste 3:1" },
  { verse: "Celui qui a commencé en vous cette bonne œuvre la rendra parfaite pour le jour de Jésus-Christ.", reference: "Philippiens 1:6" },
  { verse: "Ne te laisse pas vaincre par le mal, mais surmonte le mal par le bien.", reference: "Romains 12:21" },
  { verse: "Heureux l'homme qui ne marche pas selon le conseil des méchants.", reference: "Psaumes 1:1" },
  { verse: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", reference: "Psaumes 119:105" },
  { verse: "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu, qui donne à tous simplement.", reference: "Jacques 1:5" },
  { verse: "L'âme du paresseux a des désirs qu'il ne peut satisfaire; mais l'âme des hommes diligents sera rassasiée.", reference: "Proverbes 13:4" },
  { verse: "Celui qui parle beaucoup ne manque pas de pécher, mais celui qui retient ses lèvres est un homme prudent.", reference: "Proverbes 10:19" },
  { verse: "Quand il n'y a pas de direction, le peuple tombe; et le salut est dans le grand nombre des conseillers.", reference: "Proverbes 11:14" },
  { verse: "Donnez, et il vous sera donné: on versera dans votre sein une bonne mesure.", reference: "Luc 6:38" },
  { verse: "Celui qui trouve une femme trouve le bonheur; c'est une grâce qu'il obtient de l'Éternel.", reference: "Proverbes 18:22" },
  { verse: "Acquérir la sagesse vaut mieux que l'or, acquérir l'intelligence est préférable à l'argent.", reference: "Proverbes 16:16" },
  { verse: "Car sept fois le juste tombe, et il se relève, mais les méchants sont précipités dans le malheur.", reference: "Proverbes 24:16" },
  { verse: "L'inquiétude dans le cœur de l'homme l'abat, mais une bonne parole le réjouit.", reference: "Proverbes 12:25" },
  { verse: "Celui qui couvre une faute cherche l'amour, et celui qui la rappelle dans ses discours divise les amis.", reference: "Proverbes 17:9" },
];

// Get a deterministic quote/proverb based on the day of the year
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

  // Get daily content based on day of year
  const dayOfYear = useMemo(() => getDayOfYear(), []);

  const dailyQuote = useMemo(() => {
    const quotes = language === 'fr' ? motivationalQuotesFR : motivationalQuotesES;
    return quotes[dayOfYear % quotes.length];
  }, [dayOfYear, language]);

  const dailyProverb = useMemo(() => {
    const proverbs = language === 'fr' ? bibleProverbsFR : bibleProverbsES;
    return proverbs[dayOfYear % proverbs.length];
  }, [dayOfYear, language]);

  // Bible radio streams - with preaching/teaching content
  const radioStreams = {
    es: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOFETV.mp3', // Radio Fe y Esperanza (predicaciones)
    fr: 'https://radio.rcf.fr/rcf-national.mp3', // RCF (Radio Chrétienne Francophone - enseignements)
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

  // Cleanup audio on unmount
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
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.dashboard.welcome}, {profile?.full_name || profile?.email || '-'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.dashboard.connectedAs}{' '}
          <span className="font-semibold text-syntalys-blue dark:text-blue-400">
            {profile?.role === 'super_admin' && t.dashboard.superAdmin}
            {profile?.role === 'admin' && t.dashboard.admin}
            {profile?.role === 'gestor' && t.dashboard.manager}
            {profile?.role === 'empleado' && t.dashboard.employee}
          </span>
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Motivation Quote */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl shadow-sm border border-amber-200 dark:border-amber-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-500 p-2 rounded-lg text-white">
              <FaQuoteLeft className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">{t.dashboard.dailyMotivation}</h2>
          </div>
          <blockquote className="text-lg text-amber-900 dark:text-amber-100 italic mb-4">
            &ldquo;{dailyQuote.quote}&rdquo;
          </blockquote>
          <p className="text-amber-700 dark:text-amber-300 font-medium text-right">
            — {dailyQuote.author}
          </p>
        </div>

        {/* Bible Proverb */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-2 rounded-lg text-white">
              <FaBook className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-200">{t.dashboard.bibleProverb}</h2>
          </div>
          <blockquote className="text-lg text-purple-900 dark:text-purple-100 italic mb-4">
            &ldquo;{'verse' in dailyProverb ? dailyProverb.verse : ''}&rdquo;
          </blockquote>
          <p className="text-purple-700 dark:text-purple-300 font-medium text-right">
            — {dailyProverb.reference}
          </p>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bible Radio */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <FaBroadcastTower className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{t.dashboard.bibleRadio}</h2>
          </div>

          {/* Language selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleRadioLanguageChange('es')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                radioLanguage === 'es'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800'
              }`}
            >
              {t.dashboard.spanish}
            </button>
            <button
              onClick={() => handleRadioLanguageChange('fr')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                radioLanguage === 'fr'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800'
              }`}
            >
              {t.dashboard.french}
            </button>
          </div>

          {/* Play button */}
          <button
            onClick={handlePlayRadio}
            disabled={isLoading}
            className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.dashboard.radioLoading}
              </>
            ) : isPlaying ? (
              <>
                <FaStop className="w-5 h-5" />
                {t.dashboard.stopRadio}
              </>
            ) : (
              <>
                <FaPlay className="w-5 h-5" />
                {t.dashboard.playRadio}
              </>
            )}
          </button>

          {/* Audio visualization when playing */}
          {isPlaying && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <FaVolumeUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex items-end gap-1 h-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.5s',
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 ml-2">
                {radioLanguage === 'es' ? 'Radio Fe y Esperanza' : 'RCF'}
              </span>
            </div>
          )}
        </div>

        {/* AI Assistant card - compact */}
        <div className="bg-gradient-to-br from-syntalys-blue to-blue-700 rounded-xl shadow-sm p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaRobot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">{t.dashboard.aiAssistant}</h2>
                <p className="text-blue-200 text-sm">{t.dashboard.aiAssistantDescription}</p>
              </div>
            </div>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2 bg-white text-syntalys-blue px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
            >
              {t.dashboard.openChat}
              <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
