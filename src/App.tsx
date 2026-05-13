import {
  Search,
  Image as ImageIcon,
  Lightbulb,
  Code,
  MessageSquare,
  Home,
  Wrench,
  BookOpen,
  Share2,
  User,
  ChevronLeft,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, type ReactNode } from 'react';
import { getUser, oauthLogin, logout, handleAuthCallback, onAuthChange, type User as NetlifyUser, AuthError, MissingIdentityError } from '@netlify/identity';

type ViewType = 'home' | 'ai-tools' | 'iot' | 'workshop' | 'forum' | 'current-ai-tools' | 'iot-applications' | 'profile';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [user, setUser] = useState<NetlifyUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await handleAuthCallback();
        if (result?.type === 'oauth') {
          setUser(result.user ?? null);
        }
      } catch (_) {
        // no callback hash present, that's fine
      }
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (_) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    init();

    const unsubscribe = onAuthChange((_event, updatedUser) => {
      setUser(updatedUser ?? null);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = () => {
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    
    // Simple mock response or Gemini call could go here
    setTimeout(() => {
      setChatHistory([...newHistory, { role: 'ai' as const, text: '你好！我是你的學習助手。今天有什麼我可以幫你的嗎？' }]);
    }, 600);
  };

  const features = [
    { id: 'ai-tools', title: 'AI 教室', subtitle: 'AI Class', icon: <ImageIcon size={32} />, color: 'bg-purple-600', delay: 0.1 },
    { id: 'iot', title: 'IoT 教室', subtitle: 'Classroom', icon: <Lightbulb size={32} />, color: 'bg-cyan-500', delay: 0.2 },
    { id: 'workshop', title: '專題工作坊', subtitle: 'Workshop', icon: <Code size={32} />, color: 'bg-green-500', delay: 0.3 },
    { id: 'forum', title: '討論區', subtitle: 'Forum', icon: <MessageSquare size={32} />, color: 'bg-orange-500', delay: 0.4 },
  ];

  const filteredFeatures = features.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-vibrant-bg flex flex-col font-sans overflow-hidden relative">
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="flex-1 min-h-0 flex flex-col"
          >
            {/* Top Header with Gradient */}
            <header className="relative h-36 vibrant-gradient rounded-b-[3.5rem] px-6 safe-area-top text-white shadow-xl flex-shrink-0">
              <h1 className="text-lg font-extrabold text-center mb-3 drop-shadow-sm tracking-tight">智能學習助手</h1>
              
              {/* Search Bar */}
              <div className="relative group max-w-md mx-auto">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search size={14} className="text-slate-400 group-focus-within:text-vibrant-indigo transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="搜尋功能與課程..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/95 border-none rounded-full py-2 pl-12 pr-6 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-vibrant-indigo/20 transition-all shadow-lg"
                />
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 min-h-0 px-6 -mt-4 scroll-container pb-32 relative z-10">
              <div className="mb-3 pt-3">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 drop-shadow-sm">歡迎回來，學習者</h2>
                <p className="text-slate-500 font-medium text-[10px]">今天想探索什麼新知識？</p>
              </div>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {filteredFeatures.map((feature) => (
                  <FeatureCard 
                    key={feature.id}
                    title={feature.title} 
                    subtitle={feature.subtitle} 
                    icon={feature.icon} 
                    color={feature.color} 
                    delay={feature.delay}
                    onClick={() => setCurrentView(feature.id as ViewType)}
                  />
                ))}
                {filteredFeatures.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-slate-400 font-medium">
                    找不到符合 "{searchQuery}" 的內容
                  </div>
                )}
              </div>

              {/* Recommended Project */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">本月推薦專案</h2>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-card border border-white"
                >
                  <div className="aspect-[16/9] w-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://picsum.photos/seed/robotic/800/450" 
                      alt="Robotic Arm Project" 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg">如何用 AI 畫出你的機器人</h3>
                  </div>
                </motion.div>
              </section>

              {/* Learning Progress */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">我的學習進度</h2>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[32px] p-6 shadow-card border border-white flex flex-col items-center justify-center min-h-[160px]"
                >
                  <Gauge percentage={60} />
                </motion.div>
              </section>
            </main>
          </motion.div>
        ) : (
          <DetailView
            view={currentView}
            onBack={() => {
              if (currentView === 'current-ai-tools') {
                setCurrentView('ai-tools');
              } else if (currentView === 'iot-applications') {
                setCurrentView('iot');
              } else {
                setCurrentView('home');
              }
            }}
            onNavigate={(view) => setCurrentView(view)}
            user={user}
            authLoading={authLoading}
          />
        )}
      </AnimatePresence>

      {/* AI Assistant Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed right-6 bottom-24 w-14 h-14 bg-vibrant-indigo text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform ring-4 ring-white"
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-x-6 bottom-24 top-24 bg-white rounded-[32px] shadow-2xl z-[60] flex flex-col border border-slate-100 overflow-hidden"
          >
            <div className="p-5 vibrant-gradient text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="font-bold">AI 學習助手</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">在線中</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="-rotate-90" size={24} />
              </button>
            </div>

            <div className="flex-1 min-h-0 p-4 scroll-container space-y-4 bg-slate-50/50">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <div className="w-16 h-16 bg-slate-200 rounded-3xl flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">你好！我是 AI 助手。<br/>有任何關於課程或學習的問題嗎？</p>
                </div>
              )}
              {chatHistory.map((chat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-[20px] text-sm font-medium shadow-sm ${
                    chat.role === 'user' 
                      ? 'bg-vibrant-indigo text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    {chat.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="輸入訊息..." 
                className="flex-1 bg-slate-100 border-none rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-indigo/20 transition-all font-medium"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-vibrant-indigo text-white rounded-full flex items-center justify-center shadow-lg shadow-vibrant-indigo/20 active:scale-95 transition-transform"
              >
                <ChevronLeft className="rotate-180" size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bottom-nav-safe bg-white/90 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around px-2 z-50">
        <NavItem active={currentView === 'home'} icon={<Home size={24} />} label="首頁" onClick={() => setCurrentView('home')} />
        <NavItem active={currentView === 'ai-tools'} icon={<Wrench size={24} />} label="教室" onClick={() => setCurrentView('ai-tools')} />
        <NavItem active={currentView === 'workshop'} icon={<Share2 size={24} />} label="作品分享" onClick={() => setCurrentView('workshop')} />
        <NavItem active={currentView === 'forum'} icon={<MessageSquare size={24} />} label="討論" onClick={() => setCurrentView('forum')} />
        <NavItem active={currentView === 'profile'} icon={<User size={24} />} label="個人" onClick={() => setCurrentView('profile')} />
      </nav>
    </div>
  );
}

function Gauge({ percentage }: { percentage: number }) {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * Math.PI; // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center pt-6 pb-2">
      <svg
        height={radius * 1.2}
        width={radius * 2}
        className="transform"
      >
        <path
          d={`M ${stroke},${radius} A ${normalizedRadius},${normalizedRadius} 0 0 1 ${radius * 2 - stroke},${radius}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${stroke},${radius} A ${normalizedRadius},${normalizedRadius} 0 0 1 ${radius * 2 - stroke},${radius}`}
          fill="none"
          stroke="#A855F7"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-0 flex flex-col items-center">
        <span className="text-2xl font-extrabold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
}

function DetailView({ view, onBack, onNavigate, user, authLoading }: { view: ViewType, onBack: () => void, onNavigate: (view: ViewType) => void, user: NetlifyUser | null, authLoading: boolean }) {
  const configs: Record<Exclude<ViewType, 'home'>, { title: string, color: string, icon: ReactNode }> = {
    'ai-tools': { title: 'AI 教室', color: 'vibrant-gradient', icon: <ImageIcon size={24} /> },
    'iot': { title: 'IoT 教室', color: 'bg-cyan-500', icon: <Lightbulb size={24} /> },
    'workshop': { title: '專題工作坊', color: 'bg-green-500', icon: <Code size={24} /> },
    'forum': { title: '討論區', color: 'bg-orange-500', icon: <MessageSquare size={24} /> },
    'current-ai-tools': { title: '目前的 AI 工具', color: 'vibrant-gradient', icon: <Wrench size={24} /> },
    'iot-applications': { title: 'IoT 應用內容', color: 'bg-cyan-500', icon: <Lightbulb size={24} /> },
    'profile': { title: '個人中心', color: 'bg-slate-800', icon: <User size={24} /> },
  };

  const config = configs[view as keyof typeof configs];

  return (
    <motion.div
      key={view}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 min-h-0 flex flex-col bg-vibrant-bg"
    >
      <header className={`h-32 ${config.color} rounded-b-[3.5rem] px-6 safe-area-top text-white shadow-lg flex-shrink-0 relative`}>
        <button 
          onClick={onBack}
          className="absolute left-6 top-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <div className="p-2 bg-white/20 rounded-xl mb-1 backdrop-blur-sm shadow-inner">
            <div className="scale-75 origin-center">
              {config.icon}
            </div>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight drop-shadow-sm">{config.title}</h1>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-6 scroll-container pb-40">
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-card border border-white">
            <h2 className="text-xl font-bold mb-4">歡迎來到 {config.title}</h2>
            <p className="text-slate-500 leading-relaxed">
              這裡是 {config.title} 的專屬空間。
              {view === 'ai-tools' && "在這裡你可以探索 AI 的發展歷程，以及認識當前最熱門的 AI 工具！"}
              {view === 'current-ai-tools' && "探索 AI 繪圖、文字生成與開發輔助的強大線上工具。"}
              {view === 'iot' && "了解物聯網如何從概念走向現實中的廣泛應用！"}
              {view === 'iot-applications' && "了解物聯網的核心功能與五大應用領域。"}
              {view !== 'ai-tools' && view !== 'current-ai-tools' && view !== 'iot' && view !== 'iot-applications' && "我們正在準備更多精彩的內容與功能，敬請期待！"}
            </p>
          </div>
          
          {view === 'profile' ? (
            <ProfileSection user={user} authLoading={authLoading} />
          ) : view === 'workshop' ? (
            <div className="grid grid-cols-1 gap-6">
              {[
                { id: 1, title: '智慧盆栽監測器', category: 'IoT', date: '2026-05-10', image: 'https://picsum.photos/seed/plant/600/400' },
                { id: 2, title: 'AI 語音助理實作', category: 'AI', date: '2026-05-08', image: 'https://picsum.photos/seed/voice/600/400' },
                { id: 3, title: '自動避障小車', category: 'Robotics', date: '2026-05-05', image: 'https://picsum.photos/seed/car/600/400' },
              ].map((project) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-card border border-white group"
                >
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm">
                      {project.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400 font-medium">{project.date}</span>
                      <button className="text-vibrant-indigo font-black text-sm flex items-center gap-1">
                        查看詳情 <ChevronLeft className="rotate-180" size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : view === 'forum' ? (
            <div className="space-y-4">
              {[
                { title: '如何連接 ESP32 到雲端？', author: '小明', replies: 15, time: '2小時前', icon: '❓' },
                { title: '分享：我的第一個 AI 模型', author: '創作者X', replies: 32, time: '5小時前', icon: '🚀' },
                { title: '本週專題挑戰題目公告', author: '導師', replies: 4, time: '1天前', icon: '📢' },
                { title: '新手友好的 IoT 感測器推薦', author: '老手A', replies: 56, time: '2天前', icon: '🛠️' },
              ].map((topic, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-start gap-4"
                >
                  <div className="text-2xl mt-1">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 leading-tight mb-1">{topic.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      <span>{topic.author}</span>
                      <span>•</span>
                      <span>{topic.replies} 回覆</span>
                      <span>•</span>
                      <span>{topic.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <button className="w-full py-4 bg-vibrant-indigo text-white rounded-2xl font-black shadow-lg shadow-vibrant-indigo/20 mt-4 active:scale-[0.98] transition-all">
                發表新話題
              </button>
            </div>
          ) : view === 'ai-tools' ? (
            <div className="space-y-4">
              <motion.a 
                href="https://zh.wikipedia.org/zh-tw/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%E5%8F%B2"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${config.color} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}>
                  <BookOpen size={24} className="text-vibrant-indigo" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">AI 歷史沿革</h3>
                  <p className="text-sm text-slate-500 mt-1">了解人工智慧從起源到現代的發展歷程</p>
                </div>
                <div className="text-slate-300 group-hover:text-vibrant-indigo transition-colors">
                  <ChevronLeft className="rotate-180" size={20} />
                </div>
              </motion.a>

              <motion.div 
                onClick={() => onNavigate('current-ai-tools')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${config.color} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}>
                  <Wrench size={24} className="text-vibrant-indigo" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">目前的 AI 工具</h3>
                  <p className="text-sm text-slate-500 mt-1">探索好用的 AI 繪圖、文字生成與開發輔助工具</p>
                </div>
                <div className="text-slate-300 group-hover:text-vibrant-indigo transition-colors">
                  <ChevronLeft className="rotate-180" size={20} />
                </div>
              </motion.div>
            </div>
          ) : view === 'current-ai-tools' ? (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎨</span> AI 繪圖與視覺創作工具
                </h3>
                <ul className="space-y-3">
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <a href="https://learn.g2.com/best-ai-image-generators?hsLang=en" target="_blank" rel="noopener noreferrer" className="font-bold text-vibrant-indigo hover:underline flex-shrink-0">Midjourney</a>
                    <span className="text-slate-600">目前市場上商業插畫、寫實攝影風格細節最頂尖的工具。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <span className="font-bold text-slate-800 flex-shrink-0">Adobe Firefly</span>
                    <span className="text-slate-600">專業設計師首選，完美整合進 Photoshop，生成的圖像擁有合法商業授權。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <span className="font-bold text-slate-800 flex-shrink-0">MyEdit</span>
                    <span className="text-slate-600">具備中文介面的線上圖片編輯工具，非常適合初學者進行圖片修復、去背與風格轉換。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <span className="font-bold text-slate-800 flex-shrink-0">Canva AI</span>
                    <span className="text-slate-600">適合行銷人員，直接在設計排版畫布中一鍵生成圖片。</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">✍️</span> 文字生成與內容創作工具
                </h3>
                <ul className="space-y-3">
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <a href="https://www.ibest.com.tw/news-detail/2025-ai-tools/" target="_blank" rel="noopener noreferrer" className="font-bold text-vibrant-indigo hover:underline flex-shrink-0">ChatGPT</a>
                    <span className="text-slate-600">最全能的對話助理，無論是日常聊天、寫文章、寫 Email 或翻譯都表現優異。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <span className="font-bold text-slate-800 flex-shrink-0">Gemini</span>
                    <span className="text-slate-600">Google 開發的 AI 助手，可與 Gmail、Google 雲端硬碟高度連動，擅長處理即時網路資訊。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <span className="font-bold text-slate-800 flex-shrink-0">Perplexity</span>
                    <span className="text-slate-600">AI 搜尋引擎，找資料、寫報告必備，會直接附上網路資料來源與引用連結。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <a href="https://manus.im/zh-tw/blog/best-ai-text-generator" target="_blank" rel="noopener noreferrer" className="font-bold text-vibrant-indigo hover:underline flex-shrink-0">Jasper AI</a>
                    <span className="text-slate-600">專為品牌行銷、SEO 部落格與社群媒體文案設計的專業寫作工具。</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">💻</span> 開發輔助與程式編寫工具
                </h3>
                <ul className="space-y-3">
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <a href="https://manus.im/zh-tw/blog/best-ai-productivity-tools" target="_blank" rel="noopener noreferrer" className="font-bold text-vibrant-indigo hover:underline flex-shrink-0">Cursor</a>
                    <span className="text-slate-600">目前最受工程師歡迎的 AI 程式碼編輯器，能理解整個專案架構並直接幫你修改、抓 Bug。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <span className="font-bold text-slate-800 flex-shrink-0">GitHub Copilot</span>
                    <span className="text-slate-600">微軟與 GitHub 聯手推出的老牌工具，在寫程式時提供極其精準的下一行程式碼自動補全。</span>
                  </li>
                  <li className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
                    <a href="https://vofoxsolutions.com/10-best-ai-coding-assistant-tools-in-2026" target="_blank" rel="noopener noreferrer" className="font-bold text-vibrant-indigo hover:underline flex-shrink-0">Claude Code</a>
                    <span className="text-slate-600">擅長複雜的端到端（End-to-End）工作流程分析與測試輔助。</span>
                  </li>
                </ul>
              </section>
            </div>
          ) : view === 'iot-applications' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <p className="text-slate-700 leading-relaxed text-lg mb-6">
                  <span className="font-bold">物聯網（IoT）</span>的核心功能是<span className="bg-cyan-100/50 px-1 font-bold text-slate-800">讓所有日常物品連上網路，不需人為介入即可自動收集數據、互相通訊並執行任務</span>。
                </p>
                <p className="text-slate-600 mb-6 font-medium">
                  它將現實世界數位化，主要可以做到以下五大領域的應用：
                </p>
                
                <div className="space-y-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl"
                  >
                    <span className="text-3xl">🏠</span>
                    <h3 className="text-lg font-bold text-slate-800">智慧家庭 <span className="text-slate-500 font-medium text-base ml-1">(Smart Home)</span></h3>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl"
                  >
                    <span className="text-3xl">🏭</span>
                    <h3 className="text-lg font-bold text-slate-800">工業與供應鏈 <span className="text-slate-500 font-medium text-base ml-1">(IIoT)</span></h3>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl"
                  >
                    <span className="text-3xl">🩺</span>
                    <h3 className="text-lg font-bold text-slate-800">智慧醫療與健康 <span className="text-slate-500 font-medium text-base ml-1">(Smart Healthcare)</span></h3>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl"
                  >
                    <span className="text-3xl">🏙️</span>
                    <h3 className="text-lg font-bold text-slate-800">智慧城市 <span className="text-slate-500 font-medium text-base ml-1">(Smart City)</span></h3>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl"
                  >
                    <span className="text-3xl">🌾</span>
                    <h3 className="text-lg font-bold text-slate-800">智慧農業 <span className="text-slate-500 font-medium text-base ml-1">(Smart Agriculture)</span></h3>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : view === 'iot' ? (
            <div className="space-y-4">
              <motion.div 
                onClick={() => onNavigate('iot-applications')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl border border-cyan-100 bg-cyan-50 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cyan-600`}>
                  <Lightbulb size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">IoT 應用內容</h3>
                  <p className="text-sm text-slate-500 mt-1">物聯網核心功能與五大應用領域</p>
                </div>
                <div className="text-slate-300 group-hover:text-cyan-500 transition-colors">
                  <ChevronLeft className="rotate-180" size={20} />
                </div>
              </motion.div>
              <motion.a 
                href="https://zh.wikipedia.org/zh-tw/%E7%89%A9%E8%81%94%E7%BD%91"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl border border-cyan-100 bg-cyan-50 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cyan-600`}>
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">IoT 沿革</h3>
                  <p className="text-sm text-slate-500 mt-1">前往維基百科了解物聯網的歷史發展</p>
                </div>
                <div className="text-slate-300 group-hover:text-cyan-500 transition-colors">
                  <ChevronLeft className="rotate-180" size={20} />
                </div>
              </motion.a>
              {[3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl border border-slate-100 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-500`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">最新推薦項目 {i}</h3>
                    <p className="text-xs text-slate-400">發布日期：2026-05-12</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-vibrant-indigo transition-colors">
                    <ChevronLeft className="rotate-180" size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl border border-slate-100 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-500`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">最新推薦項目 {i}</h3>
                    <p className="text-xs text-slate-400">發布日期：2026-05-12</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-vibrant-indigo transition-colors">
                    <ChevronLeft className="rotate-180" size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}

function ProfileSection({ user, authLoading }: { user: NetlifyUser | null; authLoading: boolean }) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleGoogleLogin = () => {
    setAuthError(null);
    try {
      oauthLogin('google');
    } catch (err) {
      if (err instanceof MissingIdentityError) {
        setAuthError('身份驗證服務未啟用，請聯絡管理員。');
      } else if (err instanceof AuthError) {
        setAuthError(err.message);
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (_) {
      // ignore
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-vibrant-indigo/20 border-t-vibrant-indigo rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-[32px] p-8 shadow-card border border-white flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6 ring-4 ring-slate-50">
            <User size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">登入以查看個人檔案</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            使用 Google 帳號登入，記錄你的學習進度與成就。
          </p>

          {authError && (
            <div className="w-full mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-medium">
              {authError}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-2xl py-4 px-6 font-bold text-slate-700 hover:border-vibrant-indigo hover:text-vibrant-indigo transition-all shadow-sm active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            使用 Google 帳號登入
          </button>

          <p className="mt-4 text-[10px] text-slate-400 leading-relaxed px-4">
            登入即表示你同意我們的服務條款與隱私政策。請使用系統瀏覽器開啟本頁面以完成 Google 登入。
          </p>
        </div>
      </motion.div>
    );
  }

  const displayName = (user.userMetadata?.full_name as string | undefined) ?? user.email ?? '學習者';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = user.userMetadata?.avatar_url as string | undefined;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-6 shadow-card border border-white flex flex-col items-center"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover shadow-lg mb-4 ring-4 ring-vibrant-indigo/10"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-vibrant-indigo flex items-center justify-center text-white text-4xl font-black shadow-lg mb-4 ring-4 ring-vibrant-indigo/10">
            {avatarLetter}
          </div>
        )}
        <h3 className="text-xl font-black text-slate-800">{displayName}</h3>
        <p className="text-slate-400 text-sm">{user.email}</p>

        <div className="grid grid-cols-3 w-full gap-4 mt-8">
          <div className="text-center">
            <p className="text-2xl font-black text-vibrant-indigo">12</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">已完成</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-2xl font-black text-vibrant-orange">850</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">積分</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-500">5</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">徽章</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        <h4 className="px-2 text-sm font-black text-slate-400 uppercase tracking-widest">我的學習</h4>
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100">
          <div className="p-4 flex items-center gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
            <BookOpen size={20} className="text-vibrant-indigo" />
            <span className="flex-1 font-bold text-slate-700">正在進行的課程</span>
            <span className="bg-vibrant-indigo text-white text-[10px] px-2 py-0.5 rounded-full font-black">2</span>
          </div>
          <div className="p-4 flex items-center gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
            <Code size={20} className="text-green-500" />
            <span className="flex-1 font-bold text-slate-700">我的作品集</span>
          </div>
          <div className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <Share2 size={20} className="text-vibrant-orange" />
            <span className="flex-1 font-bold text-slate-700">收藏的專案</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="px-2 text-sm font-black text-slate-400 uppercase tracking-widest">設定與支援</h4>
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100">
          <div className="p-4 flex items-center gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
            <Wrench size={20} className="text-slate-400" />
            <span className="flex-1 font-bold text-slate-700">帳號設定</span>
          </div>
          <div className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <MessageSquare size={20} className="text-slate-400" />
            <span className="flex-1 font-bold text-slate-700">聯絡我們</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors active:scale-[0.98] disabled:opacity-50"
      >
        <LogOut size={18} />
        {isLoggingOut ? '登出中...' : '登出'}
      </button>
    </div>
  );
}

function FeatureCard({ title, subtitle, icon, color, delay, onClick }: { 
  title: string; 
  subtitle: string; 
  icon: ReactNode; 
  color: string; 
  delay: number; 
  onClick: () => void;
  key?: string | number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`${color} rounded-[32px] p-5 text-white shadow-card border border-white flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all active:scale-[0.98] duration-300`}
    >
      <div className="z-10">
        <h3 className="font-bold text-xl leading-tight tracking-tight">{title}</h3>
        <p className="text-white/80 text-sm mt-0.5 font-medium">{subtitle}</p>
      </div>
      <div className="absolute bottom-4 right-4 z-10 text-white/90 group-hover:scale-110 transition-all duration-500 bg-white/10 p-2 rounded-xl backdrop-blur-sm shadow-inner">
        {icon}
      </div>
      
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
    </motion.div>
  );
}

function NavItem({ icon, label, onClick, active = false }: { icon: ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 py-2 px-3 rounded-2xl transition-all ${active ? 'text-vibrant-orange bg-orange-50' : 'text-slate-400 hover:text-vibrant-indigo'}`}
    >
      <div className={`${active ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold leading-none">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="w-1.5 h-1.5 bg-vibrant-orange rounded-full mt-1" 
        />
      )}
    </button>
  );
}
