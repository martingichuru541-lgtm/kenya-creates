import test from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../src/services/storageService.ts';
import { proposalService } from '../src/services/proposalService.ts';
import { ContributorInnovationDashboard } from '../src/components/ContributorInnovationDashboard.ts';

test('ContributorInnovationDashboard - Fetches and renders proposals for user', () => {
  const user = storage.getCurrentUser();
  assert.ok(user, 'Current user should exist');

  // Fetch proposals via proposalService
  const proposals = proposalService.getUserSubmittedProposalsSync(user.id);
  assert.ok(Array.isArray(proposals), 'Proposals should be an array');

  // Render the dashboard
  const html = ContributorInnovationDashboard.render(user, 'all');
  assert.ok(html.includes('contributor-innovation-dashboard'), 'Dashboard container should be present');
  assert.ok(html.includes('liquid-glass-card'), 'Should use liquid-glass-card CSS class');

  // If user has proposals, verify title, submission date, and status are rendered
  if (proposals.length > 0) {
    const firstProposal = proposals[0];
    assert.ok(html.includes(firstProposal.title), 'HTML should render proposal Title');
    assert.ok(html.includes(firstProposal.id), 'HTML should render proposal ID');
    
    // Status badge verification
    const badge = ContributorInnovationDashboard.getStatusBadge(firstProposal.status);
    assert.ok(html.includes(badge.label), `HTML should render proposal Status badge: ${badge.label}`);

    // Submission date verification
    const formattedDate = ContributorInnovationDashboard.formatDate(firstProposal.submissionDate);
    assert.ok(html.includes(formattedDate), `HTML should render formatted submission date: ${formattedDate}`);
  }
});

test('ContributorInnovationDashboard - Individual card renders Title, Submission Date, and Status in liquid-glass-card', () => {
  const allProposals = storage.getInnovationProposals();
  assert.ok(allProposals.length > 0, 'There should be seed proposals');

  const sample = allProposals[0];
  const cardHtml = ContributorInnovationDashboard.renderProposalCard(sample);

  // 1. liquid-glass-card class check
  assert.ok(cardHtml.includes('liquid-glass-card'), 'Card must have liquid-glass-card styling class');

  // 2. Title check
  assert.ok(cardHtml.includes(sample.title), 'Card must show Title');

  // 3. Status check
  const badge = ContributorInnovationDashboard.getStatusBadge(sample.status);
  assert.ok(cardHtml.includes(badge.label), `Card must show Status badge: ${badge.label}`);

  // 4. Submission Date check
  const formattedDate = ContributorInnovationDashboard.formatDate(sample.submissionDate);
  assert.ok(cardHtml.includes(formattedDate), `Card must show Submission Date: ${formattedDate}`);
});

test('ContributorInnovationDashboard - Filter tabs logic', () => {
  const user = storage.getCurrentUser();

  // Test filter tabs
  const htmlAll = ContributorInnovationDashboard.render(user, 'all');
  assert.ok(htmlAll.includes('All ('), 'All filter tab should be rendered');

  const htmlActionRequired = ContributorInnovationDashboard.render(user, 'action_required');
  assert.ok(htmlActionRequired.includes('Action Required'), 'Action Required filter tab should be rendered');

  const htmlUnderReview = ContributorInnovationDashboard.render(user, 'under_review');
  assert.ok(htmlUnderReview.includes('In Review'), 'In Review filter tab should be rendered');

  const html5050 = ContributorInnovationDashboard.render(user, 'partnership_5050');
  assert.ok(html5050.includes('50/50 Ventures'), '50/50 Ventures filter tab should be rendered');
});
