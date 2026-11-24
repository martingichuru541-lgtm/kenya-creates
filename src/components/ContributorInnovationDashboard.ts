import { storage } from '../services/storageService';
import { proposalService } from '../services/proposalService';
import { InnovationProposal, Creator, ProposalStatus } from '../types';

export class ContributorInnovationDashboard {
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
        label: 'Submitted (Awaiting Queue)',
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
        classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold',
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
   * Main render method for the Contributor Innovation Dashboard component.
   * Fetches proposals from the database for the current contributor and maps them into
   * clean liquid-glass-card items displaying Title, Submission Date, and Status.
   */
  static render(currentUser?: Creator, filterStatus: string = 'all'): string {
    const user = currentUser || storage.getCurrentUser();

    // Fetch user's submitted innovation proposals using the database service
    const myProposals = storage.getInnovationProposals({ contributorId: user.id });

    // Identify proposals requiring immediate contributor attention
    const actionRequiredProposals = myProposals.filter(
      (p) => p.status === 'more_info_requested' || (p.adminMoreInfoRequested && !p.contributorResponse)
    );

    // Identify proposals with general admin feedback
    const feedbackProposals = myProposals.filter(
      (p) => Boolean(p.adminFeedback) && p.status !== 'more_info_requested'
    );

    // Filter proposals based on active filter tab
    const filteredProposals = myProposals.filter((p) => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'action_required') return p.status === 'more_info_requested';
      if (filterStatus === 'under_review') {
        return ['submitted', 'under_admin_review', 'feasibility_assessment', 'partnership_evaluation'].includes(p.status);
      }
      if (filterStatus === 'partnership_5050') {
        return (
          p.partnershipEligibility === 'offered_50_50' ||
          p.partnershipEligibility === 'agreement_signed' ||
          p.partnershipEligibility === 'active_partner' ||
          p.partnershipOfferType === 'fifty_fifty'
        );
      }
      if (filterStatus === 'approved_active') {
        return ['approved', 'in_development', 'testing', 'published'].includes(p.status);
      }
      return true;
    });

    const activeEvaluationCount = myProposals.filter((p) =>
      ['submitted', 'under_admin_review', 'feasibility_assessment', 'partnership_evaluation'].includes(p.status)
    ).length;

    const approvedCount = myProposals.filter((p) =>
      ['approved', 'in_development', 'testing', 'published'].includes(p.status)
    ).length;

    const fiftyFiftyCount = myProposals.filter(
      (p) =>
        p.partnershipEligibility === 'offered_50_50' ||
        p.partnershipEligibility === 'agreement_signed' ||
        p.partnershipOfferType === 'fifty_fifty'
    ).length;

    return `
      <div class="contributor-innovation-dashboard space-y-6">
        <!-- Dashboard Header & Contributor Context -->
        <div class="liquid-glass rounded-3xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden shadow-xl">
          <div class="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Citizen Innovation Workspace</span>
                </span>
                <span class="text-xs text-slate-400 font-medium">
                  Contributor: <strong class="text-white">${user.displayName}</strong> (${user.county} County)
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Contributor Innovation <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Dashboard</span>
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Review your submitted national ideas, monitor real-time pipeline statuses, and respond directly to administrator inquiries and 50/50 partnership offers.
              </p>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <button 
                data-quick-hub="new_business"
                class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 border border-white/10"
              >
                <span>💡</span>
                <span>Submit New Idea</span>
              </button>
              <button 
                data-quick-hub="missing_feature"
                class="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-white/10 transition flex items-center gap-1.5"
              >
                <span>🧩</span>
                <span>Propose Feature</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Live KPI Metrics Cards using liquid-glass-card -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="liquid-glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] sm:text-xs text-slate-400 font-medium block">Total Submitted Ideas</span>
            <div class="text-2xl sm:text-3xl font-black text-white">${myProposals.length}</div>
            <span class="text-[10px] text-slate-500 block">Across ${user.county} & National</span>
          </div>

          <div class="liquid-glass-card p-4 rounded-2xl border border-blue-500/20 space-y-1">
            <span class="text-[10px] sm:text-xs text-blue-300 font-medium block">Under Evaluation</span>
            <div class="text-2xl sm:text-3xl font-black text-blue-400">${activeEvaluationCount}</div>
            <span class="text-[10px] text-slate-400 block">Review & Feasibility</span>
          </div>

          <div class="liquid-glass-card p-4 rounded-2xl border border-amber-500/20 space-y-1">
            <span class="text-[10px] sm:text-xs text-amber-300 font-medium block">50/50 Partnerships</span>
            <div class="text-2xl sm:text-3xl font-black text-amber-400">${fiftyFiftyCount}</div>
            <span class="text-[10px] text-slate-400 block">Binding Profit Sharing</span>
          </div>

          <div class="liquid-glass-card p-4 rounded-2xl border ${
            actionRequiredProposals.length > 0 ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-950/40' : 'border-white/10'
          } space-y-1">
            <span class="text-[10px] sm:text-xs ${actionRequiredProposals.length > 0 ? 'text-red-300 font-bold' : 'text-slate-400'} block">
              Pending Admin Actions
            </span>
            <div class="text-2xl sm:text-3xl font-black ${actionRequiredProposals.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-200'}">
              ${actionRequiredProposals.length}
            </div>
            <span class="text-[10px] ${actionRequiredProposals.length > 0 ? 'text-red-400 font-semibold' : 'text-slate-500'} block">
              ${actionRequiredProposals.length > 0 ? '⚠️ Clarification needed' : 'All clear'}
            </span>
          </div>
        </div>

        <!-- PRIORITY ACTION REQUIRED: PENDING ADMIN INQUIRY BANNER -->
        ${
          actionRequiredProposals.length > 0
            ? `
          <div class="liquid-glass-card rounded-2xl p-5 border-2 border-red-500/40 bg-gradient-to-br from-red-950/40 via-slate-950/80 to-slate-950/80 space-y-4 shadow-2xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-red-500/30">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <span>⚠️</span> Action Required: Administrator Feedback & Clarifications (${actionRequiredProposals.length})
                </h3>
              </div>
              <span class="text-[11px] bg-red-500/20 text-red-300 font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30">
                Awaiting Contributor Response
              </span>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">
              The KenyaOne Review Board has reviewed your proposal and requested specific clarifications. Submit your response below to resume administrative co-development:
            </p>

            <div class="space-y-4 mt-2">
              ${actionRequiredProposals
                .map(
                  (proposal) => `
                <div class="bg-slate-950/90 border border-red-500/30 rounded-xl p-4 sm:p-5 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                        ${proposal.id}
                      </span>
                      <h4 class="font-bold text-white text-sm">${proposal.title}</h4>
                    </div>
                    <span class="text-[11px] text-slate-400">Updated: ${ContributorInnovationDashboard.formatDate(proposal.updatedAt)}</span>
                  </div>

                  <!-- Admin Inquiry Text -->
                  <div class="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs space-y-1">
                    <span class="text-red-400 font-bold uppercase text-[10px] tracking-wider block">Administrator Inquiry:</span>
                    <p class="text-slate-200 font-medium text-xs leading-relaxed italic">
                      "${proposal.adminMoreInfoRequested || 'Please provide details on regional cooperative support or regulatory certification.'}"
                    </p>
                  </div>

                  <!-- Inline Quick Response Form -->
                  <div class="space-y-2 pt-1">
                    <label class="block text-xs font-semibold text-slate-300">
                      Your Clarification to Administrator:
                    </label>
                    <textarea 
                      id="dashboardReplyInput_${proposal.id}"
                      rows="3" 
                      placeholder="Type your explanation or provide additional operational details here..."
                      class="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    ></textarea>

                    <div class="flex items-center justify-between pt-1">
                      <span class="text-[10px] text-slate-400">
                        Updates status to <strong>Under Admin Review</strong> and logs an immutable timestamp.
                      </span>
                      <button 
                        class="btn-dashboard-submit-reply px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                        data-proposal-id="${proposal.id}"
                      >
                        <span>Send Clarification</span>
                        <span>➔</span>
                      </button>
                    </div>
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

        <!-- GENERAL ADMIN REVIEW NOTES -->
        ${
          feedbackProposals.length > 0 && actionRequiredProposals.length === 0
            ? `
          <div class="liquid-glass-card rounded-2xl p-5 border border-emerald-500/30 space-y-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>💬</span> Administrative Review Notes & Guidance
            </h3>
            <div class="space-y-2.5">
              ${feedbackProposals
                .map(
                  (p) => `
                <div class="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span class="font-bold text-emerald-300">${p.title} (${p.id}):</span>
                    <p class="text-slate-300 text-[11px] mt-0.5">${p.adminFeedback}</p>
                  </div>
                  <button class="btn-open-proposal text-xs text-emerald-400 hover:text-emerald-300 font-semibold whitespace-nowrap" data-proposal-id="${p.id}">
                    View Full Spec ➔
                  </button>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- SUBMITTED PROPOSALS LIST SECTION -->
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>📁</span> My Submitted Ideas & Proposals
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Every card displays your idea title, submission date, and live evaluation status.
              </p>
            </div>

            <!-- Status Filter Tabs -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button 
                data-contributor-filter="all"
                class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  filterStatus === 'all'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }"
              >
                All (${myProposals.length})
              </button>

              <button 
                data-contributor-filter="action_required"
                class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  filterStatus === 'action_required'
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }"
              >
                Action Required (${actionRequiredProposals.length})
              </button>

              <button 
                data-contributor-filter="under_review"
                class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  filterStatus === 'under_review'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }"
              >
                In Review (${activeEvaluationCount})
              </button>

              <button 
                data-contributor-filter="partnership_5050"
                class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  filterStatus === 'partnership_5050'
                    ? 'bg-amber-600 text-white font-bold shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }"
              >
                50/50 Ventures (${fiftyFiftyCount})
              </button>

              <button 
                data-contributor-filter="approved_active"
                class="contributor-filter-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  filterStatus === 'approved_active'
                    ? 'bg-teal-600 text-white font-bold shadow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }"
              >
                Approved (${approvedCount})
              </button>
            </div>
          </div>

          <!-- Mapped Proposal Cards using liquid-glass-card -->
          ${
            filteredProposals.length === 0
              ? `
            <div class="liquid-glass-card rounded-2xl p-10 text-center text-slate-400 space-y-3 border border-white/5">
              <span class="text-3xl">💡</span>
              <h4 class="text-base font-bold text-white">No submissions match the selected filter.</h4>
              <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                ${
                  myProposals.length === 0
                    ? 'You have not submitted an innovation yet. Pitch an idea to KenyaOne AI and qualify for our 50/50 National Partnership.'
                    : 'Try selecting a different filter above to view your submissions.'
                }
              </p>
              ${
                myProposals.length === 0
                  ? `
                <button data-quick-hub="new_business" class="mt-3 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition">
                  Build Something Kenya Needs ➔
                </button>
              `
                  : ''
              }
            </div>
          `
              : `
            <div class="space-y-4">
              ${filteredProposals
                .map((proposal) => ContributorInnovationDashboard.renderProposalCard(proposal))
                .join('')}
            </div>
          `
          }
        </div>
      </div>
    `;
  }

  /**
   * Renders a single proposal in a clean 'liquid-glass-card' format displaying:
   * 1. Proposal Title
   * 2. Submission Date
   * 3. Current Project Status
   * Plus 50/50 partnership status, AI metrics, and action triggers.
   */
  static renderProposalCard(proposal: InnovationProposal): string {
    const statusBadge = ContributorInnovationDashboard.getStatusBadge(proposal.status);
    const formattedDate = ContributorInnovationDashboard.formatDate(proposal.submissionDate);
    const isActionRequired = proposal.status === 'more_info_requested';

    const has5050Offer =
      proposal.partnershipEligibility === 'offered_50_50' ||
      proposal.partnershipEligibility === 'agreement_signed' ||
      proposal.partnershipEligibility === 'active_partner' ||
      proposal.partnershipOfferType === 'fifty_fifty';

    return `
      <div 
        class="liquid-glass-card rounded-2xl p-5 sm:p-6 border ${
          isActionRequired ? 'border-red-500/40 bg-red-950/15' : 'border-white/10'
        } space-y-4 hover:border-emerald-500/40 transition duration-300 shadow-lg"
        data-proposal-card-id="${proposal.id}"
      >
        <!-- Top Row: Metadata, Status Badge, Date -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Proposal ID -->
            <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded border border-emerald-500/30">
              ${proposal.id}
            </span>

            <!-- STATUS BADGE (Clear Status Indicator) -->
            <span class="text-xs px-2.5 py-0.5 rounded-full border ${statusBadge.classes} font-bold flex items-center gap-1">
              <span>${statusBadge.icon}</span>
              <span>${statusBadge.label}</span>
            </span>

            <!-- Category / Pathway -->
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 font-medium">
              ${proposal.type === 'missing_feature' ? '🧩 Missing Feature' : '🚀 National Business'}
            </span>

            <!-- 50/50 Partnership Badge -->
            ${
              has5050Offer
                ? `<span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                    <span>🤝</span>
                    <span>50/50 Partner</span>
                  </span>`
                : ''
            }
          </div>

          <!-- SUBMISSION DATE -->
          <div class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Submitted: <strong class="text-slate-200 font-semibold">${formattedDate}</strong></span>
            <span>•</span>
            <span>County: <strong class="text-slate-200 font-semibold">${proposal.county}</strong></span>
          </div>
        </div>

        <!-- TITLE & DESCRIPTION -->
        <div>
          <h4 
            class="text-base sm:text-lg font-bold text-white hover:text-emerald-300 cursor-pointer transition btn-open-proposal flex items-center gap-2" 
            data-proposal-id="${proposal.id}"
          >
            <span>${proposal.title}</span>
            <span class="text-xs text-emerald-400 font-normal">➔</span>
          </h4>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
            ${proposal.description || proposal.originalIdea}
          </p>
        </div>

        <!-- Key Metrics & Attributes -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">AI Feasibility Score</span>
            <span class="font-black text-emerald-400 text-sm">${proposal.aiFeasibilityScore || 85}%</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">National Impact</span>
            <span class="font-black text-teal-400 text-sm">${proposal.aiNationalImpactScore || 90}%</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">Commercial Model</span>
            <span class="font-bold text-amber-300 text-xs truncate block">50/50 Profit Share</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
            <span class="text-slate-400 block text-[10px]">Lead PM</span>
            <span class="font-bold text-slate-200 text-xs truncate block">
              ${proposal.assignedProjectManager || 'Taskforce Review'}
            </span>
          </div>
        </div>

        <!-- Clarification Banner if status is more_info_requested -->
        ${
          isActionRequired
            ? `
          <div class="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-red-300 font-bold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Administrator Requested Clarification</span>
              </span>
              <span class="text-[10px] text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">Action Required</span>
            </div>
            <p class="text-slate-200 text-[11px] leading-relaxed italic">
              "${proposal.adminMoreInfoRequested || 'Please provide details on regional certification or local cooperative agreements.'}"
            </p>
          </div>
        `
            : proposal.adminFeedback
              ? `
          <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
            <span class="text-slate-400 font-bold text-[10px] uppercase block">Admin Review Note:</span>
            <p class="text-slate-200 text-[11px] mt-0.5">${proposal.adminFeedback}</p>
          </div>
        `
              : ''
        }

        <!-- Bottom Action Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <button 
              class="btn-open-proposal px-3.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow"
              data-proposal-id="${proposal.id}"
            >
              <span>View Full 7-Part Proposal</span>
              <span>➔</span>
            </button>

            ${
              proposal.agreement
                ? `
              <button 
                class="btn-view-agreement px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition flex items-center gap-1.5"
                data-proposal-id="${proposal.id}"
              >
                <span>📜</span>
                <span>50/50 Agreement (${proposal.agreement.status.toUpperCase()})</span>
              </button>
            `
                : ''
            }

            ${
              isActionRequired
                ? `
              <button 
                class="btn-open-proposal px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition flex items-center gap-1.5 shadow"
                data-proposal-id="${proposal.id}"
              >
                <span>Respond to Admin</span>
                <span>✍️</span>
              </button>
            `
                : ''
            }
          </div>

          <div class="text-[11px] text-slate-400">
            Last updated: <span class="text-slate-300 font-medium">${ContributorInnovationDashboard.formatDate(proposal.updatedAt)}</span>
          </div>
        </div>
      </div>
    `;
  }
}
