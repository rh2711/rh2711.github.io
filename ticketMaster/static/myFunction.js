var inp = document.getElementById("LocationBox");
var googleResp;
var ipiResp;
var data;
var keyW;

var sortAscEvnt = false;
var sortAscGen = false;
var sortAscVen = false;

var map = {};

function removeInput(){
    var box = document.getElementById("cbox");
    var parent = document.getElementById("form1");
    var bef = document.getElementById("outerEndButton");

    if (box.checked == true){
        parent.removeChild(inp);
    }
    else{
        parent.insertBefore(inp, bef);
    }
}

function clearFunc(){
    document.getElementById("keywordBox").value = "";
    document.getElementById("CategoryBox").value = "Default";
    document.getElementById("DistanceBox").value = "";
    if (document.getElementById("cbox").checked == true){
        document.getElementById("cbox").checked = false;
        document.getElementById("form1").insertBefore(inp, document.getElementById("outerEndButton"));
    }
    else{
        document.getElementById("LocationBox").value = "";
    }

    if (document.getElementById("dataTable") != null){
        document.getElementById("body").removeChild(document.getElementById("dataTable"));
    }

    if (document.getElementById("blank") != null){
        document.getElementById("body").removeChild(document.getElementById("blank"));
    }

    if (document.getElementById("evntDetBox")!= null){
        document.getElementById("body").removeChild(document.getElementById("evntDetBox"));
    }

    if (document.getElementById("venDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDiv"));
    }

    if (document.getElementById("venDetDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDetDiv"));
    }
}

async function searchFuncOnClick(){

    if (document.getElementById("dataTable") != null){
        document.getElementById("body").removeChild(document.getElementById("dataTable"));
    }

    if (document.getElementById("blank") != null){
        document.getElementById("body").removeChild(document.getElementById("blank"));
    }

    if (document.getElementById("evntDetBox")!= null){
        document.getElementById("body").removeChild(document.getElementById("evntDetBox"));
    }

    if (document.getElementById("venDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDiv"));
    }

    if (document.getElementById("venDetDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDetDiv"));
    }

    console.log("In Search Func!");

    f = document.getElementById("form1");
    f.reportValidity();

    if (document.getElementById("keywordBox").value == ""){
        console.log("HELLO");
        console.log(document.getElementById("keywordBox").checkValidity());
    }

    else{

        var lat = null;
        var lng = null;
        var dist = "10";
        var cat = null;

        if (document.getElementById("DistanceBox").value != ""){
            dist = document.getElementById("DistanceBox").value;
        }

        keyW = document.getElementById("keywordBox").value;
        keyW = keyW.replace(/ /g,"+");
        // console.log(keyW);

        if (document.getElementById("cbox").checked == false){
            google_api_key = "AIzaSyCTgbjx_lPe6xICfJ6p2WDiICP8J3AHn9Q"
            loc = document.getElementById("LocationBox").value
            loc = loc.replace(/ /g,"+");
            googleResp = await axios.get("https://maps.googleapis.com/maps/api/geocode/json"+`?address=${loc}&key=${google_api_key}`);
            
            console.log("googleRes: "+googleResp);
            if (googleResp["data"]["results"].length != 0){
                lat = googleResp["data"]["results"][0]["geometry"]["location"]["lat"].toString();
                lng = googleResp["data"]["results"][0]["geometry"]["location"]["lng"].toString();
            }

            else{
                var blank = document.createElement("div");
                blank.setAttribute("id","blank");
                var txt = document.createTextNode("No Records found");
                blank.appendChild(txt);
                document.body.appendChild(blank);

                return;
            }
            
        }
        else{
            ipiKey = "7c2dda37d14440"
            ipiResp = await axios.get("https://ipinfo.io/"+`?token=${ipiKey}`)
            var locSplitArr = ipiResp["data"]["loc"].split(",")
            // console.log(locSplitArr)
            lat = locSplitArr[0]
            lng = locSplitArr[1]
        }
        cat = document.getElementById("CategoryBox").value.toString();
        console.log("cat: "+cat);

        var response = await axios.get("/formdetails"+`?keyword=${keyW}&distance=${dist}&category=${cat}&lat=${lat}&lng=${lng}`);
        data = response.data;
        console.log("data: "+data);

        evntIdMap(data);

        if (JSON.stringify(data) === '{}'){

            var blank = document.createElement("div");
            blank.setAttribute("id","blank");
            var txt = document.createTextNode("No Records found");
            blank.appendChild(txt);
            document.body.appendChild(blank);
        }

        else{
            createTable(data);
        }
    }
}


function createTable(data){

    let tab = document.createElement("table");
    tab.setAttribute("id", "dataTable");

    let thead = tab.createTHead();
    let r = thead.insertRow();

    keys = ["Date", "Icon", "Event", "Genre", "Venue"]

    for (let i=0; i<5; i++){
        let th = document.createElement("th");
        let txt = document.createTextNode(keys[i]);

        th.setAttribute("id", keys[i])

        th.appendChild(txt);
        r.appendChild(th);
    }

    var tbod = tab.createTBody();

    for (let i=0; i<data.length; i++){
        let r = tbod.insertRow();

        for (let j=0; j<5; j++){
            let c = r.insertCell();
            if (j==0){
                let txt1 = document.createTextNode(data[i]["date"]);
                let txt2 = document.createTextNode(data[i]["time"]);
                var br = document.createElement("br");

                c.appendChild(txt1);
                c.appendChild(br);
                c.appendChild(txt2);
            }

            else if (j==1){
                let img = document.createElement("img");
                img.classList.add("tableImg");
                img.setAttribute("src",data[i]["icon"]);
                c.appendChild(img);
            }

            else if (j==2){
                let para = document.createElement("p");
                let txt = document.createTextNode(data[i]["event"]);
                para.classList.add("eventcol");
                para.onclick = function(){displayEventDetails(data[i]["event"])};
                para.appendChild(txt);
                c.appendChild(para);
            }

            else if(j==3){
                let txt = document.createTextNode(data[i]["genre"]);
                c.appendChild(txt);
            }

            else{
                let txt = document.createTextNode(data[i]["venue"]);
                c.appendChild(txt);
            }
        }
    }

    
    document.body.appendChild(tab);

    var eve = document.getElementById("Event");

    if (sortAscEvnt == false){
        eve.onclick = function(){sortTableAsc(2, sortAscEvnt)};
    }
    

    var ven = document.getElementById("Venue");
    ven.onclick = function(){sortTableAsc(4, sortAscVen)};

    var gen = document.getElementById("Genre");
    gen.onclick = function(){sortTableAsc(3, sortAscGen)};
}

function sortTableAsc(idx, sortAsc){

    if (sortAsc == false){
        sortAsc = true;
        if(idx == 2){
            sortAscEvnt = sortAsc;
        }
        else if(idx == 3){
            sortAscGen = sortAsc;
        }
        else{
            sortAscVen = sortAsc;
        }

        var tab, r, sw, x, y, doSw, i;
        tab = document.getElementById("dataTable");
        sw = true;

        while(sw){
            sw = false;
            r = tab.rows;

            for (i=1; i<(r.length-1); i++){
                doSw = false;
                x = r[i].getElementsByTagName("td")[idx];
                
                y = r[i+1].getElementsByTagName("td")[idx];

                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()){
                    doSw = true;
                    break;
                }
            }

            if(doSw){
                r[i].parentNode.insertBefore(r[i+1], r[i]);
                sw = true;
            }
        }
    }

    else{
        sortAsc = false;

        if(idx == 2){
            sortAscEvnt = sortAsc;
        }
        else if(idx == 3){
            sortAscGen = sortAsc;
        }
        else{
            sortAscVen = sortAsc;
        }

        var tab, r, sw, x, y, doSw, i;
        tab = document.getElementById("dataTable");
        sw = true;

        while(sw){
            sw = false;
            r = tab.rows;

            for (i=1; i<(r.length-1); i++){
                doSw = false;
                x = r[i].getElementsByTagName("td")[idx];
                
                y = r[i+1].getElementsByTagName("td")[idx];

                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()){
                    doSw = true;
                    break;
                }
            }

            if(doSw){
                r[i].parentNode.insertBefore(r[i+1], r[i]);
                sw = true;
            }
        }
    }
}

function evntIdMap(data){
    for (let i=0; i<data.length; i++){
        map[data[i]["event"]] = data[i]["id"];
    }
}

async function displayEventDetails(eventName){

    if (document.getElementById("venDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDiv"));
    }

    if (document.getElementById("venDetDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDetDiv"));
    }

    console.log("in evnt detail func!");
    var eventResponse = await axios.get("/eventdetails"+`?id=${map[eventName]}`);
    respData = eventResponse.data;
    console.log("respdata: "+respData);

    var date = "";
    var time = "";
    if (respData["dates"]["start"]["dateTBA"] == false){
        date = respData["dates"]["start"]["localDate"]
    }

    if (respData["dates"]["start"]["timeTBA"] == false){
        time = respData["dates"]["start"]["localTime"]
    } 

    var artists = [];
    var artUrl = [];

    if ("attractions" in respData["_embedded"]){
        if (respData["_embedded"]["attractions"].length > 0){

            for (let i=0; i<(respData["_embedded"]["attractions"].length) ;i++){
                artists.push(respData["_embedded"]["attractions"][i]["name"])
                artUrl.push(respData["_embedded"]["attractions"][i]["url"])
            }
        }
    }

    var ve = "";
    if ("venues" in respData["_embedded"]){
        ve = respData["_embedded"]["venues"][0]["name"]
    }

    var ge = "";
    if ("subGenre" in respData["classifications"][0]){
        ge = ge + respData["classifications"][0]["subGenre"]["name"] + " | "
    }

    if ("genre" in respData["classifications"][0]){
        ge = ge + respData["classifications"][0]["genre"]["name"] + " | "
    }

    if ("segment" in respData["classifications"][0]){
        ge = ge + respData["classifications"][0]["segment"]["name"] + " | "
    }

    if ("subType" in respData["classifications"][0]){
        if (respData["classifications"][0]["subType"]["name"] != "Undefined"){
            ge = ge + respData["classifications"][0]["subType"]["name"] + " | "
        }
    }

    if ("type" in respData["classifications"][0]){
        if (respData["classifications"][0]["type"]["name"] != "Undefined"){
            ge = ge + respData["classifications"][0]["type"]["name"] + " | "
        }
    }

    if (ge.length > 0){
        ge = ge.substring(0,ge.length-3)
    }

    var price = "";
    if ("priceRanges" in respData){
        price = respData['priceRanges'][0]['min'] + " - " + respData['priceRanges'][0]['max'] + " USD";
    }
    console.log(price);

    var ticketStatus = "";
    if ("status" in respData["dates"]){
        ticketStatus = respData["dates"]["status"]["code"]
    }

    var ticketAt = "";
    if ("url" in respData){
        ticketAt = respData["url"]
    }

    var seatMap = "";
    if ("seatmap" in respData){
        seatMap = respData["seatmap"]["staticUrl"]
    }

    if (document.getElementById("evntDetBox")!= null){
        document.body.removeChild(document.getElementById("evntDetBox"));
    }

    evntDetBox = document.createElement("div");
    evntDetBox.setAttribute("id","evntDetBox");

    headerText = document.createElement("p");
    headerText.setAttribute("id","evntHeader");

    tx = document.createTextNode(eventName);
    headerText.appendChild(tx);
    evntDetBox.appendChild(headerText);

    content = document.createElement("div");
    content.setAttribute("id","cont");

    txtContent = document.createElement("div");
    txtContent.setAttribute("id", "txtCont");


    if (date != "" || time != ""){
        date = date + " " + time;
        datePKey = document.createElement("p");
        datePKey.classList.add("key");
        dateKey = document.createTextNode("Date")
        datePKey.appendChild(dateKey);

        datePVal = document.createElement("p");
        datePVal.classList.add("val");
        dateVal = document.createTextNode(date);
        datePVal.appendChild(dateVal);

        txtContent.appendChild(datePKey);
        txtContent.appendChild(datePVal);
    }

    // console.log("artists: ", artists);

    if (artists.length != 0){
        artDiv = document.createElement("div");

        d = document.createElement("div");
        d.classList.add("d");
        a = document.createElement("a");
        a.setAttribute("href",artUrl[0]);
        a.setAttribute("target","_blank");
        a.classList.add("anc");
        a.innerHTML = artists[0];
        d.appendChild(a);

        artDiv.appendChild(d);

        for (let j=1; j<(artists.length); j++){
            d = document.createElement("div");
            d.classList.add("d");
            a = document.createElement("a");
            a.setAttribute("href",artUrl[j]);
            a.setAttribute("target","_blank");
            a.classList.add("anc");
            t = document.createTextNode('\xa0' + "| " + artists[j])
            a.appendChild(t)
            d.appendChild(a)

            artDiv.appendChild(d);
        }

        artPKey = document.createElement("p");
        artPKey.classList.add("key");
        artKey = document.createTextNode("Artist/Team")
        artPKey.appendChild(artKey);

        txtContent.appendChild(artPKey);
        txtContent.appendChild(artDiv);
    }

    if (ve != ""){
        venPKey = document.createElement("p");
        venPKey.classList.add("key");
        venKey = document.createTextNode("Venue")
        venPKey.appendChild(venKey);

        venPVal = document.createElement("p");
        venPVal.classList.add("val");
        venVal = document.createTextNode(ve);
        venPVal.appendChild(venVal);

        txtContent.appendChild(venPKey);
        txtContent.appendChild(venPVal);
    }

    if (ge != ""){
        genPKey = document.createElement("p");
        genPKey.classList.add("key");
        genKey = document.createTextNode("Genre");
        genPKey.appendChild(genKey);

        genPVal = document.createElement("p");
        genPVal.classList.add("val");
        genVal = document.createTextNode(ge);
        genPVal.appendChild(genVal);

        txtContent.appendChild(genPKey);
        txtContent.appendChild(genPVal);
    }

    if (price != ""){
        pricePKey = document.createElement("p");
        pricePKey.classList.add("key");
        priceKey = document.createTextNode("Price Ranges");
        pricePKey.appendChild(priceKey);

        pricePVal = document.createElement("p");
        pricePVal.classList.add("val");
        priceVal = document.createTextNode(price);
        pricePVal.appendChild(priceVal);

        txtContent.appendChild(pricePKey);
        txtContent.appendChild(pricePVal);
    }

    if (ticketStatus != ""){
        // console.log(ticketStatus);
        ticPKey = document.createElement("p");
        ticPKey.classList.add("key");
        ticKey = document.createTextNode("Ticket Status");
        ticPKey.appendChild(ticKey);

        var bgcol = "black";
        ticDivVal = document.createElement("div");
        ticDivVal.setAttribute("id","tickDiv");

        if (ticketStatus == "onsale"){
            bgcol = "green";
            ticketStatus = "On Sale";
        }
        else if(ticketStatus == "offsale"){
            bgcol = "red"
            ticketStatus = "Off Sale";
        }
        else if(ticketStatus == "cancelled"){
            bgcol = "black";
            ticketStatus = "Cancelled";
        }
        else if(ticketStatus == "rescheduled") {
            bgcol = "orange";
            ticketStatus = "Rescheduled";
        }
        else{
            bgcol = "orange";
            ticketStatus = "Postponed";
        }

        ticDivVal.style.backgroundColor = bgcol;
        ticPVal = document.createElement("p");
        ticPVal.classList.add("val");
        ticVal = document.createTextNode(ticketStatus);
        ticPVal.appendChild(ticVal);
        ticDivVal.appendChild(ticPVal);

        txtContent.appendChild(ticPKey);
        txtContent.appendChild(ticDivVal);
    }

    if (ticketAt != ""){
        tickAtPKey = document.createElement("p");
        tickAtPKey.classList.add("key");
        tickAtKey = document.createTextNode("Buy Ticket At:")
        tickAtPKey.appendChild(tickAtKey);

        tickAtPVal = document.createElement("a");
        tickAtPVal.classList.add("anc");
        tickAtPVal.setAttribute("href",ticketAt);
        tickAtPVal.setAttribute("target","_blank");
        tickAtVal = document.createTextNode("Ticketmaster");
        tickAtPVal.appendChild(tickAtVal);

        txtContent.appendChild(tickAtPKey);
        txtContent.appendChild(tickAtPVal);
    }

    content.appendChild(txtContent);

    imgContent = document.createElement("div");
    imgContent.setAttribute("id","imgCont");

    imgSeat = document.createElement("img");
    if (seatMap != ""){
        imgSeat.setAttribute("src", seatMap);
        imgSeat.setAttribute("id","imgSeat");
    }

    imgContent.appendChild(imgSeat);
    content.appendChild(imgContent);

    evntDetBox.append(content);
    document.body.appendChild(evntDetBox);

    // createVenue(ve);
    venDiv = document.createElement("div");
    venDiv.setAttribute("id","venDiv");

    venP = document.createElement("p");
    venP.setAttribute("id","venP");

    venP.innerHTML = "Show Venue Details"

    venDiv.appendChild(venP);

    arrDiv = document.createElement("div");
    arrDiv.setAttribute("id", "arrDiv");
    arrDiv.onclick = function(){displayVenueDetails(ve)};

    venDiv.appendChild(arrDiv);

    document.body.appendChild(venDiv);

    // const scrollingElement = (document.scrollingElement || document.body);
    // scrollingElement.scrollTop = scrollingElement.scrollHeight;

    const elm = document.getElementById("venDiv");
    console.log(elm)
    elm.scrollIntoView({behavior: "smooth", block: "start", inline:"end"});

}

function createVenue(venueName){
    venDiv = document.createElement("div");
    venDiv.setAttribute("id","venDiv");

    venP = document.createElement("p");
    venP.setAttribute("id","venP");

    venP.innerHTML = "Show Venue Details"

    venDiv.appendChild(venP);

    arrDiv = document.createElement("div");
    arrDiv.setAttribute("id", "arrDiv");
    arrDiv.onclick = function(){displayVenueDetails(venueName)};

    venDiv.appendChild(arrDiv);

    document.body.appendChild(venDiv);


}

async function displayVenueDetails(venueName){


    if (document.getElementById("venDetDiv")!= null){
        document.getElementById("body").removeChild(document.getElementById("venDetDiv"));
    }

    document.body.removeChild(document.getElementById("venDiv"));

    console.log("in Display func");
    var venueResponse = await axios.get("/venuedetails"+`?keyword=${venueName}`);
    respVenue = venueResponse.data;
    console.log("respVenue: "+respVenue);

    firstLine = "";
    city = "";
    postCode = "";
    url = "";
    imgPath = "";

    if ("_embedded" in respVenue && ("venues" in respVenue["_embedded"])){
        
        if ("address" in respVenue["_embedded"]["venues"][0] && "line1" in respVenue["_embedded"]["venues"][0]["address"]){
            firstLine = respVenue["_embedded"]["venues"][0]['address']['line1'];
        }
        
        if (("city" in respVenue["_embedded"]["venues"][0]) && ("name" in respVenue["_embedded"]["venues"][0]['city'])){
            city = respVenue["_embedded"]["venues"][0]['city']['name']
        }
        
        if (("state" in respVenue["_embedded"]["venues"][0]) && ("stateCode" in respVenue["_embedded"]["venues"][0]["state"])){
            city += ', ' + respVenue["_embedded"]["venues"][0]['state']['stateCode']
        }
        
        if ("postalCode" in respVenue["_embedded"]["venues"][0]){
        postCode = respVenue["_embedded"]["venues"][0]['postalCode'];    
        }
        
        if ("url" in respVenue["_embedded"]["venues"][0]){
            url = respVenue["_embedded"]["venues"][0]['url'];
        }
        
        if ("images" in respVenue["_embedded"]["venues"][0]){
            imgPath = respVenue["_embedded"]["venues"][0]["images"][0]["url"]
        }
    }

    venDetDiv = document.createElement("div");
    venDetDiv.setAttribute("id", "venDetDiv");

    innerDiv = document.createElement("div");
    innerDiv.setAttribute("id", "innerDiv");


    pDiv = document.createElement("div");
    pDiv.setAttribute("id","pDiv");

    pVen = document.createElement("p");
    pVen.setAttribute("id", "pVen");
    pVen.innerHTML = venueName;

    pDiv.appendChild(pVen);
    innerDiv.appendChild(pDiv);

    if (imgPath!= ""){
        imgTag = document.createElement("img");
        imgTag.setAttribute("id","imgTag");
        imgTag.setAttribute("src",imgPath);

        innerDiv.appendChild(imgTag)
    }

    adDiv = document.createElement("div");
    adDiv.setAttribute("id","adDiv");

    if (firstLine!="" || city!="" || postCode!=""){
        adLeftDiv = document.createElement("div");
        adLeftDiv.setAttribute("id","adLeftDiv");

        adLeftSubDiv = document.createElement("div");
        adLeftSubDiv.setAttribute("id","adLeftSubDiv");

        adLeftLeftDiv = document.createElement("div");
        adLeftLeftDiv.setAttribute("id","adLeftLeftDiv");

        padd = document.createElement("p");
        padd.setAttribute("id","padd");
        badd = document.createElement("b");
        badd.innerHTML = "Address:"+'\xa0' + '\xa0';
        padd.appendChild(badd);

        adLeftLeftDiv.appendChild(padd);

        adLeftRightDiv = document.createElement("div");
        adLeftRightDiv.setAttribute("id","adLeftRightDiv");

        pfline = document.createElement("p");
        pfline.setAttribute("id","pfline");
        pfline.innerHTML = firstLine;

        pcity = document.createElement("p");
        pcity.setAttribute("id","pcity");
        pcity.innerHTML = city;

        pcode = document.createElement("p");
        pcode.setAttribute("id","pcode");
        pcode.innerHTML = postCode;

        adLeftRightDiv.appendChild(pfline);
        adLeftRightDiv.appendChild(pcity);
        adLeftRightDiv.appendChild(pcode);

        adLeftSubDiv.appendChild(adLeftLeftDiv);
        adLeftSubDiv.appendChild(adLeftRightDiv);
        adLeftDiv.appendChild(adLeftSubDiv);

        // padd = document.createElement("p");
        // padd.setAttribute("id","padd");
        // badd = document.createElement("b");
        // badd.innerHTML = "Address: ";
        // padd.appendChild(badd);
        // padd.innerHTML += firstLine;

        // pcity = document.createElement("p");
        // pcity.setAttribute("id","pcity");
        // pcity.innerHTML = city;

        // pcode = document.createElement("p");
        // pcode.setAttribute("id","pcode");
        // pcode.innerHTML = postCode;

        

        pgoogle = document.createElement("p");
        pgoogle.setAttribute("id","pgoogle");

        agoogle = document.createElement("a");
        agoogle.setAttribute("id","agoogle");
        agoogle.setAttribute("href","https://www.google.com/maps/search/"+`?api=1&query=${venueName}+${firstLine}+${city}+${postCode}`);
        agoogle.setAttribute("target","_blank");

        agoogle.innerHTML = "Open in Google Maps";

        pgoogle.appendChild(agoogle);

        // adLeftDiv.appendChild(padd);
        // adLeftDiv.appendChild(pcity);
        // adLeftDiv.appendChild(pcode);
        adLeftDiv.appendChild(pgoogle);
        adDiv.appendChild(adLeftDiv);
    }

    if (url != ""){

        adRightDiv = document.createElement("div");
        adRightDiv.setAttribute("id", "adRightDiv");

        pRight = document.createElement("p");
        pRight.setAttribute("id","pRight");

        aRight = document.createElement("a");
        aRight.setAttribute("id","aRight");
        aRight.setAttribute("href", url);
        aRight.setAttribute("target","_blank");
        aRight.innerHTML = "More events at this venue";

        pRight.appendChild(aRight);
        
        adRightDiv.appendChild(pRight);
        adDiv.appendChild(adRightDiv);
    }

    innerDiv.appendChild(adDiv)

    venDetDiv.appendChild(innerDiv);
    document.body.appendChild(venDetDiv);

    const el = document.getElementById("venDetDiv");
    el.scrollIntoView({behavior: "smooth", block: "start"});
}