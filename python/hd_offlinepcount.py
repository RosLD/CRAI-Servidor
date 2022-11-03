import os

import pandas as pd
import time
import numpy as np
import sys
import math
import datetime

direccion = sys.argv[1] #"csv/off/raw/pcount_2022-10-17.csv"
#time.sleep(10)  #Let some time to get csv


contador_raw = pd.read_csv(direccion, delimiter=';')

contador_raw['Timestamp'] = contador_raw["Fecha"] + " " + contador_raw["Hora"]

#contador_raw['Timestamp'] = pd.to_datetime(contador_raw['Timestamp'], dayfirst=True)

contador_raw.replace({"Right2":"Right"},inplace=True)   #Rename sensor Right 2 as Right
contador_raw.drop_duplicates(subset=['Timestamp','Sensor'],keep='first',inplace=True) #So if they got medition at the same time we remove

def generateTimeSeriesByHour(data, initHour='7:00:00', endHour='21:55:00'):
    """Función que devuelve una Serie con un Timestamp espaciado en intervalos de 5 minutos dada una hora de comienzo y de fin"""
    date = data["Timestamp"][0].date()
    start = str(date) + " " + initHour
    end = str(date) + " " + endHour
    timeSeries = pd.Series(pd.date_range(start, end, freq='1T'))

    return timeSeries

keepalive_t = 30 #Configurado actualmente a 30 segundos
intervalo = 60 #Vamos a mirar por minutos
kas = intervalo/keepalive_t #Cuantos KeepAlive por minuto

def checkKAs(df,inicio,final):
    i = 0
    
    fint = []   #Almacenamos los intervalos donde no haya suficientes keep alive
    hora = inicio
    #nint = []

    while hora < final:
        while i <= 59:

            auxst = f"{str(hora).zfill(2)}:{str(i).zfill(2)}:"
            
            c = df[df['Timestamp'].str.contains(auxst)]
            if len(c) < 2:
                fint.append(auxst+"00")
            
            #nint.append(getNSBreak(contador_raw[contador_raw['Sensor']!="KeepAlive"],auxst)) #recuperar con trama = trama y timestamp like (SQL)
                
            
            i += 1
        hora += 1
        i = 0
    
    return fint






f = checkKAs(contador_raw[contador_raw['Sensor']=="KeepAlive"],7,22)

contador_raw['Timestamp'] = pd.to_datetime(contador_raw['Timestamp'], dayfirst=True)
if len(f) > 0:
    print(f"Hay que recuperar {len(f)} intervalos")

time_list = generateTimeSeriesByHour(contador_raw)

contador_raw_ka = contador_raw[contador_raw['Sensor']!="KeepAlive"]
contador_raw_ka = contador_raw_ka.groupby(pd.Grouper(key="Timestamp",freq='1Min')).last()

contador_raw_ka.drop(columns=['Fecha','Hora','Entradas Derecha','Salidas Derecha','Entradas Izquierda','Salidas Izquierda','Entradas Derecha 2','Salidas Derecha 2'],inplace=True)

pc = []
estado = []
Fecha_list = []
Hora_list = []

for ts in time_list:
    
    t = f"{str(ts.hour).zfill(2)}:{str(ts.minute).zfill(2)}:{str(ts.second).zfill(2)}"
    Fecha_list.append(f"{ts.year}-{ts.month}-{ts.day}")
    Hora_list.append(t)
    


    try:    #Puede saltar pero que haya keep alive
        a = contador_raw_ka.loc[ts]['Ocupacion estimada']
        if math.isnan(a):
            if len(pc) > 0:
                a = pc[-1]
            else:
                a = 0
    except:

        if len(pc) > 0:
            a = pc[-1]
        else:
            a = 0
    
    if t in f:  #No se tienen suficientes keep alive de este intervalo
        
        try:
            ge = contador_raw_ka.loc[ts]    #Si no salta el try existe dato (se ha perdido poco)
            s = 0
        except: #Si salta es que no
            a = "NaN"   #TO-DO si no hay keeps alives hace esto directamente
            s = "NaN"
    else:
        s = 1
    
        
    pc.append(a)
    estado.append(s)
    


contador = pd.DataFrame(
    {'Fecha': Fecha_list, 'Hora': Hora_list, 'Interval': np.arange(0, len(time_list),  step=1),'Ocupacion': pc,"Estado":estado})
 
direccion = "csv/off/csv_offline_filter/pcount_filter_"+direccion.split("_")[1]
contador.to_csv(direccion,sep=";",index=False)