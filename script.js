document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle (keep this the same)
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
    });
    
    mobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
    });
    
    mobileMenuOverlay.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
    });

    // API endpoints (replace with your actual endpoints)
    const API_BASE_URL = 'https://your-api-domain.com/api';
    const BENEFICIARIES_ENDPOINT = `${API_BASE_URL}/beneficiaries`;
    const BUDGET_ENDPOINT = `${API_BASE_URL}/budget`;
    const STATS_ENDPOINT = `${API_BASE_URL}/stats`;
    const PROJECTS_ENDPOINT = `${API_BASE_URL}/projects`;
    const ACTIVITIES_ENDPOINT = `${API_BASE_URL}/activities`;

    // Fetch all data on page load
    async function fetchAllData() {
        try {
            // Fetch data in parallel
            const [statsData, projectsData, beneficiariesData, budgetData, activitiesData] = await Promise.all([
                fetchData(STATS_ENDPOINT),
                fetchData(PROJECTS_ENDPOINT),
                fetchData(BENEFICIARIES_ENDPOINT),
                fetchData(BUDGET_ENDPOINT),
                fetchData(ACTIVITIES_ENDPOINT)
            ]);

            // Update dashboard stats
            updateStats(statsData);
            
            // Update projects section
            renderProjects(projectsData);
            
            // Initialize charts with real data
            initCharts(beneficiariesData, budgetData);
            
            // Update recent activities
            renderActivities(activitiesData);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            // You might want to show an error message to the user
        }
    }

    // Generic fetch function
    async function fetchData(endpoint) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // If using authentication
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
            throw error;
        }
    }

    // Update stats cards with real data
    function updateStats(stats) {
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = stats.activeProjects;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = stats.staffMembers;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = `${stats.budgetUtilization}%`;
        document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = stats.fieldReports;
        
        // Update progress bars
        document.querySelector('.stat-card:nth-child(3) .progress-fill').style.width = `${stats.budgetUtilization}%`;
    }

    // Render projects from API data
    function renderProjects(projects) {
        const projectsGrid = document.querySelector('.projects-grid');
        projectsGrid.innerHTML = ''; // Clear existing content
        
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <div class="project-header">
                    <h3>${project.name}</h3>
                    <span class="badge ${project.status === 'Active' ? 'primary' : 'warning'}">${project.status}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${project.startDate} - ${project.endDate}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-hand-holding-usd"></i>
                        <span>$${project.budget.toLocaleString()}</span>
                    </div>
                </div>
                <div class="project-progress">
                    <div class="progress-info">
                        <span>Progress</span>
                        <span>${project.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                <div class="project-team">
                    <div class="team-avatars">
                        ${project.teamMembers.map(member => 
                            `<div class="avatar xs">${member.initials}</div>`
                        ).join('')}
                        ${project.teamMembers.length > 2 ? 
                            `<div class="avatar xs">+${project.teamMembers.length - 2}</div>` : ''}
                    </div>
                    <button class="btn-text">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        });
    }

    // Initialize charts with API data
    function initCharts(beneficiariesData, budgetData) {
        const beneficiariesCtx = document.getElementById('beneficiariesChart').getContext('2d');
        const beneficiariesChart = new Chart(beneficiariesCtx, {
            type: 'bar',
            data: {
                labels: beneficiariesData.labels,
                datasets: [{
                    label: 'Beneficiaries Reached',
                    data: beneficiariesData.values,
                    backgroundColor: '#2563eb',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        const budgetCtx = document.getElementById('budgetChart').getContext('2d');
        const budgetChart = new Chart(budgetCtx, {
            type: 'line',
            data: {
                labels: budgetData.labels,
                datasets: [{
                    label: 'Budget Utilization',
                    data: budgetData.values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Render recent activities
    function renderActivities(activities) {
        const activitiesList = document.querySelector('.activities-list');
        activitiesList.innerHTML = ''; // Clear existing content
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            // Determine icon based on activity type
            let iconClass = 'fas fa-info-circle';
            let iconColor = 'text-blue-600';
            
            if (activity.type === 'report') {
                iconClass = 'fas fa-file-alt';
                iconColor = 'text-blue-600';
            } else if (activity.type === 'approval') {
                iconClass = 'fas fa-check-circle';
                iconColor = 'text-green-600';
            } else if (activity.type === 'new_member') {
                iconClass = 'fas fa-user-plus';
                iconColor = 'text-purple-600';
            } else if (activity.type === 'field_report') {
                iconClass = 'fas fa-map-marker-alt';
                iconColor = 'text-orange-600';
            }
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${iconClass} ${iconColor}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${activity.user}</strong> ${activity.description}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            
            activitiesList.appendChild(activityItem);
        });
    }

    // Start fetching data when page loads
    fetchAllData();
});