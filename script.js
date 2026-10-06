// MARK-NEWTON WEB STUDIO

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuToggle && mobileMenu) {
    const setMenuOpen = (isOpen) => {
        mobileMenu.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    };

    setMenuOpen(false);

    menuToggle.addEventListener("click", () => {
        setMenuOpen(!mobileMenu.classList.contains("active"));
    });

    const mobileLinks = document.querySelectorAll(".mobile-menu a");

    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu.classList.contains("active")) {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900 && mobileMenu.classList.contains("active")) {
            setMenuOpen(false);
        }
    });

}
/* =========================================
   REQUEST FORM
   SERVICE → PACKAGE SYSTEM
========================================= */

const serviceSelect = document.getElementById("service");
const packageSection = document.getElementById("packageSection");
const packageOptions = document.getElementById("packageOptions");
const requirementsSection = document.getElementById("requirementsSection");
const dynamicRequirements = document.getElementById("dynamicRequirements");
const projectRequestForm = document.getElementById("projectRequestForm");
const REQUESTS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwzItKFBcXHZrb-pDyQOXFhSKLHyYd5_jHALYY0knivT_CXnszN1DCbBFDG2RU28sNl/exec";

if (projectRequestForm) {
    const formMessage = document.getElementById("formMessage");
    const submitButton = projectRequestForm.querySelector('button[type="submit"]');
    const uploadInput = document.getElementById("files");
    const uploadPayload = document.getElementById("fileUploads");
    const maxFileSize = 5 * 1024 * 1024;
    const maxTotalUploadSize = 10 * 1024 * 1024;
    const uploadMimeTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        heic: "image/heic",
        heif: "image/heif",
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    const readFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const result = String(reader.result || "");
            const separator = result.indexOf(",");
            if (separator < 0) {
                reject(new Error(`Could not read ${file.name}. Please try again.`));
                return;
            }

            resolve({
                name: file.name,
                type: file.type || uploadMimeTypes[file.name.split(".").pop().toLowerCase()] || "application/octet-stream",
                data: result.slice(separator + 1)
            });
        }, { once: true });
        reader.addEventListener("error", () => {
            reject(new Error(`Could not read ${file.name}. Please try again.`));
        }, { once: true });
        reader.readAsDataURL(file);
    });

    projectRequestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!REQUESTS_WEB_APP_URL) {
            if (formMessage) {
                formMessage.textContent = "Request delivery is not configured yet. Please contact marknewtonwebstudio@gmail.com while the Google Sheets receiver is being set up.";
            }
            return;
        }

        let endpoint;
        try {
            endpoint = new URL(REQUESTS_WEB_APP_URL);
        } catch {
            if (formMessage) {
                formMessage.textContent = "The Google Sheets request receiver URL is invalid. Please contact the studio directly.";
            }
            return;
        }

        if (endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com" || !endpoint.pathname.includes("/macros/s/") || !endpoint.pathname.endsWith("/exec")) {
            if (formMessage) {
                formMessage.textContent = "The Google Sheets request receiver URL is invalid. Please contact the studio directly.";
            }
            return;
        }

        const files = uploadInput ? Array.from(uploadInput.files || []) : [];
        const totalSize = files.reduce((total, file) => total + file.size, 0);
        const oversizedFile = files.find((file) => file.size > maxFileSize);
        if (oversizedFile) {
            if (formMessage) {
                formMessage.textContent = `${oversizedFile.name} exceeds the 5 MB per-file limit.`;
            }
            return;
        }
        if (totalSize > maxTotalUploadSize) {
            if (formMessage) {
                formMessage.textContent = "Selected files exceed the 10 MB total upload limit.";
            }
            return;
        }

        projectRequestForm.action = endpoint.href;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = files.length ? "UPLOADING FILES..." : "SENDING REQUEST...";
        }
        if (formMessage) {
            formMessage.textContent = "Sending your request securely. Please wait...";
        }

        try {
            const encodedFiles = await Promise.all(files.map(readFile));
            if (uploadPayload) {
                uploadPayload.value = JSON.stringify(encodedFiles);
            }
            HTMLFormElement.prototype.submit.call(projectRequestForm);
        } catch (error) {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "REQUEST A PROJECT";
            }
            if (formMessage) {
                formMessage.textContent = error.message || "Files could not be read. Please try again.";
            }
        }
    });
}

const packageData = {

    website: {
        packages: [
            {
                name: "Starter",
                price: "₦50,000",
                description: "Perfect for individuals and small businesses.",
                features: [
                    "1–3 page website",
                    "Mobile responsive",
                    "WhatsApp integration",
                    "Basic SEO",
                    "1 round of revisions",
                    "Website deployment"
                ]
            },
            {
                name: "Growth",
                price: "₦100,000",
                description: "For businesses ready for a stronger online presence.",
                features: [
                    "4–6 page website",
                    "Custom professional design",
                    "Contact form",
                    "WhatsApp integration",
                    "Social media integration",
                    "2 rounds of revisions",
                    "Website deployment"
                ]
            },
            {
                name: "Professional",
                price: "₦150,000",
                description: "For businesses that need a premium website.",
                features: [
                    "7–10+ pages",
                    "Premium custom design",
                    "Advanced animations",
                    "Inquiry forms",
                    "Advanced SEO",
                    "Analytics integration",
                    "3 rounds of revisions",
                    "Website deployment"
                ]
            }
        ]
    },


    ecommerce: {
        packages: [
            {
                name: "Starter",
                price: "₦60,000",
                description: "A simple online store to get your products online.",
                features: [
                    "Up to 10 products",
                    "Product categories",
                    "Shopping cart",
                    "WhatsApp integration",
                    "Mobile responsive",
                    "Basic checkout/inquiry system",
                    "1 round of revisions"
                ]
            },
            {
                name: "Growth",
                price: "₦120,000",
                description: "A professional store for growing businesses.",
                features: [
                    "Up to 30 products",
                    "Shopping cart",
                    "Checkout system",
                    "Order functionality",
                    "WhatsApp integration",
                    "Payment integration where applicable",
                    "Search",
                    "2 rounds of revisions"
                ]
            },
            {
                name: "Professional",
                price: "₦150,000",
                description: "An advanced e-commerce experience.",
                features: [
                    "Up to 50 products",
                    "Advanced categories",
                    "Full checkout",
                    "Payment integration where applicable",
                    "Order management setup",
                    "Search & filtering",
                    "Advanced UI/UX",
                    "3 rounds of revisions"
                ]
            }
        ]
    },


    graphics: {
        packages: [
            {
                name: "Starter",
                price: "₦4,000",
                description: "A professional design for a single need.",
                features: [
                    "1 graphic/flyer",
                    "Professional design",
                    "Client-provided content",
                    "1 round of revision",
                    "High-quality JPG/PNG"
                ]
            },
            {
                name: "Growth",
                price: "₦10,000",
                description: "A small set of branded designs.",
                features: [
                    "Up to 3 graphics/flyers",
                    "Custom designs",
                    "Brand colors & logo",
                    "Different layouts",
                    "2 rounds of revisions",
                    "High-resolution files"
                ]
            },
            {
                name: "Professional",
                price: "₦16,000",
                description: "A complete set of premium promotional designs.",
                features: [
                    "Up to 5 graphics/flyers",
                    "Premium custom designs",
                    "Consistent visual style",
                    "Brand colors & fonts",
                    "Promotional designs",
                    "3 rounds of revisions",
                    "Multiple formats"
                ]
            }
        ]
    },


    video: {
        packages: [
            {
                name: "Starter",
                price: "₦5,000",
                description: "Simple short-form video editing.",
                features: [
                    "1 video",
                    "Up to 60 seconds",
                    "Basic cuts & transitions",
                    "Text/captions",
                    "Background music",
                    "1 round of revision",
                    "HD export"
                ]
            },
            {
                name: "Growth",
                price: "₦10,000",
                description: "Professional editing for social content.",
                features: [
                    "1 video",
                    "Up to 2 minutes",
                    "Advanced transitions",
                    "Captions/subtitles",
                    "Music & sound effects",
                    "Color correction",
                    "Basic motion graphics",
                    "2 rounds of revisions"
                ]
            },
            {
                name: "Professional",
                price: "₦20,000",
                description: "Premium video editing for serious content.",
                features: [
                    "1 video",
                    "Up to 5 minutes",
                    "Advanced editing",
                    "Motion graphics",
                    "Audio enhancement",
                    "Color grading",
                    "Promotional elements",
                    "3 rounds of revisions"
                ]
            }
        ]
    },


    branding: {
        packages: [
            {
                name: "Starter",
                price: "₦25,000",
                description: "A simple social media visual foundation.",
                features: [
                    "Profile picture/logo setup",
                    "Bio optimization",
                    "Brand colors",
                    "Font selection",
                    "3 post templates",
                    "Highlight covers",
                    "1 round of revision"
                ]
            },
            {
                name: "Growth",
                price: "₦45,000",
                description: "A stronger and more consistent social identity.",
                features: [
                    "Everything in Starter",
                    "6 custom post templates",
                    "6 highlight covers",
                    "Profile/banner design",
                    "Typography",
                    "Color palette",
                    "Content guidelines",
                    "2 rounds of revisions"
                ]
            },
            {
                name: "Professional",
                price: "₦70,000",
                description: "A complete social media visual identity.",
                features: [
                    "Everything in Growth",
                    "10+ social templates",
                    "Complete highlight covers",
                    "Profile & banner designs",
                    "Typography system",
                    "Complete color system",
                    "Content design guidelines",
                    "3 rounds of revisions"
                ]
            }
        ]
    },


    management: {
        packages: [
            {
                name: "Starter",
                price: "₦35,000/month",
                description: "Consistent management for one platform.",
                features: [
                    "1 social media platform",
                    "15–20 posts/month",
                    "Graphics + short-form videos combined",
                    "Captions & hashtags",
                    "Content planning",
                    "Scheduling & publishing",
                    "Basic comment/reply management",
                    "Monthly performance summary"
                ]
            },
            {
                name: "Growth",
                price: "₦55,000/month",
                description: "More content and management for growing brands.",
                features: [
                    "Up to 2 platforms",
                    "25–30 posts/month",
                    "Graphics + short-form videos combined",
                    "Professional graphics",
                    "Short-form video editing",
                    "Content strategy",
                    "Scheduling & publishing",
                    "Monthly performance report"
                ]
            },
            {
                name: "Professional",
                price: "₦90,000/month",
                description: "Full social media management for active brands.",
                features: [
                    "Up to 3 platforms",
                    "30–40 posts/month",
                    "Graphics + short-form videos combined",
                    "Premium graphics",
                    "Professional video editing",
                    "Advanced content strategy",
                    "Community management",
                    "Promotional content",
                    "Monthly performance report"
                ]
            }
        ]
    },


    marketing: {
        packages: [
            {
                name: "Starter",
                price: "₦25,000",
                description: "A foundation for your marketing campaign.",
                features: [
                    "Basic marketing strategy",
                    "Target audience research",
                    "Content promotion strategy",
                    "Social media marketing guidance",
                    "Basic campaign setup",
                    "1 campaign",
                    "Performance tracking"
                ]
            },
            {
                name: "Growth",
                price: "₦45,000",
                description: "Campaign planning and optimization for growth.",
                features: [
                    "Everything in Starter",
                    "Audience research",
                    "Campaign planning",
                    "Up to 2 campaigns",
                    "Ad creative direction",
                    "Campaign optimization",
                    "Performance monitoring",
                    "Basic reporting"
                ]
            },
            {
                name: "Professional",
                price: "₦70,000",
                description: "A more advanced marketing strategy.",
                features: [
                    "Everything in Growth",
                    "Advanced marketing strategy",
                    "Detailed audience targeting",
                    "Up to 3 campaigns",
                    "Conversion-focused strategy",
                    "Campaign optimization",
                    "Detailed reporting",
                    "Marketing recommendations"
                ]
            }
        ]
    },


    custom: {
        packages: []
    }

};
/* =========================================
   DISPLAY PACKAGES
========================================= */

function displayPackages(service) {

    packageOptions.innerHTML = "";

    const data = packageData[service];

    if (!data) {
        packageSection.classList.add("hidden");
        return;
    }

    /* CUSTOM PROJECT */

    if (service === "custom") {

        packageSection.classList.add("hidden");

        showCustomRequirements();

        return;
    }


    packageSection.classList.remove("hidden");


    data.packages.forEach((pkg, index) => {

        const packageId = `${service}-${pkg.name.toLowerCase()}`;

        const option = document.createElement("div");

        option.className = "package-option";

        option.innerHTML = `
            <input
                type="radio"
                id="${packageId}"
                name="package"
                value="${pkg.name}"
                ${index === 0 ? "" : ""}
            >

            <label for="${packageId}">

                <h3>${pkg.name}</h3>

                <span class="package-price">
                    ${pkg.price}
                </span>

                <p>
                    ${pkg.description}
                </p>

                <ul>
                    ${pkg.features.map(feature => `
                        <li>${feature}</li>
                    `).join("")}
                </ul>

            </label>
        `;

        packageOptions.appendChild(option);

    });


    requirementsSection.classList.remove("hidden");

    showRequirements(service);
}
/* =========================================
   CUSTOM PROJECT
========================================= */

/* =========================================
   SERVICE REQUIREMENTS
========================================= */

function showRequirements(service) {

    requirementsSection.classList.remove("hidden");

    let html = "";

    if (service === "website") {

        html = `
            <div class="form-grid">

                <div class="form-group">
                    <label>What type of website do you need?</label>
                    <select name="websiteType">
                        <option value="">Select type</option>
                        <option>Business Website</option>
                        <option>Personal / Portfolio Website</option>
                        <option>Blog</option>
                        <option>Landing Page</option>
                        <option>School / Organization Website</option>
                        <option>Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>How many pages do you need?</label>
                    <select name="websitePages">
                        <option value="">Select number</option>
                        <option>1–3 pages</option>
                        <option>4–6 pages</option>
                        <option>7–10 pages</option>
                        <option>10+ pages</option>
                        <option>Not sure</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Do you already have a domain?</label>
                    <select name="domain">
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                        <option>Not sure</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Do you already have hosting?</label>
                    <select name="hosting">
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                        <option>Not sure</option>
                    </select>
                </div>

            </div>

            <div class="form-group">
                <label>What features do you need?</label>
                <textarea
                    name="websiteFeatures"
                    rows="5"
                    placeholder="Example: WhatsApp button, contact form, gallery, booking system, animations..."
                ></textarea>
            </div>
        `;

    } else if (service === "ecommerce") {

        html = `
            <div class="form-grid">

                <div class="form-group">
                    <label>Approximately how many products?</label>
                    <select name="productCount">
                        <option value="">Select</option>
                        <option>1–10</option>
                        <option>11–30</option>
                        <option>31–50</option>
                        <option>50+</option>
                        <option>Not sure</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Do you need online payment?</label>
                    <select name="onlinePayment">
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                        <option>Not sure</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Do you offer delivery?</label>
                    <select name="delivery">
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>How should customers place orders?</label>
                    <select name="orderMethod">
                        <option value="">Select</option>
                        <option>Website Checkout</option>
                        <option>WhatsApp</option>
                        <option>Both</option>
                        <option>Not sure</option>
                    </select>
                </div>

            </div>
        `;

    } else if (service === "graphics") {

        html = `
            <div class="form-grid">

                <div class="form-group">
                    <label>What type of design do you need?</label>
                    <select name="graphicType">
                        <option value="">Select</option>
                        <option>Flyer</option>
                        <option>Social Media Post</option>
                        <option>Business Card</option>
                        <option>Poster</option>
                        <option>Banner</option>
                        <option>Advertisement</option>
                        <option>Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Where will the design be used?</label>
                    <select name="graphicPlatform">
                        <option value="">Select</option>
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>WhatsApp</option>
                        <option>Print</option>
                        <option>Multiple Platforms</option>
                        <option>Other</option>
                    </select>
                </div>

            </div>

            <div class="form-group">
                <label>What should the design contain?</label>
                <textarea
                    name="graphicContent"
                    rows="5"
                    placeholder="Tell us the text, offers, contact details, images, logo, etc."
                ></textarea>
            </div>
        `;

    } else if (service === "video") {

        html = `
            <div class="form-grid">

                <div class="form-group">
                    <label>What type of video?</label>
                    <select name="videoType">
                        <option value="">Select</option>
                        <option>TikTok / Reel</option>
                        <option>YouTube Video</option>
                        <option>Advertisement</option>
                        <option>Birthday / Event</option>
                        <option>Business Video</option>
                        <option>Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Where will it be posted?</label>
                    <select name="videoPlatform">
                        <option value="">Select</option>
                        <option>TikTok</option>
                        <option>Instagram</option>
                        <option>YouTube</option>
                        <option>WhatsApp</option>
                        <option>Multiple Platforms</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Desired video length</label>
                    <select name="videoLength">
                        <option value="">Select</option>
                        <option>Under 60 seconds</option>
                        <option>1–2 minutes</option>
                        <option>2–5 minutes</option>
                        <option>5+ minutes</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Do you need captions?</label>
                    <select name="videoCaptions">
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>

            </div>

            <div class="form-group">
                <label>Describe the video style you want</label>
                <textarea
                    name="videoStyle"
                    rows="5"
                    placeholder="Example: energetic, cinematic, clean, luxury, fast-paced..."
                ></textarea>
            </div>
        `;

    } else if (service === "branding") {

        html = `
            <div class="form-grid">

                <div class="form-group">
                    <label>Brand Name</label>
                    <input
                        type="text"
                        name="brandName"
                        placeholder="Enter your brand name"
                    >
                </div>

                <div class="form-group">
                    <label>Target Audience</label>
                    <input
                        type="text"
                        name="targetAudience"
                        placeholder="Who are you trying to reach?"
                    >
                </div>

                <div class="form-group">
                    <label>Preferred Brand Colors</label>
                    <input
                        type="text"
                        name="brandColors"
                        placeholder="Example: Blue, white and black"
                    >
                </div>

                <div class="form-group">
                    <label>Which platforms?</label>
                    <input
                        type="text"
                        name="brandingPlatforms"
                        placeholder="Instagram, Facebook, TikTok..."
                    >
                </div>

            </div>
        `;

    } else if (service === "management") {

        html = `
            <div class="form-group">
                <label>Which social media platforms?</label>
                <input
                    type="text"
                    name="managementPlatforms"
                    placeholder="Instagram, Facebook, TikTok..."
                >
            </div>

            <div class="form-group">
                <label>Who is your target audience?</label>
                <textarea
                    name="managementAudience"
                    rows="4"
                    placeholder="Tell us about your ideal customers..."
                ></textarea>
            </div>

            <div class="form-group">
                <label>What are your main goals?</label>
                <textarea
                    name="managementGoals"
                    rows="4"
                    placeholder="Example: More followers, more sales, more engagement..."
                ></textarea>
            </div>

            <div class="form-group">
                <label>Anything we should avoid?</label>
                <textarea
                    name="contentRestrictions"
                    rows="4"
                    placeholder="Tell us about any content restrictions or preferences..."
                ></textarea>
            </div>
        `;

    } else if (service === "marketing") {

        html = `
            <div class="form-grid">

                <div class="form-group">
                    <label>What product or service are you marketing?</label>
                    <input
                        type="text"
                        name="marketingProduct"
                        placeholder="Enter product or service"
                    >
                </div>

                <div class="form-group">
                    <label>Who is your target audience?</label>
                    <input
                        type="text"
                        name="marketingAudience"
                        placeholder="Describe your ideal customers"
                    >
                </div>

                <div class="form-group">
                    <label>What is your main marketing goal?</label>
                    <select name="marketingGoal">
                        <option value="">Select goal</option>
                        <option>Increase Sales</option>
                        <option>Get More Leads</option>
                        <option>Increase Brand Awareness</option>
                        <option>Get More Website Visitors</option>
                        <option>Grow Social Media</option>
                        <option>Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Approximate Ad Budget</label>
                    <input
                        type="text"
                        name="adBudget"
                        placeholder="Example: ₦500/day"
                    >
                </div>

            </div>
        `;
    }

    dynamicRequirements.innerHTML = html;
}


/* =========================================
   CUSTOM PROJECT
========================================= */

function showCustomRequirements() {

    requirementsSection.classList.remove("hidden");

    dynamicRequirements.innerHTML = `

        <div class="form-grid">

            <div class="form-group">

                <label for="customProjectType">
                    What type of custom project is this?
                </label>

                <select
                    id="customProjectType"
                    name="customProjectType"
                >

                    <option value="">
                        Select project type
                    </option>

                    <option value="celebration">
                        Celebration / Event
                    </option>

                    <option value="business">
                        Business Project
                    </option>

                    <option value="personal">
                        Personal Project
                    </option>

                    <option value="web-app">
                        Website / Web App
                    </option>

                    <option value="design">
                        Design Project
                    </option>

                    <option value="video">
                        Video Project
                    </option>

                    <option value="other">
                        Other
                    </option>

                </select>

            </div>

        </div>

        <div class="form-group">

            <label for="customProjectDescription">
                Describe your custom project
            </label>

            <textarea
                id="customProjectDescription"
                name="customProjectDescription"
                rows="6"
                placeholder="Tell us exactly what you want us to create..."
            ></textarea>

        </div>

    `;
}


/* =========================================
   SERVICE CHANGE
========================================= */

if (serviceSelect) {

    serviceSelect.addEventListener("change", function () {

        const selectedService = this.value;

        if (!selectedService) {

            packageSection.classList.add("hidden");
            requirementsSection.classList.add("hidden");

            packageOptions.innerHTML = "";
            dynamicRequirements.innerHTML = "";

            return;
        }

        displayPackages(selectedService);

    });

}


/* =========================================
   FORM TEST
========================================= */

console.log("MARK-NEWTON form script is working");