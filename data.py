import json
from datetime import datetime, timedelta
from pytz import country_timezones
import pytz
import requests
import googlemaps
import pandas as pd

GMAPS_API_KEY = open("gmaps_api_key.txt", 'r').read()

timezone = country_timezones("MA")[0]
morocco_timezone = pytz.timezone(timezone)

current_time_morocco = datetime.now(morocco_timezone)
twenty_years_ago = current_time_morocco - timedelta(days=20*365)  
with open("resources/countries.geojson", 'r') as geojson_file:
    geojson_data = json.load(geojson_file)

for feature in geojson_data["features"]:
    if feature["properties"]["ADMIN"] == "Morocco":
        morocco_polygon = feature["geometry"]["coordinates"][0]
    if feature["properties"]["ADMIN"] == "Western Sahara":
        ws_polygon = feature["geometry"]["coordinates"][0]

morocco_polygon = [(coord[1], coord[0]) for coord in morocco_polygon]
ws_polygon = [(coord[1], coord[0]) for coord in ws_polygon]

def get_earthquake_data(start_time, end_time, polygon):
    base_url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    parameters = {
        "format": "geojson",
        "starttime": start_time.strftime("%Y-%m-%dT%H:%M:%S"),
        "endtime": end_time.strftime("%Y-%m-%dT%H:%M:%S"),
        "eventtype": "earthquake",
        "limit": 1000,
        "minmagnitude": 1.0,  
        "maxlatitude": max(polygon, key=lambda x: x[0])[0],
        "minlatitude": min(polygon, key=lambda x: x[0])[0],
        "maxlongitude": max(polygon, key=lambda x: x[1])[1],
        "minlongitude": min(polygon, key=lambda x: x[1])[1],
    }

    response = requests.get(base_url, params=parameters)
    earthquake_data = response.json()
    return earthquake_data

morocco_earthquakes = get_earthquake_data(twenty_years_ago, current_time_morocco, morocco_polygon)

ws_earthquakes = get_earthquake_data(twenty_years_ago, current_time_morocco, ws_polygon)

def reverse_geocode(api_key, latitude, longitude):
    gmaps = googlemaps.Client(key=api_key)

    try:
        reverse_geocode_result = gmaps.reverse_geocode((latitude, longitude))
        if reverse_geocode_result:
            return reverse_geocode_result[0]['formatted_address']
        else:
            return "Location not found"
    except Exception as e:
        return str(e)

def utc_to_local_time(timestamp):
    timestamp = timestamp / 1000.0
    utc_datetime = datetime.utcfromtimestamp(timestamp)
    morocco_timezone = pytz.timezone('Africa/Casablanca')  # Specify the Morocco timezone
    local_time = utc_datetime.replace(tzinfo=pytz.UTC).astimezone(morocco_timezone)
    return local_time

earthquake_data_list = []
for feature in morocco_earthquakes["features"]:
    magnitude = feature["properties"]["mag"]
    place = feature["properties"]["place"]
    timestamp = feature["properties"]["time"]
    local_time = utc_to_local_time(timestamp)
    latitude = feature["geometry"]["coordinates"][0]
    longitude = feature["geometry"]["coordinates"][1]
    depth = feature["geometry"]["coordinates"][2]
    event_type = feature["properties"]["type"]
    felt_num = feature["properties"]["felt"]
    nst = feature["properties"]["nst"]
    magnitude_algorithm = feature["properties"]["magType"]
    address = reverse_geocode(GMAPS_API_KEY, latitude, longitude)
    earthquake_data_list.append([place, local_time, latitude, longitude, event_type, magnitude,
                                  depth, felt_num, nst, magnitude_algorithm])

for feature in ws_earthquakes["features"]:
    magnitude = feature["properties"]["mag"]
    place = feature["properties"]["place"]
    timestamp = feature["properties"]["time"]
    local_time = utc_to_local_time(timestamp)    
    latitude = feature["geometry"]["coordinates"][0]
    longitude = feature["geometry"]["coordinates"][1]
    depth = feature["geometry"]["coordinates"][2]
    event_type = feature["properties"]["type"]
    felt_num = feature["properties"]["felt"]
    nst = feature["properties"]["nst"]
    magnitude_algorithm = feature["properties"]["magType"]
    earthquake_data_list.append([place, local_time, latitude, longitude, event_type, magnitude, 
                                 depth, felt_num, nst, magnitude_algorithm])



column_names = ["Place", "Local Time", "Latitude", "Longitude", "(Earthquake | Quarry)", "Magnitude", 
                "Depth (km)", "Number of felt reports", "Number of Stations", "Method/Algrothim"]

earthquake_df = pd.DataFrame(earthquake_data_list, columns=column_names)
earthquake_df.to_csv("resources/moroccan_earthquakes.csv")
