import Link from 'next/link';
import { Camera, Map, Database, Shield, HardDrive, Sparkles, ArrowRight, Activity, Globe, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-asphalt text-white selection:bg-safety-yellow selection:text-asphalt">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-safety-yellow blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-safety-yellow animate-pulse" />
              <span className="text-sm font-mono text-gray-300 tracking-wider">ETHGlobal Buenos Aires 2025</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Pothole <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-yellow to-yellow-600">Patrol</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              The first DePIN for autonomous infrastructure monitoring. Verified by <span className="text-white font-bold">World ID</span>, anchored on <span className="text-white font-bold">Filecoin</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link
                href="/dashcam"
                className="group px-8 py-5 bg-safety-yellow text-asphalt rounded-xl font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,214,0,0.3)]"
              >
                <Camera className="w-6 h-6" />
                LAUNCH DASHCAM
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/portal"
                className="px-8 py-5 bg-concrete text-white rounded-xl font-bold text-lg hover:bg-gray-700 hover:scale-105 transition-all border border-white/10 flex items-center gap-3"
              >
                <Map className="w-6 h-6 text-gray-400" />
                OPEN DATA MAP
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-concrete border border-white/5 rounded-3xl p-8 hover:border-safety-yellow/30 transition-colors group">
            <div className="w-14 h-14 bg-asphalt rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-safety-yellow/50 transition-colors">
              <Cpu className="w-7 h-7 text-safety-yellow" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Edge AI Inference</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Running YOLOv8n directly in the browser via WASM. Real-time detection without sending video streams to a centralized server.
            </p>
            <div className="flex items-center gap-2 text-sm font-mono text-gray-500 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-green-500" />
              <span>On-Device Processing</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-concrete border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group">
            <div className="w-14 h-14 bg-asphalt rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-blue-500/50 transition-colors">
              <Shield className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Sybil Resistance</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Every report is cryptographically signed by a unique human using World ID. One person, one vote, zero bots.
            </p>
            <div className="flex items-center gap-2 text-sm font-mono text-gray-500 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>World ID Integrated</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-concrete border border-white/5 rounded-3xl p-8 hover:border-green-500/30 transition-colors group">
            <div className="w-14 h-14 bg-asphalt rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-green-500/50 transition-colors">
              <Database className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Permanent Storage</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Verified reports are anchored on Filecoin via Lighthouse. Creating an immutable, censorship-resistant history.
            </p>
            <div className="flex items-center gap-2 text-sm font-mono text-gray-500 uppercase tracking-wider">
              <HardDrive className="w-4 h-4 text-green-500" />
              <span>IPFS / Filecoin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-white/5 bg-concrete/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono">100<span className="text-safety-yellow">%</span></div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Verified Human</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono">20<span className="text-blue-500">ms</span></div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Inference Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono">∞</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Data Retention</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono">0<span className="text-green-500">$</span></div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Cost to Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600">
        <p className="flex items-center justify-center gap-2">
          Built with <span className="text-red-500">❤</span> for ETHGlobal Buenos Aires
        </p>
      </footer>
    </div>
  );
}