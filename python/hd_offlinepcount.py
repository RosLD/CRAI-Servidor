import os

import pandas as pd
import time
import numpy as np
import sys
import math
import datetime

direccion = sys.argv[1] #"csv/off/raw/pcount_2022-10-17.csv"
time.sleep(10)  #Let some time to get csv

def generateTimeSeriesByHour(data, initHour='7:00:00', endHour='21:55:00'):
    """Función que devuelve una Serie con un Timestamp espaciado en intervalos de 5 minutos dada una hora de comienzo y de fin"""
    date = data["Timestamp"][0].date()
    start = str(date) + " " + initHour
    end = str(date) + " " + endHour
    timeSeries = pd.Series(pd.date_range(start, end, freq='1T'))

    return timeSeries

contador_raw = pd.read_csv(direccion, delimiter=';')

contador_raw['Timestamp'] = contador_raw["Fecha"] + " " + contador_raw["Hora"]

contador_raw['Timestamp'] = pd.to_datetime(contador_raw['Timestamp'], dayfirst=True)

contador_raw.replace({"Right2":"Right"},inplace=True)   #Rename sensor Right 2 as Right
contador_raw.drop_duplicates(subset=['Timestamp','Sensor'],keep='first',inplace=True) #So if they got medition at the same time we remove


time_list = generateTimeSeriesByHour(contador_raw)
zeroList = pd.Series(np.zeros(len(time_list)))

cuenta = 0
c = []
for i in contador_raw["Evento In-Out(1/0)"]:
    if i == 1:
        cuenta += 1
    elif i == 0:
        cuenta -= 1
        if cuenta < 0:
            cuenta = 0
    
    c.append(cuenta)

contador_raw['Ocupacion Estimada'] = c


contador_raw = contador_raw.groupby(pd.Grouper(key="Timestamp",freq='1Min')).last()

oc = []
sen = []

for ts in time_list:

    
    try:
        a = contador_raw.loc[ts]['Ocupacion Estimada']
        s = contador_raw.loc[ts]['Sensor']
    except:

        a = math.nan
        s = "NoS"
        
    if math.isnan(a):
        
        if(len(oc)>0):
            oc.append(oc[-1])
        else:
            oc.append(0)
    else:
        oc.append(a)

    if s == "NoS" or s == None:
        
        if(len(sen)>0):
            sen.append(sen[-1])
        else:
            sen.append(s)
    else:
        sen.append(s)
    
contador = pd.DataFrame(
    {'Timestamp': pd.to_datetime(time_list), 'personCount': oc, 'Interval': np.arange(0, len(time_list), step=1),"Sensor":sen})
 

#"csv/off/raw/pcount_2022-10-17.csv"
file_dst = "csv/off/csv_offline_filter/"+time.strftime("%Y-%m-%d")+"_contador_clean.csv"
contador.to_csv(file_dst,sep=';',index=False,mode='w',header=True)