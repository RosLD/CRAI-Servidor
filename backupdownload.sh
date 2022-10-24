echo "Creating folder"

if [ -d sqlite_databases ]; then
    echo "Folder already created"
else
    mkdir sqlite_databases
fi

fecha=$1 #Me la tiene que dar javascript

echo "Im the sync that node lacks"
cd sqlite_databases
mkdir $fecha
cd $fecha
mkdir Raspberry1
mkdir Raspberry2
mkdir Raspberry3
mkdir Raspberry5
mkdir Raspberry7
mkdir Raspberry8
cd ../..


echo "Getting DB from Raspberry 1"
sshpass -f kalipass scp kali@10.147.18.203:~/Sniffer_Wifi/${fecha}_DatosBLE_Raspberry1.db sqlite_databases/${fecha}/Raspberry1/.
sshpass -f kalipass scp kali@10.147.18.203:~/Sniffer_Wifi/${fecha}_Sniffer-Wific1_Raspberry1.db sqlite_databases/${fecha}/Raspberry1/.
sshpass -f kalipass scp kali@10.147.18.203:~/Sniffer_Wifi/${fecha}_Sniffer-Wific6_Raspberry1.db sqlite_databases/${fecha}/Raspberry1/.
sshpass -f kalipass scp kali@10.147.18.203:~/Sniffer_Wifi/${fecha}_Sniffer-Wific11_Raspberry1.db sqlite_databases/${fecha}/Raspberry1/.
echo "Getting DB from Raspberry 2"
sshpass -f kalipass scp kali@10.147.18.29:~/Sniffer_Wifi/${fecha}_DatosBLE_Raspberry2.db sqlite_databases/${fecha}/Raspberry2/.
sshpass -f kalipass scp kali@10.147.18.29:~/Sniffer_Wifi/${fecha}_Sniffer-Wific1_Raspberry2.db sqlite_databases/${fecha}/Raspberry2/.
sshpass -f kalipass scp kali@10.147.18.29:~/Sniffer_Wifi/${fecha}_Sniffer-Wific6_Raspberry2.db sqlite_databases/${fecha}/Raspberry2/.
sshpass -f kalipass scp kali@10.147.18.29:~/Sniffer_Wifi/${fecha}_Sniffer-Wific11_Raspberry2.db sqlite_databases/${fecha}/Raspberry2/.
echo "Getting DB from Raspberry 3"
sshpass -f kalipass scp kali@10.147.18.30:~/Sniffer_Wifi/${fecha}_DatosBLE_Raspberry3.db sqlite_databases/${fecha}/Raspberry3/.
sshpass -f kalipass scp kali@10.147.18.30:~/Sniffer_Wifi/${fecha}_Sniffer-Wific1_Raspberry3.db sqlite_databases/${fecha}/Raspberry3/.
sshpass -f kalipass scp kali@10.147.18.30:~/Sniffer_Wifi/${fecha}_Sniffer-Wific6_Raspberry3.db sqlite_databases/${fecha}/Raspberry3/.
sshpass -f kalipass scp kali@10.147.18.30:~/Sniffer_Wifi/${fecha}_Sniffer-Wific11_Raspberry3.db sqlite_databases/${fecha}/Raspberry3/.
echo "Getting DB from Raspberry 5"
sshpass -f kalipass scp kali@10.147.18.112:~/Sniffer_Wifi/${fecha}_DatosBLE_Raspberry5.db sqlite_databases/${fecha}/Raspberry5/.
sshpass -f kalipass scp kali@10.147.18.112:~/Sniffer_Wifi/${fecha}_Sniffer-Wific1_Raspberry5.db sqlite_databases/${fecha}/Raspberry5/.
sshpass -f kalipass scp kali@10.147.18.112:~/Sniffer_Wifi/${fecha}_Sniffer-Wific6_Raspberry5.db sqlite_databases/${fecha}/Raspberry5/.
sshpass -f kalipass scp kali@10.147.18.112:~/Sniffer_Wifi/${fecha}_Sniffer-Wific11_Raspberry5.db sqlite_databases/${fecha}/Raspberry5/.
echo "Getting DB from Raspberry 7"
sshpass -f kalipass scp kali@10.147.18.236:~/Sniffer_Wifi/${fecha}_DatosBLE_Raspberry7.db sqlite_databases/${fecha}/Raspberry7/.
sshpass -f kalipass scp kali@10.147.18.236:~/Sniffer_Wifi/${fecha}_Sniffer-Wific1_Raspberry7.db sqlite_databases/${fecha}/Raspberry7/.
sshpass -f kalipass scp kali@10.147.18.236:~/Sniffer_Wifi/${fecha}_Sniffer-Wific6_Raspberry7.db sqlite_databases/${fecha}/Raspberry7/.
sshpass -f kalipass scp kali@10.147.18.236:~/Sniffer_Wifi/${fecha}_Sniffer-Wific11_Raspberry7.db sqlite_databases/${fecha}/Raspberry7/.
echo "Getting DB from Raspberry 8"
sshpass -f kalipass scp kali@10.147.18.240:~/UPCT_TerabeePC/${fecha}_PersonCount.db sqlite_databases/${fecha}/Raspberry8/.


echo "Backups complete now start with server csvs"

node csvexport_offline.js $fecha