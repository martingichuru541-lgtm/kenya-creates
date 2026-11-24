export type SubmissionType =
  | 'idea'
  | 'innovation'
  | 'startup'
  | 'community'
  | 'research'
  | 'creative'
  | 'student';

export type ProjectStage =
  | 'idea'
  | 'research'
  | 'concept'
  | 'design'
  | 'prototype_dev'
  | 'prototype_done'
  | 'testing'
  | 'pilot'
  | 'operational'
  | 'scaling'
  | 'completed';

export type VerificationStatus =
  | 'community'
  | 'under_review'
  | 'profile_reviewed'
  | 'org_verified'
  | 'evidence_reviewed'
  | 'project_evidence_reviewed'
  | 'featured';

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived';

export interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  stage: ProjectStage;
  mediaUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  subcategory?: string;
  county: string;
  subCounty?: string;
  ward?: string;
  locality?: string;
  yearStarted: number;
  stage: ProjectStage;
  submissionType: SubmissionType;
  coverImage: string;
  logoImage?: string;
  galleryImages: string[];
  videoUrl?: string;
  documents?: { name: string; url: string; size: string }[];
  needs: string[];
  customNeeds?: string;
  ipConfirmed: boolean;
  visibility: 'public' | 'limited' | 'draft';
  status: ProjectStatus;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  followersCount: number;
  updates: ProjectUpdate[];
  verificationStatus: VerificationStatus;
  featured: boolean;
  isDiaspora?: boolean;
  diasporaLocation?: string;
  institution?: string;
  researchField?: string;
  authors?: string;
  businessModel?: string;
  budget?: string;
  problemStatement?: string;
  proposedSolution?: string;
  storyInspiration?: string;
  storyMaterials?: string;
  storyChallenges?: string;
  storyUniquelyKenyan?: string;
  storyNextGoal?: string;
  universityAffiliation?: string;
  kipiPatentStatus?: 'none' | 'pending' | 'granted' | 'trademark_registered';
  kebsStandardStatus?: 'none' | 'in_testing' | 'certified';
}

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  county: string;
  country: string;
  field: string;
  skills: string[];
  portfolioProjectIds: string[];
  followersCount: number;
  verified: boolean;
  role: 'creator' | 'admin' | 'investor' | 'organisation';
  isOrganisation?: boolean;
  orgName?: string;
  orgType?: string;
  website?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  creativeDisciplines?: string[];
  availableFor?: ('collaboration' | 'commission' | 'mentorship' | 'employment' | 'speaking')[];
  yearsOfExperience?: number;
  featuredWorkUrl?: string;
  isYouthCreator?: boolean;
}

export interface CollaborationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  category: string;
  county: string;
  creatorId: string;
  creatorName: string;
  skillsRequired: string[];
  description: string;
  type: string;
  locationPreference: 'remote' | 'on_site' | 'hybrid';
  compensation: 'paid' | 'unpaid' | 'negotiable' | 'equity';
  duration?: string;
  deadline?: string;
  applicationsCount: number;
  status: 'open' | 'filled' | 'closed';
  createdAt: string;
}

export interface CollaborationApplication {
  id: string;
  requestId: string;
  projectTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  proposal: string;
  skillsOffered: string[];
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: 'grants' | 'competitions' | 'accelerators' | 'fellowships' | 'mentorship' | 'events';
  eligibility: string;
  requirements: string[];
  deadline: string;
  location: string;
  website: string;
  fundingAmount?: string;
  verified: boolean;
  publicationDate: string;
}

export interface InvestorProfile {
  id: string;
  name: string;
  type: 'angel' | 'vc' | 'grant_fund' | 'accelerator' | 'corporate';
  sectors: string[];
  geographicFocus: string;
  preferredStages: string[];
  fundingRange: string;
  approach: string;
  website: string;
  contactPreference: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'project_approved' | 'new_follower' | 'collaboration' | 'message' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface CountyInfo {
  name: string;
  code: number;
  region: string;
  projectCount: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface PledgeItem {
  id: string;
  projectId: string;
  projectTitle: string;
  contributorName: string;
  contributorCounty: string;
  pledgeType: 'micro_grant' | 'volunteer' | 'tools' | 'mentorship';
  amountOrDetails: string;
  createdAt: string;
}

export interface CommercializationStep {
  id: string;
  category: 'kipi' | 'kebs' | 'pilot' | 'funding';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  resourceUrl?: string;
}

export interface ExhibitionItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  county: string;
  curator: string;
  curatorAvatar: string;
  coverImage: string;
  mediaType: 'gallery' | '3d_virtual' | 'audio' | 'video' | 'prototype';
  mediaCount: number;
  virtualRoomUrl?: string;
  featured: boolean;
  viewCount: number;
  storyInspiration?: string;
  storyProcess?: string;
  storyChallenges?: string;
}

export interface CompetitionItem {
  id: string;
  title: string;
  organizer: string;
  category: string;
  scope: 'national' | 'county' | 'university' | 'school';
  deadline: string;
  prizePool: string;
  status: 'active' | 'judging' | 'completed';
  rules: string[];
  eligibleCounties: string[];
  submissionsCount: number;
  publicVotingEnabled: boolean;
  publicVotesCount: number;
  userHasVoted?: boolean;
  winners?: { place: number; title: string; creatorName: string; county: string }[];
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

// ==========================================
// KENYAONE INNOVATION HUB & 50/50 PARTNERSHIP
// ==========================================

export type ProposalType = 'missing_feature' | 'new_business';

export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'ai_processing'
  | 'under_admin_review'
  | 'more_info_requested'
  | 'feasibility_assessment'
  | 'partnership_evaluation'
  | 'approved'
  | 'in_development'
  | 'testing'
  | 'published'
  | 'rejected'
  | 'archived';

export type PartnershipStatus =
  | 'not_eligible'
  | 'under_evaluation'
  | 'offered_50_50'
  | 'negotiating'
  | 'agreement_drafted'
  | 'agreement_signed'
  | 'active_partner';

export interface ProposalConversationMessage {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  senderName?: string;
  message: string;
  timestamp: string;
}

export interface PartnershipAgreement {
  id: string;
  proposalId: string;
  projectTitle: string;
  contributorId: string;
  contributorName: string;
  kenyaOneSharePercent: number; // typically 50
  contributorSharePercent: number; // typically 50
  modelType: 'net_profit_sharing' | 'revenue_sharing' | 'equity_ownership';
  effectiveDate: string;
  ipAssignmentClause: string;
  confidentialityClause: string;
  accountingAuditClause: string;
  disputeResolution: string;
  terminationClause: string;
  signedByContributor: boolean;
  signedByContributorDate?: string;
  signedByAdmin: boolean;
  signedByAdminDate?: string;
  status: 'draft' | 'pending_signature' | 'executed' | 'terminated';
}

export interface ProjectFinancialReport {
  id: string;
  proposalId: string;
  projectId?: string;
  projectTitle: string;
  period: string; // e.g. "Q1 2026", "October 2026"
  grossRevenue: number;
  refunds: number;
  transactionFees: number;
  operatingExpenses: number;
  taxesStatutory: number;
  netDistributableProfit: number;
  kenyaOneShare: number;
  contributorShare: number;
  payoutStatus: 'pending' | 'approved' | 'paid';
  payoutReference?: string;
  payoutDate?: string;
}

export interface InnovationAuditLog {
  id: string;
  proposalId: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface InnovationProposal {
  id: string;
  type: ProposalType;
  title: string;
  category: string;
  county: string;
  contributorId: string;
  contributorName: string;
  contributorEmail: string;
  contributorPhone: string;
  originalIdea: string;
  description: string;
  submissionDate: string;
  updatedAt: string;
  status: ProposalStatus;
  confidential: boolean;
  isNationalScaleCandidate: boolean;
  partnershipEligibility: PartnershipStatus;
  partnershipOfferType: 'fifty_fifty' | 'negotiated' | 'recognition' | 'none';
  aiFeasibilityScore: number; // 0-100
  aiNationalImpactScore: number; // 0-100
  problemAnalysis: {
    problem: string;
    limitations: string;
    beneficiaries: string;
    affectedCounties: string[];
    existingAlternatives: string;
    whyItMatters: string;
  };
  proposedSolution: {
    recommendedSolution: string;
    howItWorks: string;
    websiteFeatures: string[];
    mobileFeatures: string[];
    aiIntegration: string;
    requiredApis: string[];
  };
  businessModel: {
    revenueStreams: string[];
    transactionCommissions: string;
    operatingExpensesEstimate: string;
    potentialProfitability: string;
    financialAssumptions: string;
  };
  nationalImpact: {
    beneficiariesEstimate: string;
    countiesCovered: string;
    employmentCreation: string;
    economicContribution: string;
    internationalExpansion: string;
  };
  technicalRequirements: {
    infrastructure: string;
    database: string;
    apis: string[];
    securityRequirements: string;
    estimatedDevelopmentWeeks: number;
  };
  partnershipTerms: {
    qualifies5050: boolean;
    contributorResponsibilities: string[];
    kenyaOneResponsibilities: string[];
    structureNote: string;
  };
  conversationHistory: ProposalConversationMessage[];
  adminFeedback?: string;
  adminMoreInfoRequested?: string;
  contributorResponse?: string;
  assignedProjectManager?: string;
  agreement?: PartnershipAgreement;
  financialReports?: ProjectFinancialReport[];
  publishedProjectUrl?: string;
}


