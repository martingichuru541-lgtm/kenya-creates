import { storage } from '../services/storageService';
import { proposalService } from '../services/proposalService';
import { Project, Creator, CollaborationRequest, Opportunity, CategoryInfo, InnovationProposal, ProposalStatus } from '../types';
import { COUNTIES_DATA, CATEGORIES_DATA } from '../data/seedData';
import { askKenyaCreatesAI } from '../services/geminiService';
import { InnovationHubRenderer, InnovationHubSubTab } from './innovationHubView';
import { InnovationModals } from './innovationModals';
import { InnovationList } from './innovationList';
import { ContributorInnovationDashboard } from './ContributorInnovationDashboard';

export class UIManager {
  private currentTab: string = 'home';
  private selectedCategory: string = 'all';
  private selectedCounty: string = 'all';
  private searchQuery: string = '';
  private selectedProjectId: string | null = null;
  private selectedCreatorUsername: string | null = null;
  private showSubmissionModal: boolean = false;
  private showAIModal: boolean = false;
  private showAiSettingsModal: boolean = false;
  private showNotificationsDropdown: boolean = false;
  private showUserMenuDropdown: boolean = false;
  private showMessageModal: boolean = false;
  private messageRecipientId: string | null = null;
  private showCollabApplyModal: boolean = false;
  private selectedCollabRequestId: string | null = null;
  private showPostUpdateModal: boolean = false;
  private updateProjectId: string | null = null;
  private showPledgeModal: boolean = false;
  private pledgeProjectId: string | null = null;
  private launchpadActiveTab: 'generator' | 'checklist' | 'pledges' = 'generator';
  private selectedAiProvider: 'auto' | 'gemini' | 'openai' = 'auto';
  private userOpenAiKey: string = storage.getCustomAiKey();
  private generatedStructuredIdea: any = null;

  // Innovation Hub & 50/50 Partnership State
  private innovationHubSubTab: InnovationHubSubTab = 'build';
  private selectedProposalId: string | null = null;
  private selectedAgreementProposalId: string | null = null;
  private hubChatType: 'missing_feature' | 'new_business' = 'new_business';
  private hubChatCounty: string = "Murang'a";
  private hubChatCategory: string = 'Agriculture & Food';
  private hubChatMessages: { sender: 'user' | 'ai'; text: string; time: string }[] = [];
  private hubIsGenerating: boolean = false;
  private hubGeneratedProposal: Partial<InnovationProposal> | null = null;
  private hubDuplicateNotice: { matchedTitle?: string; suggestion?: string } | null = null;
  private adminFilter: { status: string; category: string; search: string } = {
    status: 'all',
    category: 'all',
    search: '',
  };
  private contributorDashboardFilter: string = 'all';

  private submissionStep: number = 1;
  private submissionData: Partial<Project> = {
    submissionType: 'innovation',
    stage: 'prototype_dev',
    needs: ['Funding', 'Developers'],
    visibility: 'public',
  };
  private aiInput: string = '';
  private aiResponse: string = '';
  private aiLoading: boolean = false;

  private commercializationChecklist = [
    {
      id: 'step_1',
      category: 'kipi',
      title: 'KIPI Form IP 3 (Provisional Patent or Trademark)',
      description: 'Establish official Kenyan priority date before public hardware disclosure without expensive initial attorney fees.',
      status: 'in_progress',
      resourceUrl: 'https://kipi.go.ke',
    },
    {
      id: 'step_2',
      category: 'kebs',
      title: 'KEBS Standardization Mark (Standardization KS 2780/KS 05-459)',
      description: 'Submit product samples to Kenya Industrial Research and Development Institute (KIRDI) or KEBS labs for electrical/chemical compliance.',
      status: 'pending',
      resourceUrl: 'https://kebs.org',
    },
    {
      id: 'step_3',
      category: 'pilot',
      title: 'County Single Business Permit & NEMA Environmental Clearance',
      description: 'Acquire county municipal trading license and National Environment Management Authority waste disposal clearance.',
      status: 'pending',
      resourceUrl: 'https://nema.go.ke',
    },
    {
      id: 'step_4',
      category: 'funding',
      title: 'KeNIA National Innovation Registry & Commercialization Grant',
      description: 'Enroll in the Kenya National Innovation Agency pipeline for up to KSh 2.5M seed commercialization capital.',
      status: 'pending',
      resourceUrl: 'https://innovationagency.go.ke',
    },
  ];

  constructor() {
    storage.subscribe(() => {
      this.render();
    });
  }

  mount() {
    this.render();
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.selectedProjectId = null;
    this.selectedCreatorUsername = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  openProject(id: string) {
    this.selectedProjectId = id;
    storage.incrementProjectViews(id);
    this.render();
  }

  closeProject() {
    this.selectedProjectId = null;
    this.render();
  }

  openCreator(username: string) {
    this.selectedCreatorUsername = username;
    this.render();
  }

  closeCreator() {
    this.selectedCreatorUsername = null;
    this.render();
  }

  render() {
    const root = document.getElementById('root');
    if (!root) return;

    const currentUser = storage.getCurrentUser();
    const stats = storage.getLiveStatistics();
    const unreadCount = storage.getUnreadNotificationsCount(currentUser.id);

    root.innerHTML = `
      <div class="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative z-10">
        <!-- Top Banner / KenyaOne Sovereign Attribution -->
        <div class="bg-gradient-to-r from-emerald-950/90 via-neutral-950/80 to-red-950/90 backdrop-blur-xl px-4 py-1.5 text-xs font-medium border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30 text-emerald-300 shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Sovereign Innovation Exhibition
            </span>
            <span class="hidden sm:inline text-slate-300">Kenya's Home for Ideas, Inventions & In-Country Realization</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-slate-400">Powered by <strong class="text-white font-semibold">KenyaOne</strong></span>
            <button id="btnSwitchRole" class="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded-full border border-slate-700 transition" title="Switch User Role">
              Switch: ${currentUser.displayName.split(' ')[0]} (${currentUser.role})
            </button>
          </div>
        </div>

        <!-- Main Header / Navigation with Liquid Glass Styling -->
        <header class="sticky top-7 z-40 liquid-glass border-b border-white/10 transition duration-300">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <!-- Brand -->
            <div class="flex items-center gap-3 cursor-pointer group" id="navLogo">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 font-bold text-white text-lg border border-white/20 transform group-hover:scale-105 transition">
                🇰🇪
              </div>
              <div>
                <span class="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  KENYA <span class="text-emerald-400">CREATES</span>
                </span>
                <span class="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-medium">Your Ideas • Your Projects • Your Future</span>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="flex-1 max-w-md hidden md:block">
              <div class="relative">
                <input 
                  type="text" 
                  id="mainSearchInput"
                  value="${this.searchQuery}"
                  placeholder="Search innovations, creators, counties, skills..." 
                  class="w-full bg-slate-900/70 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                />
                <span class="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="flex items-center gap-2 sm:gap-3">
              <!-- AI Assistant Trigger -->
              <button id="btnOpenAI" class="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-400/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-200 transition shadow-lg shadow-purple-500/20 transform hover:-translate-y-0.5">
                <span>✨</span>
                <span>Kenya Creates AI</span>
              </button>

              <!-- Submit Project Button -->
              <button id="btnOpenSubmit" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-1.5 border border-white/10">
                <span>+</span>
                <span>Submit Project</span>
              </button>

              <!-- Notifications -->
              <div class="relative">
                <button id="btnToggleNotifications" class="relative p-2 rounded-full hover:bg-white/10 text-slate-300 transition" title="Notifications">
                  🔔
                  ${unreadCount > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">${unreadCount}</span>` : ''}
                </button>
                ${this.showNotificationsDropdown ? this.renderNotificationsDropdown() : ''}
              </div>

              <!-- User Avatar / Profile Menu -->
              <div class="relative">
                <button id="btnUserMenu" class="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition">
                  <img src="${currentUser.avatar}" alt="${currentUser.displayName}" class="w-8 h-8 rounded-full object-cover border-2 border-emerald-500/60" />
                </button>
                ${this.showUserMenuDropdown ? this.renderUserDropdown(currentUser) : ''}
              </div>
            </div>
          </div>

          <!-- Secondary Navigation Links with Liquid Glass Indicator -->
          <div class="border-t border-white/5 bg-slate-950/40 overflow-x-auto scrollbar-none">
            <div class="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 text-xs font-medium py-2">
              ${this.renderNavButton('home', '🏠 Home')}
              ${this.renderNavButton('innovation_hub', '💡 Innovation Hub')}
              ${this.renderNavButton('launchpad', '🚀 KenyaOne Launchpad')}
              ${this.renderNavButton('explore', '🔭 Explore Projects')}
              ${this.renderNavButton('ideas', '💡 Ideas & Inventions')}
              ${this.renderNavButton('startups', '🚀 Startups')}
              ${this.renderNavButton('community', '🤝 Community')}
              ${this.renderNavButton('collaborate', '👥 Find Collaborators')}
              ${this.renderNavButton('opportunities', '🎯 Opportunities')}
              ${this.renderNavButton('diaspora', '🌍 Diaspora')}
              ${this.renderNavButton('dashboard', '📊 My Dashboard')}
              ${currentUser.role === 'admin' ? this.renderNavButton('admin', '🛡️ Admin Center') : ''}
            </div>
          </div>
        </header>

        <!-- Main Content Area based on Tab -->
        <main class="flex-1 pb-20 tab-enter">
          ${this.renderCurrentView(stats)}
        </main>

        <!-- Footer -->
        ${this.renderFooter()}

        <!-- Modals -->
        ${this.selectedProjectId ? this.renderProjectDetailModal(this.selectedProjectId) : ''}
        ${this.selectedCreatorUsername ? this.renderCreatorProfileModal(this.selectedCreatorUsername) : ''}
        ${this.showSubmissionModal ? this.renderSubmissionModal() : ''}
        ${this.showAIModal ? this.renderAIModal() : ''}
        ${this.showAiSettingsModal ? this.renderAiSettingsModal() : ''}
        ${this.showMessageModal ? this.renderMessageModal() : ''}
        ${this.showCollabApplyModal ? this.renderCollabApplyModal() : ''}
        ${this.showPostUpdateModal ? this.renderPostUpdateModal() : ''}
        ${this.showPledgeModal ? this.renderPledgeModal() : ''}
        ${
          this.selectedProposalId
            ? InnovationModals.renderProposalDetailModal(
                storage.getInnovationProposalById(this.selectedProposalId)!,
                currentUser
              )
            : ''
        }
        ${
          this.selectedAgreementProposalId
            ? InnovationModals.renderPartnershipAgreementModal(
                storage.getInnovationProposalById(this.selectedAgreementProposalId)!,
                currentUser
              )
            : ''
        }
      </div>
    `;

    this.attachEventListeners();
  }

  private renderNavButton(tab: string, label: string) {
    const isActive = this.currentTab === tab;
    return `
      <button 
        data-nav="${tab}" 
        class="whitespace-nowrap px-3.5 py-1.5 rounded-full transition duration-200 ${
          isActive
            ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm shadow-emerald-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }"
      >
        ${label}
      </button>
    `;
  }

  private renderCurrentView(stats: any) {
    if (this.currentTab === 'home') return this.renderHomeView(stats);
    if (this.currentTab === 'innovation_hub') return this.renderInnovationHubView();
    if (this.currentTab === 'launchpad') return this.renderLaunchpadView();
    if (this.currentTab === 'explore') return this.renderExploreView();
    if (this.currentTab === 'ideas') return this.renderFilteredProjectsView('idea', 'Ideas & Concept Innovations', 'Untested concepts, raw ideas, and early prototypes seeking collaborators.');
    if (this.currentTab === 'startups') return this.renderFilteredProjectsView('startup', 'Startups & Emerging Businesses', 'Commercializing homegrown Kenyan innovations across Africa.');
    if (this.currentTab === 'community') return this.renderFilteredProjectsView('community', 'Community & Social Development', 'Grassroots projects directly lifting Kenyan communities.');
    if (this.currentTab === 'collaborate') return this.renderCollaborationsView();
    if (this.currentTab === 'opportunities') return this.renderOpportunitiesView();
    if (this.currentTab === 'diaspora') return this.renderDiasporaView();
    if (this.currentTab === 'dashboard') return this.renderDashboardView();
    if (this.currentTab === 'admin') return this.renderAdminView();
    return this.renderHomeView(stats);
  }

  // --- INNOVATION HUB VIEW ---
  private renderInnovationHubView() {
    const currentUser = storage.getCurrentUser();
    return InnovationHubRenderer.renderHub(
      this.innovationHubSubTab,
      currentUser,
      {
        type: this.hubChatType,
        county: this.hubChatCounty,
        category: this.hubChatCategory,
        messages: this.hubChatMessages,
        isGenerating: this.hubIsGenerating,
        generatedProposal: this.hubGeneratedProposal,
        duplicateNotice: this.hubDuplicateNotice,
      },
      this.adminFilter
    );
  }

  // --- KENYAONE LAUNCHPAD VIEW ---
  private renderLaunchpadView() {
    const pledges = storage.getPledges();

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Hero Header -->
        <div class="liquid-glass rounded-3xl p-6 sm:p-10 border border-emerald-500/30 relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="max-w-3xl relative z-10">
            <span class="bg-emerald-950/90 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              KenyaOne Ecosystem Accelerator
            </span>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
              From Idea to Working Reality: <br/>
              <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">KenyaOne Innovation Launchpad</span>
            </h1>
            <p class="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Equipping every Kenyan innovator with AI co-founder generation, commercialization compliance checklists (KIPI / KEBS), and community harambee pledging.
            </p>

            <div class="mt-6 flex flex-wrap gap-2 text-xs">
              <button data-launchpad-tab="generator" class="px-4 py-2 rounded-xl transition ${
                this.launchpadActiveTab === 'generator'
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                💡 AI Idea Co-Founder Studio
              </button>
              <button data-launchpad-tab="checklist" class="px-4 py-2 rounded-xl transition ${
                this.launchpadActiveTab === 'checklist'
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                📋 KIPI & KEBS Regulatory Roadmap
              </button>
              <button data-launchpad-tab="pledges" class="px-4 py-2 rounded-xl transition ${
                this.launchpadActiveTab === 'pledges'
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                🤝 Community Harambee Pledges (${pledges.length})
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 1: AI Idea Co-Founder Studio -->
        ${
          this.launchpadActiveTab === 'generator'
            ? `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Prompt Generator Controls -->
            <div class="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <span>⚡</span> Generate Groundbreaking Idea
                </h3>
                <button id="btnOpenAiSettings" class="text-xs text-purple-300 hover:text-purple-200 underline">
                  AI Key Settings
                </button>
              </div>
              <p class="text-xs text-slate-400">Select your county focus and target sector to generate a tailored Kenyan proposal.</p>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Target County</label>
                <select id="launchpadCounty" class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-xs text-white">
                  ${COUNTIES_DATA.map((c) => `<option value="${c.name}">${c.name} (${c.region})</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Sector Focus</label>
                <select id="launchpadCategory" class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-xs text-white">
                  ${CATEGORIES_DATA.map((c) => `<option value="${c.name}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Local Challenge or Concept</label>
                <textarea id="launchpadPrompt" rows="3" placeholder="e.g. Low cost camel milk pasteurization using solar thermal energy for Garissa pastoralists..." class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white"></textarea>
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1">
                <button class="launchpad-quick text-[11px] bg-slate-900 border border-slate-700/80 px-2 py-1 rounded text-slate-300 hover:text-white" data-prompt="Off-grid solar refrigerated transport for avocado farmers in Murang'a">🥑 Murang'a Avocado Cold</button>
                <button class="launchpad-quick text-[11px] bg-slate-900 border border-slate-700/80 px-2 py-1 rounded text-slate-300 hover:text-white" data-prompt="Plastic bottle recycling with M-Pesa micro cashback at Nakuru bus stages">♻️ Nakuru Smart Waste</button>
                <button class="launchpad-quick text-[11px] bg-slate-900 border border-slate-700/80 px-2 py-1 rounded text-slate-300 hover:text-white" data-prompt="CBC tactile robotics kits made from recycled timber for Nairobi schools">🤖 CBC Robotics Kit</button>
              </div>

              <button id="btnLaunchpadGenerate" class="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2">
                ${this.aiLoading ? `<span>Synthesizing innovation...</span>` : `<span>Generate Homegrown Innovation 🚀</span>`}
              </button>
            </div>

            <!-- Right: Generated Output Card & 1-Click Launch -->
            <div class="lg:col-span-2 space-y-4">
              <div class="liquid-glass rounded-2xl p-6 border border-white/10 min-h-[380px] flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <span class="font-bold text-white text-sm">Generated Proposal Analysis</span>
                    <span class="text-xs text-emerald-400 font-mono">Engine: ${this.selectedAiProvider.toUpperCase()}</span>
                  </div>

                  <div class="text-xs text-slate-200 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto pr-2">
                    ${this.aiResponse || 'Select options on the left and click "Generate Homegrown Innovation" to co-develop a structured project.'}
                  </div>
                </div>

                ${
                  this.generatedStructuredIdea
                    ? `
                  <div class="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30">
                    <div>
                      <div class="font-bold text-white text-xs">${this.generatedStructuredIdea.title}</div>
                      <div class="text-[11px] text-emerald-400">Ready to publish to Kenya Creates!</div>
                    </div>
                    <button id="btnTurnIdeaToProject" class="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:scale-105">
                      ⚡ Turn into Project Submission ➔
                    </button>
                  </div>
                `
                    : ''
                }
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Tab 2: Regulatory Checklist -->
        ${
          this.launchpadActiveTab === 'checklist'
            ? `
          <div class="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div>
              <h2 class="text-xl font-bold text-white">Kenya Regulatory & Commercialization Roadmap</h2>
              <p class="text-xs text-slate-400 mt-1">Official guidance for taking a prototype to formal IP protection with KIPI and quality standard certification with KEBS.</p>
            </div>

            <div class="space-y-4">
              ${this.commercializationChecklist
                .map(
                  (step, idx) => `
                <div class="bg-slate-950/60 p-4 rounded-xl border ${
                  step.status === 'completed'
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : step.status === 'in_progress'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-white/10'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="w-5 h-5 rounded-full ${
                        step.status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : step.status === 'in_progress'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400'
                      } flex items-center justify-center text-xs">
                        ${step.status === 'completed' ? '✓' : idx + 1}
                      </span>
                      <h4 class="font-bold text-white text-xs sm:text-sm">${step.title}</h4>
                    </div>
                    <p class="text-xs text-slate-300 ml-7">${step.description}</p>
                  </div>

                  <div class="flex items-center gap-2 ml-7 sm:ml-0">
                    <button data-toggle-step="${step.id}" class="px-3 py-1 rounded text-xs border transition ${
                    step.status === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : step.status === 'in_progress'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                  }">
                      ${step.status.replace('_', ' ').toUpperCase()}
                    </button>
                    ${
                      step.resourceUrl
                        ? `
                      <a href="${step.resourceUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline">
                        Portal ➔
                      </a>
                    `
                        : ''
                    }
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Tab 3: Harambee Pledges -->
        ${
          this.launchpadActiveTab === 'pledges'
            ? `
          <div class="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-bold text-white">Community Harambee & Pledge Board</h2>
                <p class="text-xs text-slate-400 mt-1">Direct support pledged by mentors, workshops, and backers to Kenyan inventors.</p>
              </div>
              <button id="btnOfferPledgeDirect" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow transition">
                + Offer a Support Pledge
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${pledges
                .map(
                  (pledge) => `
                <div class="bg-slate-950/60 p-4 rounded-xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold uppercase text-[10px]">${pledge.pledgeType.replace('_', ' ')}</span>
                      <span class="text-slate-500 text-[11px]">${pledge.contributorCounty}</span>
                    </div>
                    <h4 class="font-bold text-white text-sm mb-1">${pledge.projectTitle}</h4>
                    <p class="text-xs text-slate-300 leading-relaxed">${pledge.amountOrDetails}</p>
                  </div>
                  <div class="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    Pledged by <strong class="text-white">${pledge.contributorName}</strong>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  // --- HOME VIEW ---
  private renderHomeView(stats: any) {
    const featuredProjects = storage.getProjects({ onlyPublished: true, featured: true });
    const recentProjects = storage.getProjects({ onlyPublished: true }).slice(0, 4);

    return `
      <!-- Kenya Creates Cinematic Motion Hero with Video Loop & Liquid Glass -->
      <section class="motion-hero-wrap">
        <video class="art" autoplay muted loop playsinline preload="auto" aria-hidden="true"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4"></video>
        <div class="veil"></div>

        <!-- Symmetrical Floating Elements -->
        <div class="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center justify-center text-center my-auto">
          <!-- Sovereign Pill Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full motion-pill text-xs text-emerald-300 font-semibold mb-6 shadow-lg shadow-emerald-500/20">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>47 COUNTIES • 1 SOVEREIGN INNOVATION ENGINE • KENYAONE</span>
          </div>

          <!-- Motion Animated Headline with Wipe -->
          <h1 class="title text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
            <span id="h1a" class="block">Your Ideas. Your Projects.</span>
            <span id="h1b" class="block text-emerald-300">Your Future. Built in Kenya.</span>
          </h1>

          <!-- Subhead with Lift Animation -->
          <p class="sub mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            <span id="sub1" class="block">Kenya is full of extraordinary ideas and grassroots ingenuity.</span>
            <span id="sub2" class="block">Let the world see, back, and build them into sovereign reality.</span>
          </p>

          <!-- Liquid Glass CTA Button & Actions -->
          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a id="heroCtaExplore" href="#counties-section" class="cta px-8 py-3.5 text-sm sm:text-base font-bold text-white flex items-center gap-3">
              <span id="cta">Explore 47 Counties</span>
              <svg class="arrow w-4 h-3" viewBox="0 0 16 11" aria-hidden="true">
                <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8"/>
              </svg>
            </a>

            <button id="heroBtnLaunchpad" class="motion-pill px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
              <span>✨</span>
              <span>AI Co-Founder Studio</span>
            </button>

            <button id="heroBtnSubmit" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg shadow-emerald-600/30 transition border border-white/20">
              <span>+ Submit Project</span>
            </button>
          </div>

          <!-- 4 Chevron Feature Highlights -->
          <ul class="feats grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 w-full max-w-4xl text-left text-xs sm:text-sm">
            <li data-hero-feat="counties" class="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 group" title="Jump to 47 Counties Explorer">
              <svg class="chev w-3 h-5 flex-shrink-0 text-emerald-400 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 11 20" aria-hidden="true">
                <path d="M1.15 1.15 L9.6 10 L1.15 18.85"/>
              </svg>
              <span id="f1" class="font-medium text-slate-200 group-hover:text-white transition-colors">47 Counties Connected</span>
            </li>
            <li data-hero-feat="kipi" class="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 group" title="Open KIPI & KEBS Regulatory Roadmap">
              <svg class="chev w-3 h-5 flex-shrink-0 text-emerald-400 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 11 20" aria-hidden="true">
                <path d="M1.15 1.15 L9.6 10 L1.15 18.85"/>
              </svg>
              <span id="f2" class="font-medium text-slate-200 group-hover:text-white transition-colors">KIPI & KEBS Ready</span>
            </li>
            <li data-hero-feat="ai" class="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 group" title="Launch Kenya Creates AI Co-Founder Studio">
              <svg class="chev w-3 h-5 flex-shrink-0 text-emerald-400 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 11 20" aria-hidden="true">
                <path d="M1.15 1.15 L9.6 10 L1.15 18.85"/>
              </svg>
              <span id="f3" class="font-medium text-slate-200 group-hover:text-white transition-colors">KenyaOne AI Studio</span>
            </li>
            <li data-hero-feat="harambee" class="flex items-center gap-2.5 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 group" title="Explore Community Harambee Backing">
              <svg class="chev w-3 h-5 flex-shrink-0 text-emerald-400 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 11 20" aria-hidden="true">
                <path d="M1.15 1.15 L9.6 10 L1.15 18.85"/>
              </svg>
              <span id="f4" class="font-medium text-slate-200 group-hover:text-white transition-colors">Harambee Backing</span>
            </li>
          </ul>

          <!-- Vertical Rule Line pointing downward -->
          <span class="rule w-[2px] h-12 mt-10 rounded-full" aria-hidden="true"></span>
        </div>

        <!-- Footnote in Motion Hero -->
        <div class="relative z-10 pb-6 text-center text-xs text-slate-400">
          <span id="foot1">Trusted by Kenyan creators, county governments & investors nationwide.</span>
          <span id="foot2" class="text-emerald-400 font-semibold block mt-0.5">Kenya Creates • 2026</span>
        </div>
      </section>

      <!-- Main Interactive Content Area -->
      <div id="counties-section" class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Live Database Statistics with Specular Liquid Highlights -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
          ${this.renderStatCard('Projects Published', stats.projectsPublished, '📁')}
          ${this.renderStatCard('Ideas Submitted', stats.ideasSubmitted, '💡')}
          ${this.renderStatCard('Counties Represented', `${stats.countiesRepresented} / 47`, '🇰🇪')}
          ${this.renderStatCard('Registered Creators', stats.creatorsRegistered, '👤')}
          ${this.renderStatCard('Collaborations', stats.collaborationsInitiated, '🤝')}
          ${this.renderStatCard('Active Opportunities', stats.opportunitiesPublished, '🎯')}
        </div>

        <!-- BUILD SOMETHING KENYA NEEDS - NATIONAL AI INNOVATION HUB CALLOUT -->
        <div class="liquid-glass rounded-3xl p-6 sm:p-10 border border-emerald-500/40 relative overflow-hidden shadow-2xl shadow-emerald-950/50">
          <div class="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-80 h-80 bg-gradient-to-tr from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>KenyaOne 50/50 National Partnership Ecosystem</span>
              </div>
              <span class="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <span>🤝</span> 50% Contributor • 50% KenyaOne Commercialization
              </span>
            </div>

            <div class="max-w-3xl space-y-3">
              <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                BUILD SOMETHING <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">KENYA NEEDS</span>
              </h2>
              <p class="text-sm sm:text-base font-semibold text-emerald-300 tracking-wide uppercase">
                YOUR IDEA. OUR TECHNOLOGY. KENYA'S OPPORTUNITY.
              </p>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Is something missing from KenyaOne? Do you have an idea that could solve a problem in Kenya? Don't just leave a review. Tell KenyaOne AI what you want to build. Your idea could become the next national innovation with an official 50/50 National Partnership.
              </p>
            </div>

            <!-- Two Pathways Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <!-- Pathway A -->
              <div class="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-400/60 transition group flex flex-col justify-between space-y-4">
                <div>
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg mb-3 border border-emerald-500/30 group-hover:scale-110 transition">
                    🧩
                  </div>
                  <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Pathway A</div>
                  <h3 class="text-base font-bold text-white mt-1">Suggest a Missing Feature on KenyaOne</h3>
                  <p class="text-xs text-slate-300 mt-2 leading-relaxed">
                    Identify a service, integration, or tool absent from KenyaOne. We will refine it into a technical spec and evaluate integration with contributor attribution.
                  </p>
                </div>
                <button 
                  data-quick-hub="missing_feature" 
                  class="w-full py-2.5 px-4 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <span>Build Missing Feature</span>
                  <span>→</span>
                </button>
              </div>

              <!-- Pathway B -->
              <div class="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-5 hover:border-amber-400/60 transition group flex flex-col justify-between space-y-4">
                <div>
                  <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg mb-3 border border-amber-500/30 group-hover:scale-110 transition">
                    🚀
                  </div>
                  <div class="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pathway B • 50/50 Partnership</div>
                  <h3 class="text-base font-bold text-white mt-1">Propose a New Business, Product or National Project</h3>
                  <p class="text-xs text-slate-300 mt-2 leading-relaxed">
                    Pitch a transformative venture for agriculture, transport, energy, or healthcare. Qualify for a binding 50/50 National Partnership Agreement with profit sharing.
                  </p>
                </div>
                <button 
                  data-quick-hub="new_business" 
                  class="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
                >
                  <span>Propose National Project</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <!-- Highlights Footer -->
            <div class="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div class="flex items-center gap-4 flex-wrap">
                <span class="flex items-center gap-1.5"><span class="text-emerald-400">✓</span> English, Kiswahili & Sheng AI</span>
                <span class="flex items-center gap-1.5"><span class="text-emerald-400">✓</span> Automatic 7-Part Proposal Generation</span>
                <span class="flex items-center gap-1.5"><span class="text-emerald-400">✓</span> 13-Stage Sovereign Review Pipeline</span>
              </div>
              <button data-quick-hub-tab="marketplace" class="text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1">
                <span>View National Marketplace & Financials</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 47 Counties Interactive Explorer -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span>🇰🇪</span> Explore Innovations by County
            </h2>
            <p class="text-sm text-slate-400">Discover what creators in your home county and across all 47 counties are developing.</p>
          </div>
          <span class="text-xs bg-slate-900/80 px-3 py-1 rounded-full text-slate-300 border border-white/10">All 47 Counties Active</span>
        </div>

        <div class="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/10">
          <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
            <button data-county="all" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'all' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">All Counties</button>
            <button data-county="Nairobi" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Nairobi' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Nairobi (9)</button>
            <button data-county="Kiambu" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Kiambu' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Kiambu (5)</button>
            <button data-county="Nakuru" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Nakuru' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Nakuru (4)</button>
            <button data-county="Kisumu" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Kisumu' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Kisumu (4)</button>
            <button data-county="Mombasa" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Mombasa' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Mombasa (4)</button>
            <button data-county="Turkana" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Turkana' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Turkana (2)</button>
            <button data-county="Murang'a" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Murang\'a' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Murang'a (3)</button>
            <button data-county="Uasin Gishu" class="county-filter-btn px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${this.selectedCounty === 'Uasin Gishu' ? 'bg-emerald-600 text-white font-semibold shadow' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'}">Uasin Gishu (3)</button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 text-xs max-h-52 overflow-y-auto pr-1">
            ${COUNTIES_DATA.map(
              (c) => `
              <button 
                data-county="${c.name}" 
                class="county-filter-btn text-left p-2.5 rounded-xl border transition ${
                  this.selectedCounty.toLowerCase() === c.name.toLowerCase()
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }"
              >
                <div class="font-medium truncate">${c.name}</div>
                <div class="text-[10px] text-slate-500">${c.projectCount} project${c.projectCount !== 1 ? 's' : ''}</div>
              </button>
            `
            ).join('')}
          </div>
        </div>
      </section>

      <!-- Featured Projects Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span>🌟</span> Featured National Innovations
            </h2>
            <p class="text-sm text-slate-400">Editorially reviewed breakthroughs from Kenyan innovators solving ground realities.</p>
          </div>
          <button id="btnViewAllFeatured" class="text-xs text-emerald-400 hover:text-emerald-300 font-bold">
            View All Projects ➔
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${featuredProjects.map((p) => this.renderProjectCard(p)).join('')}
        </div>
      </section>

      <!-- Explore Categories Grid -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <span>📂</span> Explore by Sector & Category
          </h2>
          <p class="text-sm text-slate-400">Discover initiatives across technology, agriculture, medical devices, climate and the arts.</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          ${CATEGORIES_DATA.map((cat) => this.renderCategoryTile(cat)).join('')}
        </div>
      </section>

      <!-- Recent Submissions -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span>⚡</span> Recently Published Projects
            </h2>
            <p class="text-sm text-slate-400">Fresh submissions recently approved across all counties.</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          ${recentProjects.map((p) => this.renderProjectCard(p, true)).join('')}
        </div>
      </section>
    `;
  }

  // --- STAT CARD ---
  private renderStatCard(label: string, value: any, icon: string) {
    return `
      <div class="liquid-glass-card rounded-2xl p-4">
        <div class="text-lg mb-1">${icon}</div>
        <div class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">${value}</div>
        <div class="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">${label}</div>
      </div>
    `;
  }

  // --- CATEGORY TILE ---
  private renderCategoryTile(cat: CategoryInfo) {
    const isSelected = this.selectedCategory === cat.id;
    return `
      <button 
        data-category="${cat.id}"
        class="category-tile-btn text-left p-4 rounded-2xl border transition ${
          isSelected
            ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
            : 'liquid-glass-card hover:border-white/20'
        }"
      >
        <div class="text-2xl mb-2">${cat.icon}</div>
        <div class="font-bold text-sm text-white">${cat.name}</div>
        <div class="text-xs text-slate-400 mt-1 line-clamp-2">${cat.description}</div>
        <div class="text-[10px] font-semibold text-emerald-400 mt-2">${cat.count} published</div>
      </button>
    `;
  }

  // --- PROJECT CARD ---
  private renderProjectCard(p: Project, compact = false) {
    const isFollowed = storage.isProjectFollowed(p.id);
    const verificationBadge = this.getVerificationBadge(p.verificationStatus);

    return `
      <div class="liquid-glass-card rounded-2xl overflow-hidden flex flex-col group shadow-xl border border-white/10">
        <!-- Cover Image & Badges -->
        <div class="relative h-44 w-full overflow-hidden bg-slate-900 cursor-pointer project-card-open" data-project-id="${p.id}">
          <img src="${p.coverImage}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
          
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span class="bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              ${p.county}
            </span>
            ${p.isDiaspora ? `<span class="bg-blue-900/90 px-2 py-0.5 rounded-full text-[10px] font-semibold text-blue-200">🌍 Diaspora</span>` : ''}
          </div>

          <div class="absolute top-3 right-3">
            ${verificationBadge}
          </div>

          <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
            <span class="capitalize bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium">${p.stage.replace('_', ' ')}</span>
            <span class="text-[11px] bg-black/60 px-2 py-0.5 rounded">👁️ ${p.views}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-base text-white group-hover:text-emerald-400 transition cursor-pointer project-card-open line-clamp-1" data-project-id="${p.id}">
              ${p.title}
            </h3>
            <p class="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              ${p.tagline || p.description}
            </p>
          </div>

          <!-- Needs Tags -->
          ${
            p.needs && p.needs.length > 0 && !compact
              ? `
            <div class="mt-3 flex flex-wrap gap-1">
              ${p.needs
                .slice(0, 3)
                .map(
                  (need) => `
                <span class="bg-slate-950/60 text-[10px] text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                  Seeking: ${need}
                </span>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <!-- Creator & Action Footer -->
          <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-2 cursor-pointer creator-link" data-username="${p.creatorUsername}">
              <img src="${p.creatorAvatar}" alt="${p.creatorName}" class="w-6 h-6 rounded-full object-cover border border-emerald-500/50" />
              <span class="text-xs text-slate-300 font-medium hover:text-white truncate max-w-[120px]">${p.creatorName}</span>
            </div>

            <div class="flex items-center gap-2">
              <button data-follow-project="${p.id}" class="text-xs px-2.5 py-1 rounded-full border transition ${
      isFollowed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium' : 'border-slate-700 text-slate-400 hover:text-white'
    }">
                ${isFollowed ? '✓ Following' : '+ Follow'}
              </button>
              <button data-project-id="${p.id}" class="project-card-open text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1">
                View ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getVerificationBadge(status: string) {
    if (status === 'featured') {
      return `<span class="bg-amber-500/90 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] shadow">⭐ Featured</span>`;
    }
    if (status === 'org_verified') {
      return `<span class="bg-indigo-600/90 text-white font-semibold px-2 py-0.5 rounded-full text-[10px]">🏢 Org Verified</span>`;
    }
    if (status === 'project_evidence_reviewed' || status === 'evidence_reviewed') {
      return `<span class="bg-emerald-600/90 text-white font-semibold px-2 py-0.5 rounded-full text-[10px]">✓ Evidence Reviewed</span>`;
    }
    if (status === 'under_review') {
      return `<span class="bg-slate-700/90 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">⏳ In Review</span>`;
    }
    return `<span class="bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-full text-[10px]">Community Submitted</span>`;
  }

  // --- EXPLORE PROJECTS VIEW ---
  private renderExploreView() {
    const projects = storage.getProjects({
      category: this.selectedCategory,
      county: this.selectedCounty,
      search: this.searchQuery,
      onlyPublished: true,
    });

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-extrabold text-white">Explore Projects</h1>
            <p class="text-sm text-slate-400 mt-1">Filter across 21 sectors and all 47 Kenyan counties.</p>
          </div>

          <div class="flex items-center gap-3">
            <select id="filterCategorySelect" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200">
              <option value="all" ${this.selectedCategory === 'all' ? 'selected' : ''}>All Categories</option>
              ${CATEGORIES_DATA.map((c) => `<option value="${c.id}" ${this.selectedCategory === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>

            <select id="filterCountySelect" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200">
              <option value="all" ${this.selectedCounty === 'all' ? 'selected' : ''}>All Counties</option>
              ${COUNTIES_DATA.map((c) => `<option value="${c.name}" ${this.selectedCounty.toLowerCase() === c.name.toLowerCase() ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        ${
          projects.length === 0
            ? `
          <div class="liquid-glass rounded-3xl p-12 text-center max-w-lg mx-auto border border-white/10">
            <div class="text-4xl mb-3">🔍</div>
            <h3 class="text-lg font-bold text-white">No projects found</h3>
            <p class="text-xs text-slate-400 mt-1">Try resetting your filters or submit the first project for this county!</p>
            <button id="btnResetFilters" class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold">
              Reset Filters
            </button>
          </div>
        `
            : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${projects.map((p) => this.renderProjectCard(p)).join('')}
          </div>
        `
        }
      </div>
    `;
  }

  // --- FILTERED PROJECTS VIEW (Ideas, Startups, Community) ---
  private renderFilteredProjectsView(type: string, title: string, subtitle: string) {
    const projects = storage.getProjects({
      submissionType: type,
      onlyPublished: true,
    });

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-white">${title}</h1>
          <p class="text-sm text-slate-400 mt-1">${subtitle}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${projects.map((p) => this.renderProjectCard(p)).join('')}
        </div>
      </div>
    `;
  }

  // --- COLLABORATIONS VIEW ---
  private renderCollaborationsView() {
    const collabs = storage.getCollaborations();

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-extrabold text-white">Collaboration Centre</h1>
            <p class="text-sm text-slate-400 mt-1">Connect with Kenyan inventors, researchers, developers, and partners looking for teammates.</p>
          </div>
          <button id="btnPostCollab" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-emerald-600/20 transition">
            + Post Collaboration Request
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${collabs
            .map(
              (c) => `
            <div class="liquid-glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span class="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">${c.type}</span>
                  <span class="capitalize">${c.locationPreference} • ${c.compensation}</span>
                </div>
                <h3 class="text-base font-bold text-white mb-1.5">${c.projectTitle}</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-4">${c.description}</p>
                
                <div class="flex flex-wrap gap-1 mb-4">
                  ${c.skillsRequired.map((s) => `<span class="bg-slate-950/60 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full border border-white/5">${s}</span>`).join('')}
                </div>
              </div>

              <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span class="text-slate-400">Posted by <strong class="text-white">${c.creatorName}</strong> (${c.county})</span>
                <button data-apply-collab="${c.id}" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-semibold transition">
                  Apply / Propose
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // --- OPPORTUNITIES VIEW ---
  private renderOpportunitiesView() {
    const opps = storage.getOpportunities();

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-white">Opportunities & Grants Directory</h1>
          <p class="text-sm text-slate-400 mt-1">Verified innovation grants, awards, accelerators, and university fellowships open to Kenyans.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${opps
            .map((o) => {
              const isSaved = storage.isOpportunitySaved(o.id);
              return `
              <div class="liquid-glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between text-xs mb-2">
                    <span class="bg-amber-950/80 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold uppercase text-[10px]">${o.category}</span>
                    <span class="text-slate-400">Deadline: <strong class="text-white">${o.deadline}</strong></span>
                  </div>
                  <h3 class="text-lg font-bold text-white mb-1">${o.title}</h3>
                  <div class="text-xs text-emerald-400 font-semibold mb-2">${o.provider} • ${o.fundingAmount || 'In-Kind Advisory'}</div>
                  <p class="text-xs text-slate-300 leading-relaxed mb-4">${o.description}</p>
                  
                  <div class="bg-slate-950/60 p-3 rounded-xl border border-white/5 mb-4 text-xs text-slate-400">
                    <strong class="text-slate-300">Eligibility:</strong> ${o.eligibility}
                  </div>
                </div>

                <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <button data-save-opp="${o.id}" class="border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition">
                    ${isSaved ? '★ Saved' : '☆ Save'}
                  </button>
                  <a href="${o.website}" target="_blank" rel="noopener noreferrer" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-medium transition inline-flex items-center gap-1">
                    Apply on Provider Site ➔
                  </a>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  // --- DIASPORA VIEW ---
  private renderDiasporaView() {
    const diasporaProjects = storage.getProjects({ onlyPublished: true }).filter((p) => p.isDiaspora);

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="liquid-glass border border-blue-500/30 rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div class="max-w-2xl relative z-10">
            <span class="bg-blue-900/60 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30">Kenyans Abroad • Ideas for Kenya</span>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mt-3">Diaspora Innovation Bridge</h1>
            <p class="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Enabling Kenyans living across North America, Europe, the Middle East, and worldwide to contribute prototypes, healthcare hardware, scientific research, and investments back to their home counties.
            </p>
            <div class="mt-4 flex gap-3">
              <button id="btnSubmitDiaspora" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-full transition shadow">
                + Submit Diaspora Project
              </button>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-white mb-6">Active Diaspora Initiatives</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${diasporaProjects.map((p) => this.renderProjectCard(p)).join('')}
        </div>
      </div>
    `;
  }

  // --- DASHBOARD VIEW ---
  private renderDashboardView() {
    const user = storage.getCurrentUser();
    const myProjects = storage.getProjects({ creatorId: user.id, onlyPublished: false });
    const myProposals = proposalService.getUserSubmittedProposalsSync(user.id);

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Profile Banner -->
        <div class="liquid-glass rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border border-white/10">
          <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img src="${user.avatar}" alt="${user.displayName}" class="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
            <div>
              <div class="flex items-center gap-2 justify-center sm:justify-start">
                <h1 class="text-2xl font-bold text-white">${user.displayName}</h1>
                ${user.verified ? `<span class="text-emerald-400" title="Verified Creator">✓</span>` : ''}
              </div>
              <p class="text-xs text-slate-400 mt-0.5">@${user.username} • ${user.county}, ${user.country}</p>
              <p class="text-xs text-emerald-400 font-medium mt-1">${user.field}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button id="btnDashboardNewProject" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow">
              + New Submission
            </button>
            <button id="btnExportData" class="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-full border border-slate-700 transition" title="Export under Kenya Data Protection Act">
              📥 Export Data (DPA)
            </button>
          </div>
        </div>

        <!-- Dashboard Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="liquid-glass-card p-4 rounded-xl">
            <div class="text-xs text-slate-400">Total Projects</div>
            <div class="text-2xl font-bold text-white mt-1">${myProjects.length}</div>
          </div>
          <div class="liquid-glass-card p-4 rounded-xl">
            <div class="text-xs text-slate-400">Published</div>
            <div class="text-2xl font-bold text-emerald-400 mt-1">${myProjects.filter((p) => p.status === 'published').length}</div>
          </div>
          <div class="liquid-glass-card p-4 rounded-xl">
            <div class="text-xs text-slate-400">Total Views</div>
            <div class="text-2xl font-bold text-white mt-1">${myProjects.reduce((acc, p) => acc + p.views, 0)}</div>
          </div>
          <div class="liquid-glass-card p-4 rounded-xl">
            <div class="text-xs text-slate-400">Followers</div>
            <div class="text-2xl font-bold text-white mt-1">${user.followersCount}</div>
          </div>
        </div>

        <!-- Contributor Innovation Dashboard (Fetched from database via ContributorInnovationDashboard component) -->
        <div class="mb-10">
          ${ContributorInnovationDashboard.render(user, this.contributorDashboardFilter)}
        </div>

        <!-- My Projects List -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Showcase Portfolio Projects (${myProjects.length})</h2>
          ${
            myProjects.length === 0
              ? `
            <div class="liquid-glass rounded-xl p-8 text-center text-slate-400 text-xs border border-white/5">
              You haven't submitted any projects yet. Click "+ New Submission" to showcase your first idea!
            </div>
          `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${myProjects
                .map(
                  (p) => `
                <div class="liquid-glass-card rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between text-xs mb-2">
                      <span class="capitalize px-2 py-0.5 rounded font-semibold text-[10px] ${
                        p.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300'
                      }">${p.status.replace('_', ' ')}</span>
                      <span class="text-slate-400 text-[11px]">${p.county}</span>
                    </div>
                    <h3 class="text-base font-bold text-white line-clamp-1">${p.title}</h3>
                    <p class="text-xs text-slate-400 mt-1 line-clamp-2">${p.description}</p>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button data-add-update="${p.id}" class="text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-white/5">
                      + Add Update
                    </button>
                    <button data-project-id="${p.id}" class="project-card-open text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                      Preview ➔
                    </button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>
      </div>
    `;
  }

  // --- ADMIN VIEW ---
  private renderAdminView() {
    const allProjects = storage.getProjects({ onlyPublished: false });
    const pendingProjects = allProjects.filter((p) => p.status === 'submitted' || p.status === 'under_review');
    const publishedProjects = allProjects.filter((p) => p.status === 'published');
    const auditLogs = storage.getAuditLogs();

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-extrabold text-white flex items-center gap-2">
              <span>🛡️</span> Administrator Control Centre
            </h1>
            <p class="text-sm text-slate-400 mt-1">Review submissions, approve publications, and oversee platform integrity across 47 counties.</p>
          </div>
          <button id="btnFactoryReset" class="text-xs text-red-400 hover:text-red-300 border border-red-500/30 bg-red-950/20 px-3 py-1.5 rounded-lg transition" title="Reset seed state">
            ⚠️ Reset Database Seed
          </button>
        </div>

        <!-- Moderation Queue -->
        <div class="liquid-glass rounded-2xl p-6 mb-8 border border-white/10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-white">Pending Moderation Queue (${pendingProjects.length})</h2>
          </div>

          ${
            pendingProjects.length === 0
              ? `<div class="text-xs text-slate-400 py-6 text-center">No pending projects awaiting review! Good job.</div>`
              : `
            <div class="space-y-4">
              ${pendingProjects
                .map(
                  (p) => `
                <div class="bg-slate-950/60 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span class="bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-semibold text-[10px]">${p.submissionType}</span>
                      <span>${p.county}</span>
                      <span>By: <strong class="text-white">${p.creatorName}</strong></span>
                    </div>
                    <h3 class="text-base font-bold text-white">${p.title}</h3>
                    <p class="text-xs text-slate-300 mt-1 line-clamp-2">${p.description}</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button data-admin-approve="${p.id}" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition">
                      ✓ Approve & Publish
                    </button>
                    <button data-admin-changes="${p.id}" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                      Request Changes
                    </button>
                    <button data-admin-reject="${p.id}" class="bg-red-900/60 hover:bg-red-800 text-red-200 text-xs px-3 py-1.5 rounded-lg transition">
                      Reject
                    </button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>

        <!-- Published Projects Quick Moderation -->
        <div class="liquid-glass rounded-2xl p-6 mb-8 border border-white/10">
          <h2 class="text-lg font-bold text-white mb-4">Published Projects Management (${publishedProjects.length})</h2>
          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            ${publishedProjects
              .map(
                (p) => `
              <div class="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-white">${p.title}</span>
                  <span class="text-slate-400 ml-2">(${p.county} • ${p.creatorName})</span>
                </div>
                <div class="flex items-center gap-2">
                  <button data-admin-toggle-featured="${p.id}" class="px-2 py-1 rounded border ${
                  p.featured ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'border-slate-700 text-slate-400 hover:text-white'
                }">
                    ${p.featured ? '★ Featured' : '☆ Feature'}
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Audit Logs Table -->
        <div class="liquid-glass rounded-2xl p-6 border border-white/10">
          <h2 class="text-lg font-bold text-white mb-4">Audit Logs</h2>
          <div class="space-y-2 text-xs text-slate-300 font-mono">
            ${auditLogs
              .slice(0, 10)
              .map(
                (log) => `
              <div class="bg-slate-950/50 p-2.5 rounded border border-white/5 flex items-center justify-between">
                <div>
                  <span class="text-emerald-400 font-bold">[${log.action}]</span>
                  <span class="text-slate-200 ml-2">${log.details}</span>
                </div>
                <span class="text-[10px] text-slate-500">${new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- PROJECT DETAIL MODAL ---
  private renderProjectDetailModal(id: string) {
    const p = storage.getProjectById(id);
    if (!p) return '';

    const isFollowed = storage.isProjectFollowed(p.id);
    const projectPledges = storage.getPledges(p.id);

    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <div class="liquid-glass rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8 border border-white/15">
          <!-- Close button -->
          <button id="btnCloseProjectModal" class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center text-sm border border-white/20">
            ✕
          </button>

          <!-- Cover Image -->
          <div class="relative h-64 w-full bg-slate-950">
            <img src="${p.coverImage}" alt="${p.title}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <div class="absolute bottom-4 left-6 right-6">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded text-xs uppercase shadow">${p.county}</span>
                <span class="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-xs capitalize">${p.stage.replace('_', ' ')}</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white">${p.title}</h2>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 sm:p-8 space-y-6 text-sm">
            <!-- Tagline -->
            <p class="text-base font-medium text-emerald-400">${p.tagline}</p>

            <!-- Creator Information -->
            <div class="bg-slate-950/60 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img src="${p.creatorAvatar}" alt="${p.creatorName}" class="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                <div>
                  <h4 class="font-bold text-white">${p.creatorName}</h4>
                  <p class="text-xs text-slate-400">@${p.creatorUsername} • ${p.county}, Kenya</p>
                </div>
              </div>
              <button data-contact-creator="${p.creatorId}" class="bg-slate-900 hover:bg-slate-800 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-white/10 transition">
                💬 Message
              </button>
            </div>

            <!-- Problem & Proposed Solution -->
            ${
              p.problemStatement || p.proposedSolution
                ? `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl">
                  <h4 class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Problem Addressed</h4>
                  <p class="text-xs text-slate-300 leading-relaxed">${p.problemStatement || 'Identified through grassroots observation in ' + p.county + '.'}</p>
                </div>
                <div class="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                  <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Proposed Solution</h4>
                  <p class="text-xs text-slate-300 leading-relaxed">${p.proposedSolution || 'Localized engineering and community deployment.'}</p>
                </div>
              </div>
            `
                : ''
            }

            <!-- Full Description -->
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Overview</h4>
              <p class="text-slate-300 leading-relaxed whitespace-pre-line">${p.description}</p>
            </div>

            <!-- Needs -->
            ${
              p.needs && p.needs.length > 0
                ? `
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">What the Creator Needs</h4>
                <div class="flex flex-wrap gap-2">
                  ${p.needs.map((n) => `<span class="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-medium">✓ ${n}</span>`).join('')}
                </div>
                ${p.customNeeds ? `<p class="text-xs text-slate-400 mt-2 italic">${p.customNeeds}</p>` : ''}
              </div>
            `
                : ''
            }

            <!-- Community Pledges -->
            ${
              projectPledges.length > 0
                ? `
              <div class="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Community Harambee Pledges (${projectPledges.length})</h4>
                <div class="space-y-2">
                  ${projectPledges
                    .map(
                      (pl) => `
                    <div class="text-xs text-slate-300 flex items-center justify-between bg-black/40 p-2 rounded-lg">
                      <span>${pl.amountOrDetails} — <strong class="text-white">${pl.contributorName}</strong></span>
                      <span class="text-[10px] text-emerald-400 uppercase">${pl.pledgeType}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- Project Updates Timeline -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Updates (${p.updates.length})</h4>
                <button data-add-update="${p.id}" class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                  + Post Update
                </button>
              </div>

              ${
                p.updates.length === 0
                  ? `<div class="text-xs text-slate-500 italic">No formal updates published yet.</div>`
                  : `
                <div class="space-y-3 border-l-2 border-emerald-500/30 pl-4">
                  ${p.updates
                    .map(
                      (u) => `
                    <div>
                      <div class="flex items-center gap-2 text-xs">
                        <span class="font-bold text-white">${u.title}</span>
                        <span class="text-[10px] text-slate-400">${u.date}</span>
                      </div>
                      <p class="text-xs text-slate-300 mt-0.5">${u.description}</p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `
              }
            </div>

            <!-- Actions Footer -->
            <div class="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button data-follow-project="${p.id}" class="px-4 py-2 rounded-xl text-xs font-semibold border transition ${
      isFollowed ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10'
    }">
                ${isFollowed ? '✓ Following Project' : '+ Follow Project'}
              </button>

              <div class="flex items-center gap-2">
                <button data-pledge-project="${p.id}" class="bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow transition">
                  🤝 Offer Support Pledge
                </button>
                <button id="btnShareProject" data-url="${window.location.href}" class="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl border border-white/10">
                  🔗 Share
                </button>
                <button data-apply-collab-project="${p.id}" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition">
                  Offer Collaboration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- CREATOR PROFILE MODAL ---
  private renderCreatorProfileModal(username: string) {
    const creator = storage.getCreatorByUsername(username);
    if (!creator) return '';

    const projects = storage.getProjects({ creatorId: creator.id, onlyPublished: true });

    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <div class="liquid-glass rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative my-8 shadow-2xl border border-white/15">
          <button id="btnCloseCreatorModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm border border-white/10">
            ✕
          </button>

          <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-6">
            <img src="${creator.avatar}" alt="${creator.displayName}" class="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500" />
            <div>
              <h2 class="text-2xl font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                ${creator.displayName}
                ${creator.verified ? `<span class="text-emerald-400 text-sm">✓</span>` : ''}
              </h2>
              <p class="text-xs text-slate-400">@${creator.username} • ${creator.county}, ${creator.country}</p>
              <p class="text-xs text-emerald-400 font-medium mt-1">${creator.field}</p>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Biography</h4>
            <p class="text-xs text-slate-300 leading-relaxed">${creator.bio}</p>
          </div>

          <div class="mb-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills & Expertise</h4>
            <div class="flex flex-wrap gap-1.5">
              ${creator.skills.map((s) => `<span class="bg-slate-950 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-white/5">${s}</span>`).join('')}
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Published Innovations (${projects.length})</h4>
            <div class="space-y-3">
              ${projects
                .map(
                  (p) => `
                <div class="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer project-card-open hover:border-emerald-500/40 transition" data-project-id="${p.id}">
                  <div>
                    <h5 class="font-bold text-xs text-white">${p.title}</h5>
                    <p class="text-[11px] text-slate-400">${p.county} • ${p.stage}</p>
                  </div>
                  <span class="text-emerald-400 text-xs font-semibold">View ➔</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- SUBMISSION MODAL (6-Step System) ---
  private renderSubmissionModal() {
    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <div class="liquid-glass rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative my-8 shadow-2xl border border-white/15">
          <button id="btnCloseSubmitModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm border border-white/10">
            ✕
          </button>

          <!-- Step Progress Tracker -->
          <div class="mb-6">
            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step ${this.submissionStep} of 6</span>
            <h2 class="text-2xl font-bold text-white mt-1">${this.getSubmissionStepTitle()}</h2>
            <div class="w-full bg-slate-950 h-2 rounded-full mt-3 overflow-hidden border border-white/5">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300" style="width: ${(this.submissionStep / 6) * 100}%"></div>
            </div>
          </div>

          <!-- Step Content Form -->
          <div class="space-y-4 text-xs">
            ${this.renderSubmissionStepForm()}
          </div>

          <!-- Navigation Footer -->
          <div class="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
            ${
              this.submissionStep > 1
                ? `<button id="btnSubmitPrev" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-medium border border-white/10">Back</button>`
                : `<div></div>`
            }

            <div class="flex items-center gap-2">
              <button id="btnSubmitDraft" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-white/10">Save Draft</button>
              ${
                this.submissionStep < 6
                  ? `<button id="btnSubmitNext" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30">Continue ➔</button>`
                  : `<button id="btnSubmitFinal" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30">Submit for Review 🚀</button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getSubmissionStepTitle() {
    switch (this.submissionStep) {
      case 1:
        return 'Project Identity & Category';
      case 2:
        return 'Development Stage';
      case 3:
        return 'Materials & Media Upload';
      case 4:
        return 'What Support Do You Need?';
      case 5:
        return 'Intellectual Property & Terms';
      case 6:
        return 'Preview & Final Submission';
      default:
        return 'Project Submission';
    }
  }

  private renderSubmissionStepForm() {
    if (this.submissionStep === 1) {
      return `
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Project Name *</label>
          <input type="text" id="subTitle" value="${this.submissionData.title || ''}" placeholder="e.g. Solar Maize Dehydrator" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Short Tagline *</label>
          <input type="text" id="subTagline" value="${this.submissionData.tagline || ''}" placeholder="One punchy sentence explaining the benefit" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Category *</label>
            <select id="subCategory" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">
              ${CATEGORIES_DATA.map((c) => `<option value="${c.id}" ${this.submissionData.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">County *</label>
            <select id="subCounty" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">
              ${COUNTIES_DATA.map((c) => `<option value="${c.name}" ${this.submissionData.county === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Detailed Description *</label>
          <textarea id="subDesc" rows="4" placeholder="Explain what you are building, how it works, and who benefits in Kenya." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">${this.submissionData.description || ''}</textarea>
        </div>
      `;
    }

    if (this.submissionStep === 2) {
      const stages = [
        { id: 'idea', label: '1. Just an idea', desc: 'Concept formulated, early sketches' },
        { id: 'research', label: '2. Research & Planning', desc: 'Feasibility studies & user interviews' },
        { id: 'prototype_dev', label: '3. Prototype in Development', desc: 'Actively assembling physical or software MVP' },
        { id: 'prototype_done', label: '4. Prototype Completed', desc: 'Working prototype built and demonstrated' },
        { id: 'testing', label: '5. Testing & Validation', desc: 'Bench testing and safety checks' },
        { id: 'pilot', label: '6. Pilot Deployment', desc: 'Small-scale trial with active community users' },
        { id: 'operational', label: '7. Operational Project', desc: 'Regular production, users, or revenue' },
      ];

      return `
        <div class="space-y-2">
          ${stages
            .map(
              (s) => `
            <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900 cursor-pointer">
              <input type="radio" name="subStage" value="${s.id}" ${this.submissionData.stage === s.id ? 'checked' : ''} class="mt-1 text-emerald-500" />
              <div>
                <div class="font-bold text-white">${s.label}</div>
                <div class="text-[11px] text-slate-400">${s.desc}</div>
              </div>
            </label>
          `
            )
            .join('')}
        </div>
      `;
    }

    if (this.submissionStep === 3) {
      return `
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Cover Photograph URL</label>
          <input type="text" id="subCoverImage" value="${this.submissionData.coverImage || ''}" placeholder="https://..." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
          <p class="text-[11px] text-slate-500 mt-1">Provide a direct image URL of your prototype, drawing, or workshop.</p>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Demonstration Video Link (Optional)</label>
          <input type="text" id="subVideoUrl" value="${this.submissionData.videoUrl || ''}" placeholder="YouTube or Loom video demonstration" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
        </div>

        <div class="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-400">
          <div class="text-2xl mb-1">📎</div>
          <div class="font-medium text-slate-300">Prototype CAD / PDF Research Paper</div>
          <p class="text-[11px] mt-1">Click to select files (Supports PDF, PNG, STL up to 25MB)</p>
          <input type="file" id="subFileInput" class="hidden" />
          <button type="button" onclick="document.getElementById('subFileInput').click()" class="mt-3 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs border border-white/10">Browse Device</button>
        </div>
      `;
    }

    if (this.submissionStep === 4) {
      const needsList = [
        'Funding & Grants',
        'Angel Investors',
        'Technical Expertise',
        'Software Developers',
        'Mechanical Engineers',
        'Mentorship',
        'Manufacturing Support',
        'Local Distribution',
        'Volunteers',
        'Government / County Support',
        'General Exposure',
      ];

      return `
        <div>
          <label class="block font-semibold text-slate-300 mb-2">Select what your project needs to move forward:</label>
          <div class="grid grid-cols-2 gap-2">
            ${needsList
              .map(
                (need) => `
              <label class="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-slate-950/60 cursor-pointer">
                <input type="checkbox" name="subNeeds" value="${need}" ${(this.submissionData.needs || []).includes(need) ? 'checked' : ''} class="text-emerald-500" />
                <span class="text-slate-300">${need}</span>
              </label>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="mt-4">
          <label class="block font-semibold text-slate-300 mb-1">Custom Explanation of Needs (Optional)</label>
          <textarea id="subCustomNeeds" rows="2" placeholder="e.g. We specifically need access to a CNC lathe machine in Nairobi for 2 weeks." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">${this.submissionData.customNeeds || ''}</textarea>
        </div>
      `;
    }

    if (this.submissionStep === 5) {
      return `
        <div class="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl text-amber-200 text-xs leading-relaxed space-y-2">
          <h4 class="font-bold flex items-center gap-1.5 text-amber-300">
            <span>🛡️</span> Intellectual Property (IP) Transparency
          </h4>
          <p>• Kenya Creates does <strong>not</strong> own or claim ownership of your idea or invention.</p>
          <p>• Publishing makes selected project information public. It does not replace formal patent filing or copyright registration with the Kenya Industrial Property Institute (KIPI).</p>
          <p>• Do not disclose proprietary trade secrets or sensitive unpatented schematics you wish to keep confidential.</p>
        </div>

        <div class="space-y-3 mt-4">
          <label class="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" id="subIpConfirm" checked class="mt-0.5 text-emerald-500" />
            <span class="text-slate-300">I confirm that I have the right to submit these materials and agree to Kenya Creates terms of publication.</span>
          </label>
        </div>

        <div class="mt-4">
          <label class="block font-semibold text-slate-300 mb-1">Visibility Setting:</label>
          <select id="subVisibility" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">
            <option value="public">Public Project (Visible to all Kenyan & global visitors)</option>
            <option value="limited">Limited Public Profile (Restricted contact information)</option>
            <option value="draft">Private Draft (Visible only to you)</option>
          </select>
        </div>
      `;
    }

    // Step 6: Preview
    return `
      <div class="bg-slate-950/80 p-5 rounded-2xl border border-white/10 space-y-3">
        <h4 class="font-bold text-white text-base">${this.submissionData.title || 'Untitled Project'}</h4>
        <p class="text-emerald-400 font-medium text-xs">${this.submissionData.tagline || ''}</p>
        <p class="text-slate-300 text-xs leading-relaxed">${this.submissionData.description || ''}</p>
        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span>County: <strong>${this.submissionData.county}</strong></span>
          <span>Stage: <strong>${this.submissionData.stage}</strong></span>
        </div>
      </div>
      <p class="text-xs text-slate-400 text-center mt-3">Ready to submit? Once submitted, our technical moderation team will review and publish within 24 hours.</p>
    `;
  }

  // --- KENYA CREATES AI MODAL ---
  private renderAIModal() {
    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
        <div class="liquid-glass rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative my-8 shadow-2xl border border-purple-500/30">
          <button id="btnCloseAIModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm border border-white/10">
            ✕
          </button>

          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xl shadow">
                ✨
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">KENYA CREATES AI</h2>
                <p class="text-xs text-slate-400">Intelligent innovation consultant & idea builder</p>
              </div>
            </div>
            <button id="btnOpenAiSettingsInModal" class="text-xs text-purple-300 hover:text-purple-200 underline">
              ⚙️ AI Provider: ${this.selectedAiProvider.toUpperCase()}
            </button>
          </div>

          <!-- Quick Prompts -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button class="ai-quick-btn text-xs bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-full" data-task="generate_idea" data-prompt="Design an IoT cold storage solution for Garissa camel milk cooperatives.">
              💡 Co-Design Innovation
            </button>
            <button class="ai-quick-btn text-xs bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-full" data-task="pitch" data-prompt="Draft a 1-minute executive pitch for a solar borehole water kiosk in Turkana.">
              🚀 Draft Pitch
            </button>
            <button class="ai-quick-btn text-xs bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/30 px-3 py-1 rounded-full" data-task="roadmap" data-prompt="Create a realistic 6-month development roadmap for a medical diagnostic app in Kisumu.">
              🗺️ 6-Month Roadmap
            </button>
            <button class="ai-quick-btn text-xs bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-full" data-task="translate" data-prompt="Tafsiri maelezo ya mradi wangu wa mbolea ya asili kwa Kiswahili fasaha.">
              🇰🇪 Kiswahili
            </button>
          </div>

          <!-- Input Box -->
          <div class="mb-4">
            <textarea id="aiPromptInput" rows="3" placeholder="Describe your idea or ask for assistance (e.g. 'How can I build an automated coffee pulping machine in Kiambu?')" class="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500">${this.aiInput}</textarea>
            <button id="btnSendAI" class="mt-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
              ${this.aiLoading ? `<span>Generating analysis...</span>` : `<span>Ask Kenya Creates AI ➔</span>`}
            </button>
          </div>

          <!-- Response Display & 1-Click Launch -->
          ${
            this.aiResponse
              ? `
            <div class="bg-slate-950/80 border border-purple-500/20 p-4 rounded-xl text-xs text-slate-200 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line mb-3">
              ${this.aiResponse}
            </div>
            ${
              this.generatedStructuredIdea
                ? `
              <button id="btnTurnModalIdeaToProject" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition">
                ⚡ Turn this into Project Submission Now ➔
              </button>
            `
                : ''
            }
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  // --- AI SETTINGS MODAL ---
  private renderAiSettingsModal() {
    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="liquid-glass rounded-3xl max-w-md w-full p-6 relative border border-purple-500/30">
          <button id="btnCloseAiSettingsModal" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
          <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>⚙️</span> AI Provider & API Key Settings
          </h3>
          <p class="text-xs text-slate-400 mb-4">Choose your preferred AI intelligence engine or integrate your OpenAI / Gemini keys.</p>

          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Preferred AI Model Engine</label>
              <select id="selectAiEngine" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">
                <option value="auto" ${this.selectedAiProvider === 'auto' ? 'selected' : ''}>⚡ Auto (Best Available Sovereign & Cloud Key)</option>
                <option value="gemini" ${this.selectedAiProvider === 'gemini' ? 'selected' : ''}>🟢 Google Gemini 3.8 Flash (Server Built-in)</option>
                <option value="openai" ${this.selectedAiProvider === 'openai' ? 'selected' : ''}>🟣 OpenAI (GPT-4o / Custom Key)</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Your OpenAI API Key (Optional)</label>
              <input type="password" id="inputCustomOpenAiKey" value="${this.userOpenAiKey}" placeholder="sk-..." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
              <p class="text-[11px] text-slate-500 mt-1">Keys are kept strictly client-side or sent over encrypted server proxy without persistence.</p>
            </div>

            <button id="btnSaveAiSettings" class="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition">
              Save AI Configuration
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- PLEDGE MODAL ---
  private renderPledgeModal() {
    const project = this.pledgeProjectId ? storage.getProjectById(this.pledgeProjectId) : null;

    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
        <div class="liquid-glass rounded-3xl max-w-md w-full p-6 relative border border-amber-500/30">
          <button id="btnClosePledgeModal" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
          <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>🤝</span> Offer Support Pledge
          </h3>
          <p class="text-xs text-slate-400 mb-4">Support ${project ? project.title : 'Kenyan Innovation'} through tools, mentorship, testing, or micro-grants.</p>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Type of Pledge</label>
              <select id="pledgeTypeInput" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white">
                <option value="tools">Hardware Tools / Workshop Access (e.g. 3D printer, CNC, electronics lab)</option>
                <option value="mentorship">Mentorship & Technical Advisory Hours</option>
                <option value="volunteer">Volunteer Field Testing Assistance</option>
                <option value="micro_grant">Catalytic Micro-Grant / Material Donation</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Pledge Details</label>
              <textarea id="pledgeDetailsInput" rows="3" placeholder="e.g. I can offer 10 hours of free PCB soldering or 2 solar panels in Nakuru..." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"></textarea>
            </div>

            <button id="btnSubmitPledge" class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow transition">
              Submit Pledge ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- MESSAGE MODAL ---
  private renderMessageModal() {
    const recipient = this.messageRecipientId ? storage.getCreatorById(this.messageRecipientId) : null;
    const currentUser = storage.getCurrentUser();
    const thread = recipient ? storage.getMessages(currentUser.id, recipient.id) : [];

    return `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="liquid-glass rounded-2xl max-w-lg w-full p-6 relative border border-white/10">
          <button id="btnCloseMessageModal" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
          
          <h3 class="text-base font-bold text-white mb-1">Message ${recipient?.displayName || 'Creator'}</h3>
          <p class="text-xs text-slate-400 mb-4">${recipient?.field || ''}</p>

          <div class="bg-slate-950/60 p-3 rounded-xl border border-white/5 h-48 overflow-y-auto space-y-2 mb-3 text-xs">
            ${
              thread.length === 0
                ? `<div class="text-slate-500 text-center py-6">Start a conversation about collaboration or inquiries.</div>`
                : thread
                    .map(
                      (m) => `
                <div class="${m.senderId === currentUser.id ? 'text-right' : 'text-left'}">
                  <div class="inline-block p-2.5 rounded-xl max-w-[85%] ${m.senderId === currentUser.id ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}">
                    ${m.text}
                  </div>
                </div>
              `
                    )
                    .join('')
            }
          </div>

          <div class="flex gap-2">
            <input type="text" id="directMessageInput" placeholder="Type a message..." class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
            <button id="btnSendDirectMessage" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  // --- COLLABORATION APPLICATION MODAL ---
  private renderCollabApplyModal() {
    return `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="liquid-glass rounded-2xl max-w-md w-full p-6 relative border border-white/10">
          <button id="btnCloseCollabModal" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
          <h3 class="text-base font-bold text-white mb-1">Submit Collaboration Proposal</h3>
          <p class="text-xs text-slate-400 mb-4">Explain how your skills and background can assist this initiative.</p>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Skills You Offer</label>
              <input type="text" id="collabSkillsInput" placeholder="e.g. Python, PCB Design, CAD" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Your Proposal & Availability</label>
              <textarea id="collabProposalInput" rows="4" placeholder="Briefly introduce yourself and what you propose to do." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"></textarea>
            </div>

            <button id="btnSubmitCollabApplication" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition">
              Send Proposal ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- POST PROJECT UPDATE MODAL ---
  private renderPostUpdateModal() {
    return `
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="liquid-glass rounded-2xl max-w-md w-full p-6 relative border border-white/10">
          <button id="btnCloseUpdateModal" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
          <h3 class="text-base font-bold text-white mb-1">Post Project Milestone Update</h3>
          <p class="text-xs text-slate-400 mb-4">Share progress with your followers, collaborators, and the public.</p>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Update Title</label>
              <input type="text" id="updateTitleInput" placeholder="e.g. Field Trial Testing in Kangari" class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Milestone Details</label>
              <textarea id="updateDescInput" rows="4" placeholder="Explain the achievement, results, or next challenge." class="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"></textarea>
            </div>

            <button id="btnSubmitProjectUpdate" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition">
              Publish Milestone 📢
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- NOTIFICATIONS DROPDOWN ---
  private renderNotificationsDropdown() {
    const user = storage.getCurrentUser();
    const notifs = storage.getNotifications(user.id);

    return `
      <div class="absolute right-0 top-12 w-80 liquid-glass rounded-2xl shadow-2xl p-4 z-50 text-xs border border-white/15">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <span class="font-bold text-white">Notifications</span>
          <button id="btnMarkAllNotifsRead" class="text-[11px] text-emerald-400 hover:text-emerald-300">Mark all read</button>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          ${
            notifs.length === 0
              ? `<div class="text-slate-500 text-center py-4">No notifications yet.</div>`
              : notifs
                  .map(
                    (n) => `
                <div class="p-2.5 rounded-xl border ${n.read ? 'border-white/5 bg-slate-950/40 text-slate-400' : 'border-emerald-500/40 bg-emerald-950/30 text-slate-200'}">
                  <div class="font-bold text-white text-[11px]">${n.title}</div>
                  <div class="text-[10px] mt-0.5">${n.message}</div>
                </div>
              `
                  )
                  .join('')
          }
        </div>
      </div>
    `;
  }

  // --- USER MENU DROPDOWN ---
  private renderUserDropdown(user: Creator) {
    return `
      <div class="absolute right-0 top-12 w-56 liquid-glass rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 border border-white/15">
        <div class="pb-2 border-b border-white/10">
          <div class="font-bold text-white">${user.displayName}</div>
          <div class="text-slate-400 text-[11px]">Role: <strong class="text-emerald-400 capitalize">${user.role}</strong></div>
        </div>

        <button data-nav="dashboard" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-300">📊 My Dashboard</button>
        <button id="btnUserMenuSwitch" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-300">🔄 Switch Test Account</button>
        <button id="btnUserMenuExport" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-300">📥 Export Data (DPA)</button>
      </div>
    `;
  }

  // --- FOOTER ---
  private renderFooter() {
    return `
      <footer class="bg-slate-950/90 border-t border-white/10 pt-12 pb-8 text-xs text-slate-400">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">🇰🇪</span>
              <span class="font-bold text-white text-base">KENYA CREATES</span>
            </div>
            <p class="text-slate-400 leading-relaxed">
              Kenya's sovereign national digital platform for ideas, innovations, startups, and community developments across all 47 counties.
            </p>
            <div class="mt-3 text-[11px] text-slate-500">
              Compliant with the Kenya Data Protection Act 2019.
            </div>
          </div>

          <div>
            <h4 class="font-bold text-white uppercase tracking-wider mb-3">Explore Sectors</h4>
            <ul class="space-y-1.5">
              <li><a href="#" class="hover:text-emerald-400">Agriculture & AgTech</a></li>
              <li><a href="#" class="hover:text-emerald-400">Clean Energy & Water</a></li>
              <li><a href="#" class="hover:text-emerald-400">Robotics & AI</a></li>
              <li><a href="#" class="hover:text-emerald-400">Healthcare Innovations</a></li>
              <li><a href="#" class="hover:text-emerald-400">Student & TVET Projects</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white uppercase tracking-wider mb-3">Ecosystem</h4>
            <ul class="space-y-1.5">
              <li><a href="#" class="hover:text-emerald-400">Find Collaborators</a></li>
              <li><a href="#" class="hover:text-emerald-400">Grants & Accelerators</a></li>
              <li><a href="#" class="hover:text-emerald-400">Investor Discovery</a></li>
              <li><a href="#" class="hover:text-emerald-400">Diaspora Bridge</a></li>
              <li><a href="#" class="hover:text-emerald-400">County Coordinates</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white uppercase tracking-wider mb-3">KenyaOne Network</h4>
            <p class="leading-relaxed mb-2">Part of the sovereign digital infrastructure connecting innovators to global markets.</p>
            <div class="text-[11px] text-emerald-400 font-semibold">Powered by KenyaOne</div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>© ${new Date().getFullYear()} Kenya Creates. All rights reserved. Intellectual property remains with creators.</div>
          <div class="flex gap-4 mt-2 sm:mt-0">
            <a href="#" class="hover:text-slate-300">Terms of Publication</a>
            <a href="#" class="hover:text-slate-300">Privacy Policy</a>
            <a href="#" class="hover:text-slate-300">IP Transparency Notice</a>
          </div>
        </div>
      </footer>
    `;
  }

  // --- ATTACH EVENT LISTENERS ---
  private attachEventListeners() {
    // Navigation items
    document.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-nav');
        if (tab) {
          this.showNotificationsDropdown = false;
          this.showUserMenuDropdown = false;
          this.setTab(tab);
        }
      });
    });

    // Logo Click
    document.getElementById('navLogo')?.addEventListener('click', () => {
      this.setTab('home');
    });

    // Switch Role
    const switchRoleBtn = document.getElementById('btnSwitchRole');
    if (switchRoleBtn) {
      switchRoleBtn.addEventListener('click', () => {
        const users = storage.getAllUsers();
        const currentUser = storage.getCurrentUser();
        const currentIndex = users.findIndex((u) => u.id === currentUser.id);
        const nextIndex = (currentIndex + 1) % users.length;
        storage.setCurrentUserId(users[nextIndex].id);
      });
    }

    // Main Search input
    const searchInput = document.getElementById('mainSearchInput') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value;
        if (this.currentTab !== 'explore') {
          this.currentTab = 'explore';
        }
        this.render();
      });
    }

    // Hero Buttons
    document.getElementById('heroCtaExplore')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('counties-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.querySelectorAll('[data-hero-feat]').forEach((item) => {
      item.addEventListener('click', () => {
        const feat = item.getAttribute('data-hero-feat');
        if (feat === 'counties') {
          document.getElementById('counties-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (feat === 'kipi') {
          this.launchpadActiveTab = 'checklist';
          this.setTab('launchpad');
        } else if (feat === 'ai') {
          this.showAIModal = true;
          this.render();
        } else if (feat === 'harambee') {
          this.launchpadActiveTab = 'pledges';
          this.setTab('launchpad');
        }
      });
    });

    document.getElementById('heroBtnSubmit')?.addEventListener('click', () => {
      this.submissionStep = 1;
      this.showSubmissionModal = true;
      this.render();
    });

    document.getElementById('heroBtnLaunchpad')?.addEventListener('click', () => {
      this.setTab('launchpad');
    });

    document.getElementById('btnViewAllFeatured')?.addEventListener('click', () => {
      this.setTab('explore');
    });

    // Launchpad tabs
    document.querySelectorAll('[data-launchpad-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-launchpad-tab') as any;
        if (tab) {
          this.launchpadActiveTab = tab;
          this.render();
        }
      });
    });

    // Launchpad quick challenge buttons
    document.querySelectorAll('.launchpad-quick').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const prompt = (e.currentTarget as HTMLElement).getAttribute('data-prompt') || '';
        const input = document.getElementById('launchpadPrompt') as HTMLTextAreaElement | null;
        if (input) input.value = prompt;
      });
    });

    // Launchpad AI Generate
    document.getElementById('btnLaunchpadGenerate')?.addEventListener('click', () => {
      const promptInput = (document.getElementById('launchpadPrompt') as HTMLTextAreaElement)?.value;
      const countySelect = (document.getElementById('launchpadCounty') as HTMLSelectElement)?.value;
      const categorySelect = (document.getElementById('launchpadCategory') as HTMLSelectElement)?.value;

      const prompt = promptInput?.trim() || `Design an innovative solution for ${countySelect} addressing ${categorySelect}.`;
      this.triggerLaunchpadAI(prompt, countySelect, categorySelect);
    });

    // 1-Click "Turn into Project Submission"
    document.getElementById('btnTurnIdeaToProject')?.addEventListener('click', () => {
      this.transferStructuredIdeaToSubmission();
    });

    document.getElementById('btnTurnModalIdeaToProject')?.addEventListener('click', () => {
      this.showAIModal = false;
      this.transferStructuredIdeaToSubmission();
    });

    // Regulatory step toggle
    document.querySelectorAll('[data-toggle-step]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-toggle-step');
        const step = this.commercializationChecklist.find((s) => s.id === id);
        if (step) {
          if (step.status === 'pending') step.status = 'in_progress';
          else if (step.status === 'in_progress') step.status = 'completed';
          else step.status = 'pending';
          this.render();
        }
      });
    });

    // Offer Pledge Direct
    document.getElementById('btnOfferPledgeDirect')?.addEventListener('click', () => {
      this.pledgeProjectId = 'proj_1';
      this.showPledgeModal = true;
      this.render();
    });

    document.querySelectorAll('[data-pledge-project]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-pledge-project');
        if (id) {
          this.pledgeProjectId = id;
          this.showPledgeModal = true;
          this.render();
        }
      });
    });

    document.getElementById('btnClosePledgeModal')?.addEventListener('click', () => {
      this.showPledgeModal = false;
      this.render();
    });

    document.getElementById('btnSubmitPledge')?.addEventListener('click', () => {
      const type = (document.getElementById('pledgeTypeInput') as HTMLSelectElement)?.value as any;
      const details = (document.getElementById('pledgeDetailsInput') as HTMLTextAreaElement)?.value;
      const user = storage.getCurrentUser();
      const project = this.pledgeProjectId ? storage.getProjectById(this.pledgeProjectId) : null;

      if (details && details.trim()) {
        storage.addPledge({
          projectId: this.pledgeProjectId || 'proj_1',
          projectTitle: project ? project.title : 'Kenya Creates Initiative',
          contributorName: user.displayName,
          contributorCounty: user.county,
          pledgeType: type || 'tools',
          amountOrDetails: details.trim(),
        });
        this.showPledgeModal = false;
        alert('Thank you for offering your harambee pledge to this Kenyan innovation!');
        this.render();
      }
    });

    // Submit Project triggers
    document.getElementById('btnOpenSubmit')?.addEventListener('click', () => {
      this.submissionStep = 1;
      this.showSubmissionModal = true;
      this.render();
    });

    document.getElementById('btnDashboardNewProject')?.addEventListener('click', () => {
      this.submissionStep = 1;
      this.showSubmissionModal = true;
      this.render();
    });

    document.getElementById('btnSubmitDiaspora')?.addEventListener('click', () => {
      this.submissionData.isDiaspora = true;
      this.submissionStep = 1;
      this.showSubmissionModal = true;
      this.render();
    });

    // AI Assistant modal
    document.getElementById('btnOpenAI')?.addEventListener('click', () => {
      this.showAIModal = true;
      this.render();
    });

    document.getElementById('btnCloseAIModal')?.addEventListener('click', () => {
      this.showAIModal = false;
      this.render();
    });

    document.getElementById('btnOpenAiSettings')?.addEventListener('click', () => {
      this.showAiSettingsModal = true;
      this.render();
    });

    document.getElementById('btnOpenAiSettingsInModal')?.addEventListener('click', () => {
      this.showAiSettingsModal = true;
      this.render();
    });

    document.getElementById('btnCloseAiSettingsModal')?.addEventListener('click', () => {
      this.showAiSettingsModal = false;
      this.render();
    });

    document.getElementById('btnSaveAiSettings')?.addEventListener('click', () => {
      const engine = (document.getElementById('selectAiEngine') as HTMLSelectElement)?.value as any;
      const key = (document.getElementById('inputCustomOpenAiKey') as HTMLInputElement)?.value;
      this.selectedAiProvider = engine || 'auto';
      if (key !== undefined) {
        this.userOpenAiKey = key.trim();
        storage.setCustomAiKey(key.trim());
      }
      this.showAiSettingsModal = false;
      alert(`AI Configuration updated: ${this.selectedAiProvider.toUpperCase()}`);
      this.render();
    });

    document.querySelectorAll('.ai-quick-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const prompt = (e.currentTarget as HTMLElement).getAttribute('data-prompt') || '';
        const task = (e.currentTarget as HTMLElement).getAttribute('data-task') as any;
        this.aiInput = prompt;
        this.triggerAI(prompt, task);
      });
    });

    document.getElementById('btnSendAI')?.addEventListener('click', () => {
      const input = document.getElementById('aiPromptInput') as HTMLTextAreaElement | null;
      if (input && input.value.trim()) {
        this.triggerAI(input.value.trim(), 'general');
      }
    });

    // Notifications Dropdown toggle
    document.getElementById('btnToggleNotifications')?.addEventListener('click', () => {
      this.showNotificationsDropdown = !this.showNotificationsDropdown;
      this.showUserMenuDropdown = false;
      this.render();
    });

    document.getElementById('btnMarkAllNotifsRead')?.addEventListener('click', () => {
      const user = storage.getCurrentUser();
      storage.markAllNotificationsAsRead(user.id);
      this.render();
    });

    // User Menu Dropdown toggle
    document.getElementById('btnUserMenu')?.addEventListener('click', () => {
      this.showUserMenuDropdown = !this.showUserMenuDropdown;
      this.showNotificationsDropdown = false;
      this.render();
    });

    document.getElementById('btnUserMenuSwitch')?.addEventListener('click', () => {
      const users = storage.getAllUsers();
      const currentUser = storage.getCurrentUser();
      const currentIndex = users.findIndex((u) => u.id === currentUser.id);
      const nextIndex = (currentIndex + 1) % users.length;
      storage.setCurrentUserId(users[nextIndex].id);
    });

    // Export Data (DPA)
    document.getElementById('btnExportData')?.addEventListener('click', () => {
      this.handleExportData();
    });
    document.getElementById('btnUserMenuExport')?.addEventListener('click', () => {
      this.handleExportData();
    });

    // County Filter buttons
    document.querySelectorAll('.county-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const county = (e.currentTarget as HTMLElement).getAttribute('data-county');
        if (county) {
          this.selectedCounty = county;
          if (this.currentTab !== 'explore') {
            this.setTab('explore');
          } else {
            this.render();
          }
        }
      });
    });

    // Category Filter buttons
    document.querySelectorAll('.category-tile-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-category');
        if (cat) {
          this.selectedCategory = cat;
          this.setTab('explore');
        }
      });
    });

    // Select dropdown filters
    document.getElementById('filterCategorySelect')?.addEventListener('change', (e) => {
      this.selectedCategory = (e.target as HTMLSelectElement).value;
      this.render();
    });

    document.getElementById('filterCountySelect')?.addEventListener('change', (e) => {
      this.selectedCounty = (e.target as HTMLSelectElement).value;
      this.render();
    });

    document.getElementById('btnResetFilters')?.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this.selectedCounty = 'all';
      this.searchQuery = '';
      this.render();
    });

    // Open Project Card
    document.querySelectorAll('.project-card-open').forEach((card) => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-project-id');
        if (id) this.openProject(id);
      });
    });

    document.getElementById('btnCloseProjectModal')?.addEventListener('click', () => {
      this.closeProject();
    });

    // Open Creator Profile
    document.querySelectorAll('.creator-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const username = (e.currentTarget as HTMLElement).getAttribute('data-username');
        if (username) this.openCreator(username);
      });
    });

    document.getElementById('btnCloseCreatorModal')?.addEventListener('click', () => {
      this.closeCreator();
    });

    // Follow Project Toggle
    document.querySelectorAll('[data-follow-project]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).getAttribute('data-follow-project');
        if (id) {
          storage.toggleFollowProject(id);
          this.render();
        }
      });
    });

    // Save Opportunity Toggle
    document.querySelectorAll('[data-save-opp]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-save-opp');
        if (id) {
          storage.toggleSaveOpportunity(id);
          this.render();
        }
      });
    });

    // Contact Creator (Direct Message)
    document.querySelectorAll('[data-contact-creator]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const recipientId = (e.currentTarget as HTMLElement).getAttribute('data-contact-creator');
        if (recipientId) {
          this.messageRecipientId = recipientId;
          this.showMessageModal = true;
          this.render();
        }
      });
    });

    document.getElementById('btnCloseMessageModal')?.addEventListener('click', () => {
      this.showMessageModal = false;
      this.render();
    });

    document.getElementById('btnSendDirectMessage')?.addEventListener('click', () => {
      const input = document.getElementById('directMessageInput') as HTMLInputElement | null;
      if (input && input.value.trim() && this.messageRecipientId) {
        storage.sendMessage(this.messageRecipientId, input.value.trim());
        input.value = '';
        this.render();
      }
    });

    // Share Project Button
    document.getElementById('btnShareProject')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href);
      alert('Project link copied to clipboard!');
    });

    // Collaboration Application Modal
    document.querySelectorAll('[data-apply-collab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-apply-collab');
        if (id) {
          this.selectedCollabRequestId = id;
          this.showCollabApplyModal = true;
          this.render();
        }
      });
    });

    document.getElementById('btnCloseCollabModal')?.addEventListener('click', () => {
      this.showCollabApplyModal = false;
      this.render();
    });

    document.getElementById('btnSubmitCollabApplication')?.addEventListener('click', () => {
      const skillsInput = document.getElementById('collabSkillsInput') as HTMLInputElement | null;
      const proposalInput = document.getElementById('collabProposalInput') as HTMLTextAreaElement | null;
      if (proposalInput && proposalInput.value.trim() && this.selectedCollabRequestId) {
        const skills = (skillsInput?.value || '').split(',').map((s) => s.trim()).filter(Boolean);
        storage.applyForCollaboration(this.selectedCollabRequestId, proposalInput.value.trim(), skills);
        this.showCollabApplyModal = false;
        alert('Collaboration proposal submitted successfully!');
        this.render();
      }
    });

    // Post Update Modal
    document.querySelectorAll('[data-add-update]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-add-update');
        if (id) {
          this.updateProjectId = id;
          this.showPostUpdateModal = true;
          this.render();
        }
      });
    });

    document.getElementById('btnCloseUpdateModal')?.addEventListener('click', () => {
      this.showPostUpdateModal = false;
      this.render();
    });

    document.getElementById('btnSubmitProjectUpdate')?.addEventListener('click', () => {
      const titleInput = document.getElementById('updateTitleInput') as HTMLInputElement | null;
      const descInput = document.getElementById('updateDescInput') as HTMLTextAreaElement | null;
      if (titleInput && titleInput.value.trim() && descInput && descInput.value.trim() && this.updateProjectId) {
        storage.addProjectUpdate(this.updateProjectId, {
          title: titleInput.value.trim(),
          description: descInput.value.trim(),
        });
        this.showPostUpdateModal = false;
        alert('Milestone update published!');
        this.render();
      }
    });

    // Submission System Steps
    document.getElementById('btnCloseSubmitModal')?.addEventListener('click', () => {
      this.showSubmissionModal = false;
      this.render();
    });

    document.getElementById('btnSubmitNext')?.addEventListener('click', () => {
      this.saveCurrentSubmissionStep();
      if (this.submissionStep < 6) {
        this.submissionStep += 1;
        this.render();
      }
    });

    document.getElementById('btnSubmitPrev')?.addEventListener('click', () => {
      if (this.submissionStep > 1) {
        this.submissionStep -= 1;
        this.render();
      }
    });

    document.getElementById('btnSubmitDraft')?.addEventListener('click', () => {
      this.saveCurrentSubmissionStep();
      this.submissionData.status = 'draft';
      storage.createProject(this.submissionData);
      this.showSubmissionModal = false;
      alert('Project saved as private draft.');
      this.render();
    });

    document.getElementById('btnSubmitFinal')?.addEventListener('click', () => {
      this.saveCurrentSubmissionStep();
      this.submissionData.status = 'submitted';
      const created = storage.createProject(this.submissionData);
      this.showSubmissionModal = false;
      alert(`🎉 "${created.title}" submitted successfully for platform review!`);
      this.setTab('dashboard');
    });

    // Admin Actions
    document.querySelectorAll('[data-admin-approve]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-admin-approve');
        if (id) {
          storage.setProjectModeration(id, 'published', 'project_evidence_reviewed', true);
          this.render();
        }
      });
    });

    document.querySelectorAll('[data-admin-changes]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-admin-changes');
        if (id) {
          storage.setProjectModeration(id, 'changes_requested');
          this.render();
        }
      });
    });

    document.querySelectorAll('[data-admin-reject]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-admin-reject');
        if (id) {
          storage.setProjectModeration(id, 'rejected');
          this.render();
        }
      });
    });

    document.querySelectorAll('[data-admin-toggle-featured]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-admin-toggle-featured');
        const proj = id ? storage.getProjectById(id) : null;
        if (proj) {
          storage.setProjectModeration(proj.id, proj.status, proj.verificationStatus, !proj.featured);
          this.render();
        }
      });
    });

    // --- INNOVATION HUB & 50/50 PARTNERSHIP EVENT LISTENERS ---
    // Quick Hub Navigation from home banner or buttons
    document.querySelectorAll('[data-quick-hub]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).getAttribute('data-quick-hub');
        this.currentTab = 'innovation_hub';
        this.innovationHubSubTab = 'build';
        if (type === 'missing_feature' || type === 'new_business') {
          this.hubChatType = type;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.render();
      });
    });

    document.querySelectorAll('[data-quick-hub-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-quick-hub-tab');
        this.currentTab = 'innovation_hub';
        if (tab) {
          this.innovationHubSubTab = tab as any;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.render();
      });
    });

    // Innovation Hub Sub-Tabs
    document.querySelectorAll('[data-hub-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-hub-tab');
        if (tab) {
          this.innovationHubSubTab = tab as any;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.render();
        }
      });
    });

    // Pathway Selector
    document.querySelectorAll('[data-select-pathway]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const pathway = (e.currentTarget as HTMLElement).getAttribute('data-select-pathway');
        if (pathway === 'missing_feature' || pathway === 'new_business') {
          this.hubChatType = pathway;
          this.render();
        }
      });
    });

    // Hub County & Category selectors
    document.getElementById('hubCountySelect')?.addEventListener('change', (e) => {
      this.hubChatCounty = (e.target as HTMLSelectElement).value;
    });

    document.getElementById('hubCategorySelect')?.addEventListener('change', (e) => {
      this.hubChatCategory = (e.target as HTMLSelectElement).value;
    });

    // Hub Scenario Buttons (e.g. Avocado farmer prompt, Boda swapping, CBC kit)
    document.querySelectorAll('.hub-scenario-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const promptText = (e.currentTarget as HTMLElement).getAttribute('data-prompt');
        const input = document.getElementById('hubChatInput') as HTMLTextAreaElement;
        if (input && promptText) {
          input.value = promptText;
          input.focus();
        }
      });
    });

    // Send Message in Innovation Chat
    document.getElementById('btnSendHubMessage')?.addEventListener('click', async () => {
      const input = document.getElementById('hubChatInput') as HTMLTextAreaElement;
      if (!input || !input.value.trim()) return;

      const userText = input.value.trim();
      input.value = '';

      // Duplicate Idea Check
      const dup = storage.checkDuplicateIdea(userText);
      if (dup.isDuplicate && dup.matchedTitle) {
        this.hubDuplicateNotice = {
          matchedTitle: dup.matchedTitle,
          suggestion: dup.suggestion,
        };
      } else {
        this.hubDuplicateNotice = null;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.hubChatMessages.push({
        sender: 'user',
        text: userText,
        time: nowTime,
      });

      this.hubIsGenerating = true;
      this.render();

      try {
        const fullPrompt = `You are KenyaOne AI, Kenya's national sovereign innovation and partnership assistant.
Contributed Pathway: ${this.hubChatType === 'missing_feature' ? 'Suggest a Missing Feature on KenyaOne' : 'Propose a New Business, Product or National Project (50/50 National Partnership Track)'}.
Target County: ${this.hubChatCounty}. Sector: ${this.hubChatCategory}.
Contributor message: "${userText}"
Conversation so far:
${this.hubChatMessages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}`;

        const aiRes = await askKenyaCreatesAI(fullPrompt, 'innovation_chat', 'en', {
          provider: this.selectedAiProvider,
          userApiKey: this.userOpenAiKey,
          countyHint: this.hubChatCounty,
          categoryHint: this.hubChatCategory,
        });

        this.hubChatMessages.push({
          sender: 'ai',
          text: aiRes.text || 'Nimeelewa wazo lako. Wacha tuboreshe pendekezo hili liweze kuwasilishwa rasmi kwenye bodi ya KenyaOne.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } catch (err) {
        console.error('Error during AI innovation chat:', err);
        this.hubChatMessages.push({
          sender: 'ai',
          text: 'Asante sana. Wazo lako limehifadhiwa vizuri. Unaweza kuendelea kueleza jinsi suluhisho hili litakavyofanya kazi au kubofya "Generate 7-Part Proposal" kuandaa stakabadhi rasmi.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } finally {
        this.hubIsGenerating = false;
        this.render();
      }
    });

    // Generate Full 7-Part Proposal from Chat
    document.getElementById('btnGenerateFullProposal')?.addEventListener('click', async () => {
      if (this.hubChatMessages.length === 0) {
        alert('Please share your idea in the chat first so KenyaOne AI can understand the context.');
        return;
      }

      this.hubIsGenerating = true;
      this.render();

      try {
        const conversationText = this.hubChatMessages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
        const prompt = `Synthesize a comprehensive 7-part national innovation proposal for KenyaOne based on this contributor dialogue:\n\nPathway: ${this.hubChatType}\nCounty: ${this.hubChatCounty}\nCategory: ${this.hubChatCategory}\n\n${conversationText}`;

        const res = await askKenyaCreatesAI(prompt, 'generate_proposal', 'en', {
          provider: this.selectedAiProvider,
          userApiKey: this.userOpenAiKey,
          countyHint: this.hubChatCounty,
          categoryHint: this.hubChatCategory,
        });

        if (res.proposal) {
          this.hubGeneratedProposal = res.proposal;
        }
      } catch (err) {
        console.error('Failed to generate full proposal:', err);
      } finally {
        this.hubIsGenerating = false;
        this.render();
      }
    });

    // Reset Proposal Builder
    document.getElementById('btnResetProposalBuilder')?.addEventListener('click', () => {
      if (confirm('Start a fresh innovation conversation? Current chat draft will be cleared.')) {
        this.hubChatMessages = [];
        this.hubGeneratedProposal = null;
        this.hubDuplicateNotice = null;
        this.render();
      }
    });

    // Submit Proposal to KenyaOne Admin Review Board
    document.getElementById('btnSubmitProposalToAdmin')?.addEventListener('click', () => {
      const user = storage.getCurrentUser();
      const prop = this.hubGeneratedProposal;
      if (!prop) {
        alert('Please click "Generate 7-Part Proposal" first to structure your idea.');
        return;
      }

      const proposalId = `KE-PROP-2026-${Math.floor(100 + Math.random() * 900)}`;
      const title = prop.title || 'Homegrown Kenyan Innovation';
      const category = prop.category || this.hubChatCategory;
      const county = prop.county || this.hubChatCounty;

      const newProposal: InnovationProposal = {
        id: proposalId,
        type: this.hubChatType,
        title,
        category,
        county,
        contributorId: user.id,
        contributorName: user.displayName,
        contributorEmail: 'contributor@kenyaone.go.ke',
        contributorPhone: '+254 700 000000',
        originalIdea: this.hubChatMessages.filter((m) => m.sender === 'user').map((m) => m.text).join('\n') || 'Submitted concept',
        description: prop.description || 'Homegrown innovation proposed for sovereign development and commercialization.',
        submissionDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'submitted',
        confidential: false,
        isNationalScaleCandidate: true,
        partnershipEligibility: 'under_evaluation',
        partnershipOfferType: 'fifty_fifty',
        aiFeasibilityScore: prop.aiFeasibilityScore || 85,
        aiNationalImpactScore: prop.aiNationalImpactScore || 88,
        problemAnalysis: prop.problemAnalysis || {
          problem: 'Grassroots logistical and operational bottleneck.',
          limitations: 'Fragmented manual systems and lack of sovereign technical scale.',
          beneficiaries: 'Kenyan citizens, grassroots producers, and enterprises.',
          affectedCounties: [county, 'National Scale'],
          existingAlternatives: 'Expensive or foreign proprietary services.',
          whyItMatters: 'Direct socio-economic uplift and digital sovereignty.',
        },
        proposedSolution: prop.proposedSolution || {
          recommendedSolution: 'Automated digital service integrated into KenyaOne sovereign stack.',
          howItWorks: 'Citizen access -> Service matching -> Verified fulfillment -> Instant revenue share.',
          websiteFeatures: ['Single sign-on verification', 'Multi-county dashboard', 'M-Pesa automated routing'],
          mobileFeatures: ['Offline mode', 'USSD fallback', 'Instant push notifications'],
          aiIntegration: 'Multilingual conversational AI in English, Kiswahili and Sheng.',
          requiredApis: ['GovPay Gateway', 'KenyaOne Digital Identity', '47-County CDN'],
        },
        businessModel: prop.businessModel || {
          revenueStreams: ['Transaction commission (1.5%)', 'Institutional subscription tier'],
          transactionCommissions: '1.5% - 2.5% per completed commercial transaction',
          operatingExpensesEstimate: 'KES 450,000 monthly for server infrastructure and field validation.',
          potentialProfitability: 'Estimated net operating surplus of KES 3.5M - 5.8M annually.',
          financialAssumptions: '10% market adoption across target cooperatives in Year 1.',
        },
        nationalImpact: prop.nationalImpact || {
          beneficiariesEstimate: 'Over 50,000 Kenyan citizens and businesses',
          countiesCovered: `${county} and surrounding 10 counties in Phase 1`,
          employmentCreation: '120+ direct technical, logistical, and operational roles',
          economicContribution: 'Over KES 150M in trade volume facilitated annually',
          internationalExpansion: 'Expandable across East Africa Community corridors',
        },
        technicalRequirements: prop.technicalRequirements || {
          infrastructure: 'Event-driven TypeScript microservices on sovereign Kenya Cloud',
          database: 'PostgreSQL database with encrypted citizen data partitions',
          apis: ['TypeScript', 'Node.js', 'PostgreSQL', 'M-Pesa Daraja API'],
          securityRequirements: 'Strict compliance with Kenya Data Protection Act 2019',
          estimatedDevelopmentWeeks: 12,
        },
        partnershipTerms: prop.partnershipTerms || {
          qualifies5050: true,
          contributorResponsibilities: [
            'Lead grassroots user mobilization and domain workflows',
            'Provide continuous user testing and feedback',
            'Co-founding partner steering participation',
          ],
          kenyaOneResponsibilities: [
            'Develop, host and secure full production software',
            'Cover server hosting, compliance and national integrations',
            'Distribute 50% net profit share monthly',
          ],
          structureNote: 'Subject to execution of the KenyaOne 50/50 National Innovation Partnership Agreement.',
        },
        conversationHistory: this.hubChatMessages.map((m, idx) => ({
          id: `msg_${idx}`,
          sender: m.sender,
          senderName: m.sender === 'user' ? user.displayName : 'KenyaOne AI',
          message: m.text,
          timestamp: new Date().toISOString(),
        })),
        financialReports: [],
      };

      storage.saveInnovationProposal(newProposal);
      alert(`🇰🇪 Hongera! Proposal ${newProposal.id} has been submitted to the KenyaOne National Innovation Review Board.`);

      this.hubGeneratedProposal = null;
      this.hubChatMessages = [];
      this.hubDuplicateNotice = null;
      this.innovationHubSubTab = 'my_proposals';
      this.selectedProposalId = newProposal.id;
      this.render();
    });

    // Open Proposal Detail Modal
    document.querySelectorAll('.btn-open-proposal').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-proposal-id');
        if (id) {
          this.selectedProposalId = id;
          this.render();
        }
      });
    });

    // Close Proposal Detail Modal
    document.getElementById('btnCloseProposalModal')?.addEventListener('click', () => {
      this.selectedProposalId = null;
      this.render();
    });

    // Contributor Status Filter Tabs in Dashboard and InnovationList
    document.querySelectorAll('[data-contributor-filter]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).getAttribute('data-contributor-filter');
        if (filter) {
          this.contributorDashboardFilter = filter;
          this.render();
        }
      });
    });

    // Inline Contributor Reply Submission to Administrator Inquiries
    document.querySelectorAll('.btn-dashboard-submit-reply').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-proposal-id');
        if (!id) return;
        const textarea = document.getElementById(`dashboardReplyInput_${id}`) as HTMLTextAreaElement;
        if (!textarea || !textarea.value.trim()) {
          alert('Please enter your explanation or clarification before submitting.');
          return;
        }
        await proposalService.submitProposalClarification(id, textarea.value.trim());
        alert(`🇰🇪 Hongera! Your clarification for proposal ${id} has been submitted to the KenyaOne Administrator and status updated to Under Admin Review.`);
        this.render();
      });
    });

    // View Partnership Agreement Modal
    document.querySelectorAll('.btn-view-agreement').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-proposal-id');
        if (id) {
          this.selectedAgreementProposalId = id;
          this.render();
        }
      });
    });

    // Close Agreement Modal
    document.getElementById('btnCloseAgreementModal')?.addEventListener('click', () => {
      this.selectedAgreementProposalId = null;
      this.render();
    });

    // Sign Agreement as Contributor
    document.getElementById('btnSignAgreementContributor')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-proposal-id');
      if (id) {
        storage.contributorSignAgreement(id);
        alert('🎉 Hongera! You have legally executed your signature for the KenyaOne 50/50 National Partnership Agreement. Awaiting administrative countersignature.');
        this.render();
      }
    });

    // Sign Agreement as KenyaOne Admin
    document.getElementById('btnSignAgreementAdmin')?.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-proposal-id');
      if (id) {
        storage.adminSignAgreement(id);
        alert('🛡️ The KenyaOne National 50/50 Partnership Agreement has been officially countersigned by the KenyaOne Administrator. The agreement is now active and legally binding!');
        this.render();
      }
    });

    // Contributor Submit More Info / Clarification
    document.getElementById('btnSubmitModalMoreInfo')?.addEventListener('click', () => {
      const input = document.getElementById('modalMoreInfoInput') as HTMLTextAreaElement;
      if (!input || !input.value.trim() || !this.selectedProposalId) return;

      storage.contributorSubmitMoreInfo(this.selectedProposalId, input.value.trim());
      alert('Your additional information and clarification has been submitted to the KenyaOne Review Board.');
      this.render();
    });

    // Admin Action Buttons (from modal action bar or table)
    document.querySelectorAll('.btn-admin-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
        const proposalId = (e.currentTarget as HTMLElement).getAttribute('data-proposal-id');
        if (!proposalId) return;

        if (action === 'approve') {
          storage.updateProposalStatus(proposalId, 'approved', 'Approved by administrator for development and commercialization.');
          alert(`Proposal ${proposalId} approved for development and commercialization.`);
          this.render();
        } else if (action === 'offer_5050') {
          storage.adminOfferPartnership(proposalId, 'fifty_fifty', {
            kenyaOneSharePercent: 50,
            contributorSharePercent: 50,
            modelType: 'net_profit_sharing',
          });
          alert(`Official 50/50 National Partnership offer dispatched for ${proposalId}!`);
          this.render();
        } else if (action === 'assign_pm') {
          const pmName = prompt('Enter designated Project Manager Name:', 'Eng. Brian Ochieng');
          if (pmName) {
            const pmEmail = prompt('Enter Project Manager Email:', 'pm@kenyaone.go.ke') || 'pm@kenyaone.go.ke';
            storage.adminAssignProjectManager(proposalId, pmName, pmEmail);
            alert(`Project Manager ${pmName} successfully assigned to ${proposalId}.`);
            this.render();
          }
        } else if (action === 'publish') {
          storage.adminPublishInnovation(proposalId);
          alert(`Innovation ${proposalId} is now published on the National Innovations Marketplace!`);
          this.render();
        } else if (action === 'request_info') {
          const question = prompt('Enter specific questions or clarification required from the contributor:');
          if (question && question.trim()) {
            storage.adminRequestMoreInfo(proposalId, question.trim());
            alert(`Clarification request sent to the contributor of ${proposalId}.`);
            this.render();
          }
        } else if (action === 'reject') {
          const reason = prompt('Enter reason for rejection or constructive feedback:', 'Project does not currently align with national technical or commercialization priorities.');
          if (reason) {
            storage.updateProposalStatus(proposalId, 'rejected', reason);
            alert(`Proposal ${proposalId} marked as rejected.`);
            this.render();
          }
        }
      });
    });

    // Admin Command Filters
    document.getElementById('adminFilterStatus')?.addEventListener('change', (e) => {
      this.adminFilter.status = (e.target as HTMLSelectElement).value;
      this.render();
    });

    document.getElementById('adminFilterCategory')?.addEventListener('change', (e) => {
      this.adminFilter.category = (e.target as HTMLSelectElement).value;
      this.render();
    });

    document.getElementById('adminFilterSearch')?.addEventListener('input', (e) => {
      this.adminFilter.search = (e.target as HTMLInputElement).value;
      this.render();
    });

    // Switch Role to Admin shortcut
    document.getElementById('btnSwitchRoleToAdmin')?.addEventListener('click', () => {
      storage.setCurrentUserId('user_admin');
      alert('Switched to KenyaOne Administrator role.');
      this.render();
    });

    document.getElementById('btnFactoryReset')?.addEventListener('click', () => {
      if (confirm('Reset platform data to clean 47-county seed state?')) {
        storage.resetToDefaults();
        this.render();
      }
    });
  }

  private transferStructuredIdeaToSubmission() {
    if (!this.generatedStructuredIdea) return;
    this.submissionData = {
      ...this.submissionData,
      title: this.generatedStructuredIdea.title || 'Homegrown Kenyan Innovation',
      tagline: this.generatedStructuredIdea.tagline || '',
      description: `${this.generatedStructuredIdea.problemStatement}\n\n${this.generatedStructuredIdea.proposedSolution}`,
      county: this.generatedStructuredIdea.county || 'Nairobi',
      category: this.generatedStructuredIdea.category || 'tech',
      needs: this.generatedStructuredIdea.needs || ['Funding', 'Developers'],
      stage: 'prototype_dev',
      problemStatement: this.generatedStructuredIdea.problemStatement,
      proposedSolution: this.generatedStructuredIdea.proposedSolution,
    };
    this.submissionStep = 1;
    this.showSubmissionModal = true;
    this.render();
  }

  private saveCurrentSubmissionStep() {
    if (this.submissionStep === 1) {
      const title = (document.getElementById('subTitle') as HTMLInputElement)?.value;
      const tagline = (document.getElementById('subTagline') as HTMLInputElement)?.value;
      const category = (document.getElementById('subCategory') as HTMLSelectElement)?.value;
      const county = (document.getElementById('subCounty') as HTMLSelectElement)?.value;
      const desc = (document.getElementById('subDesc') as HTMLTextAreaElement)?.value;

      this.submissionData.title = title;
      this.submissionData.tagline = tagline;
      this.submissionData.category = category;
      this.submissionData.county = county;
      this.submissionData.description = desc;
    } else if (this.submissionStep === 2) {
      const stageRadio = document.querySelector('input[name="subStage"]:checked') as HTMLInputElement;
      if (stageRadio) {
        this.submissionData.stage = stageRadio.value as any;
      }
    } else if (this.submissionStep === 3) {
      const cover = (document.getElementById('subCoverImage') as HTMLInputElement)?.value;
      const video = (document.getElementById('subVideoUrl') as HTMLInputElement)?.value;
      if (cover) this.submissionData.coverImage = cover;
      if (video) this.submissionData.videoUrl = video;
    } else if (this.submissionStep === 4) {
      const checkedBoxes = Array.from(document.querySelectorAll('input[name="subNeeds"]:checked')) as HTMLInputElement[];
      this.submissionData.needs = checkedBoxes.map((cb) => cb.value);
      const custom = (document.getElementById('subCustomNeeds') as HTMLTextAreaElement)?.value;
      this.submissionData.customNeeds = custom;
    } else if (this.submissionStep === 5) {
      const vis = (document.getElementById('subVisibility') as HTMLSelectElement)?.value;
      if (vis) this.submissionData.visibility = vis as any;
    }
  }

  private async triggerAI(prompt: string, task: any) {
    this.aiLoading = true;
    this.aiResponse = 'Consulting Kenya Creates AI knowledge base...';
    this.render();

    const result = await askKenyaCreatesAI(prompt, task, 'en', {
      provider: this.selectedAiProvider,
      userApiKey: this.userOpenAiKey,
    });
    this.aiLoading = false;
    this.aiResponse = result.text || 'Unable to generate analysis. Please try again.';
    this.generatedStructuredIdea = result.structured || null;
    this.render();
  }

  private async triggerLaunchpadAI(prompt: string, county: string, category: string) {
    this.aiLoading = true;
    this.aiResponse = `Analyzing market realities in ${county} for ${category}...`;
    this.render();

    const result = await askKenyaCreatesAI(prompt, 'generate_idea', 'en', {
      provider: this.selectedAiProvider,
      userApiKey: this.userOpenAiKey,
      countyHint: county,
      categoryHint: category,
    });
    this.aiLoading = false;
    this.aiResponse = result.text || 'Unable to synthesize innovation proposal.';
    this.generatedStructuredIdea = result.structured || null;
    this.render();
  }

  private handleExportData() {
    const user = storage.getCurrentUser();
    const dataStr = storage.exportUserData(user.id);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kenya_creates_data_${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
