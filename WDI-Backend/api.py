from flask import Flask
import json 
from flask import request
from flask_cors import CORS
from model import Model
from typing import *
import requests
import datetime

app = Flask(__name__)
CORS(app)

# constants & lambdas ================================

BASE_URL = "https://api.worldbank.org/v2"
INDICATORS_URL = lambda indicator, page, per_page : BASE_URL + f"/indicators/{indicator}/?format=json&page={page}&per_page={per_page}"


def DATA_URL(countries, indicator, year_s, year_f, page, per_page):
    url = BASE_URL + f"/country/{';'.join(countries) if len(countries) > 1 else countries[0]}/indicator/{indicator}?date={year_s}:{year_f}&page={page}&per_page={per_page}&format=json"
    
    print("Outgoing request to ", url)
    return url


def COUNTRIES_URL(per_page): 
    url = f"https://api.worldbank.org/v2/country?format=json&per_page={per_page}"
    print("Outgoing request to ", url)
    return url 

API_ERROR = lambda header : "message" in header.keys() # and header['message'][0]['id'] == '120'

# API helpers ================================

def getResultHeader(data: List[dict]) -> dict : 
    return data[0]
def getResultPayload(data: List[dict]) -> List[dict] : 
    return data[1]

def getResultLength(data: List[dict]) -> int : 
    header = getResultHeader(data)
    if not "total" in header.keys():
        raise Exception("Bad input")
    return header['total']


class NoDataException(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        
# API ================================

def getData(countries: List[str] = ['CAN', 'US'], indicator: str = 'SP.POP.TOTL', year_s: int = datetime.date.today().year - 4, year_f: int = datetime.date.today().year, page: int =1, per_page: int = 50) -> dict : 
    if len(countries) > 10 or countries[0] == "all":
        return {"code": 1, "data": {}}

    res = {"code": 0, "data": json.loads(requests.get(DATA_URL(
        countries, 
        indicator, 
        year_s, 
        year_f, 
        page, 
        per_page)).text)}
    
    if API_ERROR(getResultHeader(res['data'])):
        res["code"] = 1
        
    length: int
    try:
        length = getResultLength(res['data'])
        if length == 0:
            res["code"] = 2
    except Exception as e:
        res["code"] = 1
        

    return res

def getIndicators(indicators: str = "", page: int = 1, per_page=1) -> dict :
    res = {"code": 0, "data": json.loads(requests.get(INDICATORS_URL(
        indicator=indicators, 
        page=page, 
        per_page=per_page)).text)}
    if API_ERROR(getResultHeader(res["data"])):
        res["code"] = 1
    
    return res

def getCountries(per_page: int=1) -> dict:
    res = {"code": 0, "data": json.loads(requests.get(COUNTRIES_URL(per_page=per_page)).text)}
    return res


# format helpers  ================================

def getValuesFromItem(item: dict) -> tuple[int, str, float] :
    date = int(item["date"][:4], base=10)
    country = item["country"]["id"] if len(item["country"]["id"]) == 3 else item["countryiso3code"]
    value = item["value"]
    return date, country, value

def getValuesFromIndicator(item: dict) -> tuple[str, str, str]:
    code = item['id']
    name = item['name']
    desc = item['sourceNote']
    return code, name, desc

def getValuesFromCountry(item: dict) -> tuple[str, str]:
    id = item['id']
    name = item['name']
    return id, name

        
# formatted responses ================================

def getFormatIndicators(indicator: str | None) -> dict:
    indicators = getIndicators(indicator if indicator != None else "all", page=1, per_page=1)
    if indicators["code"] != 0:
        return indicators
    length = getResultLength(indicators["data"])
    indicators_ = getIndicators(
        indicator if indicator != None else "all", 
        page=1, 
        per_page=length)
    if indicators_["code"] != 0:
        return indicators_
    
    if not indicator:
        res: List[Dict[str, str]] = []
        for item in getResultPayload(indicators_["data"]):
            id, name, desc = getValuesFromIndicator(item)
            res.append({"id": id, "name": name})
        return {"code": 0, "data": res}
    else : 
        item = getResultPayload(indicators_["data"])[0]
        id, name, desc = getValuesFromIndicator(item)
        return {"code": 0, "data": [{'id': id, 'name': name, 'desc': desc}]}
            

def getFormatCountries() -> dict[str,str]:
    countries = getCountries()
    if countries["code"] != 0:
        return countries
    length = getResultLength(countries["data"])
    countries_ = getCountries(per_page=length)
    if countries_["code"] != 0:
        return countries_
    res = {"code": 0, "data": {}}
    
    for item in getResultPayload(countries_["data"]):
        id, name = getValuesFromCountry(item)
        res["data"][id] = name
    
    return res


def getFormatData(countries: List[str], indicator: str, year_s: str, year_f: str) -> dict: 
    data = getData(
        countries,
        indicator, 
        year_s, 
        year_f, 
        page=1, 
        per_page=1)
    
    if data["code"] != 0:
        return data
    
    length = getResultLength(data["data"])
    data_ = getData(
        countries=countries, 
        indicator=indicator, 
        year_s=year_s, 
        year_f=year_f, 
        per_page=length)
    
    if data_["code"] != 0:
        return data_
    
    res  = {"code": 0, "data": {}}
    for country in countries:
        res["data"][country] = []
    for item in getResultPayload(data_["data"]) : 
        date, country, value = getValuesFromItem(item)
        if date >= int(year_s, base=10) and date <= int(year_f, base=10) and value is not None:
            res["data"][country].append({"year": date, "value": value})
    return res

# routes ================================

    

@app.route("/", methods=['GET']) 
def home() -> str:
    return "Hi there, welcome to the World Develpoment Indicators app, made to visualize the useful data from the World Bank :)"

@app.route('/indicators', defaults={'indicator': None})
@app.route("/indicators/<indicator>", methods=['GET']) 
def indicators(indicator: str) -> List[Dict[str, str]] | Dict[str, str]:
    return getFormatIndicators(indicator=indicator)
    
    
@app.route("/countries", methods=["GET"])
def countries() -> dict[str, str]:
    return getFormatCountries()
    

    
@app.route("/data", methods=['GET']) 
def data() -> dict[int,dict[str,float]] | str:

    return getFormatData(
        request.args['countries'].split(";") if len(request.args['countries']) > 1 else [request.args['countries']], 
        request.args['indicator'], 
        request.args['year_s'], 
        request.args['year_f'])
    

    
@app.route("/forecast", methods=['GET', 'POST'])
def forecast() -> dict[str,dict[str,int]] | str:
     
    indicator: str = request.args["indicator"]
    countries: List[str] = request.args['countries'].split(";") if len(request.args['countries']) > 1 else [request.args['countries']]
    year_s: str = request.args["year_s"]
    year_f: str = request.args["year_f"]
    year_extrapolated: str = request.args["year_extrapolated"]
    data = getFormatData(
        countries=countries, 
        indicator=indicator, 
        year_s=year_s, 
        year_f=year_f)

    if data["code"] != 0:
        return data
    
        
    res = {"code": 0, "data": {}}
    year_s_int = int(year_s, base=10)
    year_f_int = int(year_f, base=10)
    year_extrapolated_int = int(year_extrapolated, base=10)
    for i in range(len(countries)):
        country: str = countries[i]
        model: Model = Model()
        keys : List[int] = []
        values : List[int] = []
        for year in range(year_s_int, year_f_int+1):
            if (year in data) and (country in data[year]) and (data[year][country] is not None):
                keys.append(year)
                values.append(data[year][country])
        if len(keys) < 2:
            res["data"][countries[i]] = {}
            continue
        model.train([[f] for f in keys], [f for f in values])
        predictions = model.predict([[f] for f in list(range(year_f_int+1, year_extrapolated_int+1))])
        res["data"][countries[i]] = {}
        for j in range(len(predictions)):
            res["data"][countries[i]][year_f_int + j + 1] = predictions[j]
    return res