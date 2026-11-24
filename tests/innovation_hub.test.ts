import test from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../src/services/storageService.ts';

test('Innovation Hub - Seed Proposals Loaded', () => {
  const proposals = storage.getInnovationProposals();
  assert.ok(proposals.length >= 5, 'Should have at least 5 seed proposals across Kenyan counties');
  
  const murangaProp = storage.getInnovationProposalById('KE-PROP-2026-081');
  assert.ok(murangaProp, 'Muranga HassDirect proposal should exist');
  assert.equal(murangaProp?.county, "Murang'a");
  assert.equal(murangaProp?.partnershipEligibility, 'offered_50_50');
  assert.equal(murangaProp?.partnershipOfferType, 'fifty_fifty');
});

test('Innovation Hub - Duplicate Idea Detection', () => {
  // Check avocado query against HassDirect proposal
  const duplicateCheck = storage.checkDuplicateIdea('avocado cold storage and direct hotel supply in Muranga');
  assert.ok(duplicateCheck.isDuplicate, 'Should detect similarity to Murang\'a avocado project');
  assert.ok(duplicateCheck.matchedTitle?.includes('HassDirect') || duplicateCheck.matchedTitle?.includes('Avocado'), 'Matched title should identify HassDirect');

  // Novel unique idea
  const uniqueCheck = storage.checkDuplicateIdea('Geothermal volcanic pumice stone acoustic insulation for Samburu earth shelters');
  assert.equal(uniqueCheck.isDuplicate, false, 'Novel unique concept should not be flagged as duplicate');
});

test('Innovation Hub - 50/50 Partnership Agreement Execution Workflow', () => {
  // Create a fresh test proposal
  const testId = `KE-PROP-TEST-${Date.now().toString().slice(-4)}`;
  storage.saveInnovationProposal({
    id: testId,
    type: 'new_business',
    title: 'Test Kitui Honey Processing & Blockchain Traceability',
    category: 'Agriculture & Food',
    county: 'Kitui',
    contributorId: 'user_creator',
    contributorName: 'Amina Mwende',
    contributorEmail: 'amina@kituihoney.co.ke',
    contributorPhone: '+254 711 223344',
    originalIdea: 'Direct solar honey extraction with digital barcode lot verification',
    description: 'High-purity honey traceability platform for Kitui beekeepers',
    submissionDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'submitted',
    confidential: false,
    isNationalScaleCandidate: true,
    partnershipEligibility: 'under_evaluation',
    partnershipOfferType: 'none',
    aiFeasibilityScore: 89,
    aiNationalImpactScore: 92,
    problemAnalysis: {
      problem: 'Adulteration in commercial honey market',
      limitations: 'Brokers pay low prices',
      beneficiaries: '3,000 Kitui beekeepers',
      affectedCounties: ['Kitui', 'Makueni', 'Machakos'],
      existingAlternatives: 'Uncertified roadside honey sellers',
      whyItMatters: 'Protects Kenyan export grade honey standards',
    },
    proposedSolution: {
      recommendedSolution: 'QR code verified batch packaging with escrow payouts',
      howItWorks: 'Testing -> QR seal -> Direct supermarket order -> M-Pesa release',
      websiteFeatures: ['Batch certificate lookup', 'Cooperative payout ledger'],
      mobileFeatures: ['PWA offline scanner', 'SMS delivery confirmation'],
      aiIntegration: 'Refractometer image verification of sugar density',
      requiredApis: ['M-Pesa Daraja', 'KEBS Verification Portal'],
    },
    businessModel: {
      revenueStreams: ['KES 15 per verified QR tag', '2% wholesale clearance fee'],
      transactionCommissions: '2%',
      operatingExpensesEstimate: 'KES 180,000 monthly',
      potentialProfitability: 'KES 2.4M annually',
      financialAssumptions: '40 tons of honey certified in Year 1',
    },
    nationalImpact: {
      beneficiariesEstimate: '15,000 households',
      countiesCovered: 'Eastern arid counties',
      employmentCreation: '45 direct inspection and packing jobs',
      economicContribution: 'KES 80M annual trade uplift',
      internationalExpansion: 'Gulf cooperation council exports',
    },
    technicalRequirements: {
      infrastructure: 'Cloudflare Workers and PostgreSQL',
      database: 'PostgreSQL',
      apis: ['M-Pesa Daraja'],
      securityRequirements: 'Data Protection Act 2019',
      estimatedDevelopmentWeeks: 8,
    },
    partnershipTerms: {
      qualifies5050: true,
      contributorResponsibilities: ['Manage Kitui beekeeper cooperative outreach'],
      kenyaOneResponsibilities: ['Host and maintain QR verification registry and payment engine'],
      structureNote: '50/50 net profit distribution',
    },
    conversationHistory: [],
    financialReports: [],
  });

  // Verify initial creation
  let prop = storage.getInnovationProposalById(testId);
  assert.ok(prop);
  assert.equal(prop?.status, 'submitted');

  // Admin reviews and offers 50/50 partnership
  const offerSuccess = storage.adminOfferPartnership(testId, 'fifty_fifty', {
    kenyaOneSharePercent: 50,
    contributorSharePercent: 50,
    modelType: 'net_profit_sharing',
  });
  assert.equal(offerSuccess, true);

  prop = storage.getInnovationProposalById(testId);
  assert.equal(prop?.partnershipEligibility, 'offered_50_50');
  assert.ok(prop?.agreement, 'Partnership agreement should be drafted');
  assert.equal(prop?.agreement?.kenyaOneSharePercent, 50);
  assert.equal(prop?.agreement?.contributorSharePercent, 50);

  // Contributor signs agreement
  const signContributor = storage.contributorSignAgreement(testId);
  assert.equal(signContributor, true);

  prop = storage.getInnovationProposalById(testId);
  assert.equal(prop?.agreement?.signedByContributor, true);

  // Admin signs agreement
  const signAdmin = storage.adminSignAgreement(testId);
  assert.equal(signAdmin, true);

  prop = storage.getInnovationProposalById(testId);
  assert.equal(prop?.agreement?.signedByAdmin, true);
  assert.equal(prop?.agreement?.status, 'executed');
  assert.equal(prop?.status, 'approved');

  // Assign Project Manager
  storage.adminAssignProjectManager(testId, 'Eng. Mercy Chebet', 'mercy@kenyaone.go.ke');
  prop = storage.getInnovationProposalById(testId);
  assert.equal(prop?.assignedProjectManager, 'Eng. Mercy Chebet');
  assert.equal(prop?.status, 'in_development');

  // Publish to Marketplace
  storage.adminPublishInnovation(testId);
  prop = storage.getInnovationProposalById(testId);
  assert.equal(prop?.status, 'published');
});

test('Innovation Hub - Financial Calculation Consistency', () => {
  const stats = storage.getInnovationHubStats();
  assert.ok(stats.total >= 5, `Expected total >= 5, got ${stats.total}`);
  assert.ok(stats.partnershipCandidates >= 1, `Expected partnershipCandidates >= 1, got ${stats.partnershipCandidates}`);
  assert.ok(stats.totalGrossRevenue > 0, 'Seed financial reports should yield gross revenue');
  assert.ok(stats.totalContributorPayouts > 0, 'Seed financial reports should calculate 50% contributor payouts');
  assert.equal(stats.totalNetDistributable, stats.totalGrossRevenue - (stats.totalGrossRevenue - stats.totalNetDistributable));
});
