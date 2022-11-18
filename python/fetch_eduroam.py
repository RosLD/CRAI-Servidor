from pysnmp import hlapi
from pysnmp.entity.rfc3413.oneliner import cmdgen
import time
import pandas as pd


#### Funciones SNMP para manejar las consultas al servidor
def construct_object_types(list_of_oids):
    object_types = []
    for oid in list_of_oids:
        object_types.append(hlapi.ObjectType(hlapi.ObjectIdentity(oid)))
    return object_types


def cast(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        try:
            return float(value)
        except (ValueError, TypeError):
            try:
                return str(value)
            except (ValueError, TypeError):
                pass
    return value


def fetch(handler, count):
    result = []
    for i in range(count):
        try:
            error_indication, error_status, error_index, var_binds = next(handler)
            if not error_indication and not error_status:
                items = {}
                for var_bind in var_binds:
                    items[str(var_bind[0])] = cast(var_bind[1])

                result.append(items)
            else:
                raise RuntimeError('Got SNMP error: {0}'.format(error_indication))
        except StopIteration:
            break
    return result


def get(target, oids, credentials, port=161, engine=hlapi.SnmpEngine(), context=hlapi.ContextData()):
    handler = hlapi.getCmd(
        engine,
        credentials,
        hlapi.UdpTransportTarget((target, port)),
        context,
        *construct_object_types(oids)
    )
    return fetch(handler, 1)[0]


def get_bulk(target, oids, credentials, count, start_from=0, port=161,
             engine=hlapi.SnmpEngine(), context=hlapi.ContextData()):
    handler = hlapi.bulkCmd(
        engine,
        credentials,
        hlapi.UdpTransportTarget((target, port)),
        context,
        start_from, count,
        *construct_object_types(oids)
    )
    return fetch(handler, count)


def get_bulk_auto(target, oids, credentials, count_oid, start_from=0, port=161,
                  engine=hlapi.SnmpEngine(), context=hlapi.ContextData()):
    count = get(target, [count_oid], credentials, port, engine, context)[count_oid]

    return get_bulk(target, oids, credentials, count, start_from, port, engine, context)


#########


#######Funcion para crear el csv apartir de las peticiones SNMP.


def crearcsv():
    hora = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
    # Peticiones snmp de mac e ip con otro metodo
    ip = "192.168.89.1"
    community = "proyecto"

    generator = cmdgen.CommandGenerator()
    comm_data = cmdgen.CommunityData("server", community, 1)  # 1 means version SNMP v2c
    transport = cmdgen.UdpTransportTarget((ip, 161))

    real_fun = getattr(generator, "nextCmd")
    # IP usuario
    oidipusr = (1, 3, 6, 1, 4, 1, 14823, 2, 3, 3, 1, 2, 4, 1, 3)
    IPusr = (errorIndication, errorStatus, errorIndex, varBinds) = real_fun(comm_data, transport, oidipusr)
    if not errorIndication is None or errorStatus is True:
        print("Error: %s %s %s %s" % IPusr)
    else:
        c = int(1)
        n = len(varBinds) + 1
        IPuser = [None] * n
        IPuser[0] = 0

        for var_bind in varBinds:
            IPuser[c] = [x.prettyPrint() for x in var_bind]
            c = c + 1
    ##MACC
    oidmacuser = (1, 3, 6, 1, 4, 1, 14823, 2, 3, 3, 1, 2, 4, 1, 1)
    MAC = (errorIndication, errorStatus, errorIndex, varBinds) = real_fun(comm_data, transport, oidmacuser)

    if not errorIndication is None or errorStatus is True:
        print("Error: %s %s %s %s" % MAC)
    else:
        c = int(1)
        n = len(varBinds) + 1
        MACUSR = [None] * n
        MACUSR[0] = 0

        for var_bind in varBinds:
            MACUSR[c] = [x.prettyPrint() for x in var_bind]
            c = c + 1
    ##MACWLAN
    oidmacWLAN = (1, 3, 6, 1, 4, 1, 14823, 2, 3, 3, 1, 2, 4, 1, 2)
    MACWLAN = (errorIndication, errorStatus, errorIndex, varBinds) = real_fun(comm_data, transport, oidmacWLAN)

    if not errorIndication is None or errorStatus is True:
        print("Error: %s %s %s %s" % MACWLAN)
    else:
        c = int(1)
        n = len(varBinds) + 1
        MACW = [None] * n
        MACW[0] = 0

        for var_bind in varBinds:
            MACW[c] = [x.prettyPrint() for x in var_bind]
            c = c + 1

    # IP Punto de acceso AP
    oidipap = (1, 3, 6, 1, 4, 1, 14823, 2, 3, 3, 1, 2, 4, 1, 4)
    IPap = (errorIndication, errorStatus, errorIndex, varBinds) = real_fun(comm_data, transport, oidipap)
    if not errorIndication is None or errorStatus is True:
        print("Error: %s %s %s %s" % IPap)
    else:
        c = int(1)
        n = len(varBinds) + 1
        IPAP = [None] * n
        IPAP[0] = 0

        for var_bind in varBinds:
            IPAP[c] = [x.prettyPrint() for x in var_bind]
            c = c + 1

    # Hacemos la peticion SNMP al Servidor de todos los parametros que queremos
    nentradas = len(IPuser)
    Name = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.5'], hlapi.CommunityData('proyecto'), nentradas)
    SO = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.6'], hlapi.CommunityData('proyecto'), nentradas)
    ruido = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.7'], hlapi.CommunityData('proyecto'), nentradas)
    TXDataFr = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.8'], hlapi.CommunityData('proyecto'),
                        nentradas)
    TXDataBy = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.9'], hlapi.CommunityData('proyecto'),
                        nentradas)
    TXRetries = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.10'], hlapi.CommunityData('proyecto'),
                         nentradas)
    TXRate = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.11'], hlapi.CommunityData('proyecto'),
                      nentradas)
    RXDataFr = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.12'], hlapi.CommunityData('proyecto'),
                        nentradas)
    RXDataBy = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.13'], hlapi.CommunityData('proyecto'),
                        nentradas)
    RXRetries = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.14'], hlapi.CommunityData('proyecto'),
                         nentradas)
    RXRate = get_bulk('192.168.89.1', ['1.3.6.1.4.1.14823.2.3.3.1.2.4.1.15'], hlapi.CommunityData('proyecto'),
                      nentradas)

    # hora
    c = int(1)
    n = int(nentradas + 1)
    timestamp = [None] * n
    timestamp[0] = 0
    while c < n:
        timestamp[c] = hora
        c = c + 1
    # print(timestamp)

    # Nombre del usuario
    c = int(1)
    n = int(nentradas + 1)
    nombre = [None] * n
    nombre[0] = 0

    for it in Name:
        for k, v in it.items():
            nombre[c] = "{1}".format(k, v)
        c = c + 1

    # print(Name)

    # SO
    c = int(1)
    n = int(nentradas + 1)
    sistema = [None] * n
    sistema[0] = 0

    for it in SO:
        for k, v in it.items():
            sistema[c] = "{1}".format(k, v)
        c = c + 1
    # print(sistema)
    # SeñalRuido
    c = int(1)
    n = int(nentradas + 1)
    snr = [None] * n
    snr[0] = 0

    for it in ruido:
        for k, v in it.items():
            snr[c] = "{1}".format(k, v)
        c = c + 1
    # print(snr)
    # TXDataFrames
    c = int(1)
    n = int(nentradas + 1)
    TXframes = [None] * n
    TXframes[0] = 0

    for it in TXDataFr:
        for k, v in it.items():
            TXframes[c] = "{1}".format(k, v)
        c = c + 1
    # print(TXframes)
    # TXDataBytes
    c = int(1)
    n = int(nentradas + 1)
    TXBytes = [None] * n
    TXBytes[0] = 0

    for it in TXDataBy:
        for k, v in it.items():
            TXBytes[c] = "{1}".format(k, v)
        c = c + 1
    # print(TXBytes)
    # TXRetries
    c = int(1)
    n = int(nentradas + 1)
    TRetries = [None] * n
    TRetries[0] = 0

    for it in TXRetries:
        for k, v in it.items():
            TRetries[c] = "{1}".format(k, v)
        c = c + 1
    # print(TRetries)
    # TXRate
    c = int(1)
    n = int(nentradas + 1)
    TRate = [None] * n
    TRate[0] = 0

    for it in TXRate:
        for k, v in it.items():
            TRate[c] = "{1}".format(k, v)
        c = c + 1
    # print(TRate)
    # RXDataFrames
    c = int(1)
    n = int(nentradas + 1)
    RXframes = [None] * n
    RXframes[0] = 0

    for it in RXDataFr:
        for k, v in it.items():
            RXframes[c] = "{1}".format(k, v)
        c = c + 1
    # print(RXframes)
    # RXDataBytes
    c = int(1)
    n = int(nentradas + 1)
    RXBytes = [None] * n
    RXBytes[0] = 0

    for it in RXDataBy:
        for k, v in it.items():
            RXBytes[c] = "{1}".format(k, v)
        c = c + 1
    # print(RXBytes)
    # RXRetries
    c = int(1)
    n = int(nentradas + 1)
    RRetries = [None] * n
    RRetries[0] = 0

    for it in RXRetries:
        for k, v in it.items():
            RRetries[c] = "{1}".format(k, v)
        c = c + 1
    # print(RRetries)
    # RXRate
    c = int(1)
    n = int(nentradas + 1)
    RRate = [None] * n
    RRate[0] = 0

    for it in RXRate:
        for k, v in it.items():
            RRate[c] = "{1}".format(k, v)
        c = c + 1
    # print(RRate)
    # Generamos el Dataframe con cada una de las peticiones que hemos realizado al servidor
    file_name = "CRAI-Servidor/csv/eduroam/raw/Eduroam_" + time.strftime('%d%m%Y', time.localtime()) + ".csv"  # Nombre del archivo
    data = [timestamp, MACUSR, MACW, IPuser, IPAP, nombre, sistema, snr, TXframes, TXBytes, TRetries, TRate, RXframes,
            RXBytes, RRetries, RRate]

    df = pd.DataFrame(data,
                      index=['timestamp', 'MAC', 'MACWLAN', 'IP', 'IPAP', 'Nombre', 'sistema operativo', 'relacion SN',
                             'TXDataFr', 'TXDataBy',
                             'TXRetries', 'TXRate', 'RXDataFr', 'RXDataBy', 'RXRetries', 'RXRate'])
    df = df.transpose()
    df.columns = {'timestamp', 'MAC', 'MACWLAN', 'IP', 'IPAP', 'Nombre', 'sistema operativo', 'relacion SN', 'TXDataFr',
                  'TXDataBy',
                  'TXRetries', 'TXRate', 'RXDataFr', 'RXDataBy', 'RXRetries', 'RXRate'}
    with open(file_name, 'a') as f:
        df.to_csv(f, mode='a', header=False)

    # df = pd.read_csv('06122021.csv')
    # print(df)
    print(1)


# while True:
#    try:
#        crearcsv()
#        print('recolectando datos del servidor: Espere 3 min ')
#        time.sleep(180)  # 3 min
#    except:
#            crearcsv()

try:
    crearcsv()
    print('recolectando datos del servidor: Espere 3 min ')

except:
    crearcsv()
