/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ChatInterface from "./components/ChatInterface";
import { MessageSquare, Briefcase, Settings, HelpCircle, User as UserIcon } from "lucide-react";

export default function App() {
  return (
    <div className="flex h-screen w-full bg-clean-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="clean-sidebar hidden lg:flex">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-6 h-6 border-2 border-clean-accent rounded-full" />
          <span className="text-xl font-semibold tracking-tight text-clean-text">Aether AI</span>
        </div>

        <nav className="flex-1 space-y-8">
          <div>
            <div className="text-[11px] font-bold uppercase text-clean-muted mb-3 flex items-center gap-2">
              <MessageSquare size={12} /> Recent Chats
            </div>
            <div className="space-y-1">
              <a href="#" className="block py-2 text-sm text-clean-accent font-medium">Global Market Report</a>
              <a href="#" className="block py-2 text-sm text-clean-text/70 hover:text-clean-text">React Component Logic</a>
              <a href="#" className="block py-2 text-sm text-clean-text/70 hover:text-clean-text transition-colors">Nature Poem Draft</a>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase text-clean-muted mb-3 flex items-center gap-2">
              <Briefcase size={12} /> Workspace
            </div>
            <div className="space-y-1">
              <a href="#" className="block py-2 text-sm text-clean-text/70 hover:text-clean-text transition-colors">Knowledge Base</a>
              <a href="#" className="block py-2 text-sm text-clean-text/70 hover:text-clean-text transition-colors">Saved Assets</a>
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-clean-border">
          <a href="#" className="flex items-center gap-3 py-2 text-sm text-clean-muted hover:text-clean-text transition-colors">
            <Settings size={16} /> Settings
          </a>
          <a href="#" className="flex items-center gap-3 py-2 text-sm text-clean-muted hover:text-clean-text transition-colors">
            <HelpCircle size={16} /> User Guide
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Top Bar */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-clean-border bg-clean-bg/50 backdrop-blur-md z-10 w-full">
          <div className="flex items-center gap-2 text-sm text-clean-muted">
            <div className="w-2 h-2 bg-[#34c759] rounded-full" />
            Aether v4.2 Online
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-clean-text">
            Alex Johnson
            <div className="w-8 h-8 rounded-full bg-clean-muted/20 flex items-center justify-center">
              <UserIcon size={16} />
            </div>
          </div>
        </header>

        {/* Chat Interface Container */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}


