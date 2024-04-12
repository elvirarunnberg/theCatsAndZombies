document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded event fired");

    //Bilder för alla platser på spelbrädet
    const gameBoard = document.getElementById("game-board");
    const locationImages = [
        "images/havet.jpg", "images/skogen.jpg", "images/parken.jpg", "images/huset.jpg", "images/mataffar.jpg",
        "images/badhuset.png", "images/bensinstation.jpg", "images/hamnen.jpg", "images/krogen.jpg",
        "images/overgivnastugan.jpg", "images/blomsterbutiken.jpg", "images/gymmet.jpg", "images/stallet.jpg",
        "images/slott.jpg", "images/hotellet.jpg", "images/bilverkstad.jpg", "images/godisaffar.jpg",
        "images/bio.jpg", "images/hoghusen.jpg", "images/slummen.jpg", "images/an.jpg", "images/restaurang.jpg",
        "images/leksaksaffaren.jpg", "images/djuraffaren.jpg", "images/systembolaget.jpg"
    ];

    //Namn på platser
    const locationName = [
        "Havet", "Skogen", "Parken", "Huset", "Mataffären",
        "Badhuset", "Bensinstationen", "Hamnen", "Krogen",
        "Övergivna stugan", "Blomsterbutiken", "Gymmet", "Stallet",
        "Slottet", "Hotellet", "Bilverkstan", "Godisaffären",
        "Bion", "Höghusen", "Slummen", "Ån", "Restaurangen",
        "Leksaksaffären", "Djuraffären", "Systembolaget"
    ];

   //Skapa spelbräde
    function createGameBoard() {
        gameBoard.innerHTML = '';

        for (let i = 0; i < locationImages.length; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = locationName[i];
            gameBoard.appendChild(cell);
        }

        return 0;
    }
    //API för bucket list. Anropas varje gång katt hittas
    function fetchBucketList() {
        return fetch('https://api.api-ninjas.com/v1/bucketlist', {
            method: 'GET',
            headers: {
                'X-Api-Key': 'mJ4/jcwZ5/1eq/Rdltu3fg==0rmNWlRSkMBOqqeY',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const bucketListMessage = document.getElementById('bucket-list-message');
            bucketListMessage.textContent = `Please help the cats. One of them have a lifelong dream to ${data.item} and only YOU can make it happen!`;
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }
                        
        fetchBucketList();

    //Placerar ut katter och zombies på random platser
    let zombiePositions = [];
    let kattFound = 0;
    let kattTotal = 3;

    function placeEntitiesRandomly() {
        const totalCells = 25;
        const zombieCount = 3;

        for (let i = 0; i < kattTotal; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * totalCells);
            } while (cells[randomIndex].classList.contains("zombie") || cells[randomIndex].classList.contains("katt"));

            cells[randomIndex].classList.add("katt");
        }

        for (let i = 0; i < zombieCount; i++) {
            let randomIndex = Math.floor(Math.random() * totalCells);
            cells[randomIndex].classList.add("zombie");
            zombiePositions.push(randomIndex);
        }
    }
    //Hanterar zombie-rörelser
    function moveZombies() {
        zombiePositions.forEach(zombieIndex => {
            cells[zombieIndex].classList.remove("zombie");

            const zombieRow = Math.floor(zombieIndex / 5);
            const zombieCol = zombieIndex % 5;
            const playerRow = Math.floor(currentPlayerPosition / 5);
            const playerCol = currentPlayerPosition % 5;

            const rowDiff = playerRow - zombieRow;
            const colDiff = playerCol - zombieCol;

            let newRow = zombieRow;
            let newCol = zombieCol;
            if (Math.abs(rowDiff) > Math.abs(colDiff)) {
                newRow += Math.sign(rowDiff);
            } else {
                newCol += Math.sign(colDiff);
            }

            if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                const newIndex = newRow * 5 + newCol;
                cells[newIndex].classList.add("zombie");
                zombiePositions[zombiePositions.indexOf(zombieIndex)] = newIndex;
            } else {
                cells[zombieIndex].classList.add("zombie");
            }
        });
    }
    //Placera ut spelare, skapa spelplanen och placera ut katter och zombies
    let currentPlayerPosition = createGameBoard();
    const cells = document.querySelectorAll(".cell");
    cells[currentPlayerPosition].classList.add("current-player");
    placeEntitiesRandomly();

    let buttonPressCount = 0;

    //Spelarens rörelser
    function movePlayer(direction) {
        cells[currentPlayerPosition].classList.remove("current-player");

        switch(direction) {
            case "up":
                if (currentPlayerPosition >= 5) {
                    currentPlayerPosition -= 5;
                }
                break;
            case "down":
                if (currentPlayerPosition < 20) {
                    currentPlayerPosition += 5;
                }
                break;
            case "left":
                if (currentPlayerPosition % 5 !== 0) {
                    currentPlayerPosition -= 1;
                }
                break;
            case "right":
                if ((currentPlayerPosition + 1) % 5 !== 0) {
                    currentPlayerPosition += 1;
                }
                break;
        }

        cells[currentPlayerPosition].classList.add("current-player");

        buttonPressCount++;

        if (buttonPressCount % 10 === 0) {
            moveKatts();
        } else if (buttonPressCount % 3 === 0) {
            moveZombies();
        }

        checkForEntity(currentPlayerPosition);
        updateLocationImage(currentPlayerPosition); // Uppdatera bild baserat på plats
    }
    //Katternas rörelser
    function moveKatts() {
        // Endast placera ut nya katter när spelet startar om
        if (buttonPressCount === 0) {
            const totalCells = 25;
    
            // Placera ut nya katter
            for (let i = 0; i < kattTotal; i++) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * totalCells);
                } while (cells[randomIndex].classList.contains("zombie") || cells[randomIndex].classList.contains("katt"));
    
                cells[randomIndex].classList.add("katt");

                
            }
        }
    }
    //Kollar om katt eller zombie finns på rutan
    function checkForEntity(position) {
        if (cells[position].classList.contains("katt")) {
            alert("YES, du har hittat en katt!");
            kattFound++;
            document.getElementById("katt-found").textContent = kattFound;
            // Ta bort katten från spelplanen
            cells[position].classList.remove("katt");
            if (kattFound === kattTotal) {
                alert("Grattis! Du har hittat alla katter!");
                resetGame();
            }
             //Uppdaterar bucket list-raden                  
            fetchBucketList();

        } else if (cells[position].classList.contains("zombie")) {
            alert("Skit, du blev biten av en zombie!");
            resetGame();
        }


    }
    //Nollställer spelet
    function resetGame() {
        for (let cell of cells) {
            cell.classList.remove("katt", "zombie", "current-player");
        }
        placeEntitiesRandomly();
        currentPlayerPosition = 0;
        cells[currentPlayerPosition].classList.add("current-player");
        buttonPressCount = 0;
        kattFound = 0;
        document.getElementById("katt-found").textContent = kattFound;
        currentLocationImage = "images/index.jpg"; // Återgå till indexbilden
        updateLocationImage(currentPlayerPosition); // Uppdatera bild när spelet nollställs

        

    }
    //Spelarens rörelser
    const upButton = document.getElementById("up-button");
    const downButton = document.getElementById("down-button");
    const leftButton = document.getElementById("left-button");
    const rightButton = document.getElementById("right-button");

    upButton.addEventListener("click", () => movePlayer("up"));
    downButton.addEventListener("click", () => movePlayer("down"));
    leftButton.addEventListener("click", () => movePlayer("left"));
    rightButton.addEventListener("click", () => movePlayer("right"));

    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", resetGame);
    //Bestämmer bild för varje plats
    function updateLocationImage(position) {
        const locationImage = document.getElementById("location-image");
        if (position < locationImages.length) { // Kontrollera om positionen är inom räckvidd för locationImages
            currentLocationImage = locationImages[position];
        }
        locationImage.src = currentLocationImage;
    }

    updateLocationImage(currentPlayerPosition);

 
    
});