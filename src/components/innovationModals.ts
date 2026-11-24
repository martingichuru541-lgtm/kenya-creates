import { storage } from '../services/storageService';
import { InnovationProposal, Creator, ProposalStatus } from '../types';

export class InnovationModals {
  /**
   * FULL 7-PART PROPOSAL DETAIL MODAL
   */
  static renderProposalDetailModal(proposal: InnovationProposal, currentUser: Creator): string {
    const isAdmin = currentUser.role === 'admin';
    const isOwner = currentUser.id === proposal.contributorId;
    const stages: ProposalStatus[] = [
      'submitted',
      'under_admin_review',
      'more_info_requested',
      'partnership_evaluation',
      'approved',
      'in_development',
      'testing',
      'published',
    ];

    const currentStageIndex = stages.indexOf(proposal.status);

    return `
      <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="liquid-glass rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative border border-emerald-500/30 my-auto max-h-[92vh] overflow-y-auto space-y-6">
          <!-- Close Button -->
          <button id="btnCloseProposalModal" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
            ✕
          </button>

          <!-- Header -->
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                ${proposal.id}
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-white/10 font-semibold">
                ${proposal.type === 'missing_feature' ? '🛠️ Missing Platform Feature' : '🚀 National Business Venture'}
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ${proposal.status.replace(/_/g, ' ').toUpperCase()}
              </span>
              ${
                proposal.isNationalScaleCandidate
                  ? `<span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">🇰🇪 National Scale Candidate</span>`
                  : ''
              }
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">${proposal.title}</h2>
            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>Contributor: <strong class="text-slate-200">${proposal.contributorName}</strong></span>
              <span>•</span>
              <span>County: <strong class="text-slate-200">${proposal.county}</strong></span>
              <span>•</span>
              <span>Sector: <strong class="text-slate-200">${proposal.category}</strong></span>
              <span>•</span>
              <span>Submitted: ${proposal.submissionDate}</span>
            </div>
          </div>

          <!-- 8-Stage Visual Progress Timeline -->
          <div class="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Sovereign Incubation Pipeline</span>
            <div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-[10px] text-center font-semibold">
              ${stages
                .map((st, idx) => {
                  const isDone = currentStageIndex >= idx;
                  const isCurrent = proposal.status === st;
                  return `
                    <div class="p-2 rounded-xl transition ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                        : isDone
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-950/40 text-slate-500 border border-white/5'
                    }">
                      <div class="text-[11px]">${isDone && !isCurrent ? '✓' : idx + 1}</div>
                      <div class="truncate mt-0.5">${st.replace(/_/g, ' ')}</div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <!-- AI Feasibility & National Impact Scores -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
              <span class="text-slate-400 block text-[10px]">AI Feasibility Score</span>
              <span class="text-2xl font-black text-emerald-400">${proposal.aiFeasibilityScore}%</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">High technical viability</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
              <span class="text-slate-400 block text-[10px]">National Impact Score</span>
              <span class="text-2xl font-black text-teal-400">${proposal.aiNationalImpactScore}%</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">Multi-county relevance</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
              <span class="text-slate-400 block text-[10px]">50/50 Partnership Status</span>
              <span class="text-sm font-bold text-amber-400 block mt-1">${proposal.partnershipEligibility.replace(/_/g, ' ')}</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
              <span class="text-slate-400 block text-[10px]">Development Tranche</span>
              <span class="text-sm font-bold text-white block mt-1">${proposal.technicalRequirements?.estimatedDevelopmentWeeks || 12} Weeks</span>
            </div>
          </div>

          <!-- THE 7-PART STRUCTURED PROPOSAL BREAKDOWN -->
          <div class="space-y-4 text-xs">
            <!-- PART A: Project Information & Original Prompt -->
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div class="flex items-center justify-between font-bold text-white text-xs border-b border-white/10 pb-2">
                <span class="text-emerald-400">PART A • ORIGINAL CITIZEN IDEA & CONTEXT</span>
                <span class="text-[10px] text-slate-400">Verbatim Contributor Input</span>
              </div>
              <p class="text-slate-300 italic bg-black/30 p-3 rounded-xl border border-white/5 leading-relaxed">
                "${proposal.originalIdea}"
              </p>
              <p class="text-slate-300 leading-relaxed pt-1">${proposal.description}</p>
            </div>

            <!-- PART B: Problem Analysis -->
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div class="font-bold text-emerald-400 text-xs border-b border-white/10 pb-2">
                PART B • PROBLEM ANALYSIS & TARGET BENEFICIARIES
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <strong class="text-slate-300 block text-[11px] mb-0.5">The Core Problem:</strong>
                  <p class="text-slate-400 text-[11px] leading-relaxed">${proposal.problemAnalysis?.problem}</p>
                </div>
                <div>
                  <strong class="text-slate-300 block text-[11px] mb-0.5">Target Beneficiaries:</strong>
                  <p class="text-slate-400 text-[11px] leading-relaxed">${proposal.problemAnalysis?.beneficiaries}</p>
                </div>
                <div>
                  <strong class="text-slate-300 block text-[11px] mb-0.5">Affected Counties:</strong>
                  <p class="text-slate-400 text-[11px]">${proposal.problemAnalysis?.affectedCounties?.join(', ') || proposal.county}</p>
                </div>
                <div>
                  <strong class="text-slate-300 block text-[11px] mb-0.5">Why This Matters to Kenya:</strong>
                  <p class="text-slate-400 text-[11px] leading-relaxed">${proposal.problemAnalysis?.whyItMatters}</p>
                </div>
              </div>
            </div>

            <!-- PART C: Proposed Solution -->
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div class="font-bold text-emerald-400 text-xs border-b border-white/10 pb-2">
                PART C • PROPOSED SOLUTION & TECHNICAL WORKFLOW
              </div>
              <p class="text-slate-200 leading-relaxed">${proposal.proposedSolution?.recommendedSolution}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div class="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <strong class="text-emerald-300 block text-[11px]">Website Capabilities:</strong>
                  <ul class="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
                    ${proposal.proposedSolution?.websiteFeatures?.map((f) => `<li>${f}</li>`).join('') || '<li>National Dashboard</li>'}
                  </ul>
                </div>
                <div class="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <strong class="text-teal-300 block text-[11px]">Mobile & USSD Features:</strong>
                  <ul class="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
                    ${proposal.proposedSolution?.mobileFeatures?.map((f) => `<li>${f}</li>`).join('') || '<li>Mobile PWA</li>'}
                  </ul>
                </div>
              </div>
            </div>

            <!-- PART D: Business Model & Revenue Engine -->
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div class="font-bold text-emerald-400 text-xs border-b border-white/10 pb-2">
                PART D • COMMERCIAL BUSINESS MODEL & PROFITABILITY
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <strong class="text-slate-300 block text-[11px]">Revenue Streams:</strong>
                  <ul class="list-disc list-inside text-slate-400 text-[10px] space-y-0.5 mt-1">
                    ${proposal.businessModel?.revenueStreams?.map((r) => `<li>${r}</li>`).join('') || '<li>Commission per transaction</li>'}
                  </ul>
                </div>
                <div>
                  <strong class="text-slate-300 block text-[11px]">Estimated Monthly Expenses:</strong>
                  <p class="text-slate-400 text-[11px] mt-1">${proposal.businessModel?.operatingExpensesEstimate}</p>
                </div>
                <div>
                  <strong class="text-slate-300 block text-[11px]">Profitability & Assumptions:</strong>
                  <p class="text-emerald-400 font-semibold text-[11px] mt-1">${proposal.businessModel?.potentialProfitability}</p>
                </div>
              </div>
            </div>

            <!-- PART E: National Impact -->
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div class="font-bold text-emerald-400 text-xs border-b border-white/10 pb-2">
                PART E • NATIONAL IMPACT & JOB CREATION
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div class="p-2 rounded-xl bg-black/40">
                  <span class="text-[10px] text-slate-400 block">Beneficiaries</span>
                  <span class="text-xs font-bold text-white">${proposal.nationalImpact?.beneficiariesEstimate}</span>
                </div>
                <div class="p-2 rounded-xl bg-black/40">
                  <span class="text-[10px] text-slate-400 block">Employment</span>
                  <span class="text-xs font-bold text-emerald-400">${proposal.nationalImpact?.employmentCreation}</span>
                </div>
                <div class="p-2 rounded-xl bg-black/40">
                  <span class="text-[10px] text-slate-400 block">Counties Covered</span>
                  <span class="text-xs font-bold text-white">${proposal.nationalImpact?.countiesCovered}</span>
                </div>
                <div class="p-2 rounded-xl bg-black/40">
                  <span class="text-[10px] text-slate-400 block">Sovereign Wealth</span>
                  <span class="text-xs font-bold text-amber-400">${proposal.nationalImpact?.economicContribution}</span>
                </div>
              </div>
            </div>

            <!-- PART F: Technical & Security Requirements -->
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
              <div class="font-bold text-emerald-400 text-xs border-b border-white/10 pb-2">
                PART F • TECHNICAL ARCHITECTURE & INTEGRATIONS
              </div>
              <p class="text-slate-300 text-[11px]">${proposal.technicalRequirements?.infrastructure}</p>
              <div class="flex flex-wrap gap-1.5 pt-1">
                ${proposal.technicalRequirements?.apis?.map((api) => `<span class="bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300">API: ${api}</span>`).join('') || ''}
              </div>
            </div>

            <!-- PART G: Partnership Potential & Responsibilities -->
            <div class="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div class="font-bold text-amber-400 text-xs border-b border-amber-500/20 pb-2 flex items-center justify-between">
                <span>PART G • 50/50 NATIONAL PARTNERSHIP DIVISION</span>
                <span class="text-[10px] text-amber-300">Co-Development Structure</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div class="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <strong class="text-white text-[11px] block">Contributor Responsibilities (50%):</strong>
                  <ul class="list-disc list-inside text-slate-300 text-[10px] space-y-0.5">
                    ${proposal.partnershipTerms?.contributorResponsibilities?.map((c) => `<li>${c}</li>`).join('') || '<li>Lead field operations</li>'}
                  </ul>
                </div>
                <div class="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <strong class="text-emerald-400 text-[11px] block">KenyaOne Responsibilities (50%):</strong>
                  <ul class="list-disc list-inside text-slate-300 text-[10px] space-y-0.5">
                    ${proposal.partnershipTerms?.kenyaOneResponsibilities?.map((k) => `<li>${k}</li>`).join('') || '<li>Engineers digital platform</li>'}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Partnership Agreement Actions (if drafted) -->
          ${
            proposal.agreement
              ? `
            <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-slate-950 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <strong class="text-amber-300 text-sm block">📜 50/50 Partnership Agreement: ${proposal.agreement.id}</strong>
                <span class="text-slate-300 text-[11px]">
                  Status: <strong>${proposal.agreement.status.toUpperCase()}</strong> • 
                  Contributor: ${proposal.agreement.signedByContributor ? '✓ Signed' : 'Pending Signature'} • 
                  KenyaOne Admin: ${proposal.agreement.signedByAdmin ? '✓ Signed' : 'Pending Signature'}
                </span>
              </div>
              <button class="btn-view-agreement px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow transition" data-proposal-id="${proposal.id}">
                Open Legal Agreement ➔
              </button>
            </div>
          `
              : ''
          }

          <!-- Contributor Response Section if more info requested -->
          ${
            proposal.status === 'more_info_requested'
              ? `
            <div class="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-3 text-xs">
              <strong class="text-red-300 text-sm block">Administrator Clarification Request:</strong>
              <p class="text-slate-300 text-[11px]">${proposal.adminMoreInfoRequested || 'Please provide additional data.'}</p>
              
              <div class="space-y-2 pt-1">
                <label class="block font-semibold text-slate-300">Your Response:</label>
                <textarea id="modalReplyMoreInfoInput" rows="3" placeholder="Provide requested certification or technical details..." class="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white"></textarea>
                <button id="btnSubmitModalMoreInfo" data-proposal-id="${proposal.id}" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition">
                  Send Response to Administration ➔
                </button>
              </div>
            </div>
          `
              : ''
          }

          <!-- Admin Decision Controls (Only visible to Administrator) -->
          ${
            isAdmin
              ? `
            <div class="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3 text-xs">
              <div class="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <h4 class="font-bold text-purple-200 text-sm">Administrative Command Actions</h4>
                <span class="text-[11px] text-purple-300">Authorized KenyaOne Review Board</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button class="btn-admin-action px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold" data-action="approve" data-proposal-id="${proposal.id}">
                  ✓ Approve Proposal
                </button>
                <button class="btn-admin-action px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold" data-action="offer_5050" data-proposal-id="${proposal.id}">
                  🤝 Offer 50/50 Partnership
                </button>
                <button class="btn-admin-action px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold" data-action="assign_pm" data-proposal-id="${proposal.id}">
                  👷 Assign Project Manager
                </button>
                <button class="btn-admin-action px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold" data-action="publish" data-proposal-id="${proposal.id}">
                  🌍 Publish to Marketplace
                </button>
                <button class="btn-admin-action px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300" data-action="request_info" data-proposal-id="${proposal.id}">
                  📋 Request More Info
                </button>
                <button class="btn-admin-action px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30" data-action="reject" data-proposal-id="${proposal.id}">
                  ✕ Reject Proposal
                </button>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  /**
   * 50/50 PARTNERSHIP AGREEMENT DOCUMENT MODAL
   */
  static renderPartnershipAgreementModal(proposal: InnovationProposal, currentUser: Creator): string {
    const agreement = proposal.agreement;
    if (!agreement) return '';

    const isAdmin = currentUser.role === 'admin';
    const isContributor = currentUser.id === proposal.contributorId;
    const canSignAsContributor = isContributor && !agreement.signedByContributor;
    const canSignAsAdmin = isAdmin && !agreement.signedByAdmin;

    return `
      <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="liquid-glass rounded-3xl max-w-3xl w-full p-6 sm:p-10 relative border border-amber-500/40 my-auto max-h-[92vh] overflow-y-auto space-y-6">
          <button id="btnCloseAgreementModal" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
            ✕
          </button>

          <!-- Agreement Header / Legal Coat of Arms -->
          <div class="text-center space-y-2 border-b border-white/10 pb-6">
            <span class="text-3xl">🇰🇪</span>
            <span class="text-[10px] font-mono tracking-widest text-amber-400 uppercase block font-bold">
              KENYAONE SOVEREIGN DIGITAL CO-DEVELOPMENT FRAMEWORK
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-white">
              NATIONAL INNOVATION 50/50 PARTNERSHIP AGREEMENT
            </h2>
            <div class="text-xs text-slate-400 font-mono">
              Reference Document: <strong>${agreement.id}</strong> • Project: <strong>${agreement.projectTitle}</strong>
            </div>
          </div>

          <!-- Parties Recital -->
          <div class="p-4 rounded-2xl bg-slate-950/70 border border-white/10 text-xs text-slate-300 space-y-2 leading-relaxed">
            <strong class="text-white block font-semibold">THIS BINDING AGREEMENT IS ENTERED INTO BETWEEN:</strong>
            <p>
              1. <strong>KENYAONE SOVEREIGN DIGITAL INFRASTRUCTURE</strong> ("KenyaOne", Party A), represented by the KenyaOne National Innovation Administrator.<br/>
              2. <strong>${agreement.contributorName.toUpperCase()}</strong> ("Contributor & Project Originator", Party B), Citizen of Kenya.
            </p>
          </div>

          <!-- Agreement Articles -->
          <div class="space-y-4 text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-2 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div>
              <strong class="text-emerald-400 block text-xs mb-1">ARTICLE 1: 50/50 REVENUE & NET PROFIT SHARING</strong>
              <p>
                The Parties mutually establish a <strong>fifty percent (50%) KenyaOne</strong> and <strong>fifty percent (50%) Contributor</strong> net profit distribution on all commercial operations, licenses, and transaction fees originated by the Project. Net profit is certified monthly after subtracting verified third-party cloud hosting, cellular telemetry, and statutory taxes.
              </p>
            </div>

            <div>
              <strong class="text-emerald-400 block text-xs mb-1">ARTICLE 2: INTELLECTUAL PROPERTY & SOVEREIGN CO-OWNERSHIP</strong>
              <p>${agreement.ipAssignmentClause}</p>
            </div>

            <div>
              <strong class="text-emerald-400 block text-xs mb-1">ARTICLE 3: ACCOUNTING, AUDITING & CITIZEN LEDGER</strong>
              <p>${agreement.accountingAuditClause}</p>
            </div>

            <div>
              <strong class="text-emerald-400 block text-xs mb-1">ARTICLE 4: DISPUTE RESOLUTION & APPLICABLE LAW</strong>
              <p>${agreement.disputeResolution}</p>
            </div>

            <div>
              <strong class="text-emerald-400 block text-xs mb-1">ARTICLE 5: CONFIDENTIALITY & DATA PROTECTION</strong>
              <p>${agreement.confidentialityClause}</p>
            </div>
          </div>

          <!-- Signature Blocks -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <!-- Party B Contributor -->
            <div class="p-4 rounded-2xl bg-slate-950/80 border ${agreement.signedByContributor ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-white/10'} space-y-2 text-xs">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Contributor Signature (Party B)</span>
              <div class="font-bold text-white text-sm">${agreement.contributorName}</div>
              
              ${
                agreement.signedByContributor
                  ? `
                <div class="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 pt-1">
                  <span>✓ Digitally Executed</span>
                  <span class="text-[10px] text-slate-500">(${new Date(agreement.signedByContributorDate!).toLocaleDateString()})</span>
                </div>
              `
                  : canSignAsContributor
                    ? `
                <button id="btnSignAgreementContributor" data-proposal-id="${proposal.id}" class="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition">
                  ✍️ Digitally Sign Agreement (50%)
                </button>
              `
                    : `<span class="text-amber-400 text-[11px]">Awaiting Contributor Signature</span>`
              }
            </div>

            <!-- Party A Administrator -->
            <div class="p-4 rounded-2xl bg-slate-950/80 border ${agreement.signedByAdmin ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-white/10'} space-y-2 text-xs">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">KenyaOne Administrator (Party A)</span>
              <div class="font-bold text-white text-sm">Kenya Creates Administration</div>

              ${
                agreement.signedByAdmin
                  ? `
                <div class="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 pt-1">
                  <span>✓ Countersigned & Certified</span>
                  <span class="text-[10px] text-slate-500">(${new Date(agreement.signedByAdminDate!).toLocaleDateString()})</span>
                </div>
              `
                  : canSignAsAdmin
                    ? `
                <button id="btnSignAgreementAdmin" data-proposal-id="${proposal.id}" class="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow transition">
                  ✍️ Countersign as Administrator
                </button>
              `
                    : `<span class="text-amber-400 text-[11px]">Awaiting Administrator Countersignature</span>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
