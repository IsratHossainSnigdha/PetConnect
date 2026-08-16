import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  MessageSquare, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  ChevronDown, 
  Heart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Calendar, 
  PawPrint, 
  Send
} from 'lucide-react';

export default function AdopterDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#7A3E23] text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-[#8E4D30]">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">Paw Rescue</h1>
              <p className="text-xs text-[#EAD5CE] mt-1">Adoption Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white/15 text-white' : 'text-[#EAD5CE] hover:bg-white/10 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('browse')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'browse' ? 'bg-white/15 text-white' : 'text-[#EAD5CE] hover:bg-white/10 hover:text-white'}`}
            >
              <Search className="w-5 h-5" />
              Browse Pets
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'applications' ? 'bg-white/15 text-white' : 'text-[#EAD5CE] hover:bg-white/10 hover:text-white'}`}
            >
              <FileText className="w-5 h-5" />
              My Applications
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-white/15 text-white' : 'text-[#EAD5CE] hover:bg-white/10 hover:text-white'}`}
            >
              <MessageSquare className="w-5 h-5" />
              Messages
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-white/15 text-white' : 'text-[#EAD5CE] hover:bg-white/10 hover:text-white'}`}
            >
              <User className="w-5 h-5" />
              My Profile
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white/15 text-white' : 'text-[#EAD5CE] hover:bg-white/10 hover:text-white'}`}
            >
              <SettingsIcon className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#8E4D30]">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#EAD5CE] hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, Sarah! 🐾
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Find your new best friend and change a life.</p>
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  3
                </span>
              </button>
            </div>

            {/* User Profile Pill */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Sarah Ahmed" 
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Sarah Ahmed</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Adopter</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Top Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* 1. Applications */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600 shrink-0">
                <PawPrint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">12</h3>
                <p className="text-xs text-slate-500 font-medium">Applications</p>
                <button className="text-[11px] text-[#7A3E23] font-semibold hover:underline mt-0.5">View all</button>
              </div>
            </div>

            {/* 2. Pending Review */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">5</h3>
                <p className="text-xs text-slate-500 font-medium">Pending Review</p>
                <button className="text-[11px] text-[#7A3E23] font-semibold hover:underline mt-0.5">View details</button>
              </div>
            </div>

            {/* 3. Approved */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">3</h3>
                <p className="text-xs text-slate-500 font-medium">Approved</p>
                <button className="text-[11px] text-[#7A3E23] font-semibold hover:underline mt-0.5">View details</button>
              </div>
            </div>

            {/* 4. Rejected */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-xl text-red-500 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">2</h3>
                <p className="text-xs text-slate-500 font-medium">Rejected</p>
                <button className="text-[11px] text-[#7A3E23] font-semibold hover:underline mt-0.5">View details</button>
              </div>
            </div>

            {/* 5. Favorites */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 col-span-2 md:col-span-1">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">8</h3>
                <p className="text-xs text-slate-500 font-medium">Favorites</p>
                <button className="text-[11px] text-[#7A3E23] font-semibold hover:underline mt-0.5">View favorites</button>
              </div>
            </div>

          </div>

          {/* Section 2: Recent Applications & Recommended Pets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Recent Applications */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Recent Applications</h3>
                  <button className="px-3 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors">
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80" alt="Bella" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Bella</p>
                        <p className="text-xs text-slate-500">Dog • Golden Retriever</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
                        Pending Review
                      </span>
                      <span className="text-xs text-slate-400 font-medium">May 15, 2025</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&auto=format&fit=crop&q=80" alt="Luna" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Luna</p>
                        <p className="text-xs text-slate-500">Cat • Domestic Shorthair</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        Approved
                      </span>
                      <span className="text-xs text-slate-400 font-medium">May 10, 2025</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&auto=format&fit=crop&q=80" alt="Max" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Max</p>
                        <p className="text-xs text-slate-500">Dog • German Shepherd</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
                        Pending Review
                      </span>
                      <span className="text-xs text-slate-400 font-medium">May 8, 2025</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=100&auto=format&fit=crop&q=80" alt="Charlie" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Charlie</p>
                        <p className="text-xs text-slate-500">Dog • Beagle</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold">
                        Rejected
                      </span>
                      <span className="text-xs text-slate-400 font-medium">May 5, 2025</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&auto=format&fit=crop&q=80" alt="Milo" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Milo</p>
                        <p className="text-xs text-slate-500">Cat • Maine Coon</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        Approved
                      </span>
                      <span className="text-xs text-slate-400 font-medium">May 2, 2025</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                  View All Applications
                </button>
              </div>
            </div>

            {/* Recommended Pets for You */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Recommended Pets for You</h3>
                  <button className="px-3 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors">
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pet 1 */}
                  <div className="border border-slate-200 rounded-2xl p-3 flex flex-col justify-between">
                    <div>
                      <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80" alt="Buddy" className="w-full h-32 rounded-xl object-cover mb-3" />
                      <h4 className="font-bold text-slate-900 text-sm">Buddy</h4>
                      <p className="text-[11px] text-slate-500">Dog • Labrador Retriever</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">2 years old • Male</p>
                    </div>
                    <button className="w-full mt-3 py-1.5 border border-[#7A3E23] text-[#7A3E23] hover:bg-[#7A3E23] hover:text-white rounded-lg text-xs font-semibold transition-colors">
                      View Profile
                    </button>
                  </div>

                  {/* Pet 2 */}
                  <div className="border border-slate-200 rounded-2xl p-3 flex flex-col justify-between">
                    <div>
                      <img src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=300&auto=format&fit=crop&q=80" alt="Whiskers" className="w-full h-32 rounded-xl object-cover mb-3" />
                      <h4 className="font-bold text-slate-900 text-sm">Whiskers</h4>
                      <p className="text-[11px] text-slate-500">Cat • Domestic Shorthair</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">1 year old • Female</p>
                    </div>
                    <button className="w-full mt-3 py-1.5 border border-[#7A3E23] text-[#7A3E23] hover:bg-[#7A3E23] hover:text-white rounded-lg text-xs font-semibold transition-colors">
                      View Profile
                    </button>
                  </div>

                  {/* Pet 3 */}
                  <div className="border border-slate-200 rounded-2xl p-3 flex flex-col justify-between">
                    <div>
                      <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80" alt="Rocky" className="w-full h-32 rounded-xl object-cover mb-3" />
                      <h4 className="font-bold text-slate-900 text-sm">Rocky</h4>
                      <p className="text-[11px] text-slate-500">Dog • Mixed Breed</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">3 years old • Male</p>
                    </div>
                    <button className="w-full mt-3 py-1.5 border border-[#7A3E23] text-[#7A3E23] hover:bg-[#7A3E23] hover:text-white rounded-lg text-xs font-semibold transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center items-center gap-1.5 pt-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A3E23]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              </div>
            </div>

          </div>

          {/* Section 3: Upcoming Appointments & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Upcoming Appointments */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Upcoming Appointments</h3>
                  <button className="px-3 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors">
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">May 20, 2025 • 11:00 AM</p>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">Meet & Greet with Bella</p>
                        <p className="text-[11px] text-slate-400">Paw Rescue Shelter</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                      Upcoming
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">May 25, 2025 • 02:00 PM</p>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">Home Visit for Luna</p>
                        <p className="text-[11px] text-slate-400">Your Home</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base pb-4 border-b border-slate-100 mb-4">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-purple-50/60 hover:bg-purple-50 border border-purple-100 rounded-2xl text-center flex flex-col items-center justify-center transition-colors">
                  <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 mb-2">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Browse Pets</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Find your perfect companion</p>
                </button>

                <button className="p-4 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-2xl text-center flex flex-col items-center justify-center transition-colors">
                  <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">New Application</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Apply to adopt a pet</p>
                </button>

                <button className="p-4 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 rounded-2xl text-center flex flex-col items-center justify-center transition-colors">
                  <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 mb-2">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Message Shelter</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contact shelter staff</p>
                </button>

                <button className="p-4 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-2xl text-center flex flex-col items-center justify-center transition-colors">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 mb-2">
                    <Heart className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">View Favorites</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">See your saved pets</p>
                </button>
              </div>
            </div>

          </div>

          {/* Section 4: Adoption Process Horizontal Steps */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-6">Adoption Process</h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center shrink-0 border border-purple-100">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Browse Pets</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Find a pet you love</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0 border border-amber-100">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Submit Application</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fill out and submit application</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-100">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Review Process</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Shelter reviews your application</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-100">
                  4
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Meet & Greet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Meet the pet and get to know them</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 font-bold text-sm flex items-center justify-center shrink-0 border border-red-100">
                  5
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Adoption</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Take your new friend home!</p>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}