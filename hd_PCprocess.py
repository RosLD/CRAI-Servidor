
import pandas as pd
import time
import numpy as np
import sys
import os
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="sqlco2",
  password="sqlpass",
  database="co2blelr"
)



mycursor = mydb.cursor()

direccion = sys.argv[1]

fsize = os.path.getsize(direccion)
print(fsize)

major = direccion.split("_")[1].split("-")[1].split(".")[0]+":00"

contador_raw = pd.read_csv(direccion,delimiter=';')

def generateTimeSeriesByHour(data, initHour='7:00:00', endHour='21:55:00'):
    """Función que devuelve una Serie con un Timestamp espaciado en intervalos de 5 minutos dada una hora de comienzo y de fin"""
    date =  data["Timestamp"][0].date()
    start = str(date) + " " + initHour
    end = str(date) + " " + endHour
    timeSeries = pd.Series(pd.date_range(start, end, freq='1T'))

    return timeSeries


contador_raw['Timestamp'] = contador_raw["Fecha"] + " " + contador_raw["Hora"]

contador_raw['Timestamp'] = pd.to_datetime(contador_raw['Timestamp'], dayfirst=True)

time_list = generateTimeSeriesByHour(contador_raw,endHour=major)
zeroList = pd.Series(np.zeros(len(time_list)))

contador = pd.DataFrame({'Timestamp': pd.to_datetime(time_list), 'personCount': zeroList, 'Interval':np.arange(0,len(time_list),step=1)})

cuenta = 0
for index,row in contador.iterrows():
    m = row['Timestamp'].strftime("%Y-%m-%d %H:%M:59")
    
    sel = contador_raw[contador_raw['Timestamp']>row['Timestamp']]
    sel = sel[sel['Timestamp'] < m]
    for i in sel['Evento In-Out(1/0)']:
        if i == 1:
            cuenta += 1
        elif i == 0:
            cuenta -= 1
            if cuenta < 0:
                cuenta = 0
    contador.iloc[index,contador.columns.get_loc("personCount")]= cuenta
contador.to_csv("csv/int/"+time.strftime("%Y-%m-%d")+"_contador.csv",sep=',',index=False,mode='w',header=False)

pc = contador.iloc[-1]['personCount']



sql = "INSERT INTO hd_ocupa (FuenteEst,Estimacion,Timestamp) VALUES (%s,%s,%s)"
val = ("Raspberry6",pc,time.strftime("%Y-%m-%d")+" "+major)
mycursor.execute(sql, val)

mydb.commit()