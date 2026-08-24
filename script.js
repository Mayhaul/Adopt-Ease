/* =====================================================
   PAWCARE JAVASCRIPT
===================================================== */


/* =====================================================
   NAVBAR
===================================================== */

function toggleMenu() {

    const navMenu =
        document.getElementById("navMenu");

    navMenu.classList.toggle("active");

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =====================================================
   DOG ADOPTION
===================================================== */

function adoptDog(dogName) {

    const loggedInEmail =
        localStorage.getItem(
            "pawcareLoggedInUser"
        );


    if (!loggedInEmail) {

        showToast(
            "🔐 Please login before adopting a dog."
        );


        setTimeout(() => {

            openAuth("login");

        }, 500);


        return;

    }


    const confirmAdoption =
        confirm(
            `Would you like to start the adoption process for ${dogName}?`
        );


    if (confirmAdoption) {

        showToast(
            `❤️ Adoption request for ${dogName} has been submitted!`
        );

    }

}


/* =====================================================
   DOG SEARCH
===================================================== */

function filterDogs() {

    const searchInput =
        document.getElementById("dogSearch");


    const searchValue =
        searchInput.value.toLowerCase();


    const dogs =
        document.querySelectorAll(".dog-card");


    dogs.forEach((dog) => {

        const dogName =
            dog
                .getAttribute("data-name")
                .toLowerCase();


        if (dogName.includes(searchValue)) {

            dog.style.display = "block";

        } else {

            dog.style.display = "none";

        }

    });

}


/* =====================================================
   LOCATION
===================================================== */

function getLocation() {

    const locationInput =
        document.getElementById("location");


    if (!navigator.geolocation) {

        showToast(
            "Geolocation is not supported by your browser."
        );

        return;

    }


    showToast(
        "📍 Getting your location..."
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            locationInput.value =
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;


            showToast(
                "📍 Location detected successfully!"
            );

        },


        function () {

            showToast(
                "Unable to get your location."
            );

        }

    );

}


/* =====================================================
   IMAGE UPLOAD
===================================================== */

const animalImage =
    document.getElementById(
        "animalImage"
    );


animalImage.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {

            return;

        }


        const imagePreview =
            document.getElementById(
                "imagePreview"
            );


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                imagePreview.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Animal">

                    <span>
                        Photo selected
                    </span>

                `;

            };


        reader.readAsDataURL(file);

    }
);


/* =====================================================
   RESCUE FORM
===================================================== */

const rescueForm =
    document.getElementById(
        "rescueForm"
    );


rescueForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const animalType =
            document.getElementById(
                "animalType"
            ).value;


        const condition =
            document.getElementById(
                "condition"
            ).value;


        const location =
            document.getElementById(
                "location"
            ).value;


        const phone =
            document.getElementById(
                "phone"
            ).value;


        if (!location) {

            showToast(
                "⚠️ Please provide the animal's location."
            );

            return;

        }


        if (!phone) {

            showToast(
                "⚠️ Please enter your phone number."
            );

            return;

        }


        showToast(
            `🚑 Rescue request submitted for the ${animalType}.`
        );


        setTimeout(() => {

            alert(

                `Rescue Request Created!\n\n` +

                `Animal: ${animalType}\n` +

                `Condition: ${condition}\n` +

                `Location: ${location}\n\n` +

                `The nearest NGO has been notified.`

            );

        }, 500);


        rescueForm.reset();


        document.getElementById(
            "imagePreview"
        ).innerHTML = `

            📷

            <span>
                Click to upload photo
            </span>

        `;

    }
);


/* =====================================================
   NGO
===================================================== */

function contactNGO(ngoName) {

    showToast(
        `📞 Connecting you with ${ngoName}...`
    );

}


/* =====================================================
   CART
===================================================== */

let cart = [];


/* Add product */

function addToCart(
    productName,
    price
) {

    const product = {

        name: productName,

        price: price

    };


    cart.push(product);


    updateCart();


    showToast(
        `${productName} added to cart 🛒`
    );

}


/* Update cart */

function updateCart() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    cartCount.textContent =
        cart.length;


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <p class="empty-cart">
                Your cart is empty.
            </p>

        `;


        cartTotal.textContent =
            "₹0";


        return;

    }


    let total = 0;


    cartItems.innerHTML = "";


    cart.forEach(
        (item, index) => {

            total += item.price;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.classList.add(
                "cart-item"
            );


            cartItem.innerHTML = `

                <span>
                    ${item.name}
                </span>

                <strong>
                    ₹${item.price}
                </strong>

                <button
                    onclick="removeFromCart(${index})">

                    ❌

                </button>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    cartTotal.textContent =
        `₹${total}`;

}


/* Remove cart item */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

    showToast(
        "Item removed from cart."
    );

}


/* Open cart */

function openCart() {

    document.getElementById(
        "cartModal"
    ).style.display = "flex";

}


/* Close cart */

function closeCart() {

    document.getElementById(
        "cartModal"
    ).style.display = "none";

}


/* Click outside cart */

window.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "cartModal"
            );


        if (event.target === modal) {

            closeCart();

        }

    }
);


/* Checkout */

function checkout() {

    if (cart.length === 0) {

        showToast(
            "🛒 Your cart is empty."
        );

        return;

    }


    alert(

        "Thank you for supporting PawCare! ❤️\n\n" +

        "Checkout functionality can be connected " +

        "to a payment gateway in the backend."

    );

}


/* =====================================================
   AUTHENTICATION
   LOCAL STORAGE
===================================================== */


/*
    All users are stored in:

    pawcareUsers

    Example:

    [
        {
            name: "Yuvraj",
            email: "yuvraj@gmail.com",
            phone: "9876543210",
            password: "123456"
        }
    ]

*/


/* Get users */

function getUsers() {

    const users =
        localStorage.getItem(
            "pawcareUsers"
        );


    if (users) {

        return JSON.parse(users);

    }


    return [];

}


/* Save users */

function saveUsers(users) {

    localStorage.setItem(

        "pawcareUsers",

        JSON.stringify(users)

    );

}


/* =====================================================
   OPEN AUTH
===================================================== */

function openAuth(type) {

    const modal =
        document.getElementById(
            "authModal"
        );


    modal.style.display =
        "flex";


    switchAuth(type);

}


/* =====================================================
   CLOSE AUTH
===================================================== */

function closeAuth() {

    document.getElementById(
        "authModal"
    ).style.display =
        "none";

}


/* =====================================================
   SWITCH LOGIN / SIGNUP
===================================================== */

function switchAuth(type) {

    const loginContainer =
        document.getElementById(
            "loginFormContainer"
        );


    const signupContainer =
        document.getElementById(
            "signupFormContainer"
        );


    if (type === "signup") {

        loginContainer.style.display =
            "none";


        signupContainer.style.display =
            "block";

    }


    else {

        signupContainer.style.display =
            "none";


        loginContainer.style.display =
            "block";

    }

}


/* =====================================================
   SIGNUP
===================================================== */

const signupForm =
    document.getElementById(
        "signupForm"
    );


signupForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "signupName"
            ).value.trim();


        const email =
            document.getElementById(
                "signupEmail"
            ).value.trim().toLowerCase();


        const phone =
            document.getElementById(
                "signupPhone"
            ).value.trim();


        const password =
            document.getElementById(
                "signupPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        /* Password validation */

        if (password.length < 6) {

            showToast(
                "⚠️ Password must contain at least 6 characters."
            );

            return;

        }


        /* Confirm password */

        if (
            password !==
            confirmPassword
        ) {

            showToast(
                "⚠️ Passwords do not match."
            );

            return;

        }


        /* Get users */

        const users =
            getUsers();


        /* Check duplicate email */

        const existingUser =
            users.find(
                user =>
                    user.email === email
            );


        if (existingUser) {

            showToast(
                "⚠️ This email is already registered."
            );

            return;

        }


        /* Create user */

        const newUser = {

            name: name,

            email: email,

            phone: phone,

            password: password

        };


        /* Add */

        users.push(
            newUser
        );


        /* Save */

        saveUsers(
            users
        );


        showToast(
            "🎉 Account created successfully!"
        );


        /* Clear form */

        signupForm.reset();


        /* Switch to login */

        setTimeout(
            () => {

                switchAuth(
                    "login"
                );

            },
            1000
        );

    }
);


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );


loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "loginEmail"
            ).value.trim().toLowerCase();


        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        /* Get users */

        const users =
            getUsers();


        /* Find user */

        const user =
            users.find(
                user =>

                    user.email ===
                    email &&

                    user.password ===
                    password

            );


        /* Invalid */

        if (!user) {

            showToast(
                "❌ Invalid email or password."
            );

            return;

        }


        /*
            Save current user

            Only email is stored
            as the active session.
        */

        localStorage.setItem(
            "pawcareLoggedInUser",
            user.email
        );


        showToast(
            `❤️ Welcome back, ${user.name}!`
        );


        loginForm.reset();


        closeAuth();


        updateLoginUI();

    }
);


/* =====================================================
   UPDATE LOGIN UI
===================================================== */

function updateLoginUI() {

    const loginButton =
        document.getElementById(
            "loginNavBtn"
        );


    const userSection =
        document.getElementById(
            "userSection"
        );


    const userName =
        document.getElementById(
            "userName"
        );


    const loggedInEmail =
        localStorage.getItem(
            "pawcareLoggedInUser"
        );


    /* Logged in */

    if (loggedInEmail) {

        const users =
            getUsers();


        const user =
            users.find(
                user =>
                    user.email ===
                    loggedInEmail
            );


        if (user) {

            loginButton.style.display =
                "none";


            userSection.style.display =
                "flex";


            userName.textContent =
                `Hi, ${user.name}`;

        }

    }


    /* Logged out */

    else {

        loginButton.style.display =
            "block";


        userSection.style.display =
            "none";

    }

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {

    localStorage.removeItem(
        "pawcareLoggedInUser"
    );


    showToast(
        "👋 You have been logged out."
    );


    updateLoginUI();

}


/* =====================================================
   CLOSE AUTH WHEN CLICKING OUTSIDE
===================================================== */

document
    .getElementById("authModal")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                this
            ) {

                closeAuth();

            }

        }
    );


/* =====================================================
   INITIALIZE
===================================================== */

updateCart();

updateLoginUI();