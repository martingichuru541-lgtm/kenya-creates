import { storage } from './storageService';
import { InnovationProposal, ProposalStatus } from '../types';

export interface ProposalFilterOptions {
  contributorId?: string;
  status?: ProposalStatus | 'all';
  searchQuery?: string;
}

export interface ProposalSummaryStats {
  total: number;
  underReview: number;
  actionRequired: number;
  approved: number;
  fiftyFifty: number;
}

/**
 * Service to fetch and manage submitted innovation proposals from the database
 */
export class ProposalService {
  /**
   * Fetches innovation proposals submitted by the current user or given contributor ID
   */
  async getUserSubmittedProposals(contributorId?: string): Promise<InnovationProposal[]> {
    const id = contributorId || storage.getCurrentUser().id;
    return storage.getInnovationProposals({ contributorId: id });
  }

  /**
   * Synchronous accessor for fast template rendering
   */
  getUserSubmittedProposalsSync(contributorId?: string): InnovationProposal[] {
    const id = contributorId || storage.getCurrentUser().id;
    return storage.getInnovationProposals({ contributorId: id });
  }

  /**
   * Fetch a single proposal by ID
   */
  async getProposalById(id: string): Promise<InnovationProposal | undefined> {
    return storage.getInnovationProposalById(id);
  }

  /**
   * Synchronous accessor for a single proposal
   */
  getProposalByIdSync(id: string): InnovationProposal | undefined {
    return storage.getInnovationProposalById(id);
  }

  /**
   * Filter user's proposals by status
   */
  getProposalsByStatus(status: ProposalStatus, contributorId?: string): InnovationProposal[] {
    const proposals = this.getUserSubmittedProposalsSync(contributorId);
    return proposals.filter((p) => p.status === status);
  }

  /**
   * Proposals requiring contributor attention (e.g. admin requested more info)
   */
  getPendingActionProposals(contributorId?: string): InnovationProposal[] {
    const proposals = this.getUserSubmittedProposalsSync(contributorId);
    return proposals.filter(
      (p) => p.status === 'more_info_requested' || (p.adminMoreInfoRequested && !p.contributorResponse)
    );
  }

  /**
   * Get 50/50 partnership qualifying or active proposals
   */
  getFiftyFiftyProposals(contributorId?: string): InnovationProposal[] {
    const proposals = this.getUserSubmittedProposalsSync(contributorId);
    return proposals.filter(
      (p) =>
        p.partnershipEligibility === 'offered_50_50' ||
        p.partnershipEligibility === 'agreement_signed' ||
        p.partnershipEligibility === 'active_partner' ||
        p.partnershipOfferType === 'fifty_fifty'
    );
  }

  /**
   * Submit contributor's clarification / more information in response to an admin inquiry
   */
  async submitProposalClarification(proposalId: string, responseText: string): Promise<boolean> {
    return storage.contributorSubmitMoreInfo(proposalId, responseText);
  }

  /**
   * Get summary statistics for contributor's submitted ideas
   */
  getProposalSummaryStats(contributorId?: string): ProposalSummaryStats {
    const proposals = this.getUserSubmittedProposalsSync(contributorId);
    
    const underReview = proposals.filter((p) =>
      ['submitted', 'under_admin_review', 'feasibility_assessment', 'partnership_evaluation'].includes(p.status)
    ).length;

    const actionRequired = proposals.filter((p) => p.status === 'more_info_requested').length;

    const approved = proposals.filter((p) =>
      ['approved', 'in_development', 'testing', 'published'].includes(p.status)
    ).length;

    const fiftyFifty = proposals.filter(
      (p) =>
        p.partnershipEligibility === 'offered_50_50' ||
        p.partnershipEligibility === 'agreement_signed' ||
        p.partnershipEligibility === 'active_partner' ||
        p.partnershipOfferType === 'fifty_fifty'
    ).length;

    return {
      total: proposals.length,
      underReview,
      actionRequired,
      approved,
      fiftyFifty,
    };
  }
}

export const proposalService = new ProposalService();
