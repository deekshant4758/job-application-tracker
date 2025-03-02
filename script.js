// Local Storage Key
const JOBS_STORAGE_KEY = 'jobTrackerApplications';

// DOM Elements
const jobForm = document.getElementById('jobForm');
const jobsList = document.getElementById('jobsList');
const noJobs = document.getElementById('noJobs');
const searchJobs = document.getElementById('searchJobs');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');
const jobModal = document.getElementById('jobModal');
const editModal = document.getElementById('editModal');
const editJobForm = document.getElementById('editJobForm');

// Stats elements
const totalJobs = document.getElementById('totalJobs');
const activeJobs = document.getElementById('activeJobs');
const interviewingJobs = document.getElementById('interviewingJobs');
const offeredJobs = document.getElementById('offeredJobs');
const rejectedJobs = document.getElementById('rejectedJobs');

// Load jobs from localStorage
let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE_KEY)) || [];

// Initialize the app
function init() {
    renderJobs();
    updateStats();
    
    // Set today's date as default for new job
    document.getElementById('applicationDate').valueAsDate = new Date();
}

// Save jobs to localStorage
function saveJobs() {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    updateStats();
}

// Render jobs to the table
function renderJobs() {
    // Apply filters
    const searchTerm = searchJobs.value.toLowerCase();
    const statusValue = statusFilter.value;
    
    let filteredJobs = jobs.filter(job => {
        const matchesSearch = 
            job.companyName.toLowerCase().includes(searchTerm) || 
            job.jobTitle.toLowerCase().includes(searchTerm) || 
            (job.jobLocation && job.jobLocation.toLowerCase().includes(searchTerm));
        
        const matchesStatus = statusValue === 'All' || job.status === statusValue;
        
        return matchesSearch && matchesStatus;
    });
    
    // Apply sorting
    const sortOption = sortBy.value;
    
    switch(sortOption) {
        case 'dateDesc':
            filteredJobs.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
            break;
        case 'dateAsc':
            filteredJobs.sort((a, b) => new Date(a.applicationDate) - new Date(b.applicationDate));
            break;
        case 'company':
            filteredJobs.sort((a, b) => a.companyName.localeCompare(b.companyName));
            break;
        case 'title':
            filteredJobs.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
            break;
    }
    
    // Show/hide no jobs message
    if (filteredJobs.length === 0) {
        jobsList.innerHTML = '';
        noJobs.style.display = 'block';
        document.getElementById('jobsTable').style.display = 'none';
        return;
    } else {
        noJobs.style.display = 'none';
        document.getElementById('jobsTable').style.display = 'table';
    }
    
    // Create table rows
    let html = '';
    
    filteredJobs.forEach(job => {
        // Format the date
        const dateApplied = job.applicationDate ? new Date(job.applicationDate).toLocaleDateString() : 'N/A';
        
        // Create status badge class
        const statusClass = `status-badge status-${job.status.toLowerCase()}`;
        
        html += `
        <tr data-id="${job.id}">
            <td>${job.companyName}</td>
            <td>${job.jobTitle}</td>
            <td>${dateApplied}</td>
            <td><span class="${statusClass}">${job.status}</span></td>
            <td class="job-actions">
                <button onclick="viewJob('${job.id}')" class="btn-view">View</button>
                <button onclick="editJob('${job.id}')" class="btn-edit">Edit</button>
                <button onclick="deleteJob('${job.id}')" class="btn-danger">Delete</button>
            </td>
        </tr>
        `;
    });
    
    jobsList.innerHTML = html;
}

// Update statistics
function updateStats() {
    totalJobs.textContent = jobs.length;
    
    const active = jobs.filter(job => 
        job.status === 'Applied' || 
        job.status === 'Interviewing' || 
        job.status === 'Offered'
    ).length;
    
    const interviewing = jobs.filter(job => job.status === 'Interviewing').length;
    const offered = jobs.filter(job => job.status === 'Offered').length;
    const rejected = jobs.filter(job => job.status === 'Rejected').length;
    
    activeJobs.textContent = active;
    interviewingJobs.textContent = interviewing;
    offeredJobs.textContent = offered;
    rejectedJobs.textContent = rejected;
}

// Add new job
jobForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newJob = {
        id: Date.now().toString(),  // Simple unique ID
        companyName: document.getElementById('companyName').value,
        jobTitle: document.getElementById('jobTitle').value,
        jobLocation: document.getElementById('jobLocation').value,
        jobType: document.getElementById('jobType').value,
        applicationDate: document.getElementById('applicationDate').value,
        status: document.getElementById('applicationStatus').value,
        salary: document.getElementById('jobSalary').value,
        url: document.getElementById('jobUrl').value,
        notes: document.getElementById('jobNotes').value,
        createdAt: new Date().toISOString()
    };
    
    jobs.unshift(newJob);  // Add to beginning of array
    saveJobs();
    renderJobs();
    
    // Reset form
    jobForm.reset();
    document.getElementById('applicationDate').valueAsDate = new Date();
});

// View job details
function viewJob(id) {
    const job = jobs.find(j => j.id === id);
    
    if (!job) return;
    
    // Format the date
    const dateApplied = job.applicationDate ? new Date(job.applicationDate).toLocaleDateString() : 'N/A';
    
    // Create status badge class
    const statusClass = `status-badge status-${job.status.toLowerCase()}`;
    
    const modalContent = document.getElementById('modalContent');
    document.getElementById('modalTitle').textContent = `${job.jobTitle} at ${job.companyName}`;
    
    let htmlContent = `
    <div class="job-details">
        <p><strong>Location:</strong> ${job.jobLocation || 'Not specified'}</p>
        <p><strong>Job Type:</strong> ${job.jobType}</p>
        <p><strong>Applied on:</strong> ${dateApplied}</p>
        <p><strong>Status:</strong> <span class="${statusClass}">${job.status}</span></p>
        <p><strong>Salary:</strong> ${job.salary || 'Not specified'}</p>
    `;
    
    if (job.url) {
        htmlContent += `<p><strong>Job URL:</strong> <a href="${job.url}" target="_blank">${job.url}</a></p>`;
    }
    
    if (job.notes) {
        htmlContent += `
        <div class="notes-section">
            <h3>Notes</h3>
            <p>${job.notes.replace(/\n/g, '<br>')}</p>
        </div>`;
    }
    
    htmlContent += `
        <div class="modal-actions" style="margin-top: 20px;">
            <button onclick="editJob('${job.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteJob('${job.id}')">Delete</button>
        </div>
    </div>`;
    
    modalContent.innerHTML = htmlContent;
    
    // Show modal
    jobModal.style.display = 'flex';
}

// Edit job
function editJob(id) {
    const job = jobs.find(j => j.id === id);
    
    if (!job) return;
    
    // Close view modal if open
    jobModal.style.display = 'none';
    
    // Fill the edit form
    document.getElementById('editJobId').value = job.id;
    document.getElementById('editCompanyName').value = job.companyName;
    document.getElementById('editJobTitle').value = job.jobTitle;
    document.getElementById('editJobLocation').value = job.jobLocation || '';
    document.getElementById('editJobType').value = job.jobType;
    document.getElementById('editApplicationDate').value = job.applicationDate || '';
    document.getElementById('editApplicationStatus').value = job.status;
    document.getElementById('editJobSalary').value = job.salary || '';
    document.getElementById('editJobUrl').value = job.url || '';
    document.getElementById('editJobNotes').value = job.notes || '';
    
    // Show modal
    editModal.style.display = 'flex';
}

// Update job
editJobForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const jobId = document.getElementById('editJobId').value;
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) return;
    
    // Update job object
    jobs[jobIndex] = {
        ...jobs[jobIndex],
        companyName: document.getElementById('editCompanyName').value,
        jobTitle: document.getElementById('editJobTitle').value,
        jobLocation: document.getElementById('editJobLocation').value,
        jobType: document.getElementById('editJobType').value,
        applicationDate: document.getElementById('editApplicationDate').value,
        status: document.getElementById('editApplicationStatus').value,
        salary: document.getElementById('editJobSalary').value,
        url: document.getElementById('editJobUrl').value,
        notes: document.getElementById('editJobNotes').value,
        updatedAt: new Date().toISOString()
    };
    
    saveJobs();
    renderJobs();
    
    // Close modal
    editModal.style.display = 'none';
});

// Delete job
function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job application?')) {
        jobs = jobs.filter(job => job.id !== id);
        saveJobs();
        renderJobs();
        
        // Close modals if open
        jobModal.style.display = 'none';
        editModal.style.display = 'none';
    }
}

// Filter and search functionality
searchJobs.addEventListener('input', renderJobs);
statusFilter.addEventListener('change', renderJobs);
sortBy.addEventListener('change', renderJobs);

// Close modals
const closeButtons = document.querySelectorAll('.close');

closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        jobModal.style.display = 'none';
        editModal.style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === jobModal) {
        jobModal.style.display = 'none';
    }
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

// Initialize the application
init();