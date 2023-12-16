// Listen for logout button click
const logout_btn = document.getElementById('logout-btn');
logout_btn.addEventListener('click', (e) => {
    // Change to home page
    window.location.href = '/logout';
});

// Listen for user exiting instruction page
const instructions_close_btn = document.getElementById('instructions-close-btn');
instructions_close_btn.addEventListener('click', (e) => {
    // Set the instructions container to not display
    document.getElementById('instructions-container').style.display = 'none';

    // Set the game container to display
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('game-container').style.flexDirection = 'column';
});
// Add this for no input on instuction page
document.getElementById('game-container').style.display = 'none';


// Game Section

// Game Board
var daily_word = '';
var daily_word_len = 0;
var guesses_remaining = daily_word_len;
var current_guess = [];
var next_letter = 0;

// Get the daily word
jQuery.ajax({
    url: "/getDailyWord",
    type: "GET",
    dataType: 'json',
    success:function(returned_data){
        // Get daily word
        daily_word = returned_data['success'];
        daily_word_len = daily_word.length;

        // Init guesses remaining with word length
        guesses_remaining = daily_word_len;

        // Initialize game board
        initializeGameBoard();
    }
});
// Make the game board according to size of daily word
const initializeGameBoard = function() {
    // Grab game board
    var board = document.getElementById('game-board');

    // Make board
    for (let i = 0; i < daily_word_len; i++) {
        // Make row element
        var row = document.createElement('div');
        row.className = 'game-board-row';

        // Populate row element
        for (let j = 0; j < daily_word_len; j++) {
            // Create box & add to row
            var box = document.createElement('div');
            box.className = 'game-board-box';
            row.appendChild(box);
        }

        // Add row to board
        board.appendChild(row);
    }
};


// Keyboard
var key_codes = [81,87,69,82,84,89,85,73,79,80,
                  65,83,68,70,71,72,74,75,76,
                  13,90,88,67,86,66,78,77,8];

// Gives physical keyboard functionality
document.addEventListener('keyup', (e) => {
    // Get pressed key as string
    var key_pressed = String(e.key);

    // Don't input physical keys if user is still on instructions
    if (document.getElementById('game-container').style.display === 'none') {
        return
    }

    // Don't input if at end of row OR if not a valid key
    if (guesses_remaining === 0 || !key_codes.includes(e.keyCode)) {
        return
    }

    // Remove letter from board if user presses backspace
    if (key_pressed === 'Backspace' && next_letter !== 0) {
        removeLetter();
        return
    }

    // Validate guess if enter is pressed
    if (key_pressed === 'Enter') {
        validateGuess();
        return
    }

    // Insert letter into game board
    if (key_pressed !== 'Backspace') {
        insertLetter(key_pressed);
    }
});
// Gives on screen keyboard functionality
var keyboard = document.getElementById('keyboard');
keyboard.addEventListener('click', (e) => {
    // If click was NOT on a key, do nothing
    if (!e.target.classList.contains('key')) {
        return
    }

    // Get key
    let key_clicked = e.target.textContent;
    if (key_clicked === 'del') {
        key_clicked = 'backspace'; 
    }

    // Don't input if at end of row
    if (guesses_remaining === 0) {
        return
    }

    // Remove letter from board if user presses backspace
    if (key_clicked === 'backspace' && next_letter !== 0) {
        removeLetter();
        return
    }

    // Validate guess if enter is pressed
    if (key_clicked === 'enter') {
        validateGuess();
        return
    }

    // Insert letter into game board
    if (key_clicked !== 'backspace') {
        insertLetter(key_clicked);
    }
});
// Inserts letter into appropriate row/box
const insertLetter = function(key_pressed) {
    // Don't insert if at end of row
    if (next_letter === daily_word_len+1) {
        return
    }

    // Find current row & box
    let insert_row = document.getElementsByClassName('game-board-row')[daily_word_len - guesses_remaining];
    let insert_box = insert_row.children[next_letter];

    // Give box animation
    insert_box.style.transform = "scale(.90, .90)";
    setTimeout(() => {
        insert_box.style.transform = "scale(1, 1)";
    }, 80);

    // Insert letter into box & make box look filled
    insert_box.textContent = key_pressed.toUpperCase();
    insert_box.classList.add('filled-box');
    
    // Insert letter into the user's current guess "string"
    current_guess.push(key_pressed);

    // To the next letter
    next_letter += 1;
};
// Removes letter from appropriate row/box
const removeLetter = function() {
    // Find current row & box
    let insert_row = document.getElementsByClassName('game-board-row')[daily_word_len - guesses_remaining];
    let insert_box = insert_row.children[next_letter - 1];

    // Give box animation
    insert_box.style.transform = "scale(.90, .90)";
    setTimeout(() => {
        insert_box.style.transform = "scale(1, 1)";
    }, 80);

    // Remove box content and class to make it look filled
    insert_box.textContent = '';
    insert_box.classList.remove('filled-box');

    // Remove latest char from current guess "string"
    current_guess.pop();

    // One letter back
    next_letter -= 1;
};
// Validates the user's guess of the daily word
const validateGuess = function() {
    // Find current row and construct user's guess string
    var row = document.getElementsByClassName('game-board-row')[daily_word_len - guesses_remaining];
    var guess = '';
    for (const ele of current_guess) {
        guess += ele;
    }
    // Array to accuratly track guessed letters
    var daily_word_arr = Array.from(daily_word);


    // Check if user's guess is long enough
    if (guess.length != daily_word_len) {
        console.log('Not enough letters!');
        return
    }

    // Check if user submitted an english word via wordsAPI
    const wordsAPI = {
        async: true,
        crossDomain: true,
        url: 'https://wordsapiv1.p.rapidapi.com/words/' + guess,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '7f603965e3msh3909a841b21a408p11d765jsn4345f3d0b5b7',
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
    };
    $.ajax(wordsAPI).done(function(response) {
        if (response != {}) {
            // Shade the board if guess was valid
            shadeBoard(row, daily_word_arr, guess);
        }
        return
    });
};
// Shades the game board boxes according to the daily word
const shadeBoard = function(row, daily_word_arr, guess) {
    // If valid input, shade the board accordingly
    for (let i = 0; i < daily_word_len; i++) {
        // Get box
        let box = row.children[i];
        // Get letter from user's current guess
        let letter = current_guess[i];
        // Init the letter color var
        let letter_color = '';
        
        // Get index of current letter in correct word
        let letter_position = daily_word_arr.indexOf(current_guess[i]);
        if (letter_position === -1) {
            // User letter not in daily word
            letter_color = '#3a3a3c';
        } 
        else {
            // Letter is definitly in word
            if (current_guess[i] === daily_word_arr[i]) {
                letter_color = '#538d4e'; // Make box green if user letter in correct pos
            } else {
                letter_color = '#b59f3b'; // Make box yellow if user letter in word at wrong pos
            }
        }

        // Add hashtag to daily word array for checking repeated letters
        daily_word_arr[letter_position] = "#";

        // Set color of box and correleating key's box
        box.style.backgroundColor = letter_color;
        box.style.borderColor = letter_color;
        shadeKeys(letter, letter_color, daily_word_arr);
    }

    // Pull up leaderboard if user guessed the word, if not continue or end game
    if (guess === daily_word) {
        // Display the leaderboard
        jQuery.ajax({
            url: "/endGame",       
            data: {"daily_score" : (daily_word_len - (guesses_remaining-1))}, // Calculate the user's score
            type: "POST",
            success:function(returned_data){
                setTimeout(() => {
                    // Go to leaderboard
                    window.location.href = '/leaderboard';
                }, 1000);
            }
        });

        return
    } else {
        // Take a guess away and reset guess variables
        guesses_remaining -= 1;
        current_guess = [];
        next_letter = 0;

        // User has no more guesses remaining
        if (guesses_remaining === 0) {
            // Display the leaderboard
            jQuery.ajax({
                url: "/endGame",
                data: {"daily_score" : -1}, // <- Set user to have -1 score (and not display on leaderboard)
                type: "POST",
                success:function(returned_data){
                    setTimeout(() => {
                        // Go to leaderboard
                        window.location.href = '/leaderboard';
                    }, 500);
                }
            });
        }

        return
    }
};
// Shades they keys of the on-screen keyboard according to the daily word
const shadeKeys = function(letter, new_color) {
    for (const key of document.getElementsByClassName('key')) {
        // Find the key corresponding to letter
        if (key.textContent === letter) {
            // Check the old color to see if used yet
            let old_color = key.style.backgroundColor; // <- Must use rgb values for checking to be accurate
            if (old_color === 'rgb(83, 141, 78)') { 
                return
            }
            if (old_color === 'rgb(181, 159, 59)' && new_color !== '#538d4e') { 
                return
            }

            // Change color of key
            key.style.backgroundColor = new_color;
            key.style.borderColor = new_color;
            break
        }
    }
};