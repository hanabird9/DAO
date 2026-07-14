/* ==========================================================================
   DAORAE KOREAN BBQ - ADMIN DASHBOARD SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Passcode Authentication Config
    const ADMIN_PASSCODE = "daoraejb1!"; // Updated secure admin passcode
    const AUTH_KEY = "daorae_admin_auth";

    const loginContainer = document.getElementById("login-container");
    const dashboardContainer = document.getElementById("dashboard-container");
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const passcodeField = document.getElementById("passcode");
    const logoutBtn = document.getElementById("logout-btn");

    // Check existing authentication session
    if (sessionStorage.getItem(AUTH_KEY) === "true") {
        showDashboard();
    } else {
        showLogin();
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const value = passcodeField.value.trim();
        if (value === ADMIN_PASSCODE) {
            sessionStorage.setItem(AUTH_KEY, "true");
            loginError.style.display = "none";
            passcodeField.value = "";
            showDashboard();
        } else {
            loginError.style.display = "block";
            passcodeField.focus();
        }
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem(AUTH_KEY);
        showLogin();
    });

    function showDashboard() {
        loginContainer.style.display = "none";
        dashboardContainer.style.display = "flex";
        initDashboard();
    }

    function showLogin() {
        dashboardContainer.style.display = "none";
        loginContainer.style.display = "flex";
        passcodeField.focus();
    }


    // 2. Tab Navigation Logic
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const pageTitle = document.getElementById("page-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove active classes
            navItems.forEach(n => n.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            // Add active classes
            item.classList.add("active");
            const targetTab = item.getAttribute("data-tab");
            document.getElementById(targetTab).classList.add("active");

            // Update title text
            const tabName = item.textContent.trim();
            pageTitle.textContent = tabName === "Overview" ? "Dashboard Overview" : tabName;
            
            // Refresh data on switch
            if (targetTab === "tab-overview") {
                loadMetrics();
                loadRecentReservations();
            } else if (targetTab === "tab-reservations") {
                loadAllReservations();
            } else if (targetTab === "tab-gallery") {
                loadGalleryManager();
            }
        });
    });

    // Overview link redirection helpers
    document.getElementById("view-all-res-link").addEventListener("click", () => {
        document.querySelector('[data-tab="tab-reservations"]').click();
    });


    // 3. Dashboard Initialization & Data Storage Fetching
    const DEFAULT_GALLERY = [
        { src: "assets/menu/wang_galbi.jpg", category: "Beef BBQ", title: "Charcoal Sizzled Wang Galbi" },
        { src: "assets/menu/samgyeopsal.jpg", category: "Pork BBQ", title: "Pristine Samgyeopsal" },
        { src: "assets/menu/sundubu_jjigae.jpg", category: "Korean Stews", title: "Fiery Sundubu Jjigae" },
        { src: "assets/interior.jpg", category: "Interior", title: "Warm Dining Ambience" }
    ];

    function initDashboard() {
        // Load Lucide icons
        lucide.createIcons();

        // Print current date string in header
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById("current-date-str").textContent = new Date().toLocaleDateString('en-US', options);

        // Core data loader
        loadMetrics();
        loadRecentReservations();
        setupGalleryForm();
        setupReservationFilters();
    }

    // Refresh Overview stats
    function loadMetrics() {
        const reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
        const gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;

        document.getElementById("stat-total-res").textContent = reservations.length;
        document.getElementById("stat-pending-res").textContent = reservations.filter(r => r.status === "Pending").length;
        document.getElementById("stat-confirmed-res").textContent = reservations.filter(r => r.status === "Confirmed").length;
        document.getElementById("stat-gallery-count").textContent = gallery.length;
    }


    // 4. Reservations Management Logic
    function loadRecentReservations() {
        const listContainer = document.getElementById("recent-reservations-list");
        if (!listContainer) return;

        let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
        // Sort descending by date created
        reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Take latest 5
        const recent = reservations.slice(0, 5);

        listContainer.innerHTML = "";
        if (recent.length === 0) {
            listContainer.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No reservations found yet.</td></tr>`;
            return;
        }

        recent.forEach(res => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${escapeHtml(res.name)}</strong><br><span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:500;">${res.phone ? escapeHtml(res.phone) : 'N/A'}</span></td>
                <td>${res.date} <span style="color: var(--color-text-muted); font-size:0.8rem;">at ${res.time}</span></td>
                <td>${res.pax} Pax</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${res.remarks ? escapeHtml(res.remarks) : '<span style="color: var(--color-text-muted); font-style:italic;">None</span>'}
                </td>
                <td><span class="badge badge-${res.status.toLowerCase()}">${res.status}</span></td>
                <td>
                    <div class="action-btn-group">
                        ${res.status === 'Pending' ? `
                            <button class="btn-icon confirm" onclick="updateReservationStatus('${res.id}', 'Confirmed')" title="Confirm Reservation">
                                <i data-lucide="check"></i>
                            </button>
                            <button class="btn-icon cancel" onclick="updateReservationStatus('${res.id}', 'Cancelled')" title="Cancel Reservation">
                                <i data-lucide="x"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon delete" onclick="deleteReservation('${res.id}')" title="Delete Log">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            listContainer.appendChild(tr);
        });
        lucide.createIcons();
    }

    let activeResFilter = "all";
    function setupReservationFilters() {
        const filters = document.querySelectorAll("[data-res-filter]");
        filters.forEach(btn => {
            btn.addEventListener("click", () => {
                filters.forEach(f => f.classList.remove("active"));
                btn.classList.add("active");
                activeResFilter = btn.getAttribute("data-res-filter");
                loadAllReservations();
            });
        });
    }

    function loadAllReservations() {
        const listContainer = document.getElementById("all-reservations-list");
        if (!listContainer) return;

        let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
        // Sort descending by creation date
        reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Filter based on selected state
        if (activeResFilter !== "all") {
            reservations = reservations.filter(r => r.status === activeResFilter);
        }

        listContainer.innerHTML = "";
        if (reservations.length === 0) {
            listContainer.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); padding:30px;">No matching reservations.</td></tr>`;
            return;
        }

        reservations.forEach(res => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${escapeHtml(res.name)}</strong><br><span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:500;">${res.phone ? escapeHtml(res.phone) : 'N/A'}</span></td>
                <td>${res.date}</td>
                <td>${res.time}</td>
                <td>${res.pax} Pax</td>
                <td>${res.remarks ? escapeHtml(res.remarks) : '<span style="color: var(--color-text-muted); font-style:italic;">None</span>'}</td>
                <td><span class="badge badge-${res.status.toLowerCase()}">${res.status}</span></td>
                <td>
                    <div class="action-btn-group">
                        ${res.status === 'Pending' ? `
                            <button class="btn-icon confirm" onclick="updateReservationStatus('${res.id}', 'Confirmed')" title="Confirm Reservation">
                                <i data-lucide="check"></i>
                            </button>
                            <button class="btn-icon cancel" onclick="updateReservationStatus('${res.id}', 'Cancelled')" title="Cancel Reservation">
                                <i data-lucide="x"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon delete" onclick="deleteReservation('${res.id}')" title="Delete Log">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            listContainer.appendChild(tr);
        });
        lucide.createIcons();
    }

    // Status management handlers exposed globally so onclick handlers work
    window.updateReservationStatus = function(id, newStatus) {
        let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
        const index = reservations.findIndex(r => r.id === id);
        if (index !== -1) {
            reservations[index].status = newStatus;
            localStorage.setItem("daorae_reservations", JSON.stringify(reservations));
            
            // Reload active tab data
            const activeTabId = document.querySelector(".nav-item.active").getAttribute("data-tab");
            if (activeTabId === "tab-overview") {
                loadMetrics();
                loadRecentReservations();
            } else {
                loadAllReservations();
            }
        }
    };

    window.deleteReservation = function(id) {
        if (!confirm("Are you sure you want to delete this reservation log permanently?")) return;
        
        let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
        reservations = reservations.filter(r => r.id !== id);
        localStorage.setItem("daorae_reservations", JSON.stringify(reservations));
        
        // Reload active tab data
        const activeTabId = document.querySelector(".nav-item.active").getAttribute("data-tab");
        if (activeTabId === "tab-overview") {
            loadMetrics();
            loadRecentReservations();
        } else {
            loadAllReservations();
        }
    };


    // 5. Gallery Manager Logic
    let gallerySourceType = "file"; // Default upload source is local file
    const btnSrcFile = document.getElementById("btn-src-file");
    const btnSrcUrl = document.getElementById("btn-src-url");
    const inputGroupFile = document.getElementById("input-group-file");
    const inputGroupUrl = document.getElementById("input-group-url");
    const photoFileInput = document.getElementById("photo-file");
    const uploadedFileName = document.getElementById("uploaded-file-name");

    function setupGalleryForm() {
        btnSrcFile.addEventListener("click", () => {
            btnSrcFile.classList.add("active");
            btnSrcUrl.classList.remove("active");
            inputGroupFile.style.display = "block";
            inputGroupUrl.style.display = "none";
            gallerySourceType = "file";
        });

        btnSrcUrl.addEventListener("click", () => {
            btnSrcUrl.classList.add("active");
            btnSrcFile.classList.remove("active");
            inputGroupUrl.style.display = "block";
            inputGroupFile.style.display = "none";
            gallerySourceType = "url";
        });

        photoFileInput.addEventListener("change", (e) => {
            const fileName = e.target.files.length > 0 ? e.target.files[0].name : "No file selected";
            uploadedFileName.textContent = fileName;
        });

        // Form Submit
        const addPhotoForm = document.getElementById("add-photo-form");
        addPhotoForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const title = document.getElementById("photo-title").value.trim();
            const category = document.getElementById("photo-category").value.trim();

            if (gallerySourceType === "file") {
                const files = photoFileInput.files;
                if (files.length === 0) {
                    alert("Please choose an image file to upload.");
                    return;
                }
                const file = files[0];
                const reader = new FileReader();
                reader.onload = function(evt) {
                    savePhoto(evt.target.result, category, title);
                    addPhotoForm.reset();
                    uploadedFileName.textContent = "No file selected";
                };
                reader.readAsDataURL(file); // Convert image to Base64 String
            } else {
                const url = document.getElementById("photo-url").value.trim();
                if (!url) {
                    alert("Please enter a valid image URL.");
                    return;
                }
                savePhoto(url, category, title);
                addPhotoForm.reset();
            }
        });
    }

    function savePhoto(src, category, title) {
        let gallery = JSON.parse(localStorage.getItem("daorae_gallery"));
        if (!gallery || gallery.length === 0) {
            gallery = DEFAULT_GALLERY;
        }

        const newPhoto = { src: src, category: category, title: title };
        gallery.push(newPhoto);
        localStorage.setItem("daorae_gallery", JSON.stringify(gallery));

        loadGalleryManager();
        alert("Photo successfully added to live website gallery!");
    }

    function loadGalleryManager() {
        const gridContainer = document.getElementById("admin-gallery-grid-list");
        if (!gridContainer) return;

        let gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;

        gridContainer.innerHTML = "";
        gallery.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "admin-gallery-item";
            itemDiv.innerHTML = `
                <img src="${item.src}" alt="${escapeHtml(item.title)}">
                <button class="delete-photo-btn" onclick="deletePhoto(${index})" title="Delete Photo">
                    <i data-lucide="trash-2"></i>
                </button>
                <div class="admin-gallery-info">
                    <h4>${escapeHtml(item.title)}</h4>
                    <span>${escapeHtml(item.category)}</span>
                </div>
            `;
            gridContainer.appendChild(itemDiv);
        });
        lucide.createIcons();
    }

    window.deletePhoto = function(index) {
        if (!confirm("Are you sure you want to remove this photo from the website gallery?")) return;

        let gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
        gallery.splice(index, 1);
        localStorage.setItem("daorae_gallery", JSON.stringify(gallery));

        loadGalleryManager();
    };


    // Helper utility to escape HTML inputs
    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
