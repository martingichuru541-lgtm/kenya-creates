import { InnovationProposal, ProposalStatus } from '../types';
import { proposalService } from '../services/proposalService';

export interface InnovationListOptions {
  maxHeight?: string;
  showFilterBar?: boolean;
  activeFilter?: string;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export class InnovationList {
  /**
   * Helper to format ISO dates cleanly
   */
  static formatDate(isoDate: string): string {
    if (!isoDate) return 'Recently';
    try {
      const parts = isoDate.split('T')[0].split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = parts[0];
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        const day = parseInt(parts[2], 10);
        return `${month} ${day}, ${year}`;
      }
      return isoDate.split('T')[0];
    } catch {
      return isoDate;
    }
  }

  /**
   * Status badge configuration mapping each ProposalStatus to label, icon, and Tailwind classes
   */
  static getStatusBadge(status: ProposalStatus): { label: string; icon: string; classes: string } {
    const badges: Record<ProposalStatus, { label: string; icon: string; classes: string }> = {
      submitted: {
        label: 'Submitted (In Queue)',
        icon: '📥',
        classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      },
      ai_processing: {
        label: 'AI Feasibility Processing',
        icon: '⚡',
        classes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      },
      under_admin_review: {
        label: 'Under Admin Review',
        icon: '🔍',
        classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
      more_info_requested: {
        label: 'Clarification Requested',
        icon: '⚠️',
        classes: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
      },
      feasibility_assessment: {
        label: 'Feasibility Assessment',
        icon: '📐',
        classes: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      },
      partnership_evaluation: {
        label: '50/50 Partnership Evaluation',
        icon: '⚖️',
        classes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      },
      approved: {
        label: 'Approved by Administrator',
        icon: '✓',
        classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold',
      },
      in_development: {
        label: 'In Active Development',
        icon: '💻',
        classes: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      },
      testing: {
        label: 'Pilot & Quality Testing',
        icon: '🧪',
        classes: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      },
      published: {
        label: 'Live on National Marketplace',
        icon: '🌍',
        classes: 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-200 border-emerald-400/40 font-bold',
      },
      rejected: {
        label: 'Archived / Not Proceeding',
        icon: '⏹',
        classes: 'bg-slate-800 text-slate-400 border-slate-700',
      },
      draft: {
        label: 'Draft Idea',
        icon: '📝',
        classes: 'bg-slate-800 text-slate-300 border-slate-700',
      },
      archived: {
        label: 'Archived',
        icon: '📦',
        classes: 'bg-slate-900 text-slate-500 border-slate-800',
      },
    };

    return badges[status] || {
      label: status.replace(/_/g, ' '),
      icon: '📌',
      classes: 'bg-slate-800 text-slate-300 border-slate-700',
    };
  }

  /**
   * Renders a clean, scrollable card list mapping over a user's submitted innovation proposals
   */
  static render(proposals: InnovationProposal[], options: InnovationListOptions = {}): string {
    const maxHeight = options.maxHeight || 'max-h-[560px]';
    const title = options.title || 'Submitted Innovation Proposals';
    const subtitle = options.subtitle || 'Track review status, administrative feedback, and 50/50 partnership milestones';
    const activeFilter = options.activeFilter || 'all';

    // Filter proposals if an active filter is supplied
    const filteredProposals = proposals.filter((p) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'action_required') return p.status === 'more_info_requested';
      if (activeFilter === 'under_review') {
        return ['submitted', 'under_admin_review', 'feasibility_assessment', 'partnership_evaluation'].includes(p.status);
      }
      if (activeFilter === 'partnership_5050') {
        return (
          p.partnershipEligibility === 'offered_50_50' ||
          p.partnershipEligibility === 'agreement_signed' ||
          p.partnershipEligibility === 'active_partner' ||
          p.partnershipOfferType === 'fifty_fifty'
        );
      }
      if (activeFilter === 'approved') {
        return ['approved', 'in_development', 'testing', 'published'].includes(p.status);
      }
      return true;
    });

    const actionRequiredCount = proposals.filter((p) => p.status === 'more_info_requested').length;
    const underReviewCount = proposals.filter((p) =>
      ['submitted', 'under_admin_review', 'feasibility_assessment', 'partnership_evaluation'].includes(p.status)
    ).length;
    const fiftyFiftyCount = proposals.filter(
      (p) =>
        p.partnershipEligibility === 'offered_50_50' ||
        p.partnershipEligibility === 'agreement_signed' ||
        p.partnershipOfferType === 'fifty_fifty'
    ).length;

    return `
      <div class="innovation-list-component space-y-4">
        <!-- List Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 class="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>📋</span>
                <span>${title}</span>
                <span class="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ${proposals.length}
                </span>
              </h3>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${subtitle}</p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              data-quick-hub="new_business" 
              class="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Submit New Idea</span>
            </button>
          </div>
        </div>

        ${
          options.showFilterBar !== false
            ? `
          <!-- Status Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button 
              data-contributor-filter="all"
              class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeFilter === 'all'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
              }"
            >
              All Proposals (${proposals.length})
            </button>

            ${
              actionRequiredCount > 0
                ? `
              <button 
                data-contributor-filter="action_required"
                class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  activeFilter === 'action_required'
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'bg-red-950/40 text-red-300 hover:bg-red-950/70 border border-red-500/30'
                }"
              >
                ⚠️ Action Required (${actionRequiredCount})
              </button>
            `
                : ''
            }

            <button 
              data-contributor-filter="under_review"
              class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeFilter === 'under_review'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
              }"
            >
              Under Review (${underReviewCount})
            </button>

            <button 
              data-contributor-filter="partnership_5050"
              class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeFilter === 'partnership_5050'
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
              }"
            >
              🤝 50/50 Partnerships (${fiftyFiftyCount})
            </button>
          </div>
        `
            : ''
        }

        <!-- Clean Scrollable Card List Container -->
        <div class="innovation-scroll-container ${maxHeight} overflow-y-auto space-y-3 pr-1 sm:pr-2 scrollbar-thin">
          ${
            filteredProposals.length === 0
              ? `
            <div class="liquid-glass rounded-2xl p-8 text-center text-slate-400 space-y-3 border border-white/5">
              <span class="text-3xl">💡</span>
              <h4 class="text-sm font-bold text-white">No innovation proposals found</h4>
              <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                ${
                  options.emptyMessage ||
                  (proposals.length === 0
                    ? 'You have not submitted any ideas yet. Share a problem and your proposed solution with KenyaOne AI to qualify for our 50/50 co-creation partnership.'
                    : 'No proposals match the selected filter. Try choosing "All Proposals" above.')
                }
              </p>
              ${
                proposals.length === 0
                  ? `
                <button 
                  data-quick-hub="new_business" 
                  class="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Build Something Kenya Needs ➔
                </button>
              `
                  : ''
              }
            </div>
          `
              : filteredProposals
                  .map((proposal) => InnovationList.renderProposalCard(proposal))
                  .join('')
          }
        </div>
      </div>
    `;
  }

  /**
   * Renders an individual proposal item within the clean, scrollable card list
   */
  static renderProposalCard(proposal: InnovationProposal): string {
    const statusBadge = InnovationList.getStatusBadge(proposal.status);
    const formattedDate = InnovationList.formatDate(proposal.submissionDate);
    const isMissingFeature = proposal.type === 'missing_feature';
    const isActionRequired = proposal.status === 'more_info_requested';

    const has5050Offer =
      proposal.partnershipEligibility === 'offered_50_50' ||
      proposal.partnershipEligibility === 'agreement_signed' ||
      proposal.partnershipEligibility === 'active_partner' ||
      proposal.partnershipOfferType === 'fifty_fifty';

    return `
      <div 
        class="innovation-card liquid-glass-card rounded-2xl p-4 sm:p-5 border ${
          isActionRequired ? 'border-red-500/40 bg-red-950/10' : 'border-white/10'
        } hover:border-emerald-500/40 transition duration-200 space-y-3 group"
        data-proposal-card-id="${proposal.id}"
      >
        <!-- Top Metadata Row: ID, Badges & Submission Date -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <!-- Proposal ID -->
            <span class="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              ${proposal.id}
            </span>

            <!-- Current Project Status Badge -->
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.classes}">
              <span>${statusBadge.icon}</span>
              <span>${statusBadge.label}</span>
            </span>

            <!-- Category / Pathway -->
            <span class="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-white/5 text-slate-300">
              ${isMissingFeature ? '🧩 Feature' : '🚀 Business'} • ${proposal.category}
            </span>

            <!-- 50/50 Partnership Tag -->
            ${
              has5050Offer
                ? `
              <span class="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                <span>🤝</span>
                <span>50/50 Partner</span>
              </span>
            `
                : ''
            }
          </div>

          <!-- Submission Date -->
          <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span class="text-slate-500">Submitted:</span>
            <span class="font-medium text-slate-300">${formattedDate}</span>
            <span class="text-slate-500 hidden sm:inline">•</span>
            <span class="text-slate-400 hidden sm:inline">${proposal.county}</span>
          </div>
        </div>

        <!-- Proposal Title & Excerpt -->
        <div>
          <h4 
            class="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 cursor-pointer transition btn-open-proposal flex items-center gap-2"
            data-proposal-id="${proposal.id}"
          >
            <span>${proposal.title}</span>
            <span class="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition">➔</span>
          </h4>
          <p class="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            ${proposal.description || proposal.originalIdea}
          </p>
        </div>

        <!-- Metric Badges & Assigned Lead -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-slate-950/70 border border-white/5 text-slate-300">
              AI Feasibility: <strong class="text-emerald-400">${proposal.aiFeasibilityScore || 85}%</strong>
            </span>
            <span class="px-2 py-0.5 rounded-md bg-slate-950/70 border border-white/5 text-slate-300">
              Impact: <strong class="text-teal-400">${proposal.aiNationalImpactScore || 90}%</strong>
            </span>
            <span class="px-2 py-0.5 rounded-md bg-slate-950/70 border border-white/5 text-slate-300">
              Model: <strong class="text-amber-300">50/50 Profit Share</strong>
            </span>
          </div>

          <div class="text-slate-400 text-[11px]">
            ${
              proposal.assignedProjectManager
                ? `<span class="text-teal-300 font-medium">PM: ${proposal.assignedProjectManager}</span>`
                : `<span class="text-slate-500">Taskforce Review</span>`
            }
          </div>
        </div>

        <!-- Clarification Inquiry Alert Box (if action required) -->
        ${
          isActionRequired
            ? `
          <div class="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-red-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <span>⚠️</span> Administrator Inquiry Awaiting Response:
              </span>
              <span class="text-[10px] text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded">Action Required</span>
            </div>
            <p class="text-slate-200 text-xs leading-relaxed italic">
              "${proposal.adminMoreInfoRequested || 'Please provide additional implementation details or local cooperative support verification.'}"
            </p>
          </div>
        `
            : ''
        }

        <!-- Card Action Footer -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <div class="flex items-center gap-2">
            <button 
              class="btn-open-proposal px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow"
              data-proposal-id="${proposal.id}"
            >
              <span>View Full Specification</span>
              <span>➔</span>
            </button>

            ${
              proposal.agreement
                ? `
              <button 
                class="btn-view-agreement px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/40 transition flex items-center gap-1"
                data-proposal-id="${proposal.id}"
              >
                <span>📜</span>
                <span>50/50 Agreement</span>
              </button>
            `
                : ''
            }

            ${
              isActionRequired
                ? `
              <button 
                class="btn-open-proposal px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow"
                data-proposal-id="${proposal.id}"
              >
                <span>Respond to Admin</span>
                <span>✍️</span>
              </button>
            `
                : ''
            }
          </div>

          <span class="text-[11px] text-slate-500">
            Last updated: ${InnovationList.formatDate(proposal.updatedAt)}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Helper to fetch proposals for the current user and render directly
   */
  static renderForCurrentUser(options: InnovationListOptions = {}): string {
    const proposals = proposalService.getUserSubmittedProposalsSync();
    return InnovationList.render(proposals, options);
  }
}
