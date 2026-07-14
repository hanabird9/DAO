/* ==========================================================================
   DAORAE KOREAN BBQ - ADMIN DASHBOARD SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Passcode Authentication Config
    const ADMIN_PASSCODE = "daoraejb1!"; // Updated secure admin passcode
    
    // Initialize Supabase Client if config is available
    let supabaseClient = null;
    if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== "" && typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn("Supabase SDK is not loaded or config is empty. Falling back to local storage mode.");
    }
    
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
        item.addEventListener("click", async () => {
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
                await loadMetrics();
                await loadRecentReservations();
            } else if (targetTab === "tab-reservations") {
                await loadAllReservations();
            } else if (targetTab === "tab-gallery") {
                await loadGalleryManager();
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

    async function getReservations() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('reservations')
                    .select('*')
                    .order('createdAt', { ascending: false });
                if (error) throw error;
                return data || [];
            } catch (err) {
                console.error("Supabase fetch reservations failed, using local fallback:", err);
                return JSON.parse(localStorage.getItem("daorae_reservations")) || [];
            }
        } else {
            return JSON.parse(localStorage.getItem("daorae_reservations")) || [];
        }
    }

    async function getGallery() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('gallery')
                    .select('*')
                    .order('id', { ascending: true });
                if (error) throw error;
                return data || [];
            } catch (err) {
                console.error("Supabase fetch gallery failed, using local fallback:", err);
                return JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
            }
        } else {
            return JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
        }
    }

    async function initDashboard() {
        // Load Lucide icons
        lucide.createIcons();

        // Print current date string in header
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById("current-date-str").textContent = new Date().toLocaleDateString('en-US', options);

        // Core data loader
        await loadMetrics();
        await loadRecentReservations();
        setupGalleryForm();
        setupReservationFilters();
    }

    // Refresh Overview stats
    async function loadMetrics() {
        const reservations = await getReservations();
        const gallery = await getGallery();

        document.getElementById("stat-total-res").textContent = reservations.length;
        document.getElementById("stat-pending-res").textContent = reservations.filter(r => r.status === "Pending").length;
        document.getElementById("stat-confirmed-res").textContent = reservations.filter(r => r.status === "Confirmed").length;
        document.getElementById("stat-gallery-count").textContent = gallery.length;
    }


    // 4. Reservations Management Logic
    async function loadRecentReservations() {
        const listContainer = document.getElementById("recent-reservations-list");
        if (!listContainer) return;

        let reservations = await getReservations();
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
            btn.addEventListener("click", async () => {
                filters.forEach(f => f.classList.remove("active"));
                btn.classList.add("active");
                activeResFilter = btn.getAttribute("data-res-filter");
                await loadAllReservations();
            });
        });
    }

    async function loadAllReservations() {
        const listContainer = document.getElementById("all-reservations-list");
        if (!listContainer) return;

        let reservations = await getReservations();
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
    window.updateReservationStatus = async function(id, newStatus) {
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('reservations')
                    .update({ status: newStatus })
                    .eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error("Supabase update error, falling back to local:", err);
                updateLocal(id, newStatus);
            }
        } else {
            updateLocal(id, newStatus);
        }

        function updateLocal(resId, statusVal) {
            let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
            const index = reservations.findIndex(r => r.id === resId);
            if (index !== -1) {
                reservations[index].status = statusVal;
                localStorage.setItem("daorae_reservations", JSON.stringify(reservations));
            }
        }
        
        // Reload active tab data
        const activeTabId = document.querySelector(".nav-item.active").getAttribute("data-tab");
        if (activeTabId === "tab-overview") {
            await loadMetrics();
            await loadRecentReservations();
        } else {
            await loadAllReservations();
        }
    };

    window.deleteReservation = async function(id) {
        if (!confirm("Are you sure you want to delete this reservation log permanently?")) return;
        
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('reservations')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error("Supabase delete error, falling back to local:", err);
                deleteLocal(id);
            }
        } else {
            deleteLocal(id);
        }

        function deleteLocal(resId) {
            let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
            reservations = reservations.filter(r => r.id !== resId);
            localStorage.setItem("daorae_reservations", JSON.stringify(reservations));
        }
        
        // Reload active tab data
        const activeTabId = document.querySelector(".nav-item.active").getAttribute("data-tab");
        if (activeTabId === "tab-overview") {
            await loadMetrics();
            await loadRecentReservations();
        } else {
            await loadAllReservations();
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
        addPhotoForm.addEventListener("submit", async (e) => {
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
                
                // Show a loading status since compression is async
                const submitBtn = addPhotoForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = "Processing Image...";

                reader.onload = async function(evt) {
                    try {
                        const rawBase64 = evt.target.result;
                        // Compress to max 1000px and 0.7 quality (typical output size ~50KB-100KB)
                        const compressedBase64 = await compressImage(rawBase64, 1000, 1000, 0.7);
                        await savePhoto(compressedBase64, category, title);
                    } catch (err) {
                        console.error("Compression/Upload error:", err);
                        alert("An error occurred while uploading. Please try again.");
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        addPhotoForm.reset();
                        uploadedFileName.textContent = "No file selected";
                    }
                };
                reader.readAsDataURL(file); // Convert image to Base64 String
            } else {
                const url = document.getElementById("photo-url").value.trim();
                if (!url) {
                    alert("Please enter a valid image URL.");
                    return;
                }
                await savePhoto(url, category, title);
                addPhotoForm.reset();
            }
        });
    }

    async function savePhoto(src, category, title) {
        const newPhoto = { src: src, category: category, title: title };
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('gallery')
                    .insert([newPhoto]);
                if (error) throw error;
            } catch (err) {
                console.error("Supabase save photo failed, using local:", err);
                saveLocal(newPhoto);
            }
        } else {
            saveLocal(newPhoto);
        }

        function saveLocal(photoObj) {
            let gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
            gallery.push(photoObj);
            localStorage.setItem("daorae_gallery", JSON.stringify(gallery));
        }

        await loadGalleryManager();
        alert("Photo successfully added to website gallery!");
    }

    async function loadGalleryManager() {
        const gridContainer = document.getElementById("admin-gallery-grid-list");
        if (!gridContainer) return;

        let gallery = await getGallery();

        gridContainer.innerHTML = "";
        gallery.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "admin-gallery-item";
            const deleteArg = item.id ? `'${item.id}'` : index;
            itemDiv.innerHTML = `
                <img src="${item.src}" alt="${escapeHtml(item.title)}">
                <button class="delete-photo-btn" onclick="deletePhoto(${deleteArg})" title="Delete Photo">
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

    window.deletePhoto = async function(idOrIndex) {
        if (!confirm("Are you sure you want to remove this photo from the website gallery?")) return;

        if (supabaseClient && typeof idOrIndex === 'string') {
            try {
                const { error } = await supabaseClient
                    .from('gallery')
                    .delete()
                    .eq('id', idOrIndex);
                if (error) throw error;
            } catch (err) {
                console.error("Supabase delete photo failed:", err);
                alert("Database connection error. Unable to delete photo.");
                return;
            }
        } else {
            let gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
            const index = parseInt(idOrIndex);
            gallery.splice(index, 1);
            localStorage.setItem("daorae_gallery", JSON.stringify(gallery));
        }

        await loadGalleryManager();
    };


    // Helper to compress image client-side before upload
    function compressImage(base64Str, maxWidth, maxHeight, quality) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed JPEG data URL
                const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedBase64);
            };
            img.onerror = function() {
                resolve(base64Str);
            };
        });
    }

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
