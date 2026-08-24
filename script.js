/* =====================================================
   ADOPT-EASE
   DOG LISTING CRUD
   localStorage
===================================================== */


/*
    All dog data is stored using this key:

    pawcareDogs

    Example:

    localStorage
        |
        └── pawcareDogs
                |
                ├── Bruno
                ├── Luna
                └── Max

*/


const STORAGE_KEY = "pawcareDogs";



/* =====================================================
   READ FROM LOCAL STORAGE
===================================================== */

function getDogs() {

    const data =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (data) {

        return JSON.parse(data);

    }


    return [];

}



/* =====================================================
   SAVE TO LOCAL STORAGE
===================================================== */

function saveDogs(dogs) {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(dogs)

    );

}



/* =====================================================
   CREATE + UPDATE
===================================================== */

const dogForm =
    document.getElementById(
        "dogForm"
    );


dogForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /*
            Get values from form
        */

        const id =
            document.getElementById(
                "dogId"
            ).value;


        const name =
            document.getElementById(
                "dogName"
            ).value.trim();


        const breed =
            document.getElementById(
                "dogBreed"
            ).value.trim();


        const age =
            Number(
                document.getElementById(
                    "dogAge"
                ).value
            );


        const gender =
            document.getElementById(
                "dogGender"
            ).value;


        const location =
            document.getElementById(
                "dogLocation"
            ).value.trim();


        const image =
            document.getElementById(
                "dogImage"
            ).value.trim();


        const description =
            document.getElementById(
                "dogDescription"
            ).value.trim();



        /*
            Get existing dogs
        */

        const dogs =
            getDogs();



        /* =================================================
           UPDATE
        ================================================= */

        if (id) {

            const index =
                dogs.findIndex(
                    function (dog) {

                        return (
                            dog.id ===
                            Number(id)
                        );

                    }
                );


            if (index !== -1) {

                dogs[index] = {

                    id:
                        Number(id),

                    name:
                        name,

                    breed:
                        breed,

                    age:
                        age,

                    gender:
                        gender,

                    location:
                        location,

                    image:
                        image,

                    description:
                        description

                };


                saveDogs(dogs);


                alert(
                    "Dog listing updated successfully!"
                );

            }

        }



        /* =================================================
           CREATE
        ================================================= */

        else {

            const newDog = {

                id:
                    Date.now(),

                name:
                    name,

                breed:
                    breed,

                age:
                    age,

                gender:
                    gender,

                location:
                    location,

                image:
                    image,

                description:
                    description

            };


            dogs.push(
                newDog
            );


            saveDogs(
                dogs
            );


            alert(
                "Dog listing added successfully!"
            );

        }


        /*
            Reset form
        */

        resetForm();


        /*
            Refresh displayed listings
        */

        displayDogs();

    }
);



/* =====================================================
   READ
   DISPLAY ALL DOGS
===================================================== */

function displayDogs() {

    const dogs =
        getDogs();


    displayDogsList(
        dogs
    );

}



/* =====================================================
   DISPLAY DOG LIST
===================================================== */

function displayDogsList(dogs) {

    const container =
        document.getElementById(
            "dogContainer"
        );


    /*
        Remove existing cards
    */

    container.innerHTML = "";



    /*
        If there are no dogs
    */

    if (dogs.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                <h3>
                    🐶 No Dog Listings
                </h3>

                <p>
                    Add your first dog using the form below.
                </p>

            </div>

        `;

        return;

    }



    /*
        Create a card for every dog
    */

    dogs.forEach(
        function (dog) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "dog-card";


            card.innerHTML = `

                <img
                    src="${dog.image}"
                    alt="${dog.name}"
                    onerror="
                        this.src =
                        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
                    "
                >


                <div class="dog-info">

                    <h3>
                        ${dog.name}
                    </h3>


                    <p>
                        🐕 Breed:
                        ${dog.breed}
                    </p>


                    <p>
                        🎂 Age:
                        ${dog.age}
                        years
                    </p>


                    <p>
                        ${
                            dog.gender === "Male"
                            ? "♂️ Male"
                            : "♀️ Female"
                        }
                    </p>


                    <p>
                        📍
                        ${dog.location}
                    </p>


                    <p class="dog-description">

                        ${dog.description}

                    </p>


                    <div class="card-buttons">

                        <button
                            class="edit-btn"
                            onclick="
                                editDog(${dog.id})
                            ">

                            ✏️ Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="
                                deleteDog(${dog.id})
                            ">

                            🗑️ Delete

                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}



/* =====================================================
   UPDATE
   EDIT DOG
===================================================== */

function editDog(id) {

    const dogs =
        getDogs();


    /*
        Find dog by ID
    */

    const dog =
        dogs.find(
            function (dog) {

                return (
                    dog.id === id
                );

            }
        );


    if (!dog) {

        alert(
            "Dog listing not found!"
        );

        return;

    }



    /*
        Put existing data
        inside form
    */

    document.getElementById(
        "dogId"
    ).value =
        dog.id;


    document.getElementById(
        "dogName"
    ).value =
        dog.name;


    document.getElementById(
        "dogBreed"
    ).value =
        dog.breed;


    document.getElementById(
        "dogAge"
    ).value =
        dog.age;


    document.getElementById(
        "dogGender"
    ).value =
        dog.gender;


    document.getElementById(
        "dogLocation"
    ).value =
        dog.location;


    document.getElementById(
        "dogImage"
    ).value =
        dog.image;


    document.getElementById(
        "dogDescription"
    ).value =
        dog.description;



    /*
        Change form title
    */

    document.getElementById(
        "formTitle"
    ).textContent =
        "Update Dog";



    /*
        Change submit button
    */

    document.getElementById(
        "submitButton"
    ).textContent =
        "Update Dog";



    /*
        Scroll to form
    */

    document.getElementById(
        "manage"
    ).scrollIntoView({
        behavior: "smooth"
    });

}



/* =====================================================
   DELETE
===================================================== */

function deleteDog(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this dog listing?"
        );


    if (!confirmDelete) {

        return;

    }



    /*
        Get existing dogs
    */

    let dogs =
        getDogs();



    /*
        Remove dog
    */

    dogs =
        dogs.filter(
            function (dog) {

                return (
                    dog.id !== id
                );

            }
        );



    /*
        Save updated array
    */

    saveDogs(
        dogs
    );



    /*
        Refresh UI
    */

    displayDogs();


    alert(
        "Dog listing deleted successfully!"
    );

}



/* =====================================================
   CANCEL EDIT
===================================================== */

function cancelEdit() {

    resetForm();

}



/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    dogForm.reset();


    document.getElementById(
        "dogId"
    ).value = "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add a Dog";


    document.getElementById(
        "submitButton"
    ).textContent =
        "Add Dog";

}



/* =====================================================
   SEARCH
===================================================== */

function searchDogs() {

    const searchValue =
        document.getElementById(
            "searchDog"
        ).value
        .toLowerCase()
        .trim();


    const dogs =
        getDogs();



    /*
        Filter by:

        1. Name
        2. Breed
        3. Location
    */

    const filteredDogs =
        dogs.filter(
            function (dog) {

                return (

                    dog.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    dog.breed
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    dog.location
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                );

            }
        );



    displayDogsList(
        filteredDogs
    );

}



/* =====================================================
   CLEAR SEARCH
===================================================== */

function clearSearch() {

    document.getElementById(
        "searchDog"
    ).value = "";


    displayDogs();

}



/* =====================================================
   INITIAL SAMPLE DATA
===================================================== */

function initializeDogs() {

    const existingData =
        localStorage.getItem(
            STORAGE_KEY
        );


    /*
        Don't overwrite existing data.
    */

    if (existingData) {

        return;

    }


    const sampleDogs = [

        {

            id: 1,

            name: "Bruno",

            breed: "Labrador",

            age: 2,

            gender: "Male",

            location: "Delhi",

            image:
                "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=600&q=80",

            description:
                "Friendly and energetic Labrador."

        },


        {

            id: 2,

            name: "Luna",

            breed: "Beagle",

            age: 1,

            gender: "Female",

            location: "Chandigarh",

            image:
                "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80",

            description:
                "Playful Beagle who loves people."

        },


        {

            id: 3,

            name: "Max",

            breed: "Indie",

            age: 3,

            gender: "Male",

            location: "Amritsar",

            image:
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",

            description:
                "Calm and friendly Indie dog."

        },


        {

            id: 4,

            name: "Coco",

            breed: "Golden Retriever",

            age: 2,

            gender: "Female",

            location: "Ludhiana",

            image:
                "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",

            description:
                "Sweet Golden Retriever."

        }

    ];


    saveDogs(
        sampleDogs
    );

}



/* =====================================================
   START APPLICATION
===================================================== */

initializeDogs();

displayDogs();