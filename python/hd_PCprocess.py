import os

import pandas as pd
import time
import numpy as np
import sys
import datetime

import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user="sqlco2",
    password="sqlpass",
    database="co2blelr"
)

mycursor = mydb.cursor()
intervalo = datetime.datetime.now() - datetime.timedelta(minutes=5)
direccion = sys.argv[1]
print(direccion)

while not os.path.exists(direccion):
    time.sleep(5)

fsize = os.path.getsize(direccion)
# print(fsize)

while fsize == 145:
    fsize = os.path.getsize(direccion)
    time.sleep(10)

# print(fsize)
major = direccion.split("_")[1].split("-")[1].split(".")[0] + ":00"
# print(major)

contador_raw = pd.read_csv(direccion, delimiter=';')


def generateTimeSeriesByHour(data, initHour='7:00:00', endHour='21:55:00'):
    """Función que devuelve una Serie con un Timestamp espaciado en intervalos de 5 minutos dada una hora de comienzo y de fin"""
    date = data["Timestamp"][0].date()
    start = str(date) + " " + initHour
    end = str(date) + " " + endHour
    timeSeries = pd.Series(pd.date_range(start, end, freq='1T'))

    return timeSeries


contador_raw['Timestamp'] = contador_raw["Fecha"] + " " + contador_raw["Hora"]

contador_raw['Timestamp'] = pd.to_datetime(contador_raw['Timestamp'], dayfirst=True)

contador_raw.replace({"Right2":"Right"},inplace=True)   #Rename sensor Right 2 as Right
contador_raw.drop_duplicates(subset=['Timestamp','Sensor'],keep='first',inplace=True) #So if they got medition at the same time we remove

time_list = generateTimeSeriesByHour(contador_raw, endHour=major)
zeroList = pd.Series(np.zeros(len(time_list)))

contador = pd.DataFrame(
    {'Timestamp': pd.to_datetime(time_list), 'personCount': zeroList, 'Interval': np.arange(0, len(time_list), step=1)})

cuenta = 0
for index, row in contador.iterrows():
    if row['Sensor'] == "KeepAlive":
        continue
    
    m = row['Timestamp'].strftime("%Y-%m-%d %H:%M:59")
    
    sel = contador_raw[contador_raw['Timestamp'] > row['Timestamp']]
    sel = sel[sel['Timestamp'] < m]
    for i in sel['Evento In-Out(1/0)']:
        if i == 1:
            cuenta += 1
        elif i == 0:
            cuenta -= 1
            if cuenta < 0:
                cuenta = 0
    contador.iloc[index,contador.columns.get_loc("personCount")]= cuenta
contador.to_csv("csv/int/csv_online_filter/"+time.strftime("%Y-%m-%d")+"_contador.csv",sep=';',index=False,mode='w',header=True)

pc = contador.iloc[-1]['personCount']

sql = "INSERT INTO hd_ocupa (FuenteEst,Estimacion,Timestamp) VALUES (%s,%s,%s)"
major = time.strftime("%Y-%m-%d") + " " + major
# print(major)
val = ("Raspberry6", pc, major)
mycursor.execute(sql, val)

mydb.commit()
