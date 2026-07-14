/* ==========================================================================
   DAORAE KOREAN BBQ - BUKIT INDAH OUTLET
   Interactive Frontend Logic
   ========================================================================== */

// Configurable WhatsApp booking number (Daorae Bukit Indah Landline/Mobile)
// Format: Country Code (60 for Malaysia) followed by phone number, no spaces or special characters.
const WHATSAPP_PHONE_NUMBER = "60126398303"; 

// Initialize Supabase Client if config is available
let supabaseClient = null;
if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== "" && typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Supabase SDK is not loaded or config is empty. Falling back to local storage mode.");
}
// Global fallback handler for missing or broken image assets
window.handleImageError = function(img, category) {
    img.onerror = null; // Prevent infinite loops
    if (category === "beef" || category === "set" || category === "other-bbq" || category === "johor-special") {
        img.src = "assets/hero.jpg";
    } else if (category === "pork") {
        img.src = "assets/pork.jpg";
    } else {
        img.src = "assets/banchan.jpg";
    }
};


// Trilingual Menu Data from daorae.net (verified with correct images and prices)



// Document Elements
document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation Sticky & Active Link logic
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    
    window.addEventListener("scroll", () => {
        // Sticky Header Change
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        // Active Link Highlight
        let currentSection = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute("id");
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });

    // 2. Mobile Menu Toggle
    const menuToggleBtn = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    
    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const isOpen = navMenu.classList.contains("active");
            menuToggleBtn.innerHTML = isOpen 
                ? '<i data-lucide="x"></i>' 
                : '<i data-lucide="menu"></i>';
            lucide.createIcons();
        });
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                menuToggleBtn.innerHTML = '<i data-lucide="menu"></i>';
                lucide.createIcons();
            });
        });
    }

    // 3. Render Menu items dynamically
    const menuGrid = document.querySelector(".menu-grid");
    
    function renderMenu(items) {
        if (!menuGrid) return;
        menuGrid.innerHTML = "";
        
        items.forEach(item => {
            // Generate spicy pepper icons
            let spicyHtml = "";
            if (item.spicy > 0) {
                spicyHtml = '<div class="menu-spicy">';
                for (let i = 0; i < item.spicy; i++) {
                    spicyHtml += '<i data-lucide="flame" style="width:14px; height:14px;"></i>';
                }
                spicyHtml += '</div>';
            }
            
            // Robust fallback for missing images to avoid misrepresenting food
            let imageSrc = item.image;
            if (!imageSrc || imageSrc === "None") {
                if (item.category === "beef") {
                    imageSrc = "assets/hero.jpg";
                } else if (item.category === "pork") {
                    imageSrc = "assets/pork.jpg";
                } else if (item.category === "stew" || item.category === "hotpot") {
                    imageSrc = "assets/banchan.jpg";
                } else {
                    imageSrc = "assets/banchan.jpg";
                }
            }
            
            const card = document.createElement("div");
            card.className = "menu-card reveal";
            card.setAttribute("data-id", item.id);
            card.style.cursor = "pointer"; // Indicating clickable card
            card.innerHTML = `
                <div class="menu-card-img-wrapper">
                    <img src="${imageSrc}" alt="${item.nameEn}" loading="lazy" onerror="handleImageError(this, '${item.category}')">
                    ${item.badge ? `<span class="menu-card-badge">${item.badge}</span>` : ''}
                </div>
                <div class="menu-card-content">
                    <div class="menu-card-title-row">
                        <div class="menu-titles">
                            <span class="menu-title-ko">${item.nameKo}</span>
                            <h3 class="menu-title-en">${item.nameEn}</h3>
                            <span class="menu-title-zh">${item.nameZh}</span>
                        </div>
                        <span class="menu-price">${item.price}</span>
                    </div>
                    <p class="menu-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; font-size: 0.82rem; line-height: 1.4; height: 2.8em; margin-bottom: 15px; color: var(--color-text-standard);">
                        ${item.descEn}
                    </p>
                    <div class="menu-card-footer">
                        <div class="menu-view-details" style="font-size: 0.8rem; font-weight: 600; color: var(--color-gold); display: flex; align-items: center; gap: 4px;">
                            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                            <span>View Details</span>
                        </div>
                        ${spicyHtml}
                    </div>
                </div>
            `;
            menuGrid.appendChild(card);
        });
        
        // Refresh icons and add active class to visible cards for smooth presentation
        lucide.createIcons();
        setTimeout(() => {
            const cards = menuGrid.querySelectorAll(".menu-card");
            cards.forEach(card => card.classList.add("active"));
        }, 50);
    }
    
    // Helper to get unique items for 'All' view to avoid duplicate listings
    function getUniqueItems(items) {
        const unique = [];
        const seen = new Set();
        items.forEach(item => {
            // Exclude beverages from the 'All' view to keep it completely hidden
            if (item.category === "beverage") return;
            
            // Match unique items by English name to remove cross-category copies
            const compareName = item.nameEn.trim().toLowerCase();
            if (!seen.has(compareName)) {
                seen.add(compareName);
                unique.push(item);
            }
        });
        return unique;
    }
    
    // Initial menu rendering
    renderMenu(getUniqueItems(MENU_ITEMS));

    // 4. Menu Filtering Logic
    const filterButtons = document.querySelectorAll(".filter-btn");
    
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const category = btn.getAttribute("data-filter");
            
            // Apply fade-out animation first
            if (menuGrid) {
                const cards = menuGrid.querySelectorAll(".menu-card");
                cards.forEach(card => {
                    card.style.opacity = "0";
                    card.style.transform = "translateY(20px)";
                });
                
                setTimeout(() => {
                    if (category === "all") {
                        renderMenu(getUniqueItems(MENU_ITEMS));
                    } else {
                        const filtered = MENU_ITEMS.filter(item => item.category === category);
                        renderMenu(filtered);
                    }
                }, 300);
            }
        });
    });

    // 5. Reservation Form Submission (Saves to localStorage and redirects to WhatsApp)
    const resForm = document.getElementById("whatsappReservationForm");
    if (resForm) {
        resForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("res-name");
            const phoneInput = document.getElementById("res-phone");
            const dateInput = document.getElementById("res-date");
            const timeInput = document.getElementById("res-time");
            const paxInput = document.getElementById("res-pax");
            const remarksInput = document.getElementById("res-remarks");
            
            const name = nameInput ? nameInput.value.trim() : "";
            const phone = phoneInput ? phoneInput.value.trim() : "";
            const date = dateInput ? dateInput.value : "";
            const time = timeInput ? timeInput.value : "";
            const pax = paxInput ? paxInput.value : "";
            const remarks = remarksInput ? remarksInput.value.trim() : "";
            
            if (!name || !phone || !date || !time || !pax) {
                alert("Please fill in all required fields (Name, Phone, Date, Time, and Guests Count).");
                return;
            }
            
            // 1. Save Reservation locally/cloud for Admin Panel
            const newReservation = {
                id: "res-" + Date.now(),
                name: name,
                phone: phone,
                date: date,
                time: time,
                pax: pax,
                remarks: remarks,
                status: "Pending", // Statuses: Pending, Confirmed, Cancelled
                createdAt: new Date().toISOString()
            };
            
            if (supabaseClient) {
                try {
                    const { error } = await supabaseClient
                        .from('reservations')
                        .insert([newReservation]);
                    if (error) throw error;
                } catch (err) {
                    console.error("Supabase Save Error, falling back to localStorage:", err);
                    saveToLocalStorage(newReservation);
                }
            } else {
                saveToLocalStorage(newReservation);
            }

            function saveToLocalStorage(resObj) {
                let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
                reservations.push(resObj);
                localStorage.setItem("daorae_reservations", JSON.stringify(reservations));
            }
            
            // 2. Format WhatsApp Message
            let message = `Hello Daorae Korean BBQ Bukit Indah! ?삃\n\n`;
            message += `I would like to make a table reservation:\n`;
            message += `?뱦Name: ${name}\n`;
            message += `?뱸Phone: ${phone}\n`;
            message += `?뱟Date: ${date}\n`;
            message += `?캴ime: ${time}\n`;
            message += `?뫁Guests: ${pax} pax\n`;
            
            if (remarks) {
                message += `?뮠Special Requests: ${remarks}\n`;
            }
            
            message += `\nThank you! Please confirm if a table is available.`;
            
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_NUMBER}&text=${encodedMessage}`;
            
            // Open in new tab and alert user
            window.open(whatsappUrl, "_blank");
            alert("Your reservation has been recorded locally. We are opening WhatsApp to contact our staff!");
            
            // Clear form
            resForm.reset();
        });
    }

    // 6. Dynamic Gallery Logic
    const DEFAULT_GALLERY = [
        {
            src: "assets/menu/wang_galbi.jpg",
            category: "Beef BBQ",
            title: "Charcoal Sizzled Wang Galbi"
        },
        {
            src: "assets/menu/samgyeopsal.jpg",
            category: "Pork BBQ",
            title: "Pristine Samgyeopsal"
        },
        {
            src: "assets/menu/sundubu_jjigae.jpg",
            category: "Korean Stews",
            title: "Fiery Sundubu Jjigae"
        },
        {
            src: "assets/interior.jpg",
            category: "Interior",
            title: "Warm Dining Ambience"
        }
    ];

    async function initGallery() {
        const galleryGrid = document.getElementById("gallery-grid");
        if (!galleryGrid) return;
        
        let gallery = [];
        
        if (supabaseClient) {
            try {
                // Fetch from Supabase
                const { data, error } = await supabaseClient
                    .from('gallery')
                    .select('*')
                    .order('id', { ascending: true });
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    gallery = data;
                } else {
                    // Seed Supabase with DEFAULT_GALLERY
                    for (const item of DEFAULT_GALLERY) {
                        await supabaseClient.from('gallery').insert([{
                            src: item.src,
                            category: item.category,
                            title: item.title
                        }]);
                    }
                    gallery = DEFAULT_GALLERY;
                }
            } catch (err) {
                console.error("Supabase Gallery fetch failed, using fallback:", err);
                gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
            }
        } else {
            gallery = JSON.parse(localStorage.getItem("daorae_gallery"));
            if (!gallery || gallery.length === 0) {
                gallery = DEFAULT_GALLERY;
                localStorage.setItem("daorae_gallery", JSON.stringify(gallery));
            }
        }
        
        galleryGrid.innerHTML = "";
        gallery.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";
            itemDiv.innerHTML = `
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <span class="gallery-category">${item.category}</span>
                    <h4 class="gallery-title">${item.title}</h4>
                </div>
            `;
            galleryGrid.appendChild(itemDiv);
        });
    }
    
    // Initialize dynamic gallery
    initGallery();

    // 7. Scroll Reveal Animation Logic (Intersection Observer)
    const revealElements = document.querySelectorAll(".reveal");
    
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });
        
        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add("active"));
    }

    // 8. Menu Details Modal Event Handlers
    const modal = document.getElementById("menuDetailModal");
    const closeBtn = document.getElementById("closeMenuModalBtn");
    const modalOverlay = modal ? modal.querySelector(".menu-modal-overlay") : null;
    
    function openMenuModal(item) {
        if (!modal) return;
        
        let imageSrc = item.image;
        if (!imageSrc || imageSrc === "None") {
            if (item.category === "beef") {
                imageSrc = "assets/hero.jpg";
            } else if (item.category === "pork") {
                imageSrc = "assets/pork.jpg";
            } else {
                imageSrc = "assets/banchan.jpg";
            }
        }
        
        const modalImg = document.getElementById("modalMenuImg");
        if (modalImg) {
            modalImg.src = imageSrc;
            modalImg.alt = item.nameEn;
            modalImg.onerror = function() {
                if (typeof handleImageError === "function") {
                    handleImageError(modalImg, item.category);
                }
            };
        }
        
        const textKo = document.getElementById("modalMenuNameKo");
        const textEn = document.getElementById("modalMenuNameEn");
        const textZh = document.getElementById("modalMenuNameZh");
        const priceText = document.getElementById("modalMenuPrice");
        
        if (textKo) textKo.textContent = item.nameKo;
        if (textEn) textEn.textContent = item.nameEn;
        if (textZh) textZh.textContent = item.nameZh;
        if (priceText) priceText.textContent = item.price;
        
        const descKo = document.getElementById("modalMenuDescKo");
        const descEn = document.getElementById("modalMenuDescEn");
        const descZh = document.getElementById("modalMenuDescZh");
        
        if (descKo) descKo.textContent = item.descKo || "설명이 존재하지 않습니다.";
        if (descEn) descEn.textContent = item.descEn || "No explanation available.";
        if (descZh) descZh.textContent = item.descZh || "暂无介绍。";
        
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    }
    
    function closeMenuModal() {
        if (!modal) return;
        modal.classList.remove("active");
        document.body.style.overflow = ""; // Re-enable scroll
    }
    
    // Bind click events on menuGrid utilizing Event Delegation
    if (menuGrid) {
        menuGrid.addEventListener("click", (e) => {
            const card = e.target.closest(".menu-card");
            if (!card) return;
            
            const itemId = card.getAttribute("data-id");
            if (typeof MENU_ITEMS !== "undefined") {
                const item = MENU_ITEMS.find(i => i.id === itemId);
                if (item) {
                    openMenuModal(item);
                }
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", closeMenuModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener("click", closeMenuModal);
    }
    
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMenuModal();
        }
    });
});


