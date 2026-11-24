import {
  Project,
  Creator,
  CollaborationRequest,
  CollaborationApplication,
  Opportunity,
  InvestorProfile,
  NotificationItem,
  MessageItem,
  ProjectUpdate,
  VerificationStatus,
  ProjectStatus,
  InnovationProposal,
  InnovationAuditLog,
  ProposalStatus,
  PartnershipAgreement,
  ProjectFinancialReport,
  ExhibitionItem,
  CompetitionItem,
  MentorshipRequest,
} from '../types';
import {
  SEED_PROJECTS,
  SEED_CREATORS,
  SEED_COLLABORATIONS,
  SEED_OPPORTUNITIES,
  SEED_INVESTORS,
  COUNTIES_DATA,
  SEED_EXHIBITIONS,
  SEED_COMPETITIONS,
  SEED_MENTORSHIPS,
} from '../data/seedData';
import {
  SEED_PROPOSALS,
  SEED_INNOVATION_AUDIT_LOGS,
} from '../data/seedProposals';

const STORAGE_KEYS = {
  PROJECTS: 'kenya_creates_projects_v1',
  CREATORS: 'kenya_creates_creators_v1',
  COLLABORATIONS: 'kenya_creates_collaborations_v1',
  APPLICATIONS: 'kenya_creates_applications_v1',
  OPPORTUNITIES: 'kenya_creates_opportunities_v1',
  INVESTORS: 'kenya_creates_investors_v1',
  NOTIFICATIONS: 'kenya_creates_notifications_v1',
  MESSAGES: 'kenya_creates_messages_v1',
  CURRENT_USER_ID: 'kenya_creates_current_user_id_v1',
  FOLLOWED_PROJECTS: 'kenya_creates_followed_projects_v1',
  SAVED_OPPORTUNITIES: 'kenya_creates_saved_opps_v1',
  AUDIT_LOGS: 'kenya_creates_audit_logs_v1',
  PLEDGES: 'kenya_creates_pledges_v1',
  CUSTOM_AI_KEY: 'kenya_creates_custom_ai_key_v1',
  INNOVATION_PROPOSALS: 'kenya_creates_proposals_v1',
  INNOVATION_AUDIT_LOGS: 'kenya_creates_innovation_audit_v1',
  EXHIBITIONS: 'kenya_creates_exhibitions_v1',
  COMPETITIONS: 'kenya_creates_competitions_v1',
  MENTORSHIPS: 'kenya_creates_mentorships_v1',
};

class StorageService {
  private projects: Project[] = [];
  private creators: Creator[] = [];
  private collaborations: CollaborationRequest[] = [];
  private applications: CollaborationApplication[] = [];
  private opportunities: Opportunity[] = [];
  private investors: InvestorProfile[] = [];
  private notifications: NotificationItem[] = [];
  private messages: MessageItem[] = [];
  private pledges: any[] = [];
  private proposals: InnovationProposal[] = [];
  private innovationAuditLogs: InnovationAuditLog[] = [];
  private exhibitions: ExhibitionItem[] = [];
  private competitions: CompetitionItem[] = [];
  private mentorships: MentorshipRequest[] = [];
  private customAiKey: string = '';
  private currentUserId: string = 'user_1';
  private followedProjectIds: Set<string> = new Set();
  private savedOpportunityIds: Set<string> = new Set();
  private auditLogs: { timestamp: string; action: string; user: string; details: string }[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof localStorage === 'undefined') {
      this.projects = [...SEED_PROJECTS];
      this.creators = [...SEED_CREATORS];
      this.collaborations = [...SEED_COLLABORATIONS];
      this.opportunities = [...SEED_OPPORTUNITIES];
      this.investors = [...SEED_INVESTORS];
      this.notifications = this.createInitialNotifications();
      this.messages = this.createInitialMessages();
      this.proposals = [...SEED_PROPOSALS];
      this.innovationAuditLogs = [...SEED_INNOVATION_AUDIT_LOGS];
      this.currentUserId = 'user_1';
      this.followedProjectIds = new Set(['proj_1', 'proj_2']);
      this.savedOpportunityIds = new Set(['opp_1']);
      return;
    }

    try {
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      this.projects = storedProjects ? JSON.parse(storedProjects) : [...SEED_PROJECTS];

      const storedCreators = localStorage.getItem(STORAGE_KEYS.CREATORS);
      this.creators = storedCreators ? JSON.parse(storedCreators) : [...SEED_CREATORS];

      const storedCollabs = localStorage.getItem(STORAGE_KEYS.COLLABORATIONS);
      this.collaborations = storedCollabs ? JSON.parse(storedCollabs) : [...SEED_COLLABORATIONS];

      const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      this.applications = storedApps ? JSON.parse(storedApps) : [];

      const storedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      this.opportunities = storedOpps ? JSON.parse(storedOpps) : [...SEED_OPPORTUNITIES];

      const storedInvestors = localStorage.getItem(STORAGE_KEYS.INVESTORS);
      this.investors = storedInvestors ? JSON.parse(storedInvestors) : [...SEED_INVESTORS];

      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifications ? JSON.parse(storedNotifications) : this.createInitialNotifications();

      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      this.messages = storedMessages ? JSON.parse(storedMessages) : this.createInitialMessages();

      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      this.currentUserId = storedUserId || 'user_1';

      const storedFollows = localStorage.getItem(STORAGE_KEYS.FOLLOWED_PROJECTS);
      this.followedProjectIds = storedFollows ? new Set(JSON.parse(storedFollows)) : new Set(['proj_1', 'proj_2']);

      const storedSavedOpps = localStorage.getItem(STORAGE_KEYS.SAVED_OPPORTUNITIES);
      this.savedOpportunityIds = storedSavedOpps ? new Set(JSON.parse(storedSavedOpps)) : new Set(['opp_1']);

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const storedPledges = localStorage.getItem(STORAGE_KEYS.PLEDGES);
      this.pledges = storedPledges ? JSON.parse(storedPledges) : this.createInitialPledges();

      const storedProposals = localStorage.getItem(STORAGE_KEYS.INNOVATION_PROPOSALS);
      this.proposals = storedProposals ? JSON.parse(storedProposals) : [...SEED_PROPOSALS];

      const storedInnovAudit = localStorage.getItem(STORAGE_KEYS.INNOVATION_AUDIT_LOGS);
      this.innovationAuditLogs = storedInnovAudit ? JSON.parse(storedInnovAudit) : [...SEED_INNOVATION_AUDIT_LOGS];

      const storedKey = localStorage.getItem(STORAGE_KEYS.CUSTOM_AI_KEY);
      this.customAiKey = storedKey || '';
    } catch (e) {
      this.projects = [...SEED_PROJECTS];
      this.creators = [...SEED_CREATORS];
      this.collaborations = [...SEED_COLLABORATIONS];
      this.opportunities = [...SEED_OPPORTUNITIES];
      this.investors = [...SEED_INVESTORS];
      this.proposals = [...SEED_PROPOSALS];
      this.innovationAuditLogs = [...SEED_INNOVATION_AUDIT_LOGS];
      this.currentUserId = 'user_1';
    }
  }

  private save() {
    if (typeof localStorage === 'undefined') {
      this.notify();
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(this.creators));
      localStorage.setItem(STORAGE_KEYS.COLLABORATIONS, JSON.stringify(this.collaborations));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications));
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(this.opportunities));
      localStorage.setItem(STORAGE_KEYS.INVESTORS, JSON.stringify(this.investors));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(this.messages));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      localStorage.setItem(STORAGE_KEYS.FOLLOWED_PROJECTS, JSON.stringify(Array.from(this.followedProjectIds)));
      localStorage.setItem(STORAGE_KEYS.SAVED_OPPORTUNITIES, JSON.stringify(Array.from(this.savedOpportunityIds)));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.PLEDGES, JSON.stringify(this.pledges));
      localStorage.setItem(STORAGE_KEYS.INNOVATION_PROPOSALS, JSON.stringify(this.proposals));
      localStorage.setItem(STORAGE_KEYS.INNOVATION_AUDIT_LOGS, JSON.stringify(this.innovationAuditLogs));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_AI_KEY, this.customAiKey);
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    this.notify();
  }

  getPledges(projectId?: string) {
    if (projectId) return this.pledges.filter((p) => p.projectId === projectId);
    return this.pledges;
  }

  addPledge(pledgeData: any) {
    const newPledge = {
      id: `pledge_${Date.now()}`,
      ...pledgeData,
      createdAt: new Date().toISOString(),
    };
    this.pledges.unshift(newPledge);
    this.save();
    return newPledge;
  }

  getCustomAiKey(): string {
    return this.customAiKey;
  }

  setCustomAiKey(key: string) {
    this.customAiKey = key.trim();
    this.save();
  }

  private createInitialPledges() {
    return [
      {
        id: 'pledge_1',
        projectId: 'proj_1',
        projectTitle: 'M-Nyunyu: IoT Solar Irrigation Controller',
        contributorName: 'Dr. Joseph Mutua',
        contributorCounty: 'Murang\'a',
        pledgeType: 'tools',
        amountOrDetails: 'Offered 2 weeks free CNC testing lab access in Thika',
        createdAt: '2026-02-12T10:00:00Z',
      },
      {
        id: 'pledge_2',
        projectId: 'proj_3',
        projectTitle: 'Turkana Oasis: Solar Borehole Desalination Pods',
        contributorName: 'Amani Youth Chama',
        contributorCounty: 'Turkana',
        pledgeType: 'volunteer',
        amountOrDetails: 'Pledged 40 hours community installation assistance',
        createdAt: '2026-02-14T14:30:00Z',
      },
    ];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Current User Management ---
  getCurrentUser(): Creator {
    const user = this.creators.find((c) => c.id === this.currentUserId);
    if (user) return user;
    return this.creators[0];
  }

  setCurrentUserId(id: string) {
    this.currentUserId = id;
    this.save();
  }

  getAllUsers(): Creator[] {
    return this.creators;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user.role === 'admin';
  }

  // --- Projects ---
  getProjects(options?: {
    category?: string;
    county?: string;
    stage?: string;
    submissionType?: string;
    search?: string;
    creatorId?: string;
    onlyPublished?: boolean;
    featured?: boolean;
  }): Project[] {
    let list = [...this.projects];

    if (options?.onlyPublished !== false && !this.isAdmin()) {
      list = list.filter((p) => p.status === 'published' || p.creatorId === this.currentUserId);
    }

    if (options?.category && options.category !== 'all') {
      list = list.filter((p) => p.category === options.category);
    }

    if (options?.county && options.county !== 'all') {
      list = list.filter((p) => p.county.toLowerCase() === options.county?.toLowerCase());
    }

    if (options?.stage && options.stage !== 'all') {
      list = list.filter((p) => p.stage === options.stage);
    }

    if (options?.submissionType && options.submissionType !== 'all') {
      list = list.filter((p) => p.submissionType === options.submissionType);
    }

    if (options?.creatorId) {
      list = list.filter((p) => p.creatorId === options.creatorId);
    }

    if (options?.featured) {
      list = list.filter((p) => p.featured);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.county.toLowerCase().includes(q) ||
          p.creatorName.toLowerCase().includes(q) ||
          p.needs.some((n) => n.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  createProject(data: Partial<Project>): Project {
    const user = this.getCurrentUser();
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: data.title || 'Untitled Project',
      tagline: data.tagline || '',
      description: data.description || '',
      category: data.category || 'tech',
      subcategory: data.subcategory || '',
      county: data.county || user.county || 'Nairobi',
      subCounty: data.subCounty || '',
      ward: data.ward || '',
      locality: data.locality || '',
      yearStarted: data.yearStarted || new Date().getFullYear(),
      stage: data.stage || 'idea',
      submissionType: data.submissionType || 'idea',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      galleryImages: data.galleryImages || [],
      videoUrl: data.videoUrl || '',
      documents: data.documents || [],
      needs: data.needs || [],
      customNeeds: data.customNeeds || '',
      ipConfirmed: data.ipConfirmed || true,
      visibility: data.visibility || 'public',
      status: data.status || 'submitted',
      creatorId: user.id,
      creatorName: user.displayName,
      creatorUsername: user.username,
      creatorAvatar: user.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 1,
      followersCount: 0,
      updates: [],
      verificationStatus: 'under_review',
      featured: false,
      isDiaspora: data.isDiaspora || false,
      diasporaLocation: data.diasporaLocation || '',
      institution: data.institution || '',
      researchField: data.researchField || '',
      authors: data.authors || '',
      businessModel: data.businessModel || '',
      budget: data.budget || '',
      problemStatement: data.problemStatement || '',
      proposedSolution: data.proposedSolution || '',
    };

    this.projects.unshift(newProject);

    // Auto add to creator's portfolio
    user.portfolioProjectIds.push(newProject.id);

    // Add notification
    this.addNotification({
      userId: user.id,
      title: 'Project Submitted Successfully',
      message: `"${newProject.title}" has been submitted for platform review.`,
      type: 'project_approved',
      link: newProject.id,
    });

    this.logAudit('Project Submission', user.displayName, `Submitted new project: ${newProject.title}`);
    this.save();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): boolean {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    this.projects[idx] = {
      ...this.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return true;
  }

  addProjectUpdate(projectId: string, updateData: { title: string; description: string; stage?: any; mediaUrl?: string }) {
    const project = this.getProjectById(projectId);
    if (!project) return false;

    const newUpdate: ProjectUpdate = {
      id: `upd_${Date.now()}`,
      title: updateData.title,
      description: updateData.description,
      date: new Date().toISOString().split('T')[0],
      stage: updateData.stage || project.stage,
      mediaUrl: updateData.mediaUrl,
    };

    project.updates.unshift(newUpdate);
    if (updateData.stage) {
      project.stage = updateData.stage;
    }
    project.updatedAt = new Date().toISOString();

    this.save();
    return true;
  }

  incrementProjectViews(id: string) {
    const project = this.getProjectById(id);
    if (project) {
      project.views += 1;
      this.save();
    }
  }

  toggleFollowProject(projectId: string): boolean {
    const project = this.getProjectById(projectId);
    if (!project) return false;

    if (this.followedProjectIds.has(projectId)) {
      this.followedProjectIds.delete(projectId);
      project.followersCount = Math.max(0, project.followersCount - 1);
    } else {
      this.followedProjectIds.add(projectId);
      project.followersCount += 1;
      this.addNotification({
        userId: project.creatorId,
        title: 'New Follower',
        message: `${this.getCurrentUser().displayName} followed your project "${project.title}".`,
        type: 'new_follower',
        link: projectId,
      });
    }
    this.save();
    return this.followedProjectIds.has(projectId);
  }

  isProjectFollowed(projectId: string): boolean {
    return this.followedProjectIds.has(projectId);
  }

  // --- Moderation / Admin ---
  setProjectModeration(
    projectId: string,
    status: ProjectStatus,
    verificationStatus?: VerificationStatus,
    featured?: boolean
  ) {
    const project = this.getProjectById(projectId);
    if (!project) return;

    project.status = status;
    if (verificationStatus) project.verificationStatus = verificationStatus;
    if (featured !== undefined) project.featured = featured;
    project.updatedAt = new Date().toISOString();

    this.addNotification({
      userId: project.creatorId,
      title: `Project Status: ${status.replace('_', ' ').toUpperCase()}`,
      message: `Your project "${project.title}" status has been updated to ${status}.`,
      type: 'project_approved',
      link: projectId,
    });

    this.logAudit('Moderation Action', this.getCurrentUser().displayName, `Project ${project.id} set to ${status}`);
    this.save();
  }

  // --- Creator & Profiles ---
  getCreatorById(id: string): Creator | undefined {
    return this.creators.find((c) => c.id === id);
  }

  getCreatorByUsername(username: string): Creator | undefined {
    return this.creators.find((c) => c.username === username);
  }

  updateCreatorProfile(id: string, updates: Partial<Creator>): boolean {
    const idx = this.creators.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.creators[idx] = { ...this.creators[idx], ...updates };
    this.save();
    return true;
  }

  // --- Collaborations ---
  getCollaborations(filter?: { category?: string; county?: string }): CollaborationRequest[] {
    let list = [...this.collaborations];
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((c) => c.category === filter.category);
    }
    if (filter?.county && filter.county !== 'all') {
      list = list.filter((c) => c.county.toLowerCase() === filter.county?.toLowerCase());
    }
    return list;
  }

  createCollaborationRequest(data: Partial<CollaborationRequest>): CollaborationRequest {
    const user = this.getCurrentUser();
    const newRequest: CollaborationRequest = {
      id: `collab_${Date.now()}`,
      projectId: data.projectId || '',
      projectTitle: data.projectTitle || 'Project Collaboration',
      category: data.category || 'tech',
      county: data.county || user.county,
      creatorId: user.id,
      creatorName: user.displayName,
      skillsRequired: data.skillsRequired || [],
      description: data.description || '',
      type: data.type || 'Co-Builder',
      locationPreference: data.locationPreference || 'remote',
      compensation: data.compensation || 'negotiable',
      duration: data.duration || 'Flexible',
      deadline: data.deadline || '',
      applicationsCount: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.collaborations.unshift(newRequest);
    this.save();
    return newRequest;
  }

  applyForCollaboration(requestId: string, proposal: string, skillsOffered: string[]): boolean {
    const req = this.collaborations.find((c) => c.id === requestId);
    if (!req) return false;

    const user = this.getCurrentUser();
    const newApp: CollaborationApplication = {
      id: `app_${Date.now()}`,
      requestId,
      projectTitle: req.projectTitle,
      applicantId: user.id,
      applicantName: user.displayName,
      applicantAvatar: user.avatar,
      proposal,
      skillsOffered,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.applications.unshift(newApp);
    req.applicationsCount += 1;

    this.addNotification({
      userId: req.creatorId,
      title: 'New Collaboration Proposal',
      message: `${user.displayName} applied for your collaboration request on "${req.projectTitle}".`,
      type: 'collaboration',
    });

    this.save();
    return true;
  }

  getUserApplications(userId: string): CollaborationApplication[] {
    return this.applications.filter((a) => a.applicantId === userId);
  }

  // --- Opportunities ---
  getOpportunities(category?: string): Opportunity[] {
    if (!category || category === 'all') return this.opportunities;
    return this.opportunities.filter((o) => o.category === category);
  }

  toggleSaveOpportunity(oppId: string): boolean {
    if (this.savedOpportunityIds.has(oppId)) {
      this.savedOpportunityIds.delete(oppId);
    } else {
      this.savedOpportunityIds.add(oppId);
    }
    this.save();
    return this.savedOpportunityIds.has(oppId);
  }

  isOpportunitySaved(oppId: string): boolean {
    return this.savedOpportunityIds.has(oppId);
  }

  // --- Investors ---
  getInvestors(): InvestorProfile[] {
    return this.investors;
  }

  // --- Notifications ---
  getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  getUnreadNotificationsCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length;
  }

  markNotificationAsRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  addNotification(n: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) {
    this.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      ...n,
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
  }

  // --- Messages ---
  getMessages(userId1: string, userId2: string): MessageItem[] {
    return this.messages.filter(
      (m) =>
        (m.senderId === userId1 && m.recipientId === userId2) ||
        (m.senderId === userId2 && m.recipientId === userId1)
    );
  }

  sendMessage(recipientId: string, text: string): MessageItem {
    const sender = this.getCurrentUser();
    const recipient = this.getCreatorById(recipientId);

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      conversationId: [sender.id, recipientId].sort().join('_'),
      senderId: sender.id,
      senderName: sender.displayName,
      senderAvatar: sender.avatar,
      recipientId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.messages.push(newMsg);

    this.addNotification({
      userId: recipientId,
      title: `Message from ${sender.displayName}`,
      message: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
      type: 'message',
    });

    this.save();
    return newMsg;
  }

  // --- Live Statistics ---
  getLiveStatistics() {
    const publishedProjects = this.projects.filter((p) => p.status === 'published');
    const ideasSubmitted = this.projects.filter((p) => p.submissionType === 'idea').length;

    const representedCounties = new Set(publishedProjects.map((p) => p.county.toLowerCase()));

    return {
      projectsPublished: publishedProjects.length,
      ideasSubmitted: ideasSubmitted,
      countiesRepresented: representedCounties.size,
      creatorsRegistered: this.creators.length,
      collaborationsInitiated: this.collaborations.length,
      opportunitiesPublished: this.opportunities.length,
    };
  }

  // --- Audit Logs ---
  logAudit(action: string, user: string, details: string) {
    this.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
    });
    if (this.auditLogs.length > 100) this.auditLogs.pop();
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  // --- Data Export & Privacy (Kenya DPA) ---
  exportUserData(userId: string) {
    const user = this.getCreatorById(userId);
    const userProjects = this.projects.filter((p) => p.creatorId === userId);
    const userApps = this.applications.filter((a) => a.applicantId === userId);
    const userCollabs = this.collaborations.filter((c) => c.creatorId === userId);

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        profile: user,
        projects: userProjects,
        applications: userApps,
        collaborations: userCollabs,
        dpaStatement: 'Exported under the Kenya Data Protection Act 2019 rights of data subjects.',
      },
      null,
      2
    );
  }

  resetToDefaults() {
    localStorage.clear();
    this.projects = [...SEED_PROJECTS];
    this.creators = [...SEED_CREATORS];
    this.collaborations = [...SEED_COLLABORATIONS];
    this.opportunities = [...SEED_OPPORTUNITIES];
    this.investors = [...SEED_INVESTORS];
    this.applications = [];
    this.notifications = this.createInitialNotifications();
    this.messages = this.createInitialMessages();
    this.currentUserId = 'user_1';
    this.followedProjectIds = new Set(['proj_1', 'proj_2']);
    this.savedOpportunityIds = new Set(['opp_1']);
    this.auditLogs = [
      {
        timestamp: new Date().toISOString(),
        action: 'Factory Reset',
        user: 'Admin',
        details: 'Platform reset to fresh 47-county seed state',
      },
    ];
    this.save();
  }

  private createInitialNotifications(): NotificationItem[] {
    return [
      {
        id: 'notif_1',
        userId: 'user_1',
        title: 'Project Evidence Reviewed',
        message: 'Your project "M-Nyunyu: IoT Solar Irrigation Controller" has been verified by the technical moderation team.',
        type: 'project_approved',
        link: 'proj_1',
        read: false,
        createdAt: '2026-02-15T10:00:00Z',
      },
      {
        id: 'notif_2',
        userId: 'user_1',
        title: 'New Collaboration Application',
        message: 'A mechanical engineer in Thika applied to your solar sensor enclosure request.',
        type: 'collaboration',
        read: false,
        createdAt: '2026-02-18T14:20:00Z',
      },
    ];
  }

  private createInitialMessages(): MessageItem[] {
    return [
      {
        id: 'msg_init_1',
        conversationId: 'user_1_user_2',
        senderId: 'user_2',
        senderName: 'Kevin Odhiambo',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        recipientId: 'user_1',
        text: 'Habari Wambui! Loved your presentation on M-Nyunyu irrigation. Would love to explore feeding your soil moisture telemetry into our disease prediction model.',
        timestamp: '2026-02-18T15:00:00Z',
        read: true,
      },
      {
        id: 'msg_init_2',
        conversationId: 'user_1_user_2',
        senderId: 'user_1',
        senderName: 'Wambui Kamau',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        recipientId: 'user_2',
        text: 'Asante Kevin! That would be fantastic—especially for root rot forecasting. Let us connect!',
        timestamp: '2026-02-18T15:25:00Z',
        read: false,
      },
    ];
  }

  // ==========================================
  // INNOVATION HUB & 50/50 PARTNERSHIP METHODS
  // ==========================================

  getInnovationProposals(filter?: {
    contributorId?: string;
    status?: ProposalStatus;
    isNationalCandidate?: boolean;
    category?: string;
    search?: string;
  }): InnovationProposal[] {
    let result = [...this.proposals];

    if (filter?.contributorId) {
      result = result.filter((p) => p.contributorId === filter.contributorId);
    }
    if (filter?.status) {
      result = result.filter((p) => p.status === filter.status);
    }
    if (filter?.isNationalCandidate !== undefined) {
      result = result.filter((p) => p.isNationalScaleCandidate === filter.isNationalCandidate);
    }
    if (filter?.category && filter.category !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.county.toLowerCase().includes(q) ||
          p.contributorName.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }

  getInnovationProposalById(id: string): InnovationProposal | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  saveInnovationProposal(proposal: InnovationProposal): InnovationProposal {
    const existingIndex = this.proposals.findIndex((p) => p.id === proposal.id);
    const now = new Date().toISOString();
    proposal.updatedAt = now;

    if (existingIndex >= 0) {
      this.proposals[existingIndex] = proposal;
      this.addInnovationAuditLog(proposal.id, 'Proposal Updated', `Proposal ${proposal.id} updated by ${proposal.contributorName}`);
    } else {
      this.proposals.unshift(proposal);
      this.addInnovationAuditLog(
        proposal.id,
        'New Proposal Submitted',
        `New ${proposal.type === 'missing_feature' ? 'Missing Feature' : 'National Project'} submitted by ${proposal.contributorName} (${proposal.county})`
      );

      // Notification to contributor
      this.addNotification({
        userId: proposal.contributorId,
        title: 'Innovation Proposal Received 🚀',
        message: `Your proposal "${proposal.title}" (ID: ${proposal.id}) has been registered and is now under KenyaOne Admin evaluation.`,
        type: 'system',
        link: proposal.id,
      });

      // Notification to admin
      this.addNotification({
        userId: 'user_admin',
        title: 'New National Innovation Proposal',
        message: `${proposal.contributorName} from ${proposal.county} submitted "${proposal.title}" (${proposal.aiNationalImpactScore}% Impact Score).`,
        type: 'system',
        link: proposal.id,
      });
    }

    this.save();
    return proposal;
  }

  updateProposalStatus(
    id: string,
    newStatus: ProposalStatus,
    feedback?: string,
    actionName = 'Status Updated',
    adminId = 'user_admin'
  ): boolean {
    const proposal = this.getInnovationProposalById(id);
    if (!proposal) return false;

    const oldStatus = proposal.status;
    proposal.status = newStatus;
    proposal.updatedAt = new Date().toISOString();
    if (feedback) {
      proposal.adminFeedback = feedback;
    }

    const admin = this.creators.find((c) => c.id === adminId) || this.getCurrentUser();
    this.addInnovationAuditLog(
      id,
      actionName,
      `Status changed from ${oldStatus} to ${newStatus}. Note: ${feedback || 'No administrative comment'}`,
      admin.id,
      admin.displayName
    );

    // Contributor notification
    const statusTitles: Record<string, string> = {
      approved: 'Proposal Approved! 🎉',
      rejected: 'Proposal Update',
      more_info_requested: 'More Information Needed 📋',
      partnership_evaluation: '50/50 Partnership Evaluation Started 🤝',
      in_development: 'Project Moved to Development 🛠️',
      published: 'Your Project is Live on KenyaOne! 🇰🇪',
    };

    this.addNotification({
      userId: proposal.contributorId,
      title: statusTitles[newStatus] || `Proposal Status: ${newStatus}`,
      message: feedback || `Your proposal "${proposal.title}" has transitioned to ${newStatus.replace(/_/g, ' ')}.`,
      type: 'project_approved',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  adminRequestMoreInfo(id: string, requestText: string, adminId = 'user_admin'): boolean {
    const proposal = this.getInnovationProposalById(id);
    if (!proposal) return false;

    proposal.status = 'more_info_requested';
    proposal.adminMoreInfoRequested = requestText;
    proposal.updatedAt = new Date().toISOString();

    const admin = this.creators.find((c) => c.id === adminId) || this.getCurrentUser();
    this.addInnovationAuditLog(id, 'Information Requested', requestText, admin.id, admin.displayName);

    this.addNotification({
      userId: proposal.contributorId,
      title: 'Action Required: Additional Info Requested 📋',
      message: `The KenyaOne Administrator requested clarification on "${proposal.title}": ${requestText}`,
      type: 'system',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  contributorSubmitMoreInfo(id: string, responseText: string): boolean {
    const proposal = this.getInnovationProposalById(id);
    if (!proposal) return false;

    proposal.contributorResponse = responseText;
    proposal.status = 'under_admin_review';
    proposal.updatedAt = new Date().toISOString();

    // Append to conversation
    proposal.conversationHistory.push({
      id: `resp_${Date.now()}`,
      sender: 'user',
      senderName: proposal.contributorName,
      message: responseText,
      timestamp: new Date().toISOString(),
    });

    this.addInnovationAuditLog(
      id,
      'Contributor Responded',
      `Contributor submitted requested details: ${responseText}`
    );

    this.addNotification({
      userId: 'user_admin',
      title: 'Contributor Responded to Request',
      message: `${proposal.contributorName} submitted additional details for proposal "${proposal.title}".`,
      type: 'system',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  adminOfferPartnership(
    id: string,
    offerType: 'fifty_fifty' | 'negotiated' | 'recognition' = 'fifty_fifty',
    customTerms?: Partial<PartnershipAgreement>,
    adminId = 'user_admin'
  ): boolean {
    const proposal = this.getInnovationProposalById(id);
    if (!proposal) return false;

    proposal.status = 'partnership_evaluation';
    proposal.partnershipEligibility = offerType === 'fifty_fifty' ? 'offered_50_50' : 'negotiating';
    proposal.partnershipOfferType = offerType;
    proposal.isNationalScaleCandidate = true;
    proposal.updatedAt = new Date().toISOString();

    // Draft Agreement if not yet existing
    if (!proposal.agreement) {
      proposal.agreement = {
        id: `AGR-KE-${Date.now().toString().slice(-6)}`,
        proposalId: proposal.id,
        projectTitle: proposal.title,
        contributorId: proposal.contributorId,
        contributorName: proposal.contributorName,
        kenyaOneSharePercent: 50,
        contributorSharePercent: 50,
        modelType: 'net_profit_sharing',
        effectiveDate: new Date().toISOString().split('T')[0],
        ipAssignmentClause:
          'Joint sovereign intellectual property license under Kenya Industrial Property Institute (KIPI) guidelines. The proprietary trading algorithms, cloud infrastructure, and national database belong to the KenyaOne Sovereign Digital Infrastructure, while domain operations and agricultural/technical trade secrets are co-owned 50/50.',
        confidentialityClause:
          'Both parties agree to treat all user telemetry, vendor contracts, and technical specifications as strictly confidential under the Kenya Data Protection Act 2019.',
        accountingAuditClause:
          'Monthly certified financial reconciliation published on the 5th of each calendar month. Net distributable profit equals gross revenue minus verifiable direct operational, cloud, and statutory deductions.',
        disputeResolution:
          'Nairobi Centre for International Arbitration (NCIA) under Kenyan commercial arbitration law.',
        terminationClause:
          'Either party may terminate on 90 days written notice for material uncured breach. Contributor retains perpetual 50% dividend rights on active recurring client accounts originated during term.',
        signedByContributor: false,
        signedByAdmin: true,
        signedByAdminDate: new Date().toISOString(),
        status: 'pending_signature',
        ...customTerms,
      };
    }

    const admin = this.creators.find((c) => c.id === adminId) || this.getCurrentUser();
    this.addInnovationAuditLog(
      id,
      '50/50 Partnership Offered',
      `Administrator offered 50/50 National Innovation Partnership to ${proposal.contributorName}`,
      admin.id,
      admin.displayName
    );

    this.addNotification({
      userId: proposal.contributorId,
      title: 'Congratulations: 50/50 Partnership Offer! 🤝',
      message: `KenyaOne has formally invited you to co-found "${proposal.title}" under the 50/50 National Innovation Partnership Programme. Review your agreement now.`,
      type: 'project_approved',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  contributorSignAgreement(proposalId: string): boolean {
    const proposal = this.getInnovationProposalById(proposalId);
    if (!proposal || !proposal.agreement) return false;

    proposal.agreement.signedByContributor = true;
    proposal.agreement.signedByContributorDate = new Date().toISOString();
    proposal.agreement.status = proposal.agreement.signedByAdmin ? 'executed' : 'pending_signature';
    if (proposal.agreement.status === 'executed') {
      proposal.status = 'approved';
      proposal.partnershipEligibility = 'agreement_signed';
    }
    proposal.updatedAt = new Date().toISOString();

    this.addInnovationAuditLog(
      proposalId,
      'Agreement Signed by Contributor',
      `Contributor ${proposal.contributorName} digitally executed the 50/50 Partnership Agreement.`
    );

    this.addNotification({
      userId: 'user_admin',
      title: 'Partnership Agreement Executed by Contributor! ✍️',
      message: `${proposal.contributorName} signed the 50/50 agreement for "${proposal.title}". Project is ready for development team allocation.`,
      type: 'system',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  adminSignAgreement(proposalId: string, adminId = 'user_admin'): boolean {
    const proposal = this.getInnovationProposalById(proposalId);
    if (!proposal || !proposal.agreement) return false;

    proposal.agreement.signedByAdmin = true;
    proposal.agreement.signedByAdminDate = new Date().toISOString();
    proposal.agreement.status = proposal.agreement.signedByContributor ? 'executed' : 'pending_signature';
    if (proposal.agreement.status === 'executed') {
      proposal.status = 'approved';
      proposal.partnershipEligibility = 'agreement_signed';
    }
    proposal.updatedAt = new Date().toISOString();

    const admin = this.creators.find((c) => c.id === adminId) || this.getCurrentUser();
    this.addInnovationAuditLog(
      proposalId,
      'Agreement Countersigned by Admin',
      `Administrator ${admin.displayName} countersigned the 50/50 Partnership Agreement.`,
      admin.id,
      admin.displayName
    );

    this.addNotification({
      userId: proposal.contributorId,
      title: '50/50 Agreement Executed & Certified 📜',
      message: `Your partnership agreement for "${proposal.title}" has been signed by the KenyaOne Administrator and is legally binding.`,
      type: 'project_approved',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  adminAssignProjectManager(proposalId: string, pmName: string, adminId = 'user_admin'): boolean {
    const proposal = this.getInnovationProposalById(proposalId);
    if (!proposal) return false;

    proposal.assignedProjectManager = pmName;
    proposal.status = 'in_development';
    proposal.updatedAt = new Date().toISOString();

    const admin = this.creators.find((c) => c.id === adminId) || this.getCurrentUser();
    this.addInnovationAuditLog(
      proposalId,
      'Project Manager Assigned',
      `Assigned ${pmName} as Lead Project Manager. Transferred to development pipeline.`,
      admin.id,
      admin.displayName
    );

    this.addNotification({
      userId: proposal.contributorId,
      title: 'Project Development Kickoff! 🚀',
      message: `Engineering lead ${pmName} has been assigned to develop "${proposal.title}". You can track development milestones in your dashboard.`,
      type: 'system',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  adminPublishInnovation(proposalId: string, publishedUrl?: string, adminId = 'user_admin'): boolean {
    const proposal = this.getInnovationProposalById(proposalId);
    if (!proposal) return false;

    proposal.status = 'published';
    proposal.publishedProjectUrl = publishedUrl || `#/innovations/${proposal.id}`;
    proposal.updatedAt = new Date().toISOString();

    const admin = this.creators.find((c) => c.id === adminId) || this.getCurrentUser();
    this.addInnovationAuditLog(
      proposalId,
      'Published to National Innovations Marketplace',
      `Project "${proposal.title}" is now publicly showcased on KenyaOne National Innovations.`,
      admin.id,
      admin.displayName
    );

    this.addNotification({
      userId: proposal.contributorId,
      title: 'Your Innovation is Live on KenyaOne! 🇰🇪',
      message: `Congratulations! "${proposal.title}" has officially launched on the KenyaOne National Innovation Marketplace!`,
      type: 'project_approved',
      link: proposal.id,
    });

    this.save();
    return true;
  }

  getInnovationAuditLogs(proposalId?: string): InnovationAuditLog[] {
    if (proposalId) {
      return this.innovationAuditLogs.filter((l) => l.proposalId === proposalId);
    }
    return [...this.innovationAuditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addInnovationAuditLog(
    proposalId: string,
    action: string,
    details: string,
    adminId = 'user_admin',
    adminName = 'Kenya Creates Administrator'
  ) {
    const log: InnovationAuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      proposalId,
      adminId,
      adminName,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    this.innovationAuditLogs.unshift(log);
    if (this.innovationAuditLogs.length > 200) {
      this.innovationAuditLogs.pop();
    }
    this.save();
  }

  checkDuplicateIdea(text: string): {
    isDuplicate: boolean;
    similarityScore: number;
    matchedTitle?: string;
    matchedType?: 'project' | 'proposal';
    suggestion?: string;
  } {
    const cleanText = text.toLowerCase();
    const keywords = cleanText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'need', 'want', 'build', 'platform'].includes(w));

    // Check existing projects
    for (const project of this.projects) {
      const projText = (project.title + ' ' + project.description + ' ' + (project.problemStatement || '')).toLowerCase();
      let matchCount = 0;
      for (const kw of keywords) {
        if (projText.includes(kw)) matchCount++;
      }
      const score = Math.round((matchCount / Math.max(keywords.length, 1)) * 100);
      if (score >= 40) {
        return {
          isDuplicate: true,
          similarityScore: score,
          matchedTitle: project.title,
          matchedType: 'project',
          suggestion: `We noticed an existing initiative: "${project.title}". You can propose an improvement, a missing feature, or specialized expansion for your county!`,
        };
      }
    }

    // Check existing proposals
    for (const proposal of this.proposals) {
      const propText = (proposal.title + ' ' + proposal.originalIdea + ' ' + proposal.description).toLowerCase();
      let matchCount = 0;
      for (const kw of keywords) {
        if (propText.includes(kw)) matchCount++;
      }
      const score = Math.round((matchCount / Math.max(keywords.length, 1)) * 100);
      if (score >= 40) {
        return {
          isDuplicate: true,
          similarityScore: score,
          matchedTitle: proposal.title,
          matchedType: 'proposal',
          suggestion: `A similar proposal "${proposal.title}" is currently under review. Consider focusing on a distinct value-add, unique partnership angle, or regional implementation.`,
        };
      }
    }

    return { isDuplicate: false, similarityScore: 0 };
  }

  getInnovationHubStats() {
    const total = this.proposals.length;
    const newSubmissions = this.proposals.filter((p) => p.status === 'submitted' || p.status === 'ai_processing').length;
    const awaitingReview = this.proposals.filter((p) => p.status === 'under_admin_review').length;
    const moreInfoNeeded = this.proposals.filter((p) => p.status === 'more_info_requested').length;
    const partnershipCandidates = this.proposals.filter(
      (p) => p.isNationalScaleCandidate || p.partnershipEligibility === 'offered_50_50' || p.partnershipEligibility === 'agreement_signed'
    ).length;
    const approved = this.proposals.filter((p) => p.status === 'approved').length;
    const inDevelopment = this.proposals.filter((p) => p.status === 'in_development' || p.status === 'testing').length;
    const published = this.proposals.filter((p) => p.status === 'published').length;

    // Calculate total recorded revenue across all financial reports
    let totalGrossRevenue = 0;
    let totalNetDistributable = 0;
    let totalContributorPayouts = 0;

    for (const proposal of this.proposals) {
      if (proposal.financialReports) {
        for (const report of proposal.financialReports) {
          totalGrossRevenue += report.grossRevenue;
          totalNetDistributable += report.netDistributableProfit;
          if (report.payoutStatus === 'paid') {
            totalContributorPayouts += report.contributorShare;
          }
        }
      }
    }

    return {
      total,
      newSubmissions,
      awaitingReview,
      moreInfoNeeded,
      partnershipCandidates,
      approved,
      inDevelopment,
      published,
      totalGrossRevenue,
      totalNetDistributable,
      totalContributorPayouts,
    };
  }
}

export const storage = new StorageService();

