$(function() {

    var map = initializeMap();
    var $addItemButton = $('#options-panel').find('button');

    var $listGroups = {
        hotel: $('#hotel-list').children('ul'),
        restaurant: $('#restaurant-list').children('ul'),
        activity: $('#activity-list').children('ul')
    };


    var collections = {};

    $.ajax({
            method: 'GET',
            url: '/api/attractions'
        })
        .then(function(response) {
            collections.hotel = response.hotels;
            collections.restaurant = response.restaurants;
            collections.activity = response.activities;
            return collections;
        })
        .then(function(collections) {
            fillInOptions(collections.hotel, $('#hotel-choices'));
            fillInOptions(collections.restaurant, $('#restaurant-choices'));
            fillInOptions(collections.activity, $('#activity-choices'));
        })
        .fail(function(error) {
            console.log(error);
        });

var currentDayNum;
   var jaxAddDay = function (input){
        $.ajax({
                method: 'POST',
                url: '/api/days',
                dataType:'json',
                data: {answer:input}
            })
        .then(function(createdDay){
            days.push(createdDay)
            currentDayNum = days.length
            console.log("jaxAddDay" , days.length)
            return createdDay
        })
        .then (function (){
            switchDay(days.length)
        })


    };

    var days = []

    $.ajax({
            method: 'GET',
            url: '/api/days'
        })
        .then(function(found) {
            console.log(found)
            days.push(found)
            return found;
        })
        .then(function(found){
            found.forEach(function(item){
                
                $(".day-buttons").append('<button class= "btn btn-circle day-btn current-day">'+ item.number + '</button>');
            })
        })

   var jaxAddId = function(dayId, itemId){
    $.ajax({
            method: "PUT",
            url: '/api/days',
            dataType: "json",
            data:{
                dayId: dayId,
                itemId: itemId
            }
        })//

   }


    var $itinerary = $('#itinerary');
    var $addDayButton = $('#day-add');
    var $dayTitle = $('#day-title').children('span');
    var $removeDayButton = $('#day-title').children('button');
    var $dayButtonList = $('.day-buttons');





    /*
    --------------------------
    END VARIABLE DECLARATIONS
    --------------------------
     */

    $addItemButton.on('click', function() {

        var $this = $(this);
        var $select = $this.siblings('select');
        var sectionName = $select.attr('data-type');
        console.log(sectionName);
        var itemId = parseInt($select.val(), 10);
        console.log(itemId);
        console.log(currentDayNum);
        jaxAddId(itemId, currentDayNum);

        var $list = $listGroups[sectionName];
        var collection = collections[sectionName];
        var item = findInCollection(collection, itemId);

        var marker = drawMarker(map, sectionName, item.place.location);

        $list.append(create$item(item));

         
        days[currentDayNum - 1].push({
            item: item,
            marker: marker,
            type: sectionName
        });

        mapFit();

    });

    $itinerary.on('click', 'button.remove', function() {

        var $this = $(this);
        var $item = $this.parent();
        var itemName = $item.children('span').text();
        var day = days[currentDayNum - 1];
        var indexOfItemOnDay = findIndexOnDay(day, itemName);
        var itemOnDay = day.splice(indexOfItemOnDay, 1)[0];

        itemOnDay.marker.setMap(null);
        $item.remove();

        mapFit();

    });


    $addDayButton.on('click', function() {
        var newDayNum = days.length ;
             jaxAddDay(newDayNum)
        var $newDayButton = createDayButton(newDayNum);
        $addDayButton.before($newDayButton);
        switchDay(newDayNum);

            });

    $dayButtonList.on('click', '.day-btn', function() {
        var dayNumberFromButton = parseInt($(this).text(), 10);
        switchDay(dayNumberFromButton);
    });

    $removeDayButton.on('click', function() {

        wipeDay();
        days.splice(currentDayNum - 1, 1);

        if (days.length === 0) {
            days.push([]);
        }

        reRenderDayButtons();
        switchDay(1);

    });

    // fillInOptions(hotels, $('#hotel-choices'));
    // fillInOptions(restaurants, $('#restaurant-choices'));
    // fillInOptions(activities, $('#activity-choices'));

    /*
    --------------------------
    END NORMAL LOGIC
    --------------------------
     */

    // Create element functions ----

    function create$item(item) {

        var $div = $('<div />');
        var $span = $('<span />').text(item.name);
        var $removeButton = $('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        $div.append($span).append($removeButton);

        return $div;

    }

    function createDayButton(number) {
        return $('<button class="btn btn-circle day-btn">' + number + '</button>');
    }

    // End create element functions ----

    function fillInOptions(collection, $selectElement) {
        collection.forEach(function(item) {
            $selectElement.append('<option value="' + item.id + '">' + item.name + '</option>');
        });
    }

    function switchDay(dayNum) {
        console.log("daynum", dayNum)
        //wipeDay();
        currentDayNum = dayNum;
        renderDay();
        $dayTitle.text('Day ' + dayNum);
        mapFit();
    }

    function renderDay() {

        var currentDay = days[currentDayNum - 1];

        $dayButtonList
            .children('button')
            .eq(currentDayNum - 1)
            .addClass('current-day');
console.log("currentdayNum", currentDayNum, "days array", days, "currentDay = ", currentDay)

            currentDay.forEach(function(attraction) {
            var $listToAddTo = $listGroups[attraction.type];
            $listToAddTo.append(create$item(attraction.item));
            attraction.marker.setMap(map);
        });

    }

    // function wipeDay() {

    //     $dayButtonList.children('button').removeClass('current-day');

    //     Object.keys($listGroups).forEach(function(key) {
    //         $listGroups[key].empty();
    //     });

    //     if (days[currentDayNum - 1]) {
    //         days[currentDayNum - 1].forEach(function(attraction) {
    //             attraction.marker.setMap(null);
    //         });
    //     }

    // }

    function reRenderDayButtons() {

        var numberOfDays = days.length;

        $dayButtonList.children('button').not($addDayButton).remove();

        for (var i = 0; i < numberOfDays; i++) {
            $addDayButton.before(createDayButton(i + 1));
        }

    }

    function mapFit() {

        var currentDay = days[currentDayNum - 1];
        var bounds = new google.maps.LatLngBounds();

        currentDay.forEach(function(attraction) {
            bounds.extend(attraction.marker.position);
        });

        map.fitBounds(bounds);

    }

    // Utility functions ------

    function findInCollection(collection, id) {
        return collection.filter(function(item) {
            return item.id === id;
        })[0];
    }

    function findIndexOnDay(day, itemName) {
        for (var i = 0; i < day.length; i++) {
            if (day[i].item.name === itemName) {
                return i;
            }
        }
        return -1;
    }

    // End utility functions ----


});
