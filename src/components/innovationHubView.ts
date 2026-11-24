import { storage } from '../services/storageService';
import { proposalService } from '../services/proposalService';
import { InnovationProposal, Creator, ProposalStatus } from '../types';
import { COUNTIES_DATA, CATEGORIES_DATA } from '../data/seedData';
import { ContributorInnovationDashboard } from './ContributorInnovationDashboard';

export type InnovationHubSubTab = 'build' | 'my_proposals' | 'partnership_5050' | 'admin_command' | 'marketplace';

export class InnovationHubRenderer {
  /**
   * Main Hub Container
   */
  static renderHub(
    currentSubTab: InnovationHubSubTab,
    currentUser: Creator,
    chatState: {
      type: 'missing_feature' | 'new_business';
      county: string;
      category: string;
      messages: { sender: 'user' | 'ai'; text: string; time: string }[];
      isGenerating: boolean;
      generatedProposal: Partial<InnovationProposal> | null;
      duplicateNotice: { matchedTitle?: string; suggestion?: string } | null;
    },
    adminFilter: {
      status: string;
      category: string;
      search: string;
    }
  ): string {
    const isAdmin = currentUser.role === 'admin';
    const stats = storage.getInnovationHubStats();
    const myProposals = storage.getInnovationProposals({ contributorId: currentUser.id });

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Top Sovereign Banner -->
        <div class="liquid-glass rounded-3xl p-6 sm:p-10 border border-emerald-500/30 relative overflow-hidden">
          <div class="absolute -right-12 -bottom-12 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="max-w-4xl relative z-10">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="bg-emerald-950/90 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Sovereign Co-Creation Engine
              </span>
              <span class="bg-amber-950/80 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full text-xs font-semibold">
                50/50 National Partnership
              </span>
              <span class="text-xs text-slate-400">Powered by KenyaOne</span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Build Something <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Kenya Needs</span>
            </h1>

            <p class="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-3xl">
              <strong>Your Idea. Our Technology. Kenya's Opportunity.</strong> <br class="hidden sm:inline"/>
              Don't just leave a review. Tell KenyaOne AI what you want to build. From smallholder farmers to diaspora innovators, qualify for a transparent <strong>50/50 national partnership</strong> to co-develop, launch, and commercialize solutions across all 47 counties.
            </p>

            <!-- Navigation Tabs for Innovation Hub -->
            <div class="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <button data-hub-tab="build" class="px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 ${
                currentSubTab === 'build'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-bold border border-emerald-400/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                <span>⚡</span> Build with KenyaOne AI
              </button>

              <button data-hub-tab="my_proposals" class="px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 ${
                currentSubTab === 'my_proposals'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-bold border border-emerald-400/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                <span>📋</span> My Innovation Dashboard (${myProposals.length})
              </button>

              <button data-hub-tab="partnership_5050" class="px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 ${
                currentSubTab === 'partnership_5050'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-bold border border-emerald-400/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                <span>🤝</span> 50/50 Partnership Programme
              </button>

              <button data-hub-tab="marketplace" class="px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 ${
                currentSubTab === 'marketplace'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-bold border border-emerald-400/30'
                  : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:bg-slate-800'
              }">
                <span>🌍</span> National Innovations (${stats.total})
              </button>

              ${
                isAdmin
                  ? `
                <button data-hub-tab="admin_command" class="px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 ${
                  currentSubTab === 'admin_command'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-bold border border-purple-400/30'
                    : 'bg-purple-950/70 text-purple-200 border border-purple-500/30 hover:bg-purple-900/60'
                }">
                  <span>🏛️</span> Admin Command Centre (${stats.newSubmissions + stats.awaitingReview} Pending)
                </button>
              `
                  : ''
              }
            </div>
          </div>
        </div>

        <!-- Render Specific Sub-View -->
        ${
          currentSubTab === 'build'
            ? InnovationHubRenderer.renderBuildSection(chatState, currentUser)
            : currentSubTab === 'my_proposals'
              ? InnovationHubRenderer.renderMyProposalsSection(currentUser)
              : currentSubTab === 'partnership_5050'
                ? InnovationHubRenderer.renderFiftyFiftySection()
                : currentSubTab === 'admin_command'
                  ? InnovationHubRenderer.renderAdminCommandSection(adminFilter)
                  : currentSubTab === 'marketplace'
                    ? InnovationHubRenderer.renderMarketplaceSection()
                    : InnovationHubRenderer.renderBuildSection(chatState, currentUser)
        }
      </div>
    `;
  }

  /**
   * VIEW 1: BUILD SOMETHING KENYA NEEDS (Conversational AI Assistant + 2 Pathways)
   */
  static renderBuildSection(
    chatState: {
      type: 'missing_feature' | 'new_business';
      county: string;
      category: string;
      messages: { sender: 'user' | 'ai'; text: string; time: string }[];
      isGenerating: boolean;
      generatedProposal: Partial<InnovationProposal> | null;
      duplicateNotice: { matchedTitle?: string; suggestion?: string } | null;
    },
    currentUser: Creator
  ): string {
    const isMissingFeature = chatState.type === 'missing_feature';

    return `
      <div class="space-y-8">
        <!-- Two Clear Pathways Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Pathway A: Missing Feature -->
          <div data-select-pathway="missing_feature" class="liquid-glass-card rounded-2xl p-6 cursor-pointer border transition duration-300 relative ${
            isMissingFeature
              ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
              : 'border-white/10 hover:border-emerald-400/30'
          }">
            <div class="flex items-center justify-between mb-3">
              <span class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg font-bold">
                🛠️
              </span>
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isMissingFeature ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }">
                ${isMissingFeature ? 'Active Pathway' : 'Pathway A'}
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Suggest a Missing Feature on KenyaOne</h3>
            <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Notice a capability missing on KenyaOne? (e.g. offline SMS sync for pastoralist schools, M-Pesa group escrow, crop disease diagnosis). Propose it to our core engineering team!
            </p>
          </div>

          <!-- Pathway B: New Business or National Project -->
          <div data-select-pathway="new_business" class="liquid-glass-card rounded-2xl p-6 cursor-pointer border transition duration-300 relative ${
            !isMissingFeature
              ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
              : 'border-white/10 hover:border-emerald-400/30'
          }">
            <div class="flex items-center justify-between mb-3">
              <span class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg font-bold">
                🚀
              </span>
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                !isMissingFeature ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }">
                ${!isMissingFeature ? 'Active Pathway' : 'Pathway B'}
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Propose a New Business, Product or National Service</h3>
            <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Have an idea for a revolutionary commercial service? (e.g. farm-to-supermarket export exchange, solar battery swapping, drone logistics). Qualify for the <strong>50/50 National Partnership</strong>!
            </p>
          </div>
        </div>

        <!-- Conversational Innovation Interface & Form Controls -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Context Inputs & Prompt Helper (5 cols) -->
          <div class="lg:col-span-5 space-y-5">
            <div class="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 text-base">🇰🇪</span>
                  <span class="font-bold text-white text-sm">
                    ${isMissingFeature ? 'Missing Platform Feature Setup' : 'National Project Setup'}
                  </span>
                </div>
                <span class="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                  Natural AI Dialogue
                </span>
              </div>

              <!-- County & Category Selectors -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Target County</label>
                  <select id="hubInputCounty" class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                    ${COUNTIES_DATA.map((c) => `<option value="${c.name}" ${c.name === chatState.county ? 'selected' : ''}>${c.name}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Sector Focus</label>
                  <select id="hubInputCategory" class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                    ${CATEGORIES_DATA.map((cat) => `<option value="${cat.name}" ${cat.name === chatState.category ? 'selected' : ''}>${cat.name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Quick Kenyan Scenario Prompts -->
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Inspiring Realities Across Kenya:</label>
                <div class="space-y-1.5 text-left">
                  <button class="hub-scenario-btn w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-white transition group" data-prompt="I am an avocado farmer in Murang'a. KenyaOne needs a direct B2B trading exchange so farmers sell directly to supermarkets and European exporters without middlemen taking 60% of our money.">
                    <span class="font-semibold text-emerald-400 block group-hover:underline">🥑 Murang'a Avocado Farmer:</span>
                    <span class="text-[11px] text-slate-400 line-clamp-1">Direct export exchange without broker cartels taking 60%</span>
                  </button>
                  <button class="hub-scenario-btn w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-white transition group" data-prompt="Over 200,000 bodaboda riders in the Rift Valley spend 900 bob daily on petrol. We need solar battery swap cabinets where a rider swaps in 45 seconds for 150 bob.">
                    <span class="font-semibold text-amber-400 block group-hover:underline">🛵 Rift Valley Bodaboda Swaps:</span>
                    <span class="text-[11px] text-slate-400 line-clamp-1">Universal solar battery swapping cabinets for Eldoret & Nakuru</span>
                  </button>
                  <button class="hub-scenario-btn w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-white transition group" data-prompt="KenyaOne needs an offline vernacular audio companion so pastoralist children in Turkana and Marsabit can learn CBC science without internet or cell coverage.">
                    <span class="font-semibold text-teal-400 block group-hover:underline">📚 Pastoralist Offline CBC Voice:</span>
                    <span class="text-[11px] text-slate-400 line-clamp-1">Offline indigenous language voice models on solar tablets</span>
                  </button>
                </div>
              </div>

              <!-- Duplicate Detection Notice if triggered -->
              ${
                chatState.duplicateNotice
                  ? `
                <div class="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-1">
                  <div class="font-bold flex items-center gap-1.5 text-amber-300">
                    <span>💡</span> Existing Initiative Detected: "${chatState.duplicateNotice.matchedTitle}"
                  </div>
                  <p class="text-[11px] text-slate-300 leading-relaxed">${chatState.duplicateNotice.suggestion}</p>
                </div>
              `
                  : ''
              }

              <!-- User Trust & IP Declaration Notice -->
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 space-y-1.5">
                <div class="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>🛡️</span> Intellectual Property & 50/50 Terms
                </div>
                <p class="leading-relaxed">
                  Your ideas are protected under the Kenya Data Protection Act 2019. Submission does not guarantee partnership approval. Qualifying projects are formally reviewed by the KenyaOne Administrator before executing binding 50/50 contracts.
                </p>
                <label class="flex items-center gap-2 pt-1 text-slate-300 cursor-pointer">
                  <input type="checkbox" id="hubConfidentialCheckbox" class="rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-white/20" checked/>
                  <span>Mark submission as confidential during evaluation</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Right: Conversational Dialogue & Auto-Generated 7-Part Proposal (7 cols) -->
          <div class="lg:col-span-7 space-y-5">
            <div class="liquid-glass rounded-2xl p-6 border border-white/10 flex flex-col h-[560px]">
              <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="font-bold text-white text-xs sm:text-sm">KenyaOne AI Innovation Co-Founder</span>
                </div>
                <span class="text-[11px] text-slate-400">English • Kiswahili • Sheng</span>
              </div>

              <!-- Message History Scroll Area -->
              <div id="hubChatMessages" class="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                ${
                  chatState.messages.length === 0
                    ? `
                  <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                    <span class="text-3xl">🇰🇪</span>
                    <h4 class="font-bold text-white text-sm">Tell KenyaOne AI what you want to build.</h4>
                    <p class="text-xs max-w-md leading-relaxed text-slate-300">
                      Explain in your own words. For example: <em>"I want a direct cold-chain transport network for mango farmers in Machakos so brokers don't dictate prices."</em>
                    </p>
                  </div>
                `
                    : chatState.messages
                        .map(
                          (m) => `
                    <div class="${m.sender === 'user' ? 'text-right' : 'text-left'}">
                      <div class="inline-block p-3.5 rounded-2xl max-w-[90%] leading-relaxed whitespace-pre-line text-left ${
                        m.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-900/40'
                          : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none'
                      }">
                        ${m.text}
                        <div class="text-[9px] mt-1.5 opacity-60 text-right">${m.time}</div>
                      </div>
                    </div>
                  `
                        )
                        .join('')
                }

                ${
                  chatState.isGenerating
                    ? `
                  <div class="text-left">
                    <div class="inline-block p-3.5 rounded-2xl bg-slate-900/90 text-emerald-300 border border-emerald-500/30 rounded-bl-none text-xs flex items-center gap-2">
                      <span class="animate-spin text-base">⚙️</span>
                      <span>KenyaOne AI is formulating the structured 7-part proposal and assessing national feasibility...</span>
                    </div>
                  </div>
                `
                    : ''
                }
              </div>

              <!-- Chat Input Bar -->
              <div class="mt-3 pt-3 border-t border-white/10 space-y-2">
                <div class="flex gap-2">
                  <textarea 
                    id="hubChatInput" 
                    rows="2" 
                    placeholder="Type in English, Kiswahili or Sheng (e.g. 'Mimi ni mkulima wa viazi Nyandarua, nahitaji cold room...')" 
                    class="flex-1 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  ></textarea>
                  <button 
                    id="btnSendHubMessage" 
                    class="px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex flex-col items-center justify-center gap-1"
                  >
                    <span>Send</span>
                    <span class="text-sm">➔</span>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <button id="btnGenerateFullProposal" class="text-xs bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg transition shadow flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Generate Structured 7-Part Proposal</span>
                  </button>

                  <button id="btnClearHubChat" class="text-[11px] text-slate-400 hover:text-slate-200">
                    Clear Chat
                  </button>
                </div>
              </div>
            </div>

            <!-- Preview of Generated 7-Part Proposal (if generated) -->
            ${
              chatState.generatedProposal
                ? `
              <div class="liquid-glass rounded-2xl p-6 border border-emerald-500/40 space-y-4 animate-fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ${chatState.generatedProposal.id || 'KE-PROP-2026-DRAFT'}
                    </span>
                    <h3 class="text-base font-bold text-white mt-1">${chatState.generatedProposal.title}</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Impact: ${chatState.generatedProposal.aiNationalImpactScore}%
                    </span>
                    <span class="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      50/50 Eligible
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <span class="text-slate-400 font-semibold block text-[10px] uppercase">Problem Being Solved</span>
                    <p class="text-slate-200 text-[11px] line-clamp-3">${chatState.generatedProposal.problemAnalysis?.problem}</p>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <span class="text-slate-400 font-semibold block text-[10px] uppercase">Proposed Solution</span>
                    <p class="text-slate-200 text-[11px] line-clamp-3">${chatState.generatedProposal.proposedSolution?.recommendedSolution}</p>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div class="text-[11px] text-slate-300">
                    Ready to send to the <strong>KenyaOne Administrator</strong> for review and 50/50 co-development evaluation.
                  </div>
                  <button id="btnSubmitProposalToAdmin" class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:scale-105 flex items-center justify-center gap-2">
                    <span>Submit Proposal to Administrator</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VIEW 2: CONTRIBUTOR DASHBOARD (My Submitted Ideas, Proposals, Status Timelines, Agreements)
   */
  static renderMyProposalsSection(currentUser: Creator): string {
    return ContributorInnovationDashboard.render(currentUser);
  }

  /**
   * VIEW 3: 50/50 NATIONAL PARTNERSHIP PROGRAMME (Policy & Legal Framework)
   */
  static renderFiftyFiftySection(): string {
    return `
      <div class="space-y-8">
        <!-- Header & Pillar Manifesto -->
        <div class="liquid-glass rounded-3xl p-6 sm:p-10 border border-amber-500/30 relative overflow-hidden">
          <div class="max-w-3xl space-y-3">
            <span class="bg-amber-950/90 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              National Co-Development Framework
            </span>
            <h2 class="text-3xl sm:text-4xl font-black text-white">
              The KenyaOne <span class="text-amber-400">50/50 Innovation Partnership</span>
            </h2>
            <p class="text-sm text-slate-300 leading-relaxed">
              KenyaOne believes that brilliant ideas come from the ground—from the farmer in Murang'a, the mechanic in Eldoret, the nurse in Marsabit, the student in Mombasa, and the researcher in diaspora. When you originate an idea that qualifies for national scale, we don't just take it: we invite you into a formal, binding 50/50 partnership.
            </p>
          </div>
        </div>

        <!-- 3 Core Tenets Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="liquid-glass-card rounded-2xl p-6 border border-white/10 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl font-bold">
              ⚖️
            </div>
            <h3 class="text-base font-bold text-white">50% KenyaOne / 50% Contributor</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Contractually defined net profit sharing or equity ownership established in a signed project agreement. We provide technology, cloud servers, and national deployment; you provide domain leadership.
            </p>
          </div>

          <div class="liquid-glass-card rounded-2xl p-6 border border-white/10 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl font-bold">
              🛡️
            </div>
            <h3 class="text-base font-bold text-white">KIPI & Sovereign IP Co-Protection</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Joint patent and trademark registration with the Kenya Industrial Property Institute (KIPI). Protects your invention from foreign exploitation while maintaining Kenyan digital sovereignty.
            </p>
          </div>

          <div class="liquid-glass-card rounded-2xl p-6 border border-white/10 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-xl font-bold">
              📊
            </div>
            <h3 class="text-base font-bold text-white">Transparent Digital Accounting</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Every shilling tracked in a real-time ledger. Monthly audited financial reconciliations with automated M-Pesa or bank distributions directly to verified partners.
            </p>
          </div>
        </div>

        <!-- Sample Financial Illustration Card -->
        <div class="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 class="text-base font-bold text-white">Sample Commercial 50/50 Distribution Model</h3>
              <p class="text-xs text-slate-400">Illustrative monthly projection for an active commercial logistics or B2B platform.</p>
            </div>
            <span class="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-white/5">
              Audited Net Profit Model
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span class="text-slate-400 block text-[10px] uppercase">Monthly Gross Revenue</span>
              <span class="text-lg font-bold text-white mt-1 block">KES 2,450,000</span>
              <span class="text-[10px] text-slate-500">From commercial off-take</span>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span class="text-slate-400 block text-[10px] uppercase">Operating & Server Costs</span>
              <span class="text-lg font-bold text-red-400 mt-1 block">- KES 650,000</span>
              <span class="text-[10px] text-slate-500">Depot telemetry, hosting</span>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span class="text-slate-400 block text-[10px] uppercase">Taxes & Statutory Fees</span>
              <span class="text-lg font-bold text-amber-400 mt-1 block">- KES 360,000</span>
              <span class="text-[10px] text-slate-500">KRA eTIMS & withholding</span>
            </div>
            <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <span class="text-emerald-300 font-semibold block text-[10px] uppercase">Net Distributable</span>
              <span class="text-lg font-bold text-emerald-400 mt-1 block">KES 1,440,000</span>
              <span class="text-[10px] text-emerald-400">50% Partner = KES 720,000</span>
            </div>
          </div>
        </div>

        <!-- 6 Rigorous Eligibility Criteria -->
        <div class="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
          <h3 class="text-base font-bold text-white">How Ideas are Evaluated for 50/50 Partnerships</h3>
          <p class="text-xs text-slate-300">Not every proposal automatically qualifies for a 50% equity or profit share. Our administration evaluates each submission against 6 criteria:</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <strong class="text-emerald-400 block mb-0.5">1. National Scalability</strong>
              <span class="text-slate-300 text-[11px]">Can this expand from your home county to impact multiple counties or all 47 counties?</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <strong class="text-emerald-400 block mb-0.5">2. Practical Ground Demand</strong>
              <span class="text-slate-300 text-[11px]">Does this solve a painful bottleneck where Kenyans or enterprises are already suffering or spending money?</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <strong class="text-emerald-400 block mb-0.5">3. Contributor Domain Leadership</strong>
              <span class="text-slate-300 text-[11px]">Are you ready to be the domain champion, mobilize grassroots users, and co-lead operations?</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <strong class="text-emerald-400 block mb-0.5">4. Sustainable Revenue Model</strong>
              <span class="text-slate-300 text-[11px]">Can the initiative fund its own cloud servers, logistics, and personnel after initial deployment?</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <strong class="text-emerald-400 block mb-0.5">5. Regulatory Feasibility</strong>
              <span class="text-slate-300 text-[11px]">Can it pass KEBS, KICA, KRA, or Central Bank of Kenya compliance cleanly?</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <strong class="text-emerald-400 block mb-0.5">6. Sovereign Value Retention</strong>
              <span class="text-slate-300 text-[11px]">Does the majority of generated wealth, data, and employment stay inside Kenya?</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VIEW 4: ADMIN INNOVATION COMMAND CENTRE
   */
  static renderAdminCommandSection(adminFilter: { status: string; category: string; search: string }): string {
    const stats = storage.getInnovationHubStats();
    const proposals = storage.getInnovationProposals({
      status: adminFilter.status !== 'all' ? (adminFilter.status as ProposalStatus) : undefined,
      category: adminFilter.category !== 'all' ? adminFilter.category : undefined,
      search: adminFilter.search,
    });
    const auditLogs = storage.getInnovationAuditLogs().slice(0, 8);

    return `
      <div class="space-y-8">
        <!-- Live Admin Stat KPI Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div class="liquid-glass-card rounded-2xl p-4">
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">Total Received</span>
            <div class="text-2xl font-black text-white mt-1">${stats.total}</div>
            <span class="text-[10px] text-slate-500">Across 47 counties</span>
          </div>

          <div class="liquid-glass-card rounded-2xl p-4 border-amber-500/30 bg-amber-950/10">
            <span class="text-amber-300 block text-[10px] uppercase font-semibold">Awaiting Review</span>
            <div class="text-2xl font-black text-amber-400 mt-1">${stats.newSubmissions + stats.awaitingReview}</div>
            <span class="text-[10px] text-amber-400">Needs administrative evaluation</span>
          </div>

          <div class="liquid-glass-card rounded-2xl p-4 border-emerald-500/30 bg-emerald-950/10">
            <span class="text-emerald-300 block text-[10px] uppercase font-semibold">50/50 Candidates</span>
            <div class="text-2xl font-black text-emerald-400 mt-1">${stats.partnershipCandidates}</div>
            <span class="text-[10px] text-emerald-400">Qualifying national scale</span>
          </div>

          <div class="liquid-glass-card rounded-2xl p-4">
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">In Development</span>
            <div class="text-2xl font-black text-teal-400 mt-1">${stats.inDevelopment}</div>
            <span class="text-[10px] text-teal-400">Assigned engineering teams</span>
          </div>

          <div class="liquid-glass-card rounded-2xl p-4">
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">Published Live</span>
            <div class="text-2xl font-black text-indigo-400 mt-1">${stats.published}</div>
            <span class="text-[10px] text-indigo-400">National marketplace active</span>
          </div>

          <div class="liquid-glass-card rounded-2xl p-4 border-purple-500/30">
            <span class="text-purple-300 block text-[10px] uppercase font-semibold">Gross Tracked Revenue</span>
            <div class="text-lg font-black text-purple-300 mt-1">KES ${(stats.totalGrossRevenue / 1000000).toFixed(1)}M</div>
            <span class="text-[10px] text-purple-400">50% shared with contributors</span>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="liquid-glass rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select id="adminFilterStatus" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs">
              <option value="all" ${adminFilter.status === 'all' ? 'selected' : ''}>All Review Statuses</option>
              <option value="submitted" ${adminFilter.status === 'submitted' ? 'selected' : ''}>New Submissions</option>
              <option value="under_admin_review" ${adminFilter.status === 'under_admin_review' ? 'selected' : ''}>Under Admin Review</option>
              <option value="partnership_evaluation" ${adminFilter.status === 'partnership_evaluation' ? 'selected' : ''}>50/50 Partnership Evaluation</option>
              <option value="more_info_requested" ${adminFilter.status === 'more_info_requested' ? 'selected' : ''}>More Info Needed</option>
              <option value="approved" ${adminFilter.status === 'approved' ? 'selected' : ''}>Approved Proposals</option>
              <option value="in_development" ${adminFilter.status === 'in_development' ? 'selected' : ''}>In Development</option>
              <option value="published" ${adminFilter.status === 'published' ? 'selected' : ''}>Published Live</option>
            </select>

            <select id="adminFilterCategory" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs">
              <option value="all">All Sectors</option>
              ${CATEGORIES_DATA.map((c) => `<option value="${c.name}" ${adminFilter.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

          <div class="w-full sm:w-64">
            <input 
              type="text" 
              id="adminFilterSearch" 
              value="${adminFilter.search}" 
              placeholder="Search by title, county, ID..." 
              class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <!-- Proposals List with Admin Direct Control Actions -->
        <div class="space-y-4">
          <div class="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong>${proposals.length}</strong> matching proposals</span>
            <span>Administrator Final Decision Authority Enabled</span>
          </div>

          ${
            proposals.length === 0
              ? `<div class="p-8 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-white/5">No proposals match current filters.</div>`
              : proposals.map((p) => InnovationHubRenderer.renderProposalCard(p, false, true)).join('')
          }
        </div>

        <!-- Administrative Audit Log Feed -->
        <div class="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📜</span> Administrative Audit Trail & Decision Log
            </h3>
            <span class="text-[11px] text-slate-400">Immutable Log</span>
          </div>

          <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
            ${auditLogs
              .map(
                (log) => `
              <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-emerald-400 text-[11px]">${log.action}</span>
                    <span class="text-[10px] text-slate-500 font-mono">${log.proposalId}</span>
                  </div>
                  <p class="text-slate-300 text-[11px] mt-0.5">${log.details}</p>
                </div>
                <div class="text-right text-[10px] text-slate-500 whitespace-nowrap">
                  <div>${log.adminName}</div>
                  <div>${new Date(log.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VIEW 5: NATIONAL INNOVATIONS MARKETPLACE (Public Showcase)
   */
  static renderMarketplaceSection(): string {
    const published = storage.getInnovationProposals({
      status: 'published',
    });
    const inDev = storage.getInnovationProposals({
      status: 'in_development',
    });
    const approvedPartnerships = storage.getInnovationProposals({
      isNationalCandidate: true,
    });

    const displayList = [...published, ...inDev, ...approvedPartnerships].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );

    return `
      <div class="space-y-8">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <span>🌍</span> KenyaOne National Innovation Marketplace
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Publicly approved national projects co-developed with Kenyan citizens under the 50/50 National Partnership Programme.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${displayList.map((p) => InnovationHubRenderer.renderMarketplaceCard(p)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * REUSABLE COMPONENT: PROPOSAL CARD (For Contributor Dashboard & Admin Command Center)
   */
  static renderProposalCard(proposal: InnovationProposal, isContributorView = false, isAdminView = false): string {
    const statusBadges: Record<string, { label: string; class: string }> = {
      submitted: { label: 'New Submission', class: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      under_admin_review: { label: 'Under Admin Review', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      more_info_requested: { label: 'More Info Needed', class: 'bg-red-500/20 text-red-300 border-red-500/30' },
      partnership_evaluation: { label: '50/50 Partnership Evaluation', class: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      approved: { label: 'Approved Project', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      in_development: { label: 'In Development', class: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
      published: { label: 'Published Live', class: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
      rejected: { label: 'Not Proceeding', class: 'bg-slate-800 text-slate-400 border-slate-700' },
    };

    const statusBadge = statusBadges[proposal.status] || {
      label: proposal.status.replace(/_/g, ' '),
      class: 'bg-slate-800 text-slate-300 border-slate-700',
    };

    return `
      <div class="liquid-glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
              ${proposal.id}
            </span>
            <span class="text-xs px-2.5 py-0.5 rounded-full border ${statusBadge.class} font-semibold">
              ${statusBadge.label}
            </span>
            ${
              proposal.partnershipEligibility === 'offered_50_50' || proposal.partnershipEligibility === 'agreement_signed'
                ? `<span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">🤝 50/50 Partner</span>`
                : ''
            }
          </div>

          <div class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Submitted: ${proposal.submissionDate}</span>
            <span>•</span>
            <span class="font-medium text-slate-300">${proposal.county} County</span>
          </div>
        </div>

        <div>
          <h3 class="text-base sm:text-lg font-bold text-white hover:text-emerald-300 cursor-pointer btn-open-proposal" data-proposal-id="${proposal.id}">
            ${proposal.title}
          </h3>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">${proposal.description}</p>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">AI Feasibility</span>
            <span class="font-bold text-emerald-400 text-sm">${proposal.aiFeasibilityScore}%</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">National Impact</span>
            <span class="font-bold text-teal-400 text-sm">${proposal.aiNationalImpactScore}%</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">Sector Focus</span>
            <span class="font-bold text-white text-xs truncate block">${proposal.category}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">Contributor</span>
            <span class="font-bold text-slate-200 text-xs truncate block">${proposal.contributorName}</span>
          </div>
        </div>

        <!-- Action / Admin Notification Banner if More Info Needed or Feedback exists -->
        ${
          proposal.status === 'more_info_requested'
            ? `
          <div class="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="space-y-0.5">
              <strong class="text-red-300 block font-semibold">Administrator Requested Additional Information:</strong>
              <p class="text-slate-300 text-[11px]">${proposal.adminMoreInfoRequested || 'Please provide details on certification and rollout.'}</p>
            </div>
            ${
              isContributorView
                ? `
              <button class="btn-reply-more-info px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition whitespace-nowrap" data-proposal-id="${proposal.id}">
                Respond Now ✍️
              </button>
            `
                : ''
            }
          </div>
        `
            : proposal.adminFeedback
              ? `
          <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
            <span class="text-slate-400 font-semibold text-[10px] uppercase block">Admin Review Note:</span>
            <p class="text-slate-200 text-[11px] mt-0.5">${proposal.adminFeedback}</p>
          </div>
        `
              : ''
        }

        <!-- Bottom Controls -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <div class="flex items-center gap-2">
            <button class="btn-open-proposal text-emerald-400 hover:text-emerald-300 font-bold" data-proposal-id="${proposal.id}">
              View Full 7-Part Proposal ➔
            </button>
            ${
              proposal.agreement
                ? `
              <button class="btn-view-agreement px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold border border-amber-500/30" data-proposal-id="${proposal.id}">
                📜 50/50 Agreement (${proposal.agreement.status})
              </button>
            `
                : ''
            }
          </div>

          ${
            isAdminView
              ? `
            <div class="flex items-center gap-1.5 flex-wrap">
              <button class="btn-admin-action px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs" data-action="approve" data-proposal-id="${proposal.id}">
                Approve
              </button>
              <button class="btn-admin-action px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs" data-action="offer_5050" data-proposal-id="${proposal.id}">
                Offer 50/50
              </button>
              <button class="btn-admin-action px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs" data-action="request_info" data-proposal-id="${proposal.id}">
                Request Info
              </button>
              <button class="btn-admin-action px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold" data-action="assign_pm" data-proposal-id="${proposal.id}">
                Assign PM
              </button>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  /**
   * REUSABLE COMPONENT: MARKETPLACE CARD
   */
  static renderMarketplaceCard(proposal: InnovationProposal): string {
    return `
      <div class="liquid-glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4 hover:border-emerald-400/40 transition duration-300">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              ${proposal.category}
            </span>
            <span class="text-[11px] text-slate-400">${proposal.county} County</span>
          </div>

          <h3 class="text-base font-bold text-white">${proposal.title}</h3>
          <p class="text-xs text-slate-300 leading-relaxed line-clamp-3">${proposal.description}</p>
        </div>

        <div class="pt-3 border-t border-white/5 space-y-2 text-xs">
          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span>Co-Founder: <strong class="text-slate-200">${proposal.contributorName}</strong></span>
            <span class="text-amber-400 font-semibold">50/50 Venture</span>
          </div>

          <button class="btn-open-proposal w-full py-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 hover:text-white font-bold rounded-xl border border-white/10 transition text-center" data-proposal-id="${proposal.id}">
            View Project Details & Inquiries ➔
          </button>
        </div>
      </div>
    `;
  }
}
