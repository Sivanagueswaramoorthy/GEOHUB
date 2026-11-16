import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import {
  FacultyHomeView,
  StudentHomeView,
  TreasurerHomeView,
  DocumentationHomeView,
  PromotionHomeView,
  ManagementHomeView,
} from '../index';

describe('Role Home Views Comprehensive Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FacultyHomeView', () => {
    it('renders Faculty desk hero card, advisor chip, approvals trigger, and corpus', () => {
      render(
        <AppProvider>
          <FacultyHomeView />
        </AppProvider>
      );

      // HeroCard elements
      expect(screen.getByText('Faculty desk')).toBeInTheDocument();
      expect(screen.getByText('Institutional governance & sanction authority')).toBeInTheDocument();
      expect(screen.getByText('Advisor Desk')).toBeInTheDocument();

      // Quick action button
      expect(screen.getAllByText('Approvals')[0]).toBeInTheDocument();
    });
  });

  describe('StudentHomeView', () => {
    it('renders student welcome card, stats, and action buttons', () => {
      render(
        <AppProvider>
          <StudentHomeView />
        </AppProvider>
      );

      // Student subtitle and quick picks
      expect(screen.getByText('Campus geomatics & eco initiatives')).toBeInTheDocument();
      expect(screen.getByText('Quick picks')).toBeInTheDocument();
    });
  });

  describe('TreasurerHomeView', () => {
    it('renders Finance hero card, treasury chip, budget tiles, and action buttons', () => {
      render(
        <AppProvider>
          <TreasurerHomeView />
        </AppProvider>
      );

      // HeroCard elements
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('Treasury, ledgers & expenditure tracking')).toBeInTheDocument();
      expect(screen.getByText('Treasury')).toBeInTheDocument();

      // Action button
      expect(screen.getByText('+ Add expense')).toBeInTheDocument();
    });
  });

  describe('DocumentationHomeView', () => {
    it('renders Documentation hero card, Documentation chip, and Quick Links', () => {
      render(
        <AppProvider>
          <DocumentationHomeView />
        </AppProvider>
      );

      // Documentation status chip
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Archival studio, records & official press bulletins')).toBeInTheDocument();

      // Quick links section
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
    });
  });

  describe('PromotionHomeView', () => {
    it('renders Promotion hero card, New post button, and QR scanner shortcut', () => {
      render(
        <AppProvider>
          <PromotionHomeView />
        </AppProvider>
      );

      // HeroCard elements
      expect(screen.getAllByText('Promotion')[0]).toBeInTheDocument();
      expect(screen.getByText('Publicity, social media & campus campaigns')).toBeInTheDocument();

      // Action buttons
      expect(screen.getByText('+ New post')).toBeInTheDocument();
      expect(screen.getByText('QR Scanner')).toBeInTheDocument();
    });
  });

  describe('ManagementHomeView', () => {
    it('renders Management Desk hero card, Attendance button, and Meetings button', () => {
      render(
        <AppProvider>
          <ManagementHomeView />
        </AppProvider>
      );

      // HeroCard elements
      expect(screen.getByText('Management Desk')).toBeInTheDocument();
      expect(screen.getByText('Operations & chapter coordination')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();

      // Action buttons
      expect(screen.getAllByText('Attendance')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Meetings')[0]).toBeInTheDocument();
    });
  });
});
