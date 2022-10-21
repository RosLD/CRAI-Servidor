
echo "Creating folder"

mkdir sqlite_databases

echo "Getting DB from Raspberry 1"
sshpass -f kalipass scp kali@10.147.18.203:~/Sniffer_Wifi/databases/today/* sqlite_databases/.
echo "Getting DB from Raspberry 2"
sshpass -f kalipass scp kali@10.147.18.29:~/Sniffer_Wifi/databases/today/* sqlite_databases/.
echo "Getting DB from Raspberry 3"
sshpass -f kalipass scp kali@10.147.18.30:~/Sniffer_Wifi/databases/today/* sqlite_databases/.
echo "Getting DB from Raspberry 5"
sshpass -f kalipass scp kali@10.147.18.112:~/Sniffer_Wifi/databases/today/* sqlite_databases/.
echo "Getting DB from Raspberry 7"
sshpass -f kalipass scp kali@10.147.18.236:~/Sniffer_Wifi/databases/today/* sqlite_databases/.
echo "Getting DB from Raspberry 8"
sshpass -f kalipass scp kali@10.147.18.240:~/UPCT_TerabeePC/databases/today/* sqlite_databases/.