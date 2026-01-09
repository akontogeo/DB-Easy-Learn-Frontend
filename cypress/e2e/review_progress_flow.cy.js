/// <reference types="cypress" />

describe('Review & Progress Flow', () => {
  it('visits My Courses, finds the course and then submits a review', () => {
    // Step 1: Πάμε στο My Courses του user 1
    cy.visit('/users/1/courses');

    // Βεβαιώσου ότι άνοιξε σωστά το dashboard
    cy.get('[data-cy="dashboard-header"]').should('contain', 'MY COURSES');

    // Αν υπάρχει "Show More", πάτα το για να εμφανιστούν όλα τα courses
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="dashboard-show-more"]').length) {
        cy.get('[data-cy="dashboard-show-more"]').click();
      }
    });

    // Τσέκαρε ότι το μάθημα υπάρχει στη λίστα My Courses
    cy.contains('[data-cy="my-course-card"]', 'Introduction to Python')
      .should('be.visible')
      .within(() => {
        // Κλικ στο arrow button για να πάμε στο course progress page
        cy.get('.icon-btn.arrow').click();
      });

    // Step 2: Τώρα είμαστε στο /users/1/courses/1 (CourseProgress page)
    cy.url().should('include', '/users/1/courses/');

    // Step 3: Έλεγχος progress indicator
    cy.get('[data-cy="progress-indicator"]').should('be.visible');
    // Step 4: modal
    cy.get('[data-cy="rate-button"]').click();

    // Step 4: Υποβολή review
    cy.get('[data-cy="review-stars"] button').eq(3).click();

    cy.get('[data-cy="review-input"]').should('be.visible').clear().type('Great course!');
    cy.get('[data-cy="review-submit-button"]').click();

    // Step 5: Επιβεβαίωση ότι το review υποβλήθηκε
    cy.get('[data-cy="review-success"]').should('be.visible');
  });
});
