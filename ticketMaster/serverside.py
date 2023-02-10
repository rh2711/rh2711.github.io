from flask import Flask, request, jsonify, url_for, send_from_directory
import requests
from geolib import geohash

app = Flask(__name__, static_folder = "static")
app.debug = True

@app.route("/formdetails",methods=['GET'])
def test():

    keyword = request.args.get("keyword")
    dist = request.args.get("distance")
    cat = request.args.get("category")
    lng = request.args.get("lng")
    lat = request.args.get("lat")

    keyword = keyword.replace(" ","+")

    hashCode = geohash.encode(lat, lng, 7)

    segmentDict = {"Music":"KZFzniwnSyZfZ7v7nJ",
                    "Sports":"KZFzniwnSyZfZ7v7nE",
                    "Arts":"KZFzniwnSyZfZ7v7na",
                    "Theatre":"KZFzniwnSyZfZ7v7na",
                    "Default":""}
    segmentId = segmentDict[cat]

    params = {"apikey": "B6TCMko32UZB7QGyaPGwAwghwMgwxKGW",
                "keyword": keyword,
                "segmentId":segmentId,
                "radius":dist,
                "unit":"miles",
                "geoPoint":hashCode}

    data = requests.get("https://app.ticketmaster.com/discovery/v2/events.json", params=params)
    # print(data.json())
    # return jsonify(["mcjesdm", "mcdkmk", "mkcedmkcm"])

    jsonData = data.json()

    # print(jsonData)

    retVal = []
    if jsonData["page"]["totalElements"] == 0:
        return {}

    for i in jsonData["_embedded"]["events"]:

        dLocal = {}

        date = "TBA"
        if i["dates"]["start"]["dateTBA"] == False:
            date = i["dates"]["start"]["localDate"]

        time = "TBA"
        if i["dates"]["start"]["timeTBA"] == False:
            time = i["dates"]["start"]["localTime"]

        icon = i["images"][0]["url"]

        event = i["name"]

        genre = i["classifications"][0]["segment"]["name"]

        venue = i["_embedded"]["venues"][0]["name"]

        id = i["id"]

        # print(date)
        # print(time)
        # print(icon)
        # print(event)
        # print(genre)
        # print(venue)

        dLocal["date"] = date
        dLocal["time"] = time
        dLocal["icon"] = icon
        dLocal["event"] = event
        dLocal["genre"] = genre
        dLocal["venue"] = venue
        dLocal["id"] = id

        retVal.append(dLocal)

    return jsonify(retVal)

@app.route("/event", methods=['GET'])
def redirect():
    return send_from_directory(app.static_folder, "event.html")

@app.route("/eventdetails",methods=['GET'])
def getEventDetails():
    id = request.args.get("id")

    params = {"apikey": "B6TCMko32UZB7QGyaPGwAwghwMgwxKGW"}
    eventData = requests.get("https://app.ticketmaster.com/discovery/v2/events/"+id, params=params)
    # print(eventData.json())

    return eventData.json()

@app.route("/venuedetails",methods=['GET'])
def getVenueDetails():
    venueName = request.args.get("keyword")

    print(venueName)

    params = {"apikey": "B6TCMko32UZB7QGyaPGwAwghwMgwxKGW", "keyword":venueName}
    venueData = requests.get("https://app.ticketmaster.com/discovery/v2/venues", params=params)
    print(venueData.json())
    # return jsonify(["abc","def","ghi"])
    return venueData.json()

if __name__=="__main__":
    app.run()