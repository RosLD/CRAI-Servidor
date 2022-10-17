import pandas as pd
import time
import sys
import os
import numpy as np

#contador_src = sys.argv[1]
#wifi_file = "csv/int/raw/wifi_"+sys.argv[2].split("_")[1]

wifi_file = sys.argv[1]
contador_src = sys.argv[2]#"csv/int/csv_online_filter/"+time.strftime("%Y-%m-%d")+"_contador.csv"

trg_file = "csv/off/csv_offline_filter/"+time.strftime("%Y-%m-%d")+"_wifi_clean.csv"
trg_file2 = "csv/off/csv_offline_filter/"+time.strftime("%Y-%m-%d")+"_pcount_clean.csv"

fsize = os.path.getsize(wifi_file)
print(fsize)

while fsize == 107:
    fsize = os.path.getsize(wifi_file)
    time.sleep(10)

datos_wifi = pd.read_csv(wifi_file, sep=';',error_bad_lines=False)

datos_contador = pd.read_csv(contador_src,sep=";")

datos_wifi.replace(
    {"Raspberry1": "Raspberry A", "Raspberry2": "Raspberry D", "Raspberry3": "Raspberry B", "Raspberry5": "Raspberry E",
     "Raspberry7": "Raspberry C"}, inplace=True)


nRA = nRB = nRC = nRD = nRE = 0

datos_contador['Timestamp'] = datos_contador["Fecha"] + " " + datos_contador["Hora"]
#datos_contador['Timestamp'] = pd.to_datetime(datos_contador['Timestamp'], dayfirst=True)

datos_contador.replace({"Right2":"Right"},inplace=True)   #Rename sensor Right 2 as Right
datos_contador.drop_duplicates(subset=['Timestamp','Sensor'],keep='first',inplace=True)

datos_wifi['Timestamp'] = datos_wifi["Fecha"] + " " + datos_wifi["Hora"]
#datos_wifi['Timestamp'] = pd.to_datetime(datos_wifi['Timestamp'], dayfirst=True)

zeroList = pd.Series(np.zeros(len(datos_contador['Timestamp'])))
a = []
datos_contador_pure = pd.DataFrame(
    {'Timestamp': datos_contador['Timestamp'], 'personCount': zeroList})

#print(datos_contador_pure)
#remove duplicates
cuenta = 0
for i in datos_contador['Evento In-Out(1/0)']:
    if i == 1:
        cuenta += 1
    else:
        cuenta -= 1
        if cuenta < 0:
            cuenta = 0
    a.append(cuenta)

zeroList = pd.Series(a)

datos_contador_pure = pd.DataFrame(
    {'Timestamp': datos_contador['Timestamp'], 'personCount': a})

#print(datos_contador_pure)
kamac = ["01:01:01:01:01:01","06:06:06:06:06:06","11:11:11:11:11:11"]

for index,row in datos_wifi.iterrows():

    if row['MAC Origen'] not in kamac :

        if row['Id'] == "Raspberry A":
            nRA += 1
        elif row['Id'] == "Raspberry B":
            nRB += 1
        elif row['Id'] == "Raspberry C":
            nRC += 1
        elif row['Id'] == "Raspberry D":
            nRD += 1
        elif row['Id'] == "Raspberry E":
            nRE += 1

    else:
        pc = 0
        try:
            pc = datos_contador_pure[datos_contador_pure['Timestamp'] < datos_wifi['Timestamp'][index]]['personCount'].iloc[-1]
        except:
            pc = 0
        auxst = f"RA:{nRA},RB:{nRB},RC:{nRC},RD:{nRD},RE:{nRE},PC:{pc}"
        nRA = nRB = nRC = nRD = nRE = 0
        datos_wifi.iloc[index,datos_wifi.columns.get_loc("SSID")] = auxst

print(datos_wifi)
print("Saving results")
datos_wifi.to_csv(trg_file,";",index=False,mode="w")
datos_contador_pure.to_csv(trg_file2,";",index=False,mode='w')

ble_file = wifi_file.split("wifi")[0]+"ble"+wifi_file.split("wifi")[1]


#time.sleep(60*10)   #Give BLE a break
os.system(f"python3.8 python/hd_offlineBLE.py {ble_file} {trg_file2}")