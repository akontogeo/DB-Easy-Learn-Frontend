/// <reference types="cypress" />

// Acceptance test: Course Enrollment Flow (Happy Path)
describe('Course Enrollment Flow - Happy Path', () => {
  it('searches for Python course, views details, and enrolls successfully', () => {

    // Step 1: Ψάχνω μια λέξη κλειδί "Python"
    cy.visit('/');
    cy.get('[data-cy="search-input"]').should('be.visible').type('Python');
    
    // Step 2: Πατάω αναζήτηση
    cy.get('form').submit();

    // Step 3: Ελέγχω αν στα αποτελέσματα υπάρχει η λέξη κλειδί
    cy.url().should('include', '/courses');
    cy.get('[data-cy="course-card"]').should('have.length.greaterThan', 0);
    
    // Step 4: Ελέγχω ότι τα αποτελέσματα περιέχουν "Python" και υπάρχει "See More"
    cy.get('[data-cy="course-card"]').each(($card) => {
      cy.wrap($card).should('contain.text', 'Python');
      cy.wrap($card).find('[data-cy="see-more-course"]').should('exist');
    });

    // Step 5: Πατάω ένα μάθημα (το πρώτο)
    cy.get('[data-cy="course-card"]').first()
      .find('[data-cy="see-more-course"]').click();

    // Step 6: Τσεκάρω ΑΝ υπάρχει enroll button
    cy.url().should('match', /\/courses\/\d+|\/users\/\d+\/courses\/\d+/);
    
    let didEnroll = false;
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="enroll-button"]').length > 0) {
        // ΑΝ ΝΑΙ → κάνει enroll και redirect
        cy.log('Enroll button found - enrolling...');
        didEnroll = true;
        cy.get('[data-cy="enroll-button"]').should('be.visible').click();
        cy.url().should('match', /\/users\/\d+\/courses\/\d+/, { timeout: 10000 });
      } else {
        // ΑΝ ΟΧΙ → είναι ήδη enrolled (auto-redirect)
        cy.log('Already enrolled - auto-redirected to progress page');
        cy.url().should('match', /\/users\/\d+\/courses\/\d+/);
      }
    });

    // Step 7: Τελικά επιβεβαιώνω ότι είμαι στο progress page
    cy.url().should('match', /\/users\/\d+\/courses\/\d+/);
    cy.get('[data-cy="progress-indicator"]').should('be.visible');
    cy.get('h1').should('contain', 'Python');
    
    // Step 8: Αν μόλις έγινε enrollment, ελέγχω ότι το progress είναι 0%
    cy.then(() => {
      if (didEnroll) {
        cy.get('[data-cy="progress-indicator"]').should('contain', '0%');
      }
    });

  });
});
