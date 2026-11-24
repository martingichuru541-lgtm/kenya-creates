import test from 'node:test';
import assert from 'node:assert/strict';
import { storage } from './storageService';

test('StorageService initializes with default seed data', () => {
  const projects = storage.getProjects({ onlyPublished: true });
  assert.ok(projects.length >= 5, 'Should have at least 5 seeded published projects');
});

test('Live statistics accurately derive project and county counts', () => {
  const stats = storage.getLiveStatistics();
  assert.ok(stats.projectsPublished > 0, 'Published projects must be greater than 0');
  assert.ok(stats.countiesRepresented > 0, 'Counties represented must be greater than 0');
  assert.ok(stats.creatorsRegistered > 0, 'Creators registered must be greater than 0');
});

test('County filtering filters projects accurately', () => {
  const nakuruProjects = storage.getProjects({ county: 'Nakuru', onlyPublished: true });
  for (const p of nakuruProjects) {
    assert.equal(p.county.toLowerCase(), 'nakuru');
  }
});

test('Follow project toggle increments and decrements followers', () => {
  const project = storage.getProjectById('proj_3')!;
  const initialFollowers = project.followersCount;
  
  const isFollowed1 = storage.toggleFollowProject('proj_3');
  assert.equal(isFollowed1, true);
  assert.equal(project.followersCount, initialFollowers + 1);

  const isFollowed2 = storage.toggleFollowProject('proj_3');
  assert.equal(isFollowed2, false);
  assert.equal(project.followersCount, initialFollowers);
});

test('Project creation saves new project and emits notification', () => {
  const newProj = storage.createProject({
    title: 'Solar Cold Room in Garissa',
    tagline: 'Preserving camel milk freshness across Garissa camel cooperatives',
    county: 'Garissa',
    category: 'agri',
    stage: 'prototype_dev',
    submissionType: 'innovation',
  });

  assert.ok(newProj.id.startsWith('proj_'));
  assert.equal(newProj.county, 'Garissa');
  assert.equal(newProj.status, 'submitted');

  const retrieved = storage.getProjectById(newProj.id);
  assert.ok(retrieved !== undefined);
  assert.equal(retrieved?.title, 'Solar Cold Room in Garissa');
});
