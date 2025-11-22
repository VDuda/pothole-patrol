import Link from 'next/link';
import { Camera, Map, Database, Shield, HardDrive, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚧 Pothole Patrol
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            DePIN for Road Quality
          </p>
          <p className="text-lg text-gray-600">
            Verified by World ID • Anchored on Filecoin
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Dashcam</h3>
            <p className="text-gray-600 mb-4">
              Turn your phone into an AI-powered dashcam. YOLOv8 runs locally in your browser to detect potholes in real-time.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>Client-side WASM inference</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">World ID Verified</h3>
            <p className="text-gray-600 mb-4">
              Every report is signed by a unique human using World ID, preventing bot spam and ensuring data integrity.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Sybil-resistant verification</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Filecoin Storage</h3>
            <p className="text-gray-600 mb-4">
              Verified reports are permanently stored on Filecoin, creating an immutable record of infrastructure health.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Database className="w-4 h-4" />
              <span>Decentralized storage</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/dashcam"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Camera className="w-6 h-6" />
            Start Dashcam
          </Link>
          <Link
            href="/portal"
            className="px-8 py-4 bg-white text-gray-800 rounded-full font-bold text-lg hover:shadow-lg transition-all border-2 border-gray-200 flex items-center gap-2"
          >
            <Map className="w-6 h-6" />
            Open Data Portal
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">The Open Knowledge Graph</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Human Verified</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-gray-600">Permanent Storage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">Open</div>
              <div className="text-gray-600">Public Access</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">Free</div>
              <div className="text-gray-600">For Researchers</div>
            </div>
          </div>
        </div>

        {/* Hackathon Tracks */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-8">🏆 ETHGlobal Buenos Aires 2025</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">🆔 World: Best Mini App</h3>
              <p className="text-sm opacity-90">
                MiniKit integration with World ID verification for Sybil-resistant data collection
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">💾 Filecoin: Storage Innovation</h3>
              <p className="text-sm opacity-90">
                Lighthouse SDK for permanent, decentralized storage of verified infrastructure data
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">🧪 Protocol Labs: Open Data</h3>
              <p className="text-sm opacity-90">
                JSON-LD Knowledge Graph for scientific research and AI model training
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
