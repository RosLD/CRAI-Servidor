import pandas as pd
import time
import sys
import os

nombre_target = sys.argv[1]#"csv/off/raw/ble_2022-10-24.csv" #

fecha_diahoy = nombre_target.split("_")[1]
fsize = os.path.getsize(nombre_target)

while fsize == 74:
    fsize = os.path.getsize(nombre_target)
    time.sleep(10)

# Parametros

sampling = 5  # Periodo de muestreo

if sampling > 60:
    print("Max sampling period is 60!")
    exit()
# ---------------
temp = 60 - sampling
final = (60 * 15) / sampling

print("Filtering BLE Data this is going to last some time")

hora_inicio = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())

print(f'Hora inicio: {hora_inicio}')
# Variables funcionamiento

# Para localizar los CSVs
# nombre_target = #"/home/servidoridiit1upct/CRAI-Servidor/csv/ble_"+fecha_diahoy+"_7-22.csv" #Nombre del archivo
nombre_filter = "./csv/off/csv_offline_filter/ble_filter_" + nombre_target.split("_")[1] + "_samp" + str(
    sampling) + ".csv"
nombre_resumen = "./csv/off/csv_offline_filter/ble_resumen_" + nombre_target.split("_")[1] +".csv"

filter_cols = ['Indice int. muestreo', 'Timestamp int.', 'Raspberry', 'Timestamp inicial', 'Nº Mensajes', 'MAC',
               'Tipo MAC', 'Tipo ADV', 'BLE Size', 'RSP Size', 'BLE Data', 'RSSI promedio']
nombre_lista = "./python/doc/mac_filter.csv"
nseq = 0

datos_ble = pd.read_csv(nombre_target, sep=';')

desde_hora = 7
hasta_hora = 7

desde = 0
hasta = desde + sampling

if sampling == 60:
    hasta_hora = 8
    hasta = 0

datos_ble.replace(
    {"Raspberry1": "Raspberry A", "Raspberry2": "Raspberry D", "Raspberry3": "Raspberry B", "Raspberry5": "Raspberry E",
     "Raspberry7": "Raspberry C"}, inplace=True)

columnas_resumen = ['Fecha','Hora','Indice intervalo','RA(1/0)','RB(1/0)','RC(1/0)','RD(1/0)','RE(1/0)']
datos_resumen = pd.DataFrame(columns=columnas_resumen)

go = True

while go:

    desde_tiempo = ''
    hasta_tiempo = ''

    desde_tiempo += str(desde_hora).zfill(2) + ":" + str(desde).zfill(2) + ":00"
    hasta_tiempo += str(hasta_hora).zfill(2) + ":" + str(hasta).zfill(2) + ":00"

    if desde == temp:
        desde = 0
        desde_hora += 1
    else:
        desde += sampling

    if hasta == temp:
        hasta = 0
        hasta_hora += 1
    else:
        hasta += sampling

    nseq += 1

    aux = datos_ble.loc[datos_ble["Hora"] >= desde_tiempo]
    aux = aux.loc[aux["Hora"] < hasta_tiempo]
    lista_filtro = pd.read_csv(nombre_lista, delimiter=';')
    datos_filtrados = pd.DataFrame(columns=filter_cols)

    # Start filtering
    for index, row in aux.iterrows():
        if not (lista_filtro['MAC'] == row['MAC']).any():
            

            if ((datos_filtrados['Raspberry'] == row['Id']) & (datos_filtrados['MAC'] == row['MAC'])).any():

                indice = datos_filtrados.loc[
                    (datos_filtrados['Raspberry'] == row['Id']) & (datos_filtrados['MAC'] == row['MAC'])].index[0]

                datos_filtrados.at[indice, 'Nº Mensajes'] += 1
                datos_filtrados.at[indice, 'RSSI promedio'] += row['RSSI']

            else:
                data = [nseq, fecha_diahoy + " " + desde_tiempo, row['Id'],
                        row['Fecha'] + " " + row['Hora'], 1, row['MAC'], row['Tipo MAC'], row['Tipo ADV'],
                        row['ADV Size'], row['RSP Size'], row['Advertisement'], row['RSSI']]
                datos_filtrados = pd.concat([datos_filtrados, pd.DataFrame([data], columns=filter_cols)], ignore_index=True)

    # Now save in csv
    datos_filtrados['RSSI promedio'] = datos_filtrados['RSSI promedio'] / datos_filtrados['Nº Mensajes']
    #Comprobamos si han llegado keep alive de todas las raspberrys
    rsp = datos_filtrados[datos_filtrados['MAC']=="00:00:00:00:00:00"]
    fecha_resumen = fecha_diahoy+ " " + desde_tiempo

    if len(rsp) != 5:
        #COmpruebo cual falta
        falta = []
        
        if len(rsp[rsp['Raspberry']=="Raspberry A"]) == 0:
            falta.append('Raspberry A')
        
        if len(rsp[rsp['Raspberry']=="Raspberry B"]) == 0:
            falta.append('Raspberry B')

        if len(rsp[rsp['Raspberry']=="Raspberry C"]) == 0:
            falta.append('Raspberry C')

        if len(rsp[rsp['Raspberry']=="Raspberry D"]) == 0:
            falta.append('Raspberry D')

        if len(rsp[rsp['Raspberry']=="Raspberry E"]) == 0:
            falta.append('Raspberry E')    
        
        lista_resumen = [fecha_diahoy,desde_tiempo,nseq,0,0,0,0,0]
        #Metemos los que falta en el dataframe normal
        for j in falta:
            data = [nseq, fecha_diahoy + " " + desde_tiempo, j,
                        fecha_diahoy + " " + hasta_tiempo, 0, "00:00:00:00:00:00", "Public", "ADV_IND",
                        4, 0, "abcd", -70]
            datos_filtrados = pd.concat([datos_filtrados, pd.DataFrame([data], columns=filter_cols)], ignore_index=True)
            #datos_resumen = pd.concat([datos_resumen, pd.DataFrame([[fecha_resumen, nseq, j, 0]], columns=columnas_resumen)], ignore_index=True)
    
    #Creamos el resumen
    for k in rsp['Raspberry']:
        if k == "Raspberry A":
            lista_resumen[3] = 1
        elif k == "Raspberry B":
            lista_resumen[4] = 1
        elif k == "Raspberry C":
            lista_resumen[5] = 1
        elif k == "Raspberry D":
            lista_resumen[6] = 1
        elif k == "Raspberry E":
            lista_resumen[7] = 1 

    datos_resumen = pd.concat([datos_resumen, pd.DataFrame([lista_resumen], columns=columnas_resumen)], ignore_index=True)
    
    if nseq == 1:
        
        datos_filtrados.to_csv(nombre_filter, sep=';', index=False)
        datos_resumen.to_csv(nombre_resumen,sep=";",index=False)
    else:
        
        datos_filtrados.to_csv(nombre_filter, sep=';', mode='a', header=False, index=False)
        datos_resumen.to_csv(nombre_resumen, sep=';', mode='a', header=False, index=False)

    print(f'Intervalos escritos: {nseq}/{final}')

    
    
    if desde_hora == 22:
        go = False

hora_fin = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
print(f'Filtrado y limpieza acabado, hora: {hora_fin}')