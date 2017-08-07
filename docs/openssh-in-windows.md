# OpenSSH in Windows

## Install

1. Download the latest build of [OpenSSH for Windows](https://github.com/PowerShell/Win32-OpenSSH/releases/latest/)
2. Extract contents of the latest build to `C:\Program Files\OpenSSH`
3. Start Windows PowerShell as Administrator
4. Navigate to the OpenSSH directory `C:\Program Files\OpenSSH`
5. Install sshd and ssh-agent services
```
powershell -ExecutionPolicy Bypass -File install-sshd.ps1
```
6. Open the firewall on TCP port 22 to allow inbound SSH connections
* If you're on a server machine
```
New-NetFirewallRule -Protocol TCP -LocalPort 22 -Direction Inbound -Action Allow -DisplayName SSH
```
* If you're on a client desktop machine (like Windows 10)
```
netsh advfirewall firewall add rule name=SSHPort dir=in action=allow protocol=TCP localport=22
```
7. Start ssh server
```
sshd
```

## Uninstall

1. Start Windows Powershell as Administrator
2. Navigate to the OpenSSH directory `C:\Program Files\OpenSSH`
3. Run the uninstall script
```
powershell -ExecutionPolicy Bypass -File uninstall-sshd.ps1
```

## More infomation
* https://github.com/PowerShell/Win32-OpenSSH/wiki/Install-Win32-OpenSSH
