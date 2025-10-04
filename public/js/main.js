
// Select specific elements
const body = document.body;
const toggleButton = document.getElementById("toggle-button");
const newToggleButton = document.getElementById("new-toggle-button");
const addButton = document.getElementById("add-book");
const menuIcon = document.getElementById("menu-icon");
const feedbackButton = document.querySelector(".feedbackBtn-class");
const newFeedbackButton = document.getElementById("feedbackBtn");


document.addEventListener("DOMContentLoaded", () => {
    //Display Bio edit field
    document.getElementById("edit-icon").addEventListener("click", () => {
        document.querySelector(".user-bio-text").setAttribute("hidden", true);
        document.getElementById("edit-bio").removeAttribute("hidden");
    });

    //Bio edit 'Save Changes' Button
    document.getElementById("done").addEventListener("click", () => {
        document.getElementById("edit-bio").setAttribute("hidden", true);
        document.querySelector(".user-bio-text").removeAttribute("hidden");
    });
    
    //Bio edit 'Cancel' Button
    document.getElementById("cancel").addEventListener("click", () => {
        document.getElementById("edit-bio").setAttribute("hidden", true);
        document.querySelector(".user-bio-text").removeAttribute("hidden");
    });
});


// Menu Icon
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector("#menu-icon");
    const sideBar = document.querySelector(".float-nav-links");
    const overlay = document.getElementById("newBackdrop");


    menu.addEventListener("click", () => {
        menu.classList.toggle("bx-x");
        sideBar.classList.toggle("active");
        overlay.classList.toggle("alive");
    });

    // Close sidebar on outside click
    overlay.addEventListener("click", () => {
        menu.classList.remove("bx-x");
        sideBar.classList.remove("active");
        overlay.classList.remove("alive");
    });
});


//Dynamically upload profile picture without page reload
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("uploadForm").addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent page reload
    
        const formData = new FormData();
        const fileInput = document.getElementById("file-input");
        const loader = document.getElementById("loader");

        const uploadBtn = document.getElementById("uploadBtn");
        const changeBtn = document.getElementById("changeBtn");
    
        formData.append("profile-img", fileInput.files[0]);

        // Show loader and disable button
        loader.style.display = "block";
        uploadBtn.disabled = true;
    
        try {
            const response = await axios.post("/upload-picture", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
    
            // Update the profile picture dynamically
            document.getElementById("profile-img").src = response.data.profilePicture;
            fileInput.style.display = "none";
            uploadBtn.style.display = "none";
            changeBtn.style.display = "block";
        } catch (error) {
            console.error(error);
            alert("Failed to upload profile picture.");
        } finally {
            // Hide loader and enable button
            loader.style.display = "none";
            uploadBtn.disabled = false;
        }
    });

    //Dynamically remove profile picture without page reload
    document.getElementById("pic-delete-form").addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent page reload

        const uploadBtn = document.getElementById("uploadBtn");
        const changeBtn = document.getElementById("changeBtn");
        const fileInput = document.getElementById("file-input");
        const loader = document.getElementById("loader");

        // Show loader and disable button
        loader.style.display = "block";
        changeBtn.disabled = true;

    
        try {
            await axios.post("/pic-delete");

            document.getElementById("profile-img").src = '/uploads/default.png';
    
            fileInput.style.display = "block";
            uploadBtn.style.display = "block";
            changeBtn.style.display = "none";
        } catch (error) {
            console.error(error);
            alert("Failed to remove profile picture.");
        } finally {
            // Hide loader and enable button
            loader.style.display = "none";
            changeBtn.disabled = false;
        }
    });
});


//Send Feedbacks
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#feedback-form").addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent page reload

        const name = document.querySelector("#uName").value;
        const email = document.querySelector("#uEmail").value;
        const message = document.querySelector("#message").value;
        const feedbackMessage = document.getElementById("feedbackMessage");
        const feedBtn = document.getElementById("feedBtn");
        const loader = document.getElementById("loader");

        loader.style.display = "block";
        feedBtn.disabled = true;



        try {
            await axios.post("/feedback/send-feedback", { name, email, message });
            feedbackMessage.textContent = "Feedback sent successfully! ✅"; // Show success message
            feedbackMessage.style.color = "green";
            setTimeout(() => {
                feedbackMessage.textContent = "";
            }, 3000);
        } catch (error) {
            feedbackMessage.textContent = "Failed to send feedback. Try again.";
            feedbackMessage.style.color = "red";
            console.error("Failed to send feedback:", error);
            setTimeout(() => {
                feedbackMessage.textContent = "";
            }, 3000);
        } finally {
            loader.style.display = "none";
            feedBtn.disabled = false;
        }

        // Optionally, clear the form
        document.querySelector("#feedback-form").reset();
    });
});



// Drop Down Menu functionalities
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("accountDropdown").addEventListener("click", () => {
        const dropMenu = document.querySelector(".drop-outer");
        const menuArrow = document.getElementById("menu-arrow");

        dropMenu.classList.toggle("show");
        menuArrow.classList.toggle("bxs-up-arrow");
    });


    document.addEventListener("mousedown", (event) => {
        const account = document.getElementById("accountDropdown");
        const dropMenu = document.querySelector(".drop-outer");
        const menuArrow = document.getElementById("menu-arrow");

        if (!dropMenu.contains(event.target) && !account.contains(event.target)) {
            dropMenu.classList.remove("show");
            menuArrow.classList.remove("bxs-up-arrow");
        }
    });
});


// Display Loader when logging in.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("log-form").addEventListener("submit", () => {
    
        const loader = document.getElementById("loader");
        const loginBtn = document.querySelector(".log-btn");


        //Show loader and disable delete button
        loader.style.display = "block";
        loginBtn.disabled = true;
    });
});


// Display Loader when registering.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("reg-form").addEventListener("submit", () => {
    
        const loader = document.getElementById("loader");
        const regBtn = document.getElementById("regBtn");


        //Show loader and disable delete button
        loader.style.display = "block";
        regBtn.disabled = true;
    });
});


// Display Loader when deleting account
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("delete-form").addEventListener("submit", () => {
    
        const loader = document.getElementById("loader");
        const delBtn = document.getElementById("delete");


        //Show loader and disable delete button
        loader.style.display = "block";
        delBtn.disabled = true;
    });
});


// Display Loader when changing password
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("change-form").addEventListener("submit", () => {
    
        const loader = document.getElementById("loader");
        const changeBtn = document.getElementById("changeBtn");


        //Show loader and disable delete button
        loader.style.display = "block";
        changeBtn.disabled = true;
    });
});


// Display Loader when resetting password
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("reset-form").addEventListener("submit", () => {
    
        const loader = document.getElementById("loader");
        const changeBtn = document.getElementById("resetBtn");


        //Show loader and disable delete button
        loader.style.display = "block";
        changeBtn.disabled = true;
    });
});


//Hide forms when a click is made outside the forms.
document.addEventListener("DOMContentLoaded", () => {
    //Search form
    document.addEventListener("mousedown", (event) => {
        const searchResults = document.querySelector(".display-user");
        const searchInput = document.getElementById("search");

        // Check if the clicked element is NOT inside the search result div or the search input
        if (!searchResults.contains(event.target) && !searchInput.contains(event.target)) {
            searchResults.classList.remove("live");
        }
    });
    

    //Feedback form
    document.addEventListener("mousedown", (event) => {
        const feedbackCon = document.querySelector(".feedback-con");
        const feedbackForm = document.getElementById("feedback-form");
        const overlay = document.querySelector(".overlay");
        const feedbackMessage = document.querySelector("#feedbackMessage");


        if (!feedbackCon.contains(event.target) && !feedbackForm.contains(event.target)) {
            feedbackForm.style.display = "none";
            overlay.classList.remove("backdrop");
            feedbackMessage.textContent = "";
            feedbackForm.reset();
        }
    });

    //Bio form
    document.addEventListener("mousedown", (event) => {
        const bioCon = document.querySelector(".bio-con");
        const bioForm = document.getElementById("bio-form");
        const overlay = document.querySelector(".overlay-con");


        if (!bioCon.contains(event.target) && !bioForm.contains(event.target)) {
            bioForm.style.display = "none";
            overlay.classList.remove("backdrop");
        }
    });
});


//Auto detect users time zone
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('timeZone').value = Intl.DateTimeFormat().resolvedOptions().timeZone;
});



//Convert UTC timestamp to each user's local time zone
function updateTimestamps () {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    document.querySelectorAll(".timestamp").forEach(element => {
        const utcDate = new Date(element.dataset.utc);
        const options = { timeZone: userTimeZone, hour12: true };

        const year = utcDate.toLocaleString('en-US', { year: 'numeric', ...options });
        const month = utcDate.toLocaleString('en-US', { month: '2-digit', ...options });
        const day = utcDate.toLocaleString('en-US', { day: '2-digit', ...options });
        const time = utcDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', ...options });

        element.innerHTML = `<strong class="strong">Posted on:</strong> ${year}/${month}/${day}, ${time}`;
    });
}


// Run once on initial page load
document.addEventListener("DOMContentLoaded", updateTimestamps);

// Make available globally for future AJAX updates
window.updateTimestamps = updateTimestamps;


// Scroll Reveal
document.addEventListener("DOMContentLoaded", () => {
    ScrollReveal().reveal('.man', {
        distance: '90px',
        duration: 1000,
        easing: 'ease-in-out',
        origin: 'top',
        delay: 100
    }),

    ScrollReveal().reveal('.books', {
        distance: '90px',
        duration: 1000,
        easing: 'ease-in-out',
        origin: 'bottom',
        delay: 100
    })
});



document.addEventListener("DOMContentLoaded", () => {
    // Check local storage for saved theme on page load
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
        applyTheme (savedTheme);
    };
});


// Function to check if Menu Hamburger Icon is visible.
function isHamburgerVisible() {
    return window.getComputedStyle(menuIcon).display === 'block';
}


function newApplyTheme (themeMode) {
    if (themeMode === "dark") {
        document.documentElement.setAttribute("data-theme", themeMode); // Set theme attribute
        newToggleButton.classList.remove("bx-toggle-left");
        newToggleButton.classList.add("bx-toggle-right");            
    } else {
        document.documentElement.setAttribute("data-theme", themeMode); // Set theme attribute
        newToggleButton.classList.remove("bx-toggle-right");
        newToggleButton.classList.add("bx-toggle-left");
    }
}

// Function to apply dark mode based on each corresponding toggle button.
function themeEffect () {
    let currentTheme = localStorage.getItem("selectedTheme") || "light"; //Sets the default to Light Mode
    let newTheme = currentTheme === "light" ? "dark" : "light"; //Toggles the Theme modes
    
    localStorage.setItem("selectedTheme", newTheme); // Save new theme
    if (!isHamburgerVisible()) {
        applyTheme(newTheme); // Apply the new theme
    } else {
        newApplyTheme(newTheme); // Apply the new theme
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // Toggle button
    toggleButton.addEventListener("click", async () => {
        if (!isHamburgerVisible()) {
            themeEffect();
        }
    });
});


document.addEventListener("DOMContentLoaded", async () => {
    // New Toggle button
    newToggleButton.addEventListener("click", async () => {
        if (isHamburgerVisible()) {
            themeEffect();
        }
    });
});




// Back to Top button
const button = document.getElementById("back-to-top");

window.onscroll = function() { scrollFunction() };

button.addEventListener("click", () => {
    topButton();
});



//Function to display or remove button based on condition.
function scrollFunction() {

    if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
}

//Function to go back to the top
function topButton() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Function to display feedback form based on clicked corresponding feedback button.
function feedbackDisplay() {
    const form = document.getElementById("feedback-form");
    const closeBtn = document.querySelector(".close");
    const overlay = document.querySelector(".overlay");
    const feedbackMessage = document.getElementById("feedbackMessage");


    form.style.display = "block";
    overlay.classList.add("backdrop");

    closeBtn.addEventListener("click", () => {
        form.style.display = "none";
        overlay.classList.remove("backdrop");
        feedbackMessage.textContent = "";
        form.reset();
    });
}


//Feedback form displays
document.addEventListener("DOMContentLoaded", () => {
    feedbackButton.addEventListener("click", () => {
        if (!isHamburgerVisible()) {
            feedbackDisplay();
        }
    });

    newFeedbackButton.addEventListener("click", () => {
        if (isHamburgerVisible()) {
            feedbackDisplay();
            document.querySelector(".float-nav-links").classList.remove("active");
            document.getElementById("newBackdrop").classList.remove("alive");
            menuIcon.classList.remove("bx-x");
        }
    });
});


const form = document.getElementById('search-form');
const input = document.getElementById('search');
const resultBox = document.querySelector('.display-user');
const sortTitle = document.querySelector(".sortTitle");
const sortRecent = document.querySelector(".sortRecent");
const sortRating = document.querySelector(".sortRating");
const eachBook = document.querySelectorAll(".each-book");
const sortedBooks = document.getElementById("sorted-books");
        
            

// Prevent page reload when searching users.
document.addEventListener("DOMContentLoaded", () => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // prevent page reload

        resultBox.classList.add("live");

        try {
            const res = await axios.post('/search', {
                search: input.value.trim()
            });

            // Replace the entire display-user content with the returned HTML
            resultBox.innerHTML = res.data;
        } catch (err) {
            console.error(err);
            resultBox.innerHTML = "<p style='color:red;'>An error occurred. Please try again.</p>";
        }
    });
});


            
document.addEventListener("DOMContentLoaded", () => {
    // Prevent page reload on Sort Title click
    sortTitle.addEventListener("click", async (e) => {
        e.preventDefault(); // prevent page reload

        const url = sortTitle.href;


        eachBook.forEach((b) => {
            b.classList.add("disp");
        });

        sortedBooks.classList.add("trigger");
        // sortedBooks.innerHTML = "<p>Sorting...</p>";

        try {
            const res = await axios.get(url);
            sortedBooks.innerHTML = res.data;

            // Update timestamps
            if (window.updateTimestamps) updateTimestamps();
        } catch (error) {
            console.error(error);
            sortedBooks.innerHTML = "<p class='errorBooks'>No Books to Display!</p>";
        } 
    });

    // Prevent page reload on Sort Recent click
    sortRecent.addEventListener("click", async (e) => {
        e.preventDefault(); // prevent page reload

        const url = sortRecent.href;

        eachBook.forEach((b) => {
            b.classList.add("disp");
        });

        sortedBooks.classList.add("trigger");
        // sortedBooks.innerHTML = "<p>Sorting...</p>";

        try {
            const res = await axios.get(url);
            sortedBooks.innerHTML = res.data;

            // Update timestamps
            if (window.updateTimestamps) updateTimestamps();
        } catch (error) {
            console.error(error);
            sortedBooks.innerHTML = "<p class='errorBooks'>No Books to Display!</p>";
        }
    });

    // Prevent page reload on Sort Rating click
    sortRating.addEventListener("click", async (e) => {
        e.preventDefault(); // prevent page reload

        const url = sortRating.href;

        eachBook.forEach((b) => {
            b.classList.add("disp");
        });

        sortedBooks.classList.add("trigger");
        // sortedBooks.innerHTML = "<p>Sorting...</p>";

        try {
            const res = await axios.get(url);
            sortedBooks.innerHTML = res.data;

            // Update timestamps
            if (window.updateTimestamps) updateTimestamps();
        } catch (error) {
            console.error(error);
            sortedBooks.innerHTML = "<p class='errorBooks'>No Books to Display!</p>";
        }
    });
});

// Prevent Page reload on click
const cancelButton = document.getElementById("cancel");
const bioButton = document.getElementById("bio-close");

cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
});

bioButton.addEventListener("click", (event) => {
    event.preventDefault();
});

            



// function isValidDate (dateString) {
//     const [year, month, day] = dateString.split('/').map(Number);
//     const date = new Date(year, month - 1, day);

//     return (
//         date.getFullYear() === year &&
//         date.getMonth() + 1 === month &&
//         date.getDate() === day
//     );
// }

// function validateDate() {
//     const dateInput = document.getElementById('dateInput').value;
//     const errorMessage = document.getElementById('errorMessage');

//     const datePattern = /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

//     if (!datePattern.test(dateInput)) {
//         errorMessage.textContent = "Please enter a valid date in the required format!";
//         return false;
//     } else if (!isValidDate(dateInput)) {
//         errorMessage.textContent = "Please enter a valid Calender date!";
//         return false;
//     } else {
//         errorMessage.textContent = "";
//         return true;
//     }
// }