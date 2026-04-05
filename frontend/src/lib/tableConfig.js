export const RD_TABLES = {
  publications: {
    label: 'Publications',
    fields: [
      { name: 'journal_name', label: 'Journal Name', type: 'text', required: true },
      { name: 'publisher', label: 'Publisher', type: 'text' },
      { name: 'doi', label: 'DOI', type: 'text' },
      { name: 'publication_date', label: 'Publication Date', type: 'date' }
    ]
  },
  patents: {
    label: 'Patents',
    fields: [
      { name: 'patent_number', label: 'Patent Number', type: 'text', required: true },
      { name: 'patent_status', label: 'Patent Status', type: 'select', options: ['Filed', 'Published', 'Granted'] },
      { name: 'filing_date', label: 'Filing Date', type: 'date' },
      { name: 'inventors', label: 'Inventors', type: 'textarea' }
    ]
  },
  projects: {
    label: 'Projects',
    fields: [
      { name: 'project_code', label: 'Project Code', type: 'text' },
      { name: 'funding_agency', label: 'Funding Agency', type: 'text' },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'duration_months', label: 'Duration (Months)', type: 'number' }
    ]
  },
  books: {
    label: 'Books',
    fields: [
      { name: 'publisher', label: 'Publisher', type: 'text' },
      { name: 'isbn', label: 'ISBN', type: 'text' },
      { name: 'published_on', label: 'Published On', type: 'date' },
      { name: 'edition', label: 'Edition', type: 'text' }
    ]
  },
  book_chapters: {
    label: 'Book Chapters',
    fields: [
      { name: 'book_title', label: 'Book Title', type: 'text', required: true },
      { name: 'chapter_title', label: 'Chapter Title', type: 'text', required: true },
      { name: 'publisher', label: 'Publisher', type: 'text' },
      { name: 'isbn', label: 'ISBN', type: 'text' }
    ]
  },
  conferences: {
    label: 'Conferences',
    fields: [
      { name: 'conference_name', label: 'Conference Name', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'conference_date', label: 'Conference Date', type: 'date' },
      { name: 'paper_title', label: 'Paper Title', type: 'text' }
    ]
  },
  workshops: {
    label: 'Workshops',
    fields: [
      { name: 'workshop_name', label: 'Workshop Name', type: 'text', required: true },
      { name: 'organized_by', label: 'Organized By', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'duration_days', label: 'Duration Days', type: 'number' }
    ]
  },
  seminars: {
    label: 'Seminars',
    fields: [
      { name: 'seminar_name', label: 'Seminar Name', type: 'text', required: true },
      { name: 'host_organization', label: 'Host Organization', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'topic', label: 'Topic', type: 'textarea' }
    ]
  },
  certifications: {
    label: 'Certifications',
    fields: [
      { name: 'certification_name', label: 'Certification Name', type: 'text', required: true },
      { name: 'issuing_body', label: 'Issuing Body', type: 'text' },
      { name: 'issued_on', label: 'Issued On', type: 'date' },
      { name: 'valid_till', label: 'Valid Till', type: 'date' }
    ]
  },
  awards: {
    label: 'Awards',
    fields: [
      { name: 'award_name', label: 'Award Name', type: 'text', required: true },
      { name: 'awarded_by', label: 'Awarded By', type: 'text' },
      { name: 'award_date', label: 'Award Date', type: 'date' },
      { name: 'category', label: 'Category', type: 'text' }
    ]
  },
  consultancies: {
    label: 'Consultancies',
    fields: [
      { name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' }
    ]
  },
  grants: {
    label: 'Grants',
    fields: [
      { name: 'grant_name', label: 'Grant Name', type: 'text', required: true },
      { name: 'funding_body', label: 'Funding Body', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'sanctioned_on', label: 'Sanctioned On', type: 'date' }
    ]
  },
  collaborations: {
    label: 'Collaborations',
    fields: [
      { name: 'partner_org', label: 'Partner Organization', type: 'text', required: true },
      { name: 'collaboration_type', label: 'Collaboration Type', type: 'text' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' }
    ]
  },
  internships_guided: {
    label: 'Internships Guided',
    fields: [
      { name: 'student_name', label: 'Student Name', type: 'text', required: true },
      { name: 'organization', label: 'Organization', type: 'text' },
      { name: 'duration_weeks', label: 'Duration Weeks', type: 'number' },
      { name: 'completion_year', label: 'Completion Year', type: 'number' }
    ]
  },
  phd_guidance: {
    label: 'PhD Guidance',
    fields: [
      { name: 'scholar_name', label: 'Scholar Name', type: 'text', required: true },
      { name: 'registration_no', label: 'Registration No', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Ongoing', 'Completed'] },
      { name: 'thesis_title', label: 'Thesis Title', type: 'textarea' }
    ]
  },
  events_organized: {
    label: 'Events Organized',
    fields: [
      { name: 'event_name', label: 'Event Name', type: 'text', required: true },
      { name: 'event_type', label: 'Event Type', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  }
};

export const ALLOWED_TABLES = Object.keys(RD_TABLES);

export const ROLE_FLOW = {
  student: ['faculty', 'hod', 'admin'],
  faculty: ['hod', 'admin'],
  hod: ['admin'],
  admin: [],
  superadmin: []
};
