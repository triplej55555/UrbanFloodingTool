     // Prompt the user for a password
        var password = prompt("Enter the password:");

        // Check if the entered password matches
        if (password !== "GEODV5!") {
            document.body.innerHTML = "Unauthorized Access!";
                document.body.style.display = "none";
        } else {
            // If the password is correct, show the content
            document.body.style.display = "block";
        }
