import pandas as pd


def generateTimeSeriesByHour(data, endHour='21:55:00'):
    """Función que devuelve una Serie con un Timestamp espaciado en intervalos de 5 minutos dada una hora de comienzo y de fin"""
    initHour = data.split(" ")[1]
    end = data.split(" ")[0] + " " + endHour
    timeSeries = pd.Series(pd.date_range(data, end, freq='5T')).tolist()

    return timeSeries


def parseDataByRaspberry(data):
    """Función que devuelve un conjunto de datos filtrado por cada Raspberry. Devuelve un conjunto por Raspberry."""

    dataInterval1 = data.loc[data['Raspberry'] == 'Raspberry A']
    dataInterval2 = data.loc[data['Raspberry'] == 'Raspberry B']
    dataInterval3 = data.loc[data['Raspberry'] == 'Raspberry C']
    dataInterval4 = data.loc[data['Raspberry'] == 'Raspberry D']
    dataInterval5 = data.loc[data['Raspberry'] == 'Raspberry E']

    return dataInterval1, dataInterval2, dataInterval3, dataInterval4, dataInterval5


def parseDataByRaspberryTime(data):
    """Función que devuelve conjuntos de datos con valores únicos filtrados por Raspberry y agrupados por Timestamp."""

    dataInterval1, dataInterval2, dataInterval3, dataInterval4, dataInterval5 = parseDataByRaspberry(data)
    dataInterval1 = dataInterval1.groupby('Timestamp').nunique()
    dataInterval2 = dataInterval2.groupby('Timestamp').nunique()
    dataInterval3 = dataInterval3.groupby('Timestamp').nunique()
    dataInterval4 = dataInterval4.groupby('Timestamp').nunique()
    dataInterval5 = dataInterval5.groupby('Timestamp').nunique()

    return dataInterval1, dataInterval2, dataInterval3, dataInterval4, dataInterval5


def getTotalDevicesByRaspberry(data):
    """Función que devuelve conjuntos de datos con el número de dispositivos únicos filtrados por Raspberry y agrupados
    por Timestamp."""

    dataInterval1, dataInterval2, dataInterval3, dataInterval4, dataInterval5 = parseDataByRaspberryTime(data)

    try:
        totalMACRA = dataInterval1["MAC"].values[0]
    except:
        totalMACRA = 0

    try:
        totalMACRB = dataInterval2["MAC"].values[0]
    except:
        totalMACRB = 0

    try:
        totalMACRC = dataInterval3["MAC"].values[0]
    except:
        totalMACRC = 0

    try:
        totalMACRD = dataInterval4["MAC"].values[0]
    except:
        totalMACRD = 0

    try:
        totalMACRE = dataInterval5["MAC"].values[0]
    except:
        totalMACRE = 0

    return totalMACRA, totalMACRB, totalMACRC, totalMACRD, totalMACRE


def getTotalDevicesByPairRaspberries(data):
    """Función que devuelve cuatro listas compuestas por los dispositivos captados en el mismo intervalo de tiempo por
    las parejas C-E, D-E, B-E y el trío C-D-E"""

    dataInterval1, dataInterval2, dataInterval3, dataInterval4, dataInterval5 = parseDataByRaspberry(data)

    nDevicesIntervalDataRAMerge = dataInterval1[["Timestamp", "Raspberry", "MAC"]]
    nDevicesIntervalDataRBMerge = dataInterval2[["Timestamp", "Raspberry", "MAC"]]
    nDevicesIntervalDataRCMerge = dataInterval3[["Timestamp", "Raspberry", "MAC"]]
    nDevicesIntervalDataRDMerge = dataInterval4[["Timestamp", "Raspberry", "MAC"]]
    nDevicesIntervalDataREMerge = dataInterval5[["Timestamp", "Raspberry", "MAC"]]

    nDevicesIntervalDataRDEMerge = nDevicesIntervalDataRDMerge.merge(nDevicesIntervalDataREMerge, how='outer',
                                                                     on=("Timestamp", "MAC"), copy=False,
                                                                     suffixes=("_d", "_e"))
    nDevicesIntervalDataRCDEMerge = nDevicesIntervalDataRDEMerge.merge(nDevicesIntervalDataRCMerge, how='outer',
                                                                       on=("Timestamp", "MAC"), copy=False)
    nDevicesIntervalDataRBCDEMerge = nDevicesIntervalDataRCDEMerge.merge(nDevicesIntervalDataRBMerge, how='outer',
                                                                         on=("Timestamp", "MAC"), copy=False,
                                                                         suffixes=("_c", "_b"))
    nDevicesIntervalDataRABCDEMerge = nDevicesIntervalDataRBCDEMerge.merge(nDevicesIntervalDataRAMerge, how='outer',
                                                                           on=("Timestamp", "MAC"), copy=False)

    group = nDevicesIntervalDataRABCDEMerge.groupby(["Timestamp", "MAC"]).nunique()
    total_CE, total_DE, total_CDE, total_BE = 0, 0, 0, 0

    for j in range(len(group)):
        if group["Raspberry_c"][j] == 1 and group["Raspberry_d"][j] == 1 and group["Raspberry_e"][j] == 1:
            total_CDE = total_CDE + 1
        elif group["Raspberry_c"][j] == 1 and group["Raspberry_e"][j] == 1:
            total_CE = total_CE + 1
        elif group["Raspberry_d"][j] == 1 and group["Raspberry_e"][j] == 1:
            total_DE = total_DE + 1
        elif group["Raspberry_b"][j] == 1 and group["Raspberry_e"][j] == 1:
            total_BE = total_BE + 1

    totalMACRDE, totalMACRCE, totalMACRCDE, totalMACRBE = total_DE, total_CE, total_CDE, total_BE

    return totalMACRDE, totalMACRCE, totalMACRCDE, totalMACRBE


def getTotalDeviceByMessageNumber(data):
    """Función que devuelve tres listas por Raspberry, una por intervalo de número de mensajes por debajo
    de 10, entre 10 y 30 y superior a 30."""

    dataInterval1, dataInterval2, dataInterval3, dataInterval4, dataInterval5 = parseDataByRaspberry(data)

    dataInterval1 = dataInterval1.groupby(["Timestamp", "MAC"]).sum()
    dataInterval2 = dataInterval2.groupby(["Timestamp", "MAC"]).sum()
    dataInterval3 = dataInterval3.groupby(["Timestamp", "MAC"]).sum()
    dataInterval4 = dataInterval4.groupby(["Timestamp", "MAC"]).sum()
    dataInterval5 = dataInterval5.groupby(["Timestamp", "MAC"]).sum()

    totalMACRA_10 = len(dataInterval1.loc[dataInterval1["Nº Mensajes"] <= 10])
    totalMACRA_1030 = len(dataInterval1.loc[(dataInterval1["Nº Mensajes"] > 10) & (dataInterval1["Nº Mensajes"] <= 30)])
    totalMACRA_30 = len(dataInterval1.loc[dataInterval1["Nº Mensajes"] > 30])

    totalMACRB_10 = len(dataInterval2.loc[dataInterval2["Nº Mensajes"] <= 10])
    totalMACRB_1030 = len(dataInterval2.loc[(dataInterval2["Nº Mensajes"] > 10) & (dataInterval2["Nº Mensajes"] <= 30)])
    totalMACRB_30 = len(dataInterval2.loc[dataInterval2["Nº Mensajes"] > 30])

    totalMACRC_10 = len(dataInterval3.loc[dataInterval3["Nº Mensajes"] <= 10])
    totalMACRC_1030 = len(dataInterval3.loc[(dataInterval3["Nº Mensajes"] > 10) & (dataInterval3["Nº Mensajes"] <= 30)])
    totalMACRC_30 = len(dataInterval3.loc[dataInterval3["Nº Mensajes"] > 30])

    totalMACRD_10 = len(dataInterval4.loc[dataInterval4["Nº Mensajes"] <= 10])
    totalMACRD_1030 = len(dataInterval4.loc[(dataInterval4["Nº Mensajes"] > 10) & (dataInterval4["Nº Mensajes"] <= 30)])
    totalMACRD_30 = len(dataInterval4.loc[dataInterval4["Nº Mensajes"] > 30])

    totalMACRE_10 = len(dataInterval5.loc[dataInterval5["Nº Mensajes"] <= 10])
    totalMACRE_1030 = len(dataInterval5.loc[(dataInterval5["Nº Mensajes"] > 10) & (dataInterval5["Nº Mensajes"] <= 30)])
    totalMACRE_30 = len(dataInterval5.loc[dataInterval5["Nº Mensajes"] > 30])

    return totalMACRA_10, totalMACRA_1030, totalMACRA_30, totalMACRB_10, totalMACRB_1030, totalMACRB_30, totalMACRC_10, \
           totalMACRC_1030, totalMACRC_30, totalMACRD_10, totalMACRD_1030, totalMACRD_30, totalMACRE_10, \
           totalMACRE_1030, totalMACRE_30


def getTotalDevicesInPreviousInterval(data, timeSeries):
    """Función que devuelve una lista con el número de dispositivos registrados en el intervalo de tiempo actual y el
    anterior."""

    if len(timeSeries) < 2:
        totalMACPreviousInterval = 0
    else:
        group = data.loc[data["Timestamp"] == timeSeries[-1]]
        groupToCheck = data.loc[data["Timestamp"] == timeSeries[-2]]
        group.reset_index(inplace=True)
        groupToCheck.reset_index(inplace=True)
        count = 0
        uniqueMAC = group["MAC"].unique()
        for mac in uniqueMAC:
            if len(groupToCheck.loc[groupToCheck["MAC"] == mac]) != 0:
                count = count + 1
        totalMACPreviousInterval = count

    return totalMACPreviousInterval


def getTotalDevicesInTwoPreviousIntervals(data, timeSeries):
    """Función que devuelve una lista con el número de dispositivos registrados en el intervalo de tiempo actual y los
    dos anteriores."""

    if len(timeSeries) < 3:
        totalMACTwoPreviousInterval = 0
    else:
        group = data.loc[data["Timestamp"] == timeSeries[-1]]
        groupToCheck = data.loc[data["Timestamp"] == timeSeries[-2]]
        groupToCheckPrevious = data.loc[data["Timestamp"] == timeSeries[-3]]
        group.reset_index(inplace=True)
        groupToCheck.reset_index(inplace=True)
        groupToCheckPrevious.reset_index(inplace=True)
        uniqueMAC = group["MAC"].unique()
        count = 0
        for mac in uniqueMAC:
            if len(groupToCheck.loc[groupToCheck["MAC"] == mac]) != 0 and \
                    len(groupToCheckPrevious.loc[groupToCheckPrevious["MAC"] == mac]) != 0:
                count = count + 1
        totalMACTwoPreviousInterval = count

    return totalMACTwoPreviousInterval


def getTrainingDataset(data, personCount, timeSeries):
    """Función que devuelve un conjunto de datos para el algoritmo de Machine Learning y un dataframe con los valores
    acumulados hasta ese momento"""

    columns = ["Timestamp", "Person Count", "Minutes", "N MAC TOTAL", "N MAC RA", "N MAC RB", "N MAC RC", "N MAC RD",
               "N MAC RE",
               "N MAC RDE", "N MAC RCE", "N MAC RCDE", "N MAC RBE", "N MAC MEN RA 10", "N MAC MEN RA 10-30",
               "N MAC MEN RA 30", "N MAC MEN RB 10", "N MAC MEN RB 10-30", "N MAC MEN RB 30", "N MAC MEN RC 10",
               "N MAC MEN RC 10-30", "N MAC MEN RC 30", "N MAC MEN RD 10", "N MAC MEN RD 10-30", "N MAC MEN RD 30",
               "N MAC MEN RE 10", "N MAC MEN RE 10-30", "N MAC MEN RE 30", "N MAC INTERVALO ANTERIOR",
               "N MAC DOS INTERVALOS ANTERIORES"]

    timeSeries = pd.to_datetime(timeSeries, dayfirst=True)
    #print(data)
    #print("---")
    dataNow = data.loc[data["Timestamp"] == timeSeries[-1]]
    #print(timeSeries[-1])
    #print(f"->{dataNow}")
    dataGroup = dataNow.groupby("Timestamp").nunique()

    totalMAC = dataGroup["MAC"][0]

    totalMACRA, totalMACRB, totalMACRC, totalMACRD, totalMACRE = getTotalDevicesByRaspberry(dataNow)

    totalMACRDE, totalMACRCE, totalMACRCDE, totalMACRBE = getTotalDevicesByPairRaspberries(dataNow)

    totalMACRA_10, totalMACRA_1030, totalMACRA_30, totalMACRB_10, totalMACRB_1030, totalMACRB_30, totalMACRC_10, \
    totalMACRC_1030, totalMACRC_30, totalMACRD_10, totalMACRD_1030, totalMACRD_30, totalMACRE_10, totalMACRE_1030, \
    totalMACRE_30 = getTotalDeviceByMessageNumber(dataNow)

    totalMACPreviousInterval = getTotalDevicesInPreviousInterval(data, timeSeries)

    totalMACTwoPreviousInterval = getTotalDevicesInTwoPreviousIntervals(data, timeSeries)

    timestamp = dataNow["Timestamp"].dt.strftime('%Y-%m-%d %H:%M:%S')
    data = [timestamp.values[0], personCount["personCount"][0], personCount["Minutes"].values[0], totalMAC, totalMACRA,
            totalMACRB,
            totalMACRC, totalMACRD, totalMACRE, totalMACRDE, totalMACRCE, totalMACRCDE, totalMACRBE, totalMACRA_10,
            totalMACRA_1030, totalMACRA_30, totalMACRB_10, totalMACRB_1030, totalMACRB_30, totalMACRC_10,
            totalMACRC_1030, totalMACRC_30, totalMACRD_10, totalMACRD_1030, totalMACRD_30, totalMACRE_10,
            totalMACRE_1030, totalMACRE_30, totalMACPreviousInterval, totalMACTwoPreviousInterval]

    trainingSet = pd.DataFrame([data], columns=columns)

    return trainingSet


def getTrainingSetFormat(trainingSet, columns=None):
    """Función que devuelve un Dataframe con las columnas incluidas en el argumento columns que serán las que reciba el
    estimador finalmente. También devuelve el histórico de los anteriores resultados."""

    if columns is None:
        columns = ["N MAC RA", "N MAC RB", "N MAC RC", "N MAC RD", "N MAC RE", "N MAC RDE", "N MAC RCE", "N MAC RCDE",
                   "N MAC RBE", "N MAC MEN RA 10", "N MAC MEN RB 10", "N MAC MEN RC 10", "N MAC MEN RD 10",
                   "N MAC MEN RE 10", "N MAC INTERVALO ANTERIOR", "N MAC DOS INTERVALOS ANTERIORES"]

    finalTrainingSet = pd.DataFrame(trainingSet[["Timestamp", "Person Count", "Minutes"]],
                                    columns=["Timestamp", "Person Count", "Minutes"])
    finalTrainingSet = pd.concat([finalTrainingSet, trainingSet[columns]], axis=1)

    finalTrainingSet["Timestamp"] = pd.to_datetime(finalTrainingSet["Timestamp"])

    return finalTrainingSet
