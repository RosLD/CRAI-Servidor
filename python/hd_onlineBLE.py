import pandas as pd
import time
import sys
import os

print("Hello from python!")
# El intervalo inicialmente es de 5 minutos

# trg_file = time.strftime('%Y-%m-%d ', time.localtime())


# print("BLE File: " + sys.argv[1])

nombre_target = sys.argv[1]

fsize = os.path.getsize(nombre_target)
# print(fsize)

while fsize == 74:
    fsize = os.path.getsize(nombre_target)
    time.sleep(10)

intervalo = nombre_target.split("-")[0].split("_")[1]
# nombre_filter = "./csv/int/ble_filter_"+nombre_target.split("_")[1]
filter_cols = ['Timestamp int.', 'Raspberry', 'Timestamp inicial', 'Nº Mensajes', 'MAC', 'Tipo MAC', 'Tipo ADV',
               'BLE Size', 'RSP Size', 'BLE Data', 'RSSI promedio']
# ['Indice int. muestreo',
nombre_lista = "./python/doc/mac_filter.csv"
# nombre_lista = "./mac_filter.csv"

lista_filtro = pd.read_csv(nombre_lista, delimiter=';')

datos_ble = pd.read_csv(nombre_target, sep=';')

# nseq = 0

datos_filtrados = pd.DataFrame(columns=filter_cols)

# Start filtering
for index, row in datos_ble.iterrows():
    if not (lista_filtro['MAC'] == row['MAC']).any():
        if ((datos_filtrados['Raspberry'] == row['Id']) & (datos_filtrados['MAC'] == row['MAC']) & (
                datos_filtrados['BLE Data'] == row['Advertisement'])).any():

            indice = datos_filtrados.loc[
                (datos_filtrados['Raspberry'] == row['Id']) & (datos_filtrados['MAC'] == row['MAC']) & (
                            datos_filtrados['BLE Data'] == row['Advertisement'])].index[0]
            datos_filtrados.at[indice, 'Nº Mensajes'] += 1
            datos_filtrados.at[indice, 'RSSI promedio'] += row['RSSI']
        else:
            data = [time.strftime('%Y-%m-%d', time.localtime()) + " " + intervalo, row['Id'],
                    row['Fecha'] + " " + row['Hora'], 1, row['MAC'], row['Tipo MAC'], row['Tipo ADV'], row['ADV Size'],
                    row['RSP Size'], row['Advertisement'], row['RSSI']]
            datos_filtrados = pd.concat([datos_filtrados, pd.DataFrame([data], columns=filter_cols)], ignore_index=True)
            # datos_filtrados = datos_filtrados.append(pd.Series(data,index=filter_cols),ignore_index=True)
# Now don't save in csv
datos_filtrados['RSSI promedio'] = datos_filtrados['RSSI promedio'] / datos_filtrados['Nº Mensajes']

file_dst = "csv/int/csv_online_filter/"+time.strftime("%Y-%m-%d")+"_ble.csv"
datos_filtrados.to_csv(file_dst,sep=';',index=False,mode='a',header=False)

# datos_filtrados.to_csv(nombre_filter,sep = ';',mode='w',header=True,index=False)

#print("Data filtering finished, going full AI")
os.system(f"python3.8 python/ble-estimator-server.py {file_dst}")

