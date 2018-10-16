// Read and set any environment variables with the dotenv package
require("dotenv").config();

// Import the keys.js file and store it in a variable.
// Using the require keyword lets us access all of the exports
// in our keys.js file using the 'require' keyword.
const keys = require("./keys.js");

// Aquire moment
const moment = require('moment');

// request is an NPM Package for making http calls
// We will use request to grab data from the OMDB API and the Bands In Town API
const request = require('request');

// node-spotify-api is an NPM Package for the Spotify REST API
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);

// Load the fs package to read and write
const fs = require("fs");


// =======================================================================
// Basic Nope Application
// =======================================================================

// Drop the first 2 (e.g. node & filename)
process.argv.splice(0, 2);

const command = process.argv.shift();

// Get all elemets in the current process.argv, starting from index 1 to the emd
// Join them into a string to get the space delimited search query 
const searchQuery = process.argv.join(" ");

switch (command) {
  case "concert-this":
    concertThis(searchQuery);
    break;
  case "spotify-this-song":
    spotifyThisSong(searchQuery)
    break;
  case "movie-this":
    movieThis(searchQuery);
    break;
  case "do-what-it-says":
    doWhatItSay();
    break;
  case "my-tweets":
    // code block
    break;
  default:
    // code block
    break;
}

// Create initial variable 'result' to hold data for appending to 'log.txt'
let result;

// =======================================================================
// Handle 'concert-this <artist/band name here>' command
// =======================================================================
function concertThis(searchQuery) {

  let artistname = searchQuery;
  console.log("artistname:", artistname);

  // Search the Bands in Town Artist Events API
  const bandsInTownQueryURL = "https://rest.bandsintown.com/artists/" + artistname + "/events?app_id=codingbootcamp";
  console.log("------------------------------\nURL: " + bandsInTownQueryURL + "\n------------------------------");

  // Basic Node application for requesting data from the Bandsintown website
  request(bandsInTownQueryURL, function (error, response, body) {

    // If the request is successful
    if (!error && response.statusCode === 200) {

      // Parse the body of the site
      // And display only the top search result
      var concert = JSON.parse(body)[0];

      // Build formatted 'concertResult' information to display
      let concertResult = "";

      concertResult += "=========================================================\n";
      concertResult += "Showing result for 'concert-this' " + artistname + "\n";
      concertResult += "---------------------------------------------------------\n";

      if (concert.lineup) {
        concertResult += "Lineup: " + concert.lineup + "\n";
      }

      if (concert.venue) {
        concertResult += "Name of the Venue: " + concert.venue.name + "\n";
        concertResult += "Venue Location: " + concert.venue.city + ", " + concert.venue.region + ", " + concert.venue.country + "\n";
      }

      if (concert.datetime) {
        var concertDateTime = moment(concert.datetime).format("dddd, MMMM Do YYYY, h:mm:ss a");
        concertResult += "Date of the Event: " + concertDateTime + "\n";
      }

      concertResult += "=========================================================\n";
      concertResult += "\r\n\r\n\r\n";

      // Output the formatted information to the user's terminal/bash window
      /* console.log(concertResult); */

      // Output the formatted data to log.txt
      appendLog(concertResult);
    }

  });
  

};

// =======================================================================
// Handle 'spotify-this-song <song name here>' command
// =======================================================================
function spotifyThisSong(searchQuery) {
  let songTitle;

  if (searchQuery.length > 0) {
    songTitle = searchQuery;
    console.log("songTitle: ", songTitle);
  } else {
    songTitle = 'The Sign Ace of Base'
    console.log('No song is provided. The program will default to "The Sign" by Ace of Base.');
  }

  // Use .search to find an artist, album, or track.
  spotify.search({ type: 'track', query: searchQuery }, function (error, data) {

    if (!error) {
      let song = data.tracks.items[0];

      // Build formatted 'songResult' to display
      let songResult = "";

      songResult += "=========================================================\n";
      songResult += "Showing result for 'spotify-this-song' " + songTitle + "\n";
      songResult += "---------------------------------------------------------\n";

      if (song.artists) {
        songResult += "Artist(s): " + song.artists[0].name + "\n";
      }

      if (song.name) {
        songResult += "Song's name: " + song.name + "\n";
      }

      if (song.preview_url !== null) {
        songResult += "A preview link of this song form Spotify: " + song.preview_url + "\n";
      } else if (song.preview_url === null) {
        songResult += "A preview link of this song form Spotify is not avaialble.\n";
      }

      if (song.album.name) {
        songResult += "Album: " + song.album.name + " (Released date: " + song.album.release_date + ")\n";
      }

      songResult += "=========================================================\n";
      songResult += "\r\n\r\n\r\n";

      // Output the formatted information to the user's terminal/bash window
      /* console.log(songResult); */

      // Output the formatted data to log.txt
      appendLog(songResult);


    } else {
      return console.log('Error occurred: ' + err);
    }

  });
}

// =======================================================================
// Handle 'movie-this <movie name here>' command
// =======================================================================
function movieThis(searchQuery) {

  let movieTitle;

  if (searchQuery.length > 0) {
    movieTitle = searchQuery
    console.log("movieTitle: ", movieTitle);
  } else {
    movieTitle = 'Mr. Nobody'
    console.log("The user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'")
  }

  // Search the Bands in Town Artist Events API
  const omdbQueryURL = "http://www.omdbapi.com/?apikey=a91775cc&t=" + movieTitle + "&plot=short&r=json&type=movie";
  console.log("------------------------------\nURL: " + omdbQueryURL + "\n------------------------------");

  // Basic Node application for requesting data from the Bandsintown website
  request(omdbQueryURL, function (error, response, body) {

    // If the request is successful
    if (!error && response.statusCode === 200) {

      // Parse the body of the site and save to 'movie' variable
      var movie = JSON.parse(body);

      // Build formatted 'concertResult' to display
      let movieResult = "";

      movieResult += "=========================================================\n";
      movieResult += "Showing result for 'movie-this' " + movieTitle + "\n";
      movieResult += "---------------------------------------------------------\n";

      if (movie.Title) {
        movieResult += "Title of the Movie: " + movie.Title + "\n";
      }

      if (movie.Year) {
        movieResult += "Year the Movie Came Out: " + movie.Year + "\n";
      }

      if (movie.imdbRating) {
        movieResult += "IMDB Rating of the Movie: " + movie.imdbRating + "\n";
      }

      if (movie.Ratings[1].source === "Rotten Tomatoes") {
        movieResult += "Rotten Tomatoes Rating of the Movie: " + movie.Ratings[1] + "\n";
      }

      if (movie.Country) {
        movieResult += "Country Where the Movie Was Produced: " + movie.Country + "\n";
      }

      if (movie.Language) {
        movieResult += "Language of the Movie: " + movie.Language + "\n";
      }

      if (movie.Plot) {
        movieResult += 'Plot of the Movie: "' + movie.Plot + '"\n';
      }

      if (movie.Actors) {
        movieResult += "Actors in the Movie: " + movie.Actors + "\n";
      }

      movieResult += "=========================================================\n";
      movieResult += "\r\n\r\n\r\n";

      // Output the formatted information to the user's terminal/bash window
      /* console.log(movieResult); */

      // Output the formatted data to log.txt
      appendLog(movieResult);

    }

  });

}

// =======================================================================
// Handle 'do-what-it-say' command
// =======================================================================
function doWhatItSay() {

  // Using the fs Node package
  // LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
  // We will read the existing 'random.txt' file
  // It's important to include the "utf8" parameter or the code will provide stream data (garbage)
  // The code will store the contents of the reading inside the variable "data"
  fs.readFile("random.txt", "utf8", function (error, data) {
    if (error) {
      return console.log('Error occurred: ' + error);
    }

    // Break the string down by comma separation and store the contents into the output array
    // Re-display the content as an array for later use
    const output = data.split(",");

    // Loop Through the newly created output array
    for (var i = 0; i < output.length; i++) {

      // Print each element (item) of the array/
      console.log(output[i]);
    }

    let commandDoWhatItSay = output[0];
    let searchQueryDoWhatItSay = output[1];

    switch (commandDoWhatItSay) {
      case "concert-this":
        concertThis(searchQueryDoWhatItSay);
        break;
      case "spotify-this-song":
        spotifyThisSong(searchQueryDoWhatItSay)
        break;
      case "movie-this":
        movieThis(searchQueryDoWhatItSay);
        break;
      case "do-what-it-says":
        doWhatItSay();
        break;
      case "my-tweets":
        // code block
        break;
      default:
        // code block
        break;
    }




  })

}

// =======================================================================
// Output the formatted result to a .txt file called log.txt
// =======================================================================
function appendLog(result) {

    // Using the fs Node package
    // Use the .appendFile function to append each command the user runs to the log.txt file
    // The first parameter is the name of the text file to save to
    // The second parameter is the data we want to write as a string
    // The third parameter is the callback function to be called when appendFile is finished
    // For more info, see the docs: https://nodejs.org/api/fs.html#fs_fs_appendfile_path_data_options_callback
    fs.appendFile("log.txt", result, function (error) {
      // If there was an error, we log it and return immediately
      if (error) {
        return console.log(err);
      }
      
      // log that we saved the info successfully. we know that
      // because no error was encountered, or we would have returned above
      console.log("\nThe output data is saved.\n------------------------------");

    });
}