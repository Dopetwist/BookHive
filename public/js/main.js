
// Select specific elements
const body = document.body;
const toggleButton = document.getElementById("toggle-button");
const newToggleButton = document.getElementById("new-toggle-button");
const addButton = document.getElementById("add-book");
const menuIcon = document.getElementById("menu-icon");
const feedbackButton = document.querySelector(".feedbackBtn-class");
const newFeedbackButton = document.getElementById("feedbackBtn");


document.addEventListener("DOMContentLoaded", () => {
    const edit = document.getElementById("edit-icon");
    const done = document.getElementById("done");
    const cancel = document.getElementById("cancel");

    //Display Bio edit field
    if (edit) {
        edit.addEventListener("click", () => {
            document.querySelector(".user-bio-text").setAttribute("hidden", true);
            document.getElementById("edit-bio").removeAttribute("hidden");
        });
    }

    //Bio edit 'Save Changes' Button
    if (done) {
        done.addEventListener("click", () => {
            document.getElementById("edit-bio").setAttribute("hidden", true);
            document.querySelector(".user-bio-text").removeAttribute("hidden");
        });
    }
    
    //Bio edit 'Cancel' Button
    if (cancel) {
        cancel.addEventListener("click", () => {
            document.getElementById("edit-bio").setAttribute("hidden", true);
            document.querySelector(".user-bio-text").removeAttribute("hidden");
        });
    }
});


// Menu Icon
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector("#menu-icon");
    const sideBar = document.querySelector(".float-nav-links");
    const overlay = document.getElementById("newBackdrop");


    if (menu) {
        menu.addEventListener("click", () => {
            menu.classList.toggle("bx-x");
            sideBar.classList.toggle("active");
            overlay.classList.toggle("alive");
        });
    }

    // Close sidebar on outside click
    if (overlay) {
        overlay.addEventListener("click", () => {
            menu.classList.remove("bx-x");
            sideBar.classList.remove("active");
            overlay.classList.remove("alive");
        });
    }
});

// Trigger image file picker
document.addEventListener("DOMContentLoaded", () => {
    const upload = document.getElementById("uploadBtn");

    if (upload) {
        upload.addEventListener("click", () => {
            const fileInput = document.getElementById("file-input");

            fileInput.click();
        });
    }
});


//Dynamically upload profile picture without page reload
document.addEventListener("DOMContentLoaded", () => {
    const inputFile = document.getElementById("file-input");

    if (inputFile) {
        inputFile.addEventListener("change", async (e) => {
            e.preventDefault(); // Prevent page reload
        
            const formData = new FormData();
            const fileInput = document.getElementById("file-input");
            const file = fileInput.files[0];
            const loader = document.getElementById("loader");
            const container = document.querySelector(".buttons-container");

            const fileError = document.getElementById("send-error");

            const uploadBtn = document.getElementById("uploadBtn");
            const editBtn = document.getElementById("editBtn");

            let errorTimeout;
        
            formData.append("profile-img", file);

            // Show loader and disable button
            loader.style.display = "block";
            uploadBtn.disabled = true;

        
            try {
                if (container) {
                    container.style.display = "none";
                }
        
                const response = await axios.post("/upload-picture", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                
                // Update the profile picture dynamically
                document.getElementById("profile-img").src = response.data.profilePicture;
                uploadBtn.style.display = "none";
                editBtn.style.display = "block";
                
            } catch (error) {
                console.error(error);

                fileError.style.display = "block";

                // Clear any previous Timeout
                clearTimeout(errorTimeout);

                // Hide error message after 5 seconds
                errorTimeout = setTimeout(() => {
                    fileError.style.display = "none";
                }, 5000);
            } finally {
                // Hide loader and enable button
                loader.style.display = "none";
                uploadBtn.disabled = false;
            }
        });
    }

    // Trigger image file picker
    const changeButton = document.getElementById("changeBtn");

    if (changeButton) {
        changeButton.addEventListener("click", () => {
            const fileInput = document.getElementById("file-input");

            fileInput.click();
        });
    }

    //Dynamically remove profile picture without page reload
    const picDelete = document.getElementById("pic-delete-form");

    if (picDelete) {
        picDelete.addEventListener("submit", async (e) => {
            e.preventDefault(); // Prevent page reload

            const container = document.querySelector(".buttons-container");
            const uploadBtn = document.getElementById("uploadBtn");
            const editBtn = document.getElementById("editBtn");
            const loader = document.getElementById("loader");

            // Show loader and disable button
            loader.style.display = "block";

        
            try {

                await axios.post("/pic-delete");

                document.getElementById("profile-img").src = '/uploads/default.png';

                container.style.display = "none";

                uploadBtn.style.display = "block";
                editBtn.style.display = "none";
            } catch (error) {
                console.error(error);
                alert("Failed to remove profile picture.");
            } finally {
                // Hide loader and enable button
                loader.style.display = "none";
                editBtn.disabled = false;
            }
        });
    }
});


//Send Feedbacks
document.addEventListener("DOMContentLoaded", () => {
    const feedbackForm = document.querySelector("#feedback-form");

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
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
            feedbackForm.reset();
        });
    }
});



// Drop Down Menu functionalities
document.addEventListener("DOMContentLoaded", () => {
    const accountDropdown = document.getElementById("accountDropdown");

    if (accountDropdown) {
        accountDropdown.addEventListener("click", () => {
            const dropMenu = document.querySelector(".drop-outer");
            const menuArrow = document.getElementById("menu-arrow");

            dropMenu.classList.toggle("show");
            menuArrow.classList.toggle("bxs-up-arrow");
        });
    }


    document.addEventListener("mousedown", (event) => {
        const account = document.getElementById("accountDropdown");
        const dropMenu = document.querySelector(".drop-outer");
        const menuArrow = document.getElementById("menu-arrow");

        if (dropMenu) {
            if (!dropMenu.contains(event.target) && !account.contains(event.target)) {
                dropMenu.classList.remove("show");
                menuArrow.classList.remove("bxs-up-arrow");
            }
        }
    });
});


// Display Loader when logging in.
document.addEventListener("DOMContentLoaded", () => {
    const logForm = document.getElementById("log-form");

    if (logForm) {
        logForm.addEventListener("submit", () => {
    
            const loader = document.getElementById("loader");
            const loginBtn = document.querySelector(".log-btn");


            //Show loader and disable delete button
            loader.style.display = "block";
            loginBtn.disabled = true;
        });
    }
});


// Display Loader when registering.
document.addEventListener("DOMContentLoaded", () => {
    const regForm = document.getElementById("reg-form");

    if (regForm) {
        regForm.addEventListener("submit", () => {
    
            const loader = document.getElementById("loader");
            const regBtn = document.getElementById("regBtn");


            //Show loader and disable delete button
            loader.style.display = "block";
            regBtn.disabled = true;
        });
    }
});


// Display Loader when deleting account
document.addEventListener("DOMContentLoaded", () => {
    const deleteForm = document.getElementById("delete-form");

    if (deleteForm) {
        deleteForm.addEventListener("submit", () => {
    
            const loader = document.getElementById("loader");
            const delBtn = document.getElementById("delete");


            //Show loader and disable delete button
            loader.style.display = "block";
            delBtn.disabled = true;
        });
    }
});


// Display Loader when changing password
document.addEventListener("DOMContentLoaded", () => {
    const changeForm = document.getElementById("change-form");

    if (changeForm) {
        changeForm.addEventListener("submit", () => {
    
            const loader = document.getElementById("loader");
            const changeBtn = document.getElementById("changeBtn");


            //Show loader and disable delete button
            loader.style.display = "block";
            changeBtn.disabled = true;
        });
    }
});


// Display Loader when resetting password
document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("reset-form");

    if (resetForm) {
        resetForm.addEventListener("submit", () => {
    
            const loader = document.getElementById("loader");
            const changeBtn = document.getElementById("resetBtn");


            //Show loader and disable delete button
            loader.style.display = "block";
            changeBtn.disabled = true;
        });
    }
});


//Hide forms when a click is made outside the forms.
document.addEventListener("DOMContentLoaded", () => {
    //Search form
    document.addEventListener("mousedown", (event) => {
        const searchResults = document.querySelector(".display-user");
        const searchInput = document.getElementById("search");

        // Check if the clicked element is NOT inside the search result div or the search input
        if (searchResults) {
            if (!searchResults.contains(event.target) && !searchInput.contains(event.target)) {
                searchResults.classList.remove("live");
            }
        }
    });
    

    //Feedback form
    document.addEventListener("mousedown", (event) => {
        const feedbackCon = document.querySelector(".feedback-con");
        const feedbackForm = document.getElementById("feedback-form");
        const overlay = document.querySelector(".overlay");
        const feedbackMessage = document.querySelector("#feedbackMessage");


        if (feedbackCon) {
            if (!feedbackCon.contains(event.target) && !feedbackForm.contains(event.target)) {
                feedbackForm.style.display = "none";
                overlay.classList.remove("backdrop");
                feedbackMessage.textContent = "";
                feedbackForm.reset();
            }
        }
    });

    //Bio form
    document.addEventListener("mousedown", (event) => {
        const bioCon = document.querySelector(".bio-con");
        const bioForm = document.getElementById("bio-form");
        const overlay = document.querySelector(".overlay");


        if (bioCon) {
            if (!bioCon.contains(event.target) && !bioForm.contains(event.target)) {
                bioForm.style.display = "none";
                document.body.style.overflow = "auto";
                overlay.classList.remove("backdrop");
            }
        }
    });
});


//Auto detect users time zone
document.addEventListener("DOMContentLoaded", () => {
    const timeZone = document.getElementById('timeZone');

    if (timeZone) {
        timeZone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
});



//Convert UTC timestamp to each user's local time zone
function updateTimestamps () {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeStamp = document.querySelectorAll(".timestamp");

    if (timeStamp) {
        timeStamp.forEach(element => {
            const utcDate = new Date(element.dataset.utc);
            const options = { timeZone: userTimeZone, hour12: true };

            const year = utcDate.toLocaleString('en-US', { year: 'numeric', ...options });
            const month = utcDate.toLocaleString('en-US', { month: '2-digit', ...options });
            const day = utcDate.toLocaleString('en-US', { day: '2-digit', ...options });
            const time = utcDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', ...options });

            element.innerHTML = `<strong class="strong">Posted on:</strong> ${year}/${month}/${day}, ${time}`;
        });
    }
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
    if (toggleButton) {
        toggleButton.addEventListener("click", async () => {
            if (!isHamburgerVisible()) {
                themeEffect();
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", async () => {
    // New Toggle button
    if (newToggleButton) {
        newToggleButton.addEventListener("click", async () => {
            if (isHamburgerVisible()) {
                themeEffect();
            }
        });
    }
});




// Back to Top button
const button = document.getElementById("back-to-top");

window.onscroll = function() { scrollFunction() };

if (button) {
    button.addEventListener("click", () => {
        topButton();
    });
}



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

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            form.style.display = "none";
            overlay.classList.remove("backdrop");
            feedbackMessage.textContent = "";
            form.reset();
        });
    }
}


//Feedback form displays
document.addEventListener("DOMContentLoaded", () => {
    if (feedbackButton) {
        feedbackButton.addEventListener("click", () => {
            if (!isHamburgerVisible()) {
                feedbackDisplay();
            }
        });
    }

    if (newFeedbackButton) {
        newFeedbackButton.addEventListener("click", () => {
            if (isHamburgerVisible()) {
                feedbackDisplay();
                document.querySelector(".float-nav-links").classList.remove("active");
                document.getElementById("newBackdrop").classList.remove("alive");
                menuIcon.classList.remove("bx-x");
            }
        });
    }
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
    if (form) {
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
    }
});


            
document.addEventListener("DOMContentLoaded", () => {
    // Prevent page reload on Sort Title click
    if (sortTitle) {
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
    }

    // Prevent page reload on Sort Recent click
    if (sortRecent) {
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
    }

    // Prevent page reload on Sort Rating click
    if (sortRating) {
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
    }
});

// Prevent Page reload on click
const cancelButton = document.getElementById("cancel");
const bioButton = document.getElementById("bio-close");

if (cancelButton) {
    cancelButton.addEventListener("click", (event) => {
        event.preventDefault();
    });
}

if (bioButton) {
    bioButton.addEventListener("click", (event) => {
        event.preventDefault();
    });
}

            



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