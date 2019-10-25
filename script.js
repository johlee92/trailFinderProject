'use strict';

const hikeApiKey = '200617597-4e2d534eabe1d5e6fa00f6f2ced20184';
const googleApiKey = 'AIzaSyAbECAb48REfQsdVoXir49X8MEo7PYieSs';

function formListener() {
    $(".js-form").on('submit',function(event){
        event.preventDefault();
        let enteredAddress = $("#search-address").val();
        console.log(`User entered this address: ${enteredAddress}.`);
        
        //this section needs to be updated to be more dynamic
        getGooglePlaceID(enteredAddress);
    });
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

//returns hikes based on the lat and lon inputs
function getHikes(latVal = 39.75, lonVal = -105.00, maxMilesAway = 100){
    console.log('start get hikes function');
    const searchUrl = 'https://www.hikingproject.com/data/get-trails'

    //other params to consider for HikingAPI are maxResults (currently default at 10), sort (default of quality), etc.
    const params = {
        lat: latVal,
        lon: lonVal,
        maxDistance: maxMilesAway,
        key: hikeApiKey
    };
    console.log(params);

    const queryString = formatQueryParams(params)
    const url = searchUrl + '?' + queryString;
    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson);
            resultsModification(responseJson);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function resultsModification(hikingRawResults) {
    console.log('start result modifiction function');
    let hikingObj = hikingRawResults.trails.slice();
    displayResults(hikingObj);
}

//returns the object with predictions of results from google place ID search
function getGooglePlaceID(userInput) {
    console.log('start get google place ID function');
    //potential firewall situation with using a work laptop. Still need to determine the why
    const proxyurl = "https://cors-anywhere.herokuapp.com/"
    const searchUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'

    const params = {
        input: userInput,
        key: googleApiKey
    };
    // console.log(params);

    const queryString = formatQueryParams(params)
    const url = searchUrl + '?' + queryString;
    // console.log(proxyurl + url);

    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                console.log('response ok')
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson);
            console.log(responseJson.predictions[0].place_id);
            let googleAddressPlaceID = responseJson.predictions[0].place_id;
            getLatlng(googleAddressPlaceID);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//returns the lat and lon values based on the place ID input
function getLatlng(placeIdInput) {
    console.log('start get lat lng function');
    //potential firewall situation with using a work laptop. Still need to determine the why
    const proxyurl = "https://cors-anywhere.herokuapp.com/"
    const searchUrl = 'https://maps.googleapis.com/maps/api/geocode/json'

    const params = {
        place_id: placeIdInput,
        key: googleApiKey
    };
    // console.log(params);

    const queryString = formatQueryParams(params)
    const url = searchUrl + '?' + queryString;
    // console.log(proxyurl + url);

    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson);
            let locationLat = responseJson.results[0].geometry.location.lat;
            let locationLon = responseJson.results[0].geometry.location.lng;
            console.log(`top result lat: ${locationLat} and lon: ${locationLon}`);
            let latlonArray = [locationLat, locationLon];
            getHikes(latlonArray[0], latlonArray[1]);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });

}

function displayResults(responseObj) {
    console.log('display results function');
    $('.search-results').empty();
    $('.search-results').removeClass('hidden');

    //toggle the js-form to be in the middle of the page to the top of the page when there's content
    // $('.js-form').toggleClass('hidden');

    //need to change this to make it more dynamic when we get there
    for (let i = 0; i < responseObj.length; i++) {
        $('.search-results').append(
            `<div class="project-card">
                <img src='${responseObj[i].imgMedium}' alt="trail picture" width=100%>
                <section class="project-card-description">
                    <h3>${responseObj[i].name}</h3>
                    <h4>${responseObj[i].location}</h4>
                    <p>Est. Time Commitment: </p>
                    <section class="project-card-buttons">
                        <a href="${responseObj[i].url}" target="_blank"><button type="button" class="view-hike">View Hike</button></a>
                    </section>
                </section>
            </div>`
        );
    };
}

function handlePage() {
    console.log('start handle page function');
    formListener();
}

$(handlePage);