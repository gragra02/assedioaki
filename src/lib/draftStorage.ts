import { ReportDraft } from '../types';

const DRAFT_STORAGE_KEY = 'assedioaki_report_draft';

/**
 * Saves a complaint report draft into localStorage
 */
export function saveReportDraft(draft: ReportDraft): void {
  try {
    const serialized = JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save draft to localStorage:', error);
  }
}

/**
 * Retrieves the currently saved draft, if any
 */
export function getReportDraft(): ReportDraft | null {
  try {
    const item = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (parsed && typeof parsed.step === 'number') {
      return parsed as ReportDraft;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load draft from localStorage:', error);
    return null;
  }
}

/**
 * Clears and deletes the stored draft completely
 */
export function clearReportDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear draft:', error);
  }
}

/**
 * Checks if a valid report draft is available
 */
export function hasReportDraft(): boolean {
  return getReportDraft() !== null;
}
